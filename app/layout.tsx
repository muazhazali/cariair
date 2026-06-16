import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages } from 'next-intl/server'
import { Toaster } from "@/components/ui/toaster"
import { MainNav } from "@/components/main-nav"
import { Footer } from "@/components/footer"
import { ANALYTICS_CONFIG } from "@/lib/features"
import './globals.css'

export const metadata: Metadata = {
  title: 'CariAir | Malaysia Mineral & Drinking Water Source Registry',
  description: 'The definitive registry of mineral and drinking water sources in Malaysia. Compare pH levels, TDS, and mineral composition of brands like Spritzer, Cactus, and more.',
  keywords: ['mineral water Malaysia', 'drinking water sources', 'water quality Malaysia', 'pH level mineral water', 'best mineral water brand Malaysia', 'CariAir'],
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const locale = await getLocale()
  const messages = await getMessages()

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
        <NextIntlClientProvider messages={messages}>
          <MainNav />
          {children}
          <Footer />
          <Toaster />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
