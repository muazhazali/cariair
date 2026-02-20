import type { Metadata } from 'next'
import { Toaster } from "@/components/ui/toaster"
import { MainNav } from "@/components/main-nav"
import { MobileBottomNav } from "@/components/mobile-bottom-nav"
import { MobileFAB } from "@/components/mobile-fab"
import { Footer } from "@/components/footer"
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
      <body suppressHydrationWarning>
        <MainNav />
        {children}
        <Footer />
        <MobileBottomNav />
        <MobileFAB />
        <Toaster />
      </body>
    </html>
  )
}
