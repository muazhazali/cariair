// ==========================================
// PostgreSQL Database Connection
// ==========================================

import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';
import { logger } from './logger';

// Database configuration from environment variables
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'postgres',
};

// Create connection pool
// Use singleton pattern to maintain pool across hot reloads
let pool: Pool | null = null;

export function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      ...dbConfig,
      max: 20, // Maximum number of connections
      idleTimeoutMillis: 30000, // Close idle connections after 30s
      connectionTimeoutMillis: 5000, // Connection timeout
      query_timeout: 30000, // Query timeout (30 seconds)
      statement_timeout: 30000, // Statement timeout (30 seconds)
    });

    // Handle pool errors
    pool.on('error', (err) => {
      logger.error('Unexpected PostgreSQL pool error:', err);
    });
  }

  return pool;
}

// Query helper with automatic connection handling
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function query<T extends QueryResultRow = any>(
  text: string,
  params?: any[]
): Promise<QueryResult<T>> {
  const pool = getPool();
  return pool.query<T>(text, params);
}

// Transaction helper
export async function withTransaction<T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> {
  const pool = getPool();
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// Connection test
export async function testConnection(): Promise<boolean> {
  try {
    const result = await query('SELECT NOW() as now');
    logger.info('PostgreSQL connected:', result.rows[0].now);
    return true;
  } catch (error) {
    logger.error('PostgreSQL connection failed:', error);
    return false;
  }
}

// Graceful shutdown
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
    logger.info('PostgreSQL pool closed');
  }
}

// Helper to convert snake_case to camelCase for row data
export function toCamelCase(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(toCamelCase);
  }
  if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((acc, key) => {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      acc[camelKey] = toCamelCase(obj[key]);
      return acc;
    }, {} as any);
  }
  return obj;
}

// Helper to convert camelCase to snake_case for queries
export function toSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

// UUID validation helper
export function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

// Build WHERE clause from filters
export function buildWhereClause(
  filters: Record<string, any>,
  startingIndex: number = 1
): { clause: string; params: any[]; nextIndex: number } {
  const conditions: string[] = [];
  const params: any[] = [];
  let index = startingIndex;

  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== null) {
      const snakeKey = toSnakeCase(key);
      
      if (Array.isArray(value)) {
        conditions.push(`${snakeKey} = ANY($${index})`);
        params.push(value);
      } else if (typeof value === 'string' && value.includes('%')) {
        conditions.push(`${snakeKey} LIKE $${index}`);
        params.push(value);
      } else {
        conditions.push(`${snakeKey} = $${index}`);
        params.push(value);
      }
      
      index++;
    }
  }

  return {
    clause: conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '',
    params,
    nextIndex: index
  };
}
