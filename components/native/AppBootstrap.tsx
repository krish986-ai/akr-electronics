'use client';

import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import type { PluginListenerHandle } from '@capacitor/core';

export function AppBootstrap() {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    let cancelled = false;
    let backListener: PluginListenerHandle | undefined;

    (async () => {
      const [{ App }, { SplashScreen }] = await Promise.all([
        import('@capacitor/app'),
        import('@capacitor/splash-screen'),
      ]);
      if (cancelled) return;

      SplashScreen.hide();

      backListener = await App.addListener('backButton', ({ canGoBack }) => {
        if (canGoBack) {
          window.history.back();
        } else {
          App.exitApp();
        }
      });
    })();

    return () => {
      cancelled = true;
      backListener?.remove();
    };
  }, []);

  return null;
}
