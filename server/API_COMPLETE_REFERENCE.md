# Budget Tracker API - Complete Reference

## 🎯 Overview

Production-ready REST API for a comprehensive budget tracking application with social authentication, transaction management, receipt OCR, and push notifications.

**Base URL**: `http://localhost:3000` (development)

**Version**: 1.0.0

---

## 📡 API Endpoints Summary

### Authentication (`/api/auth`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/social-login` | Login with Google/Apple/Facebook | No |
| POST | `/api/auth/refresh` | Refresh access token | Cookie |
| POST | `/api/auth/logout` | Logout current session | No |
| POST | `/api/auth/logout-all` | Logout all sessions | Yes |
| GET | `/api/auth/me` | Get current user | Yes |

### Transactions (`/api/transactions`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/transactions` | Create transaction | Yes |
| GET | `/api/transactions` | Get paginated transactions | Yes |
| GET | `/api/transactions/:id` | Get single transaction | Yes |
| PUT | `/api/transactions/:id` | Update transaction | Yes |
| DELETE | `/api/transactions/:id` | Delete transaction | Yes |
| GET | `/api/transactions/stats` | Get statistics | Yes |

### Receipts (`/api/receipts`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/receipts/upload` | Upload receipt image | Yes |
| GET | `/api/receipts/:id` | Get receipt with signed URL | Yes |
| DELETE | `/api/receipts/:id` | Delete receipt | Yes |
| GET | `/api/receipts/transaction/:id` | Get transaction receipts | Yes |
| POST | `/api/receipts/process/:id` | Process receipt with OCR | Yes |
| POST | `/api/receipts/process/batch` | Batch process receipts | Yes |
| GET | `/api/receipts/ocr/stats` | Get OCR statistics | Yes |
| POST | `/api/receipts/retry/:id` | Retry failed OCR | Yes |

### Users (`/api/users`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/users/register-device` | Register FCM device | Yes |
| GET | `/api/users/devices` | Get user devices | Yes |
| DELETE | `/api/users/devices/:id` | Unregister device | Yes |

### Health & Info

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | API info and endpoints | No |
| GET | `/health` | Health check | No |

---

## 🔐 Authentication

### JWT Token System

**Access Token**: 15 minutes, sent in `Authorization: Bearer <token>` header  
**Refresh Token**: 30 days, stored in HTTP-only cookie

### Flow

1. **Login**: `POST /api/auth/social-login` → Returns `{ user, accessToken }` + sets refresh cookie
2. **Access**: Use access token for all authenticated requests
3. **Refresh**: When token expires, call `POST /api/auth/refresh` → Returns new `{ accessToken }`
4. **Logout**: `POST /api/auth/logout` → Revokes refresh token

### Supported Providers

- ✅ Google Sign-In
- ✅ Apple Sign In
- ✅ Facebook Login

---

## 📊 Database Schema

### Models

```
User
├── id (UUID)
├── email (unique)
├── provider (google|apple|facebook)
├── providerId
├── firstName, lastName
├── Relations: transactions, scheduledTransactions, devices, refreshTokens
└── Indexes: email, (provider, providerId)

RefreshToken
├── id (UUID)
├── userId → User
├── tokenHash (unique, SHA256)
├── expiresAt, revokedAt
└── Indexes: userId, tokenHash, expiresAt

Transaction
├── id (UUID)
├── userId → User
├── amount (Decimal), type (income|expense)
├── category, payee, notes
├── transactionDate, status (cleared|pending_receipt)
├── Relations: receipt
└── Indexes: userId, transactionDate, category, status, (userId,transactionDate), (userId,status)

Receipt
├── id (UUID)
├── transactionId → Transaction (unique)
├── imageUrl (gs://path)
├── ocrStatus (pending|processed|failed)
├── ocrData (JSON)
└── Indexes: ocrStatus

ScheduledTransaction
├── id (UUID)
├── userId → User
├── amount, type, description, category
├── frequency (daily|weekly|bi-weekly|monthly|yearly)
├── startDate, nextDueDate, isBill
└── Indexes: userId, nextDueDate, frequency

Device
├── id (UUID)
├── userId → User
├── fcmToken (unique)
├── platform (ios|android)
└── Indexes: userId, fcmToken
```

---

## 🚀 Quick Start

### 1. Prerequisites

```bash
# Install dependencies
cd server
npm install

# Set up environment
cp .env.example .env
# Edit .env with your credentials
```

