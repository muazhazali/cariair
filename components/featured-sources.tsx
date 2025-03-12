import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

// Sample data - would be replaced with actual data from your JSON files
const featuredSources = [
  {
    id: 1,
    name: "Spritzer",
    location: "Taiping, Perak",
    type: "Mineral",
    ph: 7.2,
    tds: 85,
    image: "/images/logos/spritzer-logo.png",
  },
  {
    id: 2,
    name: "Cactus",
    location: "Kuala Lumpur, Selangor",
    type: "Mineral",
    ph: 7.5,
    tds: 110,
    image: "/images/logos/cactus-logo.png",
  },
  {
    id: 3,
    name: "Bleu",
    location: "Penang",
    type: "Spring",
    ph: 7.1,
    tds: 95,
    image: "/images/logos/bleu-logo.png",
  },
]

export function FeaturedSources() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold">Featured Water Sources</h3>
        <Link href="/sources" className="text-sm text-blue-500 hover:underline">
          View all sources
        </Link>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {featuredSources.map((source) => (
          <Card key={source.id} className="overflow-hidden">
            <CardHeader className="p-0">
              <div className="relative h-48 w-full bg-gray-100 dark:bg-gray-800">
                <Image src={source.image || "/placeholder.svg"} alt={source.name} fill className="object-contain p-4" />
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <CardTitle className="text-xl mb-2">{source.name}</CardTitle>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Location:</span>
                  <span className="text-sm font-medium">{source.location}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Type:</span>
                  <Badge variant="outline">{source.type}</Badge>
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
    </div>
  )
}

