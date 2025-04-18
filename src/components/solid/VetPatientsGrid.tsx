import { Show, For, createMemo, createSignal, onMount } from 'solid-js';
import { useMedicalRecords } from '@hooks/useMedicalRecords';
import { usePets } from '@hooks/usePets';

const VetPatientsGrid = () => {
    // Estado inicial vacío para garantizar una hidratación consistente
    const [isClient, setIsClient] = createSignal(false);
    const { vetPatients, isLoading, error } = useMedicalRecords();
    const { pets } = usePets();

    // Marcar cuando estamos en el cliente para evitar problemas de hidratación
    onMount(() => {
        setIsClient(true);
    });

    // Memorizar la lista de pacientes para evitar re-renders innecesarios
    const patientsList = createMemo(() => {
        if (!vetPatients || !vetPatients()) return [];
        return vetPatients();
    });

    // Memorizar la lista de mascotas para búsquedas eficientes
    const petsList = createMemo(() => {
        if (!pets || !pets()) return [];
        return pets();
    });

    // Obtener información de la mascota por ID de forma sincrónica
    const getPetInfo = (petId: string) => {
        if (!isClient()) return { name: `Mascota #${petId}`, type: 'perro' };
        
        const pet = petsList().find(p => p.id === petId);
        if (!pet) return { name: `Mascota #${petId}`, type: 'perro' };
        return { name: pet.name, type: pet.type };
    };

    // Determinar icono y color según el tipo de mascota
    const getPetStyle = (petType: string = '') => {
        switch (petType.toLowerCase()) {
            case 'gato':
                return { icon: 'fa-cat', bgClass: 'bg-orange-50', textClass: 'text-orange-600' };
            case 'ave':
                return { icon: 'fa-dove', bgClass: 'bg-blue-50', textClass: 'text-blue-600' };
            case 'roedor':
                return { icon: 'fa-rabbit', bgClass: 'bg-green-50', textClass: 'text-green-600' };
            case 'reptil':
                return { icon: 'fa-dragon', bgClass: 'bg-red-50', textClass: 'text-red-600' };
            case 'perro':
            default:
                return { icon: 'fa-dog', bgClass: 'bg-blue-50', textClass: 'text-blue-600' };
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
                <h3 class="text-xl font-bold mb-6 text-gray-800">Mis pacientes</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div class="animate-pulse bg-gray-200 rounded-lg h-48"></div>
                    <div class="animate-pulse bg-gray-200 rounded-lg h-48"></div>
                    <div class="animate-pulse bg-gray-200 rounded-lg h-48"></div>
                </div>
            </div>
        );
    }

    return (
        <div>
            <h3 class="text-xl font-bold mb-6 text-gray-800">Mis pacientes</h3>

            <Show when={isLoading()}>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" aria-busy="true" aria-label="Cargando pacientes">
                    <div class="animate-pulse bg-gray-200 rounded-lg h-48"></div>
                    <div class="animate-pulse bg-gray-200 rounded-lg h-48"></div>
                    <div class="animate-pulse bg-gray-200 rounded-lg h-48"></div>
                </div>
            </Show>

            <Show when={error()}>
                <div class="bg-red-100 p-4 rounded-lg" role="alert" aria-live="assertive">
                    <p class="text-red-600">{error()}</p>
                </div>
            </Show>

            <Show when={!isLoading() && !error() && patientsList().length === 0}>
                <div class="bg-gray-100 p-4 rounded-lg text-center">
                    <p class="text-gray-600">No tienes pacientes asignados</p>
                </div>
            </Show>

            <Show when={!isLoading() && !error() && patientsList().length > 0}>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" role="list" aria-label="Lista de pacientes">
                    <For each={patientsList()}>
                        {(patient) => {
                            // Obtener información de la mascota de forma sincrónica
                            const petInfo = getPetInfo(patient.petId);
                            const { icon, bgClass, textClass } = getPetStyle(petInfo.type);
                            
                            return (
                                <div 
                                    class="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 transition duration-300 hover:shadow-lg hover:-translate-y-1" 
                                    role="listitem"
                                >
                                    <div class={`p-4 ${bgClass}`}>
                                        <div class="flex items-center">
                                            <i class={`fas ${icon} text-3xl ${textClass} mr-3`} aria-hidden="true"></i>
                                            <div>
                                                <h4 class="font-bold text-gray-800">
                                                    {petInfo.name}
                                                </h4>
                                                <p class="text-sm text-gray-600">Paciente</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="p-4">
                                        <div class="mb-3">
                                            <h5 class="text-sm font-medium text-gray-500">Dueño</h5>
                                            <p class="text-gray-800">{patient.ownerName || 'No disponible'}</p>
                                        </div>
                                        <div class="mb-3">
                                            <h5 class="text-sm font-medium text-gray-500">Última visita</h5>
                                            <p class="text-gray-800">
                                                {formatDate(patient.lastVisitDate)} - {patient.lastVisitReason || 'No especificado'}
                                            </p>
                                        </div>
                                        <div class="flex justify-end">
                                            <a 
                                                href={`/fichas-clinicas/${patient.id}`} 
                                                class="text-blue-600 hover:text-blue-800 font-medium"
                                                aria-label={`Ver ficha clínica de ${petInfo.name}`}
                                            >
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