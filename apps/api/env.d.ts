/// <reference types="node" />

declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'test' | 'production';
    PORT?: string;
    DATABASE_URL: string;
    REDIS_URL: string;
    JWT_SECRET?: string;
    FIREBASE_PROJECT_ID: string;
    FIREBASE_CLIENT_EMAIL: string;
    FIREBASE_PRIVATE_KEY: string;
    VERYFI_WEBHOOK_SECRET: string;
    S3_BUCKET: string;
    AWS_REGION: string;
    AWS_ACCESS_KEY_ID: string;
    AWS_SECRET_ACCESS_KEY: string;
    APP_BASE_URL: string;
    CDN_BASE_URL?: string;
    FCM_SERVER_KEY?: string;
    APNS_TEAM_ID?: string;
    APNS_KEY_ID?: string;
    APNS_BUNDLE_ID?: string;
    APNS_PRIVATE_KEY?: string;
  }
}
