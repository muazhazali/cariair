"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { SearchIcon } from "lucide-react"
import { getImageUrl } from "@/lib/pocketbase"
import { ProductFilters } from "@/components/product-filters"
import { ProductComparison } from "@/components/product-comparison"
import { ProductSort, sortProducts, SortOption } from "@/components/product-sort"
import { searchWaterSources, SearchFilters } from "@/lib/products"
import { Product } from "@/lib/types/pocketbase"

interface SourcesViewProps {
  initialProducts: Product[]
  brands: { id: string; brand_name: string }[]
}

const WATER_TYPES = ["Underground", "Spring", "Municipal", "Oxygenated"]

export function SourcesView({ initialProducts, brands }: SourcesViewProps) {
  const [products, setProducts] = useState(initialProducts)
  const [loading, setLoading] = useState(false)
  const [selectedForComparison, setSelectedForComparison] = useState<string[]>([])
  const [sortOption, setSortOption] = useState<SortOption>("name_asc")
  
  // Initial filter state: Select All by default
  const initialFilters: SearchFilters = {
    types: WATER_TYPES,
    brands: brands.map(b => b.id),
    minPh: 0,
    maxPh: 14,
    minTds: 0,
    maxTds: 500
  }

  // We don't need to store the filter state here unless we want to debounce or something,
  // but ProductFilters manages its own form state until "Apply" is clicked.
  // When "Apply" is clicked, we get the new filters.

  const handleFilterChange = async (newFilters: any) => {
     setLoading(true)
     try {
       // Optimization: Use exclusion if more than half are selected
       // Types
       let typeFilters: { types?: string[], excludedTypes?: string[] } = {}
       if (newFilters.types.length === WATER_TYPES.length) {
         // All selected -> No filter
       } else if (newFilters.types.length > WATER_TYPES.length / 2) {
         // More than half selected -> Exclude unselected
         typeFilters.excludedTypes = WATER_TYPES.filter(t => !newFilters.types.includes(t))
       } else {
         // Less than half selected -> Include selected
         typeFilters.types = newFilters.types
       }

       // Brands
       let brandFilters: { brands?: string[], excludedBrands?: string[] } = {}
       if (newFilters.brands.length === brands.length) {
         // All selected -> No filter
       } else if (newFilters.brands.length > brands.length / 2) {
         // More than half selected -> Exclude unselected
         const selectedSet = new Set(newFilters.brands)
         brandFilters.excludedBrands = brands
           .filter(b => !selectedSet.has(b.id))
           .map(b => b.id)
       } else {
         // Less than half selected -> Include selected
         brandFilters.brands = newFilters.brands
       }
       
       const filters: SearchFilters = {
         ...typeFilters,
         ...brandFilters,
         minPh: newFilters.minPh,
         maxPh: newFilters.maxPh,
         minTds: newFilters.minTds,
         maxTds: newFilters.maxTds
       }
       
       const results = await searchWaterSources(filters)
       setProducts(results)
     } catch (error) {
       console.error("Error fetching filtered products:", error)
     } finally {
       setLoading(false)
     }
  }

  // Sort products based on selected sort option
  const sortedProducts = useMemo(() => {
    return sortProducts(products, sortOption)
  }, [products, sortOption])

  // Get selected products for comparison
  const comparisonProducts = useMemo(() => {
    return sortedProducts.filter(p => selectedForComparison.includes(p.id))
  }, [sortedProducts, selectedForComparison])

  const handleToggleComparison = (productId: string) => {
    setSelectedForComparison(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId)
      } else if (prev.length < 3) {
        return [...prev, productId]
      } else {
        // Replace the first one if already at max
        return [prev[1], prev[2], productId]
      }
    })
  }

  const handleRemoveFromComparison = (productId: string) => {
    setSelectedForComparison(prev => prev.filter(id => id !== productId))
  }

  const handleClearComparison = () => {
    setSelectedForComparison([])
  }

  return (
    <div className="grid gap-6 md:grid-cols-[240px_1fr]">
      <div className="space-y-6">
        <ProductFilters 
          brands={brands} 
          onApply={handleFilterChange} 
          defaultValues={{
            types: initialFilters.types,
            brands: initialFilters.brands,
            minPh: initialFilters.minPh,
            maxPh: initialFilters.maxPh,
            minTds: initialFilters.minTds,
            maxTds: initialFilters.maxTds
          }}
        />
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            {loading ? "Updating..." : `${products.length} ${products.length === 1 ? "result" : "results"} found`}
          </p>
          <ProductSort value={sortOption} onValueChange={setSortOption} />
        </div>

        <div className={`grid gap-6 sm:grid-cols-2 lg:grid-cols-3 ${loading ? "opacity-50" : ""}`}>
          {sortedProducts.map((product) => {
            const brand = product.expand?.brand;
            const source = product.expand?.source;
            const imageUrl = product.images && product.images.length > 0 
              ? getImageUrl(product, product.images[0])
              : '/placeholder.jpg';
            const isSelected = selectedForComparison.includes(product.id);
            const canSelect = selectedForComparison.length < 3 || isSelected;
            
            return (
              <Card key={product.id} className="overflow-hidden flex flex-col relative">
                <div className="absolute top-2 right-2 z-10">
                  <Checkbox
                    checked={isSelected}
                    disabled={!canSelect && !isSelected}
                    onCheckedChange={() => handleToggleComparison(product.id)}
                    className="bg-white dark:bg-gray-900"
                    onClick={(e) => {
                      if (!canSelect && !isSelected) {
                        e.preventDefault();
                      }
                    }}
                  />
                </div>
                <div className="relative h-48 w-full bg-gray-100 dark:bg-gray-800">
                  <Image
                    src={imageUrl}
                    alt={product.product_name || "Product"}
                    fill
                    className="object-contain p-4"
                  />
                </div>
                <CardContent className="p-4 flex-1">
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="text-lg font-semibold line-clamp-1" title={product.product_name}>{product.product_name}</h3>
                    <Badge variant="outline">{source?.type || "Unknown"}</Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Location:</span>
                      <span className="text-sm font-medium line-clamp-1 text-right max-w-[50%]" title={source?.location_address}>
                        {source?.location_address || "Unknown"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">pH Level:</span>
                      <span className="text-sm font-medium">{product.ph_level ?? "N/A"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">TDS:</span>
                      <span className="text-sm font-medium">{product.tds ? `${product.tds} mg/L` : "N/A"}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="p-4 pt-0 mt-auto">
                  <Link
                    href={`/sources/${product.id}`}
                    className="w-full text-center text-sm font-medium text-primary hover:underline"
                  >
                    View Details
                  </Link>
                </CardFooter>
              </Card>
            )
          })}
        </div>

        {products.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-200 p-12 text-center dark:border-gray-800">
            <div className="rounded-full bg-gray-100 p-3 dark:bg-gray-800">
              <SearchIcon className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">No results found</h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Try adjusting your filters
            </p>
          </div>
        )}
      </div>

      {/* Comparison Component */}
      <ProductComparison
        products={comparisonProducts}
        onRemove={handleRemoveFromComparison}
        onClear={handleClearComparison}
      />
    </div>
  )
}
