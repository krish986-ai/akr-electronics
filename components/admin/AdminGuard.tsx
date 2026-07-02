'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db, isFirebaseConfigured } from '@/lib/firebase/config';

type GuardState = 'checking' | 'unauthenticated' | 'forbidden' | 'allowed';

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<GuardState>('checking');

  useEffect(() => {
    if (!isFirebaseConfigured || !auth || !db) {
      // Mock mode (no Firebase credentials): allow access for local development
      setState('allowed');
      return;
    }
    const firestore = db;
    const unsubscribe = onAuthStateChanged(auth, async user => {
      if (!user) {
        setState('unauthenticated');
        return;
      }
      try {
        const profile = await getDoc(doc(firestore, 'users', user.uid));
        setState(profile.data()?.role === 'ADMIN' ? 'allowed' : 'forbidden');
      } catch {
        setState('forbidden');
      }
    });
    return unsubscribe;
  }, []);

  if (state === 'checking') {
    return (
      <div className="min-h-screen grid place-items-center bg-neutral-100">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-neutral-500 mt-3">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (state === 'unauthenticated') {
    return (
      <GuardMessage
        icon="🔐"
        title="Admin sign-in required"
        body="Sign in with your admin account to access the store dashboard."
        cta={{ href: '/auth/login?next=/admin', label: 'Sign In' }}
      />
    );
  }

  if (state === 'forbidden') {
    return (
      <GuardMessage
        icon="⛔"
        title="Access denied"
        body="Your account does not have admin permissions for this store."
        cta={{ href: '/', label: 'Back to Store' }}
      />
    );
  }

  return <>{children}</>;
}

function GuardMessage({
  icon,
  title,
  body,
  cta,
}: {
  icon: string;
  title: string;
  body: string;
  cta: { href: string; label: string };
}) {
  return (
    <div className="min-h-screen grid place-items-center bg-neutral-100 px-4">
      <div className="bg-white border border-neutral-200 rounded-2xl p-10 text-center max-w-sm">
        <p className="text-5xl mb-4">{icon}</p>
        <h1 className="text-xl font-bold text-neutral-900 mb-2">{title}</h1>
        <p className="text-sm text-neutral-500 mb-6">{body}</p>
        <Link
          href={cta.href}
          className="inline-block bg-primary-600 text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-primary-700"
        >
          {cta.label}
        </Link>
      </div>
    </div>
  );
}
