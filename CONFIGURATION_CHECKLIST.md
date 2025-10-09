# Budget Tracker - Complete Configuration Checklist

## 🎯 **Configuration Required to Run the App**

This guide covers ALL configurations needed to get your Budget Tracker from code to running application.

**Estimated Time**: 3-4 hours (first time)

---

## 📋 **Configuration Overview**

### **Must Have (Critical)**
1. ✅ Database (PostgreSQL)
2. ✅ Backend environment variables
3. ⚙️ OAuth Client IDs (at least one provider)
4. ⚙️ Mobile app configuration

### **Should Have (Recommended)**
5. Firebase (for push notifications)
6. Google Cloud Storage (for receipts)
7. Veryfi (for OCR)

### **Nice to Have (Optional)**
8. Google Cloud Platform (for deployment)
9. EAS Build (for app distribution)

---

## 🗄️ **1. Database Configuration** (Required)

### **Option A: Docker Compose** (Easiest)

```bash
cd server

# Start PostgreSQL + Adminer
docker-compose up -d postgres

# Database will be available at:
# Host: localhost
# Port: 5432
# Database: budget_tracker
# User: user
# Password: password
```

**Connection String:**
```
DATABASE_URL="postgresql://user:password@localhost:5432/budget_tracker?schema=public"
```

---

### **Option B: Local PostgreSQL**

```bash
# Install PostgreSQL
brew install postgresql@15

# Start PostgreSQL
brew services start postgresql@15

# Create database
createdb budget_tracker

# Create user
psql -d budget_tracker -c "CREATE USER budget_user WITH PASSWORD 'your_password';"
psql -d budget_tracker -c "GRANT ALL PRIVILEGES ON DATABASE budget_tracker TO budget_user;"
```

**Connection String:**
```
DATABASE_URL="postgresql://budget_user:your_password@localhost:5432/budget_tracker?schema=public"
```

---

### **Option C: Cloud Database**

**Neon (Free Tier):**
1. Go to https://neon.tech
2. Create account
3. Create project
4. Copy connection string

**Supabase (Free Tier):**
1. Go to https://supabase.com
2. Create project
3. Go to Database → Connection string
4. Copy and use

**Connection String Example:**
```
DATABASE_URL="postgresql://user:pass@host.region.neon.tech/budget_tracker?sslmode=require"
```

---

### **Run Migration**

```bash
cd server

# Set DATABASE_URL in .env
echo 'DATABASE_URL="postgresql://..."' > .env

# Run migration
npm run prisma:migrate

# Verify
npm run prisma:studio
# Opens database browser at http://localhost:5555
```

✅ **Checkpoint**: You should see 7 tables in Prisma Studio

---

## 🔐 **2. Backend Environment Variables** (Required)

### **Create .env File**

```bash
cd server
cp .env.example .env
nano .env  # or code .env
```

### **Minimum Required Variables**

```bash
# Database (REQUIRED)
DATABASE_URL="postgresql://user:password@localhost:5432/budget_tracker?schema=public"

# JWT Secret (REQUIRED - 32+ characters)
JWT_SECRET="your-super-secure-random-string-min-32-chars-change-this"

# Server Config
NODE_ENV="development"
PORT=3000

# CORS (for mobile app)
CORS_ORIGIN="*"
CORS_ALLOWED_ORIGINS="http://localhost:3000,http://localhost:8081,http://localhost:8082"

# At least ONE OAuth provider (pick Google for easiest):
GOOGLE_WEB_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_IOS_CLIENT_ID="your-ios-client-id.apps.googleusercontent.com"
GOOGLE_ANDROID_CLIENT_ID="your-android-client-id.apps.googleusercontent.com"
```

**Generate JWT Secret:**
```bash
# Random 64-character string
openssl rand -base64 64 | tr -d '\n'
```

✅ **Checkpoint**: Backend should start with `npm run dev`

---

## 🔑 **3. OAuth Client IDs** (Required for Login)

### **Google Sign-In** (Recommended - Easiest)

**Time**: 15-20 minutes

**Steps:**

1. **Go to Google Cloud Console**
   - https://console.cloud.google.com/

