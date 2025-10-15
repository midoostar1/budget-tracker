# 📱 Budget Tracker - How to Run & Test

## 🚀 EASIEST WAY (Recommended)

### **Single Command - Does Everything:**

```bash
cd /Users/midoostar1/Desktop/Budget\ tracker/app && npx expo start --android
```

This automatically:
- ✅ Starts Metro bundler
- ✅ Builds the app
- ✅ Installs on emulator
- ✅ Launches the app
- ✅ Shows logs
- ✅ Enables hot reload

**Press `Ctrl+C` to stop.**

---

## 📋 Step-by-Step Commands

### **1. Start Emulator (if not running):**

```bash
emulator -avd Pixel_9_Pro > /dev/null 2>&1 &
```

Wait for it to boot:
```bash
adb wait-for-device
```

### **2. Run the App with Metro:**

```bash
cd /Users/midoostar1/Desktop/Budget\ tracker/app
npx expo start --android
```

### **3. View Logs (in another terminal):**

**Errors only:**
```bash
adb logcat '*:E' | grep -E "ReactNative|budgettracker"
```

**All app activity:**
```bash
adb logcat | grep -E "ReactNative|budgettracker|Google|Auth"
```

**Save to file:**
```bash
adb logcat > ~/Desktop/app-logs.txt
```

---

## 🔄 Common Operations

### **Restart the App:**
```bash
adb shell am force-stop com.budgettracker.app && adb shell am start -n com.budgettracker.app/.MainActivity
```

### **Clear Metro Cache & Restart:**
```bash
cd /Users/midoostar1/Desktop/Budget\ tracker/app
npx expo start --android --clear
```

### **Uninstall App:**
```bash
adb uninstall com.budgettracker.app
```

### **Check if Emulator is Running:**
```bash
adb devices
```

### **Check if App is Installed:**
```bash
adb shell pm list packages | grep budgettracker
```

---

## 🐛 Troubleshooting

### **"Unable to load script" Error:**
This means Metro bundler isn't running or the bundle isn't included in the APK.

**Solution:** Use `npx expo start --android` instead of building APK directly.

### **"Activity does not exist" Error:**
App isn't installed.

**Solution:** Run `npx expo start --android` to install it.

### **Out of Space Error:**
Emulator is full.

**Solution:** Create a new emulator with 8GB+ storage in Android Studio.

---

## 🎯 Testing Google Sign-In

1. **Start app with Metro:**
   ```bash
   cd /Users/midoostar1/Desktop/Budget\ tracker/app
   npx expo start --android
   ```

2. **Wait for app to load on emulator**

3. **Tap "Sign in with Google"**

4. **Select your Google account**

5. **✅ You should be signed in!**

6. **Test features:**
   - Check if header buttons are visible/clickable
   - Create a transaction
   - Upload a receipt
   - Check settings

---

## 📊 Log Filters (ZSH-Compatible)

**Errors only:**
```bash
adb logcat -c && adb logcat '*:E' | grep -E "ReactNative|budgettracker"
```

**Warnings and errors:**
```bash
adb logcat -c && adb logcat '*:W' '*:E' | grep -E "ReactNative|budgettracker"
```

**Specific tags:**
```bash
adb logcat ReactNativeJS:V '*:S'
```

**Everything (verbose):**
```bash
adb logcat | grep -i budgettracker
```

---

## 🎊 Current Status

**Backend:** ✅ Working  
**Google Sign-In:** ✅ Working  
**Database:** ✅ Ready  
**UI Fix:** ✅ In code (will show with Metro)

---

## ⚡ Quick Start Template

**Copy-paste this entire block:**

```bash
# Kill any existing Metro
pkill -f "expo start" 2>/dev/null || true

# Start fresh
cd /Users/midoostar1/Desktop/Budget\ tracker/app
npx expo start --android --clear
```

**Then in another terminal for logs:**
```bash
adb logcat '*:E' | grep -E "ReactNative|budgettracker"
```

---

**That's it! The app will run with all your latest changes including the UI fix!** 🚀

