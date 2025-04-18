import { createSignal, Show, onMount } from 'solid-js';
import { useAuth } from '@stores/authStore';
import { useForm, required, email } from '@hooks/useForm';

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const LoginModal = (props: LoginModalProps) => {
    const { login } = useAuth();
    const [isOpen, setIsOpen] = createSignal(props.isOpen);
    const [errorMessage, setErrorMessage] = createSignal<string | null>(null);

    // Definir formulario con validadores
    const { values, errors, isValid, isSubmitting, handleChange, handleSubmit, resetForm } = useForm({
        email: {
            value: '',
            validators: [required('El correo electrónico es obligatorio'), email('Correo electrónico no válido')]
        },
        password: {
            value: '',
            validators: [required('La contraseña es obligatoria')]
        },
        rememberMe: {
            value: false
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
        if ((e.target as HTMLElement).classList.contains('login-modal-overlay')) {
            handleClose();
        }
    };

    // Procesar envío del formulario
    const handleLogin = async () => {
        setErrorMessage(null);

        try {
            const result = await login(values.email, values.password);

            if (result.success) {
                handleClose();
                // Redirigir según el rol
                const { user } = useAuth();
                const currentUser = user();
                if (currentUser?.role === 'admin' || currentUser?.role === 'vet') {
                    window.location.href = '/fichas-clinicas';
                } else {
                    window.location.href = '/perfil';
                }
            } else {
                setErrorMessage(result.error || 'Error en el inicio de sesión');
            }
        } catch (error) {
            setErrorMessage('Error al conectar con el servicio');
        }
    };

    // Escuchar el evento personalizado para abrir el modal
    onMount(() => {
        const modalContainer = document.querySelector('[data-login-modal]');

        // Escuchar evento de apertura desde otros componentes
        modalContainer?.addEventListener('open-login-modal', () => {
            setIsOpen(true);
        });

        // Establecer método global para abrir el modal
        if (typeof window !== 'undefined') {
            window.openLoginModal = () => {
                setIsOpen(true);
            };
        }
    });

    return (
        <Show when={isOpen()}>
            <div
                class="login-modal-overlay fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50"
                onClick={handleOverlayClick}
            >
                <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-2xl font-bold text-gray-800">Iniciar Sesión</h3>
                        <button onClick={handleClose} class="text-gray-500 hover:text-gray-700">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>

                    <form onSubmit={(e) => {
                        e.preventDefault();
                        handleSubmit(handleLogin);
                    }} class="space-y-4">
                        <Show when={errorMessage()}>
                            <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                                <span>{errorMessage()}</span>
                            </div>
                        </Show>

                        <div>
                            <label for="email" class="block text-sm font-medium text-gray-700">Correo electrónico</label>
                            <input
                                type="email"
                                id="email"
                                value={values.email}
                                onInput={(e) => handleChange('email', e.currentTarget.value)}
                                class={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${errors.email ? 'border-red-300' : 'border-gray-300'}`}
                            />
                            <Show when={errors.email}>
                                <p class="mt-1 text-sm text-red-600">{errors.email}</p>
                            </Show>
                        </div>

                        <div>
                            <label for="password" class="block text-sm font-medium text-gray-700">Contraseña</label>
                            <input
                                type="password"
                                id="password"
                                value={values.password}
                                onInput={(e) => handleChange('password', e.currentTarget.value)}
                                class={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${errors.password ? 'border-red-300' : 'border-gray-300'}`}
                            />
                            <Show when={errors.password}>
                                <p class="mt-1 text-sm text-red-600">{errors.password}</p>
                            </Show>
                        </div>

                        <div class="flex items-center justify-between">
                            <div class="flex items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    checked={values.rememberMe}
                                    onChange={(e) => handleChange('rememberMe', e.currentTarget.checked)}
                                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label for="remember-me" class="ml-2 block text-sm text-gray-700">
                                    Recordarme
                                </label>
                            </div>
                            <div class="text-sm">
                                <a href="#" class="font-medium text-blue-600 hover:text-blue-500">
                                    ¿Olvidaste tu contraseña?
                                </a>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting()}
                            class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                            {isSubmitting() ? (
                                <>
                                    <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Iniciando...
                                </>
                            ) : (
                                'Iniciar Sesión'
                            )}
                        </button>
                    </form>

                    <div class="mt-4 text-center text-sm">
                        <p class="text-gray-600">
                            ¿No tienes una cuenta? <a href="#" class="font-medium text-blue-600 hover:text-blue-500">Regístrate</a>
                        </p>
                    </div>
                </div>
            </div>
        </Show>
    );
};

// Declaración para TypeScript
declare global {
    interface Window {
        openLoginModal: () => void;
    }
}

export default LoginModal;