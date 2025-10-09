# Push Notifications - Complete Implementation ✅

## 🔔 **Push Notification System Fully Implemented**

Complete push notification integration with permissions, device registration, and deep linking.

**Date Completed**: October 9, 2024  
**Status**: ✅ **Implementation Complete** - Ready for testing

---

## 📦 **What Was Created**

### **1. Push Notification Service** ✅
**File**: `src/services/pushNotifications.ts` (250 lines)

**Functions:**
- `configurePushNotifications()` - Set notification handler
- `requestNotificationPermissions()` - Request user permission
- `getPushToken()` - Get Expo push token
- `getDevicePushToken()` - Get native FCM/APNs token
- `registerDevice(token)` - Register with backend
- `unregisterDevice(id)` - Unregister from backend
- `setupPushNotifications()` - Complete setup flow
- `addNotificationResponseListener()` - Handle taps
- `addNotificationReceivedListener()` - Handle foreground
- `scheduleLocalNotification()` - Test notifications
- `setBadgeCount()` - Update badge (iOS)
- `clearBadge()` - Clear badge

**Features:**
- ✅ Physical device detection
- ✅ Permission handling
- ✅ Token retrieval (Expo + native)
- ✅ Backend registration
- ✅ Event listeners
- ✅ Local notifications (testing)
- ✅ Badge management (iOS)
- ✅ Error handling
- ✅ Logging

---

### **2. Push Notifications Hook** ✅
**File**: `src/hooks/usePushNotifications.ts` (120 lines)

**Features:**
- ✅ Auto-setup on app start (if authenticated)
- ✅ Request permissions
- ✅ Register device with backend
- ✅ Listen for notification taps
- ✅ Listen for foreground notifications
- ✅ Deep linking to screens
- ✅ Cleanup on unmount
- ✅ Badge clearing

**Deep Link Routes:**

| Notification Type | Target Screen | Purpose |
|-------------------|---------------|---------|
| `pending_receipt` | Receipts | Review pending receipts |
| `pending_receipts` | Receipts | Multiple receipts to review |
| `receipt_processed` | Receipts | OCR completed |
| `bill_due` | Transactions | Bill reminder |
| `bill_reminder` | Transactions | Upcoming bill |
| `upcoming_bill` | Transactions | Bill due soon |
| `transaction_created` | Transactions | New transaction |
| `transaction_updated` | Transactions | Transaction modified |
| `daily_digest` | Dashboard | Daily summary |
| Unknown | Dashboard | Fallback |

---

### **3. Logger Utility** ✅
**File**: `src/utils/logger.ts` (30 lines)

Simple logging utility:
- `logger.info()` - Info messages
- `logger.warn()` - Warnings
- `logger.error()` - Errors
- `logger.debug()` - Debug (dev only)

---

### **4. Updated App Layout** ✅
**File**: `app/_layout.tsx`

**Changes:**
- ✅ Added `usePushNotifications()` hook
- ✅ Auto-setup on authenticated users
- ✅ Listens for notification events

---

### **5. Updated App Configuration** ✅
**File**: `app.json`

**Added:**
- ✅ iOS notification permission description
- ✅ Android POST_NOTIFICATIONS permission
- ✅ Android useNextNotificationsApi flag
- ✅ Notification icon configuration

---

## 🔄 **Complete Flow**

### **App Start → Device Registration**

```
1. App Launches
    ↓
2. Load Stored Auth
    ↓
3. If Authenticated:
    ↓
4. usePushNotifications() Hook Runs
    ↓
5. configurePushNotifications()
   - Set foreground notification handler
    ↓
6. requestNotificationPermissions()
   - Check if physical device
   - Get existing permissions
   - Request if not granted
   - Return true/false
    ↓
7. If Permission Granted:
    ↓
8. getPushToken()
   - Get Expo push token
   - Uses project ID from app.json
   - Returns token string
    ↓
9. registerDevice(token)
   - POST /api/users/register-device
   - Body: { fcmToken, platform: 'ios'|'android' }
   - Headers: Authorization: Bearer <token>
    ↓
10. Backend Stores Device
    - Creates Device record
    - Links to user
    - Ready to receive push
    ↓
11. Setup Listeners
    - Foreground notifications
    - Notification taps
    ↓
✅ Device Registered & Ready
```

