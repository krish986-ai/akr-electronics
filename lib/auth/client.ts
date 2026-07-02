'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  updateProfile,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from '@/lib/firebase/config';
import { AuthUser } from './types';

const MOCK_TOKEN_KEY = 'auth-token';

function firebaseUserToAuthUser(fbUser: FirebaseUser): AuthUser {
  return {
    id: fbUser.uid,
    email: fbUser.email ?? '',
    name: fbUser.displayName ?? fbUser.email?.split('@')[0] ?? 'Customer',
    role: 'CUSTOMER',
    emailVerified: fbUser.emailVerified,
  };
}

function readMockUser(): AuthUser | null {
  const token = localStorage.getItem(MOCK_TOKEN_KEY);
  if (!token) return null;
  try {
    return JSON.parse(atob(token)) as AuthUser;
  } catch {
    localStorage.removeItem(MOCK_TOKEN_KEY);
    return null;
  }
}

function writeMockUser(user: AuthUser): void {
  localStorage.setItem(MOCK_TOKEN_KEY, btoa(JSON.stringify(user)));
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isFirebaseConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, fbUser => {
        setUser(fbUser ? firebaseUserToAuthUser(fbUser) : null);
        setIsLoading(false);
      });
      return unsubscribe;
    }
    setUser(readMockUser());
    setIsLoading(false);
    return undefined;
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<AuthUser> => {
    if (isFirebaseConfigured && auth) {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      const authUser = firebaseUserToAuthUser(credential.user);
      setUser(authUser);
      return authUser;
    }
    const mockUser: AuthUser = {
      id: 'mock-1',
      email,
      name: email.split('@')[0],
      role: 'CUSTOMER',
    };
    writeMockUser(mockUser);
    setUser(mockUser);
    return mockUser;
  }, []);

  const registerUser = useCallback(
    async (name: string, email: string, password: string): Promise<AuthUser> => {
      if (isFirebaseConfigured && auth) {
        const credential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(credential.user, { displayName: name });
        const authUser = { ...firebaseUserToAuthUser(credential.user), name };
        setUser(authUser);
        return authUser;
      }
      const mockUser: AuthUser = { id: 'mock-1', email, name, role: 'CUSTOMER' };
      writeMockUser(mockUser);
      setUser(mockUser);
      return mockUser;
    },
    []
  );

  const loginWithGoogle = useCallback(async (): Promise<AuthUser> => {
    if (isFirebaseConfigured && auth) {
      const credential = await signInWithPopup(auth, new GoogleAuthProvider());
      const authUser = firebaseUserToAuthUser(credential.user);
      setUser(authUser);
      return authUser;
    }
    throw new Error('Google sign-in requires Firebase configuration');
  }, []);

  const logout = useCallback(async () => {
    if (isFirebaseConfigured && auth) {
      await signOut(auth);
    }
    localStorage.removeItem(MOCK_TOKEN_KEY);
    setUser(null);
  }, []);

  return {
    user,
    isLoading,
    isAuthenticated: user !== null,
    login,
    registerUser,
    loginWithGoogle,
    logout,
  };
}

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(MOCK_TOKEN_KEY);
}

export function isAdmin(user: AuthUser | null): boolean {
  return user?.role === 'ADMIN';
}
