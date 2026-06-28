// Authentication types

import { UserRole, UserStatus } from '@prisma/client';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  emailVerified: boolean;
  image?: string;
  phone?: string;
}

export interface AuthSession {
  user: AuthUser;
  token: string;
  expiresAt: Date;
  isValid: boolean;
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  phone?: string;
}

export interface AuthResponse {
  success: boolean;
  user?: AuthUser;
  token?: string;
  error?: string;
  code?: string;
}

export interface LoginAttempt {
  userId: string;
  succeeded: boolean;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

export interface PasswordResetRequest {
  email: string;
  code: string;
  newPassword: string;
}

export interface UserProfile {
  name: string;
  email: string;
  phone?: string;
  image?: string;
  role: UserRole;
  status: UserStatus;
  emailVerified: boolean;
  createdAt: Date;
}
