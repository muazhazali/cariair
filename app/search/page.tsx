import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { SearchIcon, Filter, MapPin } from "lucide-react"
import { pb, getImageUrl } from "@/lib/pocketbase"
import { Product } from "@/lib/types/pocketbase"

async function searchWaterSources(query: string): Promise<Product[]> {
  try {
    const filterParts = [];
    if (query) {
      // Search in product name, barcode, brand name, or source location
      filterParts.push(`product_name ~ "${query}"`);
      filterParts.push(`barcode ~ "${query}"`);
      filterParts.push(`brand.brand_name ~ "${query}"`);
      filterParts.push(`source.location_address ~ "${query}"`);
    }

    const filter = filterParts.length > 0 ? filterParts.join(" || ") : "";

    const result = await pb.collection('products').getList<Product>(1, 50, {
      filter,
      expand: 'brand,source,manufacturer',
      sort: '-created',
    });

    return result.items;
  } catch (error) {
    console.error("Error searching products:", error);
    return [];
  }
}

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

export default async function SearchPage(props: { searchParams: SearchParams }) {
  const searchParams = await props.searchParams
  const query = (searchParams.q as string) || ""
  const results = await searchWaterSources(query)

  return (
    <div className="container px-4 py-8 md:px-6 md:py-12">
      <h1 className="text-2xl font-bold mb-6">{query ? `Search results for "${query}"` : "All Water Sources"}</h1>

      <div className="grid gap-6 md:grid-cols-[240px_1fr]">
        <div className="space-y-6">
          <div className="sticky top-20">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Filters</h2>
              <Button variant="ghost" size="sm">
                Reset
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Search</h3>
                <div className="relative">
                  <Input placeholder="Search..." defaultValue={query} className="pr-8" />
                  <SearchIcon className="absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                </div>
              </div>

              {/* Filters are visual only for now */}
              <div>
                <h3 className="text-sm font-medium mb-2">Water Type</h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="type-mineral" />
                    <Label htmlFor="type-mineral">Mineral Water</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="type-spring" />
                    <Label htmlFor="type-spring">Spring Water</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="type-filtered" />
                    <Label htmlFor="type-filtered">Filtered Water</Label>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">pH Level</h3>
                <div className="space-y-4">
                  <Slider defaultValue={[6.5, 8.5]} min={0} max={14} step={0.1} />
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>0</span>
                    <span>7</span>
                    <span>14</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">TDS Range (mg/L)</h3>
                <div className="space-y-4">
                  <Slider defaultValue={[0, 500]} min={0} max={1000} step={10} />
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>0</span>
                    <span>500</span>
                    <span>1000+</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Location</h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="location-perak" />
                    <Label htmlFor="location-perak">Perak</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="location-selangor" />
                    <Label htmlFor="location-selangor">Selangor</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="location-penang" />
                    <Label htmlFor="location-penang">Penang</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="location-johor" />
                    <Label htmlFor="location-johor">Johor</Label>
                  </div>
                </div>
              </div>

              <Button className="w-full">
                <Filter className="mr-2 h-4 w-4" />
                Apply Filters
              </Button>
            </div>
          </div>
        </div>

        <div>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              {results.length} {results.length === 1 ? "result" : "results"} found
            </p>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Sort by:</span>
              <select className="rounded-md border border-gray-200 bg-transparent px-2 py-1 text-sm dark:border-gray-800">
                <option>Relevance</option>
                <option>Name (A-Z)</option>
                <option>pH (Low to High)</option>
                <option>TDS (Low to High)</option>
              </select>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((product) => {
              const brand = product.expand?.brand;
              const source = product.expand?.source;
              const imageUrl = product.images && product.images.length > 0 
                ? getImageUrl(product, product.images[0])
                : '/placeholder.jpg'; // We don't have placeholder.svg locally maybe, fallback to placeholder logic or just handle it. 
              // Actually the original code used /placeholder.svg?height=200...
              // I will use a placeholder from my public folder if exists or just a generic one.
              // I'll stick to what I used in WaterSourcesDisplay: /placeholder.jpg (wait, did I use that?)
              // WaterSourcesDisplay used:
              // const imageUrl = product.images && product.images.length > 0 ? getImageUrl(product, product.images[0]) : '/placeholder.jpg';
              
              return (
                <Card key={product.id} className="overflow-hidden flex flex-col">
                  <div className="relative h-48 w-full bg-gray-100 dark:bg-gray-800">
                    <Image
                      src={imageUrl}
                      alt={product.product_name}
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
                        <span className="text-sm font-medium">{product.ph_level || "N/A"}</span>
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

