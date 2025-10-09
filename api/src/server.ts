import { serve } from '@hono/node-server';
import { app } from './app.js';

const port = Number(process.env.PORT ?? 3000);

console.log(`API listening on http://localhost:${port}`);
console.log(`OpenAPI JSON at http://localhost:${port}/openapi.json`);
console.log(`Swagger UI at http://localhost:${port}/docs`);

serve({ fetch: app.fetch, port });
