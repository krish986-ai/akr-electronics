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
  sendPasswordResetEmail,
  sendEmailVerification,
  User as FirebaseUser,
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from '@/lib/firebase/config';
import { AuthUser } from './types';
import { createUserProfile, ensureUserProfile, type UserProfileInput } from './profile';

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
      await ensureUserProfile(authUser.id, authUser.name, authUser.email);
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
    async (profile: UserProfileInput, password: string): Promise<AuthUser> => {
      if (isFirebaseConfigured && auth) {
        const credential = await createUserWithEmailAndPassword(auth, profile.email, password);
        await updateProfile(credential.user, { displayName: profile.name });
        await createUserProfile(credential.user.uid, profile);
        // Best-effort — a delivery hiccup here shouldn't block account creation;
        // the "verify your email" banner + resend button covers this case.
        await sendEmailVerification(credential.user).catch(err => {
          console.error('Failed to send verification email', err);
        });
        const authUser = { ...firebaseUserToAuthUser(credential.user), name: profile.name };
        setUser(authUser);
        return authUser;
      }
      const mockUser: AuthUser = { id: 'mock-1', email: profile.email, name: profile.name, role: 'CUSTOMER' };
      await createUserProfile(mockUser.id, profile);
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
      await ensureUserProfile(authUser.id, authUser.name, authUser.email);
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

  const sendPasswordReset = useCallback(async (email: string): Promise<void> => {
    if (!isFirebaseConfigured || !auth) {
      throw new Error('Password reset requires Firebase configuration');
    }
    await sendPasswordResetEmail(auth, email);
  }, []);

  const resendVerificationEmail = useCallback(async (): Promise<void> => {
    if (!isFirebaseConfigured || !auth?.currentUser) {
      throw new Error('You need to be signed in to resend a verification email');
    }
    await sendEmailVerification(auth.currentUser);
  }, []);

  // Firebase only learns a link was clicked once the ID token is refreshed
  // — onAuthStateChanged doesn't refire for that on its own. Call this after
  // asking the user to check whether they've verified.
  const refreshEmailVerified = useCallback(async (): Promise<boolean> => {
    if (!isFirebaseConfigured || !auth?.currentUser) return false;
    await auth.currentUser.reload();
    const verified = auth.currentUser.emailVerified;
    if (verified) {
      setUser(firebaseUserToAuthUser(auth.currentUser));
    }
    return verified;
  }, []);

  return {
    user,
    isLoading,
    isAuthenticated: user !== null,
    login,
    registerUser,
    loginWithGoogle,
    logout,
    sendPasswordReset,
    resendVerificationEmail,
    refreshEmailVerified,
  };
}

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(MOCK_TOKEN_KEY);
}

export function isAdmin(user: AuthUser | null): boolean {
  return user?.role === 'ADMIN';
}
