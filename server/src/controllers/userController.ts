import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../db/client';
import { logger } from '../lib/logger';
import { RegisterDeviceSchema } from '../models/deviceSchema';
import { getUserUsageStats } from '../services/usageService';

/**
 * POST /api/users/register-device
 * Register or update a device for push notifications
 */
export async function registerDevice(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
      return;
    }

    // Validate request body
    const validatedData = RegisterDeviceSchema.parse(req.body);

    // Upsert device (create or update)
    const device = await prisma.device.upsert({
      where: {
        fcmToken: validatedData.fcmToken,
      },
      update: {
        platform: validatedData.platform,
        // User ID stays the same if it exists
      },
      create: {
        userId: req.user.userId,
        fcmToken: validatedData.fcmToken,
        platform: validatedData.platform,
      },
    });

    logger.info(
      {
        userId: req.user.userId,
        deviceId: device.id,
        platform: device.platform,
      },
      'Device registered'
    );

    res.status(200).json({
      device: {
        id: device.id,
        platform: device.platform,
        createdAt: device.createdAt,
      },
      message: 'Device registered successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        error: 'Validation Error',
        message: 'Invalid device data',
        details: error.issues,
      });
      return;
    }

    logger.error({ error }, 'Register device error');
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to register device',
    });
  }
}

/**
 * GET /api/users/devices
 * Get all devices for the authenticated user
 */
export async function getUserDevices(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
      return;
    }

    const devices = await prisma.device.findMany({
      where: {
        userId: req.user.userId,
      },
      select: {
        id: true,
        platform: true,
        createdAt: true,
        // Don't expose the full FCM token
        fcmToken: false,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.status(200).json({ devices });
  } catch (error) {
    logger.error({ error }, 'Get user devices error');
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch devices',
    });
  }
}

/**
 * DELETE /api/users/devices/:id
 * Unregister a device
 */
export async function unregisterDevice(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
      return;
    }

    const { id } = req.params;

    // Delete device only if it belongs to the user
    const result = await prisma.device.deleteMany({
      where: {
        id,
        userId: req.user.userId,
      },
    });

    if (result.count === 0) {
      res.status(404).json({
        error: 'Not Found',
        message: 'Device not found',
      });
      return;
    }

    logger.info({ userId: req.user.userId, deviceId: id }, 'Device unregistered');

    res.status(200).json({
      message: 'Device unregistered successfully',
    });
  } catch (error) {
    logger.error({ error }, 'Unregister device error');
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to unregister device',
    });
  }
}

/**
 * GET /api/users/subscription
 * Get user's subscription tier and usage statistics
 */
export async function getSubscription(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
      return;
    }

    const stats = await getUserUsageStats(req.user.userId);

    res.status(200).json({
      subscription: stats,
    });
  } catch (error) {
    logger.error({ error, userId: req.user?.userId }, 'Get subscription error');
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch subscription information',
    });
  }
}


