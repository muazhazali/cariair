"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Droplet } from "lucide-react"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"

export function MainNav() {
  const pathname = usePathname()
  const t = useTranslations("nav")

  const routes = [
    { href: "/", label: t("home") },
    { href: "/about", label: t("about") },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white dark:bg-gray-950">
      <div className="container flex h-14 items-center px-4">
        {/* Logo */}
        <Link href="/" className="mr-8 flex items-center gap-2">
          <Droplet className="h-6 w-6 text-blue-600" />
          <span className="text-lg font-semibold">CariAir</span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-6">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "text-sm font-medium transition-colors",
                pathname === route.href
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {route.label}
            </Link>
          ))}
        </nav>

        {/* Language Switcher - right side */}
        <div className="ml-auto">
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  )
}

// Import LanguageSwitcher separately to avoid circular issues
import { LanguageSwitcher } from "./language-switcher"
