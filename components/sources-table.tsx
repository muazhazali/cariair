"use client"

import Link from "next/link"
import { useTranslations } from "next-intl"
import type { Product } from "@/lib/types/db"
import { SafeImage } from "@/components/safe-image"
import { CompareToggle } from "@/components/compare/compare-toggle"

interface SourcesTableProps {
  products: Product[]
}

export function SourcesTable({ products }: SourcesTableProps) {
  const t = useTranslations("sourcesView")
  const tProd = useTranslations("product")

  return (
    <div className="overflow-x-auto border-y border-border">
      <table className="w-full min-w-[42rem] border-collapse text-left">
        <thead className="sticky top-0 z-20 bg-bone">
          <tr className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
            <th scope="col" className="sticky left-0 z-30 min-w-[13rem] border-b border-r border-border bg-bone px-3 py-3 font-medium sm:min-w-[16rem] sm:px-4">
              {t("colBrand")}
            </th>
            <th scope="col" className="border-b border-border px-3 py-3 font-medium sm:px-4">
              {tProd("phLevel")}
            </th>
            <th scope="col" className="border-b border-border px-3 py-3 text-right font-medium sm:px-4">
              {tProd("tds")}
            </th>
            <th scope="col" className="border-b border-border px-3 py-3 font-medium sm:px-4">
              {t("colWaterType")}
            </th>
            <th scope="col" className="border-b border-border px-3 py-3 font-medium sm:px-4">
              {t("colSource")}
            </th>
            <th scope="col" className="hidden border-b border-border px-3 py-3 font-medium sm:table-cell sm:px-4">
              {tProd("kkmApproval")}
            </th>
            <th scope="col" className="border-b border-border px-3 py-3 text-center font-medium sm:px-4">
              <span className="sr-only">{t("colCompare")}</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {products.map((product, index) => (
            <TableRow key={product.id} product={product} index={index} />
          ))}
        </tbody>
      </table>
    </div>
  )
}

function TableRow({ product, index }: { product: Product; index: number }) {
  const t = useTranslations("sourcesView")
  const brand = product.brand?.brand_name ?? "Independent"
  const productName = product.product_name
  const imageUrl = product.images?.[0]?.url ?? "/placeholder.svg"
  const waterType = product.source?.type ?? product.water_type ?? "—"
  const sourceLocation = product.source?.location_address ?? "—"
  const kkm = product.source?.kkm_approval_number
  const compareSummary = {
    id: product.id,
    brandName: brand,
    productName: productName || brand,
    imageUrl,
  }

  return (
    <tr className="group transition-colors hover:bg-muted/40">
      {/* Sticky brand column */}
      <th scope="row" className="sticky left-0 z-10 min-w-[13rem] border-b border-r border-border bg-bone group-hover:bg-muted/40 sm:min-w-[16rem]">
        <Link href={`/sources/${product.id}`} className="flex items-center gap-3 px-3 py-3 sm:px-4">
          <span className="relative grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-md border border-border bg-specimen sm:h-12 sm:w-12">
            <SafeImage
              src={imageUrl}
              alt={brand}
              width={96}
              height={96}
              loading="lazy"
              className="h-full w-full object-contain p-1"
            />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-semibold leading-tight tracking-[-0.015em] line-clamp-1">{brand}</span>
            {productName && productName !== brand && (
              <span className="mt-0.5 block text-[10px] leading-tight text-muted-foreground line-clamp-1">{productName}</span>
            )}
          </span>
        </Link>
      </th>

      {/* pH */}
      <td className="border-b border-border px-3 py-3 sm:px-4">
        <span className={`font-mono text-sm tabular-nums ${product.ph_level == null ? "text-muted-foreground" : "text-foreground"}`}>
          {product.ph_level != null ? Number(product.ph_level).toFixed(1) : "—"}
        </span>
      </td>

      {/* TDS */}
      <td className="border-b border-border px-3 py-3 text-right sm:px-4">
        <span className={`font-mono text-sm tabular-nums ${product.tds == null ? "text-muted-foreground" : "text-foreground"}`}>
          {product.tds != null ? Number(product.tds).toFixed(0) : "—"}
          {product.tds != null && <span className="ml-1 text-[10px] text-muted-foreground">mg/L</span>}
        </span>
      </td>

      {/* Water type */}
      <td className="border-b border-border px-3 py-3 sm:px-4">
        <span className="inline-flex rounded-full bg-source-pale px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-source-foreground">
          {waterType}
        </span>
      </td>

      {/* Source location */}
      <td className="border-b border-border px-3 py-3 sm:px-4">
        <span className="block max-w-[18rem] text-xs leading-5 text-muted-foreground line-clamp-2">{sourceLocation}</span>
      </td>

      {/* KKM (hidden on mobile) */}
      <td className="hidden border-b border-border px-3 py-3 sm:table-cell sm:px-4">
        <span className="font-mono text-xs tabular-nums text-muted-foreground">{kkm ?? "—"}</span>
      </td>

      {/* Compare */}
      <td className="border-b border-border px-3 py-3 text-center sm:px-4">
        <CompareToggle summary={compareSummary} />
      </td>
    </tr>
  )
}