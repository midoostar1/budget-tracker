# Push Notifications Documentation

## Overview

Complete push notification system using Firebase Cloud Messaging (FCM) for sending notifications to iOS and Android devices. Includes device registration, notification sending, and topic-based messaging.

## Architecture

### Components

1. **Firebase Admin SDK** - Server-side FCM integration
2. **Push Service** (`src/services/push.ts`) - Notification sending logic
3. **Device Registration** - User device management
4. **User Controller** - Device registration endpoints

### Flow

```
1. Mobile app gets FCM token from device
2. App sends token to POST /api/users/register-device
3. Server stores device in database (upsert)
4. Server can now send push notifications to device
5. App displays notification when received
```

---

## API Endpoints

### 1. Register Device

**POST** `/api/users/register-device`

Register or update a device for push notifications.

**Request Body:**
```json
{
  "fcmToken": "device_fcm_token_here",
  "platform": "ios"
}
```

**Field Validation:**
- `fcmToken`: Required, string, 1-500 characters
- `platform`: Required, enum: `"ios"` or `"android"`

**Success Response (200):**
```json
{
  "device": {
    "id": "uuid",
    "platform": "ios",
    "createdAt": "2024-10-09T10:30:00.000Z"
  },
  "message": "Device registered successfully"
}
```

**Notes:**
- Uses upsert: creates new device or updates existing
- FCM token is the unique identifier
- One device per token (switches user if token reassigned)

---

### 2. Get User Devices

**GET** `/api/users/devices`

Get all registered devices for the authenticated user.

**Success Response (200):**
```json
{
  "devices": [
    {
      "id": "uuid",
      "platform": "ios",
      "createdAt": "2024-10-09T10:30:00.000Z"
    },
    {
      "id": "uuid",
      "platform": "android",
      "createdAt": "2024-10-08T15:20:00.000Z"
    }
  ]
}
```

**Notes:**
- FCM tokens are not exposed in response (security)
- Sorted by creation date (newest first)

---

### 3. Unregister Device

**DELETE** `/api/users/devices/:id`

Unregister a device (stops receiving notifications).

**URL Parameters:**
- `id`: Device UUID

**Success Response (200):**
```json
{
  "message": "Device unregistered successfully"
}
```

**Error Response (404):**
```json
{
  "error": "Not Found",
  "message": "Device not found"
}
```

---

## Firebase Configuration

### Setup Steps

1. **Create Firebase Project:**
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Create new project or use existing
   - Enable Cloud Messaging

2. **Generate Service Account:**
   - Project Settings → Service Accounts
   - Click "Generate New Private Key"
   - Download JSON file

3. **Configure Application:**

**Option A: Base64 Encoded (Recommended for production)**
```bash
# Encode service account JSON
base64 -i path/to/service-account.json

# Add to .env
FIREBASE_ADMIN_JSON_BASE64=your_base64_encoded_json_here
```

**Option B: Individual Environment Variables**
```bash
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com
```

4. **Mobile App Setup:**
   - iOS: Add GoogleService-Info.plist
   - Android: Add google-services.json
   - Implement FCM token retrieval
   - Send token to server

---

## Push Service Usage

### Send Single Notification

```typescript
import { sendPush } from '../services/push';

await sendPush('device_fcm_token', {
  title: 'New Transaction',
  body: 'You spent $50.00 at Whole Foods',
  data: {
    type: 'transaction',
    transactionId: 'uuid',
    amount: '50.00',
  },
});
```

### Send to Multiple Devices

```typescript
import { sendMulticast } from '../services/push';

const result = await sendMulticast(
  ['token1', 'token2', 'token3'],
  {
    title: 'Budget Alert',
    body: 'You are approaching your monthly budget limit',
    data: {
      type: 'budget_alert',
      category: 'Groceries',
    },
  }
);

console.log(`Sent: ${result.success}, Failed: ${result.failure}`);
```

### Send to Topic

```typescript
import { sendToTopic } from '../services/push';

await sendToTopic('all_users', {
  title: 'New Feature Available',
  body: 'Check out our new receipt scanning feature!',
  data: {
    type: 'feature_announcement',
    feature: 'receipt_scanning',
  },
});
```

### Topic Management

```typescript
import { subscribeToTopic, unsubscribeFromTopic } from '../services/push';

// Subscribe device to topic
await subscribeToTopic('device_token', 'premium_users');

// Unsubscribe from topic
await unsubscribeFromTopic('device_token', 'premium_users');
```

