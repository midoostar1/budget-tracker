import { Router } from 'express';
import { router as receiptsRouter } from './receipts.js';
import { router as webhooksRouter } from './webhooks.js';
import { router as queueRouter } from './queue.js';
import { firebaseAuthMiddleware } from '../middleware/auth.js';

export const router = Router();

router.use('/receipts', firebaseAuthMiddleware(), receiptsRouter);
router.use('/webhooks', webhooksRouter);
router.use('/queue', queueRouter);
