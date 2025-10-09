import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { logger } from '../lib/logger';
import { config } from '../config';

/**
 * Safe error response - sanitizes errors for client
 */
interface SafeErrorResponse {
  error: string;
  message: string;
  details?: any;
  timestamp: string;
  requestId?: string;
}

/**
 * Generate request ID for tracking
 */
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substring(7)}`;
}

/**
 * Attach request ID to request
 */
export function attachRequestId(req: Request, _res: Response, next: NextFunction): void {
  req.requestId = generateRequestId();
  next();
}

/**
 * Create safe error response (never expose sensitive data)
 */
function createSafeError(error: any, requestId?: string): SafeErrorResponse {
  const isDev = config.NODE_ENV === 'development';

  // Zod validation errors
  if (error instanceof ZodError) {
    return {
      error: 'Validation Error',
      message: 'Invalid request data',
      details: error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      })),
      timestamp: new Date().toISOString(),
      requestId,
    };
  }

  // Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // Unique constraint violation
    if (error.code === 'P2002') {
      return {
        error: 'Conflict',
        message: 'Resource already exists',
        timestamp: new Date().toISOString(),
        requestId,
      };
    }

    // Foreign key constraint violation
    if (error.code === 'P2003') {
      return {
        error: 'Bad Request',
        message: 'Invalid reference to related resource',
        timestamp: new Date().toISOString(),
        requestId,
      };
    }

    // Record not found
    if (error.code === 'P2025') {
      return {
        error: 'Not Found',
        message: 'Resource not found',
        timestamp: new Date().toISOString(),
        requestId,
      };
    }

    // Generic Prisma error (don't expose details in production)
    return {
      error: 'Database Error',
      message: isDev ? error.message : 'A database error occurred',
      timestamp: new Date().toISOString(),
      requestId,
    };
  }

  // JWT errors
  if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
    return {
      error: 'Unauthorized',
      message: 'Invalid or expired token',
      timestamp: new Date().toISOString(),
      requestId,
    };
  }

  // Multer file upload errors
  if (error.name === 'MulterError') {
    return {
      error: 'Upload Error',
      message: error.message || 'File upload failed',
      timestamp: new Date().toISOString(),
      requestId,
    };
  }

  // Custom application errors
  if (error instanceof Error) {
    // Check for known error patterns
    if (error.message.includes('not found')) {
      return {
        error: 'Not Found',
        message: 'The requested resource was not found',
        timestamp: new Date().toISOString(),
        requestId,
      };
    }

    if (error.message.includes('access denied') || error.message.includes('unauthorized')) {
      return {
        error: 'Forbidden',
        message: 'You do not have permission to access this resource',
        timestamp: new Date().toISOString(),
        requestId,
      };
    }

    // Generic error
    return {
      error: 'Internal Server Error',
      message: isDev ? error.message : 'An unexpected error occurred',
      timestamp: new Date().toISOString(),
      requestId,
    };
  }

  // Unknown error
  return {
    error: 'Internal Server Error',
    message: 'An unexpected error occurred',
    timestamp: new Date().toISOString(),
    requestId,
  };
}

/**
 * Centralized error handler middleware
 * MUST be last middleware after all routes
 */
export function centralizedErrorHandler(
  error: any,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Generate request ID if not present
  const requestId = req.requestId || generateRequestId();

  // Log error (sanitized - no PII)
  logger.error(
    {
      requestId,
      error: {
        name: error.name,
        message: error.message,
        code: error.code,
        // Don't log stack in production
        ...(config.NODE_ENV === 'development' && { stack: error.stack }),
      },
      request: {
        method: req.method,
        path: req.path,
        // Don't log query params (may contain sensitive data)
        ip: req.ip,
      },
    },
    'Unhandled error'
  );

  // Determine status code
  let statusCode = 500;
  if (error.statusCode) {
    statusCode = error.statusCode;
  } else if (error instanceof ZodError) {
    statusCode = 400;
  } else if (error.name === 'UnauthorizedError') {
    statusCode = 401;
  } else if (error.message?.includes('not found')) {
    statusCode = 404;
  }

  // Send safe error response
  const safeError = createSafeError(error, requestId);
  res.status(statusCode).json(safeError);
}

/**
 * Async error wrapper - catches errors in async route handlers
 */
export function asyncHandler(fn: Function) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// Extend Express Request to include requestId
declare global {
  namespace Express {
    interface Request {
      requestId?: string;
    }
  }
}


