import request from 'supertest';
import app from '../server';
import { storage } from '../storage';

describe('Transactions API', () => {
  let categoryId: string;

  beforeAll(async () => {
    // Get a category ID for testing
    const categories = storage.getCategories();
    categoryId = categories[0].id;
  });

  describe('POST /transactions', () => {
    it('should create a transaction with valid data', async () => {
      const response = await request(app)
        .post('/transactions')
        .send({
          amount: '100.50',
          description: 'Test transaction',
          categoryId,
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.amount).toBe('100.5');
      expect(response.body.description).toBe('Test transaction');
      expect(response.body.categoryId).toBe(categoryId);
    });

    it('should handle decimal amounts correctly', async () => {
      const response = await request(app)
        .post('/transactions')
        .send({
          amount: '0.01',
          description: 'Penny transaction',
          categoryId,
        });

      expect(response.status).toBe(201);
      expect(response.body.amount).toBe('0.01');
    });

    it('should reject invalid amount', async () => {
      const response = await request(app)
        .post('/transactions')
        .send({
          amount: 'invalid',
          description: 'Test',
          categoryId,
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
    });

    it('should reject missing required fields', async () => {
      const response = await request(app)
        .post('/transactions')
        .send({
          amount: '100',
        });

      expect(response.status).toBe(400);
    });

    it('should reject invalid category ID', async () => {
      const response = await request(app)
        .post('/transactions')
        .send({
          amount: '100',
          description: 'Test',
          categoryId: '550e8400-e29b-41d4-a716-446655440000',
        });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Category not found');
    });

    it('should accept custom date', async () => {
      const customDate = '2025-10-01T12:00:00Z';
      const response = await request(app)
        .post('/transactions')
        .send({
          amount: '50',
          description: 'Past transaction',
          categoryId,
          date: customDate,
        });

      expect(response.status).toBe(201);
      expect(new Date(response.body.date).toISOString()).toBe(new Date(customDate).toISOString());
    });
  });

  describe('GET /transactions', () => {
    beforeEach(async () => {
      // Create some test transactions
      await request(app).post('/transactions').send({
        amount: '100',
        description: 'Transaction 1',
        categoryId,
        date: '2025-10-01T10:00:00Z',
      });
      await request(app).post('/transactions').send({
        amount: '200',
        description: 'Transaction 2',
        categoryId,
        date: '2025-10-05T10:00:00Z',
      });
      await request(app).post('/transactions').send({
        amount: '300',
        description: 'Transaction 3',
        categoryId,
        date: '2025-10-09T10:00:00Z',
      });
    });

    it('should get all transactions', async () => {
      const response = await request(app).get('/transactions');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('pagination');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should filter by date range', async () => {
      const response = await request(app)
        .get('/transactions')
        .query({
          from: '2025-10-04T00:00:00Z',
          to: '2025-10-08T23:59:59Z',
        });

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeGreaterThan(0);
      // Should only include Transaction 2
      const dates = response.body.data.map((t: any) => new Date(t.date));
      dates.forEach((date: Date) => {
        expect(date >= new Date('2025-10-04T00:00:00Z')).toBe(true);
        expect(date <= new Date('2025-10-08T23:59:59Z')).toBe(true);
      });
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/transactions')
        .query({
          page: '1',
          pageSize: '2',
        });

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeLessThanOrEqual(2);
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.pageSize).toBe(2);
    });

    it('should return sorted by date descending', async () => {
      const response = await request(app).get('/transactions');

      expect(response.status).toBe(200);
      const dates = response.body.data.map((t: any) => new Date(t.date).getTime());
      for (let i = 1; i < dates.length; i++) {
        expect(dates[i - 1]).toBeGreaterThanOrEqual(dates[i]);
      }
    });
  });

  describe('PATCH /transactions/:id', () => {
    let transactionId: string;

    beforeEach(async () => {
      const response = await request(app).post('/transactions').send({
        amount: '100',
        description: 'Original',
        categoryId,
      });
      transactionId = response.body.id;
    });

    it('should update transaction amount', async () => {
      const response = await request(app)
        .patch(`/transactions/${transactionId}`)
        .send({
          amount: '150.50',
        });

      expect(response.status).toBe(200);
      expect(response.body.amount).toBe('150.5');
      expect(response.body.description).toBe('Original');
    });

    it('should update transaction description', async () => {
      const response = await request(app)
        .patch(`/transactions/${transactionId}`)
        .send({
          description: 'Updated description',
        });

      expect(response.status).toBe(200);
      expect(response.body.description).toBe('Updated description');
    });

    it('should update multiple fields', async () => {
      const response = await request(app)
        .patch(`/transactions/${transactionId}`)
        .send({
          amount: '200',
          description: 'Updated',
        });

      expect(response.status).toBe(200);
      expect(response.body.amount).toBe('200');
      expect(response.body.description).toBe('Updated');
    });

    it('should reject empty update', async () => {
      const response = await request(app)
        .patch(`/transactions/${transactionId}`)
        .send({});

      expect(response.status).toBe(400);
    });

    it('should return 404 for non-existent transaction', async () => {
      const response = await request(app)
        .patch('/transactions/550e8400-e29b-41d4-a716-446655440000')
        .send({
          amount: '100',
        });

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /transactions/:id', () => {
    let transactionId: string;

    beforeEach(async () => {
      const response = await request(app).post('/transactions').send({
        amount: '100',
        description: 'To be deleted',
        categoryId,
      });
      transactionId = response.body.id;
    });

    it('should delete transaction', async () => {
      const response = await request(app).delete(`/transactions/${transactionId}`);

      expect(response.status).toBe(204);

      // Verify it's deleted
      const getResponse = await request(app).get('/transactions');
      const found = getResponse.body.data.find((t: any) => t.id === transactionId);
      expect(found).toBeUndefined();
    });

    it('should return 404 for non-existent transaction', async () => {
      const response = await request(app).delete(
        '/transactions/550e8400-e29b-41d4-a716-446655440000'
      );

      expect(response.status).toBe(404);
    });
  });
});