---

## Notification Examples

### Transaction Created
```typescript
const user = await prisma.user.findUnique({ where: { id: userId }, include: { devices: true } });

for (const device of user.devices) {
  await sendPush(device.fcmToken, {
    title: 'Transaction Recorded',
    body: `${transaction.type === 'income' ? 'Received' : 'Spent'} $${transaction.amount}`,
    data: {
      type: 'transaction_created',
      transactionId: transaction.id,
      amount: transaction.amount.toString(),
    },
  });
}
```

### Receipt Processed
```typescript
await sendPush(device.fcmToken, {
  title: 'Receipt Processed',
  body: `Receipt from ${ocrData.vendor} ($${ocrData.total}) has been processed`,
  data: {
    type: 'receipt_processed',
    receiptId: receipt.id,
    transactionId: transaction.id,
  },
});
```

### Budget Alert
```typescript
await sendPush(device.fcmToken, {
  title: 'Budget Alert',
  body: 'You have spent 90% of your monthly Groceries budget',
  data: {
    type: 'budget_alert',
    category: 'Groceries',
    percentage: '90',
  },
});
```

### Bill Reminder
```typescript
await sendPush(device.fcmToken, {
  title: 'Bill Reminder',
  body: 'Rent payment of $1500 is due tomorrow',
  data: {
    type: 'bill_reminder',
    scheduledTransactionId: scheduledTx.id,
    amount: '1500',
    dueDate: scheduledTx.nextDueDate.toISOString(),
  },
});
```

---

## Integration Examples

### Mobile App (React Native)

**Get FCM Token:**
```typescript
import messaging from '@react-native-firebase/messaging';

// Request permission (iOS)
const authStatus = await messaging().requestPermission();
const enabled =
  authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
  authStatus === messaging.AuthorizationStatus.PROVISIONAL;

if (enabled) {
  // Get FCM token
  const fcmToken = await messaging().getToken();
  
  // Register with server
  await registerDevice(fcmToken);
}
```

**Register Device:**
```typescript
const registerDevice = async (fcmToken: string) => {
  const platform = Platform.OS === 'ios' ? 'ios' : 'android';
  
  const response = await fetch('/api/users/register-device', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      fcmToken,
      platform,
    }),
  });
  
  return response.json();
};
```

**Handle Notifications:**
```typescript
// Foreground notification handler
messaging().onMessage(async remoteMessage => {
  console.log('Notification received:', remoteMessage);
  
  // Show local notification or update UI
  if (remoteMessage.notification) {
    Alert.alert(
      remoteMessage.notification.title,
      remoteMessage.notification.body
    );
  }
});

// Background/quit notification handler
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Background notification:', remoteMessage);
});

// Notification tap handler
messaging().onNotificationOpenedApp(remoteMessage => {
  console.log('Notification opened:', remoteMessage);
  
  // Navigate based on notification data
  if (remoteMessage.data?.type === 'transaction_created') {
    navigation.navigate('TransactionDetail', {
      id: remoteMessage.data.transactionId,
    });
  }
});
```

---

### Server-Side Examples

**Notify User on Transaction:**
```typescript
// In transactionController.ts after creating transaction
const user = await prisma.user.findUnique({
  where: { id: req.user.userId },
  include: { devices: true },
});

if (user && user.devices.length > 0) {
  const tokens = user.devices.map(d => d.fcmToken);
  
  await sendMulticast(tokens, {
    title: 'Transaction Created',
    body: `${transaction.type} of $${transaction.amount}`,
    data: {
      type: 'transaction',
      transactionId: transaction.id,
    },
  });
}
```

**Scheduled Notifications (Cron):**
```typescript
import cron from 'node-cron';
import { sendMulticast } from '../services/push';

// Daily bill reminders at 9 AM
cron.schedule('0 9 * * *', async () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  // Find bills due tomorrow
  const upcomingBills = await prisma.scheduledTransaction.findMany({
    where: {
      isBill: true,
      nextDueDate: {
        gte: tomorrow,
        lt: new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000),
      },
    },
    include: {
      user: {
        include: { devices: true },
      },
    },
  });
  
  for (const bill of upcomingBills) {
    const tokens = bill.user.devices.map(d => d.fcmToken);
    
    if (tokens.length > 0) {
      await sendMulticast(tokens, {
        title: 'Bill Reminder',
        body: `${bill.description} ($${bill.amount}) is due tomorrow`,
        data: {
          type: 'bill_reminder',
          scheduledTransactionId: bill.id,
        },
      });
    }
  }
});
```

