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
    <div className="container px-4 py-8 md:px-6 md:py-12">
      <h1 className="text-2xl font-bold mb-6">{query ? `Search results for "${query}"` : "All Water Sources"}</h1>

      <div className="grid gap-6 md:grid-cols-[240px_1fr]">
        <div className="space-y-6">
          <ProductFilters brands={availableBrands.map(b => ({ id: b.id, brand_name: b.brand_name }))} />
        </div>

        <div>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              {results.length} {results.length === 1 ? "result" : "results"} found
            </p>
            {/* Sorting could be implemented here as well, passing via URL params */}
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((product) => {
              const brand = product.expand?.brand;
              const source = product.expand?.source;
              const imageUrl = product.images && product.images.length > 0 
                ? getImageUrl(product, product.images[0])
                : '/placeholder.jpg';
              
              return (
                <Card key={product.id} className="overflow-hidden flex flex-col">
                  <div className="relative h-48 w-full bg-gray-100 dark:bg-gray-800">
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
                      className="w-full text-center text-sm font-medium text-primary hover:underline"
                    >
                      View Details
                    </Link>
                  </CardFooter>
                </Card>
              )
            })}
          </div>

          {results.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-200 p-12 text-center dark:border-gray-800">
              <div className="rounded-full bg-gray-100 p-3 dark:bg-gray-800">
                <SearchIcon className="h-6 w-6 text-gray-400" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">No results found</h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Try adjusting your search or filter criteria
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
