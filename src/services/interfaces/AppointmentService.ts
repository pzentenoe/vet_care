export interface Appointment {
    id: string;
    userId: string;
    petId: string;
    date: string; // ISO date string
    service: string;
    veterinarian: string;
    status: 'scheduled' | 'completed' | 'canceled';
}

export interface AppointmentService {
    getAppointmentsByUserId(userId: string): Promise<Appointment[]>;
    getAppointmentById(id: string): Promise<Appointment | null>;
    createAppointment(appointment: Omit<Appointment, 'id'>): Promise<Appointment>;
    updateAppointment(id: string, appointment: Partial<Appointment>): Promise<Appointment | null>;
    cancelAppointment(id: string): Promise<boolean>;
}