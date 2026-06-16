/**
 * Feature Flags Configuration
 *
 * Centralized feature flags for the application.
 * All features should be explicitly disabled by default in production
 * unless explicitly enabled via environment variables.
 */

// Helper to parse boolean env vars
const parseBoolean = (value: string | undefined, defaultValue: boolean): boolean => {
  if (value === undefined) return defaultValue;
  return value.toLowerCase() === 'true' || value === '1';
};

/**
 * Chatbot feature flag
 * Enables the AI-powered chatbot using Groq API
 */
export const CHATBOT_ENABLED = parseBoolean(
  process.env.NEXT_PUBLIC_CHATBOT_ENABLED,
  false
);

/**
 * Analytics feature flag
 * Enables Umami analytics tracking
 */
export const ANALYTICS_ENABLED = parseBoolean(
  process.env.NEXT_PUBLIC_ANALYTICS_ENABLED,
  process.env.NODE_ENV === 'production'
);

/**
 * Analytics configuration
 */
export const ANALYTICS_CONFIG = {
  enabled: ANALYTICS_ENABLED,
  scriptUrl: process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL || 'https://umami.muaz.app/script.js',
  websiteId: process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID || '',
} as const;

/**
 * Map feature flag
 * Enables interactive map functionality
 */
export const MAP_ENABLED = parseBoolean(
  process.env.NEXT_PUBLIC_MAP_ENABLED,
  true
);

/**
 * Registration feature flag
 * Controls whether new user registration is open
 */
export const REGISTRATION_ENABLED = parseBoolean(
  process.env.NEXT_PUBLIC_REGISTRATION_ENABLED,
  true
);

/**
 * Check if a feature is enabled
 * Use this for runtime feature checks
 */
export function isFeatureEnabled(feature: keyof typeof FEATURES): boolean {
  return FEATURES[feature];
}

/**
 * Feature flags object for easy access
 */
export const FEATURES = {
  chatbot: CHATBOT_ENABLED,
  analytics: ANALYTICS_ENABLED,
  map: MAP_ENABLED,
  registration: REGISTRATION_ENABLED,
} as const;

/**
 * Development-only features
 * These are automatically disabled in production
 */
export const DEV_FEATURES = {
  debugLogging: process.env.NODE_ENV === 'development',
  queryLogging: process.env.NODE_ENV === 'development' && parseBoolean(process.env.DEBUG_QUERIES, false),
} as const;
