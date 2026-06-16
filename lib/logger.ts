/**
 * Error Logger Utility
 * 
 * Centralized error logging with different log levels
 * and support for error tracking services
 */

import { env } from './env';

// Log levels
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

// Error metadata interface
interface ErrorMetadata {
  requestId?: string;
  userId?: string;
  path?: string;
  method?: string;
  timestamp?: Date;
  [key: string]: unknown;
}

// Structured error log
interface StructuredError {
  level: LogLevel;
  message: string;
  error?: Error;
  metadata?: ErrorMetadata;
  timestamp: string;
}

/**
 * Check if we're in development mode
 */
const isDev = process.env.NODE_ENV === 'development';

/**
 * Format error for logging
 */
function formatError(log: StructuredError): string {
  const parts = [
    `[${log.timestamp}]`,
    `[${log.level.toUpperCase()}]`,
    log.message,
  ];

  if (log.error) {
    parts.push(`\n  Error: ${log.error.message}`);
    if (isDev && log.error.stack) {
      parts.push(`\n  Stack: ${log.error.stack}`);
    }
  }

  if (log.metadata && Object.keys(log.metadata).length > 0) {
    parts.push(`\n  Metadata: ${JSON.stringify(log.metadata, null, 2)}`);
  }

  return parts.join(' ');
}

/**
 * Send to external error tracking service
 * (e.g., Sentry, LogRocket, etc.)
 */
async function sendToErrorTracking(log: StructuredError): Promise<void> {
  // TODO: Integrate with error tracking service
  // if (process.env.SENTRY_DSN) {
  //   const Sentry = await import('@sentry/nextjs');
  //   Sentry.captureException(log.error, {
  //     level: log.level,
  //     extra: log.metadata,
  //   });
  // }
}

/**
 * Core logger function
 */
function createLogger(level: LogLevel) {
  return async (message: string, error?: Error, metadata?: ErrorMetadata) => {
    const log: StructuredError = {
      level,
      message,
      error,
      metadata,
      timestamp: new Date().toISOString(),
    };

    // Only log in development or for errors in production
    if (isDev || ['error', 'fatal'].includes(level)) {
      const formatted = formatError(log);

      switch (level) {
        case 'debug':
          if (isDev) console.debug(formatted);
          break;
        case 'info':
          if (isDev) console.info(formatted);
          break;
        case 'warn':
          console.warn(formatted);
          break;
        case 'error':
        case 'fatal':
          console.error(formatted);
          await sendToErrorTracking(log);
          break;
      }
    }
  };
}

// Export logger functions
export const logger = {
  debug: createLogger('debug'),
  info: createLogger('info'),
  warn: createLogger('warn'),
  error: createLogger('error'),
  fatal: createLogger('fatal'),
};

/**
 * API Error helper
 * Use this in API routes for consistent error responses
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string,
    public metadata?: ErrorMetadata
  ) {
    super(message);
    this.name = 'ApiError';
  }

  toJSON() {
    return {
      error: this.message,
      code: this.code,
      statusCode: this.statusCode,
    };
  }
}

/**
 * Create standardized error response
 */
export function createErrorResponse(
  error: Error | ApiError,
  requestId?: string
): Response {
  const isApiError = error instanceof ApiError;
  const statusCode = isApiError ? error.statusCode : 500;
  const errorCode = isApiError ? error.code : 'INTERNAL_ERROR';
  
  // Log the error
  logger.error(
    `API Error: ${error.message}`,
    error,
    {
      requestId,
      statusCode,
      errorCode,
    }
  );

  // Don't expose internal error details in production
  const message = (!isDev && statusCode === 500)
    ? 'Internal server error'
    : error.message;

  return Response.json(
    {
      error: message,
      code: errorCode,
      ...(isDev && { stack: error.stack }),
    },
    { status: statusCode }
  );
}

/**
 * Request ID generator
 */
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}
