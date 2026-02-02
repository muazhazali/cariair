import type { Metadata } from 'next'
import { Toaster } from "@/components/ui/toaster"
import { MainNav } from "@/components/main-nav"
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
        <Toaster />
      </body>
    </html>
  )
}
