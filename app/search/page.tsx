import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { SearchIcon, Filter } from "lucide-react"

// This would be replaced with actual data fetching from your JSON files
async function searchWaterSources(query: string) {
  // Sample data
  const sources = [
    {
      id: 1,
      name: "Spritzer",
      location: "Taiping, Perak",
      type: "Mineral",
      ph: 7.2,
      tds: 85,
      image: "/placeholder.svg?height=200&width=200",
    },
    {
      id: 2,
      name: "Cactus",
      location: "Kuala Lumpur, Selangor",
      type: "Mineral",
      ph: 7.5,
      tds: 110,
      image: "/placeholder.svg?height=200&width=200",
    },
    {
      id: 3,
      name: "Bleu",
      location: "Penang",
      type: "Spring",
      ph: 7.1,
      tds: 95,
      image: "/placeholder.svg?height=200&width=200",
    },
  ]

  // Simple filtering based on query
  if (!query) return sources

  const lowerQuery = query.toLowerCase()
  return sources.filter(
    (source) =>
      source.name.toLowerCase().includes(lowerQuery) ||
      source.location.toLowerCase().includes(lowerQuery) ||
      source.type.toLowerCase().includes(lowerQuery),
  )
}

export default async function SearchPage({ searchParams }: { searchParams: { q?: string } }) {
  const query = searchParams.q || ""
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
                <h3 className="text-sm font-medium mb-2">Bottle Size</h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="size-250ml" />
                    <Label htmlFor="size-250ml">250ml</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="size-500ml" />
                    <Label htmlFor="size-500ml">500ml</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="size-1L" />
                    <Label htmlFor="size-1L">1L</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="size-1.5L" />
                    <Label htmlFor="size-1.5L">1.5L</Label>
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
            {results.map((source) => (
              <Card key={source.id} className="overflow-hidden">
                <div className="relative h-48 w-full bg-gray-100 dark:bg-gray-800">
                  <Image
                    src={source.image || "/placeholder.svg"}
                    alt={source.name}
                    fill
                    className="object-contain p-4"
                  />
                </div>
                <CardContent className="p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="text-lg font-semibold">{source.name}</h3>
                    <Badge variant="outline">{source.type}</Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Location:</span>
                      <span className="text-sm font-medium">{source.location}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">pH Level:</span>
                      <span className="text-sm font-medium">{source.ph}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">TDS:</span>
                      <span className="text-sm font-medium">{source.tds} mg/L</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  <Link
                    href={`/sources/${source.id}`}
                    className="w-full text-center text-sm font-medium text-primary hover:underline"
                  >
                    View Details
                  </Link>
                </CardFooter>
              </Card>
            ))}
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

