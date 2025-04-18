import { createSignal, createEffect, createRoot } from 'solid-js';
import type { User } from '@services/interfaces/AuthService';
import { AuthServiceImpl } from '@services/api/AuthServiceImpl';

// Creamos un scope aislado para los signals
const createAuthStore = () => {
  const authService = new AuthServiceImpl();

  // Crear signals con valores iniciales que no dependen de localStorage
  const [isAuthenticated, setIsAuthenticated] = createSignal<boolean>(false);
  const [user, setUser] = createSignal<User | null>(null);

  // Esta función inicializa el estado desde el authService
  // Solo se ejecutará en el cliente cuando se importe el store
  const initializeStore = () => {
    // Verificamos la autenticación actual
    const isAuth = authService.isAuthenticated();
    setIsAuthenticated(isAuth);

    // Si está autenticado, obtenemos el usuario
    if (isAuth) {
      setUser(authService.getCurrentUser());
    }
  };

  // Exponemos las acciones
  const login = async (email: string, password: string) => {
    const response = await authService.login({ email, password });

    if (response.success && response.user) {
      setIsAuthenticated(true);
      setUser(response.user);
      return { success: true };
    } else {
      return {
        success: false,
        error: response.error || 'Error de autenticación'
      };
    }
  };

  const logout = async () => {
    await authService.logout();
    setIsAuthenticated(false);
    setUser(null);
  };

  // Retornamos todo lo que necesitamos exponer
  return {
    isAuthenticated,
    user,
    login,
    logout,
    initializeStore
  };
};

// Creamos el store una sola vez usando createRoot
const authStore = createRoot(createAuthStore);

// Para mantener compatibilidad con el código existente
export const isAuthenticated = authStore.isAuthenticated;
export const user = authStore.user;
export const currentUser = authStore.user; // Alias para compatibilidad
export const login = authStore.login;
export const logout = authStore.logout;

// Este hook se utiliza en componentes SolidJS
export const useAuth = () => {
  // Inicializamos el store al usar el hook por primera vez en el cliente
  if (typeof window !== 'undefined') {
    authStore.initializeStore();
  }

  return {
    isAuthenticated: authStore.isAuthenticated,
    user: authStore.user,
    login: authStore.login,
    logout: authStore.logout
  };
};

// Inicializamos solo en el cliente
if (typeof window !== 'undefined') {
  authStore.initializeStore();
}