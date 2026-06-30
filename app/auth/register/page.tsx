'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, type RegisterInput } from '@/lib/auth/validation';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterInput) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.email,
          name: data.name,
          password: data.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Registration failed');
      }

      localStorage.setItem('auth-token', result.token);
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout title="Create Account" description="Join A.K.R Electronics">
      {error && <Alert variant="error" className="mb-6">{error}</Alert>}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2 text-neutral-900">Full Name</label>
          <Input
            {...register('name')}
            type="text"
            placeholder="John Doe"
            disabled={isLoading}
          />
          {errors.name && (
            <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-neutral-900">Email</label>
          <Input
            {...register('email')}
            type="email"
            placeholder="you@example.com"
            disabled={isLoading}
          />
          {errors.email && (
            <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-neutral-900">Password</label>
          <Input
            {...register('password')}
            type="password"
            placeholder="••••••••"
            disabled={isLoading}
          />
          {errors.password && (
            <p className="text-red-600 text-sm mt-1">{errors.password.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-neutral-900">Confirm Password</label>
          <Input
            {...register('confirmPassword')}
            type="password"
            placeholder="••••••••"
            disabled={isLoading}
          />
          {errors.confirmPassword && (
            <p className="text-red-600 text-sm mt-1">{errors.confirmPassword.message}</p>
          )}
        </div>

        <Button type="submit" fullWidth size="lg" disabled={isLoading}>
          {isLoading ? 'Creating account...' : 'Create Account'}
        </Button>
      </form>

      <div className="mt-6 text-center text-sm text-neutral-600">
        Already have an account?{' '}
        <Link href="/auth/login" className="text-primary-600 font-medium hover:text-primary-700">
          Sign in
        </Link>
      </div>

      <div className="mt-4 pt-4 border-t border-neutral-200 text-center text-sm text-neutral-600">
        <Link href="/" className="text-primary-600 hover:text-primary-700">
          Back to home
        </Link>
      </div>
    </AuthLayout>
  );
}
