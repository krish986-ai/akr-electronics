'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginInput } from '@/lib/auth/validation';
import { useAuth } from '@/lib/auth/client';
import { friendlyAuthError } from '@/lib/auth/errors';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    try {
      setIsLoading(true);
      setError(null);
      await login(data.email, data.password);
      router.push('/');
    } catch (err) {
      setError(friendlyAuthError(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout title="Login" description="Sign in to your account">
      {error && <Alert variant="error" className="mb-6">{error}</Alert>}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

        <Button type="submit" fullWidth size="lg" disabled={isLoading}>
          {isLoading ? 'Logging in...' : 'Login'}
        </Button>
      </form>

      <div className="mt-6 text-center text-sm text-neutral-600">
        Don&apos;t have an account?{' '}
        <Link href="/auth/register" className="text-primary-600 font-medium hover:text-primary-700">
          Create one
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
