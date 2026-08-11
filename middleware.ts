// ==========================================
// Middleware: Locale cookie handling
// ==========================================
// NOTE: Auth protection is currently disabled — the auth layer
// (`@/lib/auth`) is unimplemented. When auth is added back, restore
// the PROTECTED_ROUTES / AUTH_PAGES redirect logic below.

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { defaultLocale, LOCALE_COOKIE } from './i18n/routing';

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Ensure the locale cookie is set for next-intl
  if (!request.cookies.has(LOCALE_COOKIE)) {
    response.cookies.set(LOCALE_COOKIE, defaultLocale);
  }

  return response;
}

/**
 * Matcher configuration
 * Specify which routes the middleware should run on
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};