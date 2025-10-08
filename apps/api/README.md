# API

- Express + TypeScript
- Prisma ORM (PostgreSQL)
- Zod validation
- BullMQ for queues
- OpenAPI docs at `/docs` using zod-to-openapi (basic example)

## Local development

1. `docker compose up -d`
2. Copy `.env.example` to `.env` and fill
3. `pnpm install`
4. `pnpm --filter @apps/api prisma:generate`
5. `pnpm --filter @apps/api prisma:migrate`
6. `pnpm --filter @apps/api dev`
