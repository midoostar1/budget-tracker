#!/bin/bash
set -e

# Budget Tracker API - Secret Manager Setup Script
# This script creates all required secrets in Google Cloud Secret Manager

# Configuration
PROJECT_ID=${GCP_PROJECT_ID:-"your-project-id"}

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}🔐 Budget Tracker - Secret Manager Setup${NC}"
echo "=============================================="
echo ""

# Check prerequisites
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}❌ Error: gcloud CLI is not installed${NC}"
    exit 1
fi

# Set project
echo -e "${YELLOW}Setting project: ${PROJECT_ID}${NC}"
gcloud config set project ${PROJECT_ID}

# Enable Secret Manager API
echo -e "${YELLOW}Enabling Secret Manager API...${NC}"
gcloud services enable secretmanager.googleapis.com --quiet

# Function to create or update secret
create_or_update_secret() {
    local secret_name=$1
    local secret_value=$2
    local description=$3
    
    echo -e "${YELLOW}📝 Processing secret: ${secret_name}${NC}"
    
    # Check if secret exists
    if gcloud secrets describe ${secret_name} &> /dev/null; then
        echo "  Secret exists, adding new version..."
        echo -n "${secret_value}" | gcloud secrets versions add ${secret_name} --data-file=-
    else
        echo "  Creating new secret..."
        echo -n "${secret_value}" | gcloud secrets create ${secret_name} \
            --data-file=- \
            --replication-policy="automatic" \
            --labels="app=budget-tracker" \
            ${description:+--description="${description}"}
    fi
    
    echo -e "  ${GREEN}✓ Done${NC}"
}

# Grant Cloud Run service account access to secrets
grant_secret_access() {
    local secret_name=$1
    local service_account=$2
    
    gcloud secrets add-iam-policy-binding ${secret_name} \
        --member="serviceAccount:${service_account}" \
        --role="roles/secretmanager.secretAccessor" \
        --quiet &> /dev/null
}

echo ""
echo "This script will create the following secrets:"
echo "  - budget-tracker-database-url"
echo "  - budget-tracker-jwt-secret"
echo "  - budget-tracker-google-web-client-id"
echo "  - budget-tracker-google-ios-client-id"
echo "  - budget-tracker-google-android-client-id"
echo "  - budget-tracker-apple-bundle-id"
echo "  - budget-tracker-facebook-app-id"
echo "  - budget-tracker-facebook-app-secret"
echo "  - budget-tracker-gcs-bucket-name"
echo "  - budget-tracker-gcs-project-id"
echo "  - budget-tracker-veryfi-client-id"
echo "  - budget-tracker-veryfi-client-secret"
echo "  - budget-tracker-veryfi-username"
echo "  - budget-tracker-veryfi-api-key"
echo "  - budget-tracker-firebase-admin-json"
echo "  - budget-tracker-cron-secret"
echo "  - budget-tracker-cors-allowed-origins"
echo ""
read -p "Continue? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 0
fi

echo ""
echo -e "${YELLOW}Creating secrets from .env file...${NC}"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${RED}❌ Error: .env file not found${NC}"
    echo "Please create .env file with all required values"
    exit 1
fi

# Source .env file
set -a
source .env
set +a

# Create secrets (only if environment variable is set)
[ -n "$DATABASE_URL" ] && create_or_update_secret "budget-tracker-database-url" "$DATABASE_URL" "PostgreSQL connection string"
[ -n "$JWT_SECRET" ] && create_or_update_secret "budget-tracker-jwt-secret" "$JWT_SECRET" "JWT signing secret"
[ -n "$GOOGLE_WEB_CLIENT_ID" ] && create_or_update_secret "budget-tracker-google-web-client-id" "$GOOGLE_WEB_CLIENT_ID" "Google OAuth Web Client ID"
[ -n "$GOOGLE_IOS_CLIENT_ID" ] && create_or_update_secret "budget-tracker-google-ios-client-id" "$GOOGLE_IOS_CLIENT_ID" "Google OAuth iOS Client ID"
[ -n "$GOOGLE_ANDROID_CLIENT_ID" ] && create_or_update_secret "budget-tracker-google-android-client-id" "$GOOGLE_ANDROID_CLIENT_ID" "Google OAuth Android Client ID"
[ -n "$APPLE_BUNDLE_ID" ] && create_or_update_secret "budget-tracker-apple-bundle-id" "$APPLE_BUNDLE_ID" "Apple Sign In Bundle ID"
[ -n "$FACEBOOK_APP_ID" ] && create_or_update_secret "budget-tracker-facebook-app-id" "$FACEBOOK_APP_ID" "Facebook App ID"
[ -n "$FACEBOOK_APP_SECRET" ] && create_or_update_secret "budget-tracker-facebook-app-secret" "$FACEBOOK_APP_SECRET" "Facebook App Secret"
[ -n "$GCS_BUCKET_NAME" ] && create_or_update_secret "budget-tracker-gcs-bucket-name" "$GCS_BUCKET_NAME" "GCS Bucket Name"
[ -n "$GCS_PROJECT_ID" ] && create_or_update_secret "budget-tracker-gcs-project-id" "$GCS_PROJECT_ID" "GCS Project ID"
[ -n "$VERYFI_CLIENT_ID" ] && create_or_update_secret "budget-tracker-veryfi-client-id" "$VERYFI_CLIENT_ID" "Veryfi Client ID"
[ -n "$VERYFI_CLIENT_SECRET" ] && create_or_update_secret "budget-tracker-veryfi-client-secret" "$VERYFI_CLIENT_SECRET" "Veryfi Client Secret"
[ -n "$VERYFI_USERNAME" ] && create_or_update_secret "budget-tracker-veryfi-username" "$VERYFI_USERNAME" "Veryfi Username"
[ -n "$VERYFI_API_KEY" ] && create_or_update_secret "budget-tracker-veryfi-api-key" "$VERYFI_API_KEY" "Veryfi API Key"
[ -n "$FIREBASE_ADMIN_JSON_BASE64" ] && create_or_update_secret "budget-tracker-firebase-admin-json" "$FIREBASE_ADMIN_JSON_BASE64" "Firebase Admin Service Account (base64)"
[ -n "$CRON_SECRET" ] && create_or_update_secret "budget-tracker-cron-secret" "$CRON_SECRET" "Cron job authentication secret"
[ -n "$CORS_ALLOWED_ORIGINS" ] && create_or_update_secret "budget-tracker-cors-allowed-origins" "$CORS_ALLOWED_ORIGINS" "Allowed CORS origins"

echo ""
echo -e "${GREEN}✅ All secrets created successfully!${NC}"
echo ""

# Optional: Grant service account access
read -p "Grant Cloud Run service account access to secrets? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    read -p "Enter service account email (e.g., budget-tracker-sa@PROJECT.iam.gserviceaccount.com): " SA_EMAIL
    
    if [ -n "$SA_EMAIL" ]; then
        echo -e "${YELLOW}Granting access to all secrets...${NC}"
        
        for secret in budget-tracker-database-url budget-tracker-jwt-secret \
                     budget-tracker-google-web-client-id budget-tracker-google-ios-client-id \
                     budget-tracker-google-android-client-id budget-tracker-apple-bundle-id \
                     budget-tracker-facebook-app-id budget-tracker-facebook-app-secret \
                     budget-tracker-gcs-bucket-name budget-tracker-gcs-project-id \
                     budget-tracker-veryfi-client-id budget-tracker-veryfi-client-secret \
                     budget-tracker-veryfi-username budget-tracker-veryfi-api-key \
                     budget-tracker-firebase-admin-json budget-tracker-cron-secret \
                     budget-tracker-cors-allowed-origins; do
            
            if gcloud secrets describe ${secret} &> /dev/null; then
                grant_secret_access ${secret} ${SA_EMAIL}
            fi
        done
        
        echo -e "${GREEN}✅ Access granted${NC}"
    fi
fi

echo ""
echo "Next steps:"
echo "1. Review secrets in Secret Manager console"
echo "2. Update cloudrun.yaml with your PROJECT_ID"
echo "3. Run ./deploy.sh to deploy the application"
echo ""