### 2. Database Setup

```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Optional: Seed test data
npm run prisma:seed
```

### 3. External Service Configuration

**Required:**
- PostgreSQL database

**Optional (configure as needed):**
- Google Cloud Storage (for receipts)
- Veryfi OCR (for receipt processing)
- Firebase Admin (for push notifications)
- Social OAuth providers (Google, Apple, Facebook)

### 4. Start Server

```bash
# Development
npm run dev

# Production
npm run build
npm start
```

---

## 📝 Common Workflows

### 1. User Authentication

```bash
# Login with Google
curl -X POST http://localhost:3000/api/auth/social-login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "provider": "google",
    "token": "google_id_token"
  }'

# Response: { user, accessToken }
# Save accessToken for subsequent requests
```

### 2. Create Manual Transaction

```bash
curl -X POST http://localhost:3000/api/transactions \
  -H "Authorization: Bearer ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 50.00,
    "type": "expense",
    "category": "Groceries",
    "payee": "Whole Foods",
    "transactionDate": "2024-10-09",
    "status": "cleared"
  }'
```

### 3. Upload Receipt with OCR

```bash
# Upload receipt
curl -X POST http://localhost:3000/api/receipts/upload \
  -H "Authorization: Bearer ACCESS_TOKEN" \
  -F "image=@receipt.jpg"

# Response: { transactionId, receiptId, signedUrl }

# Process with OCR
curl -X POST http://localhost:3000/api/receipts/process/RECEIPT_ID \
  -H "Authorization: Bearer ACCESS_TOKEN"

# Check updated transaction
curl http://localhost:3000/api/transactions/TRANSACTION_ID \
  -H "Authorization: Bearer ACCESS_TOKEN"
```

### 4. Register Device for Push Notifications

```bash
curl -X POST http://localhost:3000/api/users/register-device \
  -H "Authorization: Bearer ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fcmToken": "device_fcm_token",
    "platform": "ios"
  }'
```

---

## 🔧 Configuration

### Environment Variables

**Required:**
```bash
DATABASE_URL=postgresql://user:pass@localhost:5432/budget_tracker
JWT_SECRET=min-32-characters-secret-key
PORT=3000
NODE_ENV=development
```

**Social Authentication (at least one):**
```bash
GOOGLE_WEB_CLIENT_ID=...
APPLE_BUNDLE_ID=...
FACEBOOK_APP_ID=...
FACEBOOK_APP_SECRET=...
```

**Receipt Processing (optional):**
```bash
GCS_BUCKET_NAME=your-bucket
GCS_PROJECT_ID=your-project
GCS_KEY_FILE=/path/to/key.json
VERYFI_CLIENT_ID=...
VERYFI_CLIENT_SECRET=...
VERYFI_USERNAME=...
VERYFI_API_KEY=...
```

**Push Notifications (optional):**
```bash
FIREBASE_ADMIN_JSON_BASE64=base64_encoded_service_account
```

---

## 📚 Documentation

Detailed documentation for each module:

- **[AUTH_IMPLEMENTATION.md](./AUTH_IMPLEMENTATION.md)** - Authentication system
- **[TRANSACTION_API.md](./TRANSACTION_API.md)** - Transaction management
- **[RECEIPT_API.md](./RECEIPT_API.md)** - Receipt upload and storage
- **[OCR_PROCESSING.md](./OCR_PROCESSING.md)** - Receipt OCR with Veryfi
- **[PUSH_NOTIFICATIONS.md](./PUSH_NOTIFICATIONS.md)** - Push notifications
- **[README.md](./README.md)** - Server setup and deployment

---

## 🛡️ Security Features

✅ **Authentication**
- Multi-provider OAuth (Google, Apple, Facebook)
- JWT access tokens (15 min)
- Refresh token rotation (30 days)
- HTTP-only cookies (XSS protection)

✅ **Authorization**
- User isolation (can only access own data)
- Token-based access control
- Route-level authentication

✅ **Input Validation**
- Zod schemas for all inputs
- Type-safe validation
- Detailed error messages

✅ **Infrastructure**
- Helmet security headers
- CORS with credentials
- Rate limiting (100 req/15min)
- SQL injection protection (Prisma)

✅ **File Security**
- Private GCS storage
- Signed URLs (time-limited)
- File type validation
- Size limits (10MB)

---

## 📈 Performance

### Optimizations

- Composite database indexes
- Parallel query execution
- Connection pooling (Prisma)
- In-memory file processing
- Efficient pagination

### Caching Strategies (Future)

- Redis for session storage
- CDN for static assets
- Query result caching
- Signed URL caching

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Watch mode
npm test -- --watch

# With UI
npm run test:ui

# Coverage
npm run test:coverage

# Type check
npm run typecheck

# Lint
npm run lint
```

---

## 🚢 Deployment

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Configure strong `JWT_SECRET` (32+ chars)
- [ ] Set up PostgreSQL database
- [ ] Run database migrations
- [ ] Configure social OAuth providers
- [ ] Set up Google Cloud Storage (if using receipts)
- [ ] Configure Veryfi (if using OCR)
- [ ] Set up Firebase Admin (if using push)
- [ ] Configure CORS origin
- [ ] Enable HTTPS
- [ ] Set up monitoring/logging
- [ ] Configure backups
- [ ] Set up CI/CD pipeline

### Deploy Commands

```bash
# Install dependencies
npm ci --production=false

# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate:prod

# Build
npm run build

# Start
NODE_ENV=production npm start
```

---

## 📊 Monitoring

### Health Check

```bash
curl http://localhost:3000/health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-10-09T10:30:00.000Z",
  "uptime": 3600,
  "environment": "production",
  "database": "connected"
}
```

### Logs

Structured JSON logging with Pino:

```bash
# View logs
tail -f logs/app.log

# Search for errors
grep '"level":"error"' logs/app.log

# Monitor specific user
grep '"userId":"uuid"' logs/app.log
```

---

## 🔄 Background Jobs

### OCR Worker

Processes pending receipts every 5 minutes:

```typescript
// Automatically runs if enabled
import { startOCRWorker } from './workers/ocrWorker';
startOCRWorker();
```

### Token Cleanup

Clean expired refresh tokens (add to cron):

```typescript
import cron from 'node-cron';
import { cleanupExpiredTokens } from './services/tokenService';

cron.schedule('0 2 * * *', async () => {
  await cleanupExpiredTokens();
});
```

---

## 🎨 Client Integration Examples

### React Native App

```typescript
// 1. Login
const login = async (googleToken) => {
  const response = await fetch('/api/auth/social-login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ provider: 'google', token: googleToken }),
  });
  const { user, accessToken } = await response.json();
  // Store accessToken
};

// 2. Register device
const registerDevice = async (fcmToken) => {
  await fetch('/api/users/register-device', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      fcmToken,
      platform: Platform.OS === 'ios' ? 'ios' : 'android',
    }),
  });
};

// 3. Upload receipt
const uploadReceipt = async (imageUri) => {
  const formData = new FormData();
  formData.append('image', {
    uri: imageUri,
    type: 'image/jpeg',
    name: 'receipt.jpg',
  });

  const response = await fetch('/api/receipts/upload', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${accessToken}` },
    body: formData,
  });
  
  return response.json();
};

// 4. Get transactions
const getTransactions = async (filters) => {
  const params = new URLSearchParams(filters);
  const response = await fetch(`/api/transactions?${params}`, {
    headers: { 'Authorization': `Bearer ${accessToken}` },
  });
  
  return response.json();
};
```

---

## 🗂️ Project Structure

```
server/
├── src/
│   ├── config/               # Environment validation
│   │   └── index.ts
│   ├── db/                   # Database client
│   │   └── client.ts
│   ├── models/               # Validation schemas
│   │   ├── transactionSchema.ts
│   │   └── deviceSchema.ts
│   ├── services/             # Business logic
│   │   ├── tokenService.ts
│   │   ├── socialVerify.ts
│   │   ├── transactionService.ts
│   │   ├── receiptService.ts
│   │   ├── ocrService.ts
│   │   ├── push.ts
│   │   └── notificationService.ts
│   ├── controllers/          # Request handlers
│   │   ├── authController.ts
│   │   ├── transactionController.ts
│   │   ├── receiptController.ts
│   │   └── userController.ts
│   ├── routes/               # Route definitions
│   │   ├── authRoutes.ts
│   │   ├── transactionRoutes.ts
│   │   ├── receiptRoutes.ts
│   │   └── userRoutes.ts
│   ├── middleware/           # Custom middleware
│   │   └── auth.ts
│   ├── lib/                  # Utilities
│   │   ├── logger.ts
│   │   └── gcsStorage.ts
│   ├── workers/              # Background jobs
│   │   └── ocrWorker.ts
│   └── index.ts              # Main entry point
├── prisma/
│   ├── schema.prisma         # Database schema
│   └── seed.ts              # Seed data
├── test/                     # Tests
└── dist/                     # Compiled output
```

---

## 📦 Technology Stack

### Core
- **Node.js 20** - Runtime
- **TypeScript 5.9** - Language
- **Express 5** - Web framework

### Database
- **PostgreSQL** - Primary database
- **Prisma 6** - ORM and migrations

### Authentication
- **jsonwebtoken** - JWT tokens
- **google-auth-library** - Google OAuth
- **apple-signin-auth** - Apple Sign In
- **axios** - Facebook API calls

### File Storage
- **@google-cloud/storage** - GCS integration
- **multer** - File uploads

### OCR
- **@veryfi/veryfi-sdk** - Receipt processing

### Push Notifications
- **firebase-admin** - FCM integration

### Utilities
- **zod** - Schema validation
- **pino** - Structured logging
- **helmet** - Security headers
- **cors** - CORS handling
- **bcryptjs** - Password hashing
- **uuid** - UUID generation
- **node-cron** - Job scheduling

### Development
- **vitest** - Testing
- **supertest** - API testing
- **eslint** - Linting
- **prettier** - Formatting
- **tsx** - TypeScript execution

---

## 🎯 Feature Checklist

### ✅ Implemented

- [x] Social authentication (Google, Apple, Facebook)
- [x] JWT token management with refresh rotation
- [x] Transaction CRUD operations
- [x] Transaction filtering and pagination
- [x] Transaction statistics
- [x] Receipt image upload to GCS
- [x] Signed URL generation
- [x] OCR processing with Veryfi
- [x] Batch OCR processing
- [x] Device registration (FCM)
- [x] Push notification service
- [x] Notification helpers
- [x] Comprehensive error handling
- [x] Request validation (Zod)
- [x] Structured logging (Pino)
- [x] Security middleware
- [x] Rate limiting
- [x] Health checks
- [x] Database migrations
- [x] TypeScript type safety
- [x] API documentation

### 🔜 Future Enhancements

- [ ] Scheduled transaction creation
- [ ] Budget management
- [ ] Category management
- [ ] Spending insights/analytics
- [ ] Export to CSV/PDF
- [ ] Multi-currency support
- [ ] Recurring transaction automation
- [ ] Bill payment tracking
- [ ] Webhooks for external integrations
- [ ] GraphQL API (optional)
- [ ] WebSocket for real-time updates

---

## 📖 Additional Resources

### Documentation Files

- `AUTH_IMPLEMENTATION.md` - Auth system details
- `TRANSACTION_API.md` - Transaction endpoints
- `RECEIPT_API.md` - Receipt upload
- `OCR_PROCESSING.md` - OCR integration
- `PUSH_NOTIFICATIONS.md` - Push notifications
- `README.md` - General server docs

### External Docs

- [Prisma Documentation](https://www.prisma.io/docs)
- [Express.js Guide](https://expressjs.com/)
- [Veryfi API Docs](https://docs.veryfi.com/)
- [Firebase Admin Docs](https://firebase.google.com/docs/admin/setup)
- [Google Cloud Storage](https://cloud.google.com/storage/docs)

---

## 🆘 Support

### Common Issues

**Database Connection Failed:**
```bash
# Check PostgreSQL is running
pg_isready

# Verify DATABASE_URL
echo $DATABASE_URL
```

**Authentication Errors:**
```bash
# Check JWT_SECRET is set (32+ chars)
# Verify social provider credentials
# Check token expiration
```

**Receipt Upload Fails:**
```bash
# Verify GCS credentials
# Check bucket exists and is accessible
# Review service account permissions
```

**Push Notifications Not Working:**
```bash
# Verify Firebase credentials
# Check device registration
# Test with Firebase Console
```

---

## 📊 API Status

✅ **Production Ready**

All core features implemented and tested. Ready for deployment with proper configuration.

**Coverage:**
- Authentication: ✅ Complete
- Transactions: ✅ Complete
- Receipts: ✅ Complete
- OCR: ✅ Complete
- Push Notifications: ✅ Complete
- Error Handling: ✅ Complete
- Documentation: ✅ Complete

---

**Last Updated**: 2024-10-09  
**API Version**: 1.0.0  
**Node.js**: 20+  
**TypeScript**: 5.9+


