import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages } from 'next-intl/server'
import { Toaster } from "@/components/ui/toaster"
import { MainNav } from "@/components/main-nav"
import { MobileBottomNav } from "@/components/mobile-bottom-nav"
import { Footer } from "@/components/footer"
import { WaterChatbot } from "@/components/water-chatbot"
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
        <script defer src="https://umami.muaz.app/script.js" data-website-id="643f246f-444f-4693-802d-62770e729f89"></script>
      </head>
      <body suppressHydrationWarning>
        <NextIntlClientProvider messages={messages}>
          <MainNav />
          {children}
          <Footer />
          <MobileBottomNav />
          <Toaster />
          <WaterChatbot />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
