/**
 * Example Unit Test
 * Testing utility functions
 */

import { describe, it, expect } from 'vitest';
import { toCamelCase, toSnakeCase, isValidUUID, buildWhereClause } from './../lib/db';

describe('Database Utilities', () => {
  describe('toCamelCase', () => {
    it('should convert snake_case to camelCase', () => {
      expect(toCamelCase({ user_name: 'John' })).toEqual({ userName: 'John' });
      expect(toCamelCase({ first_name: 'John', last_name: 'Doe' })).toEqual({
        firstName: 'John',
        lastName: 'Doe',
      });
    });

    it('should handle arrays', () => {
      const input = [{ user_name: 'John' }, { user_name: 'Jane' }];
      const result = toCamelCase(input);
      expect(result).toEqual([{ userName: 'John' }, { userName: 'Jane' }]);
    });

    it('should handle nested objects', () => {
      const input = {
        user_info: {
          first_name: 'John',
          last_name: 'Doe',
        },
      };
      expect(toCamelCase(input)).toEqual({
        userInfo: {
          firstName: 'John',
          lastName: 'Doe',
        },
      });
    });
  });

  describe('toSnakeCase', () => {
    it('should convert camelCase to snake_case', () => {
      expect(toSnakeCase('userName')).toBe('user_name');
      expect(toSnakeCase('firstNameLastName')).toBe('first_name_last_name');
    });

    it('should handle PascalCase', () => {
      expect(toSnakeCase('UserName')).toBe('_user_name');
    });
  });

  describe('isValidUUID', () => {
    it('should validate UUID v4 format', () => {
      expect(isValidUUID('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
      expect(isValidUUID('not-a-uuid')).toBe(false);
    });

    it('should reject invalid formats', () => {
      expect(isValidUUID('')).toBe(false);
      expect(isValidUUID('123')).toBe(false);
      expect(isValidUUID('550e8400-e29b-41d4-a716')).toBe(false);
    });
  });

  describe('buildWhereClause', () => {
    it('should build WHERE clause with filters', () => {
      const filters = {
        userName: 'John',
        age: 25,
      };
      const result = buildWhereClause(filters);
      expect(result.clause).toBe('WHERE user_name = $1 AND age = $2');
      expect(result.params).toEqual(['John', 25]);
      expect(result.nextIndex).toBe(3);
    });

    it('should handle empty filters', () => {
      const result = buildWhereClause({});
      expect(result.clause).toBe('');
      expect(result.params).toEqual([]);
      expect(result.nextIndex).toBe(1);
    });

    it('should handle arrays', () => {
      const filters = {
        status: ['active', 'pending'],
      };
      const result = buildWhereClause(filters);
      expect(result.clause).toBe('WHERE status = ANY($1)');
      expect(result.params).toEqual([['active', 'pending']]);
    });
  });
});
