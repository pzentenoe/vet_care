import { createSignal, createResource } from 'solid-js';
import { useAuth } from '@stores/authStore';
import { MedicalRecordServiceImpl } from '@services/api/MedicalRecordServiceImpl';
import type { MedicalRecord, PetMedicalSummary, PetMedicalDetails } from '@services/interfaces/MedicalRecordService';

const medicalRecordService = new MedicalRecordServiceImpl();

export const useMedicalRecords = () => {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = createSignal(true);
    const [error, setError] = createSignal<string | null>(null);

    // Obtener todos los registros médicos (para admin)
    const [allRecords, { refetch: refetchAllRecords }] = createResource<PetMedicalSummary[]>(() => {
        const currentUser = user();
        if (!currentUser || currentUser.role !== 'admin') return Promise.resolve([]);

        setIsLoading(true);
        setError(null);

        return medicalRecordService.getAllMedicalRecords()
            .then(data => {
                setIsLoading(false);
                return data;
            })
            .catch(err => {
                setIsLoading(false);
                setError('Error al cargar los registros');
                return [];
            });
    });

    // Obtener los pacientes de un veterinario
    const [vetPatients, { refetch: refetchVetPatients }] = createResource<PetMedicalSummary[]>(() => {
        const currentUser = user();
        if (!currentUser || currentUser.role !== 'vet') return Promise.resolve([]);

        setIsLoading(true);
        setError(null);

        return medicalRecordService.getPatientsForVet(currentUser.id)
            .then(data => {
                setIsLoading(false);
                return data;
            })
            .catch(err => {
                setIsLoading(false);
                setError('Error al cargar los pacientes');
                return [];
            });
    });

    // Obtener registros médicos para una mascota específica
    const getMedicalRecordsForPet = async (petId: string) => {
        setError(null);
        setIsLoading(true);

        try {
            const records = await medicalRecordService.getMedicalRecordsByPetId(petId);
            setIsLoading(false);
            return records;
        } catch (err) {
            setError('Error al cargar los registros médicos');
            setIsLoading(false);
            return [];
        }
    };

    // Obtener detalles médicos de una mascota
    const getPetMedicalDetails = async (petId: string) => {
        setError(null);

        try {
            return await medicalRecordService.getPetMedicalDetails(petId);
        } catch (err) {
            setError('Error al cargar los detalles médicos');
            return null;
        }
    };

    // Crear un nuevo registro médico
    const createMedicalRecord = async (recordData: Omit<MedicalRecord, 'id'>) => {
        setError(null);

        try {
            const newRecord = await medicalRecordService.createMedicalRecord(recordData);
            refetchAllRecords();
            refetchVetPatients();
            return { success: true, record: newRecord };
        } catch (err) {
            setError('Error al crear el registro médico');
            return { success: false, error: 'Error al crear el registro médico' };
        }
    };

    // Actualizar un registro médico
    const updateMedicalRecord = async (id: string, recordData: Partial<MedicalRecord>) => {
        setError(null);

        try {
            const updatedRecord = await medicalRecordService.updateMedicalRecord(id, recordData);
            if (updatedRecord) {
                refetchAllRecords();
                refetchVetPatients();
                return { success: true, record: updatedRecord };
            }
            setError('Registro médico no encontrado');
            return { success: false, error: 'Registro médico no encontrado' };
        } catch (err) {
            setError('Error al actualizar el registro médico');
            return { success: false, error: 'Error al actualizar el registro médico' };
        }
    };

    return {
        // Recursos
        allRecords,
        vetPatients,

        // Estado
        isLoading,
        error,

        // Métodos
        getMedicalRecordsForPet,
        getPetMedicalDetails,
        createMedicalRecord,
        updateMedicalRecord,

        // Refetch
        refetchAllRecords,
        refetchVetPatients
    };
};