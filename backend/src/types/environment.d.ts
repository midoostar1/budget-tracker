declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production' | 'test';
      PORT?: string;
      MONGODB_URI: string;
      JWT_ACCESS_SECRET: string;
      JWT_REFRESH_SECRET: string;
      JWT_ACCESS_EXPIRES_IN?: string;
      JWT_REFRESH_EXPIRES_IN?: string;
      GOOGLE_CLIENT_ID?: string;
      GOOGLE_CLIENT_SECRET?: string;
      APPLE_CLIENT_ID?: string;
      APPLE_TEAM_ID?: string;
      APPLE_KEY_ID?: string;
      APPLE_PRIVATE_KEY_PATH?: string;
      FACEBOOK_APP_ID?: string;
      FACEBOOK_APP_SECRET?: string;
      ALLOWED_ORIGINS?: string;
    }
  }
}

export {};
