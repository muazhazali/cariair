import { Suspense } from "react"
import Link from "next/link"
import { getBrands, searchWaterSources } from "@/lib/products"
import { getSources } from "@/lib/db/sources"
import { getProducts } from "@/lib/db/products"
import { getFormatter, getTranslations } from "next-intl/server"
import { HomeContent } from "@/components/home-content"
import { HomeMap } from "@/components/home-map"
import { HomeFilters } from "@/components/home-filters"
import { WaterMetricsHelp } from "@/components/water-metrics-help"

export const dynamic = "force-dynamic"

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

export default async function HomePage(props: { searchParams: SearchParams }) {
  const searchParams = await props.searchParams
  const t = await getTranslations("home")
  const format = await getFormatter()

  const query = (searchParams.q as string) || ""
  const sort = (searchParams.sort as string) || "name_asc"
  const types = searchParams.type
    ? Array.isArray(searchParams.type) ? searchParams.type : [searchParams.type]
    : []
  const brandIds = searchParams.brand
    ? Array.isArray(searchParams.brand) ? searchParams.brand : [searchParams.brand]
    : []
  const minPh = searchParams.min_ph ? Number(searchParams.min_ph) : undefined
  const maxPh = searchParams.max_ph ? Number(searchParams.max_ph) : undefined
  const minTds = searchParams.min_tds ? Number(searchParams.min_tds) : undefined
  const maxTds = searchParams.max_tds ? Number(searchParams.max_tds) : undefined

  const [products, brands, allSources, allProductsResult] = await Promise.all([
    searchWaterSources({ query, types, brands: brandIds, minPh, maxPh, minTds, maxTds }),
    getBrands(),
    getSources(),
    getProducts(undefined, { limit: 1, offset: 0 }),
  ])

  const sortedProducts = [...products].sort((a, b) => {
    const nameA = `${a.brand?.brand_name ?? ""} ${a.product_name ?? ""}`
    const nameB = `${b.brand?.brand_name ?? ""} ${b.product_name ?? ""}`
    if (sort === "name_desc") return nameB.localeCompare(nameA)
    if (sort === "ph_asc") return (a.ph_level ?? Infinity) - (b.ph_level ?? Infinity)
    if (sort === "ph_desc") return (b.ph_level ?? -Infinity) - (a.ph_level ?? -Infinity)
    if (sort === "tds_asc") return (a.tds ?? Infinity) - (b.tds ?? Infinity)
    if (sort === "tds_desc") return (b.tds ?? -Infinity) - (a.tds ?? -Infinity)
    return nameA.localeCompare(nameB)
  })

  const hasFilters = Boolean(query) || brandIds.length > 0 || types.length > 0 ||
    minPh !== undefined || maxPh !== undefined || minTds !== undefined || maxTds !== undefined

  return (
    <main id="main-content" className="min-h-screen overflow-hidden">
      <section className="editorial-texture border-b border-border/80">
        <div className="mx-auto max-w-[88rem] px-5 pb-16 pt-14 sm:px-8 sm:pb-20 sm:pt-20 lg:px-12 lg:pb-24">
          <div className="mb-10 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            <span className="h-2 w-2 bg-sage-strong" aria-hidden="true" />
            {t("heroEyebrow")}
            <span className="h-px flex-1 bg-border" aria-hidden="true" />
            <span className="hidden font-mono font-normal normal-case tracking-normal sm:block">MY / 01—11</span>
          </div>

          <div className="grid items-end gap-10 lg:grid-cols-[minmax(0,1.55fr)_minmax(19rem,.65fr)] lg:gap-20">
            <div>
              <h1 className="max-w-5xl text-pretty font-display text-[clamp(2.75rem,8vw,6rem)] leading-[0.92] tracking-[-0.04em]">
                {t("heroTitle")}
              </h1>
            </div>
            <div className="max-w-xl border-l border-foreground/20 pl-6 lg:pb-2">
              <p className="text-base leading-7 text-muted-foreground sm:text-lg">
                {t("heroSubtitle")}
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3">
                <Link href="#sources" className="quiet-button group">
                  {t("heroCtaBrowse")}
                  <ArrowIcon className="transition-transform duration-200 group-hover:translate-x-1" />
                </Link>
                <Link href="/learn/guide" className="text-link">
                  {t("heroCtaLearn")}
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-16 grid border-y border-border sm:grid-cols-3 lg:mt-24">
            <Stat value={format.number(allProductsResult.total)} label={t("statsProducts")} index="01" />
            <Stat value={format.number(brands.length)} label={t("statsBrands")} index="02" />
            <Stat value={format.number(allSources.length)} label={t("statsWaterSources")} index="03" />
          </div>
          <p className="mt-4 text-xs tracking-wide text-muted-foreground">{t("heroSourceNote")}</p>
        </div>
      </section>

      <section id="map" className="scroll-mt-20 bg-background py-16 sm:py-24">
        <div className="mx-auto max-w-[88rem] px-5 sm:px-8 lg:px-12">
          <div className="mb-8 grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
            <div>
              <p className="section-index">{t("mapSectionIndex")}</p>
              <h2 className="mt-3 max-w-2xl font-display text-4xl leading-none tracking-[-0.035em] sm:text-6xl">
                {t("exploreMap")}
              </h2>
            </div>
            <Link href="#sources" className="text-link mb-1">
              {t("browseAllSources")} <ArrowIcon />
            </Link>
          </div>

            <div className="relative h-[24rem] overflow-hidden rounded-xl border border-border bg-muted sm:h-[32rem] lg:h-[36rem]">
            <Suspense fallback={<MapSkeleton />}>
              <HomeMap products={sortedProducts} />
            </Suspense>
            <div className="pointer-events-none absolute left-4 top-4 z-10 border border-border bg-background/95 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground backdrop-blur-sm">
              {format.number(sortedProducts.length)} {t("statsProducts")} / Malaysia
            </div>
          </div>
        </div>
      </section>

      <section id="sources" className="scroll-mt-32 border-t border-border bg-bone">
        <div className="sticky top-[4.5rem] z-40 border-b border-border bg-bone/95 backdrop-blur-md">
          <div className="mx-auto max-w-[88rem] px-5 py-4 sm:px-8 lg:px-12">
            <HomeFilters
              brands={brands}
              currentQuery={query}
              currentTypes={types}
              currentBrands={brandIds}
              currentMinPh={minPh}
              currentMaxPh={maxPh}
              currentMinTds={minTds}
              currentMaxTds={maxTds}
              currentSort={sort}
              resultCount={sortedProducts.length}
            />
          </div>
        </div>

        <div className="mx-auto max-w-[88rem] px-5 pb-24 pt-14 sm:px-8 sm:pt-20 lg:px-12 lg:pb-32">
          <div className="mb-10 grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
            <div>
              <p className="section-index">{t("registrySectionIndex")}</p>
              <h2 className="mt-3 font-display text-4xl leading-none tracking-[-0.035em] sm:text-6xl">
                {hasFilters ? t("matchingProducts") : t("allWaterSources")}
              </h2>
              <p className="mt-4 max-w-2xl leading-7 text-muted-foreground">
                {hasFilters ? t("matchingProductsDesc") : t("allWaterSourcesDesc")}
              </p>
            </div>
            <WaterMetricsHelp translations={{
              index: t("helpIndex"), trigger: t("helpTrigger"), title: t("helpTitle"), phTitle: t("helpPhTitle"),
              phDesc: t("helpPhDesc"), phAcidic: t("helpPhAcidic"), phNeutral: t("helpPhNeutral"),
              phAlkaline: t("helpPhAlkaline"), tdsTitle: t("helpTdsTitle"), tdsDesc: t("helpTdsDesc"),
              tdsLow: t("helpTdsLow"), tdsMedium: t("helpTdsMedium"), tdsHigh: t("helpTdsHigh"),
            }} />
          </div>
          <HomeContent products={sortedProducts} />
        </div>
      </section>
    </main>
  )
}

function Stat({ value, label, index }: { value: string; label: string; index: string }) {
  return (
    <div className="group relative flex items-end justify-between gap-4 border-b border-border px-1 py-6 last:border-b-0 sm:border-b-0 sm:border-r sm:px-7 sm:first:pl-0 sm:last:border-r-0 sm:last:pr-0">
      <div>
        <span className="block font-display text-5xl leading-none tracking-[-0.04em] tabular-nums sm:text-6xl">{value}</span>
        <span className="mt-2 block text-sm text-muted-foreground">{label}</span>
      </div>
      <span className="font-mono text-[10px] text-muted-foreground">{index}</span>
    </div>
  )
}

function ArrowIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" className={`h-4 w-4 ${className}`} fill="none">
      <path d="M4 10h11M11 6l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="square" strokeLinejoin="miter" />
    </svg>
  )
}

function MapSkeleton() {
  return <div className="h-full w-full animate-pulse bg-muted" aria-hidden="true" />
}
