// ==========================================
// Environment Variable Validation
// ==========================================

import { z } from 'zod';

/**
 * Server-side environment variables schema
 * These are only available on the server and validated at startup
 */
const serverEnvSchema = z.object({
  // Database
  DB_HOST: z.string().min(1, 'Database host is required'),
  DB_PORT: z.string().transform((val) => {
    const parsed = parseInt(val, 10);
    if (isNaN(parsed)) throw new Error('DB_PORT must be a valid number');
    return parsed;
  }).default('5432'),
  DB_USER: z.string().min(1, 'Database user is required'),
  DB_PASS: z.string(), // Can be empty for local dev
  DB_NAME: z.string().min(1, 'Database name is required'),
  
  // Auth
  AUTH_SECRET: z.string().min(32, 'AUTH_SECRET must be at least 32 characters'),
  AUTH_GOOGLE_ID: z.string().optional(),
  AUTH_GOOGLE_SECRET: z.string().optional(),
  
  // Optional: External Services
  GROQ_API_KEY: z.string().optional(),
  
  // Optional: Analytics
  NEXT_PUBLIC_UMAMI_SCRIPT_URL: z.string().url().optional(),
  NEXT_PUBLIC_UMAMI_WEBSITE_ID: z.string().optional(),
});

/**
 * Client-side environment variables schema
 * These must be prefixed with NEXT_PUBLIC_ to be exposed to the browser
 */
const clientEnvSchema = z.object({
  // Feature Flags
  NEXT_PUBLIC_CHATBOT_ENABLED: z.enum(['true', 'false', '1', '0']).transform((val) => 
    val === 'true' || val === '1'
  ).default('false'),
  NEXT_PUBLIC_ANALYTICS_ENABLED: z.enum(['true', 'false', '1', '0']).transform((val) => 
    val === 'true' || val === '1'
  ).default('false'),
  NEXT_PUBLIC_MAP_ENABLED: z.enum(['true', 'false', '1', '0']).transform((val) => 
    val === 'true' || val === '1'
  ).default('true'),
  NEXT_PUBLIC_REGISTRATION_ENABLED: z.enum(['true', 'false', '1', '0']).transform((val) => 
    val === 'true' || val === '1'
  ).default('true'),
  
  // Analytics
  NEXT_PUBLIC_UMAMI_SCRIPT_URL: z.string().optional(),
  NEXT_PUBLIC_UMAMI_WEBSITE_ID: z.string().optional(),
});

/**
 * Combined environment schema
 */
const envSchema = serverEnvSchema.merge(clientEnvSchema);

/**
 * Validated environment variables
 * Use this instead of process.env directly
 */
export const env = (() => {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = error.errors.map(
        (e) => `  - ${e.path.join('.')}: ${e.message}`
      );
      throw new Error(
        `❌ Invalid environment variables:\n${messages.join('\n')}\n\n` +
        'Please check your .env.local file or environment configuration.'
      );
    }
    throw error;
  }
})();

/**
 * Type for the validated environment
 */
export type Env = z.infer<typeof envSchema>;

/**
 * Check if required environment variables are set
 * Use this for runtime checks
 */
export function validateEnv(): { valid: boolean; missing: string[] } {
  const required = ['DB_HOST', 'DB_USER', 'DB_NAME', 'AUTH_SECRET'] as const;
  const missing = required.filter(
    (key) => !process.env[key] || process.env[key] === ''
  );
  
  return {
    valid: missing.length === 0,
    missing,
  };
}

/**
 * Get database configuration from validated env
 */
export function getDatabaseConfig() {
  return {
    host: env.DB_HOST,
    port: env.DB_PORT,
    user: env.DB_USER,
    password: env.DB_PASS,
    database: env.DB_NAME,
  };
}

/**
 * Feature flags derived from environment
 */
export const FEATURE_FLAGS = {
  chatbot: env.NEXT_PUBLIC_CHATBOT_ENABLED,
  analytics: env.NEXT_PUBLIC_ANALYTICS_ENABLED,
  map: env.NEXT_PUBLIC_MAP_ENABLED,
  registration: env.NEXT_PUBLIC_REGISTRATION_ENABLED,
  googleAuth: !!(env.AUTH_GOOGLE_ID && env.AUTH_GOOGLE_SECRET),
} as const;
