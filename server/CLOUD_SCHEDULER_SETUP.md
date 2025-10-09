# Cloud Scheduler Setup - Daily Digest Job

## 📅 **Automated Daily Digest Notifications**

This guide shows you how to set up Google Cloud Scheduler to automatically trigger daily digest notifications for:
- Pending receipts to review
- Upcoming bills (due within 3 days)

**Schedule**: Every day at 8:00 PM (customizable)

---

## 🎯 **What You Need**

Before running the command, you need:

1. ✅ **Cloud Run URL** - Your deployed backend URL
2. ✅ **CRON_SECRET** - Secret for authenticating cron requests
3. ✅ **Project ID** - Your GCP project ID
4. ✅ **Region** - Your Cloud Scheduler region

---

## 📝 **Step-by-Step Setup**

### **Step 1: Get Your Cloud Run URL**

```bash
# Get your service URL
gcloud run services describe mobile-backend \
  --region us-central1 \
  --format="value(status.url)"

# Example output:
# https://mobile-backend-abc123-uc.a.run.app
```

**Copy this URL** - you'll need it for the scheduler.

---

### **Step 2: Get Your CRON_SECRET**

**Option A: Generate New Secret**

```bash
# Generate random secret (32 characters)
openssl rand -base64 32

# Example output:
# KjH8f2jkL9mNpQ3rS5tUvW7xY0zAbC1dEfG2hI4jK6l=
```

**Option B: Get from Secret Manager**

```bash
# If you already uploaded it
gcloud secrets versions access latest --secret=CRON_SECRET

# Or check your .env.secrets file
grep CRON_SECRET server/.env.secrets
```

**Save this secret** - you'll use it in the command.

---

### **Step 3: Enable Cloud Scheduler API**

```bash
gcloud services enable cloudscheduler.googleapis.com

# Wait for confirmation (takes ~30 seconds)
```

---

### **Step 4: Create Scheduler Job**

**Replace these values:**
- `<CLOUD_RUN_URL>` → Your Cloud Run URL (from Step 1)
- `<CRON_SECRET>` → Your cron secret (from Step 2)
- `<REGION>` → Your region (e.g., `us-central1`)

**Command:**

```bash
gcloud scheduler jobs create http daily-digest \
  --location=us-central1 \
  --schedule="0 20 * * *" \
  --uri="https://mobile-backend-abc123-uc.a.run.app/api/jobs/daily-digest" \
  --http-method=POST \
  --headers="x-cron-secret=KjH8f2jkL9mNpQ3rS5tUvW7xY0zAbC1dEfG2hI4jK6l="
```

**⚠️ Important Notes:**
- Use `--location` not `--region` for Cloud Scheduler
- The URI should be the full endpoint: `<CLOUD_RUN_URL>/api/jobs/daily-digest`
- Schedule is in cron format (see below for examples)

---

### **Step 5: Verify Job Created**

```bash
# List all scheduler jobs
gcloud scheduler jobs list --location=us-central1

# You should see:
# ID: daily-digest
# LOCATION: us-central1
# SCHEDULE: 0 20 * * *
# TARGET: HTTP
```

---

### **Step 6: Test the Job**

**Manual Test:**

```bash
# Trigger the job immediately (don't wait for scheduled time)
gcloud scheduler jobs run daily-digest --location=us-central1

# Check if it succeeded
gcloud scheduler jobs describe daily-digest --location=us-central1
```

**Check Logs:**

```bash
# View Cloud Run logs to see if digest ran
gcloud run services logs read mobile-backend --region=us-central1 --limit=20

# Look for: "Daily digest job completed"
```

---

## 🕐 **Cron Schedule Examples**

The `--schedule` parameter uses cron format: `minute hour day month weekday`

| Schedule | Cron Format | Description |
|----------|-------------|-------------|
| Every day at 8 PM | `0 20 * * *` | Default |
| Every day at 9 AM | `0 9 * * *` | Morning digest |
| Every day at 6 PM | `0 18 * * *` | Evening digest |
| Twice daily (9 AM, 6 PM) | Create 2 jobs | Use different names |
| Every Monday at 9 AM | `0 9 * * 1` | Weekly |
| Every hour | `0 * * * *` | Testing |
| Every 30 minutes | `*/30 * * * *` | Frequent |

**💡 Tip**: Use https://crontab.guru to build custom schedules

---

## 🔧 **Complete Setup Script**

**Create this file: `server/setup-scheduler.sh`**

```bash
#!/bin/bash
#
# Setup Cloud Scheduler for Daily Digest
#

set -e

# ============================================
# CONFIGURATION - EDIT THESE VALUES
# ============================================

# Your Cloud Run service URL (get from: gcloud run services describe mobile-backend)
CLOUD_RUN_URL="<YOUR_CLOUD_RUN_URL>"

# Your cron secret (generate with: openssl rand -base64 32)
CRON_SECRET="<YOUR_CRON_SECRET>"

# Your region (should match Cloud Run region)
LOCATION="us-central1"

# Schedule (default: 8 PM daily)
SCHEDULE="0 20 * * *"

# ============================================
# VALIDATION
# ============================================

if [ "$CLOUD_RUN_URL" = "<YOUR_CLOUD_RUN_URL>" ]; then
    echo "❌ ERROR: Please edit this file and set CLOUD_RUN_URL"
    echo ""
    echo "Get it with:"
    echo "  gcloud run services describe mobile-backend --region us-central1 --format=\"value(status.url)\""
    echo ""
    exit 1
fi

if [ "$CRON_SECRET" = "<YOUR_CRON_SECRET>" ]; then
    echo "❌ ERROR: Please edit this file and set CRON_SECRET"
    echo ""
    echo "Generate one with:"
    echo "  openssl rand -base64 32"
    echo ""
    exit 1
fi

# ============================================
# SETUP
# ============================================

echo "🔧 Setting up Cloud Scheduler for Daily Digest"
echo "============================================="
echo "URL: $CLOUD_RUN_URL/api/jobs/daily-digest"
echo "Schedule: $SCHEDULE ($(date -d '20:00' '+%I:%M %p' 2>/dev/null || echo '8:00 PM'))"
echo "Location: $LOCATION"
echo ""

# Enable API
echo "📝 Enabling Cloud Scheduler API..."
gcloud services enable cloudscheduler.googleapis.com
echo ""

# Create job
echo "📅 Creating scheduler job..."
gcloud scheduler jobs create http daily-digest \
  --location=$LOCATION \
  --schedule="$SCHEDULE" \
  --uri="$CLOUD_RUN_URL/api/jobs/daily-digest" \
  --http-method=POST \
  --headers="x-cron-secret=$CRON_SECRET" \
  --time-zone="America/New_York"

echo ""
echo "✅ Scheduler job created!"
echo ""

# List jobs
echo "📋 Current scheduler jobs:"
gcloud scheduler jobs list --location=$LOCATION
echo ""

# Test job
echo "🧪 Testing job (manual trigger)..."
gcloud scheduler jobs run daily-digest --location=$LOCATION

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "  1. Check logs: gcloud run services logs read mobile-backend --region us-central1 --limit=20"
echo "  2. View job: https://console.cloud.google.com/cloudscheduler?project=\$(gcloud config get-value project)"
echo "  3. Wait for scheduled run at $(echo $SCHEDULE | awk '{print $2}'):00"
echo ""

