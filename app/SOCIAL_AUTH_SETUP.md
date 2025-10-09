# Social Authentication Setup Guide

## 📱 Complete iOS & Android Configuration

This guide covers all required setup for Google Sign-In, Apple Sign In, and Facebook Login on both platforms.

---

## 🔐 **1. Google Sign-In**

### **Prerequisites**
- Google Cloud Console project
- OAuth 2.0 Client IDs (Web, iOS, Android)

### **A. Get OAuth Client IDs**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create or select a project
3. Navigate to **APIs & Services → Credentials**
4. Create OAuth 2.0 Client IDs:

**Web Client ID:**
```
Application type: Web application
Name: Budget Tracker Web
```

**iOS Client ID:**
```
Application type: iOS
Name: Budget Tracker iOS
Bundle ID: com.budgettracker.app
```

**Android Client ID:**
```
Application type: Android
Name: Budget Tracker Android
Package name: com.budgettracker.app
SHA-1 certificate fingerprint: <your-debug/release-sha1>
```

### **B. Get SHA-1 Fingerprint (Android)**

**Debug SHA-1:**
```bash
cd android
./gradlew signingReport
# Look for SHA1 under "Variant: debug"
```

**Release SHA-1:**
```bash
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
```

### **C. iOS Configuration**

1. **Update `app.json`:**
```json
{
  "expo": {
    "ios": {
      "bundleIdentifier": "com.budgettracker.app",
      "googleServicesFile": "./GoogleService-Info.plist"
    }
  }
}
```

2. **Download `GoogleService-Info.plist`:**
   - From Firebase Console: Project Settings → iOS app
   - Place in `app/` directory

3. **Update `Info.plist` (if building locally):**
```xml
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleTypeRole</key>
    <string>Editor</string>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>com.googleusercontent.apps.YOUR-IOS-CLIENT-ID</string>
    </array>
  </dict>
</array>
```

### **D. Android Configuration**

1. **Update `app.json`:**
```json
{
  "expo": {
    "android": {
      "package": "com.budgettracker.app",
      "googleServicesFile": "./google-services.json"
    }
  }
}
```

2. **Download `google-services.json`:**
   - From Firebase Console: Project Settings → Android app
   - Place in `app/` directory

3. **No additional AndroidManifest.xml changes needed** (handled by Expo)

### **E. Environment Variables**

Update `app.json`:
```json
{
  "expo": {
    "extra": {
      "googleWebClientId": "YOUR-WEB-CLIENT-ID.apps.googleusercontent.com",
      "googleIosClientId": "YOUR-IOS-CLIENT-ID.apps.googleusercontent.com",
      "googleAndroidClientId": "YOUR-ANDROID-CLIENT-ID.apps.googleusercontent.com"
    }
  }
}
```

---

## 🍎 **2. Apple Sign In** (iOS Only)

### **Prerequisites**
- Apple Developer Account ($99/year)
- App ID with Sign In with Apple capability

### **A. Apple Developer Setup**

