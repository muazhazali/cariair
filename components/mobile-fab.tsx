"use client"

import { useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Search, Filter, GitCompare, Plus, X } from "lucide-react"
import { cn } from "@/lib/utils"

export function MobileFAB() {
  const router = useRouter()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  // Only show FAB on specific pages
  const showFAB = pathname === "/" || pathname === "/sources" || pathname.startsWith("/sources/")

  if (!showFAB) return null

  const actions = [
    {
      icon: Search,
      label: "Search",
      onClick: () => {
        router.push("/sources")
        setOpen(false)
      },
      show: pathname !== "/sources",
    },
    {
      icon: GitCompare,
      label: "Compare",
      onClick: () => {
        router.push("/sources?compare=true")
        setOpen(false)
      },
      show: true,
    },
  ]

  const visibleActions = actions.filter(a => a.show)

  return (
    <div className="md:hidden fixed bottom-24 right-4 z-40">
      {/* Action buttons */}
      <div className={cn(
        "flex flex-col gap-3 mb-3 transition-all duration-300 origin-bottom",
        open ? "scale-100 opacity-100" : "scale-95 opacity-0 pointer-events-none"
      )}>
        {visibleActions.map((action, index) => {
          const Icon = action.icon
          return (
            <button
              key={action.label}
              onClick={action.onClick}
              className="relative overflow-hidden rounded-full border border-white/30 bg-white/90 backdrop-blur-xl dark:border-white/20 dark:bg-black/90 p-4 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 group"
              style={{
                animationDelay: `${index * 50}ms`,
                animation: open ? "slideInFromBottom 0.3s ease-out forwards" : "none"
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 group-hover:from-blue-500/20 group-hover:to-purple-500/20 transition-all" />
              <Icon className="relative h-5 w-5 text-gray-700 dark:text-gray-200" />

              {/* Tooltip */}
              <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <div className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs font-medium px-3 py-1.5 rounded-lg whitespace-nowrap">
                  {action.label}
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Main FAB button */}
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "relative overflow-hidden rounded-full border border-white/30 bg-gradient-to-br from-blue-600 to-cyan-600 dark:from-blue-500 dark:to-cyan-500 p-4 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110",
          open && "rotate-45"
        )}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
        {open ? (
          <X className="relative h-6 w-6 text-white" />
        ) : (
          <Plus className="relative h-6 w-6 text-white" />
        )}
      </button>

      <style jsx>{`
        @keyframes slideInFromBottom {
          from {
            opacity: 0;
            transform: translateY(1rem);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}
