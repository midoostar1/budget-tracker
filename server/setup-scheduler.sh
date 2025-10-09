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
echo "Schedule: $SCHEDULE"
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
echo "  2. View job: https://console.cloud.google.com/cloudscheduler"
echo "  3. Wait for scheduled run"
echo ""
