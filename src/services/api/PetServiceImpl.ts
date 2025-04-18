import type { Pet, PetService } from '../interfaces/PetService';

export class PetServiceImpl implements PetService {
    private pets: Pet[] = [
        {
            id: '1',
            name: 'Max',
            type: 'Perro',
            breed: 'Labrador',
            age: 3,
            weight: 28.5,
            gender: 'Macho',
            ownerId: '3', // Juan Pérez
            status: 'active'
        }
    ];

    async getPetsByOwnerId(ownerId: string): Promise<Pet[]> {
        // En una implementación real, esto sería una llamada a la API
        return this.pets.filter(pet => pet.ownerId === ownerId);
    }

    async getPetById(id: string): Promise<Pet | null> {
        const pet = this.pets.find(pet => pet.id === id);
        return pet || null;
    }

    async createPet(pet: Omit<Pet, 'id'>): Promise<Pet> {
        const newPet: Pet = {
            ...pet,
            id: (this.pets.length + 1).toString()
        };
        
        this.pets.push(newPet);
        return newPet;
    }

    async updatePet(id: string, petData: Partial<Pet>): Promise<Pet | null> {
        const index = this.pets.findIndex(pet => pet.id === id);
        if (index === -1) return null;
        
        const updatedPet = {
            ...this.pets[index],
            ...petData
        };
        
        this.pets[index] = updatedPet;
        return updatedPet;
    }

    async deletePet(id: string): Promise<boolean> {
        const index = this.pets.findIndex(pet => pet.id === id);
        if (index === -1) return false;
        
        this.pets.splice(index, 1);
        return true;
    }
}