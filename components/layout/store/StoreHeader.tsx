'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/client';

const SEARCH_SUGGESTIONS = ['Arduino Uno R3', 'ESP32', 'Raspberry Pi 4', 'how to build a robot'];

export function StoreHeader() {
  const router = useRouter();
  const { isAuthenticated, user, logout } = useAuth();
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const submitSearch = (term: string) => {
    setShowSuggestions(false);
    if (term.trim()) {
      router.push(`/products?search=${encodeURIComponent(term.trim())}`);
    }
  };

  return (
    <header className="bg-white border-b border-neutral-200 sticky top-0 z-40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 h-16">
          <button
            className="lg:hidden text-2xl"
            aria-label="Open menu"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            ☰
          </button>

          <Link href="/" className="flex items-center gap-2 shrink-0">
            <span className="w-9 h-9 rounded-lg bg-primary-600 text-white font-bold grid place-items-center">
              A
            </span>
            <span className="hidden sm:block">
              <span className="block font-bold text-neutral-900 leading-tight">A.K.R Electronics</span>
              <span className="block text-[10px] text-neutral-500 leading-tight">IoT Components & Kits</span>
            </span>
          </Link>

          <div className="relative flex-1 max-w-2xl hidden sm:block">
            <form
              onSubmit={e => {
                e.preventDefault();
                submitSearch(query);
              }}
            >
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                placeholder="Search products, e.g. ESP32, ultrasonic sensor..."
                className="w-full h-10 rounded-lg border border-neutral-300 pl-4 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
              <button
                type="submit"
                aria-label="Search"
                className="absolute right-0 top-0 h-10 w-11 grid place-items-center text-neutral-500 hover:text-primary-600"
              >
                🔍
              </button>
            </form>
            {showSuggestions && (
              <div className="absolute top-11 inset-x-0 bg-white border border-neutral-200 rounded-lg shadow-lg overflow-hidden">
                <p className="px-4 pt-2 pb-1 text-[10px] uppercase tracking-wide text-neutral-400">
                  Popular searches
                </p>
                {SEARCH_SUGGESTIONS.map(s => (
                  <button
                    key={s}
                    type="button"
                    onMouseDown={() => submitSearch(s)}
                    className="block w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          <nav className="ml-auto flex items-center gap-1 sm:gap-2">
            <HeaderIcon href="/compare" label="Compare" icon="⇄" />
            <HeaderIcon href="/track-order" label="Track" icon="📦" />
            <HeaderIcon href="/wishlist" label="Wishlist" icon="♡" />
            <HeaderIcon href="/cart" label="Cart" icon="🛒" />

            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex flex-col items-center px-2 py-1 rounded-md text-neutral-600 hover:text-primary-600 hover:bg-neutral-50"
                >
                  <span className="text-lg leading-none">👤</span>
                  <span className="hidden sm:block text-[10px] mt-0.5">{user?.name?.split(' ')[0] || 'Account'}</span>
                </button>
                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-neutral-200 rounded-lg shadow-lg z-50 py-1">
                    <MenuLink href="/profile" label="My Profile" onNavigate={() => setProfileOpen(false)} />
                    <MenuLink href="/orders" label="My Orders" onNavigate={() => setProfileOpen(false)} />
                    <MenuLink href="/wishlist" label="Wishlist" onNavigate={() => setProfileOpen(false)} />
                    <button
                      onClick={() => {
                        logout();
                        setProfileOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-neutral-50 border-t border-neutral-100"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 ml-1">
                <Link
                  href="/auth/login"
                  className="text-sm font-medium text-neutral-700 hover:text-primary-600 px-2 py-1.5"
                >
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  className="hidden sm:block text-sm font-medium bg-primary-600 text-white px-3 py-1.5 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </nav>
        </div>

        <div className="sm:hidden pb-3">
          <form
            onSubmit={e => {
              e.preventDefault();
              submitSearch(query);
            }}
          >
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full h-9 rounded-lg border border-neutral-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </form>
        </div>
      </div>

      {mobileOpen && (
        <div className="lg:hidden border-t border-neutral-200 bg-white px-4 py-3 space-y-1">
          {[
            { href: '/', label: 'Home' },
            { href: '/products', label: 'All Products' },
            { href: '/new-arrivals', label: 'New Arrivals' },
            { href: '/track-order', label: 'Track Order' },
            { href: '/bulk-orders', label: 'Bulk Orders' },
            { href: '/about', label: 'About Us' },
            { href: '/contact', label: 'Contact' },
          ].map(item => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className="block px-2 py-2 text-sm font-medium text-neutral-700 hover:text-primary-600 hover:bg-neutral-50 rounded-md"
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}

function HeaderIcon({ href, label, icon }: { href: string; label: string; icon: string }) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center px-2 py-1 rounded-md text-neutral-600 hover:text-primary-600 hover:bg-neutral-50"
    >
      <span className="text-lg leading-none">{icon}</span>
      <span className="hidden sm:block text-[10px] mt-0.5">{label}</span>
    </Link>
  );
}

function MenuLink({ href, label, onNavigate }: { href: string; label: string; onNavigate: () => void }) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className="block px-4 py-2 text-sm text-neutral-800 hover:bg-neutral-50"
    >
      {label}
    </Link>
  );
}
