# Budget Tracker Mobile App

## 📱 Overview

React Native mobile application for Budget Tracker built with Expo, featuring social authentication, transaction management, receipt scanning with OCR, and push notifications.

**Status**: ✅ **Initial Setup Complete**

---

## 🏗️ Project Structure

```
app/
├── app/                        # Expo Router file-based routing
│   ├── _layout.tsx            # Root layout with providers
│   ├── index.tsx              # Entry point / redirect
│   └── (tabs)/                # Tab navigation group
│       ├── _layout.tsx        # Tab layout
│       ├── dashboard.tsx      # Dashboard screen
│       ├── transactions.tsx   # Transactions screen
│       ├── receipts.tsx       # Receipts screen
│       └── settings.tsx       # Settings screen
│
├── src/
│   ├── screens/               # Additional screens (outside tabs)
│   ├── components/            # Reusable components
│   ├── services/              # API services
│   │   ├── api.ts            # Axios instance with interceptors
│   │   ├── authService.ts    # Authentication API
│   │   ├── transactionService.ts  # Transaction API
│   │   └── receiptService.ts  # Receipt API
│   ├── state/                # State management (Zustand)
│   │   └── authStore.ts      # Auth state
│   ├── navigation/           # Navigation utilities
│   ├── hooks/                # Custom React hooks
│   │   ├── useAuth.ts        # Auth hook
│   │   └── useTransactions.ts # Transaction hooks
│   ├── theme/                # Theme configuration
│   │   ├── colors.ts         # Color palette
│   │   └── index.ts          # Complete theme
│   ├── types/                # TypeScript types
│   │   └── index.ts          # API types
│   ├── utils/                # Utility functions
│   └── config/               # App configuration
│       └── env.ts            # Environment variables
│
├── assets/                   # Images, fonts, etc.
├── package.json              # Dependencies and scripts
├── app.json                  # Expo configuration
└── tsconfig.json             # TypeScript configuration
```

---

## 🚀 **Getting Started**

### **Prerequisites**

- Node.js 20+
- npm or yarn
- iOS Simulator (Mac only) or Android Emulator
- Expo Go app (for physical device testing)

### **Installation**

```bash
cd app

# Install dependencies
npm install

# Start development server
npm start
```

### **Running the App**

```bash
# iOS Simulator (Mac only)
npm run ios

# Android Emulator
npm run android

# Web browser
npm run web

# Scan QR code with Expo Go app
npm start
```

---

## 📦 **Installed Libraries**

### **Core**
- ✅ **expo** (~54.0.12) - Expo SDK
- ✅ **expo-router** (~6.0.10) - File-based routing
- ✅ **react** (19.1.0) - UI library
- ✅ **react-native** (0.81.4) - Mobile framework

### **Navigation**
- ✅ **expo-router** - File-based routing with tabs
- ✅ **react-native-screens** - Native screen optimization
- ✅ **react-native-safe-area-context** - Safe area support

### **State Management**
- ✅ **zustand** (5.0.8) - Lightweight state management
- ✅ **@tanstack/react-query** (5.90.2) - Server state management

### **Networking**
- ✅ **axios** (1.12.2) - HTTP client

### **Validation**
- ✅ **zod** (3.25.76) - Schema validation

### **Authentication**
- ✅ **@react-native-google-signin/google-signin** (16.0.0)
- ✅ **react-native-fbsdk-next** (13.4.1)
- ✅ **@invertase/react-native-apple-authentication** (2.4.1)

### **Expo Modules**
- ✅ **expo-secure-store** - Encrypted storage
- ✅ **expo-notifications** - Push notifications
- ✅ **expo-image-picker** - Image selection
- ✅ **expo-camera** - Camera access
- ✅ **expo-constants** - Environment configuration

---

## 🗂️ **Key Features**

### **Implemented**

✅ **Tab Navigation**
- Dashboard
- Transactions  
- Receipts
- Settings

✅ **Theme System**
- Color palette
- Spacing, typography, shadows
- Light/dark mode ready

✅ **State Management**
- Zustand for auth state
- React Query for server state
- Secure token storage

✅ **API Integration**
- Axios client configured
- Auto token refresh
- Request/response interceptors
- Type-safe API services

✅ **TypeScript**
- Strict type checking
- Path aliases configured
- Complete type definitions

---

## 🎨 **Theme Configuration**

