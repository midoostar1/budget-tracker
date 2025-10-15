# 📱 Pre-Play Store Testing Guide

## Complete Testing Checklist for Budget Tracker

Before uploading to Google Play Store, test your app thoroughly to ensure everything works perfectly.

---

## 🎯 Testing Strategy

### 1. Local Development Testing (Expo Go) ✅ Already Done
### 2. Development Build Testing (Production-like) ← YOU ARE HERE
### 3. Release Build Testing (Exact Play Store Version)
### 4. Beta Testing (Optional but Recommended)

---

## 🚀 Option 1: Test Development Build (Recommended)

This creates a standalone app with all native features working.

### Step 1: Build Development Client

```bash
cd /Users/midoostar1/Desktop/Budget\ tracker/app

# Make sure you're using Java 17
export JAVA_HOME="/Users/midoostar1/Library/Java/JavaVirtualMachines/corretto-17.0.5/Contents/Home"

# Build and install on connected device/emulator
npx expo run:android
```

**What this does:**
- ✅ Builds a standalone app
- ✅ Installs directly on your device
- ✅ Includes all native features (Google Sign-In, Camera, Push Notifications)
- ✅ Uses production API (cloud backend)

**Requirements:**
- Android device connected via USB, OR
- Android emulator running

---

## 📲 Option 2: Install the Release AAB (Exact Play Store Version)

Test the EXACT version that will go on Play Store.

### Step 1: Extract APK from AAB

```bash
cd /Users/midoostar1/Desktop/Budget\ tracker/app/android

# Install bundletool if not already installed
brew install bundletool

# Generate APKs from AAB
bundletool build-apks \
  --bundle=app/build/outputs/bundle/release/app-release.aab \
  --output=app/build/outputs/bundle/release/app-release.apks \
  --mode=universal \
  --ks=app/upload-keystore/budget-tracker-upload.keystore \
  --ks-pass=pass:budgettracker2025 \
  --ks-key-alias=budget-tracker-upload \
  --key-pass=pass:budgettracker2025

# Extract universal APK
unzip -p app/build/outputs/bundle/release/app-release.apks universal.apk > app/build/outputs/bundle/release/universal.apk
```

### Step 2: Install APK on Device

```bash
# Connect your Android device via USB
# Enable USB debugging on device (Settings → Developer Options → USB Debugging)

# Install the APK
adb install app/build/outputs/bundle/release/universal.apk
```

**This is the EXACT version users will get from Play Store!**

---

## ✅ Complete Testing Checklist

### 1. Backend Connection Testing

**Test:** App connects to cloud backend
```bash
# First, verify backend is running:
curl https://budget-api-813467044595.us-central1.run.app/health/detailed

# Should return: {"status":"healthy","database":"connected"}
```

**In App:**
- [ ] Open app (should not crash)
- [ ] Check if login screen loads
- [ ] No error messages about connection

---

### 2. Authentication Testing

#### Google Sign-In
- [ ] Tap "Sign in with Google"
- [ ] Google account picker appears
- [ ] Select account
- [ ] Sign in succeeds
- [ ] Navigates to main app screen
- [ ] User profile shows correct name/email

#### Sign Out / Sign In Again
- [ ] Go to Settings → Sign Out
- [ ] Returns to login screen
- [ ] Sign in again
- [ ] Previous data still there (persistent)

---

### 3. Core Features Testing

#### Transactions
- [ ] **Create Transaction**
  - Tap + button
  - Enter amount, description, category
  - Select date
  - Save successfully
  - Transaction appears in list

- [ ] **Edit Transaction**
  - Tap on transaction
  - Edit details
  - Save changes
  - Changes reflected immediately

- [ ] **Delete Transaction**
  - Swipe or tap delete
  - Confirm deletion
  - Transaction removed

- [ ] **Filter/Sort Transactions**
  - Filter by category
  - Filter by date range
  - Sort by amount/date
  - Results update correctly

#### Categories
- [ ] View all categories
- [ ] Create custom category
- [ ] Edit category name/color
- [ ] Delete category (if not in use)

---

### 4. Receipt Scanning Testing

**Camera Permissions:**
- [ ] First time: Permission prompt appears
- [ ] Allow camera access
- [ ] Camera view opens

**Receipt Upload:**
- [ ] **Take Photo**
  - Tap camera button
  - Take photo of receipt
  - Photo preview shows
  - Confirm photo

- [ ] **Upload from Gallery**
  - Tap gallery button
  - Select receipt image
  - Image uploads successfully

**OCR Processing:**
- [ ] Receipt processing starts
- [ ] Loading indicator shows
- [ ] OCR extracts data:
  - [ ] Merchant name
  - [ ] Total amount
  - [ ] Date
  - [ ] Line items (if available)
