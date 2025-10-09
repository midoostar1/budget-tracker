# Cron Jobs & Scheduled Tasks Documentation

## Overview

Secure endpoints for scheduled tasks including daily digests, bill reminders, and batch processing. Protected by `x-cron-secret` header for use with Cloud Scheduler or similar cron services.

## Architecture

### Security Model

All job endpoints are protected by a shared secret:

```
Client → x-cron-secret: CRON_SECRET → Middleware verification → Job execution
```

**Benefits:**
- Prevents unauthorized job triggering
- Simple authentication for automated systems
- No user authentication needed
- Logging of all job executions

---

## Configuration

### Environment Variable

```bash
CRON_SECRET=your-secure-cron-secret-min-32-chars-change-in-production
```

**Best Practices:**
- Use strong random string (32+ characters)
- Rotate periodically
- Don't commit to version control
- Store in secret management system (production)

---

## API Endpoints

### 1. Daily Digest

**POST** `/jobs/daily-digest`

Run daily digest job that sends push notifications for:
1. Users with pending receipt transactions
2. Users with bills due within 3 days

**Headers:**
```
x-cron-secret: YOUR_CRON_SECRET
```

**Success Response (200):**
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
  "timestamp": "2024-10-09T10:00:00.000Z"
}
```

**What It Does:**

**Part 1: Pending Receipts**
- Finds all users with `status='pending_receipt'` transactions
- Sends push notification: "You have N receipt(s) to review!"
- Only notifies users with registered devices

**Part 2: Upcoming Bills**
- Finds scheduled transactions where `isBill=true` and `nextDueDate` within 3 days
- Sends push notification: "Your [description] bill ($amount) is due [when]"
- Calculates due date text: "today", "tomorrow", "in 2 days", "in 3 days"

**Error Response (401/403):**
```json
{
  "error": "Unauthorized",
  "message": "x-cron-secret header is required"
}
```

---

### 2. Job Statistics

**GET** `/jobs/stats`

Get current statistics for what would be processed by the daily digest.

**Headers:**
```
x-cron-secret: YOUR_CRON_SECRET
```

**Success Response (200):**
```json
{
  "stats": {
    "pendingReceipts": 25,
    "upcomingBills": 8
  },
  "timestamp": "2024-10-09T10:00:00.000Z"
}
```

**Use Case:**
- Monitor job queue sizes
- Verify jobs will run correctly
- Debug notification issues

---

## Cloud Scheduler Setup

### Google Cloud Platform

**1. Create Scheduler Job:**
```bash
gcloud scheduler jobs create http daily-digest \
  --schedule="0 9 * * *" \
  --uri="https://your-api.com/jobs/daily-digest" \
  --http-method=POST \
  --headers="x-cron-secret=YOUR_CRON_SECRET" \
  --time-zone="America/New_York" \
  --description="Daily digest: pending receipts and bill reminders"
```

**2. Schedule:**
- `0 9 * * *` = Every day at 9:00 AM
- Adjust timezone as needed
- Consider user timezone distribution

**3. Monitoring:**
```bash
# View job history
gcloud scheduler jobs describe daily-digest

# View logs
gcloud logging read "resource.type=cloud_scheduler_job" --limit 50
```

---

### AWS EventBridge

**1. Create Rule:**
```json
{
  "Name": "DailyDigest",
  "ScheduleExpression": "cron(0 9 * * ? *)",
  "State": "ENABLED",
  "Targets": [
    {
      "Arn": "arn:aws:...",
      "HttpParameters": {
        "HeaderParameters": {
          "x-cron-secret": "YOUR_CRON_SECRET"
        }
      }
    }
  ]
}
```

---

### Heroku Scheduler

**Add-on Setup:**
```bash
heroku addons:create scheduler:standard
heroku addons:open scheduler
```

**Configure Job:**
```bash
curl -X POST https://your-app.herokuapp.com/jobs/daily-digest \
  -H "x-cron-secret: $CRON_SECRET"
```

**Frequency**: Daily at 9:00 AM

---

## Local Testing

### Manual Trigger

```bash
# Set secret in environment
export CRON_SECRET="your-local-secret"

# Add to .env
echo "CRON_SECRET=your-local-secret" >> .env

# Trigger job
curl -X POST http://localhost:3000/jobs/daily-digest \
  -H "x-cron-secret: your-local-secret"
```

### Check Stats Before Running

```bash
curl http://localhost:3000/jobs/stats \
  -H "x-cron-secret: your-local-secret"
```

---

## Notification Examples

### Pending Receipts Notification

```json
{
  "title": "Receipts to Review",
  "body": "You have 3 receipts to review!",
  "data": {
    "type": "pending_receipts",
    "count": "3"
  }
}
```

### Bill Reminder Notification

```json
{
  "title": "Bill Reminder",
  "body": "Your Rent bill ($1500.00) is due tomorrow",
  "data": {
    "type": "bill_reminder",
    "scheduledTransactionId": "uuid",
    "description": "Rent",
    "amount": "1500.00",
    "dueDate": "2024-10-10T00:00:00.000Z",
    "daysUntil": "1"
  }
}
```

---

## Implementation Details

### Service Layer

**`src/services/jobsService.ts`**

- `runDailyDigest()` - Main job function
- `notifyPendingReceipts()` - Find users and send notifications
- `notifyUpcomingBills()` - Find bills and send reminders
- `getJobStats()` - Get current counts

### Middleware

**`src/middleware/cronAuth.ts`**

- Verifies `x-cron-secret` header
- Logs all cron requests
- Returns 401/403 for invalid/missing secrets

### Controller

**`src/controllers/jobsController.ts`**

- `dailyDigest()` - Endpoint handler
- `getJobStatistics()` - Stats endpoint

---

## Monitoring & Logging

### Job Execution Logs

All job executions are logged:

```json
{
  "level": "info",
  "msg": "Daily digest job triggered",
  "timestamp": "2024-10-09T09:00:00.000Z"
}

{
  "level": "info",
  "msg": "Daily digest job completed",
  "duration": 2543,
  "pendingReceiptNotifications": 15,
  "billReminderNotifications": 8,
  "errors": 0
}
```

### Error Logging

```json
{
  "level": "error",
  "msg": "Failed to send pending receipt notification",
  "userId": "uuid",
  "error": "..."
}
```

### Queries for Monitoring

```bash
# Count job executions today
grep "Daily digest job triggered" logs/app.log | wc -l

# Check for errors
grep "Daily digest job failed" logs/app.log

# View job performance
grep "Daily digest job completed" logs/app.log | tail -10
```

---

## Performance Considerations

### Execution Time

- **Typical**: 1-5 seconds (few users)
- **High Load**: 30-60 seconds (many users)
- **Factors**: User count, device count, notification delivery

### Optimization

1. **Batch Notifications**:
   - Use multicast for users with multiple devices
   - Process in batches to avoid memory issues

2. **Query Optimization**:
   - Use indexes for date filtering
   - Parallel query execution
   - Limit data fetched

3. **Timeout Configuration**:
   - Set appropriate Cloud Scheduler timeout (5 minutes recommended)
   - Handle failures gracefully
   - Implement retry logic if needed

---

## Error Handling

### Authentication Errors

**401 Unauthorized** - Missing secret
```json
{
  "error": "Unauthorized",
  "message": "x-cron-secret header is required"
}
```

**403 Forbidden** - Invalid secret
```json
{
  "error": "Forbidden",
  "message": "Invalid cron secret"
}
```

**503 Service Unavailable** - Secret not configured
```json
{
  "error": "Service Unavailable",
  "message": "Cron jobs are not configured"
}
```

### Partial Failures

Job continues even if some notifications fail:

```json
{
  "message": "Daily digest completed successfully",
  "stats": {
    "pendingReceiptNotifications": 12,
    "billReminderNotifications": 6,
    "errors": 2
  }
}
```

---

## Security Best Practices

### Secret Management

✅ **Use strong secrets** (32+ characters, random)  
✅ **Rotate periodically** (quarterly recommended)  
✅ **Store in secret manager** (GCP Secret Manager, AWS Secrets Manager)  
✅ **Never commit to version control**  
✅ **Log unauthorized attempts**  

### Additional Security

1. **IP Whitelisting** (production):
   - Restrict to Cloud Scheduler IPs
   - Use VPC/firewall rules

2. **Rate Limiting**:
   - Limit job endpoint calls
   - Prevent abuse even with valid secret

3. **Monitoring**:
   - Alert on multiple failures
   - Track execution patterns
   - Detect unusual activity

---

## Troubleshooting

### Issue: "Cron jobs are not configured"

**Solution**: Set `CRON_SECRET` in `.env`:
```bash
CRON_SECRET=your-secure-random-secret-here
```

### Issue: Jobs not running on schedule

**Check:**
- Cloud Scheduler job status (enabled/disabled)
- Schedule expression is correct
- Target URL is correct
- Headers are properly set
- Check Cloud Scheduler logs

### Issue: Notifications not sent

**Check:**
- Users have devices registered
- Firebase credentials configured
- FCM tokens are valid
- Review error logs for specifics

### Issue: "Invalid cron secret"

**Check:**
- Secret matches between `.env` and Cloud Scheduler
- No extra spaces or newlines in secret
- Header name is exactly `x-cron-secret`
- Secret is base64/URL-safe if needed

---

## Future Enhancements

- [ ] Weekly summary emails
- [ ] Monthly budget reports
- [ ] Spending alerts (exceeded budget)
- [ ] Inactivity reminders
- [ ] Receipt processing reminders
- [ ] Recurring transaction creation (auto-create from scheduled)
- [ ] Data cleanup jobs (old receipts, etc.)
- [ ] Analytics aggregation jobs
- [ ] Backup jobs

---

## Example: Cloud Scheduler Configuration

```yaml
# GCP Cloud Scheduler Job (YAML format)
name: projects/PROJECT_ID/locations/REGION/jobs/daily-digest
description: Daily digest for pending receipts and bill reminders
schedule: 0 9 * * *
timeZone: America/New_York
httpTarget:
  uri: https://your-api.com/jobs/daily-digest
  httpMethod: POST
  headers:
    x-cron-secret: YOUR_CRON_SECRET
  oidcToken:
    serviceAccountEmail: scheduler@PROJECT_ID.iam.gserviceaccount.com
attemptDeadline: 300s  # 5 minutes
retryConfig:
  retryCount: 3
  maxRetryDuration: 600s
  minBackoffDuration: 5s
  maxBackoffDuration: 3600s
```

---

**Last Updated**: 2024-10-09


