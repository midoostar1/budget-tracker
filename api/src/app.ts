import { OpenAPIHono } from '@hono/zod-openapi';
import { swaggerUI } from '@hono/swagger-ui';
import { categories } from './routes/categories.js';
import { transactions } from './routes/transactions.js';

export const app = new OpenAPIHono();

app.doc('/openapi.json', {
  openapi: '3.1.0',
  info: {
    title: 'Transaction Management API',
    version: '0.1.0'
  }
});

app.get('/docs', swaggerUI({ url: '/openapi.json' }));

app.route('/', categories);
app.route('/', transactions);
