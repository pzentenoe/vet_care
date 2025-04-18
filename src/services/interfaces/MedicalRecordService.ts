export interface MedicalRecord {
    id: string;
    petId: string;
    date: string; // ISO date string
    reasonForVisit: string;
    diagnosis: string;
    treatment: string;
    notes: string;
    veterinarianId: string;
}

export interface PetMedicalSummary {
    id: string;
    petId: string;
    ownerName: string;
    ownerEmail: string;
    lastVisitDate: string;
    lastVisitReason: string;
    veterinarian: string;
}

export interface PetMedicalDetails {
    petId: string;
    allergies: string;
    currentMedications: string;
    chronicConditions: string;
    weight: number;
    lastVaccinationDate: string;
}

export interface MedicalRecordService {
    getAllMedicalRecords(): Promise<PetMedicalSummary[]>;
    getMedicalRecordsByPetId(petId: string): Promise<MedicalRecord[]>;
    getMedicalRecordById(id: string): Promise<MedicalRecord | null>;
    createMedicalRecord(record: Omit<MedicalRecord, 'id'>): Promise<MedicalRecord>;
    updateMedicalRecord(id: string, record: Partial<MedicalRecord>): Promise<MedicalRecord | null>;
    getPatientsForVet(vetId: string): Promise<PetMedicalSummary[]>;
    getPetMedicalDetails(petId: string): Promise<PetMedicalDetails | null>;
}