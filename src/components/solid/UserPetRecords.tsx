import { createResource, Show, For } from 'solid-js';
import { usePets } from '@hooks/usePets';
import { useMedicalRecords } from '@hooks/useMedicalRecords';

const UserPetRecords = () => {
    const { pets, isLoading: petsLoading, error: petsError } = usePets();
    const { getMedicalRecordsForPet, getPetMedicalDetails, isLoading: recordsLoading, error: recordsError } = useMedicalRecords();

    // Cargar registros médicos para cada mascota
    const [petRecords, { refetch }] = createResource(() =>
        pets() ? Promise.all(
            pets().map(async pet => {
                const records = await getMedicalRecordsForPet(pet.id);
                const details = await getPetMedicalDetails(pet.id);
                return {
                    pet,
                    records: records || [],
                    details
                };
            })
        ) : Promise.resolve([])
    );

    // Determinar icono y color según el tipo de mascota
    const getPetStyle = (type: string) => {
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

    // Formatear fecha
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES');
    };

    return (
        <div>
            <h3 class="text-xl font-bold mb-6 text-gray-800">Fichas de mis mascotas</h3>

            <Show when={petsLoading() || recordsLoading()}>
                <div class="space-y-6">
                    <div class="animate-pulse bg-gray-200 rounded-lg h-64"></div>
                </div>
            </Show>

            <Show when={petsError() || recordsError()}>
                <div class="bg-red-100 p-4 rounded-lg">
                    <p class="text-red-600">{petsError() || recordsError()}</p>
                </div>
            </Show>

            <Show when={!petsLoading() && !recordsLoading() && !petsError() && !recordsError() && pets && pets().length === 0}>
                <div class="bg-gray-100 p-4 rounded-lg text-center">
                    <p class="text-gray-600">No tienes mascotas registradas aún</p>
                </div>
            </Show>

            <Show when={!petsLoading() && !recordsLoading() && !petsError() && !recordsError() && petRecords && petRecords()?.length > 0}>
                <div class="space-y-6">
                    <For each={petRecords()}>
                        {(petRecord) => {
                            const { pet, records, details } = petRecord;
                            const { icon, color } = getPetStyle(pet.type);

                            return (
                                <div class="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
                                    <div class={`p-4 bg-${color}-50 flex justify-between items-center`}>
                                        <div class="flex items-center">
                                            <i class={`fas ${icon} text-3xl text-${color}-600 mr-3`}></i>
                                            <div>
                                                <h4 class="font-bold text-gray-800">{pet.name}</h4>
                                                <p class="text-sm text-gray-600">{pet.breed}, {pet.age} años</p>
                                            </div>
                                        </div>
                                        <span class={`bg-${pet.status === 'active' ? 'blue' : 'gray'}-100 text-${pet.status === 'active' ? 'blue' : 'gray'}-800 text-xs font-medium px-2.5 py-0.5 rounded`}>
                      {pet.status === 'active' ? 'Activo' : 'Inactivo'}
                    </span>
                                    </div>
                                    <div class="p-4">
                                        {/* Historial médico */}
                                        <div class="mb-4">
                                            <h5 class="font-medium text-gray-800 mb-2">Historial médico</h5>
                                            <div class="space-y-3">
                                                <Show when={records.length === 0}>
                                                    <p class="text-sm text-gray-600">No hay registros médicos disponibles</p>
                                                </Show>

                                                <Show when={records.length > 0}>
                                                    <For each={
                                                        // Ordenar por fecha descendente y limitar a 5
                                                        [...records].sort((a, b) =>
                                                            new Date(b.date).getTime() - new Date(a.date).getTime()
                                                        ).slice(0, 5)
                                                    }>
                                                        {(record) => (
                                                            <div class={`pl-4 border-l-4 border-${color}-200`}>
                                                                <p class="text-sm font-medium text-gray-800">
                                                                    {formatDate(record.date)} - {record.reasonForVisit}
                                                                </p>
                                                                <p class="text-sm text-gray-600">{record.notes}</p>
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
                                            <a href={`/fichas-clinicas/${pet.id}`} class="text-blue-600 hover:text-blue-800 font-medium">
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