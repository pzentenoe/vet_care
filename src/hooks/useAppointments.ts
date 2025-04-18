import { createSignal, createResource, createEffect } from 'solid-js';
import { useAuth } from '@stores/authStore';
import { AppointmentServiceImpl } from '@services/api/AppointmentServiceImpl';
import type { Appointment } from '@services/interfaces/AppointmentService';

const appointmentService = new AppointmentServiceImpl();

export const useAppointments = () => {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = createSignal(true);
    const [error, setError] = createSignal<string | null>(null);

    // Crear recurso que obtiene citas automáticamente cuando cambia el usuario
    const [appointments, { refetch }] = createResource<Appointment[]>(() => {
        const currentUser = user();
        if (!currentUser) return Promise.resolve([]);

        setIsLoading(true);
        setError(null);

        return appointmentService.getAppointmentsByUserId(currentUser.id)
            .then(data => {
                setIsLoading(false);
                return data;
            })
            .catch(err => {
                setIsLoading(false);
                setError('Error al cargar las citas');
                return [];
            });
    });

    // Función para crear una nueva cita
    const createAppointment = async (appointmentData: Omit<Appointment, 'id'>) => {
        setError(null);
        try {
            const newAppointment = await appointmentService.createAppointment(appointmentData);
            refetch(); // Recargar la lista de citas
            return { success: true, appointment: newAppointment };
        } catch (err) {
            setError('Error al crear la cita');
            return { success: false, error: 'Error al crear la cita' };
        }
    };

    // Función para actualizar una cita
    const updateAppointment = async (id: string, appointmentData: Partial<Appointment>) => {
        setError(null);
        try {
            const updatedAppointment = await appointmentService.updateAppointment(id, appointmentData);
            if (updatedAppointment) {
                refetch(); // Recargar la lista de citas
                return { success: true, appointment: updatedAppointment };
            }
            setError('Cita no encontrada');
            return { success: false, error: 'Cita no encontrada' };
        } catch (err) {
            setError('Error al actualizar la cita');
            return { success: false, error: 'Error al actualizar la cita' };
        }
    };

    // Función para cancelar una cita
    const cancelAppointment = async (id: string) => {
        setError(null);
        try {
            const success = await appointmentService.cancelAppointment(id);
            if (success) {
                refetch(); // Recargar la lista de citas
                return { success: true };
            }
            setError('Cita no encontrada');
            return { success: false, error: 'Cita no encontrada' };
        } catch (err) {
            setError('Error al cancelar la cita');
            return { success: false, error: 'Error al cancelar la cita' };
        }
    };

    return {
        appointments,
        isLoading,
        error,
        createAppointment,
        updateAppointment,
        cancelAppointment,
        refetch
    };
};