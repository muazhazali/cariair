"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"
import type { Locale } from "@/i18n/routing"
import { LanguageSwitcher } from "./language-switcher"

interface MainNavProps { initialLocale: Locale }

export function MainNav({ initialLocale }: MainNavProps) {
  const pathname = usePathname()
  const t = useTranslations("nav")
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => setMobileOpen(false), [pathname])

  useEffect(() => {
    if (!mobileOpen) return
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false)
    }
    window.addEventListener("keydown", closeOnEscape)
    return () => window.removeEventListener("keydown", closeOnEscape)
  }, [mobileOpen])

  const routes = [
    { href: "/", label: t("home"), active: pathname === "/" },
    { href: "/#sources", label: t("allSources"), active: false },
    { href: "/#map", label: t("map"), active: false },
    { href: "/learn/guide", label: t("learn"), active: pathname.startsWith("/learn") },
    { href: "/about", label: t("about"), active: pathname === "/about" },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/92 backdrop-blur-md">
      <div className="mx-auto flex h-[4.5rem] max-w-[88rem] items-center px-5 sm:px-8 lg:px-12">
        <Link href="/" className="group mr-10 flex shrink-0 items-center gap-3" aria-label="CariAir home">
          <BrandMark />
          <span className="font-display text-xl tracking-[-0.025em]">CariAir</span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex" aria-label="Primary navigation">
          {routes.map((route) => (
            <Link key={route.href} href={route.href} aria-current={route.active ? "page" : undefined}
              className={cn(
                "relative py-2 text-sm font-medium transition-colors duration-200 after:absolute after:inset-x-0 after:bottom-0 after:h-px after:origin-left after:bg-foreground after:transition-transform",
                route.active ? "text-foreground after:scale-x-100" : "text-muted-foreground after:scale-x-0 hover:text-foreground hover:after:scale-x-100"
              )}>
              {route.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <a href="https://github.com/muazhazali/cariair" target="_blank" rel="noreferrer"
            className="hidden border-b border-foreground/30 pb-0.5 text-xs font-semibold transition-colors hover:border-foreground lg:inline-flex">
            {t("contributeCta")}
          </a>
          <LanguageSwitcher initialLocale={initialLocale} />
          <button type="button" onClick={() => setMobileOpen((value) => !value)}
            className="grid h-9 w-9 place-items-center rounded-md border border-border bg-background transition-colors hover:bg-muted md:hidden"
            aria-label={t("moreOptions")} aria-expanded={mobileOpen} aria-controls="mobile-navigation">
            <MenuGlyph open={mobileOpen} />
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav id="mobile-navigation" className="border-t border-border bg-background px-5 py-4 md:hidden" aria-label={t("mobileNavigation")}>
          <div className="mx-auto flex max-w-[88rem] flex-col">
            {routes.map((route, index) => (
              <Link key={route.href} href={route.href} onClick={() => setMobileOpen(false)}
                className={cn("flex items-center justify-between border-b border-border py-3.5 text-sm font-medium", route.active ? "text-foreground" : "text-muted-foreground") }>
                {route.label}<span className="font-mono text-[10px]">0{index + 1}</span>
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  )
}

export function BrandMark({ small = false }: { small?: boolean }) {
  return (
    <span className={cn("grid place-items-center rounded-md bg-survey-pale text-survey-foreground transition-transform duration-200 group-hover:-rotate-3", small ? "h-7 w-7" : "h-9 w-9")} aria-hidden="true">
      <svg viewBox="0 0 24 24" className={small ? "h-4 w-4" : "h-5 w-5"} fill="none">
        <path d="M12 3.5c-2.8 4-5.2 6.5-5.2 10a5.2 5.2 0 0 0 10.4 0c0-3.5-2.4-6-5.2-10Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M9.5 14.2c.3 1.2 1.1 1.9 2.4 2.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="square" />
      </svg>
    </span>
  )
}

function MenuGlyph({ open }: { open: boolean }) {
  return <svg viewBox="0 0 20 20" className="h-4 w-4" aria-hidden="true"><path d={open ? "M5 5l10 10M15 5 5 15" : "M3 6h14M3 14h14"} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="square" /></svg>
}
