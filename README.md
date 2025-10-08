# Mobile Social Authentication

A complete mobile authentication system with Google, Apple, and Facebook sign-in, built with Expo (React Native) and Node.js backend.

## 🏗️ Architecture

- **Mobile App**: Expo (React Native) with TypeScript
- **Backend**: Node.js + Express + TypeScript + MongoDB
- **Authentication**: JWT (access + refresh tokens)
- **Social Providers**: Google (Firebase), Apple Sign-In, Facebook

## 📁 Project Structure

```
.
├── mobile/              # Expo React Native app
│   ├── src/
│   │   ├── screens/     # Welcome, SignIn, Profile
│   │   ├── services/    # Auth services for each provider
│   │   ├── contexts/    # AuthContext
│   │   └── config/      # Firebase config
│   ├── App.tsx
│   ├── app.json
│   └── package.json
│
└── backend/             # Node.js Express API
    ├── src/
    │   ├── controllers/ # Auth controller
    │   ├── models/      # User, AccountProvider, RefreshToken
    │   ├── routes/      # Auth and protected routes
    │   ├── services/    # Provider verification
    │   ├── middleware/  # Authentication middleware
    │   └── utils/       # JWT utilities
    ├── .env.example
    └── package.json
```

## 🚀 Setup Instructions

### Prerequisites

- Node.js 18+
- MongoDB (local or cloud)
- Expo CLI: `npm install -g expo-cli`
- iOS Developer Account (for Apple Sign-In)
- Google Cloud Console account
- Facebook Developer account

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create `.env` file:**
   ```bash
   cp .env.example .env
   ```

4. **Configure environment variables:**

   Edit `.env` and add your credentials:

   ```env
   # Server
   PORT=3000
   NODE_ENV=development

   # MongoDB
   MONGODB_URI=mongodb://localhost:27017/mobile-auth

   # JWT Secrets (generate strong random strings)
   JWT_ACCESS_SECRET=your_strong_secret_key_here
   JWT_REFRESH_SECRET=your_strong_refresh_secret_key_here
   JWT_ACCESS_EXPIRES_IN=15m
   JWT_REFRESH_EXPIRES_IN=7d

   # Google OAuth
   GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your_google_client_secret

   # Apple Sign In
   APPLE_CLIENT_ID=com.yourcompany.mobileauthapp
   APPLE_TEAM_ID=your_apple_team_id
   APPLE_KEY_ID=your_apple_key_id
   APPLE_PRIVATE_KEY_PATH=./apple-key.p8

   # Facebook
   FACEBOOK_APP_ID=your_facebook_app_id
   FACEBOOK_APP_SECRET=your_facebook_app_secret

   # CORS
   ALLOWED_ORIGINS=http://localhost:19006,exp://localhost:19000
   ```

5. **Start MongoDB:**
   ```bash
   # If using local MongoDB
   mongod
   ```

6. **Run the server:**
   ```bash
   # Development
   npm run dev

   # Production build
   npm run build
   npm start
   ```

### Mobile App Setup