### **Colors**

**Primary**: `#6366f1` (Indigo)  
**Success/Income**: `#10b981` (Green)  
**Error/Expense**: `#ef4444` (Red)  
**Warning**: `#f59e0b` (Amber)  

### **Usage**

```typescript
import { theme } from '@/theme';

<View style={{ backgroundColor: theme.colors.primary }}>
  <Text style={{ fontSize: theme.fontSize.lg }}>
    Hello
  </Text>
</View>
```

---

## 🔐 **Authentication**

### **Supported Providers**

- Google Sign-In
- Apple Sign In (iOS only)
- Facebook Login

### **Auth Flow**

1. User taps social login button
2. Native SDK handles OAuth flow
3. App receives provider token
4. Send to backend `/api/auth/social-login`
5. Receive access token + user data
6. Store securely with SecureStore
7. Set up automatic token refresh

### **Implementation**

```typescript
import { useAuth } from '@/hooks/useAuth';
import { authService } from '@/services/authService';

// In a component
const { login } = useAuth();

// After successful Google Sign-In
const googleToken = await GoogleSignIn.signIn();

const response = await authService.socialLogin({
  provider: 'google',
  token: googleToken.idToken,
});

await login(response.user, response.accessToken);
```

---

## 📡 **API Integration**

### **Configuration**

Set API base URL in `app.json`:

```json
{
  "expo": {
    "extra": {
      "apiBaseUrl": "http://localhost:3000"
    }
  }
}
```

Or use environment variables (recommended for production).

### **Using API Services**

```typescript
import { transactionService } from '@/services/transactionService';
import { useTransactions } from '@/hooks/useTransactions';

// Using React Query hook (recommended)
const { data, isLoading } = useTransactions({
  page: 1,
  limit: 20,
  type: 'expense',
});

// Direct service call
const stats = await transactionService.getStats();
```

---

## 🎯 **Next Steps**

### **Phase 1: Authentication Screens**
- [ ] Create login screen
- [ ] Implement Google Sign-In
- [ ] Implement Apple Sign In
- [ ] Implement Facebook Login
- [ ] Add loading states
- [ ] Handle errors

### **Phase 2: Dashboard**
- [ ] Fetch and display stats
- [ ] Add monthly summary chart
- [ ] Show recent transactions
- [ ] Display pending receipts count

### **Phase 3: Transactions**
- [ ] Fetch and display transaction list
- [ ] Add filtering UI
- [ ] Implement create transaction form
- [ ] Add edit/delete functionality
- [ ] Pull-to-refresh

### **Phase 4: Receipts**
- [ ] Integrate camera/gallery picker
- [ ] Upload receipt image
- [ ] Display processing status
- [ ] Show OCR results
- [ ] Review and confirm transaction

### **Phase 5: Settings**
- [ ] Complete profile screen
- [ ] Category management
- [ ] Notification preferences
- [ ] Device management
- [ ] Export reports

### **Phase 6: Polish**
- [ ] Add icons (react-native-vector-icons)
- [ ] Loading skeletons
- [ ] Error boundaries
- [ ] Offline support
- [ ] Animations
- [ ] Dark mode toggle

---

## 🛠️ **Development**

### **Available Scripts**

```bash
# Start Expo dev server
npm start

# iOS Simulator
npm run ios

# Android Emulator
npm run android

# Web browser
npm run web

# Type check
npx tsc --noEmit

# Clear cache
npx expo start -c
```

### **Debugging**

```bash
# React Native Debugger
# Install: https://github.com/jhen0409/react-native-debugger

# Remote debugging
# Shake device → "Debug Remote JS"

# View logs
npx react-native log-ios
npx react-native log-android
```

---

## 📱 **Platform Configuration**

### **iOS**

**Required:**
- Xcode 14+
- iOS Simulator or physical device
- CocoaPods installed

**Setup:**
```bash
cd ios
pod install
cd ..
npm run ios
```

**Permissions** (already in app.json):
- Camera usage
- Photo library usage

### **Android**

**Required:**
- Android Studio
- Android SDK
- Android Emulator or physical device

**Permissions** (already in app.json):
- Camera
- Read external storage
- Write external storage

---

## 🔧 **Configuration**

### **Environment Variables**

Create `app.json` extra configuration:

