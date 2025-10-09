# Google Cloud Platform - Quick Deploy Guide

## 🚀 **Deploy Backend to Cloud Run**

This guide shows you exactly how to deploy your Budget Tracker API to Google Cloud Run.

**Time**: 20-30 minutes (first time)  
**Cost**: Free tier available (~$0-5/month for low traffic)

---

## 📋 **Prerequisites**

### **1. Google Cloud Account**
- Go to: https://console.cloud.google.com
- Sign in with Google account
- Accept terms
- **New users get $300 free credits** 🎉

### **2. Install gcloud CLI**

**macOS:**
```bash
brew install --cask google-cloud-sdk
```

**Linux:**
```bash
curl https://sdk.cloud.google.com | bash
exec -l $SHELL
```

**Windows:**
- Download: https://cloud.google.com/sdk/docs/install
- Run installer

**Verify Installation:**
```bash
gcloud --version
# Should show: Google Cloud SDK 450.x.x
```

---

## 🔧 **Step-by-Step Deployment**

### **Step 1: Create GCP Project** (5 min)

**Option A: Via Console (Easier)**

1. Go to: https://console.cloud.google.com
2. Click dropdown next to "Google Cloud" (top left)
3. Click "New Project"
4. Project name: `budget-tracker`
5. Organization: (leave default or select)
6. Click "Create"
7. **Copy your Project ID** (e.g., `budget-tracker-12345`)
   - You'll need this for deployment!

**Option B: Via CLI**

```bash
# Create project
gcloud projects create budget-tracker-$(date +%s) --name="Budget Tracker"

# List projects to get ID
gcloud projects list

# Copy the PROJECT_ID from the output
```

---

### **Step 2: Authenticate & Configure** (5 min)

```bash
# Login to Google Cloud
gcloud auth login
# Opens browser → Sign in → Allow

# Set your project (replace with YOUR project ID)
export GCP_PROJECT_ID="budget-tracker-12345"
gcloud config set project $GCP_PROJECT_ID

# Verify
gcloud config get-value project
# Should show: budget-tracker-12345
```

---

### **Step 3: Enable Required APIs** (3 min)

```bash
# Enable all required APIs
gcloud services enable \
  cloudbuild.googleapis.com \
  run.googleapis.com \
  secretmanager.googleapis.com \
  cloudscheduler.googleapis.com \
  storage.googleapis.com \
  sqladmin.googleapis.com

# This takes 1-2 minutes
# You'll see: "Operation finished successfully"
```

---

### **Step 4: Choose Region** (1 min)

**Recommended Regions:**

| Region | Location | Why Use |
|--------|----------|---------|
| `us-central1` | Iowa, USA | Default, cheapest |
| `us-east1` | South Carolina | Low latency East Coast |
| `us-west1` | Oregon | Low latency West Coast |
| `europe-west1` | Belgium | Europe users |
| `asia-southeast1` | Singapore | Asia users |

**Set Default Region:**
```bash
# Choose your region
export REGION="us-central1"
gcloud config set run/region $REGION

# Verify
gcloud config get-value run/region
```

**💡 Tip**: Choose the region closest to your users for best performance.

---

### **Step 5: Setup Environment Variables** (10 min)

**Create Production .env File:**

```bash
cd server

# Copy example
cp .env.secrets.example .env.secrets

# Edit with your production values
nano .env.secrets  # or: code .env.secrets
```

**Example .env.secrets (FILL IN YOUR VALUES):**

```bash
# Database (Required)
# Option A: Neon.tech (Free tier)
DATABASE_URL="postgresql://user:pass@ep-cool-name-123.us-east-2.aws.neon.tech/budget_tracker?sslmode=require"

# Option B: Cloud SQL
# DATABASE_URL="postgresql://user:pass@/budget_tracker?host=/cloudsql/PROJECT:REGION:INSTANCE"

# JWT Secrets (Required - Generate new for production!)
JWT_SECRET="$(openssl rand -base64 64)"
REFRESH_SECRET="$(openssl rand -base64 64)"

# Server Config
NODE_ENV="production"
PORT=8080
CORS_ORIGIN="https://your-app-domain.com"

# OAuth (Required - Get from Google Console)
GOOGLE_WEB_CLIENT_ID="123456-abc.apps.googleusercontent.com"
GOOGLE_IOS_CLIENT_ID="123456-ios.apps.googleusercontent.com"
GOOGLE_ANDROID_CLIENT_ID="123456-android.apps.googleusercontent.com"

# Apple (Optional)
APPLE_BUNDLE_ID="com.budgettracker.app"
APPLE_TEAM_ID="ABC123DEF4"
APPLE_KEY_ID="XYZ789"

# Facebook (Optional)
FACEBOOK_APP_ID="1234567890"
FACEBOOK_APP_SECRET="abcdef123456"

# Google Cloud Storage (Required for receipts)
GCS_BUCKET_NAME="budget-tracker-receipts"
GCS_PROJECT_ID="${GCP_PROJECT_ID}"
# Service account JSON will be auto-mounted in Cloud Run

# Veryfi OCR (Required for receipt scanning)
VERYFI_CLIENT_ID="your-client-id"
VERYFI_CLIENT_SECRET="your-client-secret"
VERYFI_USERNAME="your-username"
VERYFI_API_KEY="your-api-key"

# Firebase (Required for push notifications)
# Base64 encoded service account JSON
FIREBASE_ADMIN_JSON_BASE64="base64-encoded-firebase-admin-sdk-json"

# Cron Secret (Required for scheduled jobs)
CRON_SECRET="$(openssl rand -base64 32)"
```

---

### **Step 6: Upload Secrets to Secret Manager** (5 min)

**Option A: Use Bootstrap Script (Automated)**

```bash
cd server

# Ensure .env.secrets is filled out
cat .env.secrets

# Upload all secrets
npm run gcp:secrets:bootstrap

# This creates secrets in GCP Secret Manager for:
# - DATABASE_URL
# - JWT_SECRET
# - REFRESH_SECRET
# - GOOGLE_WEB_CLIENT_ID
# - GOOGLE_IOS_CLIENT_ID
# - GOOGLE_ANDROID_CLIENT_ID
# - VERYFI_CLIENT_ID
# - VERYFI_CLIENT_SECRET
# - VERYFI_USERNAME
# - VERYFI_API_KEY
# - FIREBASE_ADMIN_JSON_BASE64
# - CRON_SECRET
# etc.
```

**Option B: Manual Upload**

```bash
# Upload each secret manually
echo -n "your-secret-value" | gcloud secrets create SECRET_NAME --data-file=-

# Example:
echo -n "postgresql://..." | gcloud secrets create DATABASE_URL --data-file=-
echo -n "your-jwt-secret" | gcloud secrets create JWT_SECRET --data-file=-
```

**Verify Secrets:**
```bash
# List all secrets
gcloud secrets list

# You should see:
# DATABASE_URL
# JWT_SECRET
# REFRESH_SECRET
# GOOGLE_WEB_CLIENT_ID
# etc.
```

---

### **Step 7: Build Docker Image** (5 min)

**Build and Push to Google Container Registry:**

```bash
cd server

# Set your project ID
export GCP_PROJECT_ID="budget-tracker-12345"  # REPLACE WITH YOURS

# Build image (takes 2-5 minutes)
gcloud builds submit --tag gcr.io/$GCP_PROJECT_ID/mobile-backend:latest

# You'll see:
# - "Creating temporary tarball..."
# - "Uploading tarball of [.] to [gs://...]"
# - "BUILD SUCCESS"
```

**Or use npm script:**
```bash
npm run gcp:build
```

---

### **Step 8: Deploy to Cloud Run** (3 min)

**Manual Deployment:**

```bash
cd server

# Deploy (replace values)
gcloud run deploy mobile-backend \
  --image gcr.io/$GCP_PROJECT_ID/mobile-backend:latest \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 5 \
  --timeout 60 \
  --set-secrets="DATABASE_URL=DATABASE_URL:latest,JWT_SECRET=JWT_SECRET:latest,REFRESH_SECRET=REFRESH_SECRET:latest,GOOGLE_WEB_CLIENT_ID=GOOGLE_WEB_CLIENT_ID:latest,GOOGLE_IOS_CLIENT_ID=GOOGLE_IOS_CLIENT_ID:latest,GOOGLE_ANDROID_CLIENT_ID=GOOGLE_ANDROID_CLIENT_ID:latest,VERYFI_CLIENT_ID=VERYFI_CLIENT_ID:latest,VERYFI_CLIENT_SECRET=VERYFI_CLIENT_SECRET:latest,VERYFI_USERNAME=VERYFI_USERNAME:latest,VERYFI_API_KEY=VERYFI_API_KEY:latest,FIREBASE_ADMIN_JSON_BASE64=FIREBASE_ADMIN_JSON_BASE64:latest,CRON_SECRET=CRON_SECRET:latest"

# Deployment takes 2-3 minutes
# You'll get a URL like:
# Service URL: https://mobile-backend-abc123-uc.a.run.app
```

**Or use npm script:**
```bash
npm run gcp:deploy
```

**Copy the Service URL** - you'll need this for your mobile app!

---

### **Step 9: Run Database Migration** (2 min)

**Option A: Using Cloud Run Job**

```bash
# Connect to Cloud Run service
gcloud run jobs create prisma-migrate \
  --image gcr.io/$GCP_PROJECT_ID/mobile-backend:latest \
  --region us-central1 \
  --set-secrets="DATABASE_URL=DATABASE_URL:latest" \
  --command="npx" \
  --args="prisma,migrate,deploy"

# Run migration
gcloud run jobs execute prisma-migrate --region us-central1
```

**Option B: Locally (if using public DB like Neon)**

```bash
# Set production DATABASE_URL
export DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"

# Run migration
npx prisma migrate deploy

# Verify
npx prisma studio
```

---

### **Step 10: Verify Deployment** (2 min)

**Test Health Endpoint:**

```bash
# Get your service URL
gcloud run services describe mobile-backend \
  --region us-central1 \
  --format="value(status.url)"

# Test it
curl https://mobile-backend-abc123-uc.a.run.app/health

# Should return:
# {
#   "status": "healthy",
#   "database": "connected",
#   "timestamp": "2024-10-09T..."
# }
```

✅ **Your backend is live!**

---

## 🎯 **Quick Deploy Commands**

### **First Time Setup**

```bash
# 1. Authenticate
gcloud auth login
gcloud config set project YOUR_PROJECT_ID

# 2. Enable APIs
gcloud services enable cloudbuild.googleapis.com run.googleapis.com secretmanager.googleapis.com

# 3. Upload secrets
cd server
npm run gcp:secrets:bootstrap

# 4. Build & Deploy
npm run gcp:build
npm run gcp:deploy
```

---

### **Update Deployment (After Changes)**

```bash
cd server

# Build new image
npm run gcp:build

# Deploy updated image
npm run gcp:deploy

# That's it! Takes ~3 minutes total
```

---

## 📱 **Update Mobile App**

After deployment, update your mobile app to use the production API:

**Edit app/app.json:**

```json
{
  "expo": {
    "extra": {
      "apiBaseUrl": "https://mobile-backend-abc123-uc.a.run.app"
    }
  }
}
```

**Or use environment variables:**

```json
{
  "expo": {
    "extra": {
      "apiBaseUrl": {
        "development": "http://10.0.2.2:3000",
        "production": "https://mobile-backend-abc123-uc.a.run.app"
      }
    }
  }
}
```

---

## 🔒 **Setup Cloud Scheduler (Daily Digest)**

**Create Scheduled Job:**

```bash
# Create scheduler job (runs daily at 8 PM)
gcloud scheduler jobs create http daily-digest-job \
  --location us-central1 \
  --schedule="0 20 * * *" \
  --uri="https://mobile-backend-abc123-uc.a.run.app/api/jobs/daily-digest" \
  --http-method=POST \
  --headers="x-cron-secret=YOUR_CRON_SECRET" \
  --oidc-service-account-email="YOUR_PROJECT_NUMBER-compute@developer.gserviceaccount.com"

# Test it manually
gcloud scheduler jobs run daily-digest-job --location us-central1
```

---

## 💰 **Cost Estimate**

**Cloud Run Pricing (Free Tier):**
- First 2 million requests/month: **FREE**
- 180,000 vCPU-seconds: **FREE**
- 360,000 GiB-seconds: **FREE**

**Expected Monthly Cost:**
- 0-1,000 users: **$0** (free tier)
- 1,000-10,000 users: **$0-10**
- 10,000+ users: **$10-50**

**Additional Costs:**
- Database (Neon): **$0** (free tier) or **$19/mo** (pro)
- Cloud Storage: **$0.02/GB** (~$1-5/mo)
- Secret Manager: **$0.06/secret/mo** (~$1/mo)

**Total for MVP**: **$0-15/month** 🎉

---

## 🐛 **Troubleshooting**

### **Build Fails**

```bash
# Check Docker builds locally first
cd server
docker build -t test .

# If it works locally, try:
gcloud builds submit --tag gcr.io/$GCP_PROJECT_ID/mobile-backend:latest
```

---

### **Deployment Fails**

```bash
# Check service logs
gcloud run services logs read mobile-backend --region us-central1

# Common issues:
# - Missing secrets → run gcp:secrets:bootstrap
# - Wrong region → check gcloud config get-value run/region
# - Insufficient permissions → check IAM roles
```

---

### **Database Connection Fails**

```bash
# Test connection locally
export DATABASE_URL="your-production-db-url"
npx prisma db pull

# If fails:
# - Check IP allowlist (Neon/Supabase)
# - Verify SSL mode (?sslmode=require)
# - Check credentials
```

