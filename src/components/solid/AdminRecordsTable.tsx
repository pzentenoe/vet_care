import { Show, For, createMemo, createSignal, onMount } from 'solid-js';
import { useMedicalRecords } from '@hooks/useMedicalRecords';
import { usePets } from '@hooks/usePets';

const AdminRecordsTable = () => {
    // Estado para controlar si estamos en el cliente
    const [isClient, setIsClient] = createSignal(false);
    const { allRecords, isLoading, error } = useMedicalRecords();
    const { pets } = usePets();

    // Marcar cuando estamos en el cliente para evitar problemas de hidratación
    onMount(() => {
        setIsClient(true);
    });

    // Memorizar la lista de registros para evitar re-renders innecesarios
    const recordsList = createMemo(() => {
        if (!allRecords || !allRecords()) return [];
        return allRecords();
    });

    // Memorizar la lista de mascotas para búsquedas eficientes
    const petsList = createMemo(() => {
        if (!pets || !pets()) return [];
        return pets();
    });

    // Obtener información de la mascota por ID
    const getPetInfo = (petId: string) => {
        if (!isClient()) return { name: `Mascota #${petId}`, type: 'perro' };
        
        const pet = petsList().find(p => p.id === petId);
        if (!pet) return { name: `Mascota #${petId}`, type: 'perro' };
        return { name: pet.name, type: pet.type };
    };

    // Determinar icono y color según el tipo de mascota
    const getPetStyle = (petType: string) => {
        switch (petType.toLowerCase()) {
            case 'gato':
                return { icon: 'fa-cat', textClass: 'text-orange-600' };
            case 'ave':
                return { icon: 'fa-dove', textClass: 'text-blue-600' };
            case 'roedor':
                return { icon: 'fa-rabbit', textClass: 'text-green-600' };
            case 'reptil':
                return { icon: 'fa-dragon', textClass: 'text-red-600' };
            case 'perro':
            default:
                return { icon: 'fa-dog', textClass: 'text-blue-600' };
        }
    };

    // Formatear fecha de manera segura
    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('es-ES');
        } catch (e) {
            return 'Fecha no disponible';
        }
    };

    // Renderizar un esqueleto de carga durante la hidratación inicial
    if (!isClient()) {
        return (
            <div>
                <h3 class="text-xl font-bold mb-6 text-gray-800">Todas las fichas clínicas</h3>
                <div class="animate-pulse bg-gray-200 rounded-lg h-64"></div>
            </div>
        );
    }

    return (
        <div>
            <h3 class="text-xl font-bold mb-6 text-gray-800">Todas las fichas clínicas</h3>

            <Show when={isLoading()}>
                <div class="animate-pulse bg-gray-200 rounded-lg h-64" aria-busy="true" aria-label="Cargando registros médicos"></div>
            </Show>

            <Show when={error()}>
                <div class="bg-red-100 p-4 rounded-lg" role="alert" aria-live="assertive">
                    <p class="text-red-600">{error()}</p>
                </div>
            </Show>

            <Show when={!isLoading() && !error() && recordsList().length === 0}>
                <div class="bg-gray-100 p-4 rounded-lg text-center">
                    <p class="text-gray-600">No hay registros disponibles</p>
                </div>
            </Show>

            <Show when={!isLoading() && !error() && recordsList().length > 0}>
                <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200" role="table" aria-label="Tabla de registros médicos">
                        <thead class="bg-gray-100">
                        <tr>
                            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mascota</th>
                            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dueño</th>
                            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Última visita</th>
                            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Veterinario</th>
                            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                        </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                        <For each={recordsList()}>
                            {(record) => {
                                const petInfo = getPetInfo(record.petId);
                                const { icon, textClass } = getPetStyle(petInfo.type);

                                return (
                                    <tr role="row">
                                        <td class="px-6 py-4 whitespace-nowrap" role="cell">
                                            <div class="flex items-center">
                                                <div class="flex-shrink-0 h-10 w-10 flex items-center justify-center">
                                                    <i class={`fas ${icon} text-2xl ${textClass}`} aria-hidden="true"></i>
                                                </div>
                                                <div class="ml-4">
                                                    <div class="text-sm font-medium text-gray-900">
                                                        {petInfo.name}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap" role="cell">
                                            <div class="text-sm text-gray-900">{record.ownerName || 'No disponible'}</div>
                                            <div class="text-sm text-gray-500">{record.ownerEmail || 'Email no disponible'}</div>
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap" role="cell">
                                            <div class="text-sm text-gray-900">{formatDate(record.lastVisitDate)}</div>
                                            <div class="text-sm text-gray-500">{record.lastVisitReason || 'No especificado'}</div>
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap" role="cell">
                                            <div class="text-sm text-gray-900">{record.veterinarian || 'No asignado'}</div>
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium" role="cell">
                                            <a 
                                                href={`/fichas-clinicas/${record.id}`} 
                                                class="text-blue-600 hover:text-blue-900 mr-3"
                                                aria-label={`Ver ficha de ${petInfo.name}`}
                                            >
                                                Ver
                                            </a>
                                            <a 
                                                href={`/fichas-clinicas/${record.id}/edit`} 
                                                class="text-green-600 hover:text-green-900"
                                                aria-label={`Editar ficha de ${petInfo.name}`}
                                            >
                                                Editar
                                            </a>
                                        </td>
                                    </tr>
                                );
                            }}
                        </For>
                        </tbody>
                    </table>
                </div>
            </Show>
        </div>
    );
};

export default AdminRecordsTable;