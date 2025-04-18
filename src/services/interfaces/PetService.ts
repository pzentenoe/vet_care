export interface Pet {
    id: string;
    name: string;
    type: string;
    breed: string;
    age: number;
    weight: number;
    gender: string;
    ownerId: string;
    status: 'active' | 'inactive';
}

export interface PetService {
    getPetsByOwnerId(ownerId: string): Promise<Pet[]>;
    getPetById(id: string): Promise<Pet | null>;
    createPet(pet: Omit<Pet, 'id'>): Promise<Pet>;
    updatePet(id: string, pet: Partial<Pet>): Promise<Pet | null>;
    deletePet(id: string): Promise<boolean>;
}