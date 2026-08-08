'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils/cn';
import { AdminGuard } from '@/components/admin/AdminGuard';
import { useAuth } from '@/lib/auth/client';

const baseSidebarItems = [
  { icon: '📊', label: 'Dashboard', href: '/admin', id: 'dashboard' },
  { icon: '📋', label: 'Orders', href: '/admin/orders', id: 'orders' },
  { icon: '💳', label: 'Payments', href: '/admin/payments', id: 'payments' },
  { icon: '📦', label: 'Products', href: '/admin/products', id: 'products' },
  { icon: '🧰', label: 'Starter Kits', href: '/admin/starter-kits', id: 'starter-kits' },
  { icon: '🏷️', label: 'Categories', href: '/admin/categories', id: 'categories' },
  { icon: '🏢', label: 'Brands', href: '/admin/brands', id: 'brands' },
  { icon: '🖼️', label: 'Banners', href: '/admin/banners', id: 'banners' },
  { icon: '🎟️', label: 'Coupons', href: '/admin/coupons', id: 'coupons' },
  { icon: '📧', label: 'Subscriptions', href: '/admin/subscriptions', id: 'subscriptions' },
  { icon: '👥', label: 'Customers', href: '/admin/customers', id: 'customers' },
  { icon: '⭐', label: 'Reviews & QnA', href: '/admin/reviews', id: 'reviews' },
  { icon: '⚙️', label: 'Settings', href: '/admin/settings', id: 'settings' },
];

const creatorSidebarItem = { icon: '👤', label: 'Creator', href: '/admin/creator', id: 'creator' };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const { user } = useAuth();
  const isCreator = user?.email === 'smart@gmail.com';
  const sidebarItems = isCreator ? [...baseSidebarItems, creatorSidebarItem] : baseSidebarItems;

  const isActive = (href: string) =>
    href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);

  useEffect(() => {
    if (!profileOpen) return;
    const handlePointerDown = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setProfileOpen(false);
    };
    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [profileOpen]);

  return (
    <AdminGuard>
    <div className="flex h-screen bg-neutral-100 text-neutral-900">
      <aside
        className={cn(
          'bg-white border-r border-neutral-200 transition-all duration-300 overflow-y-auto shrink-0',
          sidebarOpen ? 'w-64' : 'w-20'
        )}
      >
        <div className="p-4 border-b border-neutral-200 flex items-center gap-2.5">
          <Image
            src={sidebarOpen ? '/images/logo-mark.png' : '/images/logo-icon.png'}
            alt="A.K.R Electronics"
            width={sidebarOpen ? 604 : 512}
            height={sidebarOpen ? 256 : 512}
            priority
            className="h-9 w-auto rounded-lg shadow-sm shrink-0"
          />
          {sidebarOpen && (
            <div>
              <p className="font-bold text-neutral-900 leading-tight">A.K.R Admin</p>
              <p className="text-[10px] text-neutral-500 leading-tight">Store Management</p>
            </div>
          )}
        </div>
        <nav className="space-y-1 p-2">
          {sidebarItems.map(item => (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive(item.href)
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
              )}
            >
              <span className="text-lg">{item.icon}</span>
              {sidebarOpen && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>
        <div className="p-2 mt-4 border-t border-neutral-200">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-neutral-600 hover:bg-neutral-100"
          >
            <span className="text-lg">🛍️</span>
            {sidebarOpen && <span>View Store</span>}
          </Link>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-neutral-200 px-6 h-14 flex items-center justify-between shrink-0">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-9 h-9 grid place-items-center rounded-lg text-neutral-600 hover:bg-neutral-100"
            aria-label="Toggle sidebar"
          >
            ☰
          </button>
          <div className="relative" ref={profileMenuRef}>
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-neutral-100"
            >
              <span className="w-8 h-8 rounded-full bg-primary-600 text-white text-xs font-bold grid place-items-center">
                AD
              </span>
              <span className="text-sm font-medium hidden sm:block">Admin</span>
            </button>
            {profileOpen && (
              <div className="absolute right-0 top-12 w-48 bg-white rounded-lg border border-neutral-200 shadow-lg py-1 z-50">
                <Link href="/admin/settings" className="block px-4 py-2 hover:bg-neutral-50 text-sm">
                  Settings
                </Link>
                <Link href="/" className="block px-4 py-2 hover:bg-neutral-50 text-sm">
                  View Store
                </Link>
                <button className="w-full text-left px-4 py-2 hover:bg-neutral-50 text-sm text-red-600 border-t border-neutral-100">
                  Logout
                </button>
              </div>
            )}
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
    </AdminGuard>
  );
}
