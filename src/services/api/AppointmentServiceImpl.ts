import type { Appointment, AppointmentService } from '../interfaces/AppointmentService';

export class AppointmentServiceImpl implements AppointmentService {
    private appointments: Appointment[] = [
        {
            id: '1',
            userId: '3', // Juan Pérez
            petId: '1', // Max
            date: '2023-07-20T10:30:00',
            service: 'Control de peso',
            veterinarian: 'Dra. Ana López',
            status: 'scheduled'
        },
        {
            id: '2',
            userId: '3', // Juan Pérez
            petId: '1', // Max
            date: '2023-09-15T11:00:00',
            service: 'Vacunación anual',
            veterinarian: 'Dra. Ana López',
            status: 'scheduled'
        }
    ];

    async getAppointmentsByUserId(userId: string): Promise<Appointment[]> {
        // En una implementación real, esto sería una llamada a la API
        return this.appointments.filter(appointment => 
            appointment.userId === userId && 
            appointment.status !== 'canceled'
        );
    }

    async getAppointmentById(id: string): Promise<Appointment | null> {
        const appointment = this.appointments.find(appointment => appointment.id === id);
        return appointment || null;
    }

    async createAppointment(appointment: Omit<Appointment, 'id'>): Promise<Appointment> {
        const newAppointment: Appointment = {
            ...appointment,
            id: (this.appointments.length + 1).toString()
        };
        
        this.appointments.push(newAppointment);
        return newAppointment;
    }

    async updateAppointment(id: string, appointmentData: Partial<Appointment>): Promise<Appointment | null> {
        const index = this.appointments.findIndex(appointment => appointment.id === id);
        if (index === -1) return null;
        
        const updatedAppointment = {
            ...this.appointments[index],
            ...appointmentData
        };
        
        this.appointments[index] = updatedAppointment;
        return updatedAppointment;
    }

    async cancelAppointment(id: string): Promise<boolean> {
        const index = this.appointments.findIndex(appointment => appointment.id === id);
        if (index === -1) return false;
        
        this.appointments[index].status = 'canceled';
        return true;
    }
}