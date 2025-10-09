# Cloud Scheduler Configuration

## Overview

Configure Google Cloud Scheduler to automatically trigger the daily digest job that sends push notifications for pending receipts and upcoming bills.

---

## 📅 **Daily Digest Job Configuration**

### **Schedule**
- **Cron Expression**: `0 20 * * *`
- **Time**: 8:00 PM every day
- **Timezone**: UTC (adjust as needed)

### **Target**
- **Endpoint**: `POST https://<cloud-run-url>/jobs/daily-digest`
- **Method**: POST
- **Authentication**: `x-cron-secret` header

### **What It Does**
1. Finds users with pending receipt transactions
2. Sends push notification: "You have N receipt(s) to review!"
3. Finds bills due within 3 days
4. Sends push notification: "Your [bill] is due [when]"

---

## 🚀 **Setup Instructions**

### **Method 1: Using gcloud CLI (Recommended)**

```bash
# Set variables
export GCP_PROJECT_ID="your-project-id"
export GCP_REGION="us-central1"
export CRON_SECRET="your-cron-secret-from-secret-manager"

# Get Cloud Run service URL
export SERVICE_URL=$(gcloud run services describe mobile-backend \
  --region=${GCP_REGION} \
  --format="value(status.url)")

# Create daily digest job
gcloud scheduler jobs create http daily-digest \
  --location=${GCP_REGION} \
  --schedule="0 20 * * *" \
  --uri="${SERVICE_URL}/jobs/daily-digest" \
  --http-method=POST \
  --headers="x-cron-secret=${CRON_SECRET}" \
  --time-zone="America/New_York" \
  --description="Daily digest: Send notifications for pending receipts and upcoming bills" \
  --attempt-deadline=300s \
  --max-retry-attempts=3 \
  --min-backoff-duration=5s \
  --max-backoff-duration=3600s

# Verify job was created
gcloud scheduler jobs describe daily-digest --location=${GCP_REGION}
```

**Expected Output:**
```
Created job [daily-digest].
```

---

### **Method 2: Using Cloud Console**

1. **Navigate to Cloud Scheduler**
   - Go to [Cloud Console](https://console.cloud.google.com)
   - Navigate to Cloud Scheduler
   - Click "CREATE JOB"

2. **Configure Job**
   - **Name**: `daily-digest`
   - **Region**: `us-central1` (same as Cloud Run)
   - **Description**: Daily digest notifications
   - **Frequency**: `0 20 * * *`
   - **Timezone**: `America/New_York` (or your timezone)

3. **Configure Execution**
   - **Target type**: HTTP
   - **URL**: `https://YOUR-SERVICE-URL/jobs/daily-digest`
   - **HTTP method**: POST
   - **Auth header**: None (using x-cron-secret instead)

4. **Add Headers**
   - Click "ADD HEADER"
   - **Name**: `x-cron-secret`
   - **Value**: Your cron secret (from Secret Manager)

5. **Configure Retry**
   - **Max retry attempts**: 3
   - **Max retry duration**: 0 (unlimited)
   - **Min backoff duration**: 5s
   - **Max backoff duration**: 3600s
   - **Max doublings**: 5

6. **Save**
   - Click "CREATE"

---

## 🔧 **Additional Scheduled Jobs**

### **OCR Batch Processing (Every 5 Minutes)**

```bash
gcloud scheduler jobs create http ocr-batch-processing \
  --location=${GCP_REGION} \
  --schedule="*/5 * * * *" \
  --uri="${SERVICE_URL}/api/receipts/process/batch?limit=10" \
  --http-method=POST \
  --headers="x-cron-secret=${CRON_SECRET}" \
  --time-zone="UTC" \
  --description="Process pending receipts with OCR (batch of 10)" \
  --attempt-deadline=180s \
  --max-retry-attempts=2
```

### **Token Cleanup (Daily at 2 AM)**

```bash
# Note: You'll need to create an endpoint for this
gcloud scheduler jobs create http token-cleanup \
  --location=${GCP_REGION} \
  --schedule="0 2 * * *" \
  --uri="${SERVICE_URL}/jobs/cleanup-tokens" \
  --http-method=POST \
  --headers="x-cron-secret=${CRON_SECRET}" \
  --time-zone="UTC" \
  --description="Clean up expired refresh tokens" \
  --attempt-deadline=60s
```

---

## 📋 **Schedule Examples**

| Cron Expression | Description | Use Case |
|----------------|-------------|----------|
| `0 20 * * *` | 8:00 PM daily | Daily digest |
| `*/5 * * * *` | Every 5 minutes | OCR batch processing |
| `0 2 * * *` | 2:00 AM daily | Token cleanup |
| `0 9 * * 1` | 9:00 AM Mondays | Weekly report |
| `0 0 1 * *` | Midnight on 1st of month | Monthly summary |
| `0 12 * * 0` | Noon on Sundays | Weekly digest |

**Cron Format**: `minute hour day-of-month month day-of-week`

---

## 🔐 **Security Configuration**

### **Authentication Method: x-cron-secret Header**

**Why not Cloud Scheduler Service Account?**
- Simpler configuration
- Works with any cron service
- Easy to rotate
- No IAM policy management

**Security Features:**
- Secret stored in Secret Manager
- Logged attempts (authorized and unauthorized)
- Can be rotated without code changes
- Works with external cron services

### **Alternative: Service Account Authentication**

```bash
# Create service account for Cloud Scheduler
gcloud iam service-accounts create cloud-scheduler-sa \
  --display-name="Cloud Scheduler Service Account"

# Grant permission to invoke Cloud Run
gcloud run services add-iam-policy-binding mobile-backend \
  --region=${GCP_REGION} \
  --member="serviceAccount:cloud-scheduler-sa@${GCP_PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/run.invoker"

# Create job with OIDC authentication
gcloud scheduler jobs create http daily-digest \
  --location=${GCP_REGION} \
  --schedule="0 20 * * *" \
  --uri="${SERVICE_URL}/jobs/daily-digest" \
  --http-method=POST \
  --oidc-service-account-email="cloud-scheduler-sa@${GCP_PROJECT_ID}.iam.gserviceaccount.com" \
  --headers="x-cron-secret=${CRON_SECRET}"
```

---

## 🧪 **Testing**

### **Test Job Manually**

```bash
# Trigger job immediately
gcloud scheduler jobs run daily-digest --location=${GCP_REGION}

# Check execution logs
gcloud scheduler jobs describe daily-digest --location=${GCP_REGION}
```

### **Test Endpoint Directly**

```bash
# Get Cloud Run URL
SERVICE_URL=$(gcloud run services describe mobile-backend \
  --region=us-central1 \
  --format="value(status.url)")

# Test with correct secret
curl -X POST ${SERVICE_URL}/jobs/daily-digest \
  -H "x-cron-secret: YOUR_CRON_SECRET"

# Should return 200 with job results

# Test with wrong secret (should fail)
curl -X POST ${SERVICE_URL}/jobs/daily-digest \
  -H "x-cron-secret: wrong-secret"

# Should return 403 Forbidden
```

---

## 📊 **Monitoring**

### **View Job Execution History**

```bash
# List all jobs
gcloud scheduler jobs list --location=${GCP_REGION}

# View job details
gcloud scheduler jobs describe daily-digest --location=${GCP_REGION}

# View execution history (requires logging)
gcloud logging read "resource.type=cloud_scheduler_job AND resource.labels.job_id=daily-digest" \
  --limit=50 \
  --format=json
```

### **Check Cloud Run Logs**

```bash
# Filter logs for cron job executions
gcloud run services logs read mobile-backend \
  --region=${GCP_REGION} \
  --limit=100 \
  --log-filter='Daily digest job'
```

### **Metrics to Monitor**

- **Success Rate**: % of successful executions
- **Execution Time**: Average duration
- **Notifications Sent**: Count per execution
- **Errors**: Failed executions or notification failures

---

## 🔄 **Managing Jobs**

### **Update Job Schedule**

```bash
# Change to 9:00 PM
gcloud scheduler jobs update http daily-digest \
  --location=${GCP_REGION} \
  --schedule="0 21 * * *"
```

### **Pause Job**

```bash
gcloud scheduler jobs pause daily-digest --location=${GCP_REGION}
```

### **Resume Job**

```bash
gcloud scheduler jobs resume daily-digest --location=${GCP_REGION}
```

### **Delete Job**

```bash
gcloud scheduler jobs delete daily-digest --location=${GCP_REGION}
```

### **Update Target URL** (after redeployment)

```bash
# Get new URL
NEW_URL=$(gcloud run services describe mobile-backend \
  --region=${GCP_REGION} \
  --format="value(status.url)")

# Update job
gcloud scheduler jobs update http daily-digest \
  --location=${GCP_REGION} \
  --uri="${NEW_URL}/jobs/daily-digest"
```

---

## 🌍 **Timezone Configuration**

### **Common Timezones**

| Timezone | Location |
|----------|----------|
| `America/New_York` | Eastern Time (US) |
| `America/Los_Angeles` | Pacific Time (US) |
| `America/Chicago` | Central Time (US) |
| `Europe/London` | UK |
| `Europe/Paris` | Central Europe |
| `Asia/Tokyo` | Japan |
| `Australia/Sydney` | Australia |

### **Set Timezone**

```bash
gcloud scheduler jobs update http daily-digest \
  --location=${GCP_REGION} \
  --time-zone="America/Los_Angeles"
```

---

## 💰 **Cost**

**Cloud Scheduler Pricing** (as of 2024):
- **Free Tier**: 3 jobs per month
- **Paid**: $0.10/job/month (4+ jobs)

**Example Monthly Cost:**
- 1 job (daily digest): **Free**
- 2 jobs (digest + OCR): **Free**
- 3 jobs (digest + OCR + cleanup): **Free**
- 4+ jobs: **$0.10 per job**

---

## 🚨 **Troubleshooting**

### **Job Not Running**

**Check job status:**
```bash
gcloud scheduler jobs describe daily-digest --location=${GCP_REGION}
```

**Common issues:**
- Job is paused (state: PAUSED)
- Schedule format is invalid
- Target URL is incorrect
- Region mismatch

**Solution:**
```bash
# Verify job is enabled
gcloud scheduler jobs resume daily-digest --location=${GCP_REGION}

# Test manually
gcloud scheduler jobs run daily-digest --location=${GCP_REGION}
```

### **Job Returns 403 Forbidden**

**Cause:** Invalid `x-cron-secret` header

**Solution:**
```bash
# Verify secret value matches
# Get secret from Secret Manager
gcloud secrets versions access latest --secret="budget-tracker-cron-secret"

# Update job with correct secret
gcloud scheduler jobs update http daily-digest \
  --location=${GCP_REGION} \
  --headers="x-cron-secret=CORRECT_SECRET"
```

### **Job Returns 500 Error**

**Cause:** Application error

**Check logs:**
```bash
gcloud run services logs read mobile-backend \
  --region=${GCP_REGION} \
  --limit=50 \
  --log-filter='severity>=ERROR'
```

**Common causes:**
- Database connection failed
- Firebase credentials invalid
- Missing environment variables

---

## 📝 **Complete Setup Script**

Create a file `setup-scheduler.sh`:

```bash
#!/bin/bash
set -e

# Configuration
export GCP_PROJECT_ID="your-project-id"
export GCP_REGION="us-central1"
export TIMEZONE="America/New_York"

# Get Cloud Run URL
export SERVICE_URL=$(gcloud run services describe mobile-backend \
  --region=${GCP_REGION} \
  --format="value(status.url)")

# Get cron secret
export CRON_SECRET=$(gcloud secrets versions access latest \
  --secret="budget-tracker-cron-secret")

echo "Setting up Cloud Scheduler jobs..."
echo "Service URL: ${SERVICE_URL}"
echo ""

# Daily Digest (8:00 PM)
gcloud scheduler jobs create http daily-digest \
  --location=${GCP_REGION} \
  --schedule="0 20 * * *" \
  --uri="${SERVICE_URL}/jobs/daily-digest" \
  --http-method=POST \
  --headers="x-cron-secret=${CRON_SECRET}" \
  --time-zone="${TIMEZONE}" \
  --description="Daily digest: pending receipts and bill reminders" \
  --attempt-deadline=300s \
  --max-retry-attempts=3

echo "✓ Daily digest job created"

# OCR Batch Processing (Every 5 minutes)
gcloud scheduler jobs create http ocr-batch \
  --location=${GCP_REGION} \
  --schedule="*/5 * * * *" \
  --uri="${SERVICE_URL}/api/receipts/process/batch?limit=10" \
  --http-method=POST \
  --headers="x-cron-secret=${CRON_SECRET}" \
  --time-zone="UTC" \
  --description="Batch process pending receipts" \
  --attempt-deadline=180s \
  --max-retry-attempts=2

echo "✓ OCR batch job created"

echo ""
echo "All jobs created successfully!"
echo ""
echo "View jobs:"
echo "  gcloud scheduler jobs list --location=${GCP_REGION}"
echo ""
echo "Test daily digest:"
echo "  gcloud scheduler jobs run daily-digest --location=${GCP_REGION}"
```

Make executable and run:
```bash
chmod +x setup-scheduler.sh
./setup-scheduler.sh
```

---

## 📖 **Job Details**

### **Daily Digest Job**

```yaml
Name: daily-digest
Schedule: 0 20 * * *
Timezone: America/New_York
Target: POST https://SERVICE_URL/jobs/daily-digest
Headers:
  x-cron-secret: [FROM_SECRET_MANAGER]
Retry:
  Max attempts: 3
  Timeout: 300s
  Backoff: 5s to 3600s
```

**Functionality:**
1. Query users with `status='pending_receipt'` transactions
2. Send FCM notification to each user's devices
3. Query scheduled transactions where `isBill=true` and `nextDueDate` ≤ 3 days
4. Send bill reminder notifications
5. Return execution statistics

**Expected Response:**
```json
{
  "message": "Daily digest completed successfully",
  "duration": "2543ms",
  "stats": {
    "pendingReceiptNotifications": 15,
    "billReminderNotifications": 8,
    "totalUsersPending": 12,
    "totalBillsUpcoming": 8,
    "errors": 0
  },
  "timestamp": "2024-10-09T20:00:00.000Z"
}
```

---

### **OCR Batch Job** (Optional)

```yaml
Name: ocr-batch
Schedule: */5 * * * *
Timezone: UTC
Target: POST https://SERVICE_URL/api/receipts/process/batch?limit=10
Headers:
  x-cron-secret: [FROM_SECRET_MANAGER]
Retry:
  Max attempts: 2
  Timeout: 180s
```

**Functionality:**
- Processes up to 10 pending receipts
- Calls Veryfi OCR API
- Updates transactions with extracted data
- Sends notifications on completion

---

## 🔍 **Monitoring & Alerts**

### **View Execution Logs**

```bash
# Last 10 executions
gcloud logging read \
  "resource.type=cloud_scheduler_job AND resource.labels.job_id=daily-digest" \
  --limit=10 \
  --format=json

# Failed executions only
gcloud logging read \
  "resource.type=cloud_scheduler_job AND resource.labels.job_id=daily-digest AND severity>=ERROR" \
  --limit=10
```

### **Set Up Alerts**

```bash
# Create alert policy for job failures
gcloud alpha monitoring policies create \
  --notification-channels=CHANNEL_ID \
  --display-name="Daily Digest Failures" \
  --condition-display-name="Job failed" \
  --condition-threshold-value=1 \
  --condition-threshold-duration=60s \
  --condition-filter='resource.type="cloud_scheduler_job" AND resource.labels.job_id="daily-digest" AND severity>=ERROR'
```

---

## 🔄 **Update Workflow**

### **When Deploying New Version**

```bash
# 1. Deploy new Cloud Run version
npm run gcp:deploy

# 2. Get new URL (usually doesn't change)
NEW_URL=$(gcloud run services describe mobile-backend \
  --region=us-central1 \
  --format="value(status.url)")

# 3. Update scheduler job if URL changed
gcloud scheduler jobs update http daily-digest \
  --location=us-central1 \
  --uri="${NEW_URL}/jobs/daily-digest"

# 4. Test job
gcloud scheduler jobs run daily-digest --location=us-central1
```

---

## 📊 **Job Statistics**

### **Check Before Running**

```bash
# Preview what would be processed
curl ${SERVICE_URL}/jobs/stats \
  -H "x-cron-secret: ${CRON_SECRET}"
```

**Response:**
```json
{
  "stats": {
    "pendingReceipts": 25,
    "upcomingBills": 8
  },
  "timestamp": "2024-10-09T19:55:00.000Z"
}
```

---

## 🌐 **Multi-Region Setup**

### **Deploy to Multiple Regions**

```bash
# Deploy to multiple regions
for region in us-central1 europe-west1 asia-northeast1; do
  gcloud run deploy mobile-backend-${region} \
    --image=gcr.io/$GCP_PROJECT_ID/mobile-backend:latest \
    --region=${region}
  
  # Create scheduler job for each region
  SERVICE_URL=$(gcloud run services describe mobile-backend-${region} \
    --region=${region} \
    --format="value(status.url)")
  
  gcloud scheduler jobs create http daily-digest-${region} \
    --location=${region} \
    --schedule="0 20 * * *" \
    --uri="${SERVICE_URL}/jobs/daily-digest" \
    --http-method=POST \
    --headers="x-cron-secret=${CRON_SECRET}"
done
```

---

## 🎯 **Best Practices**

### **Scheduling**

✅ **Use appropriate timezones** - Consider user distribution  
✅ **Avoid peak hours** - Schedule heavy jobs during low traffic  
✅ **Stagger jobs** - Don't run all at same time  
✅ **Set reasonable timeouts** - Based on expected execution time  
✅ **Configure retries** - Handle transient failures  

### **Monitoring**

✅ **Set up alerts** - For failures and errors  
✅ **Track execution time** - Identify performance issues  
✅ **Monitor costs** - Review job frequency vs value  
✅ **Review logs regularly** - Catch issues early  

### **Security**

✅ **Rotate cron secret** - Quarterly recommended  
✅ **Use Secret Manager** - Never hardcode secrets  
✅ **Audit access** - Review who can trigger jobs  
✅ **Limit retries** - Prevent infinite loops  

---

## 📞 **Support**

### **View Job Configuration**

```bash
gcloud scheduler jobs describe daily-digest \
  --location=${GCP_REGION} \
  --format=yaml
```

### **View Recent Executions**

```bash
gcloud scheduler jobs describe daily-digest \
  --location=${GCP_REGION} \
  --format="value(status.lastAttemptTime,status.state)"
```

---

## 📚 **Additional Resources**

- [Cloud Scheduler Documentation](https://cloud.google.com/scheduler/docs)
- [Cron Expression Syntax](https://cloud.google.com/scheduler/docs/configuring/cron-job-schedules)
- [Cloud Run Invoking](https://cloud.google.com/run/docs/triggering/using-scheduler)

---

**Last Updated**: 2024-10-09  
**Default Schedule**: `0 20 * * *` (8:00 PM daily)  
**Status**: ✅ Ready to Configure

