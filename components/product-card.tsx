"use client"

import Link from "next/link"
import Image from "next/image"
import { MapPin } from "lucide-react"
import { Product } from "@/lib/types/db"

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const brand = product.brand
  const source = product.source

  // Get image URL - handles both object format {id, filename, url} and string format
  const getImageUrl = (): string => {
    if (!product.images || product.images.length === 0) {
      return '/placeholder.jpg'
    }
    const firstImage = product.images[0]
    // If it's an object with id property, use it; if it's a string, use directly
    const imageId = typeof firstImage === 'string' ? firstImage : firstImage?.id
    return imageId ? `/api/images/${imageId}` : '/placeholder.jpg'
  }

  const imageUrl = getImageUrl()

  // pH color indicator
  const getPhColor = (ph: number) => {
    if (ph < 7) return "text-orange-600"
    if (ph > 7.5) return "text-blue-600"
    return "text-green-600"
  }

  return (
    <Link
      href={`/sources/${product.id}`}
      className="group block bg-card border rounded-lg overflow-hidden hover:border-blue-300 transition-colors"
    >
      {/* Image */}
      <div className="relative h-40 bg-muted">
        <Image
          src={imageUrl}
          alt={product.product_name || "Product"}
          fill
          className="object-contain p-4"
          onError={(e) => {
            // Fallback to placeholder if image fails to load
            const img = e.currentTarget as HTMLImageElement
            img.src = '/placeholder.jpg'
          }}
        />
      </div>

      {/* Content */}
      <div className="p-4 space-y-2">
        {/* Brand */}
        {brand?.brand_name && (
          <h3 className="font-semibold text-lg group-hover:text-blue-600 transition-colors">
            {brand.brand_name}
          </h3>
        )}

        {/* Product Name */}
        <p className="text-sm text-muted-foreground line-clamp-1">
          {product.product_name}
        </p>

        {/* Location */}
        {source?.location_address && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" />
            <span className="line-clamp-1">{source.location_address}</span>
          </div>
        )}

        {/* Metrics */}
        <div className="flex items-center gap-4 pt-2 text-sm">
          {product.ph_level !== undefined && product.ph_level !== null && (
            <span>
              pH <span className={getPhColor(Number(product.ph_level))}>{Number(product.ph_level).toFixed(1)}</span>
            </span>
          )}
          {product.tds !== undefined && product.tds !== null && (
            <span className="text-purple-600">
              TDS {Number(product.tds).toFixed(0)}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
