import Constants from 'expo-constants';

/**
 * Environment configuration using expo-constants
 * 
 * For development, set environment variables in app.json under extra:
 * "extra": {
 *   "apiBaseUrl": "http://localhost:3000",
 *   ...
 * }
 * 
 * For production builds, use EAS build with .env files
 */

interface AppConfig {
  apiBaseUrl: string;
  apiTimeout: number;
  googleWebClientId?: string;
  googleIosClientId?: string;
  googleAndroidClientId?: string;
  appleServiceId?: string;
  facebookAppId?: string;
}

// Get environment from expo-constants
const extra = Constants.expoConfig?.extra || {};

export const ENV: AppConfig = {
  // API Configuration
  apiBaseUrl: extra.apiBaseUrl || process.env.API_BASE_URL || 'http://localhost:3000',
  apiTimeout: extra.apiTimeout || parseInt(process.env.API_TIMEOUT || '30000', 10),

  // Social Authentication
  googleWebClientId: extra.googleWebClientId || process.env.GOOGLE_WEB_CLIENT_ID,
  googleIosClientId: extra.googleIosClientId || process.env.GOOGLE_IOS_CLIENT_ID,
  googleAndroidClientId: extra.googleAndroidClientId || process.env.GOOGLE_ANDROID_CLIENT_ID,
  appleServiceId: extra.appleServiceId || process.env.APPLE_SERVICE_ID,
  facebookAppId: extra.facebookAppId || process.env.FACEBOOK_APP_ID,
};

// Validate required configuration
export function validateConfig(): void {
  if (!ENV.apiBaseUrl) {
    console.warn('⚠️ API_BASE_URL not configured, using default');
  }

  if (__DEV__) {
    console.log('📝 Environment Configuration:');
    console.log('API Base URL:', ENV.apiBaseUrl);
    console.log('API Timeout:', ENV.apiTimeout);
  }
}

export default ENV;

