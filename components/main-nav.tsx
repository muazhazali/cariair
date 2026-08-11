"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Droplet, Menu, X, Github } from "lucide-react"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"
import type { Locale } from "@/i18n/routing"
import { LanguageSwitcher } from "./language-switcher"

interface MainNavProps {
  initialLocale: Locale
}

export function MainNav({ initialLocale }: MainNavProps) {
  const pathname = usePathname()
  const t = useTranslations("nav")
  const [mobileOpen, setMobileOpen] = useState(false)

  // Hash-link routes live on the home page; their active state is contextual
  // to the home page, so we keep active detection simple here.
  const routes = [
    { href: "/", label: t("home"), active: pathname === "/" },
    { href: "/#sources", label: t("allSources"), active: false },
    { href: "/#map", label: t("map"), active: false },
    { href: "/learn/guide", label: t("learn"), active: pathname.startsWith("/learn") },
    { href: "/about", label: t("about"), active: pathname === "/about" },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur dark:bg-gray-950/95">
      <div className="container flex h-14 items-center px-4">
        {/* Logo */}
        <Link href="/" className="mr-6 flex items-center gap-2 shrink-0">
          <Droplet className="h-6 w-6 text-blue-600" />
          <span className="text-lg font-semibold">CariAir</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "text-sm font-medium transition-colors",
                route.active
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {route.label}
            </Link>
          ))}
        </nav>

        {/* Right side: CTA + language + mobile toggle */}
        <div className="ml-auto flex items-center gap-2">
          <Link
            href="https://github.com/muazhazali/cariair"
            target="_blank"
            rel="noreferrer"
            className="hidden sm:inline-flex h-9 items-center gap-1.5 rounded-md border border-input bg-background px-3 text-sm font-medium shadow-sm transition-colors hover:bg-accent"
          >
            <Github className="h-4 w-4" />
            <span className="hidden lg:inline">{t("contributeCta")}</span>
          </Link>
          <LanguageSwitcher initialLocale={initialLocale} />

          {/* Mobile toggle */}
          <button
            className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-accent"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={t("moreOptions")}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <nav className="md:hidden border-t bg-background">
          <div className="container flex flex-col px-4 py-3">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "py-2.5 text-sm font-medium transition-colors",
                  route.active
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {route.label}
              </Link>
            ))}
            <a
              href="https://github.com/muazhazali/cariair"
              target="_blank"
              rel="noreferrer"
              className="py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              {t("github")}
            </a>
          </div>
        </nav>
      )}
    </header>
  )
}