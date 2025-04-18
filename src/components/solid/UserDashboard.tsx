import { createSignal, Show, createEffect } from 'solid-js';
import { useAuth } from '@stores/authStore';
import Button from './Button';

const UserDashboard = () => {
    const { user, isAuthenticated, logout } = useAuth();
    const [greeting, setGreeting] = createSignal<string>('');

    // Este efecto solo se ejecutará en el lado del cliente
    createEffect(() => {
        if (isAuthenticated() && user()) {
            setGreeting(`¡Hola, ${user()?.name}!`);
        } else {
            setGreeting('Por favor, inicia sesión para ver tu panel.');
        }
    });

    const handleLogout = async () => {
        if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
            await logout();
            window.location.href = '/';
        }
    };

    return (
        <div class="p-4 bg-white shadow rounded-lg">
            <h2 class="text-2xl font-bold mb-4">{greeting()}</h2>

            <Show when={isAuthenticated()}>
                <div class="space-y-4">
                    <p>Tu rol: <span class="font-medium">{user()?.role}</span></p>
                    <p>Email: <span class="font-medium">{user()?.email}</span></p>

                    <Button
                        variant="danger"
                        onClick={handleLogout}
                        leftIcon="fa-sign-out-alt"
                    >
                        Cerrar sesión
                    </Button>
                </div>
            </Show>

            <Show when={!isAuthenticated()}>
                <Button
                    variant="primary"
                    onClick={() => window.openLoginModal?.()}
                    leftIcon="fa-sign-in-alt"
                >
                    Iniciar sesión
                </Button>
            </Show>
        </div>
    );
};

export default UserDashboard;