# 🚀 Quick Test Guide

## Server Status
✅ **Server is LIVE:** https://budget-api-813467044595.us-central1.run.app

Test it:
```bash
curl https://budget-api-813467044595.us-central1.run.app/health
# Should return: ok
```

---

## Build & Test in 3 Steps

### Step 1: Navigate to App Directory
```bash
cd "/Users/midoostar1/Desktop/Budget tracker/app"
```

### Step 2: Build Development Client
```bash
# Option A: Using the build script
./build-dev.sh

# Option B: Direct command
npx expo run:android --variant debug
```

This will:
- Build the Android APK with all native features
- Install it on your connected device/emulator
- Launch the app automatically
- Take ~5-10 minutes on first build

### Step 3: Test Complete Flow

#### A. Sign In
1. Tap **"Continue with Google"**
2. Select your Google account
3. Should redirect to Dashboard
4. ✅ Device registered for push notifications in background

#### B. Create Transaction
1. Go to **Transactions** tab
2. Tap **"+"** button
3. Enter transaction details:
   - Amount: `25.99`
   - Category: **Groceries**
   - Type: **Expense**
4. Tap **"Create Transaction"**
5. ✅ Transaction appears in list

#### C. Scan Receipt
1. Go to **Receipts** tab
2. Tap **"📷 Scan Receipt"**
3. Choose **"Choose from Gallery"** (or Take Photo)
4. Select a receipt image
5. Wait for upload (~2-3 seconds)
6. ✅ Success message appears
7. ✅ Receipt appears in pending list

#### D. Review Receipt
1. In Receipts tab, see your pending receipt
2. Tap **"Review & Confirm"**
3. Verify OCR data (if processed)
4. Edit amount, category, payee as needed
5. Tap **"Confirm"**
6. ✅ Receipt removed from pending
7. ✅ Transaction status updated to "cleared"

#### E. Test Quota (Free Tier)
1. Upload 10 receipts (repeat steps C-D 10 times)
2. On 11th upload:
   - ✅ Paywall modal opens automatically
   - ✅ Shows: "10/10 receipts used"
   - ✅ "Upgrade to Premium" button

---

## What's Been Implemented

### ✅ Authentication & Security
- Google/Apple/Facebook OAuth
- Secure token storage (SecureStore)
- Automatic token refresh on 401
- Auto logout on refresh failure
- Device registration for push notifications

### ✅ Receipt Management
- Camera integration
- Gallery picker
- Proper FormData upload
- Quota tracking
- Automatic paywall on limit

### ✅ Receipt Review
- Pending receipts list
- Receipt thumbnails (signed URLs)
- OCR status badges
- OCR data pre-fill
- Transaction confirmation
- Real-time UI updates

### ✅ Error Handling
- 401 → Token refresh
- 402 → Paywall modal
- Network errors → User alerts
- Validation errors → Field highlights

---

## API Endpoints Working

| Endpoint | Status | Purpose |
|----------|--------|---------|
| `/health` | ✅ | Server health check |
| `/api/auth/social-login` | ✅ | OAuth login |
| `/api/auth/refresh` | ✅ | Token refresh |
| `/api/users/register-device` | ✅ | Push notification registration |
| `/api/receipts/upload` | ✅ | Receipt upload |
| `/api/transactions` | ✅ | Get/create transactions |
| `/api/transactions/:id` | ✅ | Update transaction |

---

## Troubleshooting

### Build fails with "Java version"
```bash
export JAVA_HOME="/Users/midoostar1/Library/Java/JavaVirtualMachines/corretto-17.0.5/Contents/Home"
export PATH="$JAVA_HOME/bin:$PATH"
npx expo run:android --variant debug
```

### "Network Error" in app
1. Check server: `curl https://budget-api-813467044595.us-central1.run.app/health`
2. Verify `app.json` has correct API URL
3. Restart Metro bundler

### Google Sign In fails
1. Check `app.json` has correct `googleAndroidClientId`
2. Verify SHA-1 fingerprint in Google Console
3. Build with development client (not Expo Go)

### Camera doesn't work
- Must use development client (`npx expo run:android`)
- Expo Go doesn't support native camera on all devices
- Grant camera permissions when prompted

### Receipt upload fails
1. Check internet connection
2. Verify logged in (access token exists)
3. Check image file size < 10MB
4. Look at Metro bundler logs for errors

---

## Expected Behavior

### On First Launch
1. Shows login screen
2. No stored credentials
3. Clean slate

### After Google Sign In
1. Redirects to Dashboard
2. Token stored in SecureStore
3. Device registered (check backend logs)
4. Push notifications enabled (if granted)

### After Receipt Upload
1. Shows "Success" alert
2. Receipt appears in pending list
3. OCR processing starts (backend)
4. Status badge shows "⏳ Processing"
5. After ~30 seconds, badge updates to "✓ Processed"
6. OCR data appears in card

### After 10 Receipts (Free Tier)
1. 11th upload returns 402
2. QuotaExceededError thrown
3. PaywallModal opens automatically
4. Shows usage: "10/10 receipts used"
5. Can close modal (upload blocked until upgrade)

---

## Viewing Logs

### Backend Logs
```bash
gcloud run services logs read mobile-backend \
  --region=us-central1 \
  --limit=50
```

### Mobile App Logs
In Metro bundler terminal window, you'll see:
```
ℹ️ [INFO] Push token obtained
✅ Device registered successfully
📡 Uploading receipt...
✅ Receipt uploaded: txn_abc123
```

---

## Files Modified

1. ✅ `app/app.json` - Added cloud API URL
2. ✅ `app/src/services/api.ts` - Enhanced 401/402 handling
3. ✅ `app/app/login.tsx` - Added device registration
4. ✅ `app/src/services/receiptService.ts` - Improved FormData
5. ✅ `app/app/(tabs)/receipts.tsx` - Full camera + quota handling
6. ✅ `app/src/components/ConfirmReceiptModal.tsx` - Already complete
7. ✅ `app/src/components/PendingReceiptsList.tsx` - Already complete

---

## Ready to Test! 🎉

**Command:**
```bash
cd "/Users/midoostar1/Desktop/Budget tracker/app"
npx expo run:android --variant debug
```

**Then:**
1. Sign in with Google ✓
2. Create a transaction ✓
3. Scan a receipt ✓
4. Review and confirm ✓
5. Upload 10 more to see paywall ✓

---

**Everything is implemented and ready!** 🚀


