import { defineConfig } from 'drizzle-kit';

// Validate required environment variables
const requiredEnvVars = ['DB_HOST', 'DB_USER', 'DB_PASS', 'DB_NAME'];
const missing = requiredEnvVars.filter(v => !process.env[v]);

if (missing.length > 0) {
  throw new Error(
    `Missing required database environment variables: ${missing.join(', ')}\n` +
    'Please ensure these are set in your .env.local file or environment.'
  );
}

export default defineConfig({
  schema: './lib/db/schema.ts',
  out: './drizzle/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    host: process.env.DB_HOST!,
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER!,
    password: process.env.DB_PASS!,
    database: process.env.DB_NAME!,
  },
});
