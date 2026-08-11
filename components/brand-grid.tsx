"use client"

import { BrandCard } from "./brand-card"
import { BrandWithStats } from "@/lib/types/db"

interface BrandGridProps {
  brands: BrandWithStats[]
  translations: {
    products: string
    productSingular: string
    avgPh: string
    avgTds: string
    parentCompany: string
    viewBrand: string
    noData: string
    noBrands: string
    noBrandsDesc: string
  }
}

export function BrandGrid({ brands, translations }: BrandGridProps) {
  if (brands.length === 0) {
    return (
      <div className="text-center py-16">
        <h3 className="text-lg font-medium mb-2">{translations.noBrands}</h3>
        <p className="text-muted-foreground">{translations.noBrandsDesc}</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {brands.map((brand) => (
        <BrandCard key={brand.id} brand={brand} translations={translations} />
      ))}
    </div>
  )
}