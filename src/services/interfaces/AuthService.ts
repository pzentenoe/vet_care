export interface UserCredentials {
    email: string;
    password: string;
  }
  
  export interface AuthResponse {
    success: boolean;
    user?: User;
    token?: string;
    error?: string;
  }
  
  export interface User {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: 'admin' | 'vet' | 'user';
  }
  
  export interface AuthService {
    login(credentials: UserCredentials): Promise<AuthResponse>;
    logout(): Promise<void>;
    isAuthenticated(): boolean;
    getCurrentUser(): User | null;
  }