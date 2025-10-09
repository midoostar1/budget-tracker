# Google Cloud Platform Deployment Guide

## 🚀 Complete GCP Deployment with NPM Scripts

This guide shows how to deploy the Budget Tracker API to Google Cloud Platform using the simplified npm scripts.

---

## 📋 Prerequisites

### **Required**
- Node.js 20+
- npm 9+
- gcloud CLI installed and authenticated
- Docker installed (for local builds)
- GCP Project with billing enabled

### **GCP Services Required**
- Cloud Run
- Cloud Build
- Secret Manager
- Cloud Scheduler
- Cloud SQL (optional) or external PostgreSQL
- Container Registry or Artifact Registry

---

## 🎯 **Quick Deploy (3 Commands)**

```bash
cd server

# 1. Bootstrap secrets to Secret Manager
npm run gcp:secrets:bootstrap

# 2. Build Docker image with Cloud Build
export GCP_PROJECT_ID="your-project-id"
npm run gcp:build

# 3. Deploy to Cloud Run
npm run gcp:deploy
```

**That's it! Your API is live.** 🎉

---

## 📝 **Detailed Setup**

### **Step 1: Initial GCP Setup**

```bash
# Set your project ID
export GCP_PROJECT_ID="your-project-id"
export GCP_REGION="us-central1"

# Authenticate with gcloud
gcloud auth login

# Set default project
gcloud config set project $GCP_PROJECT_ID

# Enable required APIs
gcloud services enable \
  cloudbuild.googleapis.com \
  run.googleapis.com \
  secretmanager.googleapis.com \
  cloudscheduler.googleapis.com \
  sqladmin.googleapis.com \
  storage.googleapis.com
```

---

### **Step 2: Prepare Secrets**

```bash
# Copy secrets template
cp .env.secrets.example .env.secrets

# Edit with your production values
nano .env.secrets
```

**Required in .env.secrets:**
- `DATABASE_URL` - PostgreSQL connection
- `JWT_SECRET` - 32+ random characters
- `CRON_SECRET` - 32+ random characters
- `CORS_ALLOWED_ORIGINS` - Your frontend URLs
- At least one OAuth provider (Google/Apple/Facebook)

**Optional:**
- `GCS_*` for receipts
- `VERYFI_*` for OCR
- `FIREBASE_ADMIN_JSON_BASE64` for push notifications

---

### **Step 3: Bootstrap Secrets**

```bash
# Run the bootstrap script
npm run gcp:secrets:bootstrap
```

**What it does:**
1. Reads `.env.secrets` file
2. Creates/updates secrets in Secret Manager
3. Skips empty values
4. Shows summary (created, updated, skipped)

**Output:**
```
🔐 Budget Tracker - Secret Manager Bootstrap
============================================

ℹ Using GCP Project: your-project-id
✓ Loaded 18 values from .env.secrets

ℹ Processing secrets...

ℹ Creating secret: budget-tracker-database-url
✓ Created: budget-tracker-database-url

ℹ Updating secret: budget-tracker-jwt-secret
✓ Updated: budget-tracker-jwt-secret

...

============================================

✓ Bootstrap completed!

  Created: 12
  Updated: 6
  Skipped: 0
```

---

### **Step 4: Set Up Service Account**

```bash
# Create service account
gcloud iam service-accounts create budget-tracker-sa \
  --display-name="Budget Tracker API"

# Grant necessary roles
gcloud projects add-iam-policy-binding $GCP_PROJECT_ID \
  --member="serviceAccount:budget-tracker-sa@${GCP_PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/cloudsql.client"

gcloud projects add-iam-policy-binding $GCP_PROJECT_ID \
  --member="serviceAccount:budget-tracker-sa@${GCP_PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/storage.objectAdmin"

# Grant access to all secrets
for secret in budget-tracker-database-url budget-tracker-jwt-secret \
              budget-tracker-google-web-client-id budget-tracker-cron-secret \
              budget-tracker-cors-allowed-origins; do
  gcloud secrets add-iam-policy-binding $secret \
    --member="serviceAccount:budget-tracker-sa@${GCP_PROJECT_ID}.iam.gserviceaccount.com" \
    --role="roles/secretmanager.secretAccessor"
done
```

---

### **Step 5: Build Docker Image**

```bash
# Using Cloud Build (recommended - faster, no local Docker needed)
npm run gcp:build

# This runs:
# gcloud builds submit --tag gcr.io/$GCP_PROJECT_ID/mobile-backend:latest
```

**What happens:**
- Source code uploaded to Cloud Build
- Multi-stage Dockerfile executed in cloud
- Image tagged as `gcr.io/$GCP_PROJECT_ID/mobile-backend:latest`
- Image stored in Container Registry

