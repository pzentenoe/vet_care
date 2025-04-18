import { createSignal, createEffect } from 'solid-js';
import { createStore } from 'solid-js/store';

type ValidationRule<T> = (value: T) => string | null;

interface FieldConfig<T> {
    value: T;
    validators?: ValidationRule<T>[];
}

export function useForm<T extends Record<string, any>>(initialValues: { [K in keyof T]: FieldConfig<T[K]> }) {
    // Preparar valores iniciales y errores iniciales
    const initialData = {} as T;
    const initialErrors = {} as Record<keyof T, string | null>;

    for (const key in initialValues) {
        initialData[key as keyof T] = initialValues[key].value;
        initialErrors[key as keyof T] = null;
    }

    // Crear estado reactivo
    const [values, setValues] = createStore<T>(initialData);
    const [errors, setErrors] = createStore<Record<keyof T, string | null>>(initialErrors);
    const [isSubmitting, setIsSubmitting] = createSignal(false);
    const [isValid, setIsValid] = createSignal(true);

    // Función para validar un campo
    const validateField = (name: keyof T, value: any) => {
        const fieldConfig = initialValues[name];
        if (!fieldConfig.validators) return null;

        for (const validator of fieldConfig.validators) {
            const error = validator(value);
            if (error) return error;
        }

        return null;
    };

    // Función para validar todo el formulario
    const validateForm = () => {
        let isFormValid = true;
        const newErrors = { ...errors };

        for (const key in values) {
            const error = validateField(key as keyof T, values[key as keyof T]);
            newErrors[key as keyof T] = error;
            if (error) isFormValid = false;
        }

        setErrors(newErrors);
        setIsValid(isFormValid);
        return isFormValid;
    };

    // Manejador de cambios
    const handleChange = (name: keyof T, value: any) => {
        setValues({ ...values, [name]: value });
        const error = validateField(name, value);
        setErrors({ ...errors, [name]: error });

        // Validar todo el formulario para actualizar isValid
        validateForm();
    };

    // Manejador de envío
    const handleSubmit = async (submitFn: (values: T) => Promise<void>) => {
        setIsSubmitting(true);

        const isFormValid = validateForm();
        if (isFormValid) {
            try {
                await submitFn(values);
            } catch (error) {
                console.error('Error al enviar el formulario:', error);
            }
        }

        setIsSubmitting(false);
    };

    // Reset del formulario
    const resetForm = () => {
        setValues(initialData);
        setErrors(initialErrors);
        setIsValid(true);
    };

    return {
        values,
        errors,
        isValid,
        isSubmitting,
        handleChange,
        handleSubmit,
        resetForm,
        validateForm
    };
}

// Validators comunes
export const required = (message = 'Este campo es obligatorio') =>
    (value: any) => {
        if (value === undefined || value === null || value === '') {
            return message;
        }
        return null;
    };

export const email = (message = 'Correo electrónico inválido') =>
    (value: string) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value || regex.test(value)) {
            return null;
        }
        return message;
    };

export const minLength = (min: number, message = `Debe tener al menos ${min} caracteres`) =>
    (value: string) => {
        if (!value || value.length >= min) {
            return null;
        }
        return message;
    };

export const maxLength = (max: number, message = `Debe tener como máximo ${max} caracteres`) =>
    (value: string) => {
        if (!value || value.length <= max) {
            return null;
        }
        return message;
    };