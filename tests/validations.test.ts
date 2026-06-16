/**
 * Example Validation Test
 * Testing Zod schemas
 */

import { describe, it, expect } from 'vitest';
import {
  createProductSchema,
  updateProductSchema,
  registerUserSchema,
  loginUserSchema,
  productFiltersSchema,
} from './../lib/validations';

describe('Validation Schemas', () => {
  describe('createProductSchema', () => {
    it('should validate valid product data', () => {
      const data = {
        product_name: 'Test Product',
        ph_level: 7.5,
        tds: 150,
      };
      const result = createProductSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should reject empty product name', () => {
      const data = {
        product_name: '',
      };
      const result = createProductSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject invalid pH level', () => {
      const data = {
        product_name: 'Test Product',
        ph_level: 15,
      };
      const result = createProductSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe('registerUserSchema', () => {
    it('should validate valid registration data', () => {
      const data = {
        email: 'test@example.com',
        password: 'Secure123!',
        name: 'Test User',
      };
      const result = registerUserSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should reject weak password', () => {
      const data = {
        email: 'test@example.com',
        password: '123',
      };
      const result = registerUserSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject invalid email', () => {
      const data = {
        email: 'not-an-email',
        password: 'Secure123!',
      };
      const result = registerUserSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe('productFiltersSchema', () => {
    it('should parse query parameters', () => {
      const params = {
        q: 'test',
        minPh: '6.5',
        maxPh: '8.5',
        limit: '25',
      };
      const result = productFiltersSchema.safeParse(params);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.minPh).toBe(6.5);
        expect(result.data.maxPh).toBe(8.5);
        expect(result.data.limit).toBe(25);
      }
    });
  });
});
