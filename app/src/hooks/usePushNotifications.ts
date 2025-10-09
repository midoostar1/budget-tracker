import { useEffect, useRef } from 'react';
import { router } from 'expo-router';
import { useAuthStore } from '../state/authStore';
import { logger } from '../utils/logger';

// Conditional import for expo-notifications (not fully supported in Expo Go)
let Notifications: any;
let configurePushNotifications: any;
let setupPushNotifications: any;
let addNotificationResponseListener: any;
let addNotificationReceivedListener: any;
let clearBadge: any;

try {
  Notifications = require('expo-notifications');
  const pushService = require('../services/pushNotifications');
  configurePushNotifications = pushService.configurePushNotifications;
  setupPushNotifications = pushService.setupPushNotifications;
  addNotificationResponseListener = pushService.addNotificationResponseListener;
  addNotificationReceivedListener = pushService.addNotificationReceivedListener;
  clearBadge = pushService.clearBadge;
} catch (e) {
  console.warn('Push notifications not available in Expo Go. Use development build for full functionality.');
}

/**
 * Hook to manage push notifications
 * 
 * - Requests permissions on mount (if authenticated)
 * - Registers device with backend
 * - Handles notification taps (deep linking)
 * - Handles foreground notifications
 * - Cleans up on unmount
 */
export function usePushNotifications() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const notificationListener = useRef<Notifications.Subscription | undefined>(undefined);
  const responseListener = useRef<Notifications.Subscription | undefined>(undefined);

  useEffect(() => {
    // Skip if push notifications not available (Expo Go)
    if (!configurePushNotifications || !setupPushNotifications) {
      logger.warn('Push notifications not available - using Expo Go');
      return;
    }

    // Configure notification handler
    configurePushNotifications();

    // Only setup if authenticated
    if (!isAuthenticated) {
      return;
    }

    // Setup push notifications
    setupPushNotifications()
      .then((success) => {
        if (success) {
          logger.info('Push notifications setup complete');
        } else {
          logger.warn('Push notifications setup failed or skipped');
        }
      })
      .catch((error: unknown) => {
        logger.error('Push notifications setup error', error);
      });

    // Listen for notifications received in foreground
    if (addNotificationReceivedListener) {
      notificationListener.current = addNotificationReceivedListener((notification) => {
        logger.info('Foreground notification received');
        
        // Clear badge when app is active
        if (clearBadge) {
          void clearBadge();
        }
      });
    }

    // Listen for notification taps
    if (addNotificationResponseListener) {
      responseListener.current = addNotificationResponseListener((data) => {
        handleNotificationTap(data);
      });
    }

    // Cleanup
    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, [isAuthenticated]);

  /**
   * Handle notification tap - Deep linking
   */
  const handleNotificationTap = (data: any) => {
    logger.info('Handling notification tap', data);

    // Clear badge
    void clearBadge();

    // Deep link based on notification type
    if (!data) {
      // No data, just go to dashboard
      router.push('/(tabs)/dashboard');
      return;
    }

    switch (data.type) {
      case 'pending_receipt':
      case 'pending_receipts':
      case 'receipt_processed':
        // Navigate to receipts tab for receipt review
        logger.info('Navigating to receipts for review');
        router.push('/(tabs)/receipts');
        break;

      case 'bill_due':
      case 'bill_reminder':
      case 'upcoming_bill':
        // Navigate to transactions (bills are scheduled transactions)
        // In future, could navigate to a bills screen
        logger.info('Navigating to transactions for bills');
        router.push('/(tabs)/transactions');
        break;

      case 'transaction_created':
      case 'transaction_updated':
        // Navigate to specific transaction if transactionId provided
        if (data.transactionId) {
          logger.info('Navigating to transaction', { id: data.transactionId });
          router.push('/(tabs)/transactions');
          // TODO: Navigate to transaction detail screen when implemented
          // router.push(`/transaction/${data.transactionId}`);
        } else {
          router.push('/(tabs)/transactions');
        }
        break;

      case 'daily_digest':
        // Navigate to dashboard
        logger.info('Navigating to dashboard from digest');
        router.push('/(tabs)/dashboard');
        break;

      default:
        // Unknown type, go to dashboard
        logger.warn('Unknown notification type', { type: data.type });
        router.push('/(tabs)/dashboard');
    }
  };

  return {
    // Expose handler for manual navigation testing
    handleNotificationTap,
  };
}

