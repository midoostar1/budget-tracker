# Budget Tracker API Server

A production-ready Node.js 20 REST API server built with TypeScript, Express, Prisma, and PostgreSQL.

## 🏗️ Architecture

```
server/
├── src/
│   ├── config/         # Configuration and environment validation
│   ├── db/             # Database client and connection management
│   ├── models/         # Business data models
│   ├── routes/         # API route definitions
│   ├── controllers/    # Request handlers
│   ├── services/       # Business logic layer
│   ├── middleware/     # Custom middleware (auth, validation, etc.)
│   ├── lib/            # Shared utilities and helpers
│   ├── workers/        # Background jobs and scheduled tasks
│   └── index.ts        # Application entry point
├── test/               # Test files
├── prisma/             # Database schema and migrations
└── dist/               # Compiled TypeScript output
```

## 🚀 Quick Start

### Prerequisites

- Node.js >= 20.0.0
- PostgreSQL >= 13
- npm >= 9.0.0

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Configure database:**
   - Update `DATABASE_URL` in `.env` with your PostgreSQL connection string
   - Update `JWT_SECRET` with a secure random string (min 32 characters)

4. **Generate Prisma Client:**
   ```bash
   npm run prisma:generate
   ```

5. **Run database migrations:**
   ```bash
   npm run prisma:migrate
   ```

### Development

```bash
# Start development server with hot reload
npm run dev

# The server will be available at http://localhost:3000
```

### Production

```bash
# Build the application
npm run build

# Run production server
npm start
```

## 📝 Available Scripts

### Development
- `npm run dev` - Start development server with hot reload
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Start production server

### Testing
- `npm test` - Run tests with Vitest
- `npm run test:ui` - Open Vitest UI
- `npm run test:coverage` - Generate test coverage report

### Code Quality
- `npm run lint` - Lint code with ESLint
- `npm run lint:fix` - Fix linting errors automatically
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run typecheck` - Type check without emitting

### Database
- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:migrate` - Run migrations in development
- `npm run prisma:migrate:prod` - Deploy migrations to production
- `npm run prisma:studio` - Open Prisma Studio (database GUI)
- `npm run prisma:seed` - Seed database with initial data
- `npm run db:push` - Push schema changes to database (no migration)

## 🗄️ Database Schema

### Models

- **User** - User accounts with OAuth provider information
- **Transaction** - Income and expense transactions
- **Receipt** - Receipt images with OCR processing
- **ScheduledTransaction** - Recurring transactions and bills
- **Device** - User devices for push notifications

### Key Features

- UUID primary keys
- Soft deletes with cascading
- Comprehensive indexing for performance
- Enum types for type safety
- JSON support for flexible data (OCR results)
- Decimal precision for financial data

## 🔒 Security Features

- **Helmet** - Secure HTTP headers
- **CORS** - Cross-Origin Resource Sharing configuration
- **Rate Limiting** - Prevent abuse and DoS attacks
- **JWT Authentication** - Secure token-based auth (ready to implement)
- **Input Validation** - Zod schemas for runtime validation
- **Environment Validation** - Fail-fast configuration checks

## 📡 API Endpoints

### Health & Status

- `GET /` - API information
- `GET /health` - Health check (includes database connectivity)

### Future Endpoints (to be implemented)

- `POST /api/auth/login` - User authentication
- `GET /api/transactions` - List transactions
- `POST /api/transactions` - Create transaction
- `POST /api/receipts` - Upload receipt
- `GET /api/scheduled-transactions` - List scheduled transactions

## 🔧 Configuration

All configuration is managed through environment variables. See `.env.example` for all available options.

### Required Variables

- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret for JWT token signing (min 32 chars)

### Optional Variables

- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production)
- `LOG_LEVEL` - Logging level (debug/info/warn/error)
- `GCS_*` - Google Cloud Storage configuration
- `FIREBASE_*` - Firebase Admin SDK configuration
- `RATE_LIMIT_*` - Rate limiting configuration

## 📊 Logging

Structured logging with Pino:
- Pretty printed in development
- JSON format in production
- Request/response logging
- Error tracking with stack traces
- Database query logging (development only)

## 🧪 Testing

Tests are written with Vitest and Supertest:

```bash
# Run all tests
npm test

# Watch mode
npm test -- --watch

# With UI
npm run test:ui

# Coverage report
npm run test:coverage
```

## 🚀 Deployment

### Environment Setup

1. Set `NODE_ENV=production`
2. Configure all required environment variables
3. Set up PostgreSQL database
4. Configure Google Cloud Storage (optional)
5. Configure Firebase Admin SDK (optional)

### Build & Deploy

```bash
# Install dependencies
npm ci --production=false

# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate:prod

# Build application
npm run build

# Start server
npm start
```

### Health Checks

- Endpoint: `GET /health`
- Database connectivity check included
- Use for load balancer health checks

### Graceful Shutdown

The server handles SIGTERM and SIGINT signals:
- Closes HTTP server
- Disconnects from database
- 10-second timeout before forced shutdown

## 🔄 Background Jobs

Jobs are scheduled using node-cron (local) with plans for Cloud Scheduler webhooks in production.

Potential jobs:
- Process pending receipts (OCR)
- Create scheduled transactions
- Send payment reminders
- Clean up expired data

## 📦 Key Dependencies

### Production
- **express** - Web framework
- **prisma** - ORM for PostgreSQL
- **zod** - Schema validation
- **pino** - Structured logging
- **helmet** - Security headers
- **jsonwebtoken** - JWT authentication
- **bcryptjs** - Password hashing
- **firebase-admin** - Push notifications
- **@google-cloud/storage** - File storage
- **node-cron** - Job scheduling

### Development
- **typescript** - Type safety
- **tsx** - TypeScript execution
- **vitest** - Testing framework
- **eslint** - Code linting
- **prettier** - Code formatting

## 📄 License

ISC


# Updated: Mon Oct 13 15:56:55 CDT 2025
