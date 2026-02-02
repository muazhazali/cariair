import { SourcesView } from "@/components/sources-view"
import { getBrands, searchWaterSources } from "@/lib/products"

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

export default async function SourcesPage(props: { searchParams: SearchParams }) {
  // We ignore searchParams for initial load in this new mode, 
  // or we could support them if we wanted hybrid approach.
  // But user specifically asked to not use URL for search.
  // So we just load initial data (ALL).
  
  const [initialProducts, availableBrands] = await Promise.all([
    searchWaterSources({}), // Empty filters = get all
    getBrands()
  ])

  return (
    <div className="container py-8 md:py-12">
      <div className="flex flex-col gap-4 mb-8">
        <h1 className="text-3xl font-bold tracking-tight">All Water Sources</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Explore our complete registry of mineral and drinking water sources in Malaysia.
        </p>
      </div>

      <SourcesView 
        initialProducts={initialProducts} 
        brands={availableBrands.map(b => ({ id: b.id, brand_name: b.brand_name }))} 
      />
    </div>
  )
}

