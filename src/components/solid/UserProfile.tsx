import { Show } from 'solid-js';
import { useAuth } from '@stores/authStore';
import Button from './Button';

interface UserProfileProps {
    onEditProfile?: () => void;
    onLogout?: () => void;
}

const UserProfile = (props: UserProfileProps) => {
    const { user, logout } = useAuth();

    // Traducir rol a español
    const translateRole = (role: string) => {
        switch (role) {
            case 'admin':
                return 'Administrador';
            case 'vet':
                return 'Veterinario';
            default:
                return 'Dueño de mascota';
        }
    };

    // Manejar clic en botón de editar perfil
    const handleEditProfileClick = () => {
        if (props.onEditProfile) {
            props.onEditProfile();
        } else if (typeof window !== 'undefined' && window.openEditProfileForm) {
            window.openEditProfileForm();
        }
    };

    // Manejar clic en botón de cerrar sesión
    const handleLogoutClick = async () => {
        if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
            if (props.onLogout) {
                props.onLogout();
            } else {
                await logout();
                window.location.href = '/';
            }
        }
    };

    return (
        <div class="flex flex-col items-center p-8 bg-blue-50 rounded-xl">
            <div class="w-32 h-32 rounded-full bg-blue-100 flex items-center justify-center mb-4 overflow-hidden">
                <i class="fas fa-user-circle text-6xl text-blue-400"></i>
            </div>

            <Show when={user()} fallback={<p class="text-gray-600">Cargando...</p>}>
                <h3 class="text-xl font-bold text-center text-gray-800">{user()?.name}</h3>
                <p class="text-blue-600 font-medium text-center">{translateRole(user()?.role || '')}</p>

                <div class="mt-6 w-full">
                    <h4 class="font-bold text-gray-700 mb-2">Información de contacto</h4>
                    <p class="text-gray-600">{user()?.email}</p>
                    <p class="text-gray-600">{user()?.phone}</p>
                </div>

                <div class="mt-6 w-full space-y-2">
                    <Button
                        variant="primary"
                        fullWidth
                        leftIcon="fa-user-edit"
                        onClick={handleEditProfileClick}
                    >
                        Editar perfil
                    </Button>

                    <Button
                        variant="danger"
                        fullWidth
                        leftIcon="fa-sign-out-alt"
                        onClick={handleLogoutClick}
                    >
                        Cerrar sesión
                    </Button>
                </div>
            </Show>
        </div>
    );
};

// Declaración para TypeScript
declare global {
    interface Window {
        openEditProfileForm?: () => void;
    }
}

export default UserProfile;