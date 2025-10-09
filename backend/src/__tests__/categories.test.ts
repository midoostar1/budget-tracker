import request from 'supertest';
import app from '../server';

describe('Categories API', () => {
  describe('GET /categories', () => {
    it('should get all categories', async () => {
      const response = await request(app).get('/categories');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      
      // Check category structure
      const category = response.body[0];
      expect(category).toHaveProperty('id');
      expect(category).toHaveProperty('name');
      expect(category).toHaveProperty('color');
      expect(category).toHaveProperty('createdAt');
    });

    it('should return categories sorted by name', async () => {
      const response = await request(app).get('/categories');

      const names = response.body.map((c: any) => c.name);
      const sortedNames = [...names].sort();
      expect(names).toEqual(sortedNames);
    });
  });

  describe('POST /categories', () => {
    it('should create a category with valid data', async () => {
      const response = await request(app)
        .post('/categories')
        .send({
          name: 'Test Category',
          color: '#FF5733',
          icon: '🧪',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe('Test Category');
      expect(response.body.color).toBe('#FF5733');
      expect(response.body.icon).toBe('🧪');
    });

    it('should create a category without icon', async () => {
      const response = await request(app)
        .post('/categories')
        .send({
          name: 'No Icon Category',
          color: '#00FF00',
        });

      expect(response.status).toBe(201);
      expect(response.body.name).toBe('No Icon Category');
      expect(response.body.icon).toBeUndefined();
    });

    it('should reject invalid color format', async () => {
      const response = await request(app)
        .post('/categories')
        .send({
          name: 'Bad Color',
          color: 'red',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
    });

    it('should reject missing required fields', async () => {
      const response = await request(app)
        .post('/categories')
        .send({
          name: 'Missing Color',
        });

      expect(response.status).toBe(400);
    });

    it('should accept uppercase hex colors', async () => {
      const response = await request(app)
        .post('/categories')
        .send({
          name: 'Uppercase Color',
          color: '#AABBCC',
        });

      expect(response.status).toBe(201);
      expect(response.body.color).toBe('#AABBCC');
    });

    it('should accept lowercase hex colors', async () => {
      const response = await request(app)
        .post('/categories')
        .send({
          name: 'Lowercase Color',
          color: '#aabbcc',
        });

      expect(response.status).toBe(201);
      expect(response.body.color).toBe('#aabbcc');
    });

    it('should reject invalid hex colors', async () => {
      const invalidColors = ['#GGG', '#12345', '#1234567', 'FF5733', '#FF57'];
      
      for (const color of invalidColors) {
        const response = await request(app)
          .post('/categories')
          .send({
            name: 'Invalid Color',
            color,
          });

        expect(response.status).toBe(400);
      }
    });
  });
});