2. **Create Project** (or select existing)
   - Click "Select a project" → "New Project"
   - Name: "Budget Tracker"
   - Click "Create"

3. **Enable Google+ API**
   - APIs & Services → Library
   - Search "Google+ API"
   - Click "Enable"

4. **Configure OAuth Consent Screen**
   - APIs & Services → OAuth consent screen
   - User Type: External
   - App name: Budget Tracker
   - User support email: your@email.com
   - Developer contact: your@email.com
   - Save and Continue
   - Scopes: Add `email` and `profile`
   - Save

5. **Create Credentials**

   **Web Client ID:**
   - Credentials → Create Credentials → OAuth 2.0 Client ID
   - Application type: Web application
   - Name: Budget Tracker Web
   - Authorized redirect URIs: http://localhost:3000/auth/google/callback
   - Create
   - **Copy Client ID** → Save for backend

   **Android Client ID:**
   - Create Credentials → OAuth 2.0 Client ID
   - Application type: Android
   - Name: Budget Tracker Android
   - Package name: `com.budgettracker.app`
   - SHA-1 fingerprint: (see below)
   - Create
   - **Copy Client ID** → Save for mobile

   **iOS Client ID:**
   - Create Credentials → OAuth 2.0 Client ID
   - Application type: iOS
   - Name: Budget Tracker iOS
   - Bundle ID: `com.budgettracker.app`
   - Create
   - **Copy Client ID** → Save for mobile

6. **Get Android SHA-1 Fingerprint**

   ```bash
   # Debug keystore
   keytool -list -v -keystore ~/.android/debug.keystore \
     -alias androiddebugkey \
     -storepass android \
     -keypass android | grep SHA1
   
   # Copy the SHA1 fingerprint
   # Example: SHA1: A1:B2:C3:...
   ```

7. **Update Backend .env**
   ```bash
   GOOGLE_WEB_CLIENT_ID="123456-abc.apps.googleusercontent.com"
   GOOGLE_IOS_CLIENT_ID="123456-ios.apps.googleusercontent.com"
   GOOGLE_ANDROID_CLIENT_ID="123456-android.apps.googleusercontent.com"
   ```

8. **Download google-services.json** (Android)
   - Go to Firebase Console: https://console.firebase.google.com
   - Add Android app
   - Package name: com.budgettracker.app
   - Download `google-services.json`
   - Place in `app/google-services.json`

9. **Download GoogleService-Info.plist** (iOS)
   - Firebase Console
   - Add iOS app
   - Bundle ID: com.budgettracker.app
   - Download `GoogleService-Info.plist`
   - Place in `app/GoogleService-Info.plist`

✅ **Checkpoint**: You have 3 Client IDs

---

### **Apple Sign In** (Optional - iOS Only)

**Time**: 20-30 minutes  
**Cost**: $99/year Apple Developer account

**Steps:**

1. **Apple Developer Account**
   - https://developer.apple.com
   - Enroll (if not already)
   - Cost: $99/year

2. **Create App ID**
   - Certificates, Identifiers & Profiles
   - Identifiers → App IDs
   - Register new
   - Bundle ID: `com.budgettracker.app`
   - Capabilities: ✓ Sign In with Apple
   - Register

3. **Configure in app.json**
   ```json
   "ios": {
     "bundleIdentifier": "com.budgettracker.app",
     "usesAppleSignIn": true
   }
   ```

4. **Update Backend .env**
   ```bash
   APPLE_BUNDLE_ID="com.budgettracker.app"
   APPLE_TEAM_ID="YOUR_TEAM_ID"
   APPLE_KEY_ID="YOUR_KEY_ID"
   ```

✅ **Checkpoint**: Apple Sign In configured

---

### **Facebook Login** (Optional)

**Time**: 15-20 minutes

**Steps:**

1. **Create Facebook App**
   - https://developers.facebook.com
   - My Apps → Create App
   - Type: Consumer
   - Name: Budget Tracker
   - Create

2. **Add Facebook Login Product**
   - Dashboard → Add Product
   - Facebook Login → Set Up

3. **Configure Platforms**
   
   **Android:**
   - Settings → Basic → Add Platform → Android
   - Package Name: `com.budgettracker.app`
   - Class Name: `.MainActivity`
   - Key Hash: (generate below)

   **Get Android Key Hash:**
   ```bash
   keytool -exportcert -alias androiddebugkey \
     -keystore ~/.android/debug.keystore | \
     openssl sha1 -binary | openssl base64
   # Password: android
   ```

   **iOS:**
   - Add Platform → iOS
   - Bundle ID: `com.budgettracker.app`
   - Enable Single Sign-On

4. **Update Backend .env**
   ```bash
   FACEBOOK_APP_ID="your-app-id"
   FACEBOOK_APP_SECRET="your-app-secret"
   ```

5. **Update Mobile app.json**
   ```json
   "extra": {
     "facebookAppId": "your-app-id"
   }
   ```

✅ **Checkpoint**: Facebook Login configured

---

## 📱 **4. Mobile App Configuration** (Required)

### **Update app/app.json**

```bash
cd app
nano app.json  # or code app.json
```

**Add to `extra` section:**

```json
{
  "expo": {
    "extra": {
      "apiBaseUrl": "http://10.0.2.2:3000",  // Android emulator
      // or "http://localhost:3000" for iOS simulator
      // or "https://your-api.com" for production
      
      "googleWebClientId": "YOUR-WEB-CLIENT-ID.apps.googleusercontent.com",
      "googleIosClientId": "YOUR-IOS-CLIENT-ID.apps.googleusercontent.com",
      "googleAndroidClientId": "YOUR-ANDROID-CLIENT-ID.apps.googleusercontent.com",
      
      "appleServiceId": "com.budgettracker.app",
      
      "facebookAppId": "YOUR-FACEBOOK-APP-ID",
      
      "eas": {
        "projectId": "your-eas-project-id"  // Get from: eas init
      }
    }
  }
}
```

**Add Firebase Config Files:**
```bash
# Place these files in app/ directory:
# - google-services.json (Android)
# - GoogleService-Info.plist (iOS)
```

✅ **Checkpoint**: Mobile app configured with at least one OAuth provider

---

## 🔔 **5. Firebase (Push Notifications)** (Recommended)

### **Setup Firebase Project**

**Time**: 15 minutes

**Steps:**

1. **Create Firebase Project**
   - https://console.firebase.google.com
   - Add project
   - Name: Budget Tracker
   - Disable Analytics (optional)
   - Create

2. **Add Android App**
   - Project Overview → Add app → Android
   - Package name: `com.budgettracker.app`
   - Download `google-services.json`
   - Place in `app/google-services.json`

3. **Add iOS App**
   - Add app → iOS
   - Bundle ID: `com.budgettracker.app`
   - Download `GoogleService-Info.plist`
   - Place in `app/GoogleService-Info.plist`

4. **Get Firebase Admin SDK**
   - Project Settings → Service Accounts
   - Generate New Private Key
   - Download JSON file
   - Base64 encode it:
   
   ```bash
   base64 -i firebase-adminsdk.json | tr -d '\n'
   # Copy the output
   ```

5. **Update Backend .env**
   ```bash
   FIREBASE_ADMIN_JSON_BASE64="paste-base64-encoded-json-here"
   ```

✅ **Checkpoint**: Push notifications configured

---

## 📸 **6. Google Cloud Storage** (For Receipts)

### **Setup GCS Bucket**

**Time**: 10 minutes

**Steps:**

1. **Create GCP Project** (if not already)
   - https://console.cloud.google.com
   - New Project → Budget Tracker

2. **Enable Cloud Storage API**
   - APIs & Services → Enable APIs
   - Search "Cloud Storage"
   - Enable

3. **Create Storage Bucket**
   - Cloud Storage → Buckets → Create
   - Name: `budget-tracker-receipts-{unique-id}`
   - Location: US (multi-region)
   - Storage class: Standard
   - Access control: Uniform
   - Create

4. **Create Service Account**
   - IAM & Admin → Service Accounts
   - Create Service Account
   - Name: budget-tracker-storage
   - Role: Storage Object Admin
   - Create Key → JSON
   - Download key file

5. **Base64 Encode Key**
   ```bash
   base64 -i service-account-key.json | tr -d '\n'
   ```

6. **Update Backend .env**
   ```bash
   GCS_BUCKET_NAME="budget-tracker-receipts-abc123"
   GCS_PROJECT_ID="your-gcp-project-id"
   GCS_KEY_FILE="base64-encoded-service-account-json"
   ```

✅ **Checkpoint**: Receipt uploads will work

---

## 🔍 **7. Veryfi OCR** (For Receipt Processing)

### **Get Veryfi API Credentials**

**Time**: 5 minutes  
**Cost**: Free tier available

**Steps:**

1. **Sign Up**
   - https://hub.veryfi.com/signup/
   - Create account

2. **Get API Keys**
   - Dashboard → Settings → API Keys
   - Copy:
     - Client ID
     - Client Secret
     - Username
     - API Key

3. **Update Backend .env**
   ```bash
   VERYFI_CLIENT_ID="your-client-id"
   VERYFI_CLIENT_SECRET="your-client-secret"
   VERYFI_USERNAME="your-username"
   VERYFI_API_KEY="your-api-key"
   ```

✅ **Checkpoint**: OCR processing will work

---

## ☁️ **8. Google Cloud Platform** (For Deployment)

### **Setup for Cloud Run Deployment**

**Time**: 20 minutes  
**Required**: Only if deploying to Cloud Run

**Steps:**

1. **Install gcloud CLI**
   ```bash
   # macOS
   brew install --cask google-cloud-sdk
   
   # Or download from:
   # https://cloud.google.com/sdk/docs/install
   ```

2. **Authenticate**
   ```bash
   gcloud auth login
   gcloud config set project YOUR_PROJECT_ID
   ```

3. **Enable APIs**
   ```bash
   gcloud services enable \
     cloudbuild.googleapis.com \
     run.googleapis.com \
     secretmanager.googleapis.com \
     cloudscheduler.googleapis.com
   ```

4. **Create .env.secrets** (Production)
   ```bash
   cd server
   cp .env.secrets.example .env.secrets
   # Fill with production values
   ```

5. **Bootstrap Secrets**
   ```bash
   export GCP_PROJECT_ID="your-project-id"
   npm run gcp:secrets:bootstrap
   ```

6. **Deploy**
   ```bash
   npm run gcp:build
   npm run gcp:deploy
   ```

✅ **Checkpoint**: Backend deployed to Cloud Run

---

## 📱 **9. Mobile App - EAS Build** (For Distribution)

### **Setup EAS for App Building**

**Time**: 10 minutes  
**Required**: Only for building standalone apps

**Steps:**

1. **Install EAS CLI**
   ```bash
   npm install -g eas-cli
   ```

2. **Login**
   ```bash
   eas login
   # Or create account: eas register
   ```

3. **Initialize EAS**
   ```bash
   cd app
   eas init
   # Follow prompts
   # Copy the Project ID shown
   ```

4. **Update app.json**
   ```json
   "extra": {
     "eas": {
       "projectId": "your-eas-project-id-from-init"
     }
   }
   ```

5. **Create eas.json** (if needed)
   ```bash
   eas build:configure
   ```

✅ **Checkpoint**: Ready to build apps

---

## 🔧 **10. Optional: Additional Services**

### **Cron Secret** (For Scheduled Jobs)

```bash
# Generate random secret
openssl rand -base64 32

# Add to .env
CRON_SECRET="your-random-secret"
```

### **Sentry** (Error Tracking - Optional)

```bash
# Backend
npm install @sentry/node

# Add to .env
SENTRY_DSN="your-sentry-dsn"
```

### **LogRocket** (Session Replay - Optional)

```bash
# Mobile
npm install @logrocket/react-native

# Add to app
LOGROCKET_APP_ID="your-app-id"
```

---

## ✅ **Configuration Checklist**

### **Backend - Minimum to Run**

