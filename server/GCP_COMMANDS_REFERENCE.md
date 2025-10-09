# GCP Deployment Commands - Quick Reference

## 📋 **Replace These Values**

Before running any commands, replace:

| Placeholder | Replace With | How to Get |
|------------|--------------|------------|
| `<PROJECT>` | Your GCP Project ID | https://console.cloud.google.com (top dropdown) |
| `<REGION>` | Your region | Choose: `us-central1`, `us-east1`, `us-west1`, etc. |

**Example:**
- `<PROJECT>` → `budget-tracker-12345`
- `<REGION>` → `us-central1`

---

## ⚡ **Quick Deploy (Copy-Paste)**

### **1. Set Variables (Edit First!)**

```bash
# EDIT THESE:
export GCP_PROJECT_ID="<PROJECT>"      # e.g., budget-tracker-12345
export REGION="<REGION>"               # e.g., us-central1

# Verify
echo "Project: $GCP_PROJECT_ID"
echo "Region: $REGION"
```

---

### **2. Authenticate**

```bash
gcloud auth login
gcloud config set project $GCP_PROJECT_ID
gcloud config set run/region $REGION
```

---

### **3. Enable APIs**

```bash
gcloud services enable \
  cloudbuild.googleapis.com \
  run.googleapis.com \
  secretmanager.googleapis.com
```

---

### **4. Build Image**

```bash
cd server

# Option A: Using npm script
npm run gcp:build

# Option B: Direct command
gcloud builds submit --tag gcr.io/$GCP_PROJECT_ID/mobile-backend:latest
```

---

### **5. Deploy to Cloud Run**

```bash
# Option A: Using npm script (RECOMMENDED)
npm run gcp:deploy

# Option B: Direct command
gcloud run deploy mobile-backend \
  --image gcr.io/$GCP_PROJECT_ID/mobile-backend:latest \
  --region $REGION \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1
```

---

### **6. Get Service URL**

```bash
gcloud run services describe mobile-backend \
  --region $REGION \
  --format="value(status.url)"

# Copy this URL for your mobile app!
```

---

## 🔄 **Update Deployment (After Code Changes)**

```bash
cd server

# 1. Build new image
npm run gcp:build

# 2. Deploy
npm run gcp:deploy

# That's it! Takes ~3 minutes
```

---

## 📝 **NPM Scripts (Easiest Way)**

The npm scripts automatically use environment variables:

```bash
cd server

# 1. Set project ID once
export GCP_PROJECT_ID="budget-tracker-12345"

# 2. Use scripts
npm run gcp:build          # Build and push Docker image
npm run gcp:deploy         # Deploy to Cloud Run
npm run gcp:secrets:bootstrap  # Upload secrets
```

---

## 🎯 **Complete First-Time Setup**

```bash
# 1. Login and configure
gcloud auth login
export GCP_PROJECT_ID="budget-tracker-12345"  # EDIT THIS
export REGION="us-central1"                   # EDIT THIS
gcloud config set project $GCP_PROJECT_ID
gcloud config set run/region $REGION

# 2. Enable APIs
gcloud services enable cloudbuild.googleapis.com run.googleapis.com secretmanager.googleapis.com

# 3. Prepare secrets
cd server
cp .env.secrets.example .env.secrets
nano .env.secrets  # Fill in production values

# 4. Upload secrets
npm run gcp:secrets:bootstrap

# 5. Build and deploy
npm run gcp:build
npm run gcp:deploy

# 6. Get URL
gcloud run services describe mobile-backend \
  --region $REGION \
  --format="value(status.url)"

# 7. Test
curl https://YOUR-SERVICE-URL/health
```

---

## 🔍 **Useful Commands**

### **View Logs**

```bash
# Real-time logs
gcloud run services logs tail mobile-backend --region $REGION

# Recent logs
gcloud run services logs read mobile-backend --limit=50
```

### **Service Info**

```bash
# Get service details
gcloud run services describe mobile-backend --region $REGION

# List all services
gcloud run services list
```

### **Manage Secrets**

```bash
# List secrets
gcloud secrets list

# View secret value
gcloud secrets versions access latest --secret=DATABASE_URL

# Create new secret
echo -n "secret-value" | gcloud secrets create SECRET_NAME --data-file=-

# Update secret
echo -n "new-value" | gcloud secrets versions add SECRET_NAME --data-file=-
```

### **Delete Service**

```bash
# Delete Cloud Run service
gcloud run services delete mobile-backend --region $REGION

# Delete Docker image
gcloud container images delete gcr.io/$GCP_PROJECT_ID/mobile-backend:latest
```

---

## 💰 **Cost Monitoring**

```bash
# View current month usage
gcloud billing accounts list
gcloud billing projects describe $GCP_PROJECT_ID

# Set budget alert (in Console)
# Go to: https://console.cloud.google.com/billing/budgets
```

---

## 🐛 **Troubleshooting Commands**

### **Build Fails**

```bash
# Test Docker locally first
cd server
docker build -t test .

# If successful, then:
gcloud builds submit --tag gcr.io/$GCP_PROJECT_ID/mobile-backend:latest
```

### **Deploy Fails**

```bash
# Check service status
gcloud run services describe mobile-backend --region $REGION

# Check logs for errors
gcloud run services logs read mobile-backend --limit=100

# Common fixes:
# - Missing secrets: npm run gcp:secrets:bootstrap
# - Wrong region: gcloud config set run/region $REGION
# - Permission issues: See IAM roles in Console
```

### **Can't Connect to Database**

```bash
# Test connection locally
export DATABASE_URL="your-production-db-url"
npx prisma db pull

# If fails, check:
# - Database URL format
# - IP allowlist (Neon/Supabase)
# - SSL mode (?sslmode=require)
```

---

## 📚 **Common Scenarios**

### **Update Environment Variable**

```bash
# 1. Update secret
echo -n "new-value" | gcloud secrets versions add SECRET_NAME --data-file=-

# 2. Redeploy (no rebuild needed)
gcloud run services update mobile-backend --region $REGION
```

### **Rollback Deployment**

```bash
# List revisions
gcloud run revisions list --service=mobile-backend --region=$REGION

# Rollback to previous
gcloud run services update-traffic mobile-backend \
  --to-revisions=REVISION_NAME=100 \
  --region=$REGION
```

### **Scale Up/Down**

```bash
# Increase max instances
gcloud run services update mobile-backend \
  --max-instances=10 \
  --region=$REGION

# Set minimum instances (faster cold starts, costs more)
gcloud run services update mobile-backend \
  --min-instances=1 \
  --region=$REGION
```

---

## ✅ **Quick Checklist**

Before deploying:

- [ ] `gcloud` CLI installed
- [ ] Authenticated: `gcloud auth login`
- [ ] Project set: `gcloud config set project <PROJECT>`
- [ ] APIs enabled
- [ ] `.env.secrets` filled with production values
- [ ] Secrets uploaded: `npm run gcp:secrets:bootstrap`
- [ ] Database created and accessible
- [ ] OAuth credentials configured

To deploy:

- [ ] `cd server`
- [ ] `npm run gcp:build`
- [ ] `npm run gcp:deploy`
- [ ] Copy service URL
- [ ] Test: `curl <URL>/health`

Post-deployment:

- [ ] Update mobile app with service URL
- [ ] Run database migration
- [ ] Test all features
- [ ] Setup monitoring/alerts

---

## 🎯 **Your Specific Commands**

**Fill in your values:**

```bash
# Replace these with YOUR values:
PROJECT_ID="budget-tracker-12345"     # <-- EDIT THIS
REGION="us-central1"                  # <-- EDIT THIS

# Then run:
gcloud builds submit --tag gcr.io/$PROJECT_ID/mobile-backend:latest

gcloud run deploy mobile-backend \
  --image gcr.io/$PROJECT_ID/mobile-backend:latest \
  --region $REGION \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1
```

---

## 📞 **Get Help**

**View Documentation:**
```bash
gcloud run deploy --help
gcloud builds submit --help
```

**Check Status:**
- Console: https://console.cloud.google.com/run
- Logs: https://console.cloud.google.com/logs

**Common Links:**
- Cloud Run: https://cloud.google.com/run/docs
- Pricing: https://cloud.google.com/run/pricing
- Troubleshooting: https://cloud.google.com/run/docs/troubleshooting

---

**Need the full guide? See `GCP_QUICK_DEPLOY.md`** 📚

