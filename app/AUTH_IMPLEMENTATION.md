# Authentication Implementation Guide

## 🔐 Complete Mobile Authentication Flow

This guide covers the complete authentication implementation in the Budget Tracker mobile app.

---

## 📁 **Files Created**

### **1. Login Screen**
**File**: `app/login.tsx`

**Features:**
- ✅ Three social login buttons (Google, Apple, Facebook)
- ✅ Loading states per provider
- ✅ Error handling with user-friendly alerts
- ✅ Platform-specific rendering (Apple iOS only)
- ✅ Disabled state management
- ✅ Auto-redirect to dashboard on success

**Usage:**
```typescript
// Automatically shown to unauthenticated users
// Accessible at: /login
```

### **2. Social Auth Service**
**File**: `src/services/socialAuth.ts`

**Functions:**
- `initializeGoogleSignIn()` - Configure Google SDK
- `signInWithGoogle()` - Complete Google flow
- `signInWithApple()` - Complete Apple flow (iOS only)
- `signInWithFacebook()` - Complete Facebook flow
- `signOutFromProviders()` - Clean up all provider sessions

**Flow:**
1. Call provider SDK
2. Get ID token or access token
3. Send to backend `/api/auth/social-login`
4. Receive user + access token
5. Return to login screen

### **3. Auth Gate Component**
**File**: `src/components/AuthGate.tsx`

**Features:**
- ✅ Automatic route protection
- ✅ Redirect unauthenticated users to login
- ✅ Redirect authenticated users to dashboard
- ✅ Loading state while checking auth
- ✅ Listens to auth state changes

**How it Works:**
```typescript
// Wraps the entire app
<AuthGate>
  <Stack>
    {/* All routes */}
  </Stack>
</AuthGate>

// Checks authentication on every route change
// Redirects based on auth status
```

### **4. Updated Files**

**`app/_layout.tsx`:**
- Added `AuthGate` wrapper
- Added `login` screen to stack

**`app/index.tsx`:**
- Updated to redirect based on auth status
- `/` → `/login` (if unauthenticated)
- `/` → `/(tabs)/dashboard` (if authenticated)

---

## 🔄 **Authentication Flow**

### **Complete Flow Diagram**

```
┌─────────────────────────────────────────────────────────────┐
│ 1. App Launch                                               │
│    - Load stored auth from SecureStore                      │
│    - Show loading screen                                    │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
            ┌────────┴────────┐
            │ Is Authenticated?│
            └────────┬────────┘
                     │
          ┌──────────┴───────────┐
          │                      │
          ▼ No                   ▼ Yes
    ┌─────────┐            ┌──────────┐
    │  Login  │            │Dashboard │
    │ Screen  │            │  Screen  │
    └────┬────┘            └──────────┘
         │
         ▼
    ┌────────────────────────────────────────┐
    │ 2. User Taps Social Login Button       │
    │    - Show loading indicator            │
    │    - Disable other buttons             │
    └────────────────┬───────────────────────┘
                     │
                     ▼
    ┌────────────────────────────────────────┐
    │ 3. Provider SDK Authentication         │
    │    Google: GoogleSignin.signIn()       │
    │    Apple: appleAuth.performRequest()   │
    │    Facebook: LoginManager.login()      │
    └────────────────┬───────────────────────┘
                     │
                     ▼
    ┌────────────────────────────────────────┐
    │ 4. Get Provider Token                  │
    │    Google: idToken                     │
    │    Apple: identityToken                │
    │    Facebook: accessToken               │
    └────────────────┬───────────────────────┘
                     │
                     ▼
    ┌────────────────────────────────────────┐
    │ 5. POST to Backend API                 │
    │    POST /api/auth/social-login         │
    │    {                                   │
    │      provider: 'google',               │
    │      token: 'xxx',                     │
    │      email: 'user@example.com'         │
    │    }                                   │
    └────────────────┬───────────────────────┘
                     │
                     ▼
    ┌────────────────────────────────────────┐
    │ 6. Backend Verification                │
    │    - Verify token with provider        │
    │    - Upsert user in database           │
    │    - Generate JWT access token         │
    │    - Generate refresh token            │
    │    - Set refresh in HTTP-only cookie   │
    └────────────────┬───────────────────────┘
                     │
                     ▼
    ┌────────────────────────────────────────┐
    │ 7. Store Tokens in Mobile App         │
    │    - Access token → SecureStore        │
    │    - User data → SecureStore           │
    │    - Refresh token → Cookie (auto)     │
    │    - Update Zustand state              │
    └────────────────┬───────────────────────┘
                     │
                     ▼
    ┌────────────────────────────────────────┐
    │ 8. Navigate to Dashboard               │
    │    router.replace('/(tabs)/dashboard') │
    └────────────────────────────────────────┘
```

