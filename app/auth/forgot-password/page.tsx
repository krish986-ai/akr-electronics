'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { passwordResetRequestSchema, type PasswordResetRequestInput } from '@/lib/auth/validation';
import { useAuth } from '@/lib/auth/client';
import { friendlyAuthError } from '@/lib/auth/errors';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';

export default function ForgotPasswordPage() {
  const { sendPasswordReset } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PasswordResetRequestInput>({
    resolver: zodResolver(passwordResetRequestSchema),
  });

  const onSubmit = async (data: PasswordResetRequestInput) => {
    try {
      setIsLoading(true);
      setError(null);
      await sendPasswordReset(data.email);
      setSent(true);
    } catch (err) {
      // Firebase's own 'auth/user-not-found' message is intentionally not
      // surfaced here — doing so would let this form be used to check
      // whether an email is registered. Show the same success state either
      // way; only real failures (network, config) get an error.
      const code = err && typeof err === 'object' && 'code' in err ? String(err.code) : '';
      if (code === 'auth/user-not-found' || code === 'auth/invalid-email') {
        setSent(true);
        return;
      }
      setError(friendlyAuthError(err));
    } finally {
      setIsLoading(false);
    }
  };

  if (sent) {
    return (
      <AuthLayout title="Check your email" description="Password reset link sent">
        <Alert variant="success">
          If an account exists for that email, we&apos;ve sent a link to reset the password. It may take a
          few minutes to arrive — check your spam folder too.
        </Alert>
        <div className="mt-6 text-center text-sm text-neutral-600">
          <Link href="/auth/login" className="text-primary-600 font-medium hover:text-primary-700">
            Back to login
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Forgot password?"
      description="Enter your account email and we'll send you a reset link"
    >
      {error && <Alert variant="error" className="mb-6">{error}</Alert>}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2 text-neutral-900">Email</label>
          <Input
            {...register('email')}
            type="email"
            placeholder="you@example.com"
            disabled={isLoading}
            autoFocus
          />
          {errors.email && (
            <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>

        <Button type="submit" fullWidth size="lg" disabled={isLoading}>
          {isLoading ? 'Sending...' : 'Send reset link'}
        </Button>
      </form>

      <div className="mt-6 text-center text-sm text-neutral-600">
        <Link href="/auth/login" className="text-primary-600 font-medium hover:text-primary-700">
          Back to login
        </Link>
      </div>
    </AuthLayout>
  );
}
