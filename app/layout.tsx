import type { Metadata, Viewport } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages } from 'next-intl/server'
import { Toaster } from "@/components/ui/toaster"
import { MainNav } from "@/components/main-nav"
import { Footer } from "@/components/footer"
import { ANALYTICS_CONFIG } from "@/lib/features"
import { locales, type Locale } from '@/i18n/routing'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'CariAir — Malaysia water source registry',
    template: '%s — CariAir',
  },
  description: 'The definitive registry of mineral and drinking water sources in Malaysia. Compare pH levels, TDS, and mineral composition of brands like Spritzer, Cactus, and more.',
  keywords: ['mineral water Malaysia', 'drinking water sources', 'water quality Malaysia', 'pH level mineral water', 'best mineral water brand Malaysia', 'CariAir'],
  openGraph: {
    title: 'CariAir — Malaysia water source registry',
    description: 'Trace bottled water to its source and compare its composition.',
    type: 'website',
  },
}

export const viewport: Viewport = {
  themeColor: '#f8f7f2',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const locale = await getLocale()
  const messages = await getMessages()
  const initialLocale = (locales.includes(locale as Locale) ? locale : 'ms') as Locale

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        {ANALYTICS_CONFIG.enabled && ANALYTICS_CONFIG.websiteId && (
          <script 
            defer 
            src={ANALYTICS_CONFIG.scriptUrl} 
            data-website-id={ANALYTICS_CONFIG.websiteId}
          />
        )}
      </head>
      <body suppressHydrationWarning className="min-h-screen bg-background">
        <a href="#main-content" className="skip-link">Skip to content</a>
        <NextIntlClientProvider messages={messages}>
          <MainNav initialLocale={initialLocale} />
          {children}
          <Footer />
          <Toaster />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