---

## 🔐 **Token Management**

### **Access Token**
- **Storage**: SecureStore (encrypted)
- **Lifetime**: 15 minutes
- **Usage**: Attached to every API request
- **Format**: JWT Bearer token

```typescript
// Stored in SecureStore
await SecureStore.setItemAsync('access_token', token);

// Auto-attached by axios interceptor
api.interceptors.request.use(async (config) => {
  const { accessToken } = useAuthStore.getState();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});
```

### **Refresh Token**
- **Storage**: HTTP-only cookie (server manages)
- **Lifetime**: 30 days
- **Usage**: Auto-refresh access token on 401
- **Rotation**: New token generated on each refresh

```typescript
// Auto-refresh on 401 error
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Refresh token automatically
      const response = await api.post('/api/auth/refresh');
      const { accessToken } = response.data;
      
      // Update stored token
      await useAuthStore.getState().setAccessToken(accessToken);
      
      // Retry original request
      return api(originalRequest);
    }
    return Promise.reject(error);
  }
);
```

### **User Data**
- **Storage**: SecureStore (encrypted)
- **Updated**: On login and refresh
- **Cleared**: On logout

```typescript
interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  provider: 'google' | 'apple' | 'facebook';
}
```

---

## 🎯 **API Integration**

### **Social Login Endpoint**

```typescript
POST /api/auth/social-login

// Request
{
  provider: 'google' | 'apple' | 'facebook',
  token: string,           // ID token or access token
  email?: string,          // Optional for Apple
  firstName?: string,      // Optional
  lastName?: string        // Optional
}

// Response
{
  user: {
    id: string,
    email: string,
    firstName?: string,
    lastName?: string,
    provider: string,
    createdAt: string,
    updatedAt: string
  },
  accessToken: string,
  message: string
}

// Cookies Set
Set-Cookie: refreshToken=xxx; HttpOnly; Secure; SameSite=Strict
```

### **Refresh Token Endpoint**

```typescript
POST /api/auth/refresh

// Request (no body, cookie sent automatically)

// Response
{
  accessToken: string,
  message: string
}

// Cookies Set (new refresh token)
Set-Cookie: refreshToken=yyy; HttpOnly; Secure; SameSite=Strict
```

### **Logout Endpoint**

```typescript
POST /api/auth/logout

// Request
Headers: Authorization: Bearer <access-token>

// Response
{
  message: 'Logged out successfully'
}

// Cookies Cleared
Set-Cookie: refreshToken=; Max-Age=0
```

---

## 🛡️ **Security Features**

### **1. Secure Token Storage**
- ✅ Access tokens in SecureStore (encrypted)
- ✅ Refresh tokens in HTTP-only cookies
- ✅ No tokens in AsyncStorage or state
- ✅ Tokens cleared on logout

### **2. Token Refresh**
- ✅ Automatic refresh on 401 errors
- ✅ Retry failed requests with new token
- ✅ Token rotation for security
- ✅ Refresh token stored in secure cookie

### **3. Provider Token Verification**
- ✅ Backend verifies all provider tokens
- ✅ Google: Verify ID token with Google API
- ✅ Apple: Verify identity token with Apple
- ✅ Facebook: Verify access token with Facebook

### **4. Error Handling**
- ✅ User-friendly error messages
- ✅ Network error handling
- ✅ Invalid token handling
- ✅ Expired token handling
- ✅ Cancelled authentication handling

---

## 🎨 **UI/UX Features**

### **Login Screen**

**Features:**
- Beautiful gradient background
- Large, easy-to-tap buttons
- Loading indicators per button
- Disabled state for other buttons during login
- Platform-specific buttons (Apple iOS only)
- Terms of service notice

**States:**
- **Idle**: All buttons enabled
- **Loading**: Active button shows spinner, others disabled
- **Error**: Alert dialog with error message
- **Success**: Auto-navigate to dashboard

### **AuthGate**

**States:**
- **Loading**: Full-screen activity indicator
- **Authenticated**: Show protected routes
- **Unauthenticated**: Redirect to login

**Smart Redirects:**
- Login → Dashboard (if already authenticated)
- Protected Route → Login (if not authenticated)
- Root → Dashboard (if authenticated)
- Root → Login (if not authenticated)

---

## 🧪 **Testing Guide**

### **1. Test Google Sign-In**

```bash
# iOS
npm run ios
# Tap "Continue with Google"
# Select Google account
# Should redirect to dashboard

# Android
npm run android
# Tap "Continue with Google"
# Select Google account
# Should redirect to dashboard
```

**Expected Flow:**
1. Button shows loading spinner
2. Native Google Sign-In dialog appears
3. User selects account
4. App receives ID token
5. Backend verifies and creates/updates user
6. Tokens stored in SecureStore
7. Navigate to dashboard
8. Dashboard shows user email

### **2. Test Apple Sign In** (iOS only)

```bash
# Physical iOS device required
eas build --profile development --platform ios

# Install on device
# Tap "Continue with Apple"
# Face ID/Touch ID authentication
# Should redirect to dashboard
```

**Expected Flow:**
1. Apple Sign In dialog appears
2. User authenticates with Face ID/Touch ID
3. User can hide email or use real email
4. App receives identity token
5. Backend verifies and creates user
6. Navigate to dashboard

### **3. Test Facebook Login**

```bash
# iOS or Android
npm run ios  # or npm run android

# Tap "Continue with Facebook"
# Login with Facebook test user
# Should redirect to dashboard
```

**Expected Flow:**
1. Facebook login dialog or webview
2. User enters credentials
3. User grants permissions
4. App receives access token
5. Backend verifies token
6. Navigate to dashboard

### **4. Test Auth Persistence**

```bash
# 1. Login with any provider
# 2. Close app (force quit)
# 3. Reopen app
# Expected: Should stay logged in, show dashboard
```

### **5. Test Logout**

```bash
# 1. From Settings screen
# 2. Tap "Logout"
# Expected: Clear tokens, navigate to login
```

### **6. Test Token Refresh**

```bash
# 1. Login
# 2. Wait 15+ minutes (or modify token expiry)
# 3. Make an API request
# Expected: Auto-refresh access token, request succeeds
```

---

## 🔧 **Configuration Checklist**

Before testing, ensure:

### **Environment**
- [ ] `API_BASE_URL` set in `app.json`
- [ ] Backend running and accessible
- [ ] All OAuth client IDs configured

### **Google**
- [ ] Web client ID in `app.json`
- [ ] iOS client ID in `app.json`
- [ ] Android client ID in `app.json`
- [ ] SHA-1 fingerprints added to Firebase
- [ ] `GoogleService-Info.plist` (iOS)
- [ ] `google-services.json` (Android)

### **Apple**
- [ ] Bundle ID matches Apple Developer Portal
- [ ] `usesAppleSignIn: true` in `app.json`
- [ ] Sign In with Apple enabled in portal
- [ ] Physical iOS device for testing

### **Facebook**
- [ ] App ID in `app.json`
- [ ] Client token in `app.json`
- [ ] Key hashes added to Facebook app
- [ ] Facebook app configured for iOS/Android
- [ ] Test users created

### **Backend**
- [ ] `/api/auth/social-login` endpoint working
- [ ] `/api/auth/refresh` endpoint working
- [ ] `/api/auth/logout` endpoint working
- [ ] Token verification working for all providers
- [ ] CORS configured for mobile app

---

## 📊 **State Management**

### **Auth Store (Zustand)**

```typescript
interface AuthState {
  user: User | null;              // Current user
  accessToken: string | null;     // JWT token
  isAuthenticated: boolean;       // Auth status
  isLoading: boolean;             // Initial load
  
  setUser: (user) => void;        // Update user
  setAccessToken: (token) => Promise<void>;  // Store token
  login: (user, token) => Promise<void>;     // Login flow
  logout: () => Promise<void>;               // Logout flow
  loadStoredAuth: () => Promise<void>;       // Load on app start
}
```

**Usage:**
```typescript
import { useAuthStore } from '@/state/authStore';

// In components
const { user, isAuthenticated, logout } = useAuthStore();

// Access store directly
const token = useAuthStore.getState().accessToken;
```

---

## 🐛 **Common Issues & Solutions**

### **Google Sign-In**

**Issue**: "Developer Error"
**Solution**: 
- Check SHA-1 fingerprint is correct
- Ensure client IDs match bundle/package
- Download latest service config files

**Issue**: "Sign in was cancelled"
**Solution**: User cancelled - not an error

### **Apple Sign In**

**Issue**: Not available
**Solution**: 
- Only works on iOS 13+
- Only works on physical devices
- Check bundle ID matches

**Issue**: "Invalid Client"
**Solution**: Enable in Apple Developer Portal

### **Facebook Login**

**Issue**: Invalid key hash
**Solution**: Regenerate and add to Facebook app

**Issue**: Login cancelled
**Solution**: User cancelled - not an error

### **API Integration**

**Issue**: 401 Unauthorized
**Solution**: 
- Check backend is running
- Verify API_BASE_URL is correct
- Check token is being sent

**Issue**: Network request failed
**Solution**:
- Check API URL
- Check backend CORS settings
- Verify network connectivity

---

## 📱 **Platform-Specific Notes**

### **iOS**

**Requirements:**
- Xcode 14+
- iOS 13+ for Apple Sign In
- Physical device for Apple Sign In
- Development provisioning profile

**Testing:**
```bash
# Simulator (Google & Facebook only)
npm run ios

# Physical device (all providers)
eas build --profile development --platform ios
```

### **Android**

**Requirements:**
- Android Studio
- Android SDK 21+ (Lollipop)
- Google Play Services
- Release signing for production

**Testing:**
```bash
# Emulator (all providers)
npm run android

# Physical device
eas build --profile development --platform android
```

---

## ✅ **Implementation Checklist**

### **Code**
- [x] Login screen created
- [x] Social auth service implemented
- [x] AuthGate component created
- [x] App layout updated
- [x] Index redirect updated
- [x] Auth store configured
- [x] API integration complete
- [x] Error handling implemented

### **Configuration** (To Do)
- [ ] Update `app.json` with OAuth client IDs
- [ ] Download and add service config files
- [ ] Configure iOS app in portals
- [ ] Configure Android app in portals
- [ ] Set up test users
- [ ] Test on physical devices

### **Backend** (Already Done ✅)
- [x] Social login endpoint
- [x] Token refresh endpoint
- [x] Logout endpoint
- [x] Token verification
- [x] User management

---

## 📚 **Related Documentation**

- **[SOCIAL_AUTH_SETUP.md](./SOCIAL_AUTH_SETUP.md)** - Platform configuration
- **[../server/AUTH_IMPLEMENTATION.md](../server/AUTH_IMPLEMENTATION.md)** - Backend auth
- **[README.md](./README.md)** - Mobile app overview

---

**Status**: ✅ **Implementation Complete**  
**Ready for**: Configuration and testing  
**Estimated Testing Time**: 2-3 hours  
**Platform Support**: iOS 13+ | Android 5.0+

