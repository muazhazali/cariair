"use client"

import { useEffect } from "react"
import Link from "next/link"
import { useTranslations } from "next-intl"
import type { Product } from "@/lib/types/db"
import {
  buildCompareRows,
  formatAttributeValue,
  formatMineralValue,
  type AttributeRow,
  type MineralRow,
} from "@/lib/compare/rows"

interface CompareTableProps {
  products: Product[]
  onClose: () => void
}

export function CompareTable({ products, onClose }: CompareTableProps) {
  const t = useTranslations("comparison")
  const tAttr = useTranslations("product")
  const rows = buildCompareRows(products)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose])

  // Resolve a translated label for an attribute row.
  const attrLabel = (row: AttributeRow): string => {
    switch (row.label) {
      case "waterType":
        return t("waterType")
      case "phLevel":
        return tAttr("phLevel")
      case "tdsMgL":
        return t("tdsMgL")
      case "sourceType":
        return t("sourceType")
      case "location":
        return t("location")
      case "manufacturer":
        return t("manufacturer")
      case "kkmApproval":
        return tAttr("kkmApproval")
      default:
        return row.label
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t("title")}
      className="fixed inset-0 z-[60] flex flex-col bg-foreground/40 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        className="mx-auto mt-6 flex w-full max-w-[92rem] flex-1 flex-col overflow-hidden rounded-xl border border-border bg-bone shadow-[0_12px_40px_rgba(52,50,42,0.045)] sm:mt-10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <header className="flex items-start justify-between gap-4 border-b border-border bg-background px-5 py-5 sm:px-8 sm:py-6">
          <div className="min-w-0">
            <p className="section-index">{t("sectionIndex")}</p>
            <h2 className="mt-2 font-display text-3xl leading-none tracking-[-0.035em] sm:text-4xl">
              {t("title")}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              {t("description")}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("close")}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4">
              <path d="m4 4 8 8M12 4 4 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="square" />
            </svg>
          </button>
        </header>

        {/* Body — scrollable table */}
        <div className="flex-1 overflow-auto bg-bone">
          <table className="w-full border-collapse text-left">
            <thead className="sticky top-0 z-20 bg-bone">
              <tr>
                {/* Sticky label column header */}
                <th
                  scope="col"
                  className="sticky left-0 z-30 w-40 min-w-[9rem] border-b border-r border-border bg-bone px-3 py-4 sm:w-52 sm:min-w-[12rem] sm:px-4"
                >
                  <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                    {t("property")}
                  </span>
                </th>
                {products.map((p) => (
                  <th
                    key={p.id}
                    scope="col"
                    className="w-40 min-w-[9rem] border-b border-border bg-bone px-3 py-4 align-bottom sm:w-52 sm:min-w-[12rem] sm:px-4"
                  >
                    <ProductColumnHeader product={p} />
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {/* Attribute rows */}
              {rows.attributes.map((row) => (
                <tr key={row.key} className="group">
                  <th
                    scope="row"
                    className="sticky left-0 z-10 border-b border-r border-border bg-bone px-3 py-3 sm:px-4"
                  >
                    <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                      {attrLabel(row)}
                    </span>
                  </th>
                  {row.values.map((value, i) => {
                    const isBest = row.bestIndex != null && row.bestIndex === i
                    const text = formatAttributeValue(row, value)
                    return (
                      <td
                        key={i}
                        className={[
                          "border-b border-border px-3 py-3 align-top sm:px-4",
                          isBest ? "bg-source-pale/60" : "bg-card/40",
                        ].join(" ")}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={[
                              "font-mono text-sm tabular-nums",
                              value == null ? "text-muted-foreground" : "text-foreground",
                            ].join(" ")}
                          >
                            {text}
                          </span>
                          {row.unit && value != null && (
                            <span className="text-[10px] text-muted-foreground">{row.unit}</span>
                          )}
                          {isBest && (
                            <span className="rounded-full bg-source-pale px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-[0.08em] text-source-foreground">
                              {row.direction === "lower" ? t("lowest") : t("highest")}
                            </span>
                          )}
                        </div>
                      </td>
                    )
                  })}
                </tr>
              ))}

              {/* Mineral section divider */}
              <tr>
                <th
                  scope="row"
                  colSpan={products.length + 1}
                  className="sticky left-0 border-b border-border bg-parchment px-3 py-3 sm:px-4"
                >
                  <span className="section-index">{t("mineralComposition")}</span>
                  <span className="ml-3 font-mono text-[10px] text-muted-foreground">
                    {t("mineralCompositionMgL")}
                  </span>
                </th>
              </tr>

              {/* Mineral rows */}
              {rows.minerals.length === 0 ? (
                <tr>
                  <th scope="row" className="sticky left-0 border-b border-r border-border bg-bone px-3 py-4 sm:px-4" />
                  <td colSpan={products.length} className="border-b border-border px-3 py-8 text-center text-sm text-muted-foreground sm:px-4">
                    {t("noMineralData")}
                  </td>
                </tr>
              ) : (
                rows.minerals.map((row) => (
                  <tr key={row.key}>
                    <th
                      scope="row"
                      className="sticky left-0 z-10 border-b border-r border-border bg-bone px-3 py-3 sm:px-4"
                    >
                      <span className="flex items-center gap-2">
                        <span className="font-semibold">{row.label}</span>
                        <span className="font-mono text-[10px] text-muted-foreground">{row.symbol}</span>
                      </span>
                    </th>
                    {row.values.map((value, i) => {
                      const isBest = row.bestIndex != null && row.bestIndex === i
                      return (
                        <td
                          key={i}
                          className={[
                            "border-b border-border px-3 py-3 align-top sm:px-4",
                            isBest ? "bg-source-pale/60" : "bg-card/40",
                          ].join(" ")}
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className={[
                                "font-mono text-sm tabular-nums",
                                value == null ? "text-muted-foreground" : "text-foreground",
                              ].join(" ")}
                            >
                              {formatMineralValue(value)}
                            </span>
                            {value != null && (
                              <span className="text-[10px] text-muted-foreground">mg/L</span>
                            )}
                            {isBest && (
                              <span className="rounded-full bg-source-pale px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-[0.08em] text-source-foreground">
                                {row.direction === "lower" ? t("lowest") : t("highest")}
                              </span>
                            )}
                          </div>
                        </td>
                      )
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <footer className="flex items-center justify-between gap-4 border-t border-border bg-background px-5 py-3 sm:px-8">
          <p className="hidden text-xs text-muted-foreground sm:block">{t("highlightLegend")}</p>
          <button
            type="button"
            onClick={onClose}
            className="ml-auto inline-flex h-10 items-center rounded-md border border-border bg-background px-4 text-xs font-semibold uppercase tracking-[0.08em] transition-colors hover:bg-muted"
          >
            {t("close")}
          </button>
        </footer>
      </div>
    </div>
  )
}

function ProductColumnHeader({ product }: { product: Product }) {
  const imageUrl = product.images?.[0]?.url ?? "/placeholder.svg"
  const brand = product.brand?.brand_name ?? "Independent"
  const productName = product.product_name

  return (
    <Link
      href={`/sources/${product.id}`}
      className="group/header flex flex-col gap-2"
    >
      <span className="relative block aspect-square w-full overflow-hidden rounded-md border border-border bg-specimen">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt={brand}
          loading="lazy"
          className="h-full w-full object-contain p-2 transition-transform duration-300 group-hover/header:scale-[1.03]"
        />
      </span>
      <span className="block text-sm font-semibold leading-snug tracking-[-0.015em] line-clamp-2">
        {brand}
      </span>
      {productName && productName !== brand && (
        <span className="-mt-1 block text-[10px] leading-tight text-muted-foreground line-clamp-1">
          {productName}
        </span>
      )}
      <span className="mt-0.5 inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-survey-foreground group-hover/header:underline">
        View details
        <svg viewBox="0 0 12 12" fill="none" className="h-2.5 w-2.5">
          <path d="M3 9 9 3M5 3h4v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" />
        </svg>
      </span>
    </Link>
  )
}