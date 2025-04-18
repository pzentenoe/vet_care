import { createSignal, Show } from 'solid-js';
import { useAuth } from '@stores/authStore';
import { useForm, required, email } from '@hooks/useForm';

const LoginForm = () => {
    const { login } = useAuth();
    const [errorMessage, setErrorMessage] = createSignal<string | null>(null);

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

    const handleLogin = async () => {
        setErrorMessage(null);

        try {
            const result = await login(values.email, values.password);

            if (result.success) {
                setTimeout(() => {
                    const { user } = useAuth();
                    const currentUser = user();
                    if (currentUser?.role === 'admin' || currentUser?.role === 'vet') {
                        window.location.href = '/fichas-clinicas';
                    } else {
                        window.location.href = '/perfil';
                    }
                }, 0);
            } else {
                setErrorMessage(result.error || 'Error en el inicio de sesión');
            }
        } catch (error) {
            setErrorMessage('Error al conectar con el servicio');
        }
    };

    return (
        <div class="login-form">
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
                    ¿No tienes una cuenta? <a href="/registro" class="font-medium text-blue-600 hover:text-blue-500">Regístrate</a>
                </p>
            </div>
        </div>
    );
};

export default LoginForm;
