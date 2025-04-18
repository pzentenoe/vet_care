import { createSignal } from 'solid-js';
import UserProfile from './UserProfile';
import PetList from './PetList';
import UpcomingAppointments from './UpcomingAppointments';
import EditProfileForm from './EditProfileForm';
import AddPetForm from './AddPetForm';

const ProfileSection = () => {
    const [showEditProfile, setShowEditProfile] = createSignal(false);
    const [showAddPet, setShowAddPet] = createSignal(false);

    return (
        <section class="py-16 bg-gray-50">
            <div class="container mx-auto px-4">
                <h2 class="text-3xl font-bold text-gray-800 mb-8">Mi Perfil</h2>

                <div class="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
                    <div class="md:flex">
                        <div class="md:w-1/3">
                            <UserProfile
                                onEditProfile={() => setShowEditProfile(true)}
                            />
                        </div>

                        <div class="md:w-2/3 p-8">
                            <PetList
                                onAddPet={() => setShowAddPet(true)}
                            />

                            <div class="mt-8">
                                <UpcomingAppointments />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modales */}
            <EditProfileForm
                isOpen={showEditProfile()}
                onClose={() => setShowEditProfile(false)}
            />

            <AddPetForm
                isOpen={showAddPet()}
                onClose={() => setShowAddPet(false)}
            />
        </section>
    );
};

export default ProfileSection;