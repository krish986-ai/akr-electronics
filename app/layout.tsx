import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ServiceWorkerRegistration } from '@/components/ServiceWorkerRegistration';
import { AppBootstrap } from '@/components/native/AppBootstrap';
import { OfflineBanner } from '@/components/native/OfflineBanner';
import { PushNotifications } from '@/components/native/PushNotifications';

export const metadata: Metadata = {
  title: 'A.K.R Electronics - Premium IoT Solutions',
  description:
    'Premium IoT components and kits for innovators and developers in India',
  keywords: ['IoT', 'Electronics', 'Arduino', 'Raspberry Pi', 'India'],
  authors: [{ name: 'A.K.R Electronics' }],
  manifest: '/manifest.webmanifest',
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: process.env.NEXT_PUBLIC_APP_URL,
    title: 'A.K.R Electronics',
    description: 'Premium IoT components and kits for India',
  },
};

// Regular website visitors keep pinch-zoom (WCAG 1.4.4 requires it) — the
// Capacitor app shell locks it client-side instead (see AppBootstrap), so
// this stays a static export and every route keeps its static/ISR caching.
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#0066FF',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ServiceWorkerRegistration />
        <AppBootstrap />
        <OfflineBanner />
        <PushNotifications />
        {children}
      </body>
    </html>
  );
}
