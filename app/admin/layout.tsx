'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils/cn';
import { IconButton } from '@/components/ui/Button';
import { SearchInput } from '@/components/ui/Input';
import { Avatar } from '@/components/ui/Avatar';

const sidebarItems = [
  { icon: '📊', label: 'Dashboard', href: '/admin', id: 'dashboard' },
  { icon: '📋', label: 'Orders', href: '/admin/orders', id: 'orders' },
  { icon: '📦', label: 'Products', href: '/admin/products', id: 'products' },
  { icon: '🏷️', label: 'Categories', href: '/admin/categories', id: 'categories' },
  { icon: '🏢', label: 'Brands', href: '/admin/brands', id: 'brands' },
  { icon: '🖼️', label: 'Banners', href: '/admin/banners', id: 'banners' },
  { icon: '🎟️', label: 'Coupons', href: '/admin/coupons', id: 'coupons' },
  { icon: '👥', label: 'Customers', href: '/admin/customers', id: 'customers' },
  { icon: '⭐', label: 'Reviews & QnA', href: '/admin/reviews', id: 'reviews' },
  { icon: '⚙️', label: 'Settings', href: '/admin/settings', id: 'settings' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <div className='flex h-screen bg-neutral-900 text-neutral-100'>
      <aside className={cn('bg-neutral-800 border-r border-neutral-700 transition-all duration-300 overflow-hidden', sidebarOpen ? 'w-64' : 'w-20')}>
        <div className='p-4 border-b border-neutral-700'>
          <div className={cn('font-bold text-primary-400', sidebarOpen ? 'text-xl' : 'text-lg')}>{sidebarOpen ? 'A.K.R Admin' : 'AK'}</div>
        </div>
        <nav className='space-y-1 p-2'>
          {sidebarItems.map(item => (
            <a key={item.id} href={item.href} className='flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-neutral-700 text-neutral-300'>
              <span className='text-lg'>{item.icon}</span>
              {sidebarOpen && <span className='text-sm font-medium'>{item.label}</span>}
            </a>
          ))}
        </nav>
      </aside>

      <div className='flex-1 flex flex-col overflow-hidden'>
        <header className='bg-neutral-800 border-b border-neutral-700 px-6 py-4 flex items-center justify-between'>
          <div className='flex items-center gap-4 flex-1'>
            <IconButton variant='ghost' size='md' onClick={() => setSidebarOpen(!sidebarOpen)}>
              <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 20 20'>
                <path fillRule='evenodd' d='M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z' clipRule='evenodd' />
              </svg>
            </IconButton>
            <SearchInput placeholder='Search...' className='w-80' />
          </div>
          <div className='flex items-center gap-4'>
            <IconButton variant='ghost' size='md' onClick={() => setNotificationsOpen(!notificationsOpen)}>
              <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 20 20'>
                <path d='M10.893 1.416a1 1 0 00-1.786 0l-.894 3.342A2 2 0 006.46 7.04H2.819a1 1 0 00-.588 1.82l2.717 1.98a2 2 0 00.588 3.282l-.894 3.342a1 1 0 001.586 1.02l2.717-1.98a2 2 0 002.354 0l2.717 1.98a1 1 0 001.586-1.02l-.894-3.342a2 2 0 00.588-3.282l2.717-1.98a1 1 0 00-.588-1.82h-3.641a2 2 0 00-1.753-1.282l-.894-3.342z' />
              </svg>
            </IconButton>
            {notificationsOpen && (
              <div className='absolute right-6 top-16 w-80 bg-neutral-700 rounded-lg p-4 border border-neutral-600 shadow-xl'>
                <h3 className='font-semibold mb-3'>Notifications</h3>
                <div className='space-y-2'>
                  <div className='p-2 bg-neutral-600 rounded text-sm'>⚠️ Low stock: Arduino Uno</div>
                  <div className='p-2 bg-neutral-600 rounded text-sm'>📦 New order received</div>
                  <div className='p-2 bg-neutral-600 rounded text-sm'>⭐ New review pending</div>
                </div>
              </div>
            )}
            <div className='relative'>
              <button onClick={() => setProfileOpen(!profileOpen)}>
                <Avatar initials='AD' />
              </button>
              {profileOpen && (
                <div className='absolute right-0 top-12 w-48 bg-neutral-700 rounded-lg border border-neutral-600 shadow-xl'>
                  <a href='/admin/profile' className='block px-4 py-2 hover:bg-neutral-600 text-sm'>Profile</a>
                  <a href='/admin/settings' className='block px-4 py-2 hover:bg-neutral-600 text-sm'>Settings</a>
                  <button className='w-full text-left px-4 py-2 hover:bg-neutral-600 text-sm'>Logout</button>
                </div>
              )}
            </div>
          </div>
        </header>
        <main className='flex-1 overflow-auto bg-neutral-900 p-6'>{children}</main>
      </div>
    </div>
  );
}