- [ ] Can edit extracted data
- [ ] Save as transaction

**Edge Cases:**
- [ ] Poor quality image → Shows error or asks to retry
- [ ] No receipt in photo → Handles gracefully
- [ ] Very large file → Uploads successfully or shows limit error

---

### 5. Reports & Analytics

- [ ] **Monthly Reports**
  - Navigate to Reports tab
  - Select current month
  - Chart displays correctly
  - Shows spending by category
  - Shows total income/expenses

- [ ] **Date Range Selection**
  - Change date range
  - Report updates
  - Data matches selected period

- [ ] **Export Reports** (if implemented)
  - Export as PDF/CSV
  - File downloads/shares correctly

---

### 6. Push Notifications Testing

**Setup:**
- [ ] First launch asks for notification permission
- [ ] Allow notifications

**Test Notifications:**

```bash
# From your computer, send a test notification via backend:
curl -X POST https://budget-api-813467044595.us-central1.run.app/api/users/test-notification \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Notification","body":"Testing push notifications"}'
```

- [ ] Notification appears on device
- [ ] Tap notification → Opens app
- [ ] Notification shows in notification center

**Scheduled Notifications:**
- [ ] Receipt reminders work
- [ ] Budget alerts work
- [ ] Monthly report notifications

---

### 7. Settings & Profile

- [ ] **Profile Screen**
  - Shows correct user info
  - Avatar/photo displays (if applicable)
  - Email shown correctly

- [ ] **App Settings**
  - Toggle notifications on/off → Works
  - Change currency → Updates throughout app
  - Change theme (if applicable) → UI updates
  - Language settings (if applicable)

- [ ] **About/Help**
  - Terms of Service loads
  - Privacy Policy loads
  - App version displays correctly

---

### 8. Performance Testing

**App Responsiveness:**
- [ ] App launches in < 3 seconds
- [ ] Screens load quickly
- [ ] No lag when scrolling lists
- [ ] Smooth animations
- [ ] No UI freezing

