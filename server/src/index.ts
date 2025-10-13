import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { config } from './config';
import { logger } from './lib/logger';
import { connectDatabase, disconnectDatabase } from './db/client';
import { centralizedErrorHandler, attachRequestId } from './middleware/errorHandler';

// Import routes
import authRoutes from './routes/authRoutes';
import transactionRoutes from './routes/transactionRoutes';
import receiptRoutes from './routes/receiptRoutes';
import userRoutes from './routes/userRoutes';
import jobsRoutes from './routes/jobsRoutes';
import reportsRoutes from './routes/reportsRoutes';

const app = express();

// Trust proxy (required for Cloud Run)
app.set('trust proxy', true);

// Attach request ID to all requests (for tracking)
app.use(attachRequestId);

// Security middleware
app.use(helmet());

// CORS configuration with allowlist
const getCorsOrigin = () => {
  if (config.NODE_ENV === 'development') {
    return true; // Allow all in development
  }

  // Production: use allowlist
  if (config.CORS_ALLOWED_ORIGINS) {
    const allowedOrigins = config.CORS_ALLOWED_ORIGINS.split(',').map((origin) => origin.trim());
    return (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        logger.warn({ origin, ip: origin }, 'CORS request from unauthorized origin');
        callback(new Error('Not allowed by CORS'));
      }
    };
  }

  // Fallback to single origin
  return config.CORS_ORIGIN || false;
};

app.use(
  cors({
    origin: getCorsOrigin(),
    credentials: true, // Allow cookies
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Disposition'],
    maxAge: 86400, // 24 hours
  })
);

// Cookie parser
app.use(cookieParser());

// Global rate limiting (general protection)
const globalLimiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW_MS,
  max: config.RATE_LIMIT_MAX_REQUESTS,
  message: { error: 'Too Many Requests', message: 'Too many requests from this IP, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  validate: { trustProxy: false }, // Disable validation warnings for Cloud Run
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/health' || req.path === '/';
  },
});
app.use('/api/', globalLimiter);

// Strict rate limiting for authentication endpoints (prevent brute force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per 15 minutes (increased for testing)
  message: { error: 'Too Many Requests', message: 'Too many authentication attempts. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  validate: { trustProxy: false }, // Disable validation warnings for Cloud Run
  skipSuccessfulRequests: true, // Only count failed attempts
});
app.use('/api/auth/social-login', authLimiter);
app.use('/api/auth/refresh', authLimiter);

// Rate limiting for receipt uploads (prevent storage abuse)
const receiptUploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // 50 uploads per hour
  message: { error: 'Too Many Requests', message: 'Upload limit exceeded. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  validate: { trustProxy: false }, // Disable validation warnings for Cloud Run
});
app.use('/api/receipts/upload', receiptUploadLimiter);
app.use('/api/receipts/process', receiptUploadLimiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware (sanitized - no PII)
app.use((req: Request, _res: Response, next: NextFunction) => {
  logger.info(
    {
      requestId: req.requestId,
      method: req.method,
      path: req.path,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    },
    'Incoming request'
  );
  next();
});

// Health check endpoint
// Fast health check for Docker HEALTHCHECK and Cloud Run
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).send('ok');
});

// Detailed health check (with database)
app.get('/health/detailed', async (_req: Request, res: Response) => {
  try {
    // Check database connection
    await connectDatabase();
    
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: config.NODE_ENV,
      database: 'connected',
    });
  } catch (error) {
    logger.error({ error }, 'Health check failed');
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Root endpoint
app.get('/', (_req: Request, res: Response) => {
  res.json({
    message: 'Budget Tracker API',
    version: '1.0.0',
    status: 'active',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      transactions: '/api/transactions',
      receipts: '/api/receipts',
      users: '/api/users',
      reports: '/api/reports',
      jobs: '/jobs (cron-protected)',
    },
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/receipts', receiptRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reports', reportsRoutes);

// Job routes (protected by cron secret)
app.use('/jobs', jobsRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested resource was not found',
    timestamp: new Date().toISOString(),
    requestId: req.requestId,
  });
});

// Centralized error handler (MUST be last)
app.use(centralizedErrorHandler);

/**
 * Start the server and connect to database
 */
async function startServer() {
  try {
    // Connect to database (fail fast if connection fails)
    await connectDatabase();

    // Start HTTP server
    // Start server (listen on 0.0.0.0 for Cloud Run compatibility)
    const port = process.env.PORT || '3000';
    const server = app.listen(Number(port), '0.0.0.0', () => {
      logger.info(`🚀 Server running on port ${port}`);
      logger.info(`📝 Environment: ${config.NODE_ENV}`);
      logger.info(`🔗 Health check: http://localhost:${port}/health`);
    });

    // Graceful shutdown handlers
    const gracefulShutdown = async (signal: string) => {
      logger.info(`${signal} received, starting graceful shutdown...`);
      
      server.close(async () => {
        logger.info('HTTP server closed');
        
        // Disconnect from database
        await disconnectDatabase();
        
        logger.info('Graceful shutdown completed');
        process.exit(0);
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    logger.error({ error }, '❌ Failed to start server');
    process.exit(1);
  }
}

// Start the server
startServer();

export { app };

