"use client"

import Link from "next/link"
import { useTranslations } from "next-intl"
import { ProductCard } from "./product-card"
import { Product } from "@/lib/types/db"

export function HomeContent({ products }: { products: Product[] }) {
  const t = useTranslations("sourcesView")
  if (products.length === 0) {
    return (
      <div className="border-y border-border py-20 text-center">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-lg bg-[#dfe8d9] text-[#405039]" aria-hidden="true">∅</span>
        <h3 className="mt-5 font-display text-3xl tracking-[-0.03em]">{t("noResults")}</h3>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">{t("noResultsDesc")}</p>
        <Link href="/" className="quiet-button mt-6">{t("search")}</Link>
      </div>
    )
  }
  return <div className="registry-grid grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">{products.map((product, index) => <ProductCard key={product.id} product={product} index={index} />)}</div>
}
