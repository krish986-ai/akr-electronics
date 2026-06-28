'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth/client';
import { isAdmin } from '@/lib/auth/client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, user, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated || !isAdmin(user)) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || !isAdmin(user)) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white">
        <div className="p-6">
          <h1 className="text-2xl font-bold">A.K.R Admin</h1>
        </div>

        <nav className="mt-8 space-y-1">
          <Link
            href="/admin/dashboard"
            className="block px-6 py-3 hover:bg-gray-800"
          >
            Dashboard
          </Link>
          <Link
            href="/admin/products"
            className="block px-6 py-3 hover:bg-gray-800"
          >
            Products
          </Link>
          <Link
            href="/admin/orders"
            className="block px-6 py-3 hover:bg-gray-800"
          >
            Orders
          </Link>
          <Link
            href="/admin/users"
            className="block px-6 py-3 hover:bg-gray-800"
          >
            Users
          </Link>
          <Link
            href="/admin/settings"
            className="block px-6 py-3 hover:bg-gray-800"
          >
            Settings
          </Link>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 w-64 p-6 border-t border-gray-800">
          <p className="text-sm mb-2">{user?.name}</p>
          <button
            onClick={() => logout()}
            className="text-sm text-gray-400 hover:text-white"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900">
              Welcome, {user?.name}!
            </h2>
          </div>
        </div>

        <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
