# 🚀 GitHub Auto-Deploy Setup Guide

## ✅ Current Status

Your GitHub Actions workflows are configured and **almost ready**! Here's what you have:

### ✅ Workflows Configured
- **Backend Auto-Deploy**: `.github/workflows/deploy-backend.yml`
  - Triggers: Push to `main` branch when `server/**` files change
  - Deploys to: Cloud Run (`budget-api`)
  - Fixed: ✅ Image name, Cloud SQL connection, port settings

- **Mobile Build**: `.github/workflows/build-mobile.yml`
  - Triggers: Push to `main` branch when `app/**` files change
  - Builds: Android APK via EAS (Expo Application Services)

### ⚠️ Setup Required

You need to add **2 secrets** to your GitHub repository:

---

## 🔐 Step 1: Add GCP Service Account Key

### 1. Read the Service Account Key
```bash
cat /Users/midoostar1/Desktop/Budget\ tracker/github-actions-key.json
```

### 2. Copy the entire JSON content (it should look like this):
```json
{
  "type": "service_account",
  "project_id": "budget-tracker-474603",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "...",
  "client_id": "...",
  ...
}
```

### 3. Add to GitHub Secrets
1. Go to your GitHub repository: https://github.com/midoostar1/budget-tracker
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Name: `GCP_SA_KEY`
5. Value: Paste the entire JSON content
6. Click **Add secret**

---

## 🎯 Step 2: Add Expo Token (Optional - for Mobile Builds)

This is only needed if you want to auto-build mobile apps via EAS.

### 1. Get Expo Token
```bash
npx expo login
npx expo whoami
eas build:configure
```

Then get your token:
```bash
npx eas whoami
# Login at: https://expo.dev
```

### 2. Create an Expo Access Token
1. Go to: https://expo.dev/accounts/[your-username]/settings/access-tokens
2. Click **Create Token**
3. Name it: `GitHub Actions`
4. Copy the token

### 3. Add to GitHub Secrets
1. Go to: https://github.com/midoostar1/budget-tracker/settings/secrets/actions
2. Click **New repository secret**
3. Name: `EXPO_TOKEN`
4. Value: Paste the token
5. Click **Add secret**

---

## ✅ Step 3: Test Auto-Deploy

Once the secrets are added, test the auto-deploy:

### Backend Auto-Deploy Test
```bash
# Make a small change to the backend
cd /Users/midoostar1/Desktop/Budget\ tracker

# Edit a file in server/
echo "// Auto-deploy test" >> server/src/index.ts

# Commit and push
git add .
git commit -m "test: Backend auto-deploy"
git push origin main
```

**What happens:**
1. GitHub Actions detects changes in `server/**`
2. Builds Docker image
3. Pushes to Google Container Registry
4. Deploys to Cloud Run (`budget-api`)
5. Runs health check
6. Posts deployment comment on commit

**Monitor progress:**
- GitHub Actions: https://github.com/midoostar1/budget-tracker/actions

**Expected time:** 3-5 minutes

### Mobile Build Test (Optional)
```bash
# Make a small change to the mobile app
echo "// Auto-build test" >> app/app/index.tsx

# Commit and push
git add .
git commit -m "test: Mobile auto-build"
git push origin main
```

**What happens:**
1. GitHub Actions detects changes in `app/**`
2. Triggers EAS build for Android
3. Build happens on Expo's servers
4. APK available in Expo dashboard

**Monitor progress:**
- GitHub Actions: https://github.com/midoostar1/budget-tracker/actions
- EAS Dashboard: https://expo.dev/accounts/[your-account]/projects/budget-tracker/builds

---

## 📋 How Auto-Deploy Works

### Backend Workflow Triggers
The workflow runs when:
- ✅ You push to `main` branch
- ✅ Files in `server/**` directory change
- ✅ The workflow file itself changes
- ✅ You manually trigger it from GitHub Actions UI

### What Gets Deployed
1. **Build Phase**
   - Checks out your code
   - Builds Docker image with tag: commit SHA
   - Pushes image to Google Container Registry

2. **Deploy Phase**
   - Deploys to Cloud Run service: `budget-api`
   - Uses secrets from Secret Manager
   - Connects to Cloud SQL database
   - Configures auto-scaling (0-5 instances)

3. **Verification Phase**
   - Waits 10 seconds for service to start
   - Runs health check: `curl /health`
   - Posts deployment status as commit comment

### Mobile Workflow Triggers
The workflow runs when:
- ✅ You push to `main` branch
- ✅ Files in `app/**` directory change
- ✅ The workflow file itself changes

**Note:** Mobile builds take 10-20 minutes on EAS servers.

---

## 🔧 Workflow Configuration

### Backend Deploy (`deploy-backend.yml`)
```yaml
Triggers: Push to main, changes in server/**
Service: budget-api
Image: gcr.io/budget-tracker-474603/budget-api
Region: us-central1
Resources:
  - Memory: 512Mi
  - CPU: 1
  - Min instances: 0
  - Max instances: 5
  - Timeout: 300s
Database: Cloud SQL (budget-pg-prod)
Port: 3000
```

### Mobile Build (`build-mobile.yml`)
```yaml
Triggers: Push to main, changes in app/**
Platform: Android
Build type: Development APK
Service: Expo Application Services (EAS)
```

---

## 🚨 Troubleshooting

### If Backend Deploy Fails

1. **Check GitHub Actions logs**
   ```
   https://github.com/midoostar1/budget-tracker/actions
   ```

2. **Common issues:**
   - Missing `GCP_SA_KEY` secret → Add it in Step 1
   - Docker build fails → Check `server/Dockerfile`
   - Cloud Run deploy fails → Check Cloud Run logs
   - Health check fails → Check service logs

3. **View Cloud Run logs:**
   ```bash
   gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=budget-api" --limit 50 --project budget-tracker-474603
   ```

### If Mobile Build Fails

1. **Check GitHub Actions logs**

2. **Common issues:**
   - Missing `EXPO_TOKEN` secret → Add it in Step 2
   - EAS not configured → Run `eas build:configure` locally first
   - Build takes too long → Normal, can take 15-20 minutes

3. **Manual build locally:**
   ```bash
   cd app
   eas build --platform android --profile development
   ```

---

## 📊 Monitoring Your Deployments

### GitHub Actions Dashboard
- **URL**: https://github.com/midoostar1/budget-tracker/actions
- **Shows**: All workflow runs, logs, and status

### Cloud Run Console
- **URL**: https://console.cloud.google.com/run?project=budget-tracker-474603
- **Shows**: Service status, metrics, logs, revisions

### Deployment Notifications
- ✅ Commit comments on successful deploys
- ✅ Email notifications on failures (configure in GitHub)
- ✅ Health check status in workflow logs

---

## 🎯 Best Practices

### 1. Branch Protection (Recommended)
Protect your `main` branch:
1. Go to: https://github.com/midoostar1/budget-tracker/settings/branches
2. Add rule for `main` branch
3. Enable:
   - ✅ Require status checks to pass
   - ✅ Require branches to be up to date

### 2. Development Workflow
```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes and test locally
# ...

# Push to GitHub
git push origin feature/new-feature

# Create Pull Request
# Merge to main after review

# Auto-deploy triggers when merged to main!
```

### 3. Rollback Strategy
If a deployment breaks:

```bash
# Option 1: Revert the commit
git revert HEAD
git push origin main
# Auto-deploys the previous version

# Option 2: Rollback in Cloud Run Console
# Go to Cloud Run → Revisions → Select previous → "Rollback"
```

### 4. Environment Variables
- ✅ All secrets in Google Secret Manager (not in code)
- ✅ Workflow uses `--set-secrets` to inject at runtime
- ✅ Never commit secrets to git

---

## ✅ Setup Checklist

Before pushing to trigger auto-deploy:

- [ ] Added `GCP_SA_KEY` secret to GitHub
- [ ] (Optional) Added `EXPO_TOKEN` secret for mobile builds
- [ ] Tested locally that backend builds with Docker
- [ ] Verified Cloud Run service is working manually
- [ ] Read through this guide
- [ ] Ready to test auto-deploy!

---

## 🎊 Quick Reference

### Add GitHub Secret
1. https://github.com/midoostar1/budget-tracker/settings/secrets/actions
2. Click "New repository secret"
3. Name: `GCP_SA_KEY` or `EXPO_TOKEN`
4. Paste value
5. Click "Add secret"

### View Service Account Key
```bash
cat /Users/midoostar1/Desktop/Budget\ tracker/github-actions-key.json
```

### Trigger Manual Deploy
1. Go to: https://github.com/midoostar1/budget-tracker/actions
2. Select "Deploy Backend to Cloud Run"
3. Click "Run workflow"
4. Select `main` branch
5. Click "Run workflow"

### Check Deployment Status
```bash
# Backend service URL
curl https://budget-api-813467044595.us-central1.run.app/health/detailed

# View logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=budget-api" --limit 20 --project budget-tracker-474603
```

---

## 🚀 You're Almost There!

Just add the `GCP_SA_KEY` secret and you'll have:
- ✅ **Auto-deploy on git push**
- ✅ **Automatic Docker builds**
- ✅ **Health checks after deploy**
- ✅ **Deployment notifications**
- ✅ **Zero-downtime deployments**

**Next step:** Add the secrets, then push to `main` to test!

Good luck! 🎉