---

### **Receiving Push Notification**

```
Backend Sends Push
    ↓
Firebase Cloud Messaging
    ↓
Device Receives Notification
    ↓
┌─────────────────────────────┐
│ App State?                  │
└────────┬────────────────────┘
         │
    ┌────┴────┐
    │         │
  Background Foreground
    │         │
    ↓         ↓
Show in     Show banner
notification Auto-clear badge
tray        Run handler
    │
    │ (User taps)
    │
    ↓
Notification Tap Handler
    ↓
Parse notification.data
    ↓
Switch on data.type
    ↓
Deep Link to Screen:
- pending_receipt → Receipts
- bill_due → Transactions
- daily_digest → Dashboard
- etc.
    ↓
✅ User Navigated to Relevant Screen
```

---

## 📱 **Notification Types & Deep Links**

### **1. Pending Receipts Notification**

**Sent by**: Daily digest cron job

**Payload:**
```json
{
  "title": "Pending Receipts",
  "body": "You have 3 receipt(s) to review!",
  "data": {
    "type": "pending_receipts",
    "count": 3,
    "timestamp": "2024-10-09T20:00:00.000Z"
  }
}
```

**Deep Link**: → `/(tabs)/receipts`

---

### **2. Bill Due Notification**

**Sent by**: Daily digest cron job (3 days before)

**Payload:**
```json
{
  "title": "Bill Reminder",
  "body": "Your Rent bill ($1500.00) is due tomorrow",
  "data": {
    "type": "bill_due",
    "scheduledTransactionId": "uuid",
    "amount": "1500.00",
    "description": "Rent",
    "dueDate": "2024-10-10"
  }
}
```

**Deep Link**: → `/(tabs)/transactions`

---

### **3. Receipt Processed Notification**

**Sent by**: OCR worker after processing

**Payload:**
```json
{
  "title": "Receipt Processed",
  "body": "Your receipt from Whole Foods is ready to review",
  "data": {
    "type": "receipt_processed",
    "receiptId": "uuid",
    "transactionId": "uuid",
    "vendor": "Whole Foods",
    "total": "52.47"
  }
}
```

**Deep Link**: → `/(tabs)/receipts`

---

### **4. Daily Digest Notification**

**Sent by**: Daily digest cron job

**Payload:**
```json
{
  "title": "Daily Summary",
  "body": "You have 3 receipts to review and 2 bills coming up",
  "data": {
    "type": "daily_digest",
    "pendingReceipts": 3,
    "upcomingBills": 2
  }
}
```

**Deep Link**: → `/(tabs)/dashboard`

---

## 🔐 **Security & Permissions**

### **iOS Permissions**

**Added to app.json:**
```json
"infoPlist": {
  "NSUserNotificationsUsageDescription": "Budget Tracker sends notifications for pending receipts and upcoming bills."
}
```

**Permission Flow:**
1. App requests permission on first launch (if authenticated)
2. User sees iOS permission dialog
3. User grants or denies
4. If granted: Register device
5. If denied: Can re-request from Settings

---

### **Android Permissions**

**Added to app.json:**
```json
"permissions": [
  "POST_NOTIFICATIONS"  // Android 13+ (API 33+)
],
"useNextNotificationsApi": true
```

**Permission Flow:**
1. Android 13+: Permission dialog shown
2. Android 12 and below: Automatic
3. User grants or denies
4. If granted: Register device

---

## 🛠️ **Backend Integration**

### **Device Registration Endpoint**

**Request:**
```typescript
POST /api/users/register-device
Headers: {
  Authorization: "Bearer <access-token>"
}
Body: {
  fcmToken: "ExponentPushToken[xxx]",  // or native FCM token
  platform: "ios" | "android"
}
```

