'use client';

import { useState } from 'react';
import Link from 'next/link';

const COLUMNS = [
  {
    title: 'Information',
    links: [
      { label: 'Track Your Order', href: '/track-order' },
      { label: 'New Arrivals', href: '/new-arrivals' },
      { label: 'Compare Products', href: '/compare' },
      { label: 'About Us', href: '/about' },
    ],
  },
  {
    title: 'My Account',
    links: [
      { label: 'My Profile', href: '/profile' },
      { label: 'My Orders', href: '/orders' },
      { label: 'Wishlist', href: '/wishlist' },
      { label: 'Cart', href: '/cart' },
    ],
  },
  {
    title: 'Services',
    links: [
      { label: 'Bulk / B2B Orders', href: '/bulk-orders' },
      { label: 'Contact Support', href: '/contact' },
    ],
  },
  {
    title: 'Policies',
    links: [
      { label: 'Privacy Policy', href: '/privacy-policy' },
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Shipping & Refund', href: '/shipping-refund' },
    ],
  },
];

export function StoreFooter() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  return (
    <footer className="bg-neutral-900 text-neutral-300 mt-16">
      <div className="border-b border-neutral-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
          <div className="md:flex-1">
            <h3 className="text-white font-semibold">Subscribe to our newsletter</h3>
            <p className="text-sm text-neutral-400">Project ideas, new launches and maker offers — no spam.</p>
          </div>
          {subscribed ? (
            <p className="text-sm text-emerald-400 font-medium">✓ Subscribed! Welcome to the maker family.</p>
          ) : (
            <form
              className="flex gap-2 w-full md:w-auto"
              onSubmit={e => {
                e.preventDefault();
                if (/.+@.+\..+/.test(email)) setSubscribed(true);
              }}
            >
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Your email address"
                className="flex-1 md:w-72 h-10 rounded-lg bg-neutral-800 border border-neutral-700 px-3 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button
                type="submit"
                className="h-10 px-4 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 transition-colors"
              >
                Subscribe
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-2 md:grid-cols-6 gap-8">
        <div className="col-span-2">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-9 h-9 rounded-lg bg-primary-600 text-white font-bold grid place-items-center">A</span>
            <span className="font-bold text-white">A.K.R Electronics</span>
          </div>
          <p className="text-sm text-neutral-400 mb-4">
            Premium IoT components and kits for India&apos;s makers, students and startups.
          </p>
          <p className="text-sm">
            <span className="block text-neutral-400">Got questions? Call us</span>
            <a href="tel:18001234567" className="text-white font-semibold hover:text-primary-400">
              1800 123 4567
            </a>
            <span className="block text-xs text-neutral-500 mt-1">Mon–Sat, 9:30 AM – 6:30 PM</span>
          </p>
        </div>

        {COLUMNS.map(col => (
          <div key={col.title}>
            <h4 className="text-white font-semibold text-sm mb-3">{col.title}</h4>
            <ul className="space-y-2">
              {col.links.map(link => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-neutral-400 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-neutral-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-neutral-500">
          <p>© {new Date().getFullYear()} A.K.R Electronics. All rights reserved.</p>
          <p>🔒 Secure payments · 🚚 Pan-India shipping · 🧾 GST invoices</p>
        </div>
      </div>
    </footer>
  );
}
