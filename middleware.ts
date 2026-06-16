// ==========================================
// Combined Middleware: Locale + Auth Protection
// ==========================================

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { defaultLocale, LOCALE_COOKIE } from './i18n/routing';

/**
 * Protected routes configuration
 * Routes that require authentication
 */
const PROTECTED_ROUTES = [
  '/contribute',
  '/analytics',
];

/**
 * Auth pages (redirect to home if already logged in)
 */
const AUTH_PAGES = ['/login', '/register'];

export async function middleware(request: NextRequest) {
  const { nextUrl } = request;
  const pathname = nextUrl.pathname;
  
  // Handle locale first
  const locale = request.cookies.get(LOCALE_COOKIE)?.value || defaultLocale;
  const response = NextResponse.next();
  
  // Ensure the locale cookie is set for next-intl
  if (!request.cookies.has(LOCALE_COOKIE)) {
    response.cookies.set(LOCALE_COOKIE, locale);
  }
  
  // Check if this is an API route
  const isApiRoute = pathname.startsWith('/api');
  
  // Skip auth checks for API routes (handled separately)
  if (isApiRoute) {
    return response;
  }
  
  // Check if this is a protected route
  const isProtectedRoute = PROTECTED_ROUTES.some(route => 
    pathname.startsWith(route)
  );
  
  // Check if this is an auth page
  const isAuthPage = AUTH_PAGES.some(route => pathname.startsWith(route));
  
  // Only check auth for protected routes or auth pages
  if (isProtectedRoute || isAuthPage) {
    try {
      // Get auth session
      const session = await auth();
      const isLoggedIn = !!session?.user;
      
      // Redirect to login if accessing protected route without auth
      if (isProtectedRoute && !isLoggedIn) {
        const loginUrl = new URL('/login', nextUrl);
        loginUrl.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(loginUrl);
      }
      
      // Redirect to home if accessing auth pages while logged in
      if (isAuthPage && isLoggedIn) {
        return NextResponse.redirect(new URL('/', nextUrl));
      }
    } catch (error) {
      // If auth check fails, continue to protected route
      // The page will handle auth state
      console.error('Auth middleware error:', error);
    }
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