---

## Error Handling

### Invalid Token Handling

The push service automatically detects invalid tokens:

```typescript
// In push.ts
if (error.message.includes('invalid-registration-token')) {
  logger.warn({ fcmToken }, 'Invalid FCM token');
  // Consider auto-deleting from database
}
```

**Auto-cleanup (optional):**
```typescript
export async function cleanupInvalidTokens() {
  const devices = await prisma.device.findMany();
  
  for (const device of devices) {
    const isValid = await validateFCMToken(device.fcmToken);
    
    if (!isValid) {
      await prisma.device.delete({ where: { id: device.id } });
      logger.info({ deviceId: device.id }, 'Removed invalid device');
    }
  }
}
```

---

## Security Considerations

### Token Privacy

✅ **Never expose FCM tokens** in API responses  
✅ **Store tokens securely** in database  
✅ **Validate ownership** before sending notifications  
✅ **Use unique index** on fcmToken field  

### Best Practices

1. **Rate Limiting**:
   - Limit notification frequency per user
   - Implement quiet hours
   - Batch notifications when possible

2. **Permission Management**:
   - Respect user notification preferences
   - Allow per-category opt-in/out
   - Provide unsubscribe mechanism

3. **Data Privacy**:
   - Don't include sensitive data in notification body
   - Use data payload for details
   - Fetch details after notification tap

4. **Token Rotation**:
   - Handle token refresh on mobile app
   - Re-register on token change
   - Clean up old/invalid tokens

---

## Testing

### Manual Testing

```bash
# 1. Register device (use real FCM token from mobile app)
curl -X POST http://localhost:3000/api/users/register-device \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fcmToken": "REAL_FCM_TOKEN_HERE",
    "platform": "ios"
  }'

# 2. Get registered devices
curl http://localhost:3000/api/users/devices \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Test Notification (in Node.js script):**
```typescript
import { sendPush } from './src/services/push';

async function testNotification() {
  await sendPush('your_device_token', {
    title: 'Test Notification',
    body: 'This is a test from the server',
    data: {
      test: 'true',
    },
  });
}

testNotification();
```

---

## Monitoring

### Key Metrics

- **Registration Rate**: New devices/day
- **Active Devices**: Devices receiving notifications
- **Delivery Rate**: Success vs failure percentage
- **Invalid Tokens**: Tokens that need cleanup

### Logging

All push operations are logged:

```typescript
logger.info({ messageId, fcmToken }, 'Push notification sent');
logger.error({ error, fcmToken }, 'Failed to send push');
logger.warn({ fcmToken }, 'Invalid FCM token');
```

---

## Cost Considerations

FCM is free for most use cases, but consider:

1. **Message Volume**: High-volume apps may need optimization
2. **Payload Size**: Keep payloads small (< 4KB)
3. **Delivery Options**: Priority affects battery usage
4. **Topics**: More efficient than individual sends for broadcasts

---

## Troubleshooting

### Issue: "Firebase Admin credentials not configured"

**Solution**: Add credentials to `.env`:
```bash
# Option 1: Base64
FIREBASE_ADMIN_JSON_BASE64=base64_encoded_json

# Option 2: Individual vars
FIREBASE_PROJECT_ID=project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@project.iam.gserviceaccount.com
```

### Issue: "invalid-registration-token"

**Causes:**
- Token expired or invalidated
- App uninstalled/reinstalled
- Token from different Firebase project

**Solution:**
- Have mobile app refresh token
- Re-register device
- Remove invalid token from database

### Issue: Notifications not received on iOS

**Check:**
- APNs certificate configured in Firebase
- Notification permissions granted
- App in foreground (needs foreground handler)
- Debug logging enabled

### Issue: Notifications not received on Android

**Check:**
- google-services.json properly configured
- Notification channels created (Android 8+)
- Battery optimization disabled for app
- Debug logging enabled

---

## Future Enhancements

- [ ] Notification preferences per category
- [ ] Scheduled notifications (send at specific time)
- [ ] Rich notifications (images, actions)
- [ ] Analytics integration
- [ ] A/B testing for notification content
- [ ] Silent/data-only notifications
- [ ] Notification templates
- [ ] Multi-language support

---

**Last Updated**: 2024-10-09
**Firebase Admin SDK Version**: firebase-admin@13.x


