# Docker Guide

## Overview

Complete Docker setup for Budget Tracker API with multi-stage builds, local development with docker-compose, and Cloud Run deployment.

---

## 🐳 **Dockerfile**

### **Multi-Stage Build Strategy**

**Stage 1: deps** - Production dependencies only  
**Stage 2: builder** - Build TypeScript and generate Prisma  
**Stage 3: runner** - Final production image  

### **Key Features**

✅ **Node 20 Alpine** - Minimal base image (~200MB final)  
✅ **Multi-stage** - Optimized layers, smaller final image  
✅ **Non-root user** - Security best practice  
✅ **Health check** - Container health monitoring  
✅ **dumb-init** - Proper signal handling  
✅ **Production optimized** - Only necessary files included  

### **Image Layers**

```
Base: node:20-alpine (40MB)
+ System deps: openssl, libc6-compat (10MB)
+ Production node_modules (100MB)
+ Prisma Client (20MB)
+ Compiled app (30MB)
= Final: ~200MB
```

---

## 🛠️ **Local Development**

### **Using Docker Compose**

**Start all services:**
```bash
cd server
docker-compose up -d
```

**What gets started:**
- PostgreSQL 15 (port 5432)
- Budget Tracker API (port 3000)
- Adminer database UI (port 8080)

**Access:**
- API: http://localhost:3000
- Health: http://localhost:3000/health
- Adminer: http://localhost:8080

**View logs:**
```bash
# All services
docker-compose logs -f

# API only
docker-compose logs -f api

# Database only
docker-compose logs -f postgres
```

**Stop services:**
```bash
docker-compose down

# Stop and remove volumes (clean database)
docker-compose down -v
```

---

### **Run Database Migrations**

```bash
# With docker-compose running
docker-compose exec api npx prisma migrate deploy

# Or from host
export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/budget_tracker"
npx prisma migrate deploy
```

---

## 🏗️ **Building Images**

### **Build for Local Testing**

```bash
# Build image
docker build -t budget-tracker-api:local .

# Run container
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://user:pass@host:5432/budget_tracker" \
  -e JWT_SECRET="your-jwt-secret" \
  budget-tracker-api:local
```

### **Build for Cloud Run**

```bash
# Build for linux/amd64 (Cloud Run architecture)
docker build --platform linux/amd64 \
  -t us-central1-docker.pkg.dev/PROJECT_ID/budget-tracker/budget-tracker-api:latest .

# Push to Artifact Registry
docker push us-central1-docker.pkg.dev/PROJECT_ID/budget-tracker/budget-tracker-api:latest
```

### **Build with Specific Node Version**

```bash
# Override base image
docker build \
  --build-arg NODE_VERSION=20.10.0 \
  -t budget-tracker-api:node-20.10 .
```

---

## 🧪 **Testing Docker Image**

### **Test Locally**

```bash
# Start PostgreSQL
docker run -d --name test-db \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=budget_tracker \
  -p 5432:5432 \
  postgres:15-alpine

# Run API
docker run -d --name test-api \
  -p 3000:3000 \
  -e DATABASE_URL="postgresql://postgres:postgres@host.docker.internal:5432/budget_tracker" \
  -e JWT_SECRET="test-secret-min-32-characters-long" \
  budget-tracker-api:local

# Test health
curl http://localhost:3000/health

# View logs
docker logs test-api

# Cleanup
docker stop test-api test-db
docker rm test-api test-db
```

### **Test with docker-compose**

```bash
# Start services
docker-compose up -d

# Wait for healthy
docker-compose ps

# Run tests
docker-compose exec api npm test

# Check health
curl http://localhost:3000/health
```

---

## 🔍 **Debugging**

### **Access Running Container**

```bash
# Docker Compose
docker-compose exec api sh

# Standalone container
docker exec -it budget-tracker-api sh
```

### **View Container Logs**

```bash
# Docker Compose
docker-compose logs -f api

# Standalone
docker logs -f budget-tracker-api
```

