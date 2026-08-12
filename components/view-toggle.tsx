"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"
import type { ViewMode } from "@/lib/view"

export function ViewToggle({ current }: { current: ViewMode }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const t = useTranslations("sourcesView")

  const setView = (mode: ViewMode) => {
    if (mode === current) return
    const params = new URLSearchParams(searchParams.toString())
    if (mode === "cards") params.delete("view")
    else params.set("view", mode)
    router.push(params.size ? `/?${params.toString()}` : "/")
  }

  return (
    <div
      role="group"
      aria-label={t("viewToggleLabel")}
      className="inline-flex items-center rounded-md border border-border bg-background p-0.5"
    >
      <button
        type="button"
        onClick={() => setView("cards")}
        aria-pressed={current === "cards"}
        className={[
          "inline-flex h-9 items-center gap-1.5 rounded-[5px] px-3 text-xs font-semibold uppercase tracking-[0.08em] transition-colors",
          current === "cards"
            ? "bg-foreground text-background"
            : "text-muted-foreground hover:text-foreground",
        ].join(" ")}
      >
        <GridGlyph className={current === "cards" ? "" : "opacity-70"} />
        {t("viewCards")}
      </button>
      <button
        type="button"
        onClick={() => setView("table")}
        aria-pressed={current === "table"}
        className={[
          "inline-flex h-9 items-center gap-1.5 rounded-[5px] px-3 text-xs font-semibold uppercase tracking-[0.08em] transition-colors",
          current === "table"
            ? "bg-foreground text-background"
            : "text-muted-foreground hover:text-foreground",
        ].join(" ")}
      >
        <TableGlyph className={current === "table" ? "" : "opacity-70"} />
        {t("viewTable")}
      </button>
    </div>
  )
}

function GridGlyph({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 14 14" fill="none" className={`h-3.5 w-3.5 ${className}`} aria-hidden="true">
      <rect x="1.5" y="1.5" width="4.5" height="4.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="8" y="1.5" width="4.5" height="4.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="1.5" y="8" width="4.5" height="4.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="8" y="8" width="4.5" height="4.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

function TableGlyph({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 14 14" fill="none" className={`h-3.5 w-3.5 ${className}`} aria-hidden="true">
      <rect x="1.5" y="2" width="11" height="10" stroke="currentColor" strokeWidth="1.5" />
      <path d="M1.5 5.5h11M1.5 9h11M5 2v10M9 2v10" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}