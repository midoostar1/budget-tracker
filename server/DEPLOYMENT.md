# Cloud Run Deployment Guide

## Overview

Complete guide for deploying Budget Tracker API to Google Cloud Run with Secret Manager, Cloud SQL, and Cloud Scheduler integration.

---

## 📋 Prerequisites

### Required Tools

- **gcloud CLI** - [Install](https://cloud.google.com/sdk/docs/install)
- **Docker** - [Install](https://docs.docker.com/get-docker/)
- **Git** - For version control

### Google Cloud Project

1. **Create GCP Project** (or use existing)
2. **Enable Billing** on the project
3. **Install gcloud CLI** and authenticate:
   ```bash
   gcloud auth login
   gcloud config set project YOUR_PROJECT_ID
   ```

---

## 🚀 **Deployment Steps**

### **Step 1: Prepare Environment**

```bash
cd server

# Copy and configure environment
cp .env.example .env

# Edit .env with production values
# ⚠️ IMPORTANT: Use strong secrets (32+ random characters)
nano .env
```

**Required in .env:**
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Min 32 characters, random
- `CRON_SECRET` - Min 32 characters, random
- At least one social provider (Google/Apple/Facebook)
- `CORS_ALLOWED_ORIGINS` - Your production frontend URLs

**Optional:**
- `GCS_*` - For receipt uploads
- `VERYFI_*` - For OCR processing
- `FIREBASE_ADMIN_JSON_BASE64` - For push notifications

---

### **Step 2: Set Up Secrets in Secret Manager**

```bash
# Run the automated setup script
./setup-secrets.sh
```

**What it does:**
- Creates all secrets from your `.env` file
- Grants service account access
- Validates configuration

**Manual alternative:**
```bash
# Create individual secrets
echo -n "your-secret-value" | gcloud secrets create budget-tracker-jwt-secret \
  --data-file=- \
  --replication-policy="automatic"

# Grant access to Cloud Run service account
gcloud secrets add-iam-policy-binding budget-tracker-jwt-secret \
  --member="serviceAccount:SERVICE_ACCOUNT@PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

---

### **Step 3: Set Up Database**

#### **Option A: Cloud SQL (Recommended)**

```bash
# Create Cloud SQL instance
gcloud sql instances create budget-tracker-db \
  --database-version=POSTGRES_15 \
  --tier=db-f1-micro \
  --region=us-central1 \
  --root-password=STRONG_PASSWORD

# Create database
gcloud sql databases create budget_tracker \
  --instance=budget-tracker-db

# Get connection name
gcloud sql instances describe budget-tracker-db \
  --format="value(connectionName)"

# Update cloudrun.yaml with connection annotation:
# run.googleapis.com/cloudsql-instances: PROJECT_ID:REGION:INSTANCE_NAME
```

**Connection String:**
```bash
DATABASE_URL=postgresql://USER:PASSWORD@/budget_tracker?host=/cloudsql/PROJECT:REGION:INSTANCE
```

#### **Option B: External PostgreSQL**

Use any PostgreSQL 13+ database and update `DATABASE_URL`.

---

### **Step 4: Run Database Migrations**

```bash
# Option A: Use Cloud SQL Proxy (recommended)
cloud_sql_proxy -instances=PROJECT_ID:REGION:INSTANCE_NAME=tcp:5432

# In another terminal
export DATABASE_URL="postgresql://user:pass@localhost:5432/budget_tracker"
npx prisma migrate deploy

# Option B: Allowlist your IP and connect directly
# Add your IP in Cloud SQL > Connections > Authorized Networks
npx prisma migrate deploy
```

---

### **Step 5: Create Service Account**

```bash
# Create service account
gcloud iam service-accounts create budget-tracker-sa \
  --display-name="Budget Tracker API Service Account"

# Grant necessary roles
gcloud projects add-iam-policy-binding PROJECT_ID \
  --member="serviceAccount:budget-tracker-sa@PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/cloudsql.client"

gcloud projects add-iam-policy-binding PROJECT_ID \
  --member="serviceAccount:budget-tracker-sa@PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/storage.objectAdmin"

# Secret access is granted by setup-secrets.sh
```

---

### **Step 6: Update cloudrun.yaml**

Edit `cloudrun.yaml` and replace placeholders:

```yaml
# Replace these values:
- PROJECT_ID → your-gcp-project-id
- REGION → us-central1 (or your region)
- REPOSITORY → budget-tracker
- TAG → latest (or commit hash)

# Update service account email:
serviceAccountName: budget-tracker-sa@PROJECT_ID.iam.gserviceaccount.com

# If using Cloud SQL, uncomment:
# run.googleapis.com/cloudsql-instances: PROJECT_ID:REGION:INSTANCE_NAME
```

---

### **Step 7: Deploy to Cloud Run**

```bash
# Automated deployment (recommended)
./deploy.sh

# Or manual deployment:

# Build Docker image
docker build --platform linux/amd64 \
  -t us-central1-docker.pkg.dev/PROJECT_ID/budget-tracker/budget-tracker-api:latest .

# Push to Artifact Registry
docker push us-central1-docker.pkg.dev/PROJECT_ID/budget-tracker/budget-tracker-api:latest

# Deploy with cloudrun.yaml
gcloud run services replace cloudrun.yaml --region=us-central1
```

---

### **Step 8: Set Up Cloud Scheduler (Daily Digest)**

```bash
# Get Cloud Run service URL
SERVICE_URL=$(gcloud run services describe budget-tracker-api \
  --region=us-central1 \
  --format="value(status.url)")

# Create daily digest job
gcloud scheduler jobs create http daily-digest \
  --schedule="0 9 * * *" \
  --uri="${SERVICE_URL}/jobs/daily-digest" \
  --http-method=POST \
  --headers="x-cron-secret=YOUR_CRON_SECRET" \
  --location=us-central1 \
  --time-zone="America/New_York" \
  --description="Daily digest: pending receipts and bill reminders"

# Create OCR batch processing job (every 5 minutes)
gcloud scheduler jobs create http ocr-batch \
  --schedule="*/5 * * * *" \
  --uri="${SERVICE_URL}/api/receipts/process/batch?limit=10" \
  --http-method=POST \
  --headers="x-cron-secret=YOUR_CRON_SECRET" \
  --location=us-central1 \
  --description="Batch process pending receipts with OCR"
```

---

### **Step 9: Verify Deployment**

```bash
# Get service URL
SERVICE_URL=$(gcloud run services describe budget-tracker-api \
  --region=us-central1 \
  --format="value(status.url)")

# Test health endpoint
curl ${SERVICE_URL}/health

# Test API info
curl ${SERVICE_URL}/

# View logs
gcloud run services logs read budget-tracker-api \
  --region=us-central1 \
  --limit=50
```

---

## 📦 **Dockerfile Details**

### **Multi-Stage Build**

**Stage 1: Dependencies**
- Installs production dependencies only
- Cleans npm cache
- Minimal layer size

**Stage 2: Builder**
- Installs all dependencies (including dev)
- Generates Prisma Client
- Compiles TypeScript to JavaScript

**Stage 3: Runner (Final Image)**
- Based on Node 20 Alpine (minimal)
- Non-root user (security)
- Production dependencies only
- Compiled code only
- Health check configured
- Optimized for Cloud Run

**Image Size:** ~200-300MB (compressed)

---

## ⚙️ **Cloud Run Configuration**

### **Auto-Scaling**

```yaml
minScale: 0          # Scale to zero when idle (cost savings)
maxScale: 5          # Maximum 5 instances
```

**Benefits:**
- **Cost Efficient**: Pay only for what you use
- **Auto-scaling**: Handles traffic spikes
- **Cold Start**: ~2-5 seconds (with startup CPU boost)

### **Resources**

```yaml
cpu: 1000m          # 1 vCPU
memory: 512Mi       # 512 MiB RAM
```

**Suitable for:**
- Low to medium traffic (< 1000 req/min)
- Typical API workloads
- Database-backed applications

**Upgrade if needed:**
- High traffic: Increase maxScale
- Memory issues: Increase to 1Gi or 2Gi
- CPU intensive: Increase to 2000m

### **Probes**

**Startup Probe:**
- Initial delay: 5 seconds
- Check `/health` endpoint
- Max failures: 10

**Liveness Probe:**
- Checks every 10 seconds
- Restarts container if fails 3 times

**Readiness Probe:**
- Checks every 5 seconds
- Routes traffic when ready

---

## 🗄️ **Database Options**

### **Option 1: Cloud SQL (Recommended)**

**Pros:**
- Managed PostgreSQL
- Automatic backups
- High availability
- VPC integration
- Cloud Run native connector

**Setup:**
```bash
# Already shown in Step 3
# Use connection annotation in cloudrun.yaml
```

### **Option 2: External Database**

**Supported:**
- Heroku Postgres
- AWS RDS
- Digital Ocean Databases
- Supabase
- Any PostgreSQL 13+

**Configuration:**
- Set `DATABASE_URL` in Secret Manager
- Ensure network connectivity
- May need VPC connector or public IP

---

## 🔐 **Security Configuration**

### **Service Account Permissions**

Minimal required roles:
- `roles/cloudsql.client` - Database access
- `roles/storage.objectAdmin` - GCS access
- `roles/secretmanager.secretAccessor` - Secret access

### **Secret Manager Best Practices**

✅ Use Secret Manager (not environment variables)  
✅ Rotate secrets quarterly  
✅ Use latest version aliases  
✅ Grant minimal permissions  
✅ Audit secret access  

### **Network Security**

- Enable VPC connector for private resources
- Use Cloud Armor for DDoS protection
- Configure IAM policies restrictively
- Enable Cloud Run authentication (if needed)

---

## 💰 **Cost Estimation**

### **Cloud Run Pricing** (as of 2024)

**Free Tier:**
- 2 million requests/month
- 360,000 vCPU-seconds/month
- 180,000 GiB-seconds/month

**Estimated Monthly Cost** (beyond free tier):

**Light usage** (10K req/day, avg 200ms):
- Requests: ~$0.10
- CPU time: ~$1.00
- Memory: ~$0.30
- **Total: ~$1.40/month**

**Medium usage** (100K req/day):
- Requests: ~$1.00
- CPU time: ~$10.00
- Memory: ~$3.00
- **Total: ~$14/month**

**Additional Costs:**
- Cloud SQL: $7-$50/month (depends on tier)
- Cloud Storage: $0.02/GB/month
- Secret Manager: $0.06/secret/month
- Veryfi OCR: Variable (per document)
- Cloud Scheduler: $0.10/job/month

---

## 📊 **Monitoring & Logging**

### **Cloud Run Logs**

```bash
# View recent logs
gcloud run services logs read budget-tracker-api \
  --region=us-central1 \
  --limit=100

# Follow logs (tail)
gcloud run services logs tail budget-tracker-api \
  --region=us-central1

# Filter by severity
gcloud run services logs read budget-tracker-api \
  --region=us-central1 \
  --log-filter='severity>=ERROR'
```

### **Metrics**

View in Cloud Console:
- Request count
- Request latency (p50, p95, p99)
- Error rate
- Container instances
- CPU utilization
- Memory utilization

### **Alerts**

Set up alerts for:
- Error rate > 5%
- Response time > 2 seconds (p95)
- Instance count at max
- Memory usage > 80%
- Database connection failures

---

## 🔄 **CI/CD Integration**

### **GitHub Actions Example**

```yaml
name: Deploy to Cloud Run

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - id: auth
      uses: google-github-actions/auth@v1
      with:
        credentials_json: ${{ secrets.GCP_SA_KEY }}
    
    - name: Set up Cloud SDK
      uses: google-github-actions/setup-gcloud@v1
    
    - name: Configure Docker
      run: gcloud auth configure-docker us-central1-docker.pkg.dev
    
    - name: Build and Push
      run: |
        cd server
        docker build -t us-central1-docker.pkg.dev/PROJECT_ID/budget-tracker/budget-tracker-api:${{ github.sha }} .
        docker push us-central1-docker.pkg.dev/PROJECT_ID/budget-tracker/budget-tracker-api:${{ github.sha }}
    
    - name: Deploy to Cloud Run
      run: |
        cd server
        sed -e "s|TAG|${{ github.sha }}|g" cloudrun.yaml > cloudrun-deploy.yaml
        gcloud run services replace cloudrun-deploy.yaml --region=us-central1
```

---

## 🔧 **Troubleshooting**

### Issue: "Permission denied" during deployment

**Solution:**
```bash
# Ensure you're authenticated
gcloud auth login

# Set project
gcloud config set project PROJECT_ID

# Check permissions
gcloud projects get-iam-policy PROJECT_ID \
  --filter="bindings.members:user:YOUR_EMAIL"
```

### Issue: "Secret not found"

**Solution:**
```bash
# Run setup-secrets.sh again
./setup-secrets.sh

# Or create manually
echo -n "secret-value" | gcloud secrets create secret-name --data-file=-
```

### Issue: Database connection fails

**Solution:**
- Verify Cloud SQL annotation in cloudrun.yaml
- Check service account has cloudsql.client role
- Verify DATABASE_URL format for Cloud SQL
- Test with Cloud SQL Proxy locally

### Issue: Container fails health check

**Solution:**
```bash
# Check logs
gcloud run services logs read budget-tracker-api --region=us-central1

# Common causes:
# - DATABASE_URL incorrect
# - Missing required secrets
# - Port mismatch (must be 3000 or use $PORT)
```

### Issue: "Rate limit exceeded" in logs

**Solution:**
- Increase rate limit in configuration
- Scale up maxScale
- Review traffic patterns
- Consider CDN/caching

---

## 🔄 **Update & Rollback**

### **Deploy New Version**

```bash
# Update code
git pull origin main

# Deploy
cd server
./deploy.sh
```

### **Rollback to Previous Version**

```bash
# List revisions
gcloud run revisions list \
  --service=budget-tracker-api \
  --region=us-central1

# Rollback to specific revision
gcloud run services update-traffic budget-tracker-api \
  --to-revisions=REVISION_NAME=100 \
  --region=us-central1
```

---

## 📈 **Scaling Configuration**

### **Adjust Auto-Scaling**

**For higher traffic:**
```yaml
autoscaling.knative.dev/minScale: "1"    # Always 1 instance running
autoscaling.knative.dev/maxScale: "10"   # Up to 10 instances
```

**For cost optimization:**
```yaml
autoscaling.knative.dev/minScale: "0"    # Scale to zero
autoscaling.knative.dev/maxScale: "3"    # Limited scaling
```

### **Adjust Resources**

```yaml
resources:
  limits:
    cpu: "2000m"      # 2 vCPU
    memory: "1Gi"     # 1 GiB RAM
```

---

## 🔒 **Security Checklist**

### **Before Deployment**

- [x] All secrets in Secret Manager
- [x] Strong JWT_SECRET (32+ chars)
- [x] Strong CRON_SECRET (32+ chars)
- [x] CORS_ALLOWED_ORIGINS configured
- [x] Service account created with minimal permissions
- [x] Database user has minimal permissions
- [x] .env file not in Docker image
- [x] Production secrets never committed to git

### **After Deployment**

- [ ] Test health endpoint
- [ ] Verify authentication works
- [ ] Test rate limiting
- [ ] Verify CORS configuration
- [ ] Test scheduled jobs
- [ ] Monitor error logs
- [ ] Set up alerts
- [ ] Enable Cloud Armor (optional)

---

## 📚 **Additional Configuration**

### **Custom Domain**

```bash
# Map custom domain
gcloud run domain-mappings create \
  --service=budget-tracker-api \
  --domain=api.yourdomain.com \
  --region=us-central1

# Update DNS (shown after command)
```

### **Cloud Armor (WAF)**

```bash
# Create security policy
gcloud compute security-policies create budget-tracker-waf \
  --description="WAF for Budget Tracker API"

# Add rate limiting rule
gcloud compute security-policies rules create 1000 \
  --security-policy=budget-tracker-waf \
  --expression="true" \
  --action=rate-based-ban \
  --rate-limit-threshold-count=100 \
  --rate-limit-threshold-interval-sec=60

# Apply to Cloud Run (requires Load Balancer setup)
```

### **VPC Connector** (Optional)

```bash
# Create VPC connector for private resources
gcloud compute networks vpc-access connectors create budget-tracker-connector \
  --region=us-central1 \
  --network=default \
  --range=10.8.0.0/28

# Add to cloudrun.yaml:
# run.googleapis.com/vpc-access-connector: projects/PROJECT_ID/locations/REGION/connectors/budget-tracker-connector
```

---

## 🎯 **Post-Deployment Tasks**

### **1. Verify Endpoints**

```bash
SERVICE_URL="https://budget-tracker-api-xxx-uc.a.run.app"

# Health check
curl ${SERVICE_URL}/health

# API info
curl ${SERVICE_URL}/
```

### **2. Test Authentication**

```bash
# Test social login (with real token)
curl -X POST ${SERVICE_URL}/api/auth/social-login \
  -H "Content-Type: application/json" \
  -d '{"provider":"google","token":"REAL_TOKEN"}'
```

### **3. Configure Mobile App**

Update mobile app configuration with:
```typescript
const API_URL = 'https://budget-tracker-api-xxx-uc.a.run.app';
```

### **4. Set Up Monitoring**

- Enable Cloud Monitoring
- Create dashboard
- Set up error alerts
- Configure uptime checks

---

## 📊 **Deployment Checklist**

### **Pre-Deployment**

- [x] Dockerfile created
- [x] cloudrun.yaml configured
- [x] Secrets set up in Secret Manager
- [x] Service account created
- [x] Database migrations run
- [x] All environment variables configured
- [x] Local testing completed

### **Deployment**

- [ ] Run `./setup-secrets.sh`
- [ ] Update cloudrun.yaml with PROJECT_ID
- [ ] Run `./deploy.sh`
- [ ] Verify deployment successful
- [ ] Test health endpoint

### **Post-Deployment**

- [ ] Configure Cloud Scheduler
- [ ] Set up custom domain (optional)
- [ ] Configure monitoring/alerts
- [ ] Update mobile app with API URL
- [ ] Test all endpoints
- [ ] Monitor initial traffic
- [ ] Review logs for errors

---

## 📝 **Environment Variables Summary**

**Set in cloudrun.yaml from Secret Manager:**

| Secret Name | Environment Variable | Required |
|-------------|---------------------|----------|
| budget-tracker-database-url | DATABASE_URL | ✅ Yes |
| budget-tracker-jwt-secret | JWT_SECRET | ✅ Yes |
| budget-tracker-cron-secret | CRON_SECRET | ✅ Yes |
| budget-tracker-cors-allowed-origins | CORS_ALLOWED_ORIGINS | ✅ Yes |
| budget-tracker-google-* | GOOGLE_*_CLIENT_ID | One required |
| budget-tracker-apple-bundle-id | APPLE_BUNDLE_ID | Optional |
| budget-tracker-facebook-* | FACEBOOK_APP_* | Optional |
| budget-tracker-gcs-* | GCS_* | Optional |
| budget-tracker-veryfi-* | VERYFI_* | Optional |
| budget-tracker-firebase-admin-json | FIREBASE_ADMIN_JSON_BASE64 | Optional |

---

## 🚀 **Quick Deploy Commands**

```bash
# Complete deployment in 3 commands:

# 1. Set up secrets
./setup-secrets.sh

# 2. Deploy
./deploy.sh

# 3. Set up scheduler
SERVICE_URL=$(gcloud run services describe budget-tracker-api --region=us-central1 --format="value(status.url)")
gcloud scheduler jobs create http daily-digest \
  --schedule="0 9 * * *" \
  --uri="${SERVICE_URL}/jobs/daily-digest" \
  --http-method=POST \
  --headers="x-cron-secret=$CRON_SECRET" \
  --location=us-central1
```

---

**Last Updated**: 2024-10-09  
**Cloud Run Version**: gen2  
**Node Version**: 20 Alpine  
**Status**: ✅ Production Ready

