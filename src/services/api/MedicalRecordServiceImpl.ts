import type { MedicalRecord, PetMedicalSummary, PetMedicalDetails, MedicalRecordService } from '../interfaces/MedicalRecordService';

export class MedicalRecordServiceImpl implements MedicalRecordService {
    private medicalRecords: MedicalRecord[] = [
        {
            id: '1',
            petId: '1',
            date: '2023-06-15T10:00:00',
            reasonForVisit: 'Vacunación anual',
            diagnosis: 'Saludable',
            treatment: 'Vacuna antirrábica aplicada',
            notes: 'Buen estado de salud general.',
            veterinarianId: '2' // Dra. Ana López
        },
        {
            id: '2',
            petId: '1',
            date: '2023-03-10T14:30:00',
            reasonForVisit: 'Control de peso',
            diagnosis: 'Peso saludable',
            treatment: 'Ninguno',
            notes: 'Peso: 28.5 kg. Recomendación: mantener dieta actual.',
            veterinarianId: '2' // Dra. Ana López
        }
    ];

    private medicalDetails: PetMedicalDetails[] = [
        {
            petId: '1',
            allergies: 'Ninguna alergia conocida',
            currentMedications: 'Ninguna',
            chronicConditions: 'Ninguna',
            weight: 28.5,
            lastVaccinationDate: '2023-06-15'
        }
    ];

    // Datos simulados de los propietarios de mascotas
    private owners = [
        {
            id: '3',
            name: 'Juan Pérez',
            email: 'juan.perez@example.com'
        }
    ];

    // Datos simulados de los veterinarios
    private vets = [
        {
            id: '2',
            name: 'Dra. Ana López'
        }
    ];

    async getAllMedicalRecords(): Promise<PetMedicalSummary[]> {
        // En una implementación real, esto sería una llamada a la API
        
        // Crear un mapa de petId -> último registro médico
        const latestRecordsByPet = new Map<string, MedicalRecord>();
        
        this.medicalRecords.forEach(record => {
            const existing = latestRecordsByPet.get(record.petId);
            if (!existing || new Date(record.date) > new Date(existing.date)) {
                latestRecordsByPet.set(record.petId, record);
            }
        });
        
        // Convertir a PetMedicalSummary
        const summaries: PetMedicalSummary[] = [];
        
        for (const [petId, record] of latestRecordsByPet.entries()) {
            // Buscar el propietario (en una implementación real, esto sería más eficiente)
            const owner = this.owners.find(o => o.id === '3'); // Simulamos que todas las mascotas son de Juan Pérez
            const vet = this.vets.find(v => v.id === record.veterinarianId);
            
            if (owner && vet) {
                summaries.push({
                    id: record.id,
                    petId,
                    ownerName: owner.name,
                    ownerEmail: owner.email,
                    lastVisitDate: record.date,
                    lastVisitReason: record.reasonForVisit,
                    veterinarian: vet.name
                });
            }
        }
        
        return summaries;
    }

    async getMedicalRecordsByPetId(petId: string): Promise<MedicalRecord[]> {
        return this.medicalRecords.filter(record => record.petId === petId);
    }

    async getMedicalRecordById(id: string): Promise<MedicalRecord | null> {
        const record = this.medicalRecords.find(record => record.id === id);
        return record || null;
    }

    async createMedicalRecord(record: Omit<MedicalRecord, 'id'>): Promise<MedicalRecord> {
        const newRecord: MedicalRecord = {
            ...record,
            id: (this.medicalRecords.length + 1).toString()
        };
        
        this.medicalRecords.push(newRecord);
        return newRecord;
    }

    async updateMedicalRecord(id: string, recordData: Partial<MedicalRecord>): Promise<MedicalRecord | null> {
        const index = this.medicalRecords.findIndex(record => record.id === id);
        if (index === -1) return null;
        
        const updatedRecord = {
            ...this.medicalRecords[index],
            ...recordData
        };
        
        this.medicalRecords[index] = updatedRecord;
        return updatedRecord;
    }

    async getPatientsForVet(vetId: string): Promise<PetMedicalSummary[]> {
        // Filtrar registros para este veterinario
        const vetRecords = this.medicalRecords.filter(record => record.veterinarianId === vetId);
        
        // Crear un mapa de petId -> último registro médico
        const latestRecordsByPet = new Map<string, MedicalRecord>();
        
        vetRecords.forEach(record => {
            const existing = latestRecordsByPet.get(record.petId);
            if (!existing || new Date(record.date) > new Date(existing.date)) {
                latestRecordsByPet.set(record.petId, record);
            }
        });
        
        // Convertir a PetMedicalSummary
        const summaries: PetMedicalSummary[] = [];
        
        for (const [petId, record] of latestRecordsByPet.entries()) {
            // Buscar el propietario
            const owner = this.owners.find(o => o.id === '3'); // Simulamos que todas las mascotas son de Juan Pérez
            const vet = this.vets.find(v => v.id === record.veterinarianId);
            
            if (owner && vet) {
                summaries.push({
                    id: record.id,
                    petId,
                    ownerName: owner.name,
                    ownerEmail: owner.email,
                    lastVisitDate: record.date,
                    lastVisitReason: record.reasonForVisit,
                    veterinarian: vet.name
                });
            }
        }
        
        return summaries;
    }

    async getPetMedicalDetails(petId: string): Promise<PetMedicalDetails | null> {
        const details = this.medicalDetails.find(detail => detail.petId === petId);
        return details || null;
    }
}