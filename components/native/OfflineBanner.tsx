'use client';

import { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { Banner } from '@/components/ui/Alert';

export function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      let listenerHandle: { remove: () => void } | undefined;
      let cancelled = false;

      import('@capacitor/network').then(async ({ Network }) => {
        const status = await Network.getStatus();
        if (cancelled) return;
        setIsOffline(!status.connected);

        listenerHandle = await Network.addListener('networkStatusChange', status => {
          setIsOffline(!status.connected);
        });
      });

      return () => {
        cancelled = true;
        listenerHandle?.remove();
      };
    }

    setIsOffline(!navigator.onLine);
    const goOnline = () => setIsOffline(false);
    const goOffline = () => setIsOffline(true);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <Banner
      variant="warning"
      className="fixed top-0 left-0 right-0 z-notification [padding-top:calc(env(safe-area-inset-top)+0.75rem)]"
    >
      You&apos;re offline — showing saved content only. Cart, wishlist, and checkout need a
      connection.
    </Banner>
  );
}
