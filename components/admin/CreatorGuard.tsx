import { ReactNode } from 'react';
import { useAuth } from '@/lib/auth/client';

export function CreatorGuard({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-sm text-neutral-500">Verifying access...</p>
      </div>
    );
  }

  if (!user?.email || user.email !== 'smart@gmail.com') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-4xl mb-3">🔐</p>
          <p className="font-medium text-neutral-900">Creator access only</p>
          <p className="text-sm text-neutral-500 mt-1">This section is restricted to the creator.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
