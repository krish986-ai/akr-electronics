'use client';

import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import type { PluginListenerHandle } from '@capacitor/core';

export function AppBootstrap() {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    // Lock pinch-zoom only inside the app shell — the website keeps it for
    // accessibility (WCAG 1.4.4), so this can't be a static viewport export.
    const viewportMeta = document.querySelector('meta[name="viewport"]');
    if (viewportMeta) {
      viewportMeta.setAttribute(
        'content',
        'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover'
      );
    }

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
