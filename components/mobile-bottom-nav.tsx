"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Droplets, Map, BarChart3, Menu } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

export function MobileBottomNav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const mainRoutes = [
    {
      href: "/",
      label: "Home",
      icon: Home,
    },
    {
      href: "/sources",
      label: "Sources",
      icon: Droplets,
    },
    {
      href: "/map",
      label: "Map",
      icon: Map,
    },
    {
      href: "/analytics",
      label: "Analytics",
      icon: BarChart3,
    },
  ]

  const moreRoutes = [
    {
      href: "/learn",
      label: "Learn",
    },
    {
      href: "/contribute",
      label: "Contribute",
    },
    {
      href: "/about",
      label: "About",
    },
  ]

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 pb-safe">
      {/* Glassy bottom navigation */}
      <div className="mx-4 mb-4">
        <div className="relative overflow-hidden rounded-2xl border border-white/30 bg-white/20 shadow-2xl backdrop-blur-xl dark:border-white/20 dark:bg-black/20">
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-transparent to-purple-500/10" />

          <div className="relative flex items-center justify-around px-2 py-3">
            {mainRoutes.map((route) => {
              const Icon = route.icon
              const isActive = pathname === route.href

              return (
                <Link
                  key={route.href}
                  href={route.href}
                  className={cn(
                    "flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 min-w-[64px]",
                    isActive
                      ? "bg-white/30 dark:bg-white/20"
                      : "hover:bg-white/20 dark:hover:bg-white/10"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-5 w-5 transition-colors",
                      isActive
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-gray-600 dark:text-gray-300"
                    )}
                  />
                  <span
                    className={cn(
                      "text-[10px] font-medium transition-colors",
                      isActive
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-gray-600 dark:text-gray-300"
                    )}
                  >
                    {route.label}
                  </span>
                </Link>
              )
            })}

            {/* More menu */}
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <button className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl hover:bg-white/20 dark:hover:bg-white/10 transition-all duration-200 min-w-[64px]">
                  <Menu className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                  <span className="text-[10px] font-medium text-gray-600 dark:text-gray-300">
                    More
                  </span>
                </button>
              </SheetTrigger>
              <SheetContent
                side="bottom"
                className="rounded-t-2xl border-t border-white/30 bg-white/20 backdrop-blur-xl dark:border-white/20 dark:bg-black/20"
              >
                <SheetHeader>
                  <SheetTitle>More Options</SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-2">
                  {moreRoutes.map((route) => (
                    <Link
                      key={route.href}
                      href={route.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "block px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                        pathname === route.href
                          ? "bg-white/30 dark:bg-white/20 text-blue-600 dark:text-blue-400"
                          : "text-gray-700 dark:text-gray-300 hover:bg-white/20 dark:hover:bg-white/10"
                      )}
                    >
                      {route.label}
                    </Link>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  )
}
