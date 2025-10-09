/**
 * Simple logger for mobile app
 * In production, you might want to use a service like Sentry or LogRocket
 */

const isDev = __DEV__;

export const logger = {
  info: (message: string, data?: any) => {
    if (isDev) {
      console.log(`ℹ️ [INFO] ${message}`, data || '');
    }
  },

  warn: (message: string, data?: any) => {
    console.warn(`⚠️ [WARN] ${message}`, data || '');
  },

  error: (message: string, error?: any) => {
    console.error(`❌ [ERROR] ${message}`, error || '');
  },

  debug: (message: string, data?: any) => {
    if (isDev) {
      console.log(`🔍 [DEBUG] ${message}`, data || '');
    }
  },
};

