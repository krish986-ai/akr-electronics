'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface StoreConfig {
  supportPhone: string;
  supportEmail: string;
}

const DEFAULT_CONFIG: StoreConfig = {
  supportPhone: '1800 123 4567',
  supportEmail: 'support@akrelectronics.com',
};

export function TopBar() {
  const [config, setConfig] = useState<StoreConfig>(DEFAULT_CONFIG);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        console.log('[TopBar] Loading store config from public API...');
        const res = await fetch('/api/public/settings', {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-store, max-age=0',
          },
        });
        const data = await res.json();
        console.log('[TopBar] Config loaded:', data);

        if (res.ok && data.supportPhone && data.supportEmail) {
          setConfig({
            supportPhone: data.supportPhone,
            supportEmail: data.supportEmail,
          });
        }
      } catch (e) {
        console.error('[TopBar] Error loading config:', e);
      }
    };

    loadConfig();
  }, []);

  return (
    <div className="hidden md:block bg-neutral-50 border-b border-neutral-200 text-xs text-neutral-600">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between h-8">
        <div className="flex items-center gap-4">
          <a href={`tel:${config.supportPhone.replace(/\D/g, '')}`} className="hover:text-primary-600 transition-colors">
            📞 {config.supportPhone}
          </a>
          <a href={`mailto:${config.supportEmail}`} className="hover:text-primary-600 transition-colors">
            ✉️ {config.supportEmail}
          </a>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/track-order" className="hover:text-primary-600 transition-colors">
            Track Your Order
          </Link>
          <Link href="/bulk-orders" className="hover:text-primary-600 transition-colors">
            Bulk / B2B Orders
          </Link>
        </div>
      </div>
    </div>
  );
}
