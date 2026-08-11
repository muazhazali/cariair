import { Suspense } from "react"
import Link from "next/link"
import { ArrowRight, Map as MapIcon, BookOpen, Sparkles } from "lucide-react"
import { getBrands, searchWaterSources } from "@/lib/products"
import { getSources } from "@/lib/db/sources"
import { getProducts } from "@/lib/db/products"
import { getTranslations } from "next-intl/server"
import { HomeContent } from "@/components/home-content"
import { HomeMap } from "@/components/home-map"
import { HomeFilters } from "@/components/home-filters"
import { WaterMetricsHelp } from "@/components/water-metrics-help"

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

  // Fetch filtered products + brands (for filters) in parallel with the
  // unfiltered totals used by the hero stats bar so the registry always
  // advertises its true size, not the current filter result count.
  const [products, brands, allSources, allProductsResult] = await Promise.all([
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
    getSources(),
    getProducts(undefined, { limit: 1, offset: 0 }),
  ])

  const totalProducts = allProductsResult.total
  const totalBrands = brands.length
  const totalSources = allSources.length

  const hasFilters = Boolean(query) || brandIds.length > 0 || types.length > 0 ||
    minPh !== undefined || maxPh !== undefined || minTds !== undefined || maxTds !== undefined

  return (
    <div className="min-h-screen">
      {/* Hero — the 3-second pitch */}
      <section className="relative overflow-hidden border-b bg-gradient-to-b from-blue-50/60 to-background dark:from-blue-950/20">
        <div className="container px-4 py-14 md:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300">
              <Sparkles className="h-3 w-3" />
              {t('heroEyebrow')}
            </span>
            <h1 className="mt-5 text-4xl font-bold tracking-tight text-balance sm:text-5xl md:text-6xl">
              {t('heroTitle')}
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground text-balance sm:text-lg">
              {t('heroSubtitle')}
            </p>

            {/* Primary CTAs */}
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="#sources"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-blue-600 px-6 text-sm font-medium text-white shadow transition-colors hover:bg-blue-700"
              >
                {t('heroCtaBrowse')}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="#map"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-input bg-background px-6 text-sm font-medium shadow-sm transition-colors hover:bg-accent"
              >
                <MapIcon className="h-4 w-4" />
                {t('heroCtaMap')}
              </Link>
              <Link
                href="/learn/guide"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-md px-4 text-sm font-medium text-blue-600 transition-colors hover:underline"
              >
                <BookOpen className="h-4 w-4" />
                {t('heroCtaLearn')}
              </Link>
            </div>

            {/* Live stats bar — proves the registry is real and populated */}
            <div className="mt-10 flex items-center justify-center gap-6 text-sm sm:gap-10">
              <Stat value={totalProducts} label={t('statsProducts')} />
              <Divider />
              <Stat value={totalBrands} label={t('statsBrands')} />
              <Divider />
              <Stat value={totalSources} label={t('statsWaterSources')} />
            </div>
            <p className="mt-4 text-xs text-muted-foreground">{t('heroSourceNote')}</p>
          </div>
        </div>
      </section>

      {/* Map Section — shrunk so the hero owns the first impression */}
      <section id="map" className="h-[40vh] w-full border-b scroll-mt-14">
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
      <section id="sources" className="container px-4 py-8 scroll-mt-28">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              {hasFilters ? t('matchingProducts') : t('exploreBrands')}
            </h2>
            <p className="text-muted-foreground mt-1">
              {hasFilters ? t('matchingProductsDesc') : t('exploreBrandsDesc')}
            </p>
          </div>
          <WaterMetricsHelp
            translations={{
              trigger: t('helpTrigger'),
              title: t('helpTitle'),
              phTitle: t('helpPhTitle'),
              phDesc: t('helpPhDesc'),
              phAcidic: t('helpPhAcidic'),
              phNeutral: t('helpPhNeutral'),
              phAlkaline: t('helpPhAlkaline'),
              tdsTitle: t('helpTdsTitle'),
              tdsDesc: t('helpTdsDesc'),
              tdsLow: t('helpTdsLow'),
              tdsMedium: t('helpTdsMedium'),
              tdsHigh: t('helpTdsHigh'),
            }}
          />
        </div>
        <HomeContent products={products} />
      </section>
    </div>
  )
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-2xl font-bold tabular-nums sm:text-3xl">{value}</span>
      <span className="mt-1 text-xs text-muted-foreground sm:text-sm">{label}</span>
    </div>
  )
}

function Divider() {
  return <span className="h-8 w-px bg-border" aria-hidden />
}

function MapSkeleton() {
  return (
    <div className="h-full w-full bg-muted flex items-center justify-center">
      <span className="text-muted-foreground">Loading map...</span>
    </div>
  )
}