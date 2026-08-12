"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { useCompare } from "./compare-store"
import { CompareTable } from "./compare-table"
import type { Product } from "@/lib/types/db"

interface CompareDockProps {
  // All products currently rendered on the page, keyed by id, so the dock can
  // resolve selected ids to full Product objects without an extra fetch.
  productsById: Record<string, Product>
}

export function CompareDock({ productsById }: CompareDockProps) {
  const t = useTranslations("comparison")
  const { ids, summaries, count, max, remove, clear } = useCompare()
  const [open, setOpen] = useState(false)

  // Close on Escape handled by the overlay itself; also lock body scroll when open.
  useEffect(() => {
    if (!open) return
    const original = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = original
    }
  }, [open])

  if (count === 0) return null

  const selectedProducts = ids
    .map((id) => productsById[id])
    .filter((p): p is Product => Boolean(p))

  return (
    <>
      <div
        role="region"
        aria-label={t("dockLabel")}
        className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 backdrop-blur-md shadow-[0_-8px_40px_rgba(52,50,42,0.06)]"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="mx-auto flex max-w-[88rem] items-center gap-3 px-5 py-3 sm:px-8 lg:px-12">
          {/* Thumbnails */}
          <ul className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto">
            {ids.map((id) => {
              const s = summaries[id]
              if (!s) return null
              return (
                <li key={id} className="flex shrink-0 items-center gap-2 rounded-md border border-border bg-card px-2 py-1.5">
                  <Thumbnail src={s.imageUrl} alt={s.productName || s.brandName} />
                  <span className="hidden max-w-[10rem] truncate text-xs font-medium sm:block">
                    {s.productName || s.brandName}
                  </span>
                  <button
                    type="button"
                    onClick={() => remove(id)}
                    aria-label={t("removeFromCompare")}
                    className="grid h-6 w-6 shrink-0 place-items-center rounded-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    <svg viewBox="0 0 12 12" fill="none" className="h-3 w-3">
                      <path d="m3 3 6 6M9 3 3 9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="square" />
                    </svg>
                  </button>
                </li>
              )
            })}
          </ul>

          {/* Actions */}
          <div className="flex shrink-0 items-center gap-2">
            <span className="hidden font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground sm:block">
              {t("productsSelected", { count })}
            </span>
            <button
              type="button"
              onClick={clear}
              className="hidden rounded-md border border-border bg-background px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
            >
              {t("clearAll")}
            </button>
            <button
              type="button"
              onClick={() => setOpen(true)}
              disabled={count < 2}
              className="inline-flex h-10 items-center gap-2 rounded-md bg-foreground px-4 text-xs font-semibold uppercase tracking-[0.08em] text-background transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {t("compareButton", { count, max })}
              <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="square" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {open && (
        <CompareTable
          products={selectedProducts}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  )
}

function Thumbnail({ src, alt }: { src: string; alt: string }) {
  // Tiny bottle thumb; fallback handled by SafeImage pattern inline to keep this
  // client component light.
  const [errored, setErrored] = useState(false)
  if (errored || !src) {
    return (
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-sm bg-specimen font-mono text-[9px] text-muted-foreground">
        —
      </span>
    )
  }
  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      src={src}
      alt={alt}
      onError={() => setErrored(true)}
      className="h-8 w-8 shrink-0 rounded-sm bg-specimen object-contain"
    />
  )
}