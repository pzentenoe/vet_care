import { Show, For } from 'solid-js';
import { useMedicalRecords } from '@hooks/useMedicalRecords';
import { usePets } from '@hooks/usePets';

const VetPatientsGrid = () => {
    const { vetPatients, isLoading, error } = useMedicalRecords();

    // Determinar icono y color según el tipo de mascota
    const getPetStyle = (petType: string = '') => {
        switch (petType.toLowerCase()) {
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
            <h3 class="text-xl font-bold mb-6 text-gray-800">Mis pacientes</h3>

            <Show when={isLoading()}>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div class="animate-pulse bg-gray-200 rounded-lg h-48"></div>
                    <div class="animate-pulse bg-gray-200 rounded-lg h-48"></div>
                    <div class="animate-pulse bg-gray-200 rounded-lg h-48"></div>
                </div>
            </Show>

            <Show when={error()}>
                <div class="bg-red-100 p-4 rounded-lg">
                    <p class="text-red-600">{error()}</p>
                </div>
            </Show>

            <Show when={!isLoading() && !error() && vetPatients && vetPatients().length === 0}>
                <div class="bg-gray-100 p-4 rounded-lg text-center">
                    <p class="text-gray-600">No tienes pacientes asignados</p>
                </div>
            </Show>

            <Show when={!isLoading() && !error() && vetPatients && vetPatients().length > 0}>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <For each={vetPatients()}>
                        {(patient) => {
                            // En una app real, obtendrías más información sobre la mascota
                            const { icon, color } = getPetStyle();

                            return (
                                <div class="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 transition duration-300 hover:shadow-lg hover:-translate-y-1">
                                    <div class={`p-4 bg-${color}-50`}>
                                        <div class="flex items-center">
                                            <i class={`fas ${icon} text-3xl text-${color}-600 mr-3`}></i>
                                            <div>
                                                <h4 class="font-bold text-gray-800">
                                                    {/* En una aplicación real, obtendrías el nombre de la mascota aquí */}
                                                    Mascota #{patient.petId}
                                                </h4>
                                                <p class="text-sm text-gray-600">Paciente</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="p-4">
                                        <div class="mb-3">
                                            <h5 class="text-sm font-medium text-gray-500">Dueño</h5>
                                            <p class="text-gray-800">{patient.ownerName}</p>
                                        </div>
                                        <div class="mb-3">
                                            <h5 class="text-sm font-medium text-gray-500">Última visita</h5>
                                            <p class="text-gray-800">
                                                {formatDate(patient.lastVisitDate)} - {patient.lastVisitReason}
                                            </p>
                                        </div>
                                        <div class="flex justify-end">
                                            <a href={`/fichas-clinicas/${patient.id}`} class="text-blue-600 hover:text-blue-800 font-medium">
                                                Ver ficha clínica
                                            </a>
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

export default VetPatientsGrid;