```json
{
  "expo": {
    "extra": {
      "apiBaseUrl": "https://your-api.com",
      "googleWebClientId": "your-client-id",
      "googleIosClientId": "your-ios-client-id",
      "googleAndroidClientId": "your-android-client-id",
      "facebookAppId": "your-facebook-app-id"
    }
  }
}
```

**For local development:**
```json
"apiBaseUrl": "http://localhost:3000"
```

**For production (EAS Build):**
Use `.env` files with EAS configuration.

---

## 🚀 **Building for Production**

### **iOS (TestFlight)**

```bash
# Install EAS CLI
npm install -g eas-cli

# Configure
eas build:configure

# Build for iOS
eas build --platform ios --profile production

# Submit to App Store
eas submit --platform ios
```

### **Android (Play Store)**

```bash
# Build for Android
eas build --platform android --profile production

# Submit to Play Store
eas submit --platform android
```

---

## 📚 **Documentation**

### **Resources**

- [Expo Documentation](https://docs.expo.dev/)
- [Expo Router Docs](https://docs.expo.dev/router/introduction/)
- [React Query Docs](https://tanstack.com/query/latest)
- [Zustand Docs](https://github.com/pmndrs/zustand)

### **Backend API**

See `../server/API_COMPLETE_REFERENCE.md` for complete API documentation.

---

## 🔗 **Path Aliases**

Configured in `tsconfig.json`:

```typescript
import Button from '@/components/Button';
import { useAuth } from '@/hooks/useAuth';
import api from '@/services/api';
import { theme } from '@/theme';
import { User } from '@/types';
```

---

## 🧪 **Testing**

### **Setup Testing** (future)

```bash
npm install --save-dev jest @testing-library/react-native
```

### **Run Tests**

```bash
npm test
```

---

## 📦 **Dependencies Summary**

**Total**: 860+ packages

**Key Production Dependencies:**
- React Native ecosystem
- Expo SDK modules
- Auth provider SDKs
- React Query
- Zustand
- Axios
- Zod

---

## 🎯 **Current Status**

### **✅ Complete**
- [x] Expo app initialized
- [x] TypeScript configured
- [x] Folder structure created
- [x] Navigation setup (tabs)
- [x] Theme system
- [x] State management (Zustand)
- [x] API client (Axios)
- [x] Auth provider libraries installed
- [x] Basic screens created
- [x] Type definitions
- [x] Custom hooks
- [x] Service layer

### **🚧 To Implement**
- [ ] Authentication UI
- [ ] Transaction screens
- [ ] Receipt camera/upload
- [ ] Push notification setup
- [ ] Report viewing
- [ ] Profile management

---

## 🔔 **Push Notifications Setup**

### **iOS**

1. Enable push notifications in Xcode
2. Configure APNs in Firebase
3. Request permission in app
4. Register device with backend

### **Android**

1. Add `google-services.json`
2. Configure Firebase
3. Request permission in app
4. Register device with backend

### **Code Example**

```typescript
import * as Notifications from 'expo-notifications';

// Request permission
const { status } = await Notifications.requestPermissionsAsync();

if (status === 'granted') {
  // Get FCM token
  const token = await Notifications.getExpoPushTokenAsync();
  
  // Register with backend
  await api.post('/api/users/register-device', {
    fcmToken: token.data,
    platform: Platform.OS,
  });
}
```

---

## 🎨 **UI Components** (To Build)

Recommended component library:
- React Native Paper
- NativeBase
- React Native Elements

Or build custom components using the theme system.

---

## 📖 **Learning Resources**

1. **Getting Started**: Read this README
2. **API Integration**: Review `../server/API_COMPLETE_REFERENCE.md`
3. **Auth Flow**: See `../server/AUTH_IMPLEMENTATION.md`
4. **Expo Router**: https://docs.expo.dev/router/introduction/

---

## 🆘 **Troubleshooting**

### **Metro bundler issues**

```bash
# Clear cache and restart
npx expo start -c
```

### **iOS build issues**

```bash
cd ios
pod deintegrate
pod install
cd ..
```

### **Android build issues**

```bash
cd android
./gradlew clean
cd ..
```

### **API connection issues**

- Check `apiBaseUrl` in configuration
- Verify backend is running
- Check network connectivity
- Review CORS configuration

---

**Created**: October 9, 2024  
**Expo SDK**: 54  
**React Native**: 0.81  
**Status**: ✅ Initial Setup Complete

