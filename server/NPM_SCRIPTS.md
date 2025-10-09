# NPM Scripts Reference

## 📚 Complete Guide to All Available Scripts

Quick reference for all npm scripts in the Budget Tracker API project.

---

## 🚀 **Deployment Scripts**

### **GCP Deployment**

```bash
# Build Docker image using Cloud Build
npm run gcp:build
# → gcloud builds submit --tag gcr.io/$GCP_PROJECT_ID/mobile-backend:latest

# Deploy to Cloud Run
npm run gcp:deploy
# → Deploys with: 512Mi RAM, 1 CPU, 0-5 instances, us-central1

# Bootstrap secrets to Secret Manager
npm run gcp:secrets:bootstrap
# → Runs scripts/bootstrap-secrets.ts (reads .env.secrets)
```

**Prerequisites:**
- `GCP_PROJECT_ID` environment variable set
- gcloud CLI authenticated
- `.env.secrets` file created (for secrets:bootstrap)

**Quick Deploy:**
```bash
export GCP_PROJECT_ID="your-project-id"
npm run gcp:build && npm run gcp:deploy
```

---

## 🛠️ **Development Scripts**

### **Development Server**

```bash
# Start development server with hot reload
npm run dev
# → tsx watch src/index.ts
# Server restarts automatically on file changes
```

### **Build & Start**

```bash
# Compile TypeScript to JavaScript
npm run build
# → tsc (outputs to dist/)

# Start production server
npm start
# → node dist/index.js
```

---

## 🗄️ **Database Scripts**

### **Prisma Operations**

```bash
# Generate Prisma Client (after schema changes)
npm run prisma:generate
# → prisma generate

# Create and run migration (development)
npm run prisma:migrate
# → prisma migrate dev
# Prompts for migration name

# Deploy migrations (production)
npm run prisma:migrate:prod
# → prisma migrate deploy
# No prompts, runs pending migrations

# Open Prisma Studio (database GUI)
npm run prisma:studio
# → prisma studio
# Opens at http://localhost:5555

# Seed database with test data
npm run prisma:seed
# → tsx prisma/seed.ts

# Push schema changes without migration
npm run db:push
# → prisma db push
# Use for prototyping only
```

---

## 🧪 **Testing Scripts**

```bash
# Run tests
npm test
# → vitest

# Run tests with UI
npm run test:ui
# → vitest --ui
# Opens browser UI at http://localhost:51204

# Generate coverage report
npm run test:coverage
# → vitest --coverage
# Outputs to coverage/ directory
```

---

## ✨ **Code Quality Scripts**

### **Linting**

```bash
# Lint TypeScript files
npm run lint
# → eslint src/**/*.ts

# Lint and auto-fix
npm run lint:fix
# → eslint src/**/*.ts --fix
```

### **Formatting**

```bash
# Format code with Prettier
npm run format
# → prettier --write "src/**/*.ts"

# Check formatting (CI/CD)
npm run format:check
# → prettier --check "src/**/*.ts"
```

### **Type Checking**

```bash
# Type check without emitting files
npm run typecheck
# → tsc --noEmit
# Useful for CI/CD
```

---

## 🔄 **Common Workflows**

### **Development Workflow**

```bash
# 1. Start database (if using Docker)
docker-compose up -d postgres

# 2. Run migrations
npm run prisma:migrate

# 3. Start dev server
npm run dev

# 4. In another terminal: open Prisma Studio
npm run prisma:studio

# 5. Make changes, server auto-reloads
```

### **Pre-Commit Workflow**

```bash
# Type check
npm run typecheck

# Lint
npm run lint:fix

# Format
npm run format

# Test
npm test

# Build (verify compilation)
npm run build
```

### **Deployment Workflow**

```bash
# 1. Ensure secrets are up to date
npm run gcp:secrets:bootstrap

# 2. Build Docker image
npm run gcp:build

# 3. Deploy to Cloud Run
npm run gcp:deploy

# 4. Run migrations (if needed)
npm run prisma:migrate:prod

# 5. Verify deployment
curl https://SERVICE_URL/health
```

---

## 📋 **Script Categories**

### **By Frequency**

**Daily Development:**
- `npm run dev`
- `npm run typecheck`
- `npm run lint:fix`
- `npm run format`

