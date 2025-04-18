import { createSignal, Show } from 'solid-js';
import { useAuth } from '@stores/authStore';
import AdminRecordsTable from './AdminRecordsTable';
import VetPatientsGrid from './VetPatientsGrid';
import UserPetRecords from './UserPetRecords';
import Button from './Button';

const MedicalRecordsSection = () => {
    const { user, logout } = useAuth();

    // Manejar clic en botón de cerrar sesión
    const handleLogoutClick = async () => {
        if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
            await logout();
            window.location.href = '/';
        }
    };

    return (
        <section class="py-16 bg-white">
            <div class="container mx-auto px-4">
                <div class="flex justify-between items-center mb-8">
                    <h2 class="text-3xl font-bold text-gray-800">Fichas Clínicas</h2>
                    <Button
                        variant="danger"
                        leftIcon="fa-sign-out-alt"
                        onClick={handleLogoutClick}
                    >
                        Cerrar sesión
                    </Button>
                </div>

                <div class="bg-gray-50 rounded-xl shadow-md overflow-hidden">
                    <div class="p-6">
                        {/* Vista según el rol */}
                        <Show when={user()?.role === 'admin'}>
                            <AdminRecordsTable />
                        </Show>

                        <Show when={user()?.role === 'vet'}>
                            <VetPatientsGrid />
                        </Show>

                        <Show when={user()?.role === 'user'}>
                            <UserPetRecords />
                        </Show>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default MedicalRecordsSection;