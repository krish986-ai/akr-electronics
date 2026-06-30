'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils/cn';
import { IconButton } from '@/components/ui/Button';
import { container } from '@/lib/design/utils';

export type NavbarProps = {
  logo?: React.ReactNode;
  brand?: string;
  items?: { label: string; href: string }[];
  actions?: React.ReactNode;
  sticky?: boolean;
};


export function Navbar({ logo, brand, items, actions, sticky = true }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav
      className={cn(
        'bg-white border-b border-neutral-200',
        sticky && 'sticky top-0 z-40'
      )}
    >
      <div className={cn(container, 'flex items-center justify-between h-16')}>
        <div className="flex items-center gap-8">
          {logo || (
            <div className="font-bold text-lg text-neutral-900">
              {brand || 'A.K.R Electronics'}
            </div>
          )}
          <div className="hidden md:flex gap-1">
            {items?.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="px-3 py-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors rounded-md hover:bg-neutral-100"
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>

        <div className="hidden md:flex items-center gap-4">
          {actions}
        </div>

        <div className="md:hidden">
          <IconButton
            variant="ghost"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </IconButton>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-neutral-200 bg-neutral-50">
          <div className={cn(container, 'py-4 space-y-2')}>
            {items?.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="block px-3 py-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-md transition-colors"
              >
                {item.label}
              </a>
            ))}
            {actions && <div className="pt-4 border-t border-neutral-200">{actions}</div>}
          </div>
        </div>
      )}
    </nav>
  );
}
