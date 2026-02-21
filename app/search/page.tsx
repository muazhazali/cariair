import { SearchIcon } from "lucide-react"
import { ProductFilters } from "@/components/product-filters"
import { getBrands, searchWaterSources } from "@/lib/products"
import { ProductCard } from "@/components/product-card"
import { getTranslations } from "next-intl/server"

export const dynamic = 'force-dynamic'

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

export default async function SearchPage(props: { searchParams: SearchParams }) {
  const searchParams = await props.searchParams
  const query = (searchParams.q as string) || ""

  const t = await getTranslations("search")

  // Parse filters
  const types = searchParams.type ? (Array.isArray(searchParams.type) ? searchParams.type : [searchParams.type]) : []
  const brands = searchParams.brand ? (Array.isArray(searchParams.brand) ? searchParams.brand : [searchParams.brand]) : []
  const minPh = searchParams.min_ph ? Number(searchParams.min_ph) : undefined
  const maxPh = searchParams.max_ph ? Number(searchParams.max_ph) : undefined
  const minTds = searchParams.min_tds ? Number(searchParams.min_tds) : undefined
  const maxTds = searchParams.max_tds ? Number(searchParams.max_tds) : undefined

  const [results, availableBrands] = await Promise.all([
    searchWaterSources({
      query,
      types,
      brands,
      minPh,
      maxPh,
      minTds,
      maxTds
    }),
    getBrands()
  ])

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      <div className="container px-4 py-12 md:px-6 md:py-16">
        {/* Hero Section */}
        <div className="mb-8 md:mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="rounded-lg bg-blue-100 dark:bg-blue-950 p-2">
              <SearchIcon className="h-6 w-6 md:h-8 md:w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
              {query ? t("resultsFor", { query }) : t("title")}
            </h1>
          </div>
          {query && (
            <p className="text-base md:text-lg text-gray-600 dark:text-gray-400">
              {t("showingResults")}
            </p>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
          <div className="space-y-6">
            <ProductFilters brands={availableBrands.map(b => ({ id: b.id, brand_name: b.brand_name }))} />
          </div>

          <div className="flex-1">
            <div className="mb-6 flex items-center justify-between px-1">
              <p className="text-sm md:text-base font-medium text-gray-600 dark:text-gray-400">
                {t("resultsFound", { count: results.length })}
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {results.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {results.length === 0 && (
              <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 p-12 md:p-16 text-center bg-gray-50 dark:bg-gray-900/50">
                <div className="rounded-lg bg-blue-100 dark:bg-blue-950 p-4 mb-4">
                  <SearchIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100">{t("noResults")}</h3>
                <p className="mt-3 text-base text-gray-600 dark:text-gray-400 max-w-md">
                  {t("noResultsDesc")}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
