import { createSignal, createEffect, onMount, Show, type JSX } from 'solid-js';
import { useAuth } from '@stores/authStore';
import Button from './Button';

interface AuthGuardProps {
    children: JSX.Element;
}

const AuthGuard = (props: AuthGuardProps) => {
    const { isAuthenticated } = useAuth();
    const [isLoading, setIsLoading] = createSignal(true);

    // Simulamos un pequeño retraso para comprobar la autenticación
    onMount(() => {
        setTimeout(() => {
            setIsLoading(false);
        }, 500);
    });

    // Manejar clic en botón de login
    const handleLoginClick = () => {
        if (typeof window !== 'undefined' && window.openLoginModal) {
            window.openLoginModal();
        } else {
            // Fallback si la función no está disponible
            window.location.href = '/';
        }
    };

    return (
        <>
            {/* Pantalla de carga */}
            <Show when={isLoading()}>
                <div class="flex items-center justify-center min-h-screen">
                    <div class="text-center">
                        <div class="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mb-4"></div>
                        <p class="text-gray-600">Cargando...</p>
                    </div>
                </div>
            </Show>

            {/* Contenido autenticado */}
            <Show when={!isLoading() && isAuthenticated()}>
                {props.children}
            </Show>

            {/* Pantalla de no autorizado */}
            <Show when={!isLoading() && !isAuthenticated()}>
                <div class="min-h-screen flex flex-col items-center justify-center p-4">
                    <div class="text-center max-w-md">
                        <i class="fas fa-lock text-5xl text-gray-400 mb-4"></i>
                        <h1 class="text-2xl font-bold text-gray-800 mb-2">Acceso restringido</h1>
                        <p class="text-gray-600 mb-6">Necesitas iniciar sesión para acceder a esta página.</p>
                        <Button
                            variant="primary"
                            size="lg"
                            onClick={handleLoginClick}
                            leftIcon="fa-sign-in-alt"
                        >
                            Iniciar sesión
                        </Button>
                    </div>
                </div>
            </Show>
        </>
    );
};

export default AuthGuard;