**Memory Usage:**
- [ ] Open app and use for 10 minutes
- [ ] Check Android Settings → Apps → Budget Tracker
- [ ] Memory usage reasonable (< 200 MB)
- [ ] No memory leaks (doesn't grow constantly)

**Battery Usage:**
- [ ] Use app for 30 minutes
- [ ] Check battery usage
- [ ] Should be minimal (< 5% for 30 min use)

---

### 9. Offline Behavior

**Test with Airplane Mode:**
- [ ] Enable Airplane mode
- [ ] Try to create transaction
- [ ] Shows offline message OR queues for later
- [ ] Previously loaded data still visible
- [ ] Disable Airplane mode
- [ ] Queued actions sync automatically

---

### 10. Edge Cases & Error Handling

**Network Errors:**
- [ ] Disconnect WiFi mid-operation
- [ ] Shows appropriate error message
- [ ] Can retry operation
- [ ] Doesn't crash

**Invalid Input:**
- [ ] Enter negative amounts → Handled correctly
- [ ] Enter very large numbers → No overflow
- [ ] Enter special characters → Validates properly
- [ ] Leave required fields empty → Shows validation

**Storage:**
- [ ] Upload many receipts (10+)
- [ ] Check storage usage is reasonable
- [ ] Old receipts still accessible

**Session:**
- [ ] Leave app open for 1 hour
- [ ] Come back to app
- [ ] Still works (or asks to re-login)
- [ ] No data loss

---

### 11. Different Android Versions

Test on multiple Android versions if possible:

**Minimum (Android 7.0 / API 24):**
- [ ] App installs
- [ ] All features work

**Mid-range (Android 10-12):**
- [ ] Full functionality
- [ ] UI looks good

**Latest (Android 14):**
- [ ] All features work
- [ ] Takes advantage of new features

---

### 12. Different Screen Sizes

**Phone (Normal):**
- [ ] UI fits correctly
- [ ] All buttons accessible
- [ ] Text readable

**Small Phone:**
- [ ] UI doesn't cut off
- [ ] Scrolling works

**Tablet (if supported):**
- [ ] Layout adapts
- [ ] Uses screen space well

---

## 🔧 Testing Tools & Commands

### Check App Logs
```bash
# View app logs in real-time
adb logcat | grep -i "budget\|error\|crash"

# Clear and view fresh logs
adb logcat -c && adb logcat
```

### Monitor Network Requests
```bash
# Check what API calls the app makes
adb logcat | grep -i "http\|api\|fetch"
```

### Check App Info
```bash
# Get app package info
adb shell dumpsys package com.budgettracker.app | grep -i version

# Check permissions
adb shell dumpsys package com.budgettracker.app | grep permission
```

### Performance Monitoring
```bash
# Monitor memory
adb shell dumpsys meminfo com.budgettracker.app

# Monitor CPU
adb shell top | grep com.budgettracker.app
```

---

## 🐛 Common Issues & Fixes

### Issue: Google Sign-In Not Working
**Fix:**
1. Check SHA-1 certificate registered in Firebase
2. Verify Google Client IDs are correct
3. Check internet connection
4. Try with different Google account

### Issue: Camera Not Opening
**Fix:**
1. Check camera permission granted
2. Close other apps using camera
3. Restart app
4. Check device camera works in other apps

### Issue: Push Notifications Not Received
**Fix:**
1. Check notification permission granted
2. Verify Firebase token registered
3. Check device not in Do Not Disturb mode
4. Test with test notification endpoint

### Issue: Data Not Syncing
**Fix:**
1. Check internet connection
2. Verify backend is running (curl health endpoint)
3. Check API URL in app.json is correct
4. Look at network logs in adb logcat

---

## 📊 Test Results Template

Use this to track your testing:

```
DEVICE INFO:
- Model: _____________
- Android Version: _____________
- Screen Size: _____________

AUTHENTICATION: ☐ Pass ☐ Fail
  Notes: _____________

TRANSACTIONS: ☐ Pass ☐ Fail
  Notes: _____________

RECEIPTS: ☐ Pass ☐ Fail
  Notes: _____________

REPORTS: ☐ Pass ☐ Fail
  Notes: _____________

NOTIFICATIONS: ☐ Pass ☐ Fail
  Notes: _____________

PERFORMANCE: ☐ Pass ☐ Fail
  Notes: _____________

OFFLINE MODE: ☐ Pass ☐ Fail
  Notes: _____________

CRITICAL BUGS FOUND: _____________
_________________________________
_________________________________
```

---

## 🎯 Beta Testing (Optional but Recommended)

### Internal Testing (Google Play Console)

1. **Upload to Internal Testing Track**
   - Go to Play Console
   - Select your app
   - Release → Testing → Internal testing
   - Create new release
   - Upload AAB
   - Add internal testers (email addresses)

2. **Test for 1-2 Days**
   - Share test link with testers
   - Collect feedback
   - Fix critical bugs

3. **Promote to Production**
   - When stable, promote to production

**Benefits:**
- Real users test the app
- Catch issues you might miss
- Builds confidence before public release

---

## ✅ Final Pre-Launch Checklist

Before uploading to Play Store:

**Technical:**
- [ ] All tests passed on at least 2 devices
- [ ] No critical bugs found
- [ ] App doesn't crash
- [ ] Backend is stable and running
- [ ] All API endpoints working

**Compliance:**
- [ ] Privacy policy created and accessible
- [ ] Terms of service created
- [ ] Permissions properly explained
- [ ] No sensitive data logged

**Store Listing:**
- [ ] Screenshots taken (4-8 images)
- [ ] App description written
- [ ] Feature graphic created (1024x500)
- [ ] All assets ready

**Final Verification:**
- [ ] Test the AAB one more time
- [ ] Backend health check passes
- [ ] Backup keystore file (CRITICAL!)

---

## 🚀 Quick Test Command

Run this complete test sequence:

```bash
# 1. Verify backend
curl https://budget-api-813467044595.us-central1.run.app/health/detailed

# 2. Build and install app
cd /Users/midoostar1/Desktop/Budget\ tracker/app
export JAVA_HOME="/Users/midoostar1/Library/Java/JavaVirtualMachines/corretto-17.0.5/Contents/Home"
npx expo run:android

# 3. Watch logs
adb logcat -c && adb logcat | grep -i "budget\|error"

# Then manually test all features on device!
```

---

## 📱 Recommended Testing Flow

**Day 1: Core Features**
1. Build app
2. Test authentication
3. Test transactions CRUD
4. Test basic navigation

**Day 2: Advanced Features**
1. Test receipt scanning
2. Test reports
3. Test notifications
4. Check performance

**Day 3: Edge Cases**
1. Test offline mode
2. Test error scenarios
3. Test on different devices
4. Final polish

**Day 4: Beta Test (Optional)**
1. Upload to internal testing
2. Get feedback
3. Fix issues

**Day 5: Launch!**
1. Final verification
2. Upload to production
3. Submit for review

---

## 🎊 When You're Ready

Once all tests pass:
1. ✅ Upload AAB to Play Store
2. ✅ Complete store listing
3. ✅ Submit for review
4. ✅ Go live! 🚀

**Good luck with your testing!** 🎉

---

## 📞 Need Help?

If you encounter issues:
1. Check logs: `adb logcat`
2. Check backend: `curl [API_URL]/health/detailed`
3. Review error messages
4. Check this guide's troubleshooting section

