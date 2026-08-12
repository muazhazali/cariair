"use client"

import Link from "next/link"
import { FlaskConical, MapPin, Waves } from "lucide-react"
import { BrandWithStats } from "@/lib/types/db"
import { SafeImage } from "@/components/safe-image"

interface BrandCardProps {
  brand: BrandWithStats
  translations: {
    waterType: string
    alkaline: string
    neutral: string
    acidic: string
    parentCompany: string
    viewBrand: string
    noData: string
  }
}

export function BrandCard({ brand, translations }: BrandCardProps) {
  const href = brand.featuredProductId
    ? `/sources/${brand.featuredProductId}`
    : `/?brand=${brand.id}`

  // Derive a pH category from the average pH for a glanceable label.
  const phClass =
    brand.avgPh === null
      ? null
      : brand.avgPh < 7
        ? { label: translations.acidic, color: "text-orange-600" }
        : brand.avgPh > 7
          ? { label: translations.alkaline, color: "text-blue-600" }
          : { label: translations.neutral, color: "text-green-600" }

  // Primary water type (first if multiple).
  const waterType = brand.waterTypes[0] ?? null

  return (
    <Link
      href={href}
      className="group flex flex-col overflow-hidden rounded-xl border bg-card transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[0_4px_18px_rgba(52,50,42,0.04)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {/* Image */}
      <div className="relative h-44 bg-muted">
        <SafeImage
          src={brand.imageUrl ?? "/placeholder.svg"}
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
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex flex-col">
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <FlaskConical className="h-3 w-3" />
              pH
            </span>
            <span className={`font-medium ${phClass?.color ?? ""}`}>
              {phClass ? phClass.label : translations.noData}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Waves className="h-3 w-3" />
              {translations.waterType}
            </span>
            <span className="font-medium line-clamp-1">
              {waterType ?? translations.noData}
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
