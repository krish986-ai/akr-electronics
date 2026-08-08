'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/client';
import { useCartStore, cartCount } from '@/lib/stores/cart';
import { categoryTree as fallbackCategoryTree, CategoryNode } from '@/lib/mock/products';
import { safeImageSrc } from '@/lib/utils/image';

const SEARCH_SUGGESTIONS = ['Arduino Uno R3', 'ESP32', 'Raspberry Pi 4', 'how to build a robot'];

const UTILITY_LINKS = [
  { href: '/new-arrivals', label: 'New Arrivals' },
  { href: '/track-order', label: 'Track Order' },
  { href: '/bulk-orders', label: 'Bulk Orders' },
  { href: '/about', label: 'About Us' },
  { href: '/contact', label: 'Contact' },
];

interface Partnership {
  id: string;
  name: string;
  logo: string;
  link: string;
}

export function StoreHeader({ categories }: { categories: CategoryNode[] }) {
  const router = useRouter();
  const { isAuthenticated, user, logout } = useAuth();
  const items = useCartStore(state => state.items);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const count = mounted ? cartCount(items) : 0;
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [partner, setPartner] = useState<Partnership | null>(null);
  const categoryTree = categories.length > 0 ? categories : fallbackCategoryTree;

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

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

  useEffect(() => {
    const loadPartner = async () => {
      try {
        const res = await fetch('/api/partnerships', {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-store, max-age=0',
          },
        });
        const data = await res.json();
        if (res.ok && data.partnerships && data.partnerships.length > 0) {
          setPartner(data.partnerships[0]);
        } else {
          setPartner(null);
        }
      } catch {
        setPartner(null);
      }
    };

    loadPartner();
  }, []);

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

          <div className="flex items-center gap-2.5 shrink-0 relative">
            <Link href="/" className="flex items-center gap-2.5">
              {/* AKR Logo - always shown */}
              <Image
                src="/images/logo-mark.png"
                alt="A.K.R Electronics"
                width={604}
                height={256}
                priority
                className="h-9 w-auto rounded-lg shadow-sm"
              />
            </Link>

            {/* Text and Partner Section */}
            <div className="hidden sm:block">
              {/* PARTNER ACTIVE: Show only partner branding with animation */}
              {partner && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    window.open(partner.link, '_blank');
                  }}
                  className="transition-all duration-700 ease-in-out animate-in fade-in slide-in-from-bottom-2 hover:opacity-80 cursor-pointer flex items-center gap-2.5"
                >
                  {/* Partner Logo - animated pulse */}
                  <div className="relative">
                    <div className="relative w-7 h-7 rounded-lg overflow-hidden border-2 border-primary-300 flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-primary-50 to-white shadow-md">
                      <Image
                        src={safeImageSrc(partner.logo)}
                        alt={partner.name}
                        fill
                        sizes="28px"
                        className="object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                    {/* Glow effect */}
                    <div className="absolute inset-0 rounded-lg bg-primary-400 opacity-0 blur-md -z-10 animate-pulse"></div>
                  </div>

                  {/* Partner Info */}
                  <div>
                    <p className="font-bold text-neutral-900 leading-tight text-sm">{partner.name}</p>
                    <p className="text-[10px] text-primary-600 font-semibold leading-tight">
                      Featured Partner ✨
                    </p>
                  </div>
                </button>
              )}

              {/* NO PARTNER: Show AKR branding (default) */}
              {!partner && (
                <Link href="/" className="transition-all duration-700 ease-in-out animate-in fade-in slide-in-from-bottom-2">
                  <span className="block font-bold text-neutral-900 leading-tight">A.K.R Electronics</span>
                  <span className="block text-[10px] text-neutral-500 leading-tight">IoT Components & Kits</span>
                </Link>
              )}
            </div>
          </div>

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
            <Link
              href="/cart"
              className="relative flex flex-col items-center px-2 py-1 rounded-md text-neutral-600 hover:text-primary-600 hover:bg-neutral-50"
            >
              <span className="text-lg leading-none">🛒</span>
              <span className="hidden sm:block text-[10px] mt-0.5">Cart</span>
              {count > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 grid place-items-center rounded-full bg-primary-600 text-white text-[10px] font-bold">
                  {count > 99 ? '99+' : count}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <div className="relative" ref={profileMenuRef}>
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

      <div
        className={`lg:hidden fixed inset-0 z-50 bg-black/50 transition-opacity duration-300 ${
          mobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
      />

      <div
        className={`lg:hidden fixed inset-y-0 left-0 z-50 w-[85%] max-w-sm bg-white shadow-xl transition-transform duration-300 ease-out flex flex-col ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
      >
        <div className="flex items-center justify-between h-14 px-4 border-b border-neutral-200 shrink-0">
          <span className="font-bold text-neutral-900">Menu</span>
          <button
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
            className="w-9 h-9 grid place-items-center rounded-md text-neutral-500 hover:bg-neutral-100 text-lg"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain">
          <div className="p-3 border-b border-neutral-100">
            {isAuthenticated ? (
              <div className="flex items-center gap-3 px-2 py-2">
                <span className="text-2xl">👤</span>
                <div>
                  <p className="text-sm font-semibold text-neutral-900">{user?.name || 'My Account'}</p>
                  <Link
                    href="/profile"
                    onClick={() => setMobileOpen(false)}
                    className="text-xs text-primary-600 hover:underline"
                  >
                    View profile
                  </Link>
                </div>
              </div>
            ) : (
              <div className="flex gap-2 p-1">
                <Link
                  href="/auth/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 h-10 grid place-items-center rounded-lg border border-neutral-300 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
                >
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 h-10 grid place-items-center rounded-lg bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          <nav className="py-2">
            <Link
              href="/"
              onClick={() => setMobileOpen(false)}
              className="block px-4 py-3 text-sm font-semibold text-neutral-900 hover:bg-neutral-50"
            >
              Home
            </Link>
            <Link
              href="/products"
              onClick={() => setMobileOpen(false)}
              className="block px-4 py-3 text-sm font-semibold text-neutral-900 hover:bg-neutral-50"
            >
              All Products
            </Link>

            <p className="px-4 pt-3 pb-1 text-[11px] font-semibold uppercase tracking-wide text-neutral-400">
              Shop by Category
            </p>
            {categoryTree.map(cat => {
              const isExpanded = expandedCategory === cat.id;
              return (
                <div key={cat.id} className="border-b border-neutral-50 last:border-b-0">
                  <div className="flex items-center">
                    <Link
                      href={`/products?category=${cat.slug}`}
                      onClick={() => setMobileOpen(false)}
                      className="flex-1 flex items-center gap-2.5 px-4 py-3 text-sm font-medium text-neutral-700 active:bg-neutral-50"
                    >
                      <span className="text-base">{cat.icon}</span>
                      {cat.name}
                    </Link>
                    {cat.children && cat.children.length > 0 && (
                      <button
                        type="button"
                        aria-label={isExpanded ? `Collapse ${cat.name}` : `Expand ${cat.name}`}
                        aria-expanded={isExpanded}
                        onClick={() => setExpandedCategory(isExpanded ? null : cat.id)}
                        className="w-11 h-11 grid place-items-center text-neutral-400 shrink-0"
                      >
                        <span
                          className={`inline-block text-xs transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                        >
                          ▼
                        </span>
                      </button>
                    )}
                  </div>
                  {cat.children && cat.children.length > 0 && isExpanded && (
                    <div className="pb-1 bg-neutral-50/60">
                      {cat.children.map(sub => (
                        <Link
                          key={sub.id}
                          href={`/products?category=${sub.slug}`}
                          onClick={() => setMobileOpen(false)}
                          className="flex items-center gap-2.5 pl-10 pr-4 py-2.5 text-sm text-neutral-600 active:bg-neutral-100"
                        >
                          <span className="text-sm">{sub.icon}</span>
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            <div className="mt-2 pt-2 border-t border-neutral-100">
              {UTILITY_LINKS.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 py-2.5 text-sm text-neutral-600 hover:bg-neutral-50"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>
        </div>
      </div>
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
