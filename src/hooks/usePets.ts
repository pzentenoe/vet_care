import { createSignal, createResource, createEffect } from 'solid-js';
import { useAuth } from '@stores/authStore';
import { PetServiceImpl } from '@services/api/PetServiceImpl';
import type { Pet } from '@services/interfaces/PetService';

const petService = new PetServiceImpl();

export const usePets = () => {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = createSignal(true);
    const [error, setError] = createSignal<string | null>(null);

    // Crear recurso que automáticamente obtiene las mascotas cuando cambia el usuario
    const [pets, { refetch }] = createResource<Pet[]>(() => {
        const currentUser = user();
        if (!currentUser) return Promise.resolve([]);

        setIsLoading(true);
        setError(null);

        return petService.getPetsByOwnerId(currentUser.id)
            .then(data => {
                setIsLoading(false);
                return data;
            })
            .catch(err => {
                setIsLoading(false);
                setError('Error al cargar las mascotas');
                return [];
            });
    });

    // Función para crear una nueva mascota
    const createPet = async (petData: Omit<Pet, 'id'>) => {
        setError(null);
        try {
            const newPet = await petService.createPet(petData);
            refetch(); // Recargar la lista de mascotas
            return { success: true, pet: newPet };
        } catch (err) {
            setError('Error al crear la mascota');
            return { success: false, error: 'Error al crear la mascota' };
        }
    };

    // Función para actualizar una mascota
    const updatePet = async (id: string, petData: Partial<Pet>) => {
        setError(null);
        try {
            const updatedPet = await petService.updatePet(id, petData);
            if (updatedPet) {
                refetch(); // Recargar la lista de mascotas
                return { success: true, pet: updatedPet };
            }
            setError('Mascota no encontrada');
            return { success: false, error: 'Mascota no encontrada' };
        } catch (err) {
            setError('Error al actualizar la mascota');
            return { success: false, error: 'Error al actualizar la mascota' };
        }
    };

    // Función para eliminar una mascota
    const deletePet = async (id: string) => {
        setError(null);
        try {
            const success = await petService.deletePet(id);
            if (success) {
                refetch(); // Recargar la lista de mascotas
                return { success: true };
            }
            setError('Mascota no encontrada');
            return { success: false, error: 'Mascota no encontrada' };
        } catch (err) {
            setError('Error al eliminar la mascota');
            return { success: false, error: 'Error al eliminar la mascota' };
        }
    };

    return {
        pets,
        isLoading,
        error,
        createPet,
        updatePet,
        deletePet,
        refetch
    };
};