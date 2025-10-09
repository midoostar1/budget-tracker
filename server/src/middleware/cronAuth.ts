import { Request, Response, NextFunction } from 'express';
import { config } from '../config';
import { logger } from '../lib/logger';

/**
 * Middleware to verify cron job requests
 * Protects endpoints that should only be called by Cloud Scheduler or other trusted cron services
 */
export function verifyCronSecret(req: Request, res: Response, next: NextFunction): void {
  try {
    // Check if CRON_SECRET is configured
    if (!config.CRON_SECRET) {
      logger.error('CRON_SECRET not configured but cron endpoint was called');
      res.status(503).json({
        error: 'Service Unavailable',
        message: 'Cron jobs are not configured',
      });
      return;
    }

    // Get secret from header
    const cronSecret = req.headers['x-cron-secret'] as string;

    if (!cronSecret) {
      logger.warn({ ip: req.ip, path: req.path }, 'Cron endpoint called without secret');
      res.status(401).json({
        error: 'Unauthorized',
        message: 'x-cron-secret header is required',
      });
      return;
    }

    // Verify secret matches
    if (cronSecret !== config.CRON_SECRET) {
      logger.warn(
        { ip: req.ip, path: req.path },
        'Cron endpoint called with invalid secret'
      );
      res.status(403).json({
        error: 'Forbidden',
        message: 'Invalid cron secret',
      });
      return;
    }

    // Secret is valid, proceed
    logger.debug({ path: req.path }, 'Cron request authenticated');
    next();
  } catch (error) {
    logger.error({ error }, 'Cron authentication error');
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Authentication failed',
    });
  }
}


