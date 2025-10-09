import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/index';
import { prisma } from '../src/db/client';

describe('Authentication API', () => {
  // Mock tokens (in real tests, you'd need actual provider tokens)
  const mockGoogleToken = 'mock_google_token';

  beforeAll(async () => {
    // Setup: Clean test database
    await prisma.refreshToken.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    // Cleanup
    await prisma.refreshToken.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  describe('POST /api/auth/social-login', () => {
    it('should return 400 if provider is missing', async () => {
      const response = await request(app)
        .post('/api/auth/social-login')
        .send({ token: 'some_token' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 if token is missing', async () => {
      const response = await request(app)
        .post('/api/auth/social-login')
        .send({ provider: 'google' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 for invalid provider', async () => {
      const response = await request(app)
        .post('/api/auth/social-login')
        .send({ provider: 'invalid', token: mockGoogleToken });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Invalid provider');
    });

    // Note: Testing actual social login requires mocking the verification services
    // or using real test tokens from providers
  });

  describe('POST /api/auth/refresh', () => {
    it('should return 401 if refresh token is missing', async () => {
      const response = await request(app).post('/api/auth/refresh');

      expect(response.status).toBe(401);
      expect(response.body.message).toContain('Refresh token not found');
    });

    // Add more tests with actual refresh tokens
  });

  describe('POST /api/auth/logout', () => {
    it('should return 200 even without refresh token', async () => {
      const response = await request(app).post('/api/auth/logout');

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('Logged out successfully');
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return 401 without authentication', async () => {
      const response = await request(app).get('/api/auth/me');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Unauthorized');
    });

    // Add test with valid access token
  });

  describe('POST /api/auth/logout-all', () => {
    it('should return 401 without authentication', async () => {
      const response = await request(app).post('/api/auth/logout-all');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Unauthorized');
    });
  });
});


