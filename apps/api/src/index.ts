import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { z } from 'zod';
import { extendZodWithOpenApi, generateOpenApiDocument } from 'zod-to-openapi';
import { env } from './env.js';
import { router as apiRouter } from './routes/index.js';
import { startWorkers } from './queue/index.js';
import { scheduleNightlyReminders } from './queue/cron.js';

extendZodWithOpenApi(z);
const app = express();

app.use(helmet({
  contentSecurityPolicy: false
}));

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const allowed = process.env.APP_BASE_URL?.split(',').map((s) => s.trim()) ?? [];
    if (allowed.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

app.use(express.json({
  limit: '2mb',
  verify: (_req, _res, buf) => {
    ( _req as any).rawBody = buf;
  }
}));
app.use(morgan('combined'));

app.get('/health', (_req, res) => res.json({ ok: true }));

// OpenAPI via zod-to-openapi minimal example
const PingSchema = z.object({ pong: z.string() }).openapi('Ping');
const openApiDoc = generateOpenApiDocument([PingSchema], {
  title: 'Finance API',
  version: '0.1.0',
});

app.get('/docs', (_req, res) => {
  res.type('application/json').send(openApiDoc);
});

app.use('/v1', apiRouter);

const port = env.PORT;
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`API running on :${port}`);
});

// start background workers (BullMQ)
startWorkers();
scheduleNightlyReminders().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Failed to schedule reminders', err);
});
