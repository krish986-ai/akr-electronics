import { UserRole } from '@/types';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  image?: string;
}

export interface AuthSession {
  user: AuthUser;
  expiresAt: number;
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
}

export interface AuthResponse {
  success: boolean;
  error?: string;
  user?: AuthUser;
  token?: string;
}
