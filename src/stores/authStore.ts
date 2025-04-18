import { createSignal, createEffect, createRoot } from 'solid-js';
import type { User } from '@services/interfaces/AuthService';
import { AuthServiceImpl } from '@services/api/AuthServiceImpl';
import { safeStorage } from '@utils/storage';

// Creamos un scope aislado para los signals
const createAuthStore = () => {
  const authService = new AuthServiceImpl();

  // Crear signals
  const [isAuthenticated, setIsAuthenticated] = createSignal<boolean>(false);
  const [user, setUser] = createSignal<User | null>(null);
  const [isInitialized, setIsInitialized] = createSignal<boolean>(false);

  // Esta función inicializa el estado desde el authService
  const initializeStore = () => {
    // Siempre inicializa el estado
    const isAuth = authService.isAuthenticated();
    setIsAuthenticated(isAuth);
    if (isAuth) {
      setUser(authService.getCurrentUser());
    } else {
      setUser(null);
    }
    setIsInitialized(true);
    console.log("Auth store initialized, authenticated:", isAuth);
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
  // Asegurarse de que el store esté inicializado
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

// Inicializamos el store inmediatamente en cliente
if (typeof window !== 'undefined') {
  authStore.initializeStore();
}