import { Decimal } from 'decimal.js';
import {
  createTransactionSchema,
  updateTransactionSchema,
  getTransactionsQuerySchema,
  createCategorySchema,
} from '../validation';

describe('Validation Schemas', () => {
  describe('createTransactionSchema', () => {
    it('should validate correct transaction data', () => {
      const data = {
        amount: '100.50',
        description: 'Test transaction',
        categoryId: '550e8400-e29b-41d4-a716-446655440000',
      };

      const result = createTransactionSchema.parse(data);
      expect(result.amount).toBeInstanceOf(Decimal);
      expect(result.amount.toString()).toBe('100.5');
      expect(result.description).toBe('Test transaction');
    });

    it('should handle negative amounts', () => {
      const data = {
        amount: '-50.25',
        description: 'Refund',
        categoryId: '550e8400-e29b-41d4-a716-446655440000',
      };

      const result = createTransactionSchema.parse(data);
      expect(result.amount.toString()).toBe('-50.25');
    });

    it('should handle very small decimal amounts', () => {
      const data = {
        amount: '0.01',
        description: 'Penny',
        categoryId: '550e8400-e29b-41d4-a716-446655440000',
      };

      const result = createTransactionSchema.parse(data);
      expect(result.amount.toString()).toBe('0.01');
    });

    it('should handle very large amounts', () => {
      const data = {
        amount: '999999999.99',
        description: 'Large amount',
        categoryId: '550e8400-e29b-41d4-a716-446655440000',
      };

      const result = createTransactionSchema.parse(data);
      expect(result.amount.toString()).toBe('999999999.99');
    });

    it('should reject invalid decimal format', () => {
      const data = {
        amount: 'not-a-number',
        description: 'Test',
        categoryId: '550e8400-e29b-41d4-a716-446655440000',
      };

      expect(() => createTransactionSchema.parse(data)).toThrow();
    });

    it('should reject invalid UUID', () => {
      const data = {
        amount: '100',
        description: 'Test',
        categoryId: 'not-a-uuid',
      };

      expect(() => createTransactionSchema.parse(data)).toThrow();
    });

    it('should reject empty description', () => {
      const data = {
        amount: '100',
        description: '',
        categoryId: '550e8400-e29b-41d4-a716-446655440000',
      };

      expect(() => createTransactionSchema.parse(data)).toThrow();
    });
  });

  describe('updateTransactionSchema', () => {
    it('should validate partial updates', () => {
      const data = {
        amount: '150',
      };

      const result = updateTransactionSchema.parse(data);
      expect(result.amount?.toString()).toBe('150');
    });

    it('should reject empty updates', () => {
      expect(() => updateTransactionSchema.parse({})).toThrow();
    });

    it('should allow multiple field updates', () => {
      const data = {
        amount: '200',
        description: 'Updated',
        categoryId: '550e8400-e29b-41d4-a716-446655440000',
      };

      const result = updateTransactionSchema.parse(data);
      expect(result.amount?.toString()).toBe('200');
      expect(result.description).toBe('Updated');
    });
  });

  describe('getTransactionsQuerySchema', () => {
    it('should parse valid query parameters', () => {
      const query = {
        from: '2025-10-01T00:00:00Z',
        to: '2025-10-09T23:59:59Z',
        page: '2',
        pageSize: '50',
      };

      const result = getTransactionsQuerySchema.parse(query);
      expect(result.from).toBe('2025-10-01T00:00:00Z');
      expect(result.to).toBe('2025-10-09T23:59:59Z');
      expect(result.page).toBe(2);
      expect(result.pageSize).toBe(50);
    });

    it('should use default values', () => {
      const result = getTransactionsQuerySchema.parse({});
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(20);
    });

    it('should reject invalid page number', () => {
      const query = {
        page: 'not-a-number',
      };

      expect(() => getTransactionsQuerySchema.parse(query)).toThrow();
    });
  });

  describe('createCategorySchema', () => {
    it('should validate correct category data', () => {
      const data = {
        name: 'Food',
        color: '#FF5733',
        icon: '🍔',
      };

      const result = createCategorySchema.parse(data);
      expect(result.name).toBe('Food');
      expect(result.color).toBe('#FF5733');
      expect(result.icon).toBe('🍔');
    });

    it('should allow category without icon', () => {
      const data = {
        name: 'Transport',
        color: '#00FF00',
      };

      const result = createCategorySchema.parse(data);
      expect(result.name).toBe('Transport');
      expect(result.icon).toBeUndefined();
    });

    it('should reject invalid color format', () => {
      const data = {
        name: 'Test',
        color: 'red',
      };

      expect(() => createCategorySchema.parse(data)).toThrow();
    });

    it('should accept both upper and lowercase hex', () => {
      const dataUpper = {
        name: 'Test',
        color: '#AABBCC',
      };
      const dataLower = {
        name: 'Test',
        color: '#aabbcc',
      };

      expect(() => createCategorySchema.parse(dataUpper)).not.toThrow();
      expect(() => createCategorySchema.parse(dataLower)).not.toThrow();
    });
  });
});