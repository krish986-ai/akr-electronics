'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/lib/auth/client';

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, user, logout } = useAuth();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const navItems = [
    { label: 'Home', href: '/' },
    { label: 'Products', href: '/products' },
    { label: 'Shop', href: '/shop' },
  ];

  const footerColumns = [
    {
      title: 'About',
      links: [
        { label: 'About Us', href: '/about' },
        { label: 'Blog', href: '/blog' },
        { label: 'Careers', href: '/careers' },
      ],
    },
    {
      title: 'Support',
      links: [
        { label: 'Contact Us', href: '/contact' },
        { label: 'FAQ', href: '/faq' },
        { label: 'Shipping Info', href: '/shipping' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { label: 'Privacy Policy', href: '/privacy' },
        { label: 'Terms & Conditions', href: '/terms' },
        { label: 'Return Policy', href: '/returns' },
      ],
    },
    {
      title: 'Follow Us',
      links: [
        { label: 'Facebook', href: 'https://facebook.com' },
        { label: 'Twitter', href: 'https://twitter.com' },
        { label: 'Instagram', href: 'https://instagram.com' },
      ],
    },
  ];

  return (
    <>
      <Navbar
        brand="A.K.R Electronics"
        items={navItems}
        actions={
          <div className="flex items-center gap-3">
            <Link href="/cart">
              <Button variant="ghost" size="sm">
                🛒 Cart
              </Button>
            </Link>
            <Link href="/wishlist">
              <Button variant="ghost" size="sm">
                ♥ Wishlist
              </Button>
            </Link>
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="px-3 py-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-md transition-colors flex items-center gap-2"
                >
                  👤 {user?.name || 'Account'}
                </button>
                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-neutral-200 rounded-lg shadow-lg z-50">
                    <Link href="/profile" className="block px-4 py-2 text-sm text-neutral-900 hover:bg-neutral-50">
                      My Profile
                    </Link>
                    <Link href="/orders" className="block px-4 py-2 text-sm text-neutral-900 hover:bg-neutral-50">
                      My Orders
                    </Link>
                    <Link href="/addresses" className="block px-4 py-2 text-sm text-neutral-900 hover:bg-neutral-50">
                      Addresses
                    </Link>
                    <Link href="/settings" className="block px-4 py-2 text-sm text-neutral-900 hover:bg-neutral-50">
                      Settings
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setIsProfileMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-neutral-50 border-t border-neutral-200"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="outline" size="sm">
                    Login
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button size="sm">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>
        }
      />

      <main>{children}</main>

      <Footer columns={footerColumns} />
    </>
  );
}
