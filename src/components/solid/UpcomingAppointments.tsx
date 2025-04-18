import { Show, For, createSignal, createMemo } from 'solid-js';
import { useAppointments } from '@hooks/useAppointments';
import Button from './Button';

const UpcomingAppointments = () => {
    const { appointments, isLoading, error, cancelAppointment } = useAppointments();
    const [cancelingId, setCancelingId] = createSignal<string | null>(null);

    // Memorizar la lista de citas para evitar re-renders innecesarios
    const appointmentsList = createMemo(() => {
        if (!appointments || !appointments()) return [];
        return appointments();
    });

    // Formatear fecha y hora
    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString);
        return {
            date: date.toLocaleDateString('es-ES'),
            time: date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
        };
    };

    // Manejar clic en botón de cancelar cita
    const handleCancelClick = async (id: string) => {
        if (confirm('¿Estás seguro de que deseas cancelar esta cita?')) {
            setCancelingId(id);
            try {
                const result = await cancelAppointment(id);
                if (!result.success) {
                    alert(result.error || 'Error al cancelar la cita');
                }
            } catch (error) {
                alert('Error al cancelar la cita');
            } finally {
                setCancelingId(null);
            }
        }
    };

    return (
        <div class="space-y-4">
            <h3 class="text-xl font-bold mb-4 text-gray-800">Próximas citas</h3>

            <Show when={isLoading()}>
                <div class="space-y-3" aria-busy="true" aria-label="Cargando citas">
                    <div class="animate-pulse bg-gray-200 rounded-lg h-24"></div>
                    <div class="animate-pulse bg-gray-200 rounded-lg h-24"></div>
                </div>
            </Show>

            <Show when={error()}>
                <div class="bg-red-100 p-3 rounded-lg" role="alert" aria-live="assertive">
                    <p class="text-red-600">{error()}</p>
                </div>
            </Show>

            <Show when={!isLoading() && !error() && appointmentsList().length === 0}>
                <div class="bg-gray-100 p-3 rounded-lg">
                    <p class="text-gray-800 font-medium">No hay citas programadas</p>
                </div>
            </Show>

            <Show when={!isLoading() && !error() && appointmentsList().length > 0}>
                <div class="space-y-3" role="list" aria-label="Lista de citas programadas">
                    <For each={appointmentsList()}>
                        {(appointment) => {
                            const { date, time } = formatDateTime(appointment.date);
                            const isCanceling = cancelingId() === appointment.id;

                            return (
                                <div class="bg-blue-50 p-3 rounded-lg" role="listitem">
                                    <div class="flex justify-between items-start">
                                        <div>
                                            <p class="text-gray-800 font-medium">{appointment.service}</p>
                                            <p class="text-sm text-gray-600">{date} - {time}</p>
                                            <p class="text-sm text-gray-600">{appointment.veterinarian}</p>
                                        </div>
                                        <Button
                                            variant="danger"
                                            size="sm"
                                            onClick={() => handleCancelClick(appointment.id)}
                                            isLoading={isCanceling}
                                            leftIcon={isCanceling ? undefined : 'fa-times'}
                                            aria-label={`Cancelar cita de ${appointment.service} el ${date}`}
                                            disabled={isCanceling}
                                        >
                                            Cancelar
                                        </Button>
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

export default UpcomingAppointments;