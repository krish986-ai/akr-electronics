'use client';

import { useState } from 'react';
import Link from 'next/link';
import { categoryTree } from '@/lib/mock/products';

export function MegaMenu() {
  const [openCategory, setOpenCategory] = useState<string | null>(null);

  return (
    <div className="hidden lg:block bg-primary-600 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center gap-1 h-11 text-sm font-medium">
          {categoryTree.map(cat => (
            <div
              key={cat.id}
              className="relative h-full"
              onMouseEnter={() => setOpenCategory(cat.id)}
              onMouseLeave={() => setOpenCategory(null)}
            >
              <Link
                href={`/products?category=${cat.slug}`}
                className="h-full px-3 flex items-center gap-1.5 hover:bg-primary-700 transition-colors whitespace-nowrap"
              >
                <span className="text-xs">{cat.icon}</span>
                {cat.name}
                {cat.children && <span className="text-[9px] opacity-70">▼</span>}
              </Link>
              {cat.children && openCategory === cat.id && (
                <div className="absolute left-0 top-full w-64 bg-white text-neutral-800 rounded-b-lg shadow-xl border border-neutral-200 py-2 z-50">
                  {cat.children.map(sub => (
                    <Link
                      key={sub.id}
                      href={`/products?category=${sub.slug}`}
                      className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-primary-50 hover:text-primary-700"
                    >
                      <span>{sub.icon}</span>
                      {sub.name}
                    </Link>
                  ))}
                  <Link
                    href={`/products?category=${cat.slug}`}
                    className="block px-4 pt-2 mt-1 border-t border-neutral-100 text-xs font-semibold text-primary-600 hover:underline"
                  >
                    View all {cat.name} →
                  </Link>
                </div>
              )}
            </div>
          ))}
          <Link
            href="/new-arrivals"
            className="ml-auto h-full px-3 flex items-center gap-1 hover:bg-primary-700 transition-colors text-amber-300 font-semibold whitespace-nowrap"
          >
            ✨ New Arrivals
          </Link>
        </nav>
      </div>
    </div>
  );
}
