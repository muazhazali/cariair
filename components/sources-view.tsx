"use client"

import { useState, useMemo, useEffect, FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SearchIcon } from "lucide-react"
import { EnhancedProductFilters } from "@/components/enhanced-product-filters"
import { MobileFiltersSheet } from "@/components/mobile-filters-sheet"
import { ProductComparison } from "@/components/product-comparison"
import { ProductSort, sortProducts, SortOption } from "@/components/product-sort"
import { searchWaterSources, SearchFilters } from "@/lib/products"
import { Product } from "@/lib/types/pocketbase"
import { ProductCard } from "@/components/product-card"
import { useTranslations } from "next-intl"

interface SourcesViewProps {
  initialProducts: Product[]
  brands: { id: string; brand_name: string }[]
}

const WATER_TYPES = ["Underground", "Spring", "Municipal", "Oxygenated"]

export function SourcesView({ initialProducts, brands }: SourcesViewProps) {
  const t = useTranslations('sourcesView')
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

  // If server-side fetch returned empty (e.g. cold start on Vercel), auto-retry on the client
  useEffect(() => {
    if (initialProducts.length === 0) {
      performSearch({})
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
    let typeFilters: { types?: string[], excludedTypes?: string[] } = {}
    if (newFilters.types.length === WATER_TYPES.length) {
    } else if (newFilters.types.length > WATER_TYPES.length / 2) {
      typeFilters.excludedTypes = WATER_TYPES.filter(t => !newFilters.types.includes(t))
    } else {
      typeFilters.types = newFilters.types
    }

    let brandFilters: { brands?: string[], excludedBrands?: string[] } = {}
    if (newFilters.brands.length === brands.length) {
    } else if (newFilters.brands.length > brands.length / 2) {
      const selectedSet = new Set(newFilters.brands)
      brandFilters.excludedBrands = brands
        .filter(b => !selectedSet.has(b.id))
        .map(b => b.id)
    } else {
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

  const sortedProducts = useMemo(() => {
    return sortProducts(products, sortOption)
  }, [products, sortOption])

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
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <div className="hidden lg:block space-y-6">
        <EnhancedProductFilters
          brands={brands}
          onApply={handleFilterChange}
          mode="sidebar"
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

      <div className="min-w-0">
        <div className="mb-4 md:mb-6 space-y-3">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="animate-pulse">{t('updating')}</span>
                  </span>
                ) : (
                  <>
                    <span className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100">{products.length}</span>
                    <span className="ml-2 text-sm md:text-base">{products.length === 1 ? t('waterSourceFound') : t('waterSourcesFoundPlural')}</span>
                  </>
                )}
              </div>
              <div className="lg:hidden">
                <MobileFiltersSheet
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
            </div>
            <form
              onSubmit={handleSearchSubmit}
              className="flex flex-col sm:flex-row w-full items-stretch sm:items-center gap-2"
            >
              <div className="relative flex-1 min-w-0">
                <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder={t('searchPlaceholder')}
                  className="pl-9 pr-3 h-9 w-full"
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" variant="outline" className="h-9 px-4 flex-1 sm:flex-none whitespace-nowrap">
                  {t('search')}
                </Button>
                <ProductSort value={sortOption} onValueChange={setSortOption} />
              </div>
            </form>
          </div>
          {searchQuery && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {t('showingResultsFor')} <span className="font-medium">"{searchQuery}"</span>
            </p>
          )}
        </div>

        <div className={`grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 ${loading ? "opacity-50 pointer-events-none" : ""}`}>
          {sortedProducts.map((product) => {
            const isSelected = selectedForComparison.includes(product.id);
            const canSelect = selectedForComparison.length < 3 || isSelected;

            return (
              <ProductCard
                key={product.id}
                product={product}
                showComparison={true}
                isSelected={isSelected}
                canSelect={canSelect}
                onToggleComparison={handleToggleComparison}
              />
            )
          })}
        </div>

        {products.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 p-8 sm:p-12 text-center bg-gray-50 dark:bg-gray-900/50">
            <div className="rounded-lg bg-blue-100 dark:bg-blue-950 p-4 mb-4">
              <SearchIcon className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100">{t('noResults')}</h3>
            <p className="mt-2 sm:mt-3 text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-md">
              {t('noResultsDesc')}
            </p>
          </div>
        )}
      </div>

      <ProductComparison
        products={comparisonProducts}
        onRemove={handleRemoveFromComparison}
        onClear={handleClearComparison}
      />
    </div>
  )
}
