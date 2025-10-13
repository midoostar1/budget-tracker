# Setup Auto-Deploy - Quick Guide

## 🚀 **Automatic Deployment is 90% Complete!**

I've already set up the GitHub Actions workflows and GCP service account.

**Just 2 more steps to enable auto-deploy:**

---

## ✅ **What's Already Done**

1. ✅ Created `.github/workflows/deploy-backend.yml`
2. ✅ Created `.github/workflows/build-mobile.yml`
3. ✅ Created GCP service account: `github-actions@budget-tracker-474603.iam.gserviceaccount.com`
4. ✅ Granted all permissions (Cloud Run Admin, Storage Admin, etc.)
5. ✅ Created service account key: `github-actions-key.json`

---

## 📝 **Step 1: Add GCP_SA_KEY to GitHub** (2 minutes)

### **Get the Key:**

```bash
# The key is already created in your project root
cd "/Users/midoostar1/Desktop/Budget tracker"
cat github-actions-key.json

# Copy the ENTIRE JSON output
```

### **Add to GitHub:**

1. **Go to your repository secrets:**
   - https://github.com/midoostar1/budget-tracker/settings/secrets/actions

2. **Click "New repository secret"**

3. **Add the secret:**
   - Name: `GCP_SA_KEY`
   - Secret: Paste the ENTIRE JSON from `github-actions-key.json`
   - Click "Add secret"

✅ **Done!** GitHub can now deploy to Cloud Run.

---

## 📝 **Step 2: Add EXPO_TOKEN to GitHub** (3 minutes)

### **Get Expo Token:**

1. **Go to Expo:**
   - https://expo.dev/accounts/[your-account]/settings/access-tokens

2. **Create token:**
   - Click "Create Token"
   - Name: "GitHub Actions"
   - Permissions: Read & Write
   - Click "Create"
   - **Copy the token** (shows only once!)

### **Add to GitHub:**

1. **Go to repository secrets:**
   - https://github.com/midoostar1/budget-tracker/settings/secrets/actions

2. **Click "New repository secret"**

3. **Add the secret:**
   - Name: `EXPO_TOKEN`
   - Secret: Paste the Expo token
   - Click "Add secret"

✅ **Done!** GitHub can now build mobile apps.

---

## 🎯 **That's It! Auto-Deploy is Ready!**

### **How It Works:**

**When you push backend code:**
```bash
cd server
nano src/index.ts  # Make changes
git add .
git commit -m "Update API"
git push origin main

# GitHub Actions automatically:
# → Builds Docker image
# → Deploys to Cloud Run  
# → Tests health endpoint
# → Updates production in 3-5 minutes! ✅
```

**When you push mobile code:**
```bash
cd app
nano src/screens/dashboard.tsx  # Make changes
git add .
git commit -m "Update UI"
git push origin main

# GitHub Actions automatically:
# → Builds APK with EAS
# → Includes all native modules
# → Ready to download in 10-15 minutes! ✅
```

---

## 🧪 **Test Auto-Deploy**

### **Test Backend Deployment:**

```bash
# Make a small change
cd server
echo "// Auto-deploy test $(date)" >> src/index.ts

# Commit and push
git add .
git commit -m "test: auto-deploy backend"
git push origin main

# Watch deployment:
# https://github.com/midoostar1/budget-tracker/actions

# Should see:
# ✅ Workflow runs
# ✅ Docker builds
# ✅ Deploys to Cloud Run
# ✅ Health check passes
# ✅ Comment on commit with URL
```

### **Test Mobile Build:**

```bash
# Make a small change
cd app
echo "// Auto-build test $(date)" >> src/App.tsx

# Commit and push
git add .
git commit -m "test: auto-build mobile"
git push origin main

# Watch build:
# https://github.com/midoostar1/budget-tracker/actions

# When complete, download APK from:
# https://expo.dev
```

---

## 📊 **Verify Secrets Are Added**

Check that both secrets exist:

https://github.com/midoostar1/budget-tracker/settings/secrets/actions

You should see:
- ✅ `GCP_SA_KEY` (added)
- ✅ `EXPO_TOKEN` (added)

---

## 🎊 **Summary**

### **After adding the 2 secrets:**

✅ **Push backend code** → Auto-deploys to Cloud Run  
✅ **Push mobile code** → Auto-builds APK  
✅ **No manual commands needed**  
✅ **Production always up-to-date**  
✅ **Full CI/CD pipeline**  

---

## 📚 **Quick Reference**

### **Add Secrets:**
1. `GCP_SA_KEY` → Copy from `github-actions-key.json`
2. `EXPO_TOKEN` → Get from https://expo.dev/settings/access-tokens

### **Then:**
- Just push code to GitHub
- GitHub Actions handles the rest
- Production updates automatically

---

## 🚀 **Next Steps**

1. ✅ Add `GCP_SA_KEY` to GitHub secrets
2. ✅ Add `EXPO_TOKEN` to GitHub secrets  
3. ✅ Push a test commit
4. ✅ Watch GitHub Actions deploy
5. ✅ **Auto-deploy is LIVE!**

---

**See `GITHUB_ACTIONS_SETUP.md` for detailed documentation!**

Your auto-deploy is ready - just add the 2 secrets! 🎉


