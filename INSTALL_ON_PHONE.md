# 📱 How to Install Budget Tracker on Your Phone

## Quick Install via ADB (Easiest)

If your phone is connected to your computer via USB:

```bash
# Enable USB debugging on your phone first!
# Settings → About Phone → Tap "Build Number" 7 times
# Settings → Developer Options → Enable "USB Debugging"

# Then run:
adb install /Users/midoostar1/Desktop/Budget\ tracker/releases/BudgetTracker-v1.0.0.apk
```

The app will install automatically!

---

## Manual Install (No USB Cable Needed)

### Method 1: Email
1. Email the APK to yourself
2. Open the email on your phone
3. Download the attachment
4. Tap the downloaded APK file
5. Enable "Install unknown apps" if prompted
6. Tap "Install"

### Method 2: Google Drive
1. Upload `BudgetTracker-v1.0.0.apk` to Google Drive
2. Open Google Drive on your phone
3. Download the APK
4. Tap to install

### Method 3: Direct Download
1. Put the APK on a web server or Dropbox
2. Open the link on your phone's browser
3. Download and install

---

## First Time Setup

After installing:

1. **Open the app**
2. **Tap "Sign in with Google"**
3. **Choose your Google account**
4. **Grant permissions** (camera, storage, notifications)
5. **Start using the app!**

---

## What to Test

### ✅ Authentication
- [ ] Google Sign-In works
- [ ] Can sign out and sign back in
- [ ] Profile shows correct info

### ✅ UI & Navigation
- [ ] Header buttons are visible (not hidden behind notch/status bar)
- [ ] All tabs work (Dashboard, Transactions, Receipts, Reports, Settings)
- [ ] No layout issues
- [ ] Colors and fonts look good

### ✅ Transactions
- [ ] Can add new transaction
- [ ] Can edit transaction
- [ ] Can delete transaction
- [ ] Can filter transactions
- [ ] Amounts calculate correctly

### ✅ Receipts
- [ ] Can take photo with camera
- [ ] Can upload from gallery
- [ ] OCR text extraction works
- [ ] Receipt saves with transaction

### ✅ Reports
- [ ] Charts display correctly
- [ ] Data is accurate
- [ ] Can filter by date range
- [ ] Export works (if implemented)

### ✅ Settings
- [ ] Can update profile
- [ ] Can change preferences
- [ ] Can manage notifications
- [ ] Logout works

### ✅ Push Notifications
- [ ] Receives notifications (test from backend)
- [ ] Notifications open correct screen
- [ ] Can enable/disable notifications

---

## If Google Sign-In Doesn't Work

This means the SHA-1 fingerprints aren't registered. Run:

```bash
# Get the release SHA-1
cd /Users/midoostar1/Desktop/Budget\ tracker/app/android
./gradlew signingReport
```

Then add the release SHA-1 to Firebase Console:
1. Go to Firebase Console
2. Project Settings → Your apps → Android app
3. Add the SHA-1 fingerprint
4. Download new `google-services.json`
5. Replace the one in `app/android/app/`
6. Rebuild the app

---

## Uninstall Command

If you need to uninstall:

```bash
adb uninstall com.budgettracker.app
```

Or manually from phone: Settings → Apps → Budget Tracker → Uninstall

---

## 🎯 Once Testing is Complete

If everything works perfectly:
1. ✅ All features tested
2. ✅ No crashes or bugs
3. ✅ Google Sign-In works
4. ✅ UI looks good

**Then you're ready to submit to Play Store!**

Upload `BudgetTracker-v1.0.0.aab` to Google Play Console.

---

## Need to Rebuild?

If you make any changes to the code:

```bash
cd /Users/midoostar1/Desktop/Budget\ tracker/app/android
./gradlew clean
./gradlew assembleRelease
./gradlew bundleRelease
```

New files will be in:
- APK: `android/app/build/outputs/apk/release/app-release.apk`
- AAB: `android/app/build/outputs/bundle/release/app-release.aab`

---

## 📞 Support

If you encounter any issues:
1. Check the logs: `adb logcat | grep BudgetTracker`
2. Verify backend is running: https://budget-api-813467044595.us-central1.run.app/health
3. Check Firebase Console for auth issues
4. Review Google Cloud Console for backend errors

---

## 🎊 Congratulations!

Your app is ready for the world! Test it thoroughly on your phone, then submit to the Play Store!

