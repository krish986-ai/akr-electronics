import React from 'react';
import { cn } from '@/lib/utils/cn';
import { Navbar, type NavbarProps } from './Navbar';
import { Footer, type FooterProps } from './Footer';

interface MainLayoutProps {
  children: React.ReactNode;
  navbar?: NavbarProps;
  footer?: FooterProps;
  className?: string;
}

export function MainLayout({
  children,
  navbar,
  footer,
  className,
}: MainLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {navbar && <Navbar {...navbar} />}
      <main className={cn('flex-1', className)}>
        {children}
      </main>
      {footer && <Footer {...footer} />}
    </div>
  );
}
