'use client';

import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import type { PluginListenerHandle } from '@capacitor/core';
import { useAuth } from '@/lib/auth/client';
import { auth } from '@/lib/firebase/config';

export function PushNotifications() {
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    // FirebaseMessaging.getInstance() crashes natively when the Android app has
    // no google-services.json / google-services Gradle plugin applied (no default
    // FirebaseApp). Stay inert until that native setup is confirmed done, even
    // though requestPermissions/register are otherwise safe to call.
    const pushConfigured = process.env.NEXT_PUBLIC_PUSH_NOTIFICATIONS_ENABLED === 'true';
    if (!pushConfigured || !Capacitor.isNativePlatform() || !isAuthenticated || !user) return;

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

      registrationListener = await Push.addListener('registration', async token => {
        const idToken = await auth?.currentUser?.getIdToken().catch(() => null);
        if (!idToken) return;
        fetch('/api/notifications/register-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
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
