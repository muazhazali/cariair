import { Suspense } from "react"
import { getBrands, searchWaterSources } from "@/lib/products"
import { getTranslations } from "next-intl/server"
import { HomeContent } from "@/components/home-content"
import { HomeMap } from "@/components/home-map"
import { HomeFilters } from "@/components/home-filters"

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

  // Fetch data
  const [products, brands] = await Promise.all([
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
  ])

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

      {/* Product Grid */}
      <section className="container px-4 py-6">
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
