import { createSignal, Show, onMount } from 'solid-js';
import { useAuth } from '@stores/authStore';
import { useForm, required, email } from '@hooks/useForm';
import { UserService } from '@services/api/UserServiceImpl';
import Button from './Button';
import Input from './Input';

interface EditProfileFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

const EditProfileForm = (props: EditProfileFormProps) => {
    const { user } = useAuth();
    const userService = new UserService();
    const [isOpen, setIsOpen] = createSignal(props.isOpen);
    const [errorMessage, setErrorMessage] = createSignal<string | null>(null);

    // Definir formulario con validadores
    const { values, errors, isValid, isSubmitting, handleChange, handleSubmit, resetForm, validateForm } = useForm({
        name: {
            value: user()?.name || '',
            validators: [required('El nombre es obligatorio')]
        },
        email: {
            value: user()?.email || '',
            validators: [required('El correo electrónico es obligatorio'), email()]
        },
        phone: {
            value: user()?.phone || '',
            validators: [required('El teléfono es obligatorio')]
        },
        password: {
            value: '',
            validators: []
        },
        confirmPassword: {
            value: '',
            validators: []
        }
    });

    // Cerrar modal y resetear formulario
    const handleClose = () => {
        resetForm();
        setErrorMessage(null);
        setIsOpen(false);
        props.onClose();
    };

    // Manejar clic fuera del modal
    const handleOverlayClick = (e: MouseEvent) => {
        if ((e.target as HTMLElement).classList.contains('modal-overlay')) {
            handleClose();
        }
    };

    // Poblar el formulario con los datos del usuario
    const populateForm = () => {
        const currentUser = user();
        if (currentUser) {
            handleChange('name', currentUser.name);
            handleChange('email', currentUser.email);
            handleChange('phone', currentUser.phone);
        }
    };

    // Escuchar el evento personalizado para abrir el formulario
    onMount(() => {
        const formContainer = document.querySelector('[data-profile-form]');

        // Escuchar evento de apertura desde otros componentes
        formContainer?.addEventListener('open-profile-form', () => {
            setIsOpen(true);
            // Actualizar formulario con datos actuales
            populateForm();
        });

        // Establecer método global para abrir el formulario
        window.openEditProfileForm = () => {
            setIsOpen(true);
            // Actualizar formulario con datos actuales
            populateForm();
        };
    });

    // Procesar envío del formulario
    const handleUpdateProfile = async () => {
        setErrorMessage(null);

        // Validar que las contraseñas coincidan si se está cambiando
        if (values.password && values.password !== values.confirmPassword) {
            setErrorMessage('Las contraseñas no coinciden');
            return;
        }

        const currentUser = user();
        if (!currentUser) {
            setErrorMessage('Error: No se pudo obtener la información del usuario');
            return;
        }

        try {
            // Preparar datos a actualizar
            const updateData = {
                name: values.name,
                email: values.email,
                phone: values.phone,
            };

            // Solo incluir contraseña si se proporcionó una nueva
            if (values.password) {
                Object.assign(updateData, { password: values.password });
            }

            // Actualizar el usuario
            const updatedUser = await userService.updateUser(currentUser.id, updateData);

            handleClose();
            if (props.onSuccess) {
                props.onSuccess();
            }
        } catch (error) {
            setErrorMessage('Error al actualizar el perfil');
        }
    };

    return (
        <Show when={isOpen()}>
            <div
                class="modal-overlay fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50"
                onClick={handleOverlayClick}
            >
                <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-2xl font-bold text-gray-800">Editar perfil</h3>
                        <button onClick={handleClose} class="text-gray-500 hover:text-gray-700">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>

                    <Show when={errorMessage()}>
                        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                            <span>{errorMessage()}</span>
                        </div>
                    </Show>

                    <form onSubmit={(e) => {
                        e.preventDefault();
                        handleSubmit(handleUpdateProfile);
                    }} class="space-y-4">
                        <Input
                            label="Nombre completo"
                            type="text"
                            id="edit-name"
                            value={values.name}
                            onInput={(e) => handleChange('name', e.currentTarget.value)}
                            error={errors.name}
                            fullWidth
                        />

                        <Input
                            label="Correo electrónico"
                            type="email"
                            id="edit-email"
                            value={values.email}
                            onInput={(e) => handleChange('email', e.currentTarget.value)}
                            error={errors.email}
                            fullWidth
                        />

                        <Input
                            label="Teléfono"
                            type="tel"
                            id="edit-phone"
                            value={values.phone}
                            onInput={(e) => handleChange('phone', e.currentTarget.value)}
                            error={errors.phone}
                            fullWidth
                        />

                        <Input
                            label="Nueva contraseña (dejar en blanco para no cambiar)"
                            type="password"
                            id="edit-password"
                            value={values.password}
                            onInput={(e) => handleChange('password', e.currentTarget.value)}
                            error={errors.password}
                            fullWidth
                        />

                        <Input
                            label="Confirmar nueva contraseña"
                            type="password"
                            id="edit-confirm-password"
                            value={values.confirmPassword}
                            onInput={(e) => handleChange('confirmPassword', e.currentTarget.value)}
                            error={errors.confirmPassword}
                            fullWidth
                        />

                        <Button
                            type="submit"
                            variant="primary"
                            fullWidth
                            isLoading={isSubmitting()}
                            leftIcon="fa-save"
                        >
                            Guardar cambios
                        </Button>
                    </form>
                </div>
            </div>
        </Show>
    );
};

export default EditProfileForm;