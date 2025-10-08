# Quick Setup Guide

This guide will walk you through setting up the mobile authentication system step by step.

## Prerequisites Checklist

- [ ] Node.js 18+ installed
- [ ] MongoDB installed (or MongoDB Atlas account)
- [ ] Expo CLI: `npm install -g expo-cli`
- [ ] Git installed

## Step 1: Install Dependencies

### Backend
```bash
cd backend
npm install
```

### Mobile
```bash
cd mobile
npm install
```

## Step 2: Configure Provider Accounts

### Google (Firebase)

1. **Create Firebase Project**
   - Visit: https://console.firebase.google.com/
   - Click "Add project"
   - Name your project (e.g., "Mobile Auth App")
   - Disable Google Analytics (optional)
   
2. **Enable Google Authentication**
   - In Firebase Console → Authentication
   - Click "Get Started"
   - Click "Sign-in method" tab
   - Enable "Google" provider
   - Click "Save"

3. **Add iOS App**
   - Project Settings → General → Your apps
   - Click iOS icon
   - iOS bundle ID: `com.yourcompany.mobileauthapp`
   - Download `GoogleService-Info.plist`
   - Save to `mobile/` directory

4. **Add Android App**
   - Click Android icon
   - Package name: `com.yourcompany.mobileauthapp`
   - Get SHA-1: Run `expo credentials:manager` → Select Android
   - Download `google-services.json`
   - Save to `mobile/` directory

5. **Get Web Client ID**
   - Go to Google Cloud Console: https://console.cloud.google.com/
   - Select your Firebase project
   - APIs & Services → Credentials
   - Copy the "Web client" OAuth 2.0 Client ID

### Apple Sign-In (iOS Only)

1. **Prerequisites**
   - Apple Developer Account ($99/year)
   - Visit: https://developer.apple.com/

2. **Create App ID**
   - Certificates, IDs & Profiles → Identifiers
   - Click "+" → App IDs → Continue
   - Description: "Mobile Auth App"
   - Bundle ID: `com.yourcompany.mobileauthapp`
   - Capabilities: Check "Sign In with Apple"
   - Click "Continue" → "Register"

3. **Create Service ID** (for backend verification)
   - Identifiers → "+" → Services IDs
   - Description: "Mobile Auth Backend"
   - Identifier: `com.yourcompany.mobileauthapp.backend`
   - Enable "Sign In with Apple"
   - Configure → Add domain and return URLs
   - Click "Save" → "Continue" → "Register"

