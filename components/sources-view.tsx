"use client"

import { useState, useMemo, FormEvent } from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SearchIcon, MapPin } from "lucide-react"
import { getImageUrl } from "@/lib/pocketbase"
import { EnhancedProductFilters } from "@/components/enhanced-product-filters"
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
  const [searchInput, setSearchInput] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilters, setActiveFilters] = useState<SearchFilters>({})
  
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
  const performSearch = async (opts?: { query?: string; filters?: SearchFilters }) => {
    setLoading(true)
    try {
      const filtersToUse = opts?.filters ?? activeFilters
      const queryToUse = opts?.query ?? searchQuery

      const results = await searchWaterSources({
        ...filtersToUse,
        query: queryToUse.trim() || undefined,
      })

      setProducts(results)
    } catch (error) {
      console.error("Error fetching products:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = async (newFilters: any) => {
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

    setActiveFilters(filters)
    await performSearch({ filters })
  }

  const handleSearchSubmit = async (event: FormEvent) => {
    event.preventDefault()
    const value = searchInput.trim()
    setSearchQuery(value)
    await performSearch({ query: value })
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
    <div className="grid gap-6 md:grid-cols-[280px_1fr]">
      <div className="space-y-6">
        <EnhancedProductFilters
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
        <div className="mb-6 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="animate-pulse">Updating...</span>
                  </span>
                ) : (
                  <>
                    <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">{products.length}</span>
                    <span className="ml-2">{products.length === 1 ? "water source" : "water sources"} found</span>
                  </>
                )}
              </p>
            </div>
            <form
              onSubmit={handleSearchSubmit}
              className="flex w-full sm:w-auto items-center gap-2"
            >
              <div className="relative flex-1 min-w-[200px]">
                <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search by brand, product, or location"
                  className="pl-9 pr-3 h-9"
                />
              </div>
              <Button type="submit" variant="outline" className="h-9 px-3 whitespace-nowrap">
                Search
              </Button>
              <ProductSort value={sortOption} onValueChange={setSortOption} />
            </form>
          </div>
          {searchQuery && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Showing results for <span className="font-medium">“{searchQuery}”</span>
            </p>
          )}
        </div>

        <div className={`grid gap-6 sm:grid-cols-2 lg:grid-cols-3 ${loading ? "opacity-50 pointer-events-none" : ""}`}>
          {sortedProducts.map((product) => {
            const brand = product.expand?.brand;
            const source = product.expand?.source;
            const imageUrl = product.images && product.images.length > 0 
              ? getImageUrl(product, product.images[0])
              : '/placeholder.jpg';
            const isSelected = selectedForComparison.includes(product.id);
            const canSelect = selectedForComparison.length < 3 || isSelected;
            
            return (
              <Card 
                key={product.id} 
                className={`group overflow-hidden flex flex-col relative border-2 transition-all duration-200 hover:shadow-xl hover:border-primary/50 ${
                  isSelected ? 'ring-2 ring-primary border-primary' : ''
                }`}
              >
                <div className="absolute top-3 right-3 z-10">
                  <Checkbox
                    checked={isSelected}
                    disabled={!canSelect && !isSelected}
                    onCheckedChange={() => handleToggleComparison(product.id)}
                    className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm shadow-md"
                    onClick={(e) => {
                      if (!canSelect && !isSelected) {
                        e.preventDefault();
                      }
                    }}
                  />
                </div>
                
                {/* Image Section */}
                <Link href={`/sources/${product.id}`} className="block">
                  <div className="relative h-56 w-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 overflow-hidden">
                    <Image
                      src={imageUrl}
                      alt={product.product_name || "Product"}
                      fill
                      className="object-contain p-6 transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute top-3 left-3">
                      <Badge variant="secondary" className="shadow-sm">
                        {source?.type || "Unknown"}
                      </Badge>
                    </div>
                  </div>
                </Link>

                <CardContent className="p-5 flex-1 flex flex-col">
                  {/* Product Name */}
                  <Link href={`/sources/${product.id}`} className="block mb-3">
                    <h3 className="text-xl font-bold line-clamp-2 group-hover:text-primary transition-colors" title={product.product_name}>
                      {product.product_name}
                    </h3>
                    {brand?.brand_name && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {brand.brand_name}
                      </p>
                    )}
                  </Link>

                  {/* Key Metrics */}
                  <div className="space-y-3 mb-4 flex-1">
                    {source?.location_address && (
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2" title={source.location_address}>
                          {source.location_address}
                        </span>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-200 dark:border-gray-800">
                      <div>
                        <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">pH Level</div>
                        <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                          {product.ph_level ?? (
                            <span className="text-sm font-normal text-gray-400">N/A</span>
                          )}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">TDS</div>
                        <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                          {product.tds ? (
                            <>
                              {product.tds}
                              <span className="text-xs font-normal text-gray-500 ml-1">mg/L</span>
                            </>
                          ) : (
                            <span className="text-sm font-normal text-gray-400">N/A</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <Link href={`/sources/${product.id}`} className="block">
                    <Button 
                      variant="outline" 
                      className="w-full border-2 group-hover:border-primary group-hover:text-primary transition-colors"
                    >
                      View Full Details
                    </Button>
                  </Link>
                </CardContent>
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
