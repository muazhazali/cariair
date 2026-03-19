import createMiddleware from 'next-intl/middleware'
import type { NextRequest } from 'next/server'
import { defaultLocale, LOCALE_COOKIE, locales } from './i18n/routing'

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localeDetection: false,
  localePrefix: 'never',
})

export default function middleware(request: NextRequest) {
  // Determine locale from cookie (fallback to default)
  const locale = request.cookies.get(LOCALE_COOKIE)?.value || defaultLocale
  // Inject a synthetic accept-language so next-intl picks the right locale
  const headers = new Headers(request.headers)
  headers.set('x-next-intl-locale', locale)
  return intlMiddleware(new Request(request, { headers }))
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
}
