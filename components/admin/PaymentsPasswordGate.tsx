'use client';

import { FormEvent, ReactNode, useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth/client';
import { isCreatorEmail } from '@/lib/auth/creator';
import { adminMutate } from '@/lib/api/admin-client';

// Sticks per browser tab only (sessionStorage) — closing the tab re-locks
// the section. Deliberately not persisted to localStorage since this gate
// exists so a shared admin login doesn't leave payment verification open
// to whoever is at the keyboard.
const UNLOCK_KEY = 'akr-admin-payments-unlocked';

export function PaymentsPasswordGate({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const [unlocked, setUnlocked] = useState(false);
  const [password, setPassword] = useState('');
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState('');

  const isCreator = isCreatorEmail(user?.email);

  useEffect(() => {
    if (sessionStorage.getItem(UNLOCK_KEY) === '1') {
      setUnlocked(true);
    }
  }, []);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!password) {
      setError('Enter the payments section password');
      return;
    }
    setChecking(true);
    try {
      await adminMutate('/api/admin/payments/unlock', 'POST', { password });
      sessionStorage.setItem(UNLOCK_KEY, '1');
      setUnlocked(true);
      setPassword('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Incorrect password');
    } finally {
      setChecking(false);
    }
  };

  if (isLoading) {
    return <p className="p-8 text-center text-sm text-neutral-500">Verifying access...</p>;
  }

  if (isCreator || unlocked) {
    return <>{children}</>;
  }

  return (
    <div className="max-w-sm mx-auto mt-16 text-center">
      <p className="text-4xl mb-3">🔒</p>
      <h1 className="font-semibold text-neutral-900 text-lg">Payments section is locked</h1>
      <p className="text-sm text-neutral-500 mt-1 mb-6">
        Enter the payments password to verify payments and approve orders.
      </p>
      <form onSubmit={submit} className="text-left space-y-3">
        <input
          type="password"
          autoFocus
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Payments section password"
          className="w-full h-11 rounded-lg border border-neutral-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        {error && <p className="text-xs text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={checking}
          className="w-full h-11 rounded-lg bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 disabled:opacity-50"
        >
          {checking ? 'Checking...' : 'Unlock'}
        </button>
      </form>
    </div>
  );
}
