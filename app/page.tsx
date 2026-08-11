import { Suspense } from "react"
import { getBrands, searchWaterSources } from "@/lib/products"
import { getBrandsWithStats } from "@/lib/db/brands"
import { getTranslations } from "next-intl/server"
import { HomeContent } from "@/components/home-content"
import { HomeMap } from "@/components/home-map"
import { HomeFilters } from "@/components/home-filters"
import { BrandGrid } from "@/components/brand-grid"

export const dynamic = 'force-dynamic'

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

export default async function HomePage(props: { searchParams: SearchParams }) {
  const searchParams = await props.searchParams
  const t = await getTranslations("home")

  // Parse filters from URL
  const query = (searchParams.q as string) || ""
  const types = searchParams.type
    ? Array.isArray(searchParams.type)
      ? searchParams.type
      : [searchParams.type]
    : []
  const brandIds = searchParams.brand
    ? Array.isArray(searchParams.brand)
      ? searchParams.brand
      : [searchParams.brand]
    : []
  const minPh = searchParams.min_ph ? Number(searchParams.min_ph) : undefined
  const maxPh = searchParams.max_ph ? Number(searchParams.max_ph) : undefined
  const minTds = searchParams.min_tds ? Number(searchParams.min_tds) : undefined
  const maxTds = searchParams.max_tds ? Number(searchParams.max_tds) : undefined

  // Fetch data in parallel: products (filtered) + brands list (for filters) + brand stats (for grid)
  const [products, brands, brandsWithStats] = await Promise.all([
    searchWaterSources({
      query,
      types,
      brands: brandIds,
      minPh,
      maxPh,
      minTds,
      maxTds,
    }),
    getBrands(),
    getBrandsWithStats(),
  ])

  const hasFilters = Boolean(query) || brandIds.length > 0 || types.length > 0 ||
    minPh !== undefined || maxPh !== undefined || minTds !== undefined || maxTds !== undefined

  return (
    <div className="min-h-screen">
      {/* Map Section - 50vh height */}
      <section className="h-[50vh] w-full border-b">
        <Suspense fallback={<MapSkeleton />}>
          <HomeMap products={products} />
        </Suspense>
      </section>

      {/* Filter Bar - Sticky */}
      <div className="sticky top-14 z-40 bg-background border-b">
        <div className="container px-4 py-3">
          <HomeFilters
            brands={brands}
            currentQuery={query}
            currentTypes={types}
            currentBrands={brandIds}
            currentMinPh={minPh}
            currentMaxPh={maxPh}
            currentMinTds={minTds}
            currentMaxTds={maxTds}
            resultCount={products.length}
          />
        </div>
      </div>

      {/* Brand Grid - Primary content when no brand filter is active */}
      {!hasFilters && (
        <section className="container px-4 py-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold tracking-tight">
              {t('exploreBrands')}
            </h2>
            <p className="text-muted-foreground mt-1">
              {t('exploreBrandsDesc')}
            </p>
          </div>
          <BrandGrid
            brands={brandsWithStats}
            translations={{
              products: t('brandsProducts'),
              productSingular: t('brandsProductSingular'),
              avgPh: t('brandsAvgPh'),
              avgTds: t('brandsAvgTds'),
              parentCompany: t('brandsParentCompany'),
              viewBrand: t('brandsViewBrand'),
              noData: t('brandsNoData'),
              noBrands: t('brandsNoBrands'),
              noBrandsDesc: t('brandsNoBrandsDesc'),
            }}
          />
        </section>
      )}

      {/* Product Grid - Shown when filters are active (drill-down), or as secondary content */}
      <section className={`container px-4 ${hasFilters ? 'py-6' : 'pt-2 pb-10'}`}>
        {hasFilters && (
          <div className="mb-6">
            <h2 className="text-2xl font-bold tracking-tight">
              {t('matchingProducts')}
            </h2>
            <p className="text-muted-foreground mt-1">
              {t('matchingProductsDesc')}
            </p>
          </div>
        )}
        {!hasFilters && products.length > 0 && (
          <div className="mb-6 mt-8">
            <h2 className="text-2xl font-bold tracking-tight">
              {t('allWaterSources')}
            </h2>
            <p className="text-muted-foreground mt-1">
              {t('allWaterSourcesDesc')}
            </p>
          </div>
        )}
        <HomeContent products={products} />
      </section>
    </div>
  )
}

function MapSkeleton() {
  return (
    <div className="h-full w-full bg-muted flex items-center justify-center">
      <span className="text-muted-foreground">Loading map...</span>
    </div>
  )
}