---

### **Secrets Not Loading**

```bash
# List secrets
gcloud secrets list

# Check secret value
gcloud secrets versions access latest --secret=DATABASE_URL

# Grant Cloud Run access
gcloud projects add-iam-policy-binding $GCP_PROJECT_ID \
  --member="serviceAccount:$PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

---

## ✅ **Deployment Checklist**

### **Pre-Deployment**

- [ ] GCP account created
- [ ] gcloud CLI installed
- [ ] Project created (copy Project ID)
- [ ] APIs enabled
- [ ] .env.secrets filled with production values
- [ ] Database created (Neon/Supabase/Cloud SQL)
- [ ] OAuth credentials configured
- [ ] Firebase setup complete
- [ ] GCS bucket created
- [ ] Veryfi account setup

### **Deployment**

- [ ] Secrets uploaded to Secret Manager
- [ ] Docker image built and pushed
- [ ] Cloud Run service deployed
- [ ] Service URL received
- [ ] Database migration run
- [ ] Health endpoint returns "healthy"
- [ ] Cloud Scheduler job created (optional)

### **Post-Deployment**

- [ ] Mobile app updated with production API URL
- [ ] Test login with all OAuth providers
- [ ] Test transaction creation
- [ ] Test receipt upload
- [ ] Test OCR processing
- [ ] Test push notifications
- [ ] Monitor logs for errors

---

## 📊 **Monitoring & Logs**

**View Logs:**
```bash
# Real-time logs
gcloud run services logs tail mobile-backend --region us-central1

# Recent logs
gcloud run services logs read mobile-backend --limit=100
```

**View Metrics:**
```bash
# Open Cloud Console
gcloud run services describe mobile-backend --region us-central1 --format="value(status.url)"

# Go to: https://console.cloud.google.com/run
# Click "mobile-backend" → Metrics tab
```

**Set Up Alerts:**
```bash
# Cloud Console → Monitoring → Alerting
# Create alert for:
# - Error rate > 5%
# - Request latency > 2s
# - CPU utilization > 80%
```

---

## 🔄 **CI/CD (Optional)**

**GitHub Actions for Auto-Deploy:**

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Cloud Run

on:
  push:
    branches: [main]
    paths:
      - 'server/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - uses: google-github-actions/auth@v1
        with:
          credentials_json: ${{ secrets.GCP_SA_KEY }}
      
      - uses: google-github-actions/setup-gcloud@v1
      
      - name: Build
        run: |
          cd server
          gcloud builds submit --tag gcr.io/${{ secrets.GCP_PROJECT_ID }}/mobile-backend:latest
      
      - name: Deploy
        run: |
          cd server
          gcloud run deploy mobile-backend \
            --image gcr.io/${{ secrets.GCP_PROJECT_ID }}/mobile-backend:latest \
            --region us-central1
```

---

## 🎯 **Production Best Practices**

### **Security**

- ✅ Use Secret Manager (never commit secrets)
- ✅ Enable CORS only for your app domain
- ✅ Rotate JWT secrets regularly
- ✅ Use SSL/TLS everywhere
- ✅ Enable Cloud Armor (DDoS protection)

### **Performance**

- ✅ Set min-instances=1 for faster cold starts (costs ~$10/mo)
- ✅ Enable HTTP/2
- ✅ Use Cloud CDN for static assets
- ✅ Database connection pooling (Prisma handles this)

### **Reliability**

- ✅ Set up health checks
- ✅ Configure auto-scaling (done by default)
- ✅ Use Cloud SQL Proxy for database
- ✅ Regular database backups
- ✅ Set up monitoring and alerts

---

## 🚀 **Ready to Deploy?**

### **Quick Checklist:**

1. ✅ `gcloud auth login`
2. ✅ `gcloud config set project YOUR_PROJECT_ID`
3. ✅ Fill `server/.env.secrets`
4. ✅ Run `npm run gcp:secrets:bootstrap`
5. ✅ Run `npm run gcp:build`
6. ✅ Run `npm run gcp:deploy`
7. ✅ Test: `curl YOUR_SERVICE_URL/health`

**That's it! Your backend is live!** 🎉

---

## 📚 **Additional Resources**

- **Cloud Run Docs**: https://cloud.google.com/run/docs
- **Pricing Calculator**: https://cloud.google.com/products/calculator
- **Best Practices**: https://cloud.google.com/run/docs/best-practices
- **Troubleshooting**: https://cloud.google.com/run/docs/troubleshooting

---

**Need help? Check the logs or reach out!** 🙌

