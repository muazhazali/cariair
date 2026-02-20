import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SearchIcon } from "lucide-react"
import { getImageUrl } from "@/lib/pocketbase"
import { Product } from "@/lib/types/pocketbase"
import { ProductFilters } from "@/components/product-filters"
import { getBrands, searchWaterSources } from "@/lib/products"

export const dynamic = 'force-dynamic'

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

export default async function SearchPage(props: { searchParams: SearchParams }) {
  const searchParams = await props.searchParams
  const query = (searchParams.q as string) || ""
  
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
              {query ? `Search results for "${query}"` : "All Water Sources"}
            </h1>
          </div>
          {query && (
            <p className="text-base md:text-lg text-gray-600 dark:text-gray-400">
              Showing results matching your search criteria
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
              {results.length} {results.length === 1 ? "result" : "results"} found
            </p>
            {/* Sorting could be implemented here as well, passing via URL params */}
          </div>

          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {results.map((product) => {
              const brand = product.expand?.brand;
              const source = product.expand?.source;
              const imageUrl = product.images && product.images.length > 0 
                ? getImageUrl(product, product.images[0])
                : '/placeholder.jpg';
              
              return (
                <Card key={product.id} className="overflow-hidden flex flex-col border-2 border-gray-200 dark:border-gray-800 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-200">
                  <div className="relative h-48 w-full bg-gray-50 dark:bg-gray-900">
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
                      className="w-full text-center text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      View Details
                    </Link>
                  </CardFooter>
                </Card>
              )
            })}
          </div>

          {results.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 p-12 md:p-16 text-center bg-gray-50 dark:bg-gray-900/50">
              <div className="rounded-lg bg-blue-100 dark:bg-blue-950 p-4 mb-4">
                <SearchIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100">No results found</h3>
              <p className="mt-3 text-base text-gray-600 dark:text-gray-400 max-w-md">
                Try adjusting your search or filter criteria to find what you're looking for
              </p>
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  )
}
