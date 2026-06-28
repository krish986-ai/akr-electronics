import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'A.K.R Electronics - Premium IoT Solutions',
  description:
    'Premium IoT components and kits for innovators and developers in India',
  keywords: ['IoT', 'Electronics', 'Arduino', 'Raspberry Pi', 'India'],
  authors: [{ name: 'A.K.R Electronics' }],
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: process.env.NEXT_PUBLIC_APP_URL,
    title: 'A.K.R Electronics',
    description: 'Premium IoT components and kits for India',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
