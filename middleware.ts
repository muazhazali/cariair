// ==========================================
// NextAuth Middleware Configuration
// ==========================================

import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

/**
 * Protected routes configuration
 * Routes that require authentication
 */
const PROTECTED_ROUTES = [
  '/contribute',
  '/analytics',
  '/api/products', // POST only - GET is public
  '/api/sources',  // POST only - GET is public
  '/api/brands',   // POST only - GET is public
  '/api/manufacturers', // POST only - GET is public
];

/**
 * Public API routes (no auth required)
 */
const PUBLIC_API_ROUTES = [
  '/api/products',
  '/api/sources',
  '/api/brands',
  '/api/manufacturers',
  '/api/health',
  '/api/images',
  '/api/export',
  '/api/rate-limit',
  '/api/db-test',
  '/api/openapi',
];

/**
 * Auth pages (redirect to home if already logged in)
 */
const AUTH_PAGES = ['/login', '/register'];

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const pathname = nextUrl.pathname;
  
  // Check if this is an API route
  const isApiRoute = pathname.startsWith('/api');
  
  // Check if this is a public API route (GET only)
  const isPublicApiRoute = PUBLIC_API_ROUTES.some(route => 
    pathname.startsWith(route) && req.method === 'GET'
  );
  
  // Allow public API routes
  if (isApiRoute && isPublicApiRoute) {
    return NextResponse.next();
  }
  
  // Check if this is a protected route
  const isProtectedRoute = PROTECTED_ROUTES.some(route => 
    pathname.startsWith(route)
  );
  
  // Check if this is an auth page
  const isAuthPage = AUTH_PAGES.some(route => pathname.startsWith(route));
  
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
  
  return NextResponse.next();
});

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
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
