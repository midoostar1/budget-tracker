import { Router } from 'express';
import { z } from 'zod';
import crypto from 'node:crypto';
import type { Request } from 'express';

export const router = Router();

const VeryfiEvent = z.object({
  event: z.string(),
  data: z.record(z.any())
});

function isValidVeryfiSignature(req: Request): boolean {
  const secret = process.env.VERYFI_WEBHOOK_SECRET || '';
  const rawBody: Buffer | undefined = (req as any).rawBody;
  if (!rawBody || !secret) return false;
  const provided = req.header('x-veryfi-signature') || req.header('veryfi-webhook-signature') || '';
  const hmac = crypto.createHmac('sha256', secret).update(rawBody).digest();
  const expectedHex = hmac.toString('hex');
  const expectedB64 = hmac.toString('base64');
  try {
    const p = Buffer.from(provided, 'utf8');
    // compare against hex or base64 encodings
    const matchHex = crypto.timingSafeEqual(Buffer.from(expectedHex, 'utf8'), p);
    const matchB64 = crypto.timingSafeEqual(Buffer.from(expectedB64, 'utf8'), p);
    return matchHex || matchB64;
  } catch {
    return false;
  }
}

router.post('/veryfi', (req, res) => {
  if (!isValidVeryfiSignature(req)) return res.status(401).json({ error: 'Invalid signature' });
  const parsed = VeryfiEvent.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  // enqueue processing here in the future
  return res.status(202).json({ received: true });
});