1. Go to [Apple Developer Portal](https://developer.apple.com/)
2. Navigate to **Certificates, Identifiers & Profiles**
3. Select **Identifiers** → **App IDs**
4. Create or edit your App ID:
   - **Bundle ID**: `com.budgettracker.app`
   - **Capabilities**: Enable "Sign in with Apple"
5. Click **Save**

### **B. iOS Configuration**

1. **Update `app.json`:**
```json
{
  "expo": {
    "ios": {
      "bundleIdentifier": "com.budgettracker.app",
      "usesAppleSignIn": true
    },
    "plugins": [
      "@invertase/react-native-apple-authentication"
    ]
  }
}
```

2. **Entitlements automatically handled** by Expo plugin

### **C. Environment Variables**

```json
{
  "expo": {
    "extra": {
      "appleServiceId": "com.budgettracker.app"
    }
  }
}
```

### **D. Testing**

**Important:**
- Apple Sign In **only works on physical iOS devices**
- Simulator support is limited
- Requires iOS 13+

---

## 📘 **3. Facebook Login**

### **Prerequisites**
- Facebook Developer Account
- Facebook App created

### **A. Facebook App Setup**

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app or select existing
3. Add **Facebook Login** product
4. Configure settings:

**iOS:**
- Bundle ID: `com.budgettracker.app`
- Enable Single Sign-On

**Android:**
- Package Name: `com.budgettracker.app`
- Default Activity Class: `.MainActivity`
- Key Hashes (Debug & Release)

### **B. Get Android Key Hash**

**Debug Key Hash:**
```bash
keytool -exportcert -alias androiddebugkey -keystore ~/.android/debug.keystore | openssl sha1 -binary | openssl base64
# Password: android
```

**Release Key Hash:**
```bash
keytool -exportcert -alias YOUR_RELEASE_KEY_ALIAS -keystore YOUR_RELEASE_KEY_PATH | openssl sha1 -binary | openssl base64
```

### **C. iOS Configuration**

1. **Update `app.json`:**
```json
{
  "expo": {
    "ios": {
      "bundleIdentifier": "com.budgettracker.app",
      "infoPlist": {
        "FacebookAppID": "YOUR-FACEBOOK-APP-ID",
        "FacebookClientToken": "YOUR-CLIENT-TOKEN",
        "FacebookDisplayName": "Budget Tracker",
        "LSApplicationQueriesSchemes": [
          "fbapi",
          "fb-messenger-share-api",
          "fbauth2",
          "fbshareextension"
        ],
        "CFBundleURLTypes": [
          {
            "CFBundleURLSchemes": [
              "fbYOUR-FACEBOOK-APP-ID"
            ]
          }
        ]
      }
    }
  }
}
```

### **D. Android Configuration**

1. **Update `app.json`:**
```json
{
  "expo": {
    "android": {
      "package": "com.budgettracker.app"
    },
    "plugins": [
      [
        "react-native-fbsdk-next",
        {
          "appID": "YOUR-FACEBOOK-APP-ID",
          "clientToken": "YOUR-CLIENT-TOKEN",
          "displayName": "Budget Tracker",
          "scheme": "fbYOUR-FACEBOOK-APP-ID",
          "advertiserIDCollectionEnabled": false,
          "autoLogAppEventsEnabled": false,
          "isAutoInitEnabled": true
        }
      ]
    ]
  }
}
```

2. **No additional AndroidManifest.xml changes** (handled by plugin)

### **E. Environment Variables**

```json
{
  "expo": {
    "extra": {
      "facebookAppId": "YOUR-FACEBOOK-APP-ID"
    }
  }
}
```

---

## 🔧 **Complete app.json Example**

```json
{
  "expo": {
    "name": "Budget Tracker",
    "slug": "budget-tracker",
    "version": "1.0.0",
    "scheme": "budgettracker",
    "ios": {
      "bundleIdentifier": "com.budgettracker.app",
      "usesAppleSignIn": true,
      "googleServicesFile": "./GoogleService-Info.plist",
      "supportsTablet": true,
      "infoPlist": {
        "NSCameraUsageDescription": "Budget Tracker needs camera access to scan receipts",
        "NSPhotoLibraryUsageDescription": "Budget Tracker needs photo library access for receipts",
        "FacebookAppID": "YOUR-FACEBOOK-APP-ID",
        "FacebookClientToken": "YOUR-FB-CLIENT-TOKEN",
        "FacebookDisplayName": "Budget Tracker",
        "LSApplicationQueriesSchemes": [
          "fbapi",
          "fb-messenger-share-api",
          "fbauth2",
          "fbshareextension"
        ],
        "CFBundleURLTypes": [
          {
            "CFBundleURLSchemes": [
              "com.googleusercontent.apps.YOUR-IOS-CLIENT-ID",
              "fbYOUR-FACEBOOK-APP-ID"
            ]
          }
        ]
      }
    },
    "android": {
      "package": "com.budgettracker.app",
      "googleServicesFile": "./google-services.json",
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#6366f1"
      },
      "permissions": [
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE",
        "INTERNET"
      ]
    },
    "plugins": [
      "expo-router",
      "expo-secure-store",
      "expo-camera",
      "expo-image-picker",
      "@invertase/react-native-apple-authentication",
      [
        "expo-notifications",
        {
          "icon": "./assets/notification-icon.png",
          "color": "#6366f1"
        }
      ],
      [
        "react-native-fbsdk-next",
        {
          "appID": "YOUR-FACEBOOK-APP-ID",
          "clientToken": "YOUR-FB-CLIENT-TOKEN",
          "displayName": "Budget Tracker",
          "scheme": "fbYOUR-FACEBOOK-APP-ID"
        }
      ]
    ],
    "extra": {
      "router": {
        "origin": false
      },
      "eas": {
        "projectId": "your-eas-project-id"
      },
      "apiBaseUrl": "http://localhost:3000",
      "googleWebClientId": "YOUR-WEB-CLIENT-ID.apps.googleusercontent.com",
      "googleIosClientId": "YOUR-IOS-CLIENT-ID.apps.googleusercontent.com",
      "googleAndroidClientId": "YOUR-ANDROID-CLIENT-ID.apps.googleusercontent.com",
      "appleServiceId": "com.budgettracker.app",
      "facebookAppId": "YOUR-FACEBOOK-APP-ID"
    }
  }
}
```

---

## 🧪 **Testing**

### **Development Testing**

```bash
# Start development server
npm start

# iOS Simulator (Google & Facebook only - no Apple)
npm run ios

# Android Emulator (Google & Facebook)
npm run android

# Physical Device (All providers)
# Scan QR code with Expo Go or build development client
```

### **Test Accounts**

**Google:**
- Create test users in Google Cloud Console
- No restrictions for development

**Apple:**
- Use Sandbox testers
- Configure in App Store Connect → Users and Access

**Facebook:**
- Add test users in Facebook App Dashboard
- Settings → Roles → Test Users

---

## 🏗️ **Building for Production**

### **EAS Build Configuration**

Create `eas.json`:
```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "simulator": false
      }
    },
    "production": {
      "env": {
        "API_BASE_URL": "https://your-api.com"
      }
    }
  }
}
```

### **Build Commands**

```bash
# Install EAS CLI
npm install -g eas-cli

# Login
eas login

# Configure project
eas build:configure

# Build for iOS
eas build --platform ios --profile production

# Build for Android
eas build --platform android --profile production
```

---

## 🔍 **Troubleshooting**

### **Google Sign-In**

**Error: "Developer Error"**
- Check SHA-1 fingerprint is correct
- Ensure OAuth client IDs match bundle/package IDs
- Web client ID must be configured

**iOS: "No valid client ID"**
- Download `GoogleService-Info.plist` from Firebase
- Place in root of `app/` directory
- Rebuild app

**Android: Play Services Error**
- Ensure `google-services.json` is in correct location
- Enable Google Sign-In in Firebase Console

### **Apple Sign In**

**Not Available Error**
- Only works on iOS 13+
- Only works on physical devices
- Enable capability in Apple Developer Portal

**Invalid Client**
- Bundle ID must match exactly
- Enable "Sign in with Apple" capability

### **Facebook Login**

**Invalid Key Hash**
- Regenerate key hash for current keystore
- Add both debug and release key hashes
- Use correct Facebook App ID

**Login Cancelled**
- Check Facebook app is configured correctly
- Verify permissions requested

---

## 📚 **Additional Resources**

### **Official Documentation**
- [Google Sign-In for React Native](https://github.com/react-native-google-signin/google-signin)
- [Apple Sign In](https://github.com/invertase/react-native-apple-authentication)
- [Facebook SDK for React Native](https://github.com/thebergamo/react-native-fbsdk-next)
- [Expo Auth Session](https://docs.expo.dev/guides/authentication/)

### **Backend Integration**
- See `../server/AUTH_IMPLEMENTATION.md` for backend setup
- API endpoint: `POST /api/auth/social-login`
- Token verification implementation

---

## ✅ **Checklist**

### **Google Sign-In**
- [ ] Created OAuth client IDs (Web, iOS, Android)
- [ ] Added SHA-1 fingerprints (Android)
- [ ] Downloaded `GoogleService-Info.plist` (iOS)
- [ ] Downloaded `google-services.json` (Android)
- [ ] Updated `app.json` with client IDs
- [ ] Tested on device

### **Apple Sign In**
- [ ] Enabled in Apple Developer Portal
- [ ] Updated `app.json` with bundle ID
- [ ] Set `usesAppleSignIn: true`
- [ ] Tested on physical iOS device

### **Facebook Login**
- [ ] Created Facebook App
- [ ] Added platform configurations
- [ ] Generated key hashes (Android)
- [ ] Updated `app.json` with App ID
- [ ] Added plugin configuration
- [ ] Tested on device

---

**Status**: Ready for implementation after configuration  
**Estimated Setup Time**: 1-2 hours  
**Platform Support**: iOS 13+ | Android 5.0+

