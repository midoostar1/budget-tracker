import * as admin from 'firebase-admin';
import { config } from '../config';
import { logger } from '../lib/logger';

// Initialize Firebase Admin
let firebaseApp: admin.app.App | null = null;

function getFirebaseApp(): admin.app.App {
  if (!firebaseApp) {
    try {
      // Option 1: Use base64 encoded service account JSON
      if (config.FIREBASE_ADMIN_JSON_BASE64) {
        const serviceAccount = JSON.parse(
          Buffer.from(config.FIREBASE_ADMIN_JSON_BASE64, 'base64').toString('utf-8')
        );

        firebaseApp = admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });

        logger.info('Firebase Admin initialized with base64 service account');
      }
      // Option 2: Use individual environment variables
      else if (config.FIREBASE_PROJECT_ID && config.FIREBASE_PRIVATE_KEY && config.FIREBASE_CLIENT_EMAIL) {
        firebaseApp = admin.initializeApp({
          credential: admin.credential.cert({
            projectId: config.FIREBASE_PROJECT_ID,
            privateKey: config.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            clientEmail: config.FIREBASE_CLIENT_EMAIL,
          }),
        });

        logger.info('Firebase Admin initialized with environment variables');
      } else {
        throw new Error('Firebase Admin credentials not configured');
      }
    } catch (error) {
      logger.error({ error }, 'Failed to initialize Firebase Admin');
      throw new Error('Failed to initialize Firebase Admin');
    }
  }

  return firebaseApp;
}

export interface PushNotification {
  title: string;
  body: string;
  data?: Record<string, string>;
}

/**
 * Send push notification to a single device
 */
export async function sendPush(
  fcmToken: string,
  notification: PushNotification
): Promise<boolean> {
  try {
    const app = getFirebaseApp();
    const messaging = admin.messaging(app);

    const message: admin.messaging.Message = {
      token: fcmToken,
      notification: {
        title: notification.title,
        body: notification.body,
      },
      data: notification.data || {},
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          channelId: 'default',
        },
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1,
          },
        },
      },
    };

    const response = await messaging.send(message);

    logger.info({ messageId: response }, 'Push notification sent successfully');

    return true;
  } catch (error) {
    logger.error('Failed to send push notification'); // Don't log FCM token

    // Handle invalid token errors
    if (error instanceof Error) {
      const errorMessage = error.message.toLowerCase();
      if (
        errorMessage.includes('invalid-registration-token') ||
        errorMessage.includes('registration-token-not-registered')
      ) {
        logger.warn('Invalid FCM token detected'); // Don't log token
        // In production, you might want to delete the invalid device from database
      }
    }

    return false;
  }
}

/**
 * Send push notification to multiple devices
 */
export async function sendMulticast(
  fcmTokens: string[],
  notification: PushNotification
): Promise<{ success: number; failure: number; failedTokens: string[] }> {
  try {
    if (fcmTokens.length === 0) {
      return { success: 0, failure: 0, failedTokens: [] };
    }

    const app = getFirebaseApp();
    const messaging = admin.messaging(app);

    const message: admin.messaging.MulticastMessage = {
      tokens: fcmTokens,
      notification: {
        title: notification.title,
        body: notification.body,
      },
      data: notification.data || {},
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          channelId: 'default',
        },
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1,
          },
        },
      },
    };

    const response = await messaging.sendEachForMulticast(message);

    const failedTokens: string[] = [];
    response.responses.forEach((resp, idx) => {
      if (!resp.success) {
        failedTokens.push(fcmTokens[idx]);
      }
    });

    logger.info(
      {
        success: response.successCount,
        failure: response.failureCount,
        total: fcmTokens.length,
      },
      'Multicast push notifications sent'
    );

    return {
      success: response.successCount,
      failure: response.failureCount,
      failedTokens,
    };
  } catch (error) {
    logger.error({ error, tokenCount: fcmTokens.length }, 'Failed to send multicast notification');
    return { success: 0, failure: fcmTokens.length, failedTokens: fcmTokens };
  }
}

/**
 * Send push notification to a topic
 */
export async function sendToTopic(
  topic: string,
  notification: PushNotification
): Promise<boolean> {
  try {
    const app = getFirebaseApp();
    const messaging = admin.messaging(app);

    const message: admin.messaging.Message = {
      topic,
      notification: {
        title: notification.title,
        body: notification.body,
      },
      data: notification.data || {},
      android: {
        priority: 'high',
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
          },
        },
      },
    };

    const response = await messaging.send(message);

    logger.info({ messageId: response, topic }, 'Topic notification sent successfully');

    return true;
  } catch (error) {
    logger.error({ error, topic }, 'Failed to send topic notification');
    return false;
  }
}

/**
 * Subscribe device to a topic
 */
export async function subscribeToTopic(fcmToken: string, topic: string): Promise<boolean> {
  try {
    const app = getFirebaseApp();
    const messaging = admin.messaging(app);

    await messaging.subscribeToTopic([fcmToken], topic);

    logger.info({ topic }, 'Device subscribed to topic');

    return true;
  } catch (error) {
    logger.error({ error, topic }, 'Failed to subscribe to topic');
    return false;
  }
}

/**
 * Unsubscribe device from a topic
 */
export async function unsubscribeFromTopic(fcmToken: string, topic: string): Promise<boolean> {
  try {
    const app = getFirebaseApp();
    const messaging = admin.messaging(app);

    await messaging.unsubscribeFromTopic([fcmToken], topic);

    logger.info({ topic }, 'Device unsubscribed from topic');

    return true;
  } catch (error) {
    logger.error({ error, topic }, 'Failed to unsubscribe from topic');
    return false;
  }
}

/**
 * Validate FCM token
 */
export async function validateFCMToken(fcmToken: string): Promise<boolean> {
  try {
    const app = getFirebaseApp();
    const messaging = admin.messaging(app);

    // Try to send a data-only message (no notification shown)
    await messaging.send({
      token: fcmToken,
      data: { validation: 'true' },
    }, true); // dryRun mode

    return true;
  } catch (error) {
    logger.debug({ error }, 'FCM token validation failed');
    return false;
  }
}

