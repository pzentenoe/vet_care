import { Show, For } from 'solid-js';
import { useMedicalRecords } from '@hooks/useMedicalRecords';
import { usePets } from '@hooks/usePets';

const AdminRecordsTable = () => {
    const { allRecords, isLoading, error } = useMedicalRecords();
    const { pets } = usePets();

    // Determinar icono y color según el tipo de mascota
    const getPetStyle = (petId: string) => {
        const pet = pets()?.find(p => p.id === petId);

        if (!pet) return { icon: 'fa-paw', color: 'gray' };

        switch (pet.type.toLowerCase()) {
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

    // Formatear fecha
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES');
    };

    return (
        <div>
            <h3 class="text-xl font-bold mb-6 text-gray-800">Todas las fichas clínicas</h3>

            <Show when={isLoading()}>
                <div class="animate-pulse bg-gray-200 rounded-lg h-64"></div>
            </Show>

            <Show when={error()}>
                <div class="bg-red-100 p-4 rounded-lg">
                    <p class="text-red-600">{error()}</p>
                </div>
            </Show>

            <Show when={!isLoading() && !error() && allRecords && allRecords().length === 0}>
                <div class="bg-gray-100 p-4 rounded-lg text-center">
                    <p class="text-gray-600">No hay registros disponibles</p>
                </div>
            </Show>

            <Show when={!isLoading() && !error() && allRecords && allRecords().length > 0}>
                <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-gray-100">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mascota</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dueño</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Última visita</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Veterinario</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                        </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                        <For each={allRecords()}>
                            {(record) => {
                                const { icon, color } = getPetStyle(record.petId);

                                return (
                                    <tr>
                                        <td class="px-6 py-4 whitespace-nowrap">
                                            <div class="flex items-center">
                                                <div class="flex-shrink-0 h-10 w-10 flex items-center justify-center">
                                                    <i class={`fas ${icon} text-2xl text-${color}-600`}></i>
                                                </div>
                                                <div class="ml-4">
                                                    <div class="text-sm font-medium text-gray-900">
                                                        {/* En una aplicación real, obtendrías el nombre de la mascota aquí */}
                                                        Mascota #{record.petId}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap">
                                            <div class="text-sm text-gray-900">{record.ownerName}</div>
                                            <div class="text-sm text-gray-500">{record.ownerEmail}</div>
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap">
                                            <div class="text-sm text-gray-900">{formatDate(record.lastVisitDate)}</div>
                                            <div class="text-sm text-gray-500">{record.lastVisitReason}</div>
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap">
                                            <div class="text-sm text-gray-900">{record.veterinarian}</div>
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <a href={`/fichas-clinicas/${record.id}`} class="text-blue-600 hover:text-blue-900 mr-3">Ver</a>
                                            <a href={`/fichas-clinicas/${record.id}/edit`} class="text-green-600 hover:text-green-900">Editar</a>
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