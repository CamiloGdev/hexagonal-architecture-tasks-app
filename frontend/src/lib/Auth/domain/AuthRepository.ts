import type { AuthUser } from './User';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  user: AuthUser;
}

export interface AuthRepository {
  login(credentials: LoginCredentials): Promise<AuthResponse>;
  register(data: RegisterData): Promise<AuthResponse>;
  refresh(): Promise<{ message: string }>;
  logout(): Promise<{ message: string }>;
  getProfile(): Promise<AuthUser>;
}
