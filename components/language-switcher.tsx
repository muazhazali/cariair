'use client'

import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { LOCALE_COOKIE, locales, type Locale } from '@/i18n/routing'
import { Button } from '@/components/ui/button'

function getCurrentLocale(): Locale {
  if (typeof document === 'undefined') return 'ms'
  const match = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${LOCALE_COOKIE}=`))
  const val = match?.split('=')[1]
  return locales.includes(val as Locale) ? (val as Locale) : 'ms'
}

export function LanguageSwitcher() {
  const t = useTranslations('languageSwitcher')
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const switchLocale = (locale: Locale) => {
    document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=31536000; SameSite=Lax`
    startTransition(() => {
      router.refresh()
    })
  }

  const currentLocale = getCurrentLocale()

  return (
    <div
      className="flex items-center gap-0.5 rounded-lg border border-white/30 dark:border-white/20 bg-white/10 dark:bg-black/10 p-0.5"
      aria-label={t('label')}
    >
      {locales.map((locale) => (
        <Button
          key={locale}
          variant="ghost"
          size="sm"
          disabled={isPending}
          onClick={() => switchLocale(locale)}
          className={`h-7 px-2 text-xs font-semibold rounded-md transition-all ${
            currentLocale === locale
              ? 'bg-white/30 dark:bg-white/20 text-foreground shadow-sm'
              : 'text-foreground/60 hover:text-foreground hover:bg-white/20 dark:hover:bg-white/10'
          }`}
        >
          {t(locale as 'ms' | 'en')}
        </Button>
      ))}
    </div>
  )
}
