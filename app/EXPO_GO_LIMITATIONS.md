# Expo Go Limitations & Workarounds

## ⚠️ **Current Testing Environment: Expo Go**

The app is running in **Expo Go**, which has limitations with native modules.

---

## 🚫 **Not Available in Expo Go**

### **1. Social Authentication**
- ❌ Google Sign-In (`@react-native-google-signin/google-signin`)
- ❌ Apple Sign In (`@invertase/react-native-apple-authentication`)
- ❌ Facebook Login (`react-native-fbsdk-next`)

**Impact**: Cannot test social login flows

**Workaround**: 
- Error messages show: "Requires development build"
- Can test UI, just can't complete login

---

### **2. Push Notifications**
- ❌ Full expo-notifications functionality
- ❌ Device registration
- ❌ Background notifications
- ❌ Deep linking from notifications

**Impact**: Cannot test push notification features

**Workaround**:
- Features gracefully degrade
- Console warnings instead of crashes
- Can test notification UI/settings

---

## ✅ **What DOES Work in Expo Go**

### **Fully Functional**
✅ Navigation (tabs, modals, routes)  
✅ UI components (all screens)  
✅ Forms and validation  
✅ State management (Zustand, React Query)  
✅ Animations (FAB, modals)  
✅ API integration (if backend running)  
✅ Transaction management  
✅ Receipt display  
✅ Settings screens  
✅ Privacy/Terms pages  
✅ Paywall modal  
✅ Empty states  
✅ Error handling  

### **Testable Features**
- Visual design and layout
- Navigation flow
- Form inputs
- Data fetching (with mock auth)
- List rendering
- Modal presentations
- Animations
- Empty states
- Error states

---

## 🏗️ **To Test Full Functionality**

### **Option 1: EAS Development Build** (Recommended)

```bash
# Install EAS CLI
npm install -g eas-cli

# Login
eas login

# Configure
eas build:configure

# Build development client
eas build --profile development --platform android

# Install on device
# Download APK and install
```

**Benefits:**
- All native modules work
- Social login functional
- Push notifications work
- Camera access
- Production-like environment

---

### **Option 2: Local Build**

```bash
# Generate native projects
npx expo prebuild

# Build with Android Studio
cd android
./gradlew assembleDebug

# Install APK
adb install app/build/outputs/apk/debug/app-debug.apk
```

---

## 🧪 **What to Test in Expo Go**

### **Recommended Testing Path**

**1. Visual & UX** ✅
- Launch app
- Navigate through all tabs
- Open modals
- Test animations
- Check layouts
- Verify colors and spacing

**2. Navigation** ✅
- Tab switching
- Modal open/close
- Back navigation
- Route protection (will see login redirect)

**3. Forms** ✅
- Add transaction form
- All inputs work
- Validation works
- Can submit (if backend running)

**4. Lists & Data** ✅
- Transaction list renders
- Pull to refresh
- Infinite scroll
- Empty states
- Error states

**5. Settings** ✅
- Profile display
- Subscription card
- Privacy/Terms navigation
- Menu items
- Logout (will show error about social providers, but local logout works)

**6. Paywall** ✅
- Can manually show paywall
- UI renders correctly
- Plan selection works
- Benefits display
- CTA buttons work

---

## 🎯 **Current Session**

**What You Can Test Right Now:**

```bash
# App is running on: exp://10.233.142.238:8082
# Android emulator: Pixel_9_Pro
```

**Available for Testing:**
1. ✅ Visual design (all screens)
2. ✅ Navigation (tabs, modals)
3. ✅ Settings screen
4. ✅ Privacy Policy content
5. ✅ Terms of Service content
6. ✅ Paywall modal UI
7. ✅ Transaction list UI
8. ✅ Forms and inputs
9. ✅ Animations

**Not Available:**
- ❌ Social login (Expo Go limitation)
- ❌ Push notifications (Expo Go limitation)
- ❌ Camera upload (can test with development build)

---

## 💡 **Workarounds Applied**

### **Conditional Imports** ✅

The code now gracefully handles missing native modules:

```typescript
// Instead of crashing, shows user-friendly error
try {
  GoogleSignin = require('@react-native-google-signin/google-signin');
} catch (e) {
  console.warn('Not available in Expo Go');
}

// Then in function:
if (!GoogleSignin) {
  throw new Error('Requires development build');
}
```

**Result**: App doesn't crash, shows helpful error message

---

## 🔄 **Next Steps**

### **For Full Testing**

```bash
# Build development client
eas build --profile development --platform android

# This will take 10-15 minutes
# Results in an APK with all native modules
# Install and test full functionality
```

### **For Now (Expo Go)**

Focus on:
- UI/UX review
- Layout testing
- Navigation flow
- Component behavior
- Visual design
- Forms and validation

---

**The app is running! You can now navigate and test UI features.** 📱

Press `r` in terminal to reload after code changes.

