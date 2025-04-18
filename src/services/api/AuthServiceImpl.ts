import type { AuthService, UserCredentials, AuthResponse, User } from '../interfaces/AuthService';

// Simulación de la API para autenticación
export class AuthServiceImpl implements AuthService {
  private user: User | null = null;
  private token: string | null = null;

  constructor() {
    // Intenta recuperar la sesión del almacenamiento local
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    
    if (storedUser && storedToken) {
      this.user = JSON.parse(storedUser);
      this.token = storedToken;
    }
  }

  async login(credentials: UserCredentials): Promise<AuthResponse> {
    try {
      // Simulación de llamada a API
      // En la implementación real, esto sería un fetch a tu API en Golang
      
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
      
      // Guardar en localStorage para persistencia
      localStorage.setItem('user', JSON.stringify(this.user));
      localStorage.setItem('token', this.token);

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
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  }

  isAuthenticated(): boolean {
    return !!this.user && !!this.token;
  }

  getCurrentUser(): User | null {
    return this.user;
  }
}