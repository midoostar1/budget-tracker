#!/bin/bash
#
# Budget Tracker - Cloud Run Deployment Commands
# 
# INSTRUCTIONS:
# 1. Replace <YOUR_PROJECT_ID> with your actual GCP project ID
# 2. Replace <YOUR_REGION> with your region (e.g., us-central1)
# 3. Make executable: chmod +x DEPLOY_COMMANDS.sh
# 4. Run: ./DEPLOY_COMMANDS.sh
#

set -e  # Exit on error

# ============================================
# CONFIGURATION - EDIT THESE VALUES
# ============================================

# Get your Project ID from: https://console.cloud.google.com
# Example: budget-tracker-12345
PROJECT_ID="<YOUR_PROJECT_ID>"

# Choose your region (us-central1, us-east1, us-west1, europe-west1, etc.)
REGION="<YOUR_REGION>"

# ============================================
# VALIDATION
# ============================================

if [ "$PROJECT_ID" = "<YOUR_PROJECT_ID>" ]; then
    echo "❌ ERROR: Please edit this file and replace <YOUR_PROJECT_ID> with your actual GCP project ID"
    echo ""
    echo "To find your project ID:"
    echo "  1. Go to https://console.cloud.google.com"
    echo "  2. Click the project dropdown (top left)"
    echo "  3. Copy the 'ID' column value"
    echo ""
    exit 1
fi

if [ "$REGION" = "<YOUR_REGION>" ]; then
    echo "❌ ERROR: Please edit this file and replace <YOUR_REGION> with your region"
    echo ""
    echo "Recommended regions:"
    echo "  - us-central1 (Iowa, USA)"
    echo "  - us-east1 (South Carolina, USA)"
    echo "  - us-west1 (Oregon, USA)"
    echo "  - europe-west1 (Belgium)"
    echo "  - asia-southeast1 (Singapore)"
    echo ""
    exit 1
fi

echo "🚀 Budget Tracker - Cloud Run Deployment"
echo "========================================="
echo "Project ID: $PROJECT_ID"
echo "Region: $REGION"
echo ""

# ============================================
# STEP 1: AUTHENTICATE & CONFIGURE
# ============================================

echo "📝 Step 1: Authenticating and configuring gcloud..."

# Uncomment if you need to login first
# gcloud auth login

gcloud config set project $PROJECT_ID
gcloud config set run/region $REGION

echo "✅ Configuration complete"
echo ""

# ============================================
# STEP 2: ENABLE APIS
# ============================================

echo "🔧 Step 2: Enabling required APIs..."

gcloud services enable \
  cloudbuild.googleapis.com \
  run.googleapis.com \
  secretmanager.googleapis.com \
  cloudscheduler.googleapis.com \
  storage.googleapis.com

echo "✅ APIs enabled"
echo ""

# ============================================
# STEP 3: CHECK SECRETS
# ============================================

echo "🔒 Step 3: Checking secrets..."

if [ ! -f .env.secrets ]; then
    echo "⚠️  WARNING: .env.secrets not found"
    echo "   Please create .env.secrets with your production credentials"
    echo "   See .env.secrets.example for template"
    echo ""
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    echo "✅ .env.secrets found"
    
    # Upload secrets to Secret Manager
    read -p "Upload secrets to Secret Manager? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "📤 Uploading secrets..."
        npm run gcp:secrets:bootstrap
        echo "✅ Secrets uploaded"
    fi
fi
echo ""

# ============================================
# STEP 4: BUILD DOCKER IMAGE
# ============================================

echo "🐳 Step 4: Building Docker image..."

gcloud builds submit --tag gcr.io/$PROJECT_ID/mobile-backend:latest

echo "✅ Docker image built and pushed"
echo ""

# ============================================
# STEP 5: DEPLOY TO CLOUD RUN
# ============================================

echo "🚀 Step 5: Deploying to Cloud Run..."

gcloud run deploy mobile-backend \
  --image gcr.io/$PROJECT_ID/mobile-backend:latest \
  --region $REGION \
  --platform managed \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 5 \
  --timeout 60 \
  --set-secrets="DATABASE_URL=DATABASE_URL:latest,JWT_SECRET=JWT_SECRET:latest,REFRESH_SECRET=REFRESH_SECRET:latest,GOOGLE_WEB_CLIENT_ID=GOOGLE_WEB_CLIENT_ID:latest,GOOGLE_IOS_CLIENT_ID=GOOGLE_IOS_CLIENT_ID:latest,GOOGLE_ANDROID_CLIENT_ID=GOOGLE_ANDROID_CLIENT_ID:latest,VERYFI_CLIENT_ID=VERYFI_CLIENT_ID:latest,VERYFI_CLIENT_SECRET=VERYFI_CLIENT_SECRET:latest,VERYFI_USERNAME=VERYFI_USERNAME:latest,VERYFI_API_KEY=VERYFI_API_KEY:latest,FIREBASE_ADMIN_JSON_BASE64=FIREBASE_ADMIN_JSON_BASE64:latest,CRON_SECRET=CRON_SECRET:latest,GCS_BUCKET_NAME=GCS_BUCKET_NAME:latest,GCS_PROJECT_ID=GCS_PROJECT_ID:latest"

echo "✅ Deployment complete"
echo ""

# ============================================
# STEP 6: GET SERVICE URL
# ============================================

echo "🌐 Step 6: Getting service URL..."

SERVICE_URL=$(gcloud run services describe mobile-backend \
  --region $REGION \
  --format="value(status.url)")

echo "✅ Service deployed at: $SERVICE_URL"
echo ""

# ============================================
# STEP 7: TEST DEPLOYMENT
# ============================================

echo "🧪 Step 7: Testing deployment..."

echo "Testing health endpoint..."
curl -s "$SERVICE_URL/health" | jq .

echo ""
echo "✅ Health check passed"
echo ""

# ============================================
# SUCCESS
# ============================================

echo "🎉 DEPLOYMENT COMPLETE!"
echo "======================="
echo ""
echo "Your API is now live at:"
echo "  $SERVICE_URL"
echo ""
echo "Next steps:"
echo "  1. Update mobile app/app.json with this URL:"
echo "     \"apiBaseUrl\": \"$SERVICE_URL\""
echo ""
echo "  2. Run database migration (if not done):"
echo "     export DATABASE_URL=\"your-production-db-url\""
echo "     npx prisma migrate deploy"
echo ""
echo "  3. Setup Cloud Scheduler for daily digest:"
echo "     See: GCP_QUICK_DEPLOY.md (Setup Cloud Scheduler section)"
echo ""
echo "  4. Monitor logs:"
echo "     gcloud run services logs tail mobile-backend --region $REGION"
echo ""
echo "🚀 Your backend is ready!"

