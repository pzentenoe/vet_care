import { createSignal, Show, onMount, createEffect } from 'solid-js';
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
    const { user, updateUserData } = useAuth();
    const userService = new UserService();
    const [isOpen, setIsOpen] = createSignal(props.isOpen);
    const [errorMessage, setErrorMessage] = createSignal<string | null>(null);
    const [successMessage, setSuccessMessage] = createSignal<string | null>(null);

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

    // Actualizar el formulario cuando cambie el usuario
    createEffect(() => {
        const currentUser = user();
        if (currentUser) {
            handleChange('name', currentUser.name || '');
            handleChange('email', currentUser.email || '');
            handleChange('phone', currentUser.phone || '');
        }
    });

    // Cerrar modal y resetear formulario
    const handleClose = () => {
        resetForm();
        setErrorMessage(null);
        setSuccessMessage(null);
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
            handleChange('name', currentUser.name || '');
            handleChange('email', currentUser.email || '');
            handleChange('phone', currentUser.phone || '');
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
        if (typeof window !== 'undefined') {
            window.openEditProfileForm = () => {
                setIsOpen(true);
                // Actualizar formulario con datos actuales
                populateForm();
            };
        }
    });

    // Procesar envío del formulario
    const handleUpdateProfile = async () => {
        setErrorMessage(null);
        setSuccessMessage(null);

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
            
            // Actualizar el estado global del usuario
            if (updatedUser) {
                updateUserData(updatedUser);
                setSuccessMessage('Perfil actualizado correctamente');
                
                // Cerrar después de un breve retraso para mostrar el mensaje de éxito
                setTimeout(() => {
                    handleClose();
                    if (props.onSuccess) {
                        props.onSuccess();
                    }
                }, 1500);
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
                role="dialog"
                aria-modal="true"
                aria-labelledby="profile-form-title"
            >
                <div 
                    class="bg-white rounded-lg shadow-xl p-6 w-full max-w-md"
                    role="document"
                >
                    <div class="flex justify-between items-center mb-4">
                        <h3 id="profile-form-title" class="text-2xl font-bold text-gray-800">Editar perfil</h3>
                        <button 
                            onClick={handleClose} 
                            class="text-gray-500 hover:text-gray-700"
                            aria-label="Cerrar formulario"
                        >
                            <i class="fas fa-times" aria-hidden="true"></i>
                        </button>
                    </div>

                    <Show when={errorMessage()}>
                        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert" aria-live="assertive">
                            <span>{errorMessage()}</span>
                        </div>
                    </Show>

                    <Show when={successMessage()}>
                        <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="status" aria-live="polite">
                            <span>{successMessage()}</span>
                        </div>
                    </Show>

                    <form 
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleSubmit(handleUpdateProfile);
                        }} 
                        class="space-y-4"
                        aria-label="Formulario de edición de perfil"
                    >
                        <Input
                            label="Nombre completo"
                            type="text"
                            id="edit-name"
                            value={values.name}
                            onInput={(e) => handleChange('name', e.currentTarget.value)}
                            error={errors.name}
                            fullWidth
                            required
                        />

                        <Input
                            label="Correo electrónico"
                            type="email"
                            id="edit-email"
                            value={values.email}
                            onInput={(e) => handleChange('email', e.currentTarget.value)}
                            error={errors.email}
                            fullWidth
                            required
                        />

                        <Input
                            label="Teléfono"
                            type="tel"
                            id="edit-phone"
                            value={values.phone}
                            onInput={(e) => handleChange('phone', e.currentTarget.value)}
                            error={errors.phone}
                            fullWidth
                            required
                        />

                        <Input
                            label="Nueva contraseña (dejar en blanco para no cambiar)"
                            type="password"
                            id="edit-password"
                            value={values.password}
                            onInput={(e) => handleChange('password', e.currentTarget.value)}
                            error={errors.password}
                            fullWidth
                            autocomplete="new-password"
                        />

                        <Input
                            label="Confirmar nueva contraseña"
                            type="password"
                            id="edit-confirm-password"
                            value={values.confirmPassword}
                            onInput={(e) => handleChange('confirmPassword', e.currentTarget.value)}
                            error={errors.confirmPassword}
                            fullWidth
                            autocomplete="new-password"
                        />

                        <div class="flex justify-end space-x-3 mt-6">
                            <Button
                                variant="secondary"
                                onClick={handleClose}
                                type="button"
                                aria-label="Cancelar edición de perfil"
                            >
                                Cancelar
                            </Button>
                            <Button
                                variant="primary"
                                type="submit"
                                isLoading={isSubmitting()}
                                disabled={!isValid() || isSubmitting()}
                                aria-label="Guardar cambios del perfil"
                            >
                                Guardar cambios
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </Show>
    );
};

export default EditProfileForm;