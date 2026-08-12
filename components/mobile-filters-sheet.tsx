"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { SlidersHorizontal, X } from "lucide-react"
import { EnhancedProductFilters } from "@/components/enhanced-product-filters"
import { cn } from "@/lib/utils"
import { useTranslations } from "next-intl"

interface MobileFiltersSheetProps {
  brands: { id: string; brand_name: string }[]
  onApply: (filters: any) => void
  defaultValues: any
}

export function MobileFiltersSheet({ brands, onApply, defaultValues }: MobileFiltersSheetProps) {
  const t = useTranslations('filters')
  const common = useTranslations('common')
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
        className="h-9 gap-2 border-border bg-background shadow-none transition-[color,background-color,border-color] duration-200 hover:border-foreground/25 hover:bg-muted"
      >
        <SlidersHorizontal className="h-4 w-4" />
        {t('filterButton')}
      </Button>

      {/* Sheet Overlay */}
      <div
        className={cn(
          "fixed inset-0 z-[100] transition-opacity duration-300 lg:hidden",
          open
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        )}
      >
        {/* Backdrop */}
        <button
          type="button"
          aria-label={common('close')}
          className="absolute inset-0 h-full w-full bg-foreground/35 backdrop-blur-[2px]"
          onClick={() => setOpen(false)}
        />

        {/* Sheet Content */}
        <div
          className={cn(
            "absolute bottom-0 left-0 right-0 max-h-[85vh] transition-transform duration-300 ease-out",
            open
              ? "translate-y-0"
              : "translate-y-full"
          )}
        >
          <div role="dialog" aria-modal="true" aria-labelledby="mobile-filter-title" className="relative overflow-hidden rounded-t-xl border-t border-border bg-background">

            {/* Handle bar */}
            <div className="relative flex justify-center pt-3 pb-2">
              <div className="w-12 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600" />
            </div>

            {/* Header */}
            <div className="relative flex items-center justify-between px-6 py-4 border-b border-white/30 dark:border-white/20">
              <h2 id="mobile-filter-title" className="font-display text-2xl tracking-[-0.03em]">
                {t('title')}
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={common('close')}
                className="grid h-11 w-11 place-items-center rounded-md transition-colors hover:bg-muted"
              >
                <X className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="relative overflow-y-auto max-h-[calc(85vh-80px)] overscroll-contain">
              <div className="p-6 pb-12">
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