4. **Create Key**
   - Keys → "+"
   - Key Name: "Apple Sign In Key"
   - Enable "Sign In with Apple"
   - Configure → Select your App ID
   - Click "Continue" → "Register"
   - Download `.p8` file
   - Save as `backend/apple-key.p8`
   - **Important**: Note the Key ID (you'll need it)

5. **Get Team ID**
   - Top right corner of Apple Developer → Membership
   - Copy Team ID

### Facebook

1. **Create Facebook App**
   - Visit: https://developers.facebook.com/
   - My Apps → Create App
   - Use case: "Other"
   - App type: "Consumer"
   - App name: "Mobile Auth App"
   - Click "Create App"

2. **Add Facebook Login**
   - Dashboard → Add Product
   - Find "Facebook Login" → Set Up
   - Choose "iOS" and "Android"

3. **Configure iOS**
   - Settings → Basic → Add Platform → iOS
   - Bundle ID: `com.yourcompany.mobileauthapp`
   - Enable Single Sign On: Yes

4. **Configure Android**
   - Add Platform → Android
   - Google Play Package Name: `com.yourcompany.mobileauthapp`
   - Class Name: `com.yourcompany.mobileauthapp.MainActivity`
   - Key Hashes:
     ```bash
     # Development hash
     keytool -exportcert -alias androiddebugkey \
       -keystore ~/.android/debug.keystore | \
       openssl sha1 -binary | openssl base64
     # Password: android
     ```
   - Add the hash to Facebook Console

5. **Get Credentials**
   - Settings → Basic
   - Copy App ID
   - Show App Secret → Copy it

## Step 3: Environment Configuration

### Backend `.env`

Create `backend/.env`:

```env
# Server
PORT=3000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/mobile-auth
# Or MongoDB Atlas: mongodb+srv://user:pass@cluster.mongodb.net/mobile-auth

# JWT Secrets (generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
JWT_ACCESS_SECRET=<generate_random_32_byte_hex>
JWT_REFRESH_SECRET=<generate_random_32_byte_hex>
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Google OAuth (from Firebase)
GOOGLE_CLIENT_ID=<your_web_client_id>.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=<from_google_cloud_console>

# Apple Sign In
APPLE_CLIENT_ID=com.yourcompany.mobileauthapp
APPLE_TEAM_ID=<your_team_id>
APPLE_KEY_ID=<your_key_id>
APPLE_PRIVATE_KEY_PATH=./apple-key.p8

# Facebook
FACEBOOK_APP_ID=<your_facebook_app_id>
FACEBOOK_APP_SECRET=<your_facebook_app_secret>

# CORS
ALLOWED_ORIGINS=http://localhost:19006,exp://localhost:19000
```

### Mobile `.env`

Create `mobile/.env`:

```env
# Backend API
API_URL=http://localhost:3000
# For physical device, use your computer's IP:
# API_URL=http://192.168.1.x:3000

# Firebase (from Firebase Console → Project Settings)
FIREBASE_API_KEY=<your_api_key>
FIREBASE_AUTH_DOMAIN=<your_project>.firebaseapp.com
FIREBASE_PROJECT_ID=<your_project_id>
FIREBASE_STORAGE_BUCKET=<your_project>.appspot.com
FIREBASE_MESSAGING_SENDER_ID=<your_sender_id>
FIREBASE_APP_ID=<your_app_id>

# Google Client IDs (from Google Cloud Console)
GOOGLE_IOS_CLIENT_ID=<ios_client_id>.apps.googleusercontent.com
GOOGLE_ANDROID_CLIENT_ID=<android_client_id>.apps.googleusercontent.com
GOOGLE_WEB_CLIENT_ID=<web_client_id>.apps.googleusercontent.com

# Facebook
FACEBOOK_APP_ID=<your_facebook_app_id>

# Bundle identifiers (match your Apple/Google configs)
IOS_BUNDLE_ID=com.yourcompany.mobileauthapp
ANDROID_PACKAGE_NAME=com.yourcompany.mobileauthapp
```

## Step 4: Start the Application

### Terminal 1 - MongoDB
```bash
# If using local MongoDB
mongod

# If using MongoDB Atlas, skip this step
```

### Terminal 2 - Backend
```bash
cd backend
npm run dev
```

You should see:
```
✅ MongoDB connected
🚀 Server running on port 3000
📱 Environment: development
```

### Terminal 3 - Mobile App
```bash
cd mobile
npm start
```

Choose your platform:
- Press `i` for iOS simulator
- Press `a` for Android emulator
- Scan QR code for physical device

## Step 5: Test the Application

1. **Welcome Screen**: Should load successfully
2. **Sign In Screen**: Click "Get Started"
3. **Test Each Provider**:
   - Google Sign-In (may need additional setup for mobile)
   - Apple Sign-In (iOS only, iOS 13+ required)
   - Facebook Sign-In
4. **Profile Screen**: After successful login
5. **Logout**: Test logout functionality

## Troubleshooting

### Backend won't start
- Check MongoDB is running
- Verify `.env` file exists and has correct values
- Check port 3000 is not in use

### Mobile app can't connect to backend
- For physical devices, use your computer's local IP address
- Ensure firewall allows connections on port 3000
- Verify `API_URL` in mobile `.env`

### Google Sign-In fails
- Verify `google-services.json` / `GoogleService-Info.plist` are in place
- Check SHA-1 certificate is added (Android)
- Ensure Web Client ID is used in backend

### Apple Sign-In not available
- Only works on real iOS devices or iOS 13+ simulator
- Check `usesAppleSignIn` is true in `app.json`
- Verify bundle ID matches App ID

### Facebook Sign-In fails
- Check App ID in `.env` files
- Verify platform configurations in Facebook Console
- Ensure key hash is correct (Android)

## Next Steps

- [ ] Customize the UI in mobile screens
- [ ] Add error tracking (Sentry)
- [ ] Set up analytics
- [ ] Add rate limiting to backend
- [ ] Implement tests
- [ ] Prepare for production deployment

## Production Checklist

Before deploying to production:

- [ ] Change all JWT secrets to strong random values
- [ ] Set `NODE_ENV=production`
- [ ] Use MongoDB Atlas or managed MongoDB
- [ ] Enable HTTPS/SSL
- [ ] Configure production CORS origins
- [ ] Add rate limiting
- [ ] Set up monitoring and logging
- [ ] Remove console.log statements
- [ ] Enable Expo OTA updates
- [ ] Submit apps to App Store and Google Play

## Getting Help

If you encounter issues:

1. Check the main README.md for detailed documentation
2. Review provider-specific documentation:
   - [Firebase Auth](https://firebase.google.com/docs/auth)
   - [Apple Sign-In](https://developer.apple.com/sign-in-with-apple/)
   - [Facebook Login](https://developers.facebook.com/docs/facebook-login)
3. Check the console logs for error messages
4. Verify all environment variables are set correctly

Happy coding! 🚀
