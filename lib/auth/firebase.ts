// Firebase Authentication Service
// Handles all Firebase auth operations

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  confirmPasswordReset,
  signInWithPopup,
  GoogleAuthProvider,
  setPersistence,
  browserLocalPersistence,
  User as FirebaseUser,
  AuthError,
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from '@/lib/firebase/config';

export class FirebaseAuthError extends Error {
  constructor(
    public code: string,
    message: string,
    public originalError?: AuthError
  ) {
    super(message);
    this.name = 'FirebaseAuthError';
  }
}

// Error message mapping
const getErrorMessage = (code: string): string => {
  const messages: Record<string, string> = {
    'auth/email-already-in-use': 'Email already registered',
    'auth/weak-password': 'Password should be at least 6 characters',
    'auth/user-not-found': 'User not found',
    'auth/wrong-password': 'Incorrect password',
    'auth/invalid-email': 'Invalid email address',
    'auth/user-disabled': 'This account has been disabled',
    'auth/too-many-requests': 'Too many login attempts. Please try again later',
    'auth/popup-closed-by-user': 'Sign-in popup was closed',
  };
  return messages[code] || 'An authentication error occurred';
};

export const firebaseAuthService = {
  // Register with email and password
  registerWithEmail: async (email: string, password: string): Promise<FirebaseUser> => {
    if (!auth) throw new FirebaseAuthError('auth/uninitialized', 'Firebase not initialized');

    try {
      await setPersistence(auth, browserLocalPersistence);
      const result = await createUserWithEmailAndPassword(auth, email, password);
      return result.user;
    } catch (error) {
      const authError = error as AuthError;
      throw new FirebaseAuthError(
        authError.code,
        getErrorMessage(authError.code),
        authError
      );
    }
  },

  // Login with email and password
  loginWithEmail: async (email: string, password: string): Promise<FirebaseUser> => {
    if (!auth) throw new FirebaseAuthError('auth/uninitialized', 'Firebase not initialized');

    try {
      await setPersistence(auth, browserLocalPersistence);
      const result = await signInWithEmailAndPassword(auth, email, password);
      return result.user;
    } catch (error) {
      const authError = error as AuthError;
      throw new FirebaseAuthError(
        authError.code,
        getErrorMessage(authError.code),
        authError
      );
    }
  },

  // Google login
  loginWithGoogle: async (): Promise<FirebaseUser> => {
    if (!auth) throw new FirebaseAuthError('auth/uninitialized', 'Firebase not initialized');

    try {
      await setPersistence(auth, browserLocalPersistence);
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, provider);
      return result.user;
    } catch (error) {
      const authError = error as AuthError;
      throw new FirebaseAuthError(
        authError.code,
        getErrorMessage(authError.code),
        authError
      );
    }
  },

  // Send password reset email
  sendPasswordReset: async (email: string): Promise<void> => {
    if (!auth) throw new FirebaseAuthError('auth/uninitialized', 'Firebase not initialized');

    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      const authError = error as AuthError;
      throw new FirebaseAuthError(
        authError.code,
        getErrorMessage(authError.code),
        authError
      );
    }
  },

  // Confirm password reset
  confirmPasswordReset: async (code: string, newPassword: string): Promise<void> => {
    if (!auth) throw new FirebaseAuthError('auth/uninitialized', 'Firebase not initialized');

    try {
      await confirmPasswordReset(auth, code, newPassword);
    } catch (error) {
      const authError = error as AuthError;
      throw new FirebaseAuthError(
        authError.code,
        getErrorMessage(authError.code),
        authError
      );
    }
  },

  // Logout
  logout: async (): Promise<void> => {
    if (!auth) throw new FirebaseAuthError('auth/uninitialized', 'Firebase not initialized');

    try {
      await signOut(auth);
    } catch (error) {
      const authError = error as AuthError;
      throw new FirebaseAuthError(
        authError.code,
        getErrorMessage(authError.code),
        authError
      );
    }
  },

  // Get current user
  getCurrentUser: (): FirebaseUser | null => {
    if (!auth) return null;
    return auth.currentUser;
  },

  // Get ID token for API requests
  getIdToken: async (): Promise<string | null> => {
    if (!auth?.currentUser) return null;
    try {
      return await auth.currentUser.getIdToken();
    } catch (error) {
      console.error('Error getting ID token:', error);
      return null;
    }
  },
};
