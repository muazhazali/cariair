import { SourcesView } from "@/components/sources-view"
import { getBrands, searchWaterSources } from "@/lib/products"

export const dynamic = 'force-dynamic'

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

export default async function SourcesPage(props: { searchParams: SearchParams }) {
  // Await searchParams as required by Next.js 15
  await props.searchParams

  // We ignore searchParams for initial load in this new mode, 
  // or we could support them if we wanted hybrid approach.
  // But user specifically asked to not use URL for search.
  // So we just load initial data (ALL).

  const [initialProducts, availableBrands] = await Promise.all([
    searchWaterSources({}), // Empty filters = get all
    getBrands()
  ])

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      <div className="container px-4 md:px-6 py-8 md:py-12">
        <div className="flex flex-col gap-3 mb-6 md:mb-10">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
            Water Sources Registry
          </h1>
          <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 max-w-2xl">
            Explore our complete registry of mineral and drinking water sources in Malaysia.
            Compare properties, minerals, and locations to find the perfect water source for your needs.
          </p>
        </div>

        <SourcesView
          initialProducts={initialProducts}
          brands={availableBrands.map(b => ({ id: b.id, brand_name: b.brand_name }))}
        />
      </div>
    </div>
  )
}