- [ ] PostgreSQL database running
- [ ] DATABASE_URL in .env
- [ ] JWT_SECRET in .env (32+ chars)
- [ ] At least one OAuth provider configured:
  - [ ] Google (Web + Android + iOS Client IDs)
  - [ ] OR Apple (Bundle ID, Team ID, Key ID)
  - [ ] OR Facebook (App ID, App Secret)
- [ ] npm install completed
- [ ] npm run prisma:migrate run successfully
- [ ] npm run dev starts without errors

**Test:**
```bash
curl http://localhost:3000/health
# Should return: { "status": "healthy", "database": "connected" }
```

---

### **Backend - Full Features**

- [ ] All OAuth providers (Google, Apple, Facebook)
- [ ] Firebase Admin SDK (for push notifications)
- [ ] Google Cloud Storage (for receipts)
- [ ] Veryfi API (for OCR)
- [ ] Cron secret (for scheduled jobs)

---

### **Mobile - Minimum to Run**

- [ ] app.json updated with apiBaseUrl
- [ ] At least one OAuth provider configured
- [ ] npm install completed
- [ ] Backend running and accessible

**Test in Expo Go:**
```bash
cd app
npm start
# Press 'a' for Android or 'i' for iOS
```

---

### **Mobile - Full Features**

- [ ] All OAuth Client IDs in app.json
- [ ] google-services.json (Android)
- [ ] GoogleService-Info.plist (iOS)
- [ ] EAS project initialized
- [ ] Development build created:
  ```bash
  eas build --profile development --platform all
  ```

---

## 🚀 **Quick Start Configurations**

### **Scenario 1: Local Development Only**

**Minimum Setup (30 minutes):**

1. ✅ Start PostgreSQL with Docker
   ```bash
   cd server && docker-compose up -d postgres
   ```

2. ✅ Configure backend .env
   ```bash
   DATABASE_URL="postgresql://user:password@localhost:5432/budget_tracker"
   JWT_SECRET="$(openssl rand -base64 64)"
   GOOGLE_WEB_CLIENT_ID="get-from-google-console"
   GOOGLE_ANDROID_CLIENT_ID="get-from-google-console"
   ```

3. ✅ Run migration
   ```bash
   npm run prisma:migrate
   ```

4. ✅ Start backend
   ```bash
   npm run dev
   ```

5. ✅ Update mobile app.json
   ```json
   "apiBaseUrl": "http://10.0.2.2:3000"
   "googleWebClientId": "..."
   "googleAndroidClientId": "..."
   ```

6. ✅ Start mobile
   ```bash
   cd app && npm start
   ```

**You can now test:**
- Navigation and UI
- Google login (with Client IDs)
- Transaction management
- Basic features

---

### **Scenario 2: Full Local Setup**

**Complete Setup (2-3 hours):**

Everything from Scenario 1, plus:

7. ✅ Setup Firebase
8. ✅ Setup Google Cloud Storage
9. ✅ Setup Veryfi OCR
10. ✅ Configure all 3 OAuth providers
11. ✅ Build development client

**You can test:**
- All authentication providers
- Push notifications
- Receipt upload and OCR
- All features

---

### **Scenario 3: Production Deployment**

**Full Production (3-4 hours):**

Everything from Scenario 2, plus:

12. ✅ Setup GCP project
13. ✅ Create .env.secrets
14. ✅ Bootstrap secrets to Secret Manager
15. ✅ Deploy to Cloud Run
16. ✅ Setup Cloud Scheduler
17. ✅ Build production apps (EAS)
18. ✅ Submit to App Store / Play Store

**Result:**
- Backend live on Cloud Run
- Mobile apps in stores
- Users can sign up and use

---

## 🎯 **Recommended Path**

### **Phase 1: Get It Running** (1 hour)

1. ✅ Docker PostgreSQL
2. ✅ Backend .env (DATABASE_URL + JWT_SECRET)
3. ✅ Google OAuth (just Web + Android Client IDs)
4. ✅ Mobile app.json (apiBaseUrl + Google IDs)
5. ✅ Run migration
6. ✅ Start backend
7. ✅ Start mobile in Expo Go

**Result**: App runs, can see UI, navigation works

---

