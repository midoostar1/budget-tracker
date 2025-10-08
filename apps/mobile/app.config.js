// @ts-check
import 'dotenv/config';

export default ({ config }) => ({
  ...config,
  name: 'MobileAuthApp',
  slug: 'mobile-auth-app',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  scheme: 'mobileauthapp',
  userInterfaceStyle: 'automatic',
  ios: {
    supportsTablet: false,
    bundleIdentifier: process.env.IOS_BUNDLE_ID || 'com.example.app',
    infoPlist: {
      // Sign in with Apple entitlement is added by EAS when capability is enabled
    }
  },
  android: {
    package: process.env.ANDROID_PACKAGE || 'com.example.app',
  },
  web: {
    bundler: 'metro'
  },
  extra: {
    apiUrl: process.env.API_URL || 'http://localhost:4000',
    // Firebase
    firebaseApiKey: process.env.FIREBASE_API_KEY,
    firebaseAuthDomain: process.env.FIREBASE_AUTH_DOMAIN,
    firebaseProjectId: process.env.FIREBASE_PROJECT_ID,
    firebaseAppId: process.env.FIREBASE_APP_ID,
    firebaseMessagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    // Google OAuth client IDs for expo-auth-session
    googleExpoClientId: process.env.GOOGLE_EXPO_CLIENT_ID,
    googleIosClientId: process.env.GOOGLE_IOS_CLIENT_ID,
    googleAndroidClientId: process.env.GOOGLE_ANDROID_CLIENT_ID,
    // Facebook
    facebookAppId: process.env.FACEBOOK_APP_ID,
    facebookClientToken: process.env.FACEBOOK_CLIENT_TOKEN || null
  }
});