**Build time:** ~3-5 minutes

---

### **Step 6: Deploy to Cloud Run**

```bash
# Deploy using npm script
npm run gcp:deploy

# This runs:
# gcloud run deploy mobile-backend \
#   --image gcr.io/$GCP_PROJECT_ID/mobile-backend:latest \
#   --region us-central1 \
#   --allow-unauthenticated \
#   --platform managed \
#   --memory 512Mi \
#   --cpu 1 \
#   --max-instances 5 \
#   --min-instances 0 \
#   --timeout 300 \
#   --port 3000
```

**Deployment Configuration:**
- **Name**: mobile-backend
- **Region**: us-central1
- **Memory**: 512Mi
- **CPU**: 1 vCPU
- **Scaling**: 0 to 5 instances
- **Timeout**: 300 seconds (5 minutes)
- **Port**: 3000
- **Access**: Unauthenticated (public API)

**Note:** For production, consider using `cloudrun.yaml` for more control:
```bash
gcloud run services replace cloudrun.yaml --region=us-central1
```

---

### **Step 7: Run Database Migrations**

```bash
# Option A: Using Cloud SQL Proxy
cloud_sql_proxy -instances=$GCP_PROJECT_ID:$GCP_REGION:INSTANCE=tcp:5432 &

export DATABASE_URL="postgresql://user:pass@localhost:5432/budget_tracker"
npm run prisma:migrate:prod

# Option B: Direct connection (if public IP enabled)
npm run prisma:migrate:prod
```

---

### **Step 8: Set Up Cloud Scheduler**

```bash
# Get Cloud Run URL
SERVICE_URL=$(gcloud run services describe mobile-backend \
  --region=us-central1 \
  --format="value(status.url)")

# Get cron secret
CRON_SECRET=$(gcloud secrets versions access latest \
  --secret="budget-tracker-cron-secret")

# Create daily digest job (8:00 PM daily)
gcloud scheduler jobs create http daily-digest \
  --location=us-central1 \
  --schedule="0 20 * * *" \
  --uri="${SERVICE_URL}/jobs/daily-digest" \
  --http-method=POST \
  --headers="x-cron-secret=${CRON_SECRET}" \
  --time-zone="America/New_York" \
  --description="Daily digest notifications" \
  --attempt-deadline=300s
```

**See [CLOUD_SCHEDULER.md](./CLOUD_SCHEDULER.md) for complete details.**

---

### **Step 9: Verify Deployment**

```bash
# Get service URL
SERVICE_URL=$(gcloud run services describe mobile-backend \
  --region=us-central1 \
  --format="value(status.url)")

echo "Service deployed at: $SERVICE_URL"

# Test health endpoint
curl ${SERVICE_URL}/health

# Expected response:
# {
#   "status": "healthy",
#   "timestamp": "...",
#   "uptime": 123,
#   "environment": "production",
#   "database": "connected"
# }

# Test API info
curl ${SERVICE_URL}/

# View logs
gcloud run services logs read mobile-backend \
  --region=us-central1 \
  --limit=20
```

---

## 📦 **NPM Scripts Reference**

### **GCP Scripts**

| Script | Command | Description |
|--------|---------|-------------|
| `gcp:build` | Cloud Build submit | Build Docker image in cloud |
| `gcp:deploy` | Cloud Run deploy | Deploy to Cloud Run |
| `gcp:secrets:bootstrap` | Node script | Create/update Secret Manager secrets |

### **Usage Examples**

```bash
# Build only
npm run gcp:build

# Deploy existing image
npm run gcp:deploy

# Update secrets
npm run gcp:secrets:bootstrap

# Complete deployment
npm run gcp:build && npm run gcp:deploy
```

---

## 🔧 **Customizing Deployment**

### **Change Region**

Edit `package.json`:
```json
"gcp:deploy": "gcloud run deploy mobile-backend ... --region europe-west1 ..."
```

### **Adjust Resources**

```json
"gcp:deploy": "... --memory 1Gi --cpu 2 --max-instances 10 ..."
```

### **Add Environment Variables**

```json
"gcp:deploy": "... --set-env-vars=LOG_LEVEL=debug,NODE_ENV=production ..."
```

### **Use Service Account**

```json
"gcp:deploy": "... --service-account=budget-tracker-sa@PROJECT.iam.gserviceaccount.com ..."
```

---

## 🔄 **CI/CD Integration**

### **GitHub Actions**