### **Phase 2: Full Local Testing** (2 hours)

8. ✅ Firebase setup
9. ✅ GCS setup
10. ✅ Veryfi setup
11. ✅ Build development client
12. ✅ Test on real device

**Result**: All features work locally

---

### **Phase 3: Production Deploy** (1 hour)

13. ✅ GCP setup
14. ✅ Deploy backend
15. ✅ Setup Cloud Scheduler
16. ✅ Build production apps

**Result**: Live in production

---

## 📝 **Configuration Files Summary**

### **Backend**

**server/.env** (Required):
```bash
DATABASE_URL="postgresql://..."
JWT_SECRET="random-64-char-string"
GOOGLE_WEB_CLIENT_ID="..."
GOOGLE_ANDROID_CLIENT_ID="..."
GOOGLE_IOS_CLIENT_ID="..."
```

**server/.env.secrets** (Production):
```bash
# Same as .env but for Secret Manager
# Use with: npm run gcp:secrets:bootstrap
```

---

### **Mobile**

**app/app.json** (Required):
```json
{
  "expo": {
    "ios": {
      "bundleIdentifier": "com.budgettracker.app"
    },
    "android": {
      "package": "com.budgettracker.app"
    },
    "extra": {
      "apiBaseUrl": "http://10.0.2.2:3000",
      "googleWebClientId": "...",
      "googleAndroidClientId": "...",
      "googleIosClientId": "...",
      "eas": {
        "projectId": "..."
      }
    }
  }
}
```

**app/google-services.json** (Android):
- Download from Firebase Console
- Place in app/ directory

**app/GoogleService-Info.plist** (iOS):
- Download from Firebase Console
- Place in app/ directory

---

## 🆘 **Help & Troubleshooting**

### **Backend Won't Start**

**Check:**
```bash
# Database connection
psql -U user -d budget_tracker -c "SELECT 1;"

# Environment variables loaded
cd server && node -e "require('dotenv').config(); console.log(process.env.DATABASE_URL)"

# Prisma client generated
npm run prisma:generate

# Migration applied
npm run prisma:migrate
```

---

### **Mobile App Errors**

**"Cannot connect to backend"**
- Check apiBaseUrl in app.json
- Android emulator: Use `10.0.2.2:3000` not `localhost:3000`
- iOS simulator: Use `localhost:3000`

**"OAuth errors"**
- Verify Client IDs are correct
- Check SHA-1 fingerprint (Android)
- Ensure Firebase config files present

**"Native module errors"**
- Expected in Expo Go
- Build development client: `eas build --profile development`

---

## 📊 **Configuration Status**

**Current State:**
- ✅ Code complete and pushed to GitHub
- ⚙️ OAuth credentials needed
- ⚙️ Database migration needed
- ⚙️ Service credentials needed (Firebase, GCS, Veryfi)

**Time to Fully Configured:**
- Minimum (just Google OAuth + DB): **1 hour**
- Full local setup: **2-3 hours**
- Production deployment: **3-4 hours**

---

## 🎯 **Start Here**

### **Absolute Minimum (30 min)**

```bash
# 1. Start database
cd server && docker-compose up -d postgres

# 2. Create .env with DATABASE_URL and JWT_SECRET
cat > .env << 'EOF'
DATABASE_URL="postgresql://user:password@localhost:5432/budget_tracker?schema=public"
JWT_SECRET="$(openssl rand -base64 64)"
NODE_ENV="development"
PORT=3000
CORS_ORIGIN="*"
EOF

# 3. Run migration
npm run prisma:migrate

# 4. Start backend
npm run dev

# Backend running! ✅
```

**Then**: Configure Google OAuth and update mobile app.json

---

## 📚 **Detailed Guides**

**OAuth Setup**: `app/SOCIAL_AUTH_SETUP.md`  
**GCP Deployment**: `server/GCP_DEPLOYMENT_GUIDE.md`  
**Push Notifications**: `app/PUSH_NOTIFICATIONS.md`  
**Docker**: `server/DOCKER.md`  

---

**Ready to configure? Start with the database and OAuth - those are the critical paths!** 🚀

