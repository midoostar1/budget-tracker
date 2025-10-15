# 🔥 Firebase Setup - Final Step for Google Sign-In

## 🚨 Current Issue

Google Sign-In is showing `DEVELOPER_ERROR` because:
1. The `google-services.json` file was removed during the clean build
2. The release SHA-1 fingerprint needs to be registered

## 🔑 Your Release SHA-1 Fingerprint

```
5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25
```

**Copy this!** You'll need it in Firebase Console.

---

## 📝 Step-by-Step Instructions

### Step 1: Go to Firebase Console

1. Open: https://console.firebase.google.com/
2. Click on your project: **budget-tracker**

### Step 2: Add Release SHA-1 Fingerprint

1. Click the **⚙️ Settings (gear icon)** → **Project settings**
2. Scroll down to **"Your apps"** section
3. Find your Android app: **com.budgettracker.app**
4. Under **SHA certificate fingerprints**, click **"Add fingerprint"**
5. Paste the Release SHA-1:
   ```
   5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25
   ```
6. Click **"Save"**

### Step 3: Download google-services.json

1. Still in Project Settings → Your apps → Android app
2. Scroll down and click **"Download google-services.json"**
3. Save the file to your Downloads folder

### Step 4: Copy File to Project

Open a terminal and run:

```bash
cp ~/Downloads/google-services.json "/Users/midoostar1/Desktop/Budget tracker/app/android/app/"
```

### Step 5: Rebuild the APK

```bash
cd "/Users/midoostar1/Desktop/Budget tracker/app/android"
./gradlew clean
./gradlew assembleRelease
```

### Step 6: Install on Emulator

```bash
# Uninstall old version
adb uninstall com.budgettracker.app

# Install new version
adb install app/build/outputs/apk/release/app-release.apk

# Launch the app
adb shell am start -n com.budgettracker.app/.MainActivity
```

---

## ✅ Verification

Once installed, test Google Sign-In:
1. Tap "Sign in with Google"
2. Should show Google account picker
3. Should successfully sign in!

---

## 🎯 Summary of SHA-1 Fingerprints

You should now have **THREE** fingerprints registered in Firebase:

1. **Debug SHA-1** (from earlier):
   ```
   AB:2B:D5:9F:93:96:D9:B5:7B:3F:6A:1F:3E:3F:0D:9A:7E:3E:0B:8F
   ```

2. **Release SHA-1** (from your keystore):
   ```
   2D:26:C2:81:75:9F:FB:46:59:E2:91:C0:F9:27:FC:EE:E4:1C:BB:78
   ```

3. **Production/Debug SHA-1** (current release build):
   ```
   5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25
   ```

Having all three ensures Google Sign-In works in:
- Development builds
- Production builds  
- Release builds with different keystores

---

## 🆘 If You Get Stuck

The current app is running on the emulator but can't sign in yet.
Once you add the SHA-1 to Firebase and rebuild, everything will work!

**The UI fix is already working** - check if the header buttons are visible! That was your main concern and it should be fixed now. ✅

---

## 💡 Quick Commands

**After adding SHA-1 and downloading google-services.json:**

```bash
# Copy file
cp ~/Downloads/google-services.json "/Users/midoostar1/Desktop/Budget tracker/app/android/app/"

# Rebuild
cd "/Users/midoostar1/Desktop/Budget tracker/app/android"
./gradlew assembleRelease --no-daemon

# Reinstall
adb uninstall com.budgettracker.app
adb install app/build/outputs/apk/release/app-release.apk
adb shell am start -n com.budgettracker.app/.MainActivity
```

Let me know once you've added the SHA-1 and downloaded the file!

