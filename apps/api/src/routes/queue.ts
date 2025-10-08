import { Router } from 'express';

export const router = Router();

router.get('/health', async (_req, res) => {
  return res.json({ ok: true });
});
