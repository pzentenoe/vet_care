import { atom } from 'nanostores';
import type { User } from '@services/interfaces/AuthService';
import { AuthServiceImpl } from '@services/api/AuthServiceImpl';

const authService = new AuthServiceImpl();

// Crear los átomos del store
export const isAuthenticated = atom(authService.isAuthenticated());
export const currentUser = atom<User | null>(authService.getCurrentUser());

// Acciones
export async function login(email: string, password: string) {
  const response = await authService.login({ email, password });
  
  if (response.success && response.user) {
    isAuthenticated.set(true);
    currentUser.set(response.user);
    return { success: true };
  } else {
    return { 
      success: false, 
      error: response.error || 'Error de autenticación' 
    };
  }
}

export async function logout() {
  await authService.logout();
  isAuthenticated.set(false);
  currentUser.set(null);
}