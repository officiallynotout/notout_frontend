import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import type { Subscription } from 'expo-notifications';
import { useAppSelector } from '@/store';
import { registerPushTokenApi, removePushTokenApi } from '@/api';
import { getExpoPushToken } from '@/utils/notifications';

/**
 * Registers the device's Expo push token with the backend when the user is
 * authenticated, and clears it on logout. Also wires up foreground and tap
 * notification listeners so the app can react to incoming notifications.
 */
export const useNotifications = () => {
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const prevAuthenticated = useRef<boolean | null>(null);

  const foregroundSub = useRef<Subscription | null>(null);
  const responseSub   = useRef<Subscription | null>(null);

  useEffect(() => {
    const wasAuthenticated = prevAuthenticated.current;
    prevAuthenticated.current = isAuthenticated;

    if (isAuthenticated && wasAuthenticated !== true) {
      // User just logged in — register token
      getExpoPushToken().then((token) => {
        if (token) registerPushTokenApi(token).catch(() => {});
      });

      // Notification received while app is open
      foregroundSub.current = Notifications.addNotificationReceivedListener(
        (_notification) => {
          // Nothing extra needed — setNotificationHandler already shows the banner
        },
      );

      // User tapped a notification
      responseSub.current = Notifications.addNotificationResponseReceivedListener(
        (_response) => {
          // Future: navigate to the screen in response.notification.request.content.data.screen
        },
      );
    }

    if (!isAuthenticated && wasAuthenticated === true) {
      // User just logged out — remove token from backend
      removePushTokenApi().catch(() => {});
      foregroundSub.current?.remove();
      responseSub.current?.remove();
    }

    return () => {
      foregroundSub.current?.remove();
      responseSub.current?.remove();
    };
  }, [isAuthenticated]);
};
