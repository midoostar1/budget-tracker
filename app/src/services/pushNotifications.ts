import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import api from './api';
import { logger } from '../utils/logger';

/**
 * Configure notification handler for foreground notifications
 */
export function configurePushNotifications() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

/**
 * Request notification permissions
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  try {
    // Only request on physical devices
    if (!Device.isDevice) {
      logger.warn('Push notifications only work on physical devices');
      return false;
    }

    // Check existing permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    
    let finalStatus = existingStatus;

    // Request if not already granted
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      logger.warn('Notification permissions not granted');
      return false;
    }

    logger.info('Notification permissions granted');
    return true;
  } catch (error) {
    logger.error('Failed to request notification permissions', error);
    return false;
  }
}

/**
 * Get FCM/Expo push token
 */
export async function getPushToken(): Promise<string | null> {
  try {
    // Only on physical devices
    if (!Device.isDevice) {
      return null;
    }

    // For Expo managed workflow, use Expo push token
    // For bare workflow, use getDevicePushTokenAsync for native FCM token
    const token = await Notifications.getExpoPushTokenAsync({
      projectId: Constants.expoConfig?.extra?.eas?.projectId,
    });

    logger.info('Push token obtained', { token: token.data });
    return token.data;
  } catch (error) {
    logger.error('Failed to get push token', error);
    return null;
  }
}

/**
 * Get device push token (native FCM/APNs)
 * Use this if you want the native token instead of Expo token
 */
export async function getDevicePushToken(): Promise<string | null> {
  try {
    if (!Device.isDevice) {
      return null;
    }

    const token = await Notifications.getDevicePushTokenAsync();
    logger.info('Device push token obtained');
    return token.data;
  } catch (error) {
    logger.error('Failed to get device push token', error);
    return null;
  }
}

/**
 * Register device with backend
 */
export async function registerDevice(fcmToken: string): Promise<boolean> {
  try {
    const platform = Platform.OS as 'ios' | 'android';

    await api.post('/api/users/register-device', {
      fcmToken,
      platform,
    });

    logger.info('Device registered successfully', { platform });
    return true;
  } catch (error) {
    logger.error('Failed to register device', error);
    return false;
  }
}

/**
 * Unregister device from backend
 */
export async function unregisterDevice(deviceId: string): Promise<boolean> {
  try {
    await api.delete(`/api/users/devices/${deviceId}`);
    logger.info('Device unregistered successfully');
    return true;
  } catch (error) {
    logger.error('Failed to unregister device', error);
    return false;
  }
}

/**
 * Complete push notification setup
 * Call this on app start after user is authenticated
 */
export async function setupPushNotifications(): Promise<boolean> {
  try {
    // 1. Request permissions
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      return false;
    }

    // 2. Get push token
    const pushToken = await getPushToken();
    if (!pushToken) {
      return false;
    }

    // 3. Register with backend
    const registered = await registerDevice(pushToken);
    
    return registered;
  } catch (error) {
    logger.error('Push notification setup failed', error);
    return false;
  }
}

/**
 * Handle notification tap/interaction
 * Returns the notification data for deep linking
 */
export function addNotificationResponseListener(
  handler: (data: any) => void
): Notifications.Subscription {
  return Notifications.addNotificationResponseReceivedListener((response) => {
    const data = response.notification.request.content.data;
    logger.info('Notification tapped', { data });
    handler(data);
  });
}

/**
 * Handle notification received while app is in foreground
 */
export function addNotificationReceivedListener(
  handler: (notification: Notifications.Notification) => void
): Notifications.Subscription {
  return Notifications.addNotificationReceivedListener((notification) => {
    logger.info('Notification received in foreground', {
      title: notification.request.content.title,
      body: notification.request.content.body,
    });
    handler(notification);
  });
}

/**
 * Schedule a local notification (for testing)
 */
export async function scheduleLocalNotification(
  title: string,
  body: string,
  data?: any,
  seconds: number = 5
): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds,
      repeats: false,
    },
  });
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

/**
 * Set badge count (iOS)
 */
export async function setBadgeCount(count: number): Promise<void> {
  if (Platform.OS === 'ios') {
    await Notifications.setBadgeCountAsync(count);
  }
}

/**
 * Clear badge (iOS)
 */
export async function clearBadge(): Promise<void> {
  await setBadgeCount(0);
}

