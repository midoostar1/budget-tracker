# Finance Tracker - Data Models & Validation

This project contains Prisma schema definitions and Zod validation schemas for a finance tracking application.

## Models

### User
- `id`: Unique identifier (CUID)
- `email`: User email (unique)
- `createdAt`: Account creation timestamp

### AccountProvider
- `id`: Unique identifier
- `userId`: Reference to User
- `provider`: OAuth provider ('google', 'apple', 'facebook')
- `providerUid`: Provider-specific user ID
- **Unique constraint**: (provider, providerUid)

### Category
- `id`: Unique identifier
- `userId`: Reference to User
- `name`: Category name
- `type`: 'expense' or 'income'
- `archived`: Soft delete flag
- **Unique constraint**: (userId, name, type)

### Transaction
- `id`: Unique identifier
- `userId`: Reference to User
- `type`: 'expense' or 'income'
- `amount`: Decimal value (12,2 precision)
- `currency`: Currency code (default: USD)
- `payee`: Payee name
- `categoryId`: Optional category reference
- `note`: Optional transaction note
- `occurredAt`: Transaction timestamp
- `source`: 'manual', 'ocr', or 'bank'
- `receiptImageUrl`: Optional receipt image URL
- `ocrMeta`: Optional JSON metadata from OCR

### PendingReceipt
- `id`: Unique identifier
- `userId`: Reference to User
- `s3Key`: S3 storage key
- `createdAt`: Upload timestamp

### RecurringRule
- `id`: Unique identifier
- `userId`: Reference to User
- `kind`: 'expense' or 'income'
- `amount`: Decimal value (12,2 precision)
- `currency`: Currency code (default: USD)
- `payee`: Payee name
- `categoryId`: Optional category reference
- `cadence`: 'daily', 'weekly', 'biweekly', 'monthly', or 'yearly'
- `nextRunAt`: Next execution timestamp
- `lastRunAt`: Last execution timestamp (optional)

### UserSettings
- `id`: Unique identifier
- `userId`: Reference to User (unique)
- `nightlyReminderLocalTime`: Time in HH:mm format
- `timezone`: Timezone string (default: UTC)
- `monthlyExportEnabled`: Boolean flag

### NotificationToken
- `id`: Unique identifier
- `userId`: Reference to User
- `platform`: 'ios' or 'android'
- `token`: Device token (unique)
- **Unique constraint**: (userId, platform, token)

### ExportJob
- `id`: Unique identifier
- `userId`: Reference to User
- `month`: Month in YYYY-MM format
- `status`: 'queued', 'done', or 'failed'
- `url`: Optional export URL
- **Unique constraint**: (userId, month)

### Subscription
- `id`: Unique identifier
- `userId`: Reference to User (unique)
- `plan`: 'free' or 'premium'
- `renewsAt`: Optional renewal timestamp

## Indices

The schema includes optimized indices for:
- **userId lookups**: All models have indices on `userId` for efficient user data queries
- **Time-range queries**: Transaction `occurredAt` field has dedicated indices
- **Recurring tasks**: `nextRunAt` index for efficient job scheduling
- **Category filtering**: Composite index on `(userId, archived)` for active/archived filtering
- **Export job status**: Index on `status` for queuing system

## Zod Schemas

All models have corresponding Zod validation schemas for:
- **Create operations**: Full validation for new records
- **Update operations**: Partial validation allowing optional fields

Schemas include:
- Type validation (enums, strings, numbers, dates)
- Format validation (email, URL, time formats, regex patterns)
- Length constraints
- Default values where appropriate
- TypeScript type exports

## Usage

### Prisma

```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Open Prisma Studio
npm run prisma:studio
```

### Zod Validation

```typescript
import { CreateTransactionSchema, UpdateTransactionSchema } from './src/schemas/dto';

// Validate create request
const newTransaction = CreateTransactionSchema.parse({
  userId: 'user123',
  type: 'expense',
  amount: 42.50,
  currency: 'USD',
  payee: 'Coffee Shop',
  occurredAt: new Date(),
  source: 'manual'
});

// Validate update request
const updateData = UpdateTransactionSchema.parse({
  amount: 45.00,
  note: 'Updated amount'
});
```

## Database Setup

1. Set your `DATABASE_URL` in `.env`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/financetracker?schema=public"
```

2. Run migrations:
```bash
npm run prisma:migrate
```

## Features

- ✅ Comprehensive data modeling for finance tracking
- ✅ Support for multiple auth providers
- ✅ Transaction categorization with soft deletes
- ✅ OCR and bank integration support
- ✅ Recurring transactions
- ✅ Export functionality
- ✅ Subscription management
- ✅ Push notification support
- ✅ Optimized database indices
- ✅ Full TypeScript type safety
- ✅ Request validation with Zod
