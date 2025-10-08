import { Router } from 'express';
import { z } from 'zod';
import { createPresignedPost } from '../services/storage.js';

export const router = Router();

const PresignRequest = z.object({
  contentType: z.string().min(1),
  extension: z.enum(['jpg', 'jpeg', 'png', 'heic', 'pdf'])
});

router.post('/presign', (req, res) => {
  const parsed = PresignRequest.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const result = createPresignedPost(parsed.data);
  return res.json(result);
});
