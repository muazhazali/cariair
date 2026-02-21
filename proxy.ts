import createMiddleware from 'next-intl/middleware'
import { locales, defaultLocale } from './i18n/routing'

export default createMiddleware({
  locales,
  defaultLocale,
  localeDetection: false,
  localePrefix: 'never',
})

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
}
