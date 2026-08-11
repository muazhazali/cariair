"use client"

import Link from "next/link"
import { Droplet, FlaskConical, MapPin, Package } from "lucide-react"
import { BrandWithStats } from "@/lib/types/db"
import { SafeImage } from "@/components/safe-image"

interface BrandCardProps {
  brand: BrandWithStats
  translations: {
    products: string
    productSingular: string
    avgPh: string
    avgTds: string
    parentCompany: string
    viewBrand: string
    noData: string
  }
}

export function BrandCard({ brand, translations }: BrandCardProps) {
  const productLabel =
    brand.productCount === 1 ? translations.productSingular : translations.products

  const href = brand.featuredProductId
    ? `/sources/${brand.featuredProductId}`
    : `/?brand=${brand.id}`

  return (
    <Link
      href={href}
      className="group flex flex-col bg-card border rounded-xl overflow-hidden hover:border-primary/40 hover:shadow-md transition-all"
    >
      {/* Image */}
      <div className="relative h-44 bg-muted">
        <SafeImage
          src={brand.imageUrl ?? "/placeholder.jpg"}
          alt={brand.brand_name}
          className="absolute inset-0 h-full w-full object-contain p-4"
        />
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4 space-y-3">
        <div className="space-y-1">
          <h3 className="font-semibold text-lg leading-tight group-hover:text-primary transition-colors">
            {brand.brand_name}
          </h3>
          {brand.parent_company && (
            <p className="text-xs text-muted-foreground">{brand.parent_company}</p>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 text-sm">
          <div className="flex flex-col">
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Package className="h-3 w-3" />
              {productLabel}
            </span>
            <span className="font-medium">{brand.productCount}</span>
          </div>
          <div className="flex flex-col">
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <FlaskConical className="h-3 w-3" />
              {translations.avgPh}
            </span>
            <span className="font-medium">
              {brand.avgPh !== null ? brand.avgPh.toFixed(1) : translations.noData}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Droplet className="h-3 w-3" />
              {translations.avgTds}
            </span>
            <span className="font-medium">
              {brand.avgTds !== null ? brand.avgTds.toFixed(0) : translations.noData}
            </span>
          </div>
        </div>

        {/* Source locations */}
        {brand.sourceLocations.length > 0 && (
          <div className="flex items-start gap-1 text-xs text-muted-foreground pt-1">
            <MapPin className="h-3 w-3 mt-0.5 shrink-0" />
            <span className="line-clamp-1">
              {brand.sourceLocations.join(", ")}
            </span>
          </div>
        )}

        <div className="mt-auto pt-2 text-xs font-medium text-primary group-hover:underline">
          {translations.viewBrand}
        </div>
      </div>
    </Link>
  )
}