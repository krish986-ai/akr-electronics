'use client';

import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import type { PluginListenerHandle } from '@capacitor/core';
import { useAuth } from '@/lib/auth/client';

export function PushNotifications() {
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!Capacitor.isNativePlatform() || !isAuthenticated || !user) return;

    let cancelled = false;
    let registrationListener: PluginListenerHandle | undefined;

    (async () => {
      const { PushNotifications: Push } = await import('@capacitor/push-notifications');
      if (cancelled) return;

      const permission = await Push.checkPermissions();
      const granted =
        permission.receive === 'granted' ||
        (await Push.requestPermissions()).receive === 'granted';
      if (!granted || cancelled) return;

      registrationListener = await Push.addListener('registration', token => {
        fetch('/api/notifications/register-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-user-id': user.id },
          body: JSON.stringify({ token: token.value, platform: 'android' }),
        }).catch(() => {});
      });

      await Push.register();
    })();

    return () => {
      cancelled = true;
      registrationListener?.remove();
    };
  }, [isAuthenticated, user]);

  return null;
}
