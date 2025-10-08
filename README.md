# Mobile Social Authentication (Expo) + Backend Auth

This project provides a minimal mobile app (Expo) with Google, Apple, and Facebook sign-in, plus a Node/Express backend handling social token verification, JWT issuance, refresh rotation, and protected routes.

## Overview
- Mobile (Expo React Native): Google via Firebase Auth SDK, Apple via `expo-apple-authentication`, Facebook via `expo-auth-session`.
- Server (Express + Prisma SQLite): `/auth/social/login`, `/auth/refresh`, `/auth/logout`, protected `/me` with JWT, refresh-token rotation and HTTP-only cookie support (when possible).
- Apple requirement: If you offer third‑party sign-in (Google/Facebook) on iOS, you must also offer Sign in with Apple.

## Prerequisites
- Node 18+
- pnpm or npm
- iOS/macOS dev setup (for Apple sign-in testing), Android SDK for Android

## Server Setup
1. Create `apps/server/.env` from `.env.example` and fill values:
   - `JWT_SECRET`, `CORS_ORIGIN`, `COOKIE_SECURE` (true on HTTPS), `DATABASE_URL` (SQLite default OK)
   - Firebase Admin: `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` (with `\n` newlines)
   - Apple: `APPLE_BUNDLE_IDS` (comma-separated allowed audiences/bundle IDs)
   - Facebook: `FACEBOOK_APP_ID`, `FACEBOOK_APP_SECRET`
2. Install deps and migrate DB:
   ```bash
   cd apps/server
   npm install
   npx prisma generate
   npm run prisma:migrate
   npm run dev
   ```
3. Endpoints:
   - `POST /auth/social/login` body:
     - Google: `{ "provider": "google", "idToken": "<firebase_id_token>" }`
     - Apple: `{ "provider": "apple", "idToken": "<apple_identity_token>" }`
     - Facebook: `{ "provider": "facebook", "accessToken": "<fb_access_token>" }`
     - Response: `{ accessToken, user }` and sets `refresh_token` HTTP-only cookie when possible.
   - `POST /auth/refresh` body: `{ refreshToken? }` optional if cookie present. Returns `{ accessToken }` and rotates cookie.
   - `POST /auth/logout` revokes refresh token and clears cookie.
   - `GET /me` with `Authorization: Bearer <accessToken>` returns user profile.

## Mobile Setup (Expo)
1. Create a `.env` at repo root or use shell env for app config. The Expo `app.config.js` pulls from env:
   - API: `API_URL`
   - Firebase Web config: `FIREBASE_API_KEY`, `FIREBASE_AUTH_DOMAIN`, `FIREBASE_PROJECT_ID`, `FIREBASE_APP_ID`, `FIREBASE_MESSAGING_SENDER_ID`
   - Google OAuth Client IDs: `GOOGLE_EXPO_CLIENT_ID`, `GOOGLE_IOS_CLIENT_ID`, `GOOGLE_ANDROID_CLIENT_ID`
   - Facebook: `FACEBOOK_APP_ID`, optional `FACEBOOK_CLIENT_TOKEN`
2. Firebase (Google Sign-In via Firebase Auth SDK):
   - Create Firebase project; enable Google provider in Firebase Auth.
   - Create Web app in Firebase console to get Web config (keys above).
   - For Google OAuth, create OAuth client IDs for iOS and Android; add reversed client ID in iOS if using bare workflow.
3. Apple Sign-In:
   - On iOS, you must offer Apple if you offer Google or Facebook.
   - In App Store Connect, enable Sign in with Apple for your app (bundle ID must match `ios.bundleIdentifier`).
   - Ensure device testing on physical iOS device or simulator with an Apple ID.
4. Facebook:
   - Create a Facebook App, get `App ID` and `App Secret` for server.
   - Configure app OAuth redirect URIs per Expo AuthSession guide.
5. Run the app:
   ```bash
   cd apps/mobile
   npm install
   npm run start
   ```

## Notes
- Refresh tokens are stored as HTTP-only cookies when possible; the mobile client also supports passing a refresh token in the body if you choose to store it client-side. For higher security on native, prefer HTTP-only cookies over local storage when feasible.
- The backend verifies:
  - Google: Firebase Admin `verifyIdToken` against your project
  - Apple: `apple-signin-auth` with allowed audiences (`APPLE_BUNDLE_IDS`)
  - Facebook: `debug_token` check + `/me` profile fetch

## Environment Keys Summary
- Server `.env`:
  - `PORT`, `CORS_ORIGIN`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `REFRESH_TOKEN_TTL_DAYS`, `COOKIE_SECURE`, `DATABASE_URL`
  - `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`
  - `APPLE_BUNDLE_IDS`
  - `FACEBOOK_APP_ID`, `FACEBOOK_APP_SECRET`
- Mobile env (consumed by `app.config.js`):
  - `API_URL`
  - `FIREBASE_API_KEY`, `FIREBASE_AUTH_DOMAIN`, `FIREBASE_PROJECT_ID`, `FIREBASE_APP_ID`, `FIREBASE_MESSAGING_SENDER_ID`
  - `GOOGLE_EXPO_CLIENT_ID`, `GOOGLE_IOS_CLIENT_ID`, `GOOGLE_ANDROID_CLIENT_ID`
  - `FACEBOOK_APP_ID`, `FACEBOOK_CLIENT_TOKEN`

## Routing and Protection
- Mobile uses React Navigation to gate the `Profile` screen behind an access token.
- Backend uses JWT middleware for `/me`.

## Apple Requirement
When offering third‑party login on iOS (e.g., Google or Facebook), Apple requires that you also offer "Sign in with Apple" of equal prominence.
