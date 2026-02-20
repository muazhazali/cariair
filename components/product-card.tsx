"use client"

import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { MapPin } from "lucide-react"
import { WaterTypeBadge } from "@/components/water-type-badge"
import { getImageUrl } from "@/lib/pocketbase"
import { Product } from "@/lib/types/pocketbase"

interface ProductCardProps {
    product: Product
    showComparison?: boolean
    isSelected?: boolean
    canSelect?: boolean
    onToggleComparison?: (productId: string) => void
}

export function ProductCard({
    product,
    showComparison = false,
    isSelected = false,
    canSelect = true,
    onToggleComparison,
}: ProductCardProps) {
    const brand = product.expand?.brand
    const source = product.expand?.source
    const imageUrl = product.images && product.images.length > 0
        ? getImageUrl(product, product.images[0])
        : '/placeholder.jpg'

    return (
        <Card
            key={product.id}
            className={`group overflow-hidden flex flex-col relative border-2 border-gray-200 dark:border-gray-800 transition-all duration-200 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-700 rounded-lg ${isSelected ? 'ring-2 ring-blue-500 border-blue-500 dark:ring-blue-400 dark:border-blue-400' : ''
                }`}
        >
            {showComparison && (
                <div className="absolute top-2 right-2 sm:top-3 sm:right-3 z-10">
                    <Checkbox
                        checked={isSelected}
                        disabled={!canSelect && !isSelected}
                        onCheckedChange={() => onToggleComparison?.(product.id)}
                        className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm shadow-md h-5 w-5 sm:h-4 sm:w-4"
                        onClick={(e) => {
                            if (!canSelect && !isSelected) {
                                e.preventDefault();
                            }
                        }}
                    />
                </div>
            )}

            {/* Image Section */}
            <Link href={`/sources/${product.id}`} className="block">
                <div className="relative h-48 sm:h-56 w-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 overflow-hidden rounded-t-lg">
                    <Image
                        src={imageUrl}
                        alt={product.product_name || "Product"}
                        fill
                        className="object-contain p-4 sm:p-6 transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute top-2 left-2 sm:top-3 sm:left-3">
                        <WaterTypeBadge type={source?.type} className="shadow-sm" />
                    </div>
                </div>
            </Link>

            <CardContent className="p-4 sm:p-5 flex-1 flex flex-col">
                {/* Product Name */}
                <Link href={`/sources/${product.id}`} className="block mb-2 sm:mb-3">
                    {brand?.brand_name && (
                        <h3 className="text-lg sm:text-xl font-bold line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {brand.brand_name}
                        </h3>
                    )}
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1" title={product.product_name}>
                        {product.product_name}
                    </p>
                </Link>

                {/* Key Metrics */}
                <div className="space-y-2 sm:space-y-3 mb-3 sm:mb-4 flex-1">
                    {source?.location_address && (
                        <div className="flex items-start gap-2">
                            <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                            <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 line-clamp-2" title={source.location_address}>
                                {source.location_address}
                            </span>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-3 sm:gap-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                        {product.ph_level !== undefined && product.ph_level !== null ? (
                            <div className="flex flex-col items-center justify-center py-3 px-2 rounded-lg bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700">
                                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">pH Level</div>
                                <div className={`text-3xl font-bold ${product.ph_level < 7
                                    ? "text-orange-600 dark:text-orange-400"
                                    : product.ph_level > 7.5
                                        ? "text-blue-600 dark:text-blue-400"
                                        : "text-green-600 dark:text-green-400"
                                    }`}>
                                    {product.ph_level.toFixed(1)}
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-3 px-2 rounded-lg bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700">
                                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">pH Level</div>
                                <div className="text-sm font-normal text-gray-400 mt-1">N/A</div>
                            </div>
                        )}

                        {product.tds !== undefined && product.tds !== null ? (
                            <div className="flex flex-col items-center justify-center py-3 px-2 rounded-lg bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700">
                                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">TDS</div>
                                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                                    {product.tds.toFixed(0)}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">mg/L</div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-3 px-2 rounded-lg bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700">
                                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">TDS</div>
                                <div className="text-sm font-normal text-gray-400 mt-1">N/A</div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Action Button */}
                <Link href={`/sources/${product.id}`} className="block">
                    <Button
                        variant="outline"
                        className="w-full border-2 text-sm group-hover:border-blue-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
                    >
                        View Full Details
                    </Button>
                </Link>
            </CardContent>
        </Card>
    )
}
