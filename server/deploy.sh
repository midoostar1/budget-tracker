#!/bin/bash
set -e

# Budget Tracker API - Cloud Run Deployment Script
# This script builds and deploys the application to Google Cloud Run

# Configuration
PROJECT_ID=${GCP_PROJECT_ID:-"your-project-id"}
REGION=${GCP_REGION:-"us-central1"}
SERVICE_NAME="budget-tracker-api"
REPOSITORY="budget-tracker"
IMAGE_NAME="budget-tracker-api"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Budget Tracker API - Cloud Run Deployment${NC}"
echo "================================================"
echo ""

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}❌ Error: gcloud CLI is not installed${NC}"
    echo "Install it from: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Check if logged in
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" &> /dev/null; then
    echo -e "${YELLOW}⚠️  Not logged in to gcloud${NC}"
    echo "Run: gcloud auth login"
    exit 1
fi

# Set project
echo -e "${YELLOW}📝 Setting GCP project: ${PROJECT_ID}${NC}"
gcloud config set project ${PROJECT_ID}

# Enable required APIs
echo -e "${YELLOW}🔧 Enabling required Google Cloud APIs...${NC}"
gcloud services enable \
    cloudbuild.googleapis.com \
    run.googleapis.com \
    secretmanager.googleapis.com \
    sqladmin.googleapis.com \
    artifactregistry.googleapis.com \
    --quiet

# Create Artifact Registry repository if it doesn't exist
echo -e "${YELLOW}📦 Setting up Artifact Registry...${NC}"
if ! gcloud artifacts repositories describe ${REPOSITORY} \
    --location=${REGION} &> /dev/null; then
    echo "Creating Artifact Registry repository..."
    gcloud artifacts repositories create ${REPOSITORY} \
        --repository-format=docker \
        --location=${REGION} \
        --description="Docker repository for Budget Tracker"
fi

# Build and push Docker image
IMAGE_TAG="${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPOSITORY}/${IMAGE_NAME}:$(git rev-parse --short HEAD)"
IMAGE_LATEST="${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPOSITORY}/${IMAGE_NAME}:latest"

echo -e "${YELLOW}🏗️  Building Docker image...${NC}"
docker build --platform linux/amd64 -t ${IMAGE_TAG} -t ${IMAGE_LATEST} .

echo -e "${YELLOW}⬆️  Pushing image to Artifact Registry...${NC}"
docker push ${IMAGE_TAG}
docker push ${IMAGE_LATEST}

# Run database migrations
echo -e "${YELLOW}🗄️  Running database migrations...${NC}"
echo "Note: Ensure DATABASE_URL is accessible from your local machine"
echo "You may need to use Cloud SQL Proxy or allowlist your IP"
read -p "Run migrations now? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    npx prisma migrate deploy
fi

# Deploy to Cloud Run using cloudrun.yaml
echo -e "${YELLOW}🚀 Deploying to Cloud Run...${NC}"

# Replace placeholders in cloudrun.yaml (if using template)
sed -e "s|PROJECT_ID|${PROJECT_ID}|g" \
    -e "s|REGION|${REGION}|g" \
    -e "s|REPOSITORY|${REPOSITORY}|g" \
    -e "s|TAG|$(git rev-parse --short HEAD)|g" \
    cloudrun.yaml > cloudrun-deploy.yaml

# Deploy
gcloud run services replace cloudrun-deploy.yaml \
    --region=${REGION} \
    --quiet

# Clean up temporary file
rm cloudrun-deploy.yaml

# Get service URL
SERVICE_URL=$(gcloud run services describe ${SERVICE_NAME} \
    --region=${REGION} \
    --format="value(status.url)")

echo ""
echo -e "${GREEN}✅ Deployment complete!${NC}"
echo "================================================"
echo ""
echo -e "Service URL: ${GREEN}${SERVICE_URL}${NC}"
echo ""
echo "Next steps:"
echo "1. Test the health endpoint:"
echo "   curl ${SERVICE_URL}/health"
echo ""
echo "2. Configure Cloud Scheduler for daily digest:"
echo "   gcloud scheduler jobs create http daily-digest \\"
echo "     --schedule=\"0 9 * * *\" \\"
echo "     --uri=\"${SERVICE_URL}/jobs/daily-digest\" \\"
echo "     --http-method=POST \\"
echo "     --headers=\"x-cron-secret=\$CRON_SECRET\" \\"
echo "     --location=${REGION}"
echo ""
echo "3. Update your mobile app with the new API URL"
echo ""

