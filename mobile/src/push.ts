import { Platform } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import * as Device from 'expo-device';
import { requireOptionalNativeModule } from 'expo';

// Expo Go does not ship the native notification modules, so everything here is lazy and skipped there.
// In a real build (APK) push works normally.
export const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient || Constants.appOwnership === 'expo';

let cached: typeof import('expo-notifications') | null = null;
function notif() {
  // Skip when the native piece is missing (Expo Go): checking first avoids Expo's dev red box.
  if (isExpoGo || !requireOptionalNativeModule('ExpoTopicSubscriptionModule')) return null;
  if (!cached) {
    try { cached = require('expo-notifications'); } catch { cached = null; }
  }
  return cached;
}

export function initNotifications() {
  notif()?.setNotificationHandler({
    handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: false, shouldSetBadge: false }),
  });
}

/** Returns the native FCM device token (Android) or null. The admin server sends via Firebase Admin messaging. */
export async function registerForPush(): Promise<string | null> {
  try {
    const N = notif();
    if (!N || !Device.isDevice) return null;
    if (Platform.OS === 'android') {
      await N.setNotificationChannelAsync('orders', { name: 'Orders & service', importance: N.AndroidImportance.HIGH, lightColor: '#E8A33D' });
    }
    let { status } = await N.getPermissionsAsync();
    if (status !== 'granted') status = (await N.requestPermissionsAsync()).status;
    if (status !== 'granted') return null;
    return (await N.getDevicePushTokenAsync()).data as string;
  } catch {
    return null;
  }
}

/** Calls back with the notification data when the user taps a notification. Returns an unsubscribe function. */
export function onNotificationTap(cb: (data: Record<string, unknown>) => void) {
  const N = notif();
  if (!N) return () => {};
  const sub = N.addNotificationResponseReceivedListener((r) => cb((r.notification.request.content.data || {}) as Record<string, unknown>));
  return () => sub.remove();
}