**Before Commits:**
- `npm run typecheck`
- `npm run lint`
- `npm test`
- `npm run build`

**Schema Changes:**
- `npm run prisma:generate`
- `npm run prisma:migrate`

**Deployment:**
- `npm run gcp:build`
- `npm run gcp:deploy`
- `npm run prisma:migrate:prod`

**One-time Setup:**
- `npm run gcp:secrets:bootstrap`
- `npm run prisma:seed`

---

## 🎯 **Quick Reference Table**

| Task | Script | When to Use |
|------|--------|-------------|
| **Start dev server** | `npm run dev` | Every development session |
| **Build for prod** | `npm run build` | Before deployment |
| **Deploy to GCP** | `npm run gcp:deploy` | After build |
| **Update secrets** | `npm run gcp:secrets:bootstrap` | When secrets change |
| **Run migrations** | `npm run prisma:migrate` | After schema changes |
| **Type check** | `npm run typecheck` | Before commits |
| **Run tests** | `npm test` | Before commits |
| **Fix linting** | `npm run lint:fix` | Before commits |
| **Format code** | `npm run format` | Before commits |
| **Open DB GUI** | `npm run prisma:studio` | To view/edit data |

---

## 🔧 **Environment Variables for Scripts**

### **Required for GCP Scripts**

```bash
# Set in your shell or CI/CD
export GCP_PROJECT_ID="your-project-id"

# Optional (has defaults)
export GCP_REGION="us-central1"
```

### **For Database Scripts**

```bash
# Required for migrations
export DATABASE_URL="postgresql://..."
```

---

## 💡 **Tips & Tricks**

### **Parallel Execution**

```bash
# Run multiple scripts
npm run typecheck & npm run lint & npm test & wait

# Sequential with &&
npm run typecheck && npm run lint && npm run build
```

### **Watch Multiple Commands**

```bash
# Terminal 1: Dev server
npm run dev

# Terminal 2: Tests
npm test -- --watch

# Terminal 3: Type checking
npx tsc --watch --noEmit
```

### **Script Aliases** (Add to package.json)

```json
{
  "scripts": {
    "check": "npm run typecheck && npm run lint && npm test",
    "deploy:full": "npm run gcp:build && npm run gcp:deploy && npm run prisma:migrate:prod",
    "local": "docker-compose up -d && npm run dev"
  }
}
```

---

## 🐛 **Troubleshooting**

### **Script Fails: "GCP_PROJECT_ID not set"**

```bash
export GCP_PROJECT_ID="your-project-id"
# Or add to .bashrc/.zshrc:
echo 'export GCP_PROJECT_ID="your-project-id"' >> ~/.zshrc
```

### **Script Fails: "gcloud not found"**

Install gcloud CLI:
```bash
# macOS
brew install --cask google-cloud-sdk

# Or download from:
# https://cloud.google.com/sdk/docs/install
```

### **"Permission denied" on scripts**

```bash
chmod +x scripts/bootstrap-secrets.ts
```

### **TypeScript errors on bootstrap script**

```bash
# Ensure tsx is installed
npm install -D tsx

# Or run with node + ts-node
npx ts-node scripts/bootstrap-secrets.ts
```

---

## 📖 **Full Script List**

### **Development (8 scripts)**
- `dev` - Development server with hot reload
- `build` - Compile TypeScript
- `start` - Start production server
- `typecheck` - Type check without emitting
- `lint` - Lint code
- `lint:fix` - Lint and auto-fix
- `format` - Format with Prettier
- `format:check` - Check formatting

### **Testing (3 scripts)**
- `test` - Run tests
- `test:ui` - Test with UI
- `test:coverage` - Coverage report

### **Database (6 scripts)**
- `prisma:generate` - Generate Prisma Client
- `prisma:migrate` - Create and run migration (dev)
- `prisma:migrate:prod` - Deploy migrations (prod)
- `prisma:studio` - Open database GUI
- `prisma:seed` - Seed database
- `db:push` - Push schema (no migration)

### **GCP Deployment (3 scripts)**
- `gcp:build` - Build Docker image
- `gcp:deploy` - Deploy to Cloud Run
- `gcp:secrets:bootstrap` - Setup secrets

**Total: 20 scripts**

---

**Last Updated**: 2024-10-09  
**Total Scripts**: 20  
**Status**: ✅ Complete

