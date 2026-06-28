'use client';

import { useCallback, useEffect, useState } from 'react';
import { AuthUser } from './types';

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize auth state from localStorage
  useEffect(() => {
    const token = localStorage.getItem('auth-token');
    if (token) {
      try {
        // Decode simple JWT-like token
        const userData = JSON.parse(atob(token));
        setUser(userData);
        setIsAuthenticated(true);
      } catch (error) {
        localStorage.removeItem('auth-token');
      }
    }
    setIsLoading(false);
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      localStorage.removeItem('auth-token');
      setUser(null);
      setIsAuthenticated(false);
    }
  }, []);

  return {
    user,
    isLoading,
    isAuthenticated,
    logout,
  };
}

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth-token');
}

export function isAdmin(user: AuthUser | null): boolean {
  return user?.role === 'ADMIN';
}