```yaml
name: Deploy to GCP

on:
  push:
    branches: [main]

env:
  GCP_PROJECT_ID: ${{ secrets.GCP_PROJECT_ID }}
  GCP_REGION: us-central1

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - uses: google-github-actions/auth@v1
      with:
        credentials_json: ${{ secrets.GCP_SA_KEY }}
    
    - name: Set up Cloud SDK
      uses: google-github-actions/setup-gcloud@v1
    
    - name: Build and Deploy
      run: |
        cd server
        npm ci
        npm run gcp:build
        npm run gcp:deploy
    
    - name: Run Migrations
      run: |
        cd server
        npm run prisma:migrate:prod
      env:
        DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

---

## 📊 **Complete Deployment Workflow**

### **First-Time Deployment**

```bash
# 1. Set up GCP project
export GCP_PROJECT_ID="your-project-id"
gcloud config set project $GCP_PROJECT_ID

# 2. Enable APIs
gcloud services enable cloudbuild.googleapis.com run.googleapis.com secretmanager.googleapis.com

# 3. Create service account
gcloud iam service-accounts create budget-tracker-sa

# 4. Prepare secrets
cp .env.secrets.example .env.secrets
# Edit .env.secrets with real values

# 5. Bootstrap secrets
npm run gcp:secrets:bootstrap

# 6. Grant service account access to secrets
# (See DEPLOYMENT.md for complete commands)

# 7. Build image
npm run gcp:build

# 8. Deploy
npm run gcp:deploy

# 9. Run migrations
npm run prisma:migrate:prod

# 10. Set up Cloud Scheduler
# (See CLOUD_SCHEDULER.md)
```

---

### **Update Deployment**

```bash
# Quick update (code changes only)
npm run gcp:build && npm run gcp:deploy

# With migrations
npm run gcp:build && \
npm run gcp:deploy && \
npm run prisma:migrate:prod

# Update secrets only
npm run gcp:secrets:bootstrap
```

---

## 💰 **Cost Breakdown**

### **Estimated Monthly Costs**

**Cloud Run** (light usage, 10K req/day):
- Requests: Free tier covers
- CPU: ~$1
- Memory: ~$0.30
- **Subtotal: ~$1.30/month**

**Cloud Build** (10 builds/month):
- First 120 build-minutes/day: Free
- **Subtotal: $0**

**Secret Manager**:
- 18 secrets × $0.06 = **$1.08/month**

**Cloud Scheduler**:
- 2 jobs (digest + OCR): Free tier
- **Subtotal: $0**

**Container Registry**:
- Storage: $0.10/GB/month
- **Subtotal: ~$0.10/month**

**Total Base Cost: ~$2.50/month**

**Add-ons:**
- Cloud SQL: $7-50/month
- Cloud Storage: $0.02/GB
- Veryfi OCR: Variable per document

---

## 🔐 **Security Notes**

### **Public vs Private Endpoints**

**Current:** `--allow-unauthenticated` (public API)

**For private API** (requires authentication):
```bash
# Deploy without --allow-unauthenticated
gcloud run deploy mobile-backend \
  --image gcr.io/$GCP_PROJECT_ID/mobile-backend:latest \
  --region us-central1 \
  --no-allow-unauthenticated

# Mobile app must include authentication
# curl -H "Authorization: Bearer $(gcloud auth print-identity-token)" ...
```

**Recommendation:** 
- Use public API with application-level auth (current setup)
- All endpoints protected by JWT except health checks
- Cron jobs protected by x-cron-secret

---

## 📚 **Additional Documentation**

- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Detailed deployment guide
- **[CLOUD_SCHEDULER.md](./CLOUD_SCHEDULER.md)** - Scheduler configuration
- **[DOCKER.md](./DOCKER.md)** - Docker usage
- **[SECURITY.md](./SECURITY.md)** - Security implementation

---

## 🎯 **Quick Reference**

### **Environment Variables**

```bash
# Required for scripts
export GCP_PROJECT_ID="your-project-id"
export GCP_REGION="us-central1"  # Optional, defaults in scripts
```

### **NPM Scripts**

```bash
# Build Docker image in cloud
npm run gcp:build

# Deploy to Cloud Run
npm run gcp:deploy

# Bootstrap secrets
npm run gcp:secrets:bootstrap

# Run database migrations
npm run prisma:migrate:prod
```

### **Useful Commands**

```bash
# View service details
gcloud run services describe mobile-backend --region=us-central1

# View logs
gcloud run services logs read mobile-backend --region=us-central1 --limit=50

# List services
gcloud run services list

# Delete service
gcloud run services delete mobile-backend --region=us-central1
```

---

**Last Updated**: 2024-10-09  
**Status**: ✅ Ready for Deployment

