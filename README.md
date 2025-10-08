# Finance Monorepo

Production-ready monorepo with Expo React Native mobile app and Node.js/Express API with Prisma. Privacy-first defaults, HTTPS in transit, encryption at rest with Postgres (RDS) and S3.

## Structure
- apps/mobile: Expo React Native (TypeScript)
- apps/api: Express (TypeScript), Prisma ORM, Zod validation
- packages/ui: Shared RN components and theme
- packages/config: Shared ESLint/Prettier/TS configs

## Prerequisites
- Node.js 20+
- pnpm 9+
- Docker

## Quick start
- Copy environment files and run services
  - `cp apps/api/.env.example apps/api/.env`
  - `cp apps/mobile/.env.example apps/mobile/.env`
  - `docker compose up -d`
- Install & prepare
  - `pnpm setup`
- Database
  - `pnpm --filter @apps/api prisma:generate`
  - `pnpm --filter @apps/api prisma:migrate`
- Dev servers
  - `pnpm dev` (starts API and Expo dev)

## Security & privacy
- Helmet and strict CORS on API
- Use HTTPS everywhere in production (behind CloudFront / ALB)
- Data at rest: enable RDS storage encryption and S3 SSE (AES-256 or KMS)
- Secrets in environment; never commit secrets. Keep `.env` local only

## CI
- GitHub Actions runs lint, typecheck, tests (if any), and build

## Local infra
- Postgres 16 and Redis 7 via docker-compose

## Deploy (high level)
- API: containerized behind load balancer with HTTPS termination and secure headers
- DB: AWS RDS Postgres with encryption, backups, restricted network
- Storage: S3 bucket with private ACL, presigned uploads, CloudFront CDN
- Push: FCM/APNS server integration (see `apps/api/src/services/push.ts`)

See package READMEs for more.
