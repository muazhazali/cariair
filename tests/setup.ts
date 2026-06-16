// ==========================================
// Test Setup
// ==========================================

import { vi } from 'vitest';

// Mock environment variables
process.env.DB_HOST = 'localhost';
process.env.DB_USER = 'postgres';
process.env.DB_PASS = '';
process.env.DB_NAME = 'cariair_test';
process.env.AUTH_SECRET = 'test-secret-key-that-is-32-chars-long-for-testing';

// Mock console methods in tests to reduce noise
global.console = {
  ...console,
  log: vi.fn(),
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
};

// Clean up after each test
afterEach(() => {
  vi.clearAllMocks();
});
