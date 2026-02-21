"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Github, Info, Menu, X, Droplet } from "lucide-react"
import { useState } from "react"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { LanguageSwitcher } from "@/components/language-switcher"

export function MainNav() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const t = useTranslations("nav")

  const routes = [
    {
      href: "/sources",
      label: t("allSources"),
    },
    {
      href: "/analytics",
      label: t("analytics"),
    },
    {
      href: "/map",
      label: t("map"),
    },
    {
      href: "/learn",
      label: t("learn"),
    },
    {
      href: "/contribute",
      label: t("contribute"),
    },
  ]

  return (
    <>
      {/* Desktop & Mobile Navigation Bar */}
      <header className="sticky top-0 z-50 w-full">
        {/* Glassy navbar */}
        <div className="mx-4 mt-4 md:mx-6 md:mt-6">
          <div className="relative overflow-hidden rounded-2xl border border-white/20 bg-white/10 shadow-lg backdrop-blur-xl dark:border-white/10 dark:bg-black/10">
            {/* Gradient overlay for extra depth */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-purple-500/5" />

            <div className="relative container flex h-16 items-center px-4 md:px-6">
              {/* Logo */}
              <Link href="/" className="mr-6 flex items-center space-x-2 group">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 shadow-md transition-transform group-hover:scale-110">
                  <Droplet className="h-5 w-5 text-white" />
                </div>
                <span className="font-bold text-lg bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-cyan-400">
                  CariAir
                </span>
              </Link>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center space-x-1 flex-1">
                {routes.map((route) => (
                  <Link
                    key={route.href}
                    href={route.href}
                    className={cn(
                      "relative px-4 py-2 text-sm font-medium transition-all duration-200 rounded-lg",
                      pathname === route.href
                        ? "text-foreground"
                        : "text-foreground/60 hover:text-foreground"
                    )}
                  >
                    {pathname === route.href && (
                      <span className="absolute inset-0 rounded-lg bg-white/20 dark:bg-white/10 backdrop-blur-sm" />
                    )}
                    <span className="relative">{route.label}</span>
                  </Link>
                ))}
              </nav>

              {/* Desktop Right Icons */}
              <div className="hidden md:flex items-center gap-1">
                <LanguageSwitcher />
                <Button
                  variant="ghost"
                  size="icon"
                  asChild
                  className="hover:bg-white/20 dark:hover:bg-white/10 rounded-lg transition-all"
                >
                  <Link href="https://github.com/muazhazali/cariair" target="_blank" rel="noreferrer">
                    <Github className="h-4 w-4" />
                    <span className="sr-only">{t("github")}</span>
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  asChild
                  className="hover:bg-white/20 dark:hover:bg-white/10 rounded-lg transition-all"
                >
                  <Link href="/about">
                    <Info className="h-4 w-4" />
                    <span className="sr-only">{t("about")}</span>
                  </Link>
                </Button>
              </div>

              {/* Mobile Menu Button */}
              <div className="flex md:hidden ml-auto items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  asChild
                  className="hover:bg-white/20 dark:hover:bg-white/10 rounded-lg transition-all"
                >
                  <Link href="https://github.com/muazhazali/cariair" target="_blank" rel="noreferrer">
                    <Github className="h-4 w-4" />
                    <span className="sr-only">GitHub</span>
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="hover:bg-white/20 dark:hover:bg-white/10 rounded-lg transition-all"
                >
                  {mobileMenuOpen ? (
                    <X className="h-5 w-5" />
                  ) : (
                    <Menu className="h-5 w-5" />
                  )}
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Glassy Menu */}
      <div
        className={cn(
          "fixed inset-0 z-40 md:hidden transition-all duration-300",
          mobileMenuOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        )}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/20 backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />

        {/* Glassy Menu Panel */}
        <div
          className={cn(
            "absolute right-4 top-24 w-[calc(100%-2rem)] max-w-sm transition-all duration-300",
            mobileMenuOpen
              ? "translate-y-0 opacity-100"
              : "-translate-y-4 opacity-0"
          )}
        >
          <div className="overflow-hidden rounded-2xl border border-white/20 bg-white/10 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-black/10">
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5" />

            <nav className="relative p-2">
              {routes.map((route, index) => (
                <Link
                  key={route.href}
                  href={route.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "block px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200",
                    pathname === route.href
                      ? "bg-white/20 dark:bg-white/10 text-foreground"
                      : "text-foreground/60 hover:text-foreground hover:bg-white/10 dark:hover:bg-white/5"
                  )}
                  style={{
                    animationDelay: `${index * 50}ms`,
                    animation: mobileMenuOpen ? "slideInFromRight 0.3s ease-out forwards" : "none"
                  }}
                >
                  {route.label}
                </Link>
              ))}

              {/* Mobile About Link */}
              <Link
                href="/about"
                onClick={() => setMobileMenuOpen(false)}
                className="mt-2 block px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 text-foreground/60 hover:text-foreground hover:bg-white/10 dark:hover:bg-white/5 border-t border-white/10"
              >
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  <span>{t("about")}</span>
                </div>
              </Link>

              {/* Mobile Language Switcher */}
              <div className="mt-2 px-4 py-2 border-t border-white/10 flex items-center gap-2">
                <LanguageSwitcher />
              </div>
            </nav>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes slideInFromRight {
          from {
            opacity: 0;
            transform: translateX(1rem);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </>
  )
}