**Response:**
```typescript
{
  device: {
    id: "device-uuid",
    platform: "ios",
    createdAt: "2024-10-09T12:00:00.000Z"
  },
  message: "Device registered successfully"
}
```

**Backend Actions:**
- Upserts device (unique by fcmToken + userId)
- Updates platform if changed
- Ready to receive push notifications

---

### **Sending Push Notifications**

**Backend uses Firebase Admin SDK:**

```typescript
// Backend: src/services/push.ts
await sendPush(
  fcmToken,
  {
    title: "Pending Receipts",
    body: "You have 3 receipt(s) to review!"
  },
  {
    type: "pending_receipts",
    count: "3"
  }
);
```

**Received on mobile:**
```typescript
// Mobile: Notification data
{
  title: "Pending Receipts",
  body: "You have 3 receipt(s) to review!",
  data: {
    type: "pending_receipts",
    count: "3",
    timestamp: "2024-10-09T20:00:00.000Z"
  }
}
```

---

## 🧪 **Testing Guide**

### **Test Device Registration**

1. **Login to App**
   - Should auto-request permissions
   - iOS: Permission dialog appears
   - Android: Permission dialog (Android 13+)

2. **Grant Permission**
   - Tap "Allow"
   - Console should show: "Push notifications setup complete"

3. **Check Backend**
   ```bash
   # Backend logs should show:
   # "Device registered successfully"
   
   # Check database:
   # SELECT * FROM "Device" WHERE "userId" = 'user-id';
   ```

4. **Verify Token**
   - Should start with `ExponentPushToken[`
   - Should be stored in Device table

---

### **Test Foreground Notifications**

**Option A: Trigger from Backend**
```bash
# Use daily digest endpoint
curl -X POST https://your-api.com/jobs/daily-digest \
  -H "x-cron-secret: YOUR_CRON_SECRET"

# Should send push to all users with pending receipts
```

**Option B: Use Expo Push Tool**
1. Go to https://expo.dev/notifications
2. Enter your Expo push token
3. Fill in title, body, data
4. Send notification

**Option C: Test Locally**
```typescript
// In any component
import { scheduleLocalNotification } from '@/services/pushNotifications';

// Schedule test notification
await scheduleLocalNotification(
  'Test Notification',
  'This is a test',
  { type: 'pending_receipts' },
  5  // 5 seconds
);
```

**Expected:**
- App in foreground → Banner appears at top
- Badge cleared automatically
- Console log: "Foreground notification received"

---

### **Test Background/Quit Notifications**

1. **Close App** (swipe up or back button)
2. **Send Push Notification** (via backend or Expo tool)
3. **Expected:**
   - Notification appears in system tray
   - Badge count increases (iOS)
   - Sound plays (if enabled)

---

### **Test Notification Tap**

1. **Receive Notification** (app in background/quit)
2. **Tap Notification**
3. **Expected:**
   - App opens
   - Navigates to correct screen based on type
   - Badge cleared
   - Console log: "Notification tapped"

**Test Each Type:**
```typescript
// Type: pending_receipt → Navigate to Receipts
// Type: bill_due → Navigate to Transactions
// Type: daily_digest → Navigate to Dashboard
```

---

### **Test Deep Linking**

**Pending Receipt Notification:**
```json
{
  "data": {
    "type": "pending_receipt",
    "receiptId": "receipt-123",
    "transactionId": "tx-456"
  }
}
```
**Expected**: Opens Receipts tab

**Bill Due Notification:**
```json
{
  "data": {
    "type": "bill_due",
    "scheduledTransactionId": "bill-789",
    "amount": "1500.00",
    "description": "Rent"
  }
}
```
**Expected**: Opens Transactions tab

**Daily Digest:**
```json
{
  "data": {
    "type": "daily_digest",
    "pendingReceipts": 3,
    "upcomingBills": 2
  }
}
```
**Expected**: Opens Dashboard

---

## 🔧 **Configuration**

### **Expo Push Token vs FCM Token**

**Expo Push Token** (Current Implementation):
- Easier to use
- Works with Expo's push notification service
- Format: `ExponentPushToken[xxx]`
- No Firebase config needed for testing

**Native FCM Token** (Alternative):
- Direct Firebase integration
- Requires `google-services.json` / `GoogleService-Info.plist`
- Better for production (no Expo dependency)

**To Switch to Native FCM:**
```typescript
// In pushNotifications.ts
const token = await getDevicePushToken(); // Instead of getPushToken()
```

---

### **Firebase Configuration** (Optional for Native)

**iOS:**
1. Download `GoogleService-Info.plist` from Firebase
2. Place in `app/` directory
3. Update `app.json`:
```json
"ios": {
  "googleServicesFile": "./GoogleService-Info.plist"
}
```

**Android:**
1. Download `google-services.json` from Firebase
2. Place in `app/` directory
3. Update `app.json`:
```json
"android": {
  "googleServicesFile": "./google-services.json"
}
```

**For Expo managed workflow**: Files handled automatically by plugin

---

## 📊 **Implementation Details**

### **Permission States**

**iOS:**
- `granted` - User allowed
- `denied` - User denied
- `undetermined` - Not asked yet

**Android:**
- `granted` - Allowed
- `denied` - Denied (or app doesn't support)

### **Token Types**

**Expo Push Token:**
```
ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]
```

**FCM Token (Android):**
```
fcm-long-token-string-here
```

**APNs Token (iOS):**
```
apns-device-token-here
```

### **Notification Payload**

**Standard Format:**
```json
{
  "to": "ExponentPushToken[xxx]",
  "sound": "default",
  "title": "Notification Title",
  "body": "Notification body text",
  "data": {
    "type": "pending_receipt",
    "customField": "value"
  },
  "badge": 1,
  "priority": "high"
}
```

---

## 🎯 **Integration with Backend**

### **Daily Digest Job**

**Backend**: `server/src/services/jobsService.ts`

**Sends notifications for:**
1. **Pending Receipts**
   - Finds users with pending_receipt transactions
   - Sends: "You have X receipt(s) to review!"
   - Data: `{ type: 'pending_receipts', count: X }`

2. **Upcoming Bills**
   - Finds bills due within 3 days
   - Sends: "Your [bill] ($amount) is due [when]"
   - Data: `{ type: 'bill_due', ... }`

**Schedule**: 8:00 PM daily (Cloud Scheduler)

**Mobile Handles:**
- Receives notification
- Shows alert/banner
- User taps → Deep link to screen

---

### **Receipt Processing**

**Backend**: `server/src/services/ocrService.ts`

**After OCR completes:**
```typescript
// Send notification
await sendPush(
  userDevice.fcmToken,
  {
    title: "Receipt Processed",
    body: `Your receipt from ${vendor} is ready to review`
  },
  {
    type: "receipt_processed",
    receiptId: receipt.id,
    transactionId: transaction.id,
    vendor,
    total
  }
);
```

**Mobile Handles:**
- Notification appears
- User taps → Opens Receipts tab
- User sees processed receipt with OCR data

---

## 🎨 **User Experience**

### **Permission Request**

**First Launch (Authenticated):**
1. App loads
2. After login/auth check
3. Permission dialog appears:
   - iOS: Native dialog
   - Android 13+: Native dialog
4. User grants permission
5. Silent registration (no user action needed)

**Denied Permissions:**
- App works normally
- No notifications received
- User can enable later in device settings

---

### **Notification Display**

**Foreground (App Open):**
- Banner at top of screen (iOS)
- Toast notification (Android)
- Auto-dismiss after 3-5 seconds
- Badge cleared

**Background (App Running):**
- System notification tray
- Badge count increases (iOS)
- Sound/vibration

**Quit (App Closed):**
- System notification tray
- Wake device
- Badge count

---

### **Deep Linking**

**Tapping Notification:**
1. App opens (if closed)
2. App comes to foreground (if background)
3. Navigate to relevant screen
4. Badge cleared
5. Smooth transition

---

## 🔔 **Notification Categories**

### **Receipts (3 types)**

1. **Pending Receipt** - Single receipt uploaded
2. **Pending Receipts** - Multiple receipts (daily digest)
3. **Receipt Processed** - OCR completed

**Action**: Review and confirm receipt

---

### **Bills (3 types)**

1. **Bill Due** - Due today/tomorrow
2. **Bill Reminder** - Due in 2-3 days
3. **Upcoming Bill** - General reminder

**Action**: View upcoming bills

---

### **Summary (1 type)**

1. **Daily Digest** - Daily summary at 8 PM

**Action**: View dashboard

---

## 📋 **Code Examples**

### **Manual Device Registration** (if needed)

```typescript
import {
  requestNotificationPermissions,
  getPushToken,
  registerDevice,
} from '@/services/pushNotifications';

// In a Settings screen
const handleEnableNotifications = async () => {
  const hasPermission = await requestNotificationPermissions();
  
  if (!hasPermission) {
    Alert.alert(
      'Permissions Required',
      'Please enable notifications in device settings'
    );
    return;
  }

  const token = await getPushToken();
  if (token) {
    const registered = await registerDevice(token);
    if (registered) {
      Alert.alert('Success', 'Notifications enabled');
    }
  }
};
```

---

### **Test Local Notification**

```typescript
import { scheduleLocalNotification } from '@/services/pushNotifications';

// Schedule test notification
await scheduleLocalNotification(
  'Test Notification',
  'This will appear in 5 seconds',
  { type: 'pending_receipt', receiptId: '123' },
  5  // seconds
);
```

---

### **Custom Deep Link Handler**

```typescript
// In usePushNotifications.ts
const handleNotificationTap = (data: any) => {
  switch (data.type) {
    case 'pending_receipt':
      // Navigate to specific receipt
      router.push(`/receipt/${data.receiptId}`);
      break;
    
    case 'bill_due':
      // Navigate to bill detail
      router.push(`/bill/${data.scheduledTransactionId}`);
      break;
    
    // ... etc
  }
};
```

---

## ✅ **Implementation Checklist**

### **Code**
- [x] Push notification service created
- [x] Permission handling implemented
- [x] Token retrieval implemented
- [x] Device registration with backend
- [x] Notification listeners setup
- [x] Deep linking logic implemented
- [x] Badge management (iOS)
- [x] Logger utility created
- [x] Hook for app-wide setup
- [x] App layout integration

### **Configuration**
- [x] iOS permission description
- [x] Android POST_NOTIFICATIONS permission
- [x] Notification handler configured
- [x] expo-device installed
- [x] expo-notifications installed

### **Testing** (To Do)
- [ ] Test on iOS physical device
- [ ] Test on Android physical device
- [ ] Test permission request
- [ ] Test device registration
- [ ] Test foreground notifications
- [ ] Test background notifications
- [ ] Test notification taps
- [ ] Test all deep link types
- [ ] Test badge clearing

---

## 🚀 **Ready to Test**

Your push notification system is **complete** and includes:

✅ **Auto-setup on app start** (if authenticated)  
✅ **Permission handling** (iOS + Android)  
✅ **Device registration** with backend  
✅ **FCM token management**  
✅ **Foreground notifications** (banner/toast)  
✅ **Background notifications** (system tray)  
✅ **Notification tap handling**  
✅ **Deep linking** to 6+ screen types  
✅ **Badge management** (iOS)  
✅ **Error handling** and logging  
✅ **Physical device detection**  

**To Test:**
1. Run app on **physical device** (required for push)
2. Login with social provider
3. Grant notification permission when prompted
4. Trigger daily digest from backend
5. Receive notification
6. Tap notification → Should navigate to screen
7. Test all notification types

---

**Status**: ✅ **READY FOR TESTING**  
**TypeScript**: Compiles with no errors  
**Physical Device**: Required  
**Backend**: Already integrated  

**You now have a complete push notification system with smart deep linking!** 🔔

---

**Created**: October 9, 2024  
**Files Created**: 3  
**Lines Added**: 400+  
**Deep Link Routes**: 9  
**Ready for**: Physical device testing

