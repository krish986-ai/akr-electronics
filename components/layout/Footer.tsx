import React from 'react';
import { cn } from '@/lib/utils/cn';
import { container } from '@/lib/design/utils';

export type FooterProps = {
  columns?: { title: string; links: { label: string; href: string }[] }[];
  copyright?: string;
  social?: { icon: React.ReactNode; href: string }[];
};

export function Footer({ columns, copyright, social }: FooterProps) {
  return (
    <footer className="bg-neutral-900 text-neutral-400 mt-20">
      <div className={cn(container, 'py-12')}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {columns?.map((column) => (
            <div key={column.title}>
              <h3 className="font-semibold text-white mb-4">{column.title}</h3>
              <ul className="space-y-2">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className="hover:text-white transition-colors text-sm"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-neutral-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm">{copyright || '© 2026 A.K.R Electronics. All rights reserved.'}</p>
          {social && (
            <div className="flex gap-4">
              {social.map((item, i) => (
                <a
                  key={i}
                  href={item.href}
                  className="text-neutral-400 hover:text-white transition-colors"
                >
                  {item.icon}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}
