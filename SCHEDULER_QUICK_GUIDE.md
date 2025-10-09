# Cloud Scheduler - Quick Setup Guide

## 🎯 **Your Command Explained**

You have this command:
```bash
gcloud scheduler jobs create http daily-digest \
  --schedule="0 20 * * *" \
  --uri="https://<CLOUD_RUN_URL>/jobs/daily-digest" \
  --http-method=POST \
  --headers="x-cron-secret:<CRON_SECRET>"
```

**Replace these 2 values:**

| Placeholder | What to Replace | How to Get It |
|------------|-----------------|---------------|
| `<CLOUD_RUN_URL>` | Your Cloud Run service URL | See Step 1 below |
| `<CRON_SECRET>` | Secret for authentication | See Step 2 below |

---

## ⚡ **Quick Setup (5 Minutes)**

### **Step 1: Get Cloud Run URL**

```bash
# After deploying backend, run:
gcloud run services describe mobile-backend \
  --region us-central1 \
  --format="value(status.url)"

# Example output:
# https://mobile-backend-abc123-uc.a.run.app
```

**Copy this URL** (without the `https://`)

---

### **Step 2: Get CRON_SECRET**

**Option A: Generate New**
```bash
openssl rand -base64 32

# Example output:
# KjH8f2jkL9mNpQ3rS5tUvW7xY0zAbC1dEfG2hI4jK6l=
```

**Option B: Use Existing**
```bash
# From Secret Manager
gcloud secrets versions access latest --secret=CRON_SECRET

# Or from your .env.secrets file
grep CRON_SECRET server/.env.secrets
```

**Copy this secret**

---

### **Step 3: Enable Cloud Scheduler**

```bash
gcloud services enable cloudscheduler.googleapis.com
```

---

### **Step 4: Create Job with YOUR Values**

**Example with real values:**

```bash
gcloud scheduler jobs create http daily-digest \
  --location=us-central1 \
  --schedule="0 20 * * *" \
  --uri="https://mobile-backend-abc123-uc.a.run.app/api/jobs/daily-digest" \
  --http-method=POST \
  --headers="x-cron-secret=KjH8f2jkL9mNpQ3rS5tUvW7xY0zAbC1dEfG2hI4jK6l="
```

**⚠️ Important:**
- Add `--location=us-central1` (required parameter)
- Change `/jobs/daily-digest` to `/api/jobs/daily-digest` (correct endpoint)
- Use full URL with `https://`
- Don't include trailing slashes

---

### **Step 5: Test It**

```bash
# Trigger manually
gcloud scheduler jobs run daily-digest --location=us-central1

# Check logs
gcloud run services logs read mobile-backend --region=us-central1 --limit=20

# Look for: "Daily digest job completed"
```

---

## 🔧 **Complete Working Example**

**Fill in your values here:**

```bash
# 1. Get your URL
CLOUD_RUN_URL=$(gcloud run services describe mobile-backend \
  --region us-central1 \
  --format="value(status.url)")

# 2. Get your secret
CRON_SECRET=$(gcloud secrets versions access latest --secret=CRON_SECRET)
# OR generate new:
# CRON_SECRET=$(openssl rand -base64 32)

# 3. Show values (verify they're correct)
echo "URL: $CLOUD_RUN_URL"
echo "Secret: $CRON_SECRET"

# 4. Create scheduler job
gcloud scheduler jobs create http daily-digest \
  --location=us-central1 \
  --schedule="0 20 * * *" \
  --uri="$CLOUD_RUN_URL/api/jobs/daily-digest" \
  --http-method=POST \
  --headers="x-cron-secret=$CRON_SECRET"

# 5. Test it
gcloud scheduler jobs run daily-digest --location=us-central1
```

---

## 📅 **Schedule Options**

The `--schedule="0 20 * * *"` means **8:00 PM daily**.

**Other schedules:**

| Time | Cron Format | Command |
|------|-------------|---------|
| 9:00 AM daily | `0 9 * * *` | Morning reminder |
| 6:00 PM daily | `0 18 * * *` | Evening reminder |
| 12:00 PM (noon) | `0 12 * * *` | Lunch time |
| Every hour | `0 * * * *` | Testing |
| Twice daily | Create 2 jobs | 9 AM and 6 PM |

**Change schedule:**
```bash
# Update existing job
gcloud scheduler jobs update http daily-digest \
  --location=us-central1 \
  --schedule="0 9 * * *"
```

---

## 🐛 **Troubleshooting**

### **Error: "Invalid URI"**

```bash
# ❌ Wrong:
--uri="mobile-backend-abc.run.app/jobs/daily-digest"

# ✅ Correct:
--uri="https://mobile-backend-abc.run.app/api/jobs/daily-digest"
```

### **Error: "Location required"**

```bash
# ❌ Wrong:
--region=us-central1

# ✅ Correct:
--location=us-central1
```

### **Error: "Job already exists"**

```bash
# Delete existing job first
gcloud scheduler jobs delete daily-digest --location=us-central1

# Then create new one
gcloud scheduler jobs create http daily-digest ...
```

### **Job runs but nothing happens**

```bash
# Check if secret matches
gcloud secrets versions access latest --secret=CRON_SECRET

# Check backend logs
gcloud run services logs read mobile-backend --region=us-central1 --limit=50

# Test endpoint manually with curl
curl -X POST \
  -H "x-cron-secret:YOUR_SECRET" \
  https://your-url.run.app/api/jobs/daily-digest
```

---

## 📊 **Manage Jobs**

### **List all jobs**
```bash
gcloud scheduler jobs list --location=us-central1
```

### **View job details**
```bash
gcloud scheduler jobs describe daily-digest --location=us-central1
```

### **Pause job**
```bash
gcloud scheduler jobs pause daily-digest --location=us-central1
```

### **Resume job**
```bash
gcloud scheduler jobs resume daily-digest --location=us-central1
```

### **Delete job**
```bash
gcloud scheduler jobs delete daily-digest --location=us-central1
```

### **Update schedule**
```bash
gcloud scheduler jobs update http daily-digest \
  --location=us-central1 \
  --schedule="0 9 * * *"
```

---

## 🚀 **Easy Setup Script**

**Use the automated script:**

```bash
# 1. Edit the script
nano server/setup-scheduler.sh

# 2. Replace:
CLOUD_RUN_URL="https://your-service.run.app"
CRON_SECRET="your-secret"

# 3. Run it
./server/setup-scheduler.sh
```

---

## ✅ **Verification Checklist**

After creating the job:

- [ ] Job appears in: `gcloud scheduler jobs list --location=us-central1`
- [ ] Manual test succeeds: `gcloud scheduler jobs run daily-digest --location=us-central1`
- [ ] Backend logs show: "Daily digest job completed"
- [ ] Push notifications sent to users with pending receipts
- [ ] Can view job in Console: https://console.cloud.google.com/cloudscheduler

---

## 💰 **Cost**

Cloud Scheduler pricing:
- First 3 jobs per month: **FREE**
- Additional jobs: **$0.10/job/month**

**For 1 daily digest job: $0/month** 🎉

---

## 📚 **Full Documentation**

- **Detailed guide**: `server/CLOUD_SCHEDULER_SETUP.md`
- **GCP Scheduler docs**: https://cloud.google.com/scheduler/docs
- **Cron format**: https://crontab.guru

---

**That's it! Your daily digest will run automatically every day at 8 PM.** 🎊
