import type { User } from '../interfaces/AuthService';
import { currentUser } from '@stores/authStore';

export class UserService {
    async updateUser(id: string, userData: Partial<User>): Promise<User> {
        // En una implementación real, esto sería una llamada a la API
        
        // Para desarrollo, simulamos la actualización
        const user = currentUser.get();
        if (!user || user.id !== id) {
            throw new Error('Usuario no encontrado');
        }
        
        // Crear usuario actualizado
        const updatedUser: User = {
            ...user,
            ...userData,
            // Asegurarse de que el rol no cambie (solo administradores pueden cambiar roles)
            role: user.role
        };
        
        // Simular persistencia actualizando localStorage
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        return updatedUser;
    }
}