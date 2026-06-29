export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'CUSTOMER';
  emailVerified?: boolean;
}

export interface AuthSession {
  user: AuthUser;
  token: string;
  expiresAt: Date;
}

export interface AuthTokenPayload {
  id: string;
  email: string;
  role: 'ADMIN' | 'CUSTOMER';
  iat: number;
  exp: number;
}
