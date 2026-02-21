import type { Metadata } from 'next'
import { Toaster } from "@/components/ui/toaster"
import { MainNav } from "@/components/main-nav"
import { MobileBottomNav } from "@/components/mobile-bottom-nav"
import { Footer } from "@/components/footer"
import { WaterChatbot } from "@/components/water-chatbot"
import './globals.css'

export const metadata: Metadata = {
  title: 'Cariair - Water Source Registry',
  description: 'The definitive registry of all mineral and drinking water sources in Malaysia.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script defer src="https://umami.muaz.app/script.js" data-website-id="643f246f-444f-4693-802d-62770e729f89"></script>
      </head>
      <body suppressHydrationWarning>
        <MainNav />
        {children}
        <Footer />
        <MobileBottomNav />
        <Toaster />
        <WaterChatbot />
      </body>
    </html>
  )
}