1. **Navigate to mobile directory:**
   ```bash
   cd mobile
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create `.env` file:**
   ```bash
   cp .env.example .env
   ```

4. **Configure environment variables:**

   Edit `.env`:

   ```env
   # Backend API (use your computer's IP for physical devices)
   API_URL=http://localhost:3000
   # For physical device: API_URL=http://192.168.1.x:3000

   # Firebase (Google Sign-In)
   FIREBASE_API_KEY=your_firebase_api_key
   FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   FIREBASE_PROJECT_ID=your_project_id
   FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   FIREBASE_APP_ID=your_app_id

   # Facebook
   FACEBOOK_APP_ID=your_facebook_app_id

   # Bundle identifiers
   IOS_BUNDLE_ID=com.yourcompany.mobileauthapp
   ANDROID_PACKAGE_NAME=com.yourcompany.mobileauthapp
   ```

5. **Update app.json:**

   Update `mobile/app.json` with your actual bundle identifiers and project details.

6. **Run the app:**
   ```bash
   # Start Expo
   npm start

   # Or directly:
   npm run ios      # iOS simulator
   npm run android  # Android emulator
   ```

## 🔑 Provider Configuration

### Google Sign-In Setup

1. **Create Firebase Project:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project
   - Enable Authentication → Sign-in method → Google

2. **Get Firebase Config:**
   - Project Settings → General → Your apps
   - Add iOS and Android apps
   - Download `google-services.json` (Android) and `GoogleService-Info.plist` (iOS)

3. **Configure OAuth Consent Screen:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - APIs & Services → OAuth consent screen
   - Add authorized domains

4. **Get Client IDs:**
   - APIs & Services → Credentials
   - Create OAuth 2.0 Client IDs for:
     - iOS (bundle ID: `com.yourcompany.mobileauthapp`)
     - Android (package name + SHA-1 certificate)
     - Web (for backend verification)

### Apple Sign-In Setup

1. **Apple Developer Account:**
   - Go to [Apple Developer](https://developer.apple.com/)
   - Certificates, Identifiers & Profiles

2. **Create App ID:**
   - Identifiers → App IDs → Register
   - Bundle ID: `com.yourcompany.mobileauthapp`
   - Enable "Sign In with Apple" capability

3. **Create Service ID:**
   - Identifiers → Services IDs → Register
   - Configure "Sign in with Apple"
   - Add return URLs for web (if needed)

4. **Create Key:**
   - Keys → Create a new key
   - Enable "Sign in with Apple"
   - Download `.p8` file (save as `apple-key.p8`)
   - Note the Key ID

5. **Update app.json:**
   ```json
   {
     "expo": {
       "ios": {
         "usesAppleSignIn": true,
         "bundleIdentifier": "com.yourcompany.mobileauthapp"
       }
     }
   }
   ```

6. **⚠️ Important**: Per Apple's guidelines, if you offer third-party login options (Google, Facebook), you **MUST** also offer Sign in with Apple on iOS.

### Facebook Sign-In Setup

1. **Create Facebook App:**
   - Go to [Facebook Developers](https://developers.facebook.com/)
   - Create App → Consumer → Continue

2. **Add Facebook Login:**
   - Dashboard → Add Product → Facebook Login
   - Settings → Valid OAuth Redirect URIs

3. **Configure iOS:**
   - Settings → Basic → Add Platform → iOS
   - Bundle ID: `com.yourcompany.mobileauthapp`

4. **Configure Android:**
   - Settings → Basic → Add Platform → Android
   - Package Name: `com.yourcompany.mobileauthapp`
   - Add Key Hashes (development + release)

5. **Get App ID and Secret:**
   - Settings → Basic
   - Copy App ID and App Secret

## 📡 API Endpoints

### Authentication

#### POST `/auth/social/login`
Social provider login/signup

**Request:**
```json
{
  "provider": "google|apple|facebook",
  "idToken": "...",           // Google
  "identityToken": "...",     // Apple
  "authorizationCode": "...", // Apple (optional)
  "accessToken": "...",       // Facebook
  "user": {                   // Optional, for Apple first-time
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

**Response:**
```json
{
  "accessToken": "jwt_access_token",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "John Doe",
    "profilePicture": "https://..."
  }
}
```

Sets HTTP-only cookie: `refreshToken`

#### POST `/auth/refresh`
Refresh access token

**Response:**
```json
{
  "accessToken": "new_jwt_access_token"
}
```

#### POST `/auth/logout`
Logout user (clears refresh token)

**Response:**
```json
{
  "message": "Logged out successfully"
}
```

### Protected Routes

All protected routes require `Authorization: Bearer <access_token>` header.

#### GET `/api/profile`
Get current user profile

**Response:**
```json
{
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "John Doe",
    "profilePicture": "https://...",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "linkedProviders": [
    {
      "provider": "google",
      "linkedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### PUT `/api/profile`
Update user profile

**Request:**
```json
{
  "name": "New Name",
  "profilePicture": "https://..."
}
```

#### GET `/api/data`
Example protected endpoint

## 🔐 Security Features

- **JWT Access Tokens**: Short-lived (15 minutes)
- **Refresh Tokens**: Long-lived (7 days), stored as HTTP-only cookies
- **Token Rotation**: New access token on refresh
- **Automatic Cleanup**: Expired tokens removed via MongoDB TTL index
- **Provider Verification**: All social tokens verified server-side
- **CORS Protection**: Configured allowed origins
- **Helmet.js**: Security headers
- **Password-less**: No password storage (social auth only)

## 🧪 Testing

### Test Backend

```bash
cd backend

# Test health endpoint
curl http://localhost:3000/health

# Test protected route (should fail)
curl http://localhost:3000/api/profile

# Test with token
curl -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
     http://localhost:3000/api/profile
```

### Test Mobile App

1. Start the app in simulator/emulator
2. Click "Get Started" on Welcome screen
3. Try signing in with each provider
4. Verify profile screen shows user data
5. Test logout functionality

## 🐛 Troubleshooting

### Common Issues

**Google Sign-In not working:**
- Verify Firebase configuration
- Check Client IDs match your bundle/package
- Ensure SHA-1 certificate is added (Android)
- Verify `google-services.json` is in correct location

**Apple Sign-In not available:**
- Only works on real iOS devices (iOS 13+) or iOS Simulator
- Check bundle identifier matches App ID
- Verify `usesAppleSignIn` in `app.json`

**Facebook Sign-In errors:**
- Verify App ID in `.env`
- Check platform configurations in Facebook Console
- Ensure key hashes are correct (Android)

**Backend connection issues:**
- Use your computer's local IP for physical devices
- Ensure CORS origins include your app's URL
- Check MongoDB connection string

**Token refresh failing:**
- Verify refresh token cookie is being sent
- Check cookie settings (secure, sameSite)
- Ensure refresh token exists in database

## 📱 Platform Requirements

### iOS
- **Minimum**: iOS 13.0+
- **Required**: Sign in with Apple capability if other social logins are offered
- **Deployment**: Requires Apple Developer account ($99/year)

### Android
- **Minimum**: Android 5.0 (API 21)+
- **Required**: `google-services.json` for Google Sign-In
- **Deployment**: Google Play Console ($25 one-time)

## 🚢 Deployment

### Backend Deployment

**Environment Variables to Set:**
- All variables from `.env.example`
- Set `NODE_ENV=production`
- Use strong random strings for JWT secrets
- Update `ALLOWED_ORIGINS` with production URLs

**Recommended Platforms:**
- Railway
- Render
- Heroku
- DigitalOcean
- AWS/GCP/Azure

**MongoDB:**
- MongoDB Atlas (free tier available)
- Update `MONGODB_URI` with connection string

### Mobile Deployment

**iOS (App Store):**
```bash
expo build:ios
```
- Requires Apple Developer account
- Submit via App Store Connect

**Android (Google Play):**
```bash
expo build:android
```
- Submit via Google Play Console

**Over-the-Air Updates:**
```bash
expo publish
```

## 📚 Additional Resources

- [Expo Documentation](https://docs.expo.dev/)
- [Firebase Auth](https://firebase.google.com/docs/auth)
- [Apple Sign-In](https://developer.apple.com/sign-in-with-apple/)
- [Facebook Login](https://developers.facebook.com/docs/facebook-login)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)

## 📄 License

MIT

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a pull request.

---

**Note**: This is a production-ready template. Make sure to:
1. Generate strong JWT secrets
2. Configure all provider credentials
3. Set up proper error tracking (Sentry, etc.)
4. Add rate limiting for production
5. Implement proper logging
6. Add comprehensive tests
