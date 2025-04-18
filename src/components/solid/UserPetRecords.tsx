import { createResource, Show, For, createMemo, createSignal, onMount } from 'solid-js';
import { usePets } from '@hooks/usePets';
import { useMedicalRecords } from '@hooks/useMedicalRecords';

const UserPetRecords = () => {
    // Estado para controlar si estamos en el cliente
    const [isClient, setIsClient] = createSignal(false);
    const { pets, isLoading: petsLoading, error: petsError } = usePets();
    const { getMedicalRecordsForPet, getPetMedicalDetails, isLoading: recordsLoading, error: recordsError } = useMedicalRecords();

    // Marcar cuando estamos en el cliente para evitar problemas de hidratación
    onMount(() => {
        setIsClient(true);
    });

    // Memorizar la lista de mascotas para evitar re-renders innecesarios
    const petsList = createMemo(() => {
        if (!pets || !pets()) return [];
        return pets();
    });

    // Cargar registros médicos para cada mascota solo en el cliente
    const [petRecords, { refetch }] = createResource(() => {
        if (!isClient() || petsList().length === 0) return Promise.resolve([]);
        
        return Promise.all(
            petsList().map(async pet => {
                try {
                    const records = await getMedicalRecordsForPet(pet.id);
                    const details = await getPetMedicalDetails(pet.id);
                    return {
                        pet,
                        records: records || [],
                        details
                    };
                } catch (error) {
                    console.error('Error al cargar registros médicos:', error);
                    return {
                        pet,
                        records: [],
                        details: null
                    };
                }
            })
        );
    });

    // Memorizar los registros para evitar re-renders innecesarios
    const recordsList = createMemo(() => {
        if (!petRecords || !petRecords()) return [];
        return petRecords();
    });

    // Determinar icono y color según el tipo de mascota
    const getPetStyle = (type: string) => {
        switch (type.toLowerCase()) {
            case 'gato':
                return { icon: 'fa-cat', bgClass: 'bg-orange-50', textClass: 'text-orange-600', borderClass: 'border-orange-200' };
            case 'ave':
                return { icon: 'fa-dove', bgClass: 'bg-blue-50', textClass: 'text-blue-600', borderClass: 'border-blue-200' };
            case 'roedor':
                return { icon: 'fa-rabbit', bgClass: 'bg-green-50', textClass: 'text-green-600', borderClass: 'border-green-200' };
            case 'reptil':
                return { icon: 'fa-dragon', bgClass: 'bg-red-50', textClass: 'text-red-600', borderClass: 'border-red-200' };
            case 'perro':
            default:
                return { icon: 'fa-dog', bgClass: 'bg-blue-50', textClass: 'text-blue-600', borderClass: 'border-blue-200' };
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
                <h3 class="text-xl font-bold mb-6 text-gray-800">Fichas de mis mascotas</h3>
                <div class="space-y-6">
                    <div class="animate-pulse bg-gray-200 rounded-lg h-64"></div>
                </div>
            </div>
        );
    }

    return (
        <div>
            <h3 class="text-xl font-bold mb-6 text-gray-800">Fichas de mis mascotas</h3>

            <Show when={petsLoading() || recordsLoading()}>
                <div class="space-y-6" aria-busy="true" aria-label="Cargando fichas médicas">
                    <div class="animate-pulse bg-gray-200 rounded-lg h-64"></div>
                </div>
            </Show>

            <Show when={petsError() || recordsError()}>
                <div class="bg-red-100 p-4 rounded-lg" role="alert" aria-live="assertive">
                    <p class="text-red-600">{petsError() || recordsError()}</p>
                </div>
            </Show>

            <Show when={!petsLoading() && !recordsLoading() && !petsError() && !recordsError() && petsList().length === 0}>
                <div class="bg-gray-100 p-4 rounded-lg text-center">
                    <p class="text-gray-600">No tienes mascotas registradas aún</p>
                </div>
            </Show>

            <Show when={!petsLoading() && !recordsLoading() && !petsError() && !recordsError() && recordsList().length > 0}>
                <div class="space-y-6" role="list" aria-label="Fichas médicas de mascotas">
                    <For each={recordsList()}>
                        {(petRecord) => {
                            const { pet, records, details } = petRecord;
                            const { icon, bgClass, textClass, borderClass } = getPetStyle(pet.type);
                            const statusClass = pet.status === 'active' 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'bg-gray-100 text-gray-800';

                            return (
                                <div class="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200" role="listitem">
                                    <div class={`p-4 ${bgClass} flex justify-between items-center`}>
                                        <div class="flex items-center">
                                            <i class={`fas ${icon} text-3xl ${textClass} mr-3`} aria-hidden="true"></i>
                                            <div>
                                                <h4 class="font-bold text-gray-800">{pet.name}</h4>
                                                <p class="text-sm text-gray-600">{pet.breed}, {pet.age} años</p>
                                            </div>
                                        </div>
                                        <span class={`${statusClass} text-xs font-medium px-2.5 py-0.5 rounded`}>
                                          {pet.status === 'active' ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </div>
                                    <div class="p-4">
                                        {/* Historial médico */}
                                        <div class="mb-4">
                                            <h5 class="font-medium text-gray-800 mb-2">Historial médico</h5>
                                            <div class="space-y-3">
                                                <Show when={!records || records.length === 0}>
                                                    <p class="text-sm text-gray-600">No hay registros médicos disponibles</p>
                                                </Show>

                                                <Show when={records && records.length > 0}>
                                                    <For each={
                                                        // Ordenar por fecha descendente y limitar a 5
                                                        [...records].sort((a, b) =>
                                                            new Date(b.date).getTime() - new Date(a.date).getTime()
                                                        ).slice(0, 5)
                                                    }>
                                                        {(record) => (
                                                            <div class={`pl-4 border-l-4 ${borderClass}`}>
                                                                <p class="text-sm font-medium text-gray-800">
                                                                    {formatDate(record.date)} - {record.reasonForVisit || 'Consulta general'}
                                                                </p>
                                                                <p class="text-sm text-gray-600">{record.notes || 'Sin notas adicionales'}</p>
                                                            </div>
                                                        )}
                                                    </For>
                                                </Show>
                                            </div>
                                        </div>

                                        {/* Información adicional */}
                                        <Show when={details}>
                                            <div class="mb-4">
                                                <h5 class="font-medium text-gray-800 mb-2">Alergias</h5>
                                                <p class="text-sm text-gray-600">{details?.allergies || 'Ninguna alergia conocida.'}</p>
                                            </div>
                                            <div class="mb-4">
                                                <h5 class="font-medium text-gray-800 mb-2">Medicamentos actuales</h5>
                                                <p class="text-sm text-gray-600">{details?.currentMedications || 'Ninguno.'}</p>
                                            </div>
                                        </Show>

                                        <div class="flex justify-end">
                                            <a 
                                                href={`/fichas-clinicas/${pet.id}`} 
                                                class="text-blue-600 hover:text-blue-800 font-medium"
                                                aria-label={`Ver historial completo de ${pet.name}`}
                                            >
                                                Ver historial completo
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

export default UserPetRecords;