import { Show, For, createEffect } from 'solid-js';
import { usePets } from '@hooks/usePets';
import Button from './Button';
import type { Pet } from '@services/interfaces/PetService';

interface PetListProps {
    onAddPet?: () => void;
}

const PetList = (props: PetListProps) => {
    const { pets, isLoading, error, refetch } = usePets();

    // Manejar clic en botón de agregar mascota
    const handleAddPetClick = () => {
        if (props.onAddPet) {
            props.onAddPet();
        } else if (typeof window !== 'undefined' && window.openAddPetForm) {
            window.openAddPetForm();
        }
    };

    // Determinar icono y color basado en el tipo de mascota
    const getPetIcon = (type: string) => {
        switch (type.toLowerCase()) {
            case 'gato':
                return { icon: 'fa-cat', color: 'orange' };
            case 'ave':
                return { icon: 'fa-dove', color: 'blue' };
            case 'roedor':
                return { icon: 'fa-rabbit', color: 'green' };
            case 'reptil':
                return { icon: 'fa-dragon', color: 'red' };
            case 'perro':
            default:
                return { icon: 'fa-dog', color: 'blue' };
        }
    };

    return (
        <div class="space-y-4">
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-xl font-bold text-gray-800">Mis mascotas</h3>
                <Button
                    variant="success"
                    size="sm"
                    onClick={handleAddPetClick}
                    leftIcon="fa-plus"
                >
                    Agregar mascota
                </Button>
            </div>

            <Show when={isLoading()}>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="animate-pulse bg-gray-200 rounded-lg h-32"></div>
                    <div class="animate-pulse bg-gray-200 rounded-lg h-32"></div>
                </div>
            </Show>

            <Show when={error()}>
                <div class="bg-red-100 p-4 rounded-lg">
                    <p class="text-red-600">{error()}</p>
                </div>
            </Show>

            <Show when={!isLoading() && !error() && pets && pets().length === 0}>
                <div class="bg-gray-100 p-4 rounded-lg text-center">
                    <p class="text-gray-600">No tienes mascotas registradas aún.</p>
                </div>
            </Show>

            <Show when={!isLoading() && !error() && pets && pets().length > 0}>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <For each={pets()}>
                        {(pet) => {
                            const { icon, color } = getPetIcon(pet.type);
                            return (
                                <div class="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 transition duration-300 hover:shadow-lg hover:-translate-y-1">
                                    <div class={`p-4 bg-${color}-50`}>
                                        <div class="flex items-center">
                                            <i class={`fas ${icon} text-3xl text-${color}-600 mr-3`}></i>
                                            <div>
                                                <h4 class="font-bold text-gray-800">{pet.name}</h4>
                                                <p class="text-sm text-gray-600">{pet.breed}, {pet.age} años</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="p-4">
                                        <div class="flex justify-between items-center">
                      <span class={`bg-${pet.status === 'active' ? 'blue' : 'gray'}-100 text-${pet.status === 'active' ? 'blue' : 'gray'}-800 text-xs font-medium px-2.5 py-0.5 rounded`}>
                        {pet.status === 'active' ? 'Activo' : 'Inactivo'}
                      </span>
                                            <a href={`/fichas-clinicas/${pet.id}`} class="text-blue-600 hover:text-blue-800 text-sm font-medium">Ver ficha</a>
                                        </div>
                                    </div>
                                </div>
                            );
                        }}
                    </For>
                </div>
            </Show>
        </div>
    );
};

export default PetList;