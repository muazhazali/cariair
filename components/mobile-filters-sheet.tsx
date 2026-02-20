"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { SlidersHorizontal, X } from "lucide-react"
import { EnhancedProductFilters } from "@/components/enhanced-product-filters"
import { cn } from "@/lib/utils"

interface MobileFiltersSheetProps {
  brands: { id: string; brand_name: string }[]
  onApply: (filters: any) => void
  defaultValues: any
}

export function MobileFiltersSheet({ brands, onApply, defaultValues }: MobileFiltersSheetProps) {
  const [open, setOpen] = useState(false)

  // Prevent body scroll when sheet is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  const handleApply = (filters: any) => {
    onApply(filters)
    setOpen(false)
  }

  return (
    <>
      {/* Trigger Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="h-9 gap-2 bg-white/40 dark:bg-black/40 backdrop-blur-sm border border-white/30 dark:border-white/20 hover:bg-blue-500 hover:text-white hover:border-blue-500 transition-all duration-300"
      >
        <SlidersHorizontal className="h-4 w-4" />
        Filters
      </Button>

      {/* Sheet Overlay */}
      <div
        className={cn(
          "fixed inset-0 z-50 lg:hidden transition-all duration-300",
          open
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        )}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />

        {/* Sheet Content */}
        <div
          className={cn(
            "absolute bottom-0 left-0 right-0 max-h-[85vh] transition-all duration-300 ease-out",
            open
              ? "translate-y-0"
              : "translate-y-full"
          )}
        >
          <div className="relative overflow-hidden rounded-t-3xl border-t border-white/30 bg-white/95 backdrop-blur-xl dark:border-white/20 dark:bg-black/95">
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 pointer-events-none" />

            {/* Handle bar */}
            <div className="relative flex justify-center pt-3 pb-2">
              <div className="w-12 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600" />
            </div>

            {/* Header */}
            <div className="relative flex items-center justify-between px-6 py-4 border-b border-white/30 dark:border-white/20">
              <h2 className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
                Filter Water Sources
              </h2>
              <button
                onClick={() => setOpen(false)}
                className="p-2 rounded-lg hover:bg-white/40 dark:hover:bg-black/40 transition-colors"
              >
                <X className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="relative overflow-y-auto max-h-[calc(85vh-80px)] overscroll-contain">
              <div className="p-6">
                <EnhancedProductFilters
                  brands={brands}
                  onApply={handleApply}
                  defaultValues={defaultValues}
                  mode="sidebar"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
