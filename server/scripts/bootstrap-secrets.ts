#!/usr/bin/env tsx

/**
 * Bootstrap Secrets to Google Cloud Secret Manager
 * 
 * This script reads secrets from .env.secrets file and creates/updates them
 * in Google Cloud Secret Manager.
 * 
 * Usage:
 *   npm run gcp:secrets:bootstrap
 * 
 * Prerequisites:
 *   - gcloud CLI installed and authenticated
 *   - GCP_PROJECT_ID environment variable set
 *   - .env.secrets file with secret values
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

const execAsync = promisify(exec);

// ANSI colors
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

const log = {
  info: (msg: string) => console.log(`${colors.cyan}ℹ ${msg}${colors.reset}`),
  success: (msg: string) => console.log(`${colors.green}✓ ${msg}${colors.reset}`),
  warn: (msg: string) => console.log(`${colors.yellow}⚠ ${msg}${colors.reset}`),
  error: (msg: string) => console.log(`${colors.red}✗ ${msg}${colors.reset}`),
};

// Secret mapping: Environment variable → Secret Manager name
const SECRET_MAPPINGS: Record<string, string> = {
  DATABASE_URL: 'budget-tracker-database-url',
  JWT_SECRET: 'budget-tracker-jwt-secret',
  GOOGLE_WEB_CLIENT_ID: 'budget-tracker-google-web-client-id',
  GOOGLE_IOS_CLIENT_ID: 'budget-tracker-google-ios-client-id',
  GOOGLE_ANDROID_CLIENT_ID: 'budget-tracker-google-android-client-id',
  APPLE_BUNDLE_ID: 'budget-tracker-apple-bundle-id',
  APPLE_TEAM_ID: 'budget-tracker-apple-team-id',
  APPLE_KEY_ID: 'budget-tracker-apple-key-id',
  FACEBOOK_APP_ID: 'budget-tracker-facebook-app-id',
  FACEBOOK_APP_SECRET: 'budget-tracker-facebook-app-secret',
  GCS_BUCKET_NAME: 'budget-tracker-gcs-bucket-name',
  GCS_PROJECT_ID: 'budget-tracker-gcs-project-id',
  VERYFI_CLIENT_ID: 'budget-tracker-veryfi-client-id',
  VERYFI_CLIENT_SECRET: 'budget-tracker-veryfi-client-secret',
  VERYFI_USERNAME: 'budget-tracker-veryfi-username',
  VERYFI_API_KEY: 'budget-tracker-veryfi-api-key',
  FIREBASE_ADMIN_JSON_BASE64: 'budget-tracker-firebase-admin-json',
  CRON_SECRET: 'budget-tracker-cron-secret',
  CORS_ALLOWED_ORIGINS: 'budget-tracker-cors-allowed-origins',
};

async function checkGcloudInstalled(): Promise<boolean> {
  try {
    await execAsync('gcloud --version');
    return true;
  } catch {
    return false;
  }
}

async function getProjectId(): Promise<string> {
  const projectId = process.env.GCP_PROJECT_ID;
  
  if (projectId) {
    return projectId;
  }

  try {
    const { stdout } = await execAsync('gcloud config get-value project');
    return stdout.trim();
  } catch {
    throw new Error('GCP_PROJECT_ID not set and gcloud config not found');
  }
}

async function secretExists(secretName: string): Promise<boolean> {
  try {
    await execAsync(`gcloud secrets describe ${secretName} 2>/dev/null`);
    return true;
  } catch {
    return false;
  }
}

async function createSecret(secretName: string, value: string): Promise<void> {
  log.info(`Creating secret: ${secretName}`);
  
  const command = `echo -n "${value.replace(/"/g, '\\"')}" | gcloud secrets create ${secretName} \
    --data-file=- \
    --replication-policy="automatic" \
    --labels="app=budget-tracker,managed-by=bootstrap-script"`;
  
  await execAsync(command);
  log.success(`Created: ${secretName}`);
}

async function updateSecret(secretName: string, value: string): Promise<void> {
  log.info(`Updating secret: ${secretName}`);
  
  const command = `echo -n "${value.replace(/"/g, '\\"')}" | gcloud secrets versions add ${secretName} --data-file=-`;
  
  await execAsync(command);
  log.success(`Updated: ${secretName}`);
}

async function main() {
  console.log('\n🔐 Budget Tracker - Secret Manager Bootstrap\n');
  console.log('============================================\n');

  // Check prerequisites
  log.info('Checking prerequisites...');
  
  if (!await checkGcloudInstalled()) {
    log.error('gcloud CLI is not installed');
    log.error('Install from: https://cloud.google.com/sdk/docs/install');
    process.exit(1);
  }

  // Get project ID
  const projectId = await getProjectId();
  log.success(`Using GCP Project: ${projectId}`);

  // Set project
  await execAsync(`gcloud config set project ${projectId}`);

  // Check for .env.secrets file
  const secretsFilePath = path.join(__dirname, '..', '.env.secrets');
  
  if (!fs.existsSync(secretsFilePath)) {
    log.error('.env.secrets file not found');
    log.info('Create .env.secrets file with your secret values');
    log.info('Example: cp .env.secrets.example .env.secrets');
    process.exit(1);
  }

  // Load secrets from file
  const secrets = dotenv.parse(fs.readFileSync(secretsFilePath));
  log.success(`Loaded ${Object.keys(secrets).length} values from .env.secrets`);

  // Enable Secret Manager API
  log.info('Enabling Secret Manager API...');
  try {
    await execAsync('gcloud services enable secretmanager.googleapis.com --quiet');
    log.success('Secret Manager API enabled');
  } catch (error) {
    log.warn('Could not enable API (may already be enabled)');
  }

  console.log('');
  log.info('Processing secrets...\n');

  let created = 0;
  let updated = 0;
  let skipped = 0;

  // Process each secret
  for (const [envVar, secretName] of Object.entries(SECRET_MAPPINGS)) {
    const value = secrets[envVar];

    if (!value || value.trim() === '') {
      log.warn(`Skipping ${secretName} (no value in .env.secrets)`);
      skipped++;
      continue;
    }

    try {
      const exists = await secretExists(secretName);

      if (exists) {
        await updateSecret(secretName, value);
        updated++;
      } else {
        await createSecret(secretName, value);
        created++;
      }
    } catch (error) {
      log.error(`Failed to process ${secretName}: ${error}`);
    }
  }

  console.log('\n============================================\n');
  log.success('Bootstrap completed!\n');
  console.log(`  Created: ${created}`);
  console.log(`  Updated: ${updated}`);
  console.log(`  Skipped: ${skipped}`);
  console.log('');

  // Optional: Grant service account access
  console.log('To grant Cloud Run service account access to secrets, run:');
  console.log('');
  console.log('  export SA_EMAIL="budget-tracker-sa@PROJECT_ID.iam.gserviceaccount.com"');
  console.log('  gcloud secrets add-iam-policy-binding SECRET_NAME \\');
  console.log('    --member="serviceAccount:$SA_EMAIL" \\');
  console.log('    --role="roles/secretmanager.secretAccessor"');
  console.log('');
}

main().catch((error) => {
  log.error(`Fatal error: ${error.message}`);
  process.exit(1);
});

