import { beforeAll, afterAll } from 'vitest';
import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

beforeAll(async () => {
  // Setup code before all tests
  // e.g., connect to test database, seed data, etc.
});

afterAll(async () => {
  // Cleanup code after all tests
  // e.g., disconnect from test database, clean up resources, etc.
});


