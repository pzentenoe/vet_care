import type { AuthService, UserCredentials, AuthResponse, User } from '../interfaces/AuthService';
import { safeStorage } from '@utils/storage';

const USER_STORAGE_KEY = 'user';
const TOKEN_STORAGE_KEY = 'token';

// Simulación de la API para autenticación
export class AuthServiceImpl implements AuthService {
  private user: User | null;
  private token: string | null;

  constructor() {
    // Inicialización perezosa - no cargamos nada en el constructor
    this.user = null;
    this.token = null;
  }

  // Método privado para cargar el usuario desde el almacenamiento
  private loadUserFromStorage(): void {
    // Siempre cargamos usuario/token desde almacenamiento
    this.user = safeStorage.get<User | null>(USER_STORAGE_KEY, null);
    this.token = safeStorage.get<string | null>(TOKEN_STORAGE_KEY, null);
  }

  async login(credentials: UserCredentials): Promise<AuthResponse> {
    try {
      // Simulación de llamada a API
      // Para desarrollo, simularemos diferentes tipos de usuarios según el email
      let mockUser: User | null = null;

      if (credentials.email.includes('admin@')) {
        mockUser = {
          id: '1',
          name: 'Administrador VetCare',
          email: 'admin@vetcare.com',
          phone: '555-000-0001',
          role: 'admin'
        };
      } else if (credentials.email.includes('vet@')) {
        mockUser = {
          id: '2',
          name: 'Dra. Ana López',
          email: 'vet@vetcare.com',
          phone: '555-000-0002',
          role: 'vet'
        };
      } else {
        mockUser = {
          id: '3',
          name: 'Juan Pérez',
          email: 'juan.perez@example.com',
          phone: '555-123-4567',
          role: 'user'
        };
      }

      if (!mockUser) {
        return {
          success: false,
          error: 'Usuario no encontrado'
        };
      }

      // Simular verificación de contraseña
      if (!credentials.password) {
        return {
          success: false,
          error: 'Contraseña incorrecta'
        };
      }

      // Guardar la sesión
      this.user = mockUser;
      this.token = 'mock-jwt-token-' + mockUser.id;

      // Guardar en localStorage
      safeStorage.set(USER_STORAGE_KEY, this.user);
      safeStorage.set(TOKEN_STORAGE_KEY, this.token);

      return {
        success: true,
        user: this.user,
        token: this.token
      };
    } catch (error) {
      return {
        success: false,
        error: 'Error en el servidor'
      };
    }
  }

  async logout(): Promise<void> {
    this.user = null;
    this.token = null;
    safeStorage.remove(USER_STORAGE_KEY);
    safeStorage.remove(TOKEN_STORAGE_KEY);
  }

  isAuthenticated(): boolean {
    this.loadUserFromStorage();
    return !!this.user && !!this.token;
  }

  getCurrentUser(): User | null {
    this.loadUserFromStorage();
    return this.user;
  }
}