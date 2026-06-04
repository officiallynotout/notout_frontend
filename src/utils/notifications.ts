import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

// Show notification banners while app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge:  false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Request permission and return the Expo push token string.
 * Returns null if permission is denied or we're on a simulator.
 */
export const getExpoPushToken = async (): Promise<string | null> => {
  if (!Device.isDevice) {
    // Simulators cannot receive push notifications
    return null;
  }

  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;

  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') return null;

  // Android requires a notification channel
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name:       'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  const tokenData = await Notifications.getExpoPushTokenAsync();
  return tokenData.data;
};
