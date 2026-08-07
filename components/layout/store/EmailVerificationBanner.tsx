'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth/client';
import { friendlyAuthError } from '@/lib/auth/errors';
import { isCreatorEmail } from '@/lib/auth/creator';

// Non-blocking nudge — browsing, cart, and wishlist all still work
// unverified. Order placement is the one action actually gated (enforced
// server-side in app/api/orders/place/route.ts), since that's the point an
// unverified/throwaway signup would otherwise pass as a real customer.
export function EmailVerificationBanner() {
  const { user, isLoading, resendVerificationEmail, refreshEmailVerified } = useAuth();
  const [dismissed, setDismissed] = useState(false);
  const [sent, setSent] = useState(false);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState('');
  const [stillUnverified, setStillUnverified] = useState(false);

  // Creator's placeholder address can never actually receive this email —
  // same bypass as the order-placement gate and the Payments section.
  if (isLoading || !user || user.emailVerified !== false || dismissed || isCreatorEmail(user.email)) {
    return null;
  }

  const resend = async () => {
    setError('');
    try {
      await resendVerificationEmail();
      setSent(true);
    } catch (err) {
      setError(friendlyAuthError(err));
    }
  };

  const checkNow = async () => {
    setError('');
    setChecking(true);
    setStillUnverified(false);
    try {
      const verified = await refreshEmailVerified();
      if (!verified) setStillUnverified(true);
    } catch (err) {
      setError(friendlyAuthError(err));
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5 text-sm text-amber-900">
      <div className="mx-auto max-w-7xl flex flex-wrap items-center justify-between gap-2">
        <p>
          📧 Verify your email ({user.email}) to place orders.
          {sent && <span className="ml-1 font-medium">Verification link sent — check your inbox.</span>}
          {stillUnverified && <span className="ml-1 font-medium">Not verified yet — check your inbox and try again.</span>}
          {error && <span className="ml-1 text-red-700">{error}</span>}
        </p>
        <div className="flex items-center gap-3 shrink-0">
          <button onClick={resend} className="font-medium underline hover:no-underline">
            Resend email
          </button>
          <button onClick={checkNow} disabled={checking} className="font-medium underline hover:no-underline disabled:opacity-50">
            {checking ? 'Checking...' : "I've verified"}
          </button>
          <button
            onClick={() => setDismissed(true)}
            aria-label="Dismiss"
            className="text-amber-700 hover:text-amber-900"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