### **Inspect Container**

```bash
# See environment variables
docker exec budget-tracker-api env

# Check file structure
docker exec budget-tracker-api ls -la /app

# Check processes
docker exec budget-tracker-api ps aux

# Check disk usage
docker exec budget-tracker-api df -h
```

---

## 📦 **Image Optimization**

### **Current Optimizations**

✅ Multi-stage build (reduces size by 70%)  
✅ Alpine base (minimal OS)  
✅ Production deps only in final stage  
✅ .dockerignore (excludes unnecessary files)  
✅ Layer caching (dependencies cached)  
✅ npm ci (consistent installs)  

### **Image Size Comparison**

| Build Strategy | Size |
|----------------|------|
| Single-stage, full Ubuntu | ~800MB |
| Single-stage, Alpine | ~400MB |
| Multi-stage, Alpine | ~200MB |
| **Our implementation** | **~200MB** |

### **Further Optimization (Optional)**

```dockerfile
# Use distroless for even smaller size
FROM gcr.io/distroless/nodejs20-debian11

# Use pnpm instead of npm
RUN npm install -g pnpm
RUN pnpm install --prod --frozen-lockfile
```

---

## 🔐 **Security Best Practices**

### **Image Security**

✅ Non-root user (nodejs:1001)  
✅ Minimal base image (Alpine)  
✅ No secrets in image  
✅ Read-only file system (where possible)  
✅ Health checks configured  
✅ Latest security patches (alpine)  

### **Scan for Vulnerabilities**

```bash
# Using Google Cloud
gcloud artifacts docker images scan \
  us-central1-docker.pkg.dev/PROJECT_ID/budget-tracker/budget-tracker-api:latest

# Using Trivy
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  aquasec/trivy image budget-tracker-api:local

# Using Docker Scout
docker scout cves budget-tracker-api:local
```

---

## 🔄 **CI/CD Integration**

### **GitHub Actions**

```yaml
# .github/workflows/deploy.yml
name: Build and Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - uses: google-github-actions/auth@v1
        with:
          credentials_json: ${{ secrets.GCP_SA_KEY }}
      
      - name: Set up Cloud SDK
        uses: google-github-actions/setup-gcloud@v1
      
      - name: Build and Deploy
        run: |
          cd server
          chmod +x deploy.sh
          ./deploy.sh
```

### **GitLab CI**

```yaml
# .gitlab-ci.yml
deploy:
  image: google/cloud-sdk:alpine
  stage: deploy
  script:
    - cd server
    - chmod +x deploy.sh
    - ./deploy.sh
  only:
    - main
```

---

## 📊 **Monitoring Docker Containers**

### **Resource Usage**

```bash
# Monitor in real-time
docker stats budget-tracker-api

# Check specific metrics
docker container inspect budget-tracker-api | jq '.[0].State'
```

### **Container Health**

```bash
# Check health status
docker inspect --format='{{.State.Health.Status}}' budget-tracker-api

# View health check logs
docker inspect --format='{{range .State.Health.Log}}{{.Output}}{{end}}' budget-tracker-api
```

---

## 🔧 **Common Docker Commands**

```bash
# Build
docker build -t budget-tracker-api:local .

# Run
docker run -p 3000:3000 budget-tracker-api:local

# Stop
docker stop budget-tracker-api

# Remove
docker rm budget-tracker-api

# View logs
docker logs budget-tracker-api

# Execute command
docker exec budget-tracker-api node --version

# Clean up unused images
docker image prune -a

# Clean up everything
docker system prune -a --volumes
```

---

## 📚 **Additional Resources**

- [Docker Documentation](https://docs.docker.com/)
- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Multi-stage Builds](https://docs.docker.com/build/building/multi-stage/)
- [Node.js Docker Best Practices](https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md)

---

**Last Updated**: 2024-10-09  
**Docker Version**: 20+  
**Status**: ✅ Production Ready

