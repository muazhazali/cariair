"use client"

import Link from "next/link"
import { useTranslations } from "next-intl"
import { Product } from "@/lib/types/db"

interface ProductCardProps { product: Product; index?: number }

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const t = useTranslations("productCard")
  const imageUrl = product.images?.[0]?.url ?? "/placeholder.svg"
  const waterType = product.source?.type ?? "Water"

  return (
    <Link href={`/sources/${product.id}`}
      className="group flex min-h-[28rem] flex-col overflow-hidden rounded-xl border border-border bg-card transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-foreground/25 hover:shadow-[0_4px_18px_rgba(52,50,42,0.04)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}>
      <div className="relative flex min-h-56 flex-1 items-center justify-center overflow-hidden border-b border-border bg-[#eeece5] p-6 sm:min-h-64">
        <span className="absolute left-4 top-4 rounded-full bg-[#dfe8d9] px-2.5 py-1 font-mono text-[9px] font-semibold uppercase tracking-[0.12em] text-[#405039]">{waterType}</span>
        <span className="absolute right-4 top-4 font-mono text-[9px] text-muted-foreground">/{String(index + 1).padStart(2, "0")}</span>
        <img src={imageUrl} alt={product.product_name || product.brand?.brand_name || "Bottled water product"}
          className="h-48 w-full object-contain transition-transform duration-500 ease-out group-hover:scale-[1.04] sm:h-56"
          loading="lazy" onError={(event) => { if (!event.currentTarget.src.endsWith("placeholder.svg")) event.currentTarget.src = "/placeholder.svg" }} />
      </div>

      <div className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">{product.brand?.brand_name ?? "Independent"}</p>
            <h3 className="mt-1.5 text-lg font-semibold leading-snug tracking-[-0.015em] text-pretty">{product.product_name || product.brand?.brand_name}</h3>
          </div>
          <ArrowGlyph />
        </div>

        {product.source?.location_address && (
          <p className="mt-3 flex items-start gap-2 text-xs leading-5 text-muted-foreground"><PinGlyph /><span className="line-clamp-2">{product.source.location_address}</span></p>
        )}

        <div className="mt-5 grid grid-cols-2 border-t border-border pt-4">
          <Metric label={t("phLevel")} value={product.ph_level != null ? Number(product.ph_level).toFixed(1) : "—"} />
          <Metric label={t("tds")} value={product.tds != null ? `${Number(product.tds).toFixed(0)}` : "—"} unit={product.tds != null ? "mg/L" : undefined} bordered />
        </div>
      </div>
    </Link>
  )
}

function Metric({ label, value, unit, bordered }: { label: string; value: string; unit?: string; bordered?: boolean }) {
  return <div className={bordered ? "border-l border-border pl-4" : "pr-4"}><span className="block text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{label}</span><span className="mt-1 block font-mono text-lg tabular-nums">{value}{unit && <small className="ml-1 text-[9px] text-muted-foreground">{unit}</small>}</span></div>
}

function ArrowGlyph() { return <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md border border-border transition-colors group-hover:bg-foreground group-hover:text-background"><svg viewBox="0 0 20 20" className="h-4 w-4" aria-hidden="true" fill="none"><path d="M5 15 15 5M8 5h7v7" stroke="currentColor" strokeWidth="1.8"/></svg></span> }
function PinGlyph() { return <svg viewBox="0 0 20 20" className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" fill="none"><path d="M10 18s5-5.3 5-10a5 5 0 1 0-10 0c0 4.7 5 10 5 10Z" stroke="currentColor" strokeWidth="1.7"/><circle cx="10" cy="8" r="1.5" fill="currentColor"/></svg> }
