import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { defaultLocale, LOCALE_COOKIE } from './i18n/routing'

export default function middleware(request: NextRequest) {
  // Use the existing locale from cookie or default
  const locale = request.cookies.get(LOCALE_COOKIE)?.value || defaultLocale

  const response = NextResponse.next()

  // Ensure the locale cookie is set for next-intl to use in getRequestConfig
  if (!request.cookies.has(LOCALE_COOKIE)) {
    response.cookies.set(LOCALE_COOKIE, locale)
  }

  return response
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
}
