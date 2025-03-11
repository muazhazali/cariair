import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, MapPin, Droplet, BarChart3, DollarSign, Calendar } from "lucide-react"

// This would be replaced with actual data fetching from your JSON files
async function getWaterSource(id: string) {
  // Sample data
  const sources = {
    "1": {
      id: 1,
      name: "Spritzer",
      company: "Spritzer Bhd",
      country: "Malaysia",
      website: "https://www.spritzer.com.my",
      location: {
        state: "Perak",
        district: "Taiping",
        coordinates: [4.7729, 101.1536],
      },
      type: "Mineral",
      properties: {
        ph: 7.2,
        tds: 85,
        hardness: "Soft",
      },
      minerals: {
        calcium: 22.5,
        magnesium: 3.2,
        potassium: 1.1,
        sodium: 4.5,
        bicarbonate: 65.0,
        chloride: 2.8,
        sulfate: 5.3,
      },
      bottleTypes: [
        { size: "500ml", material: "PET", price: 1.2, lastUpdated: "2024-02-15" },
        { size: "1.5L", material: "PET", price: 2.8, lastUpdated: "2024-02-15" },
        { size: "6L", material: "PET", price: 8.5, lastUpdated: "2024-02-10" },
      ],
      image: "/placeholder.svg?height=500&width=200",
      lastVerified: "2024-02-15",
      verifiedBy: "johndoe",
    },
  }

  return sources[id as keyof typeof sources] || null
}

export default async function SourcePage({ params }: { params: { id: string } }) {
  const source = await getWaterSource(params.id)

  if (!source) {
    notFound()
  }

  return (
    <div className="container px-4 py-8 md:px-6 md:py-12">
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/sources">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to all sources
        </Link>
      </Button>

      <div className="grid gap-6 md:grid-cols-[300px_1fr] lg:gap-12">
        <div className="space-y-6">
          <div className="relative aspect-[3/4] overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800">
            <Image src={source.image || "/placeholder.svg"} alt={source.name} fill className="object-contain p-4" />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Company:</span>
                <span className="text-sm font-medium">{source.company}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Country:</span>
                <span className="text-sm font-medium">{source.country}</span>
              </div>
              {source.website && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Website:</span>
                  <a
                    href={source.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-blue-500 hover:underline"
                  >
                    Visit website
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Verification</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Last verified:</span>
                <span className="text-sm font-medium flex items-center">
                  <Calendar className="mr-1 h-3 w-3" />
                  {source.lastVerified}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Verified by:</span>
                <Link
                  href={`https://github.com/${source.verifiedBy}`}
                  target="_blank"
                  className="text-sm font-medium text-blue-500 hover:underline"
                >
                  @{source.verifiedBy}
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{source.name}</h1>
            <div className="mt-2 flex items-center gap-2">
              <Badge variant="outline">{source.type}</Badge>
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <MapPin className="mr-1 h-3 w-3" />
                {source.location.district}, {source.location.state}
              </div>
            </div>
          </div>

          <Tabs defaultValue="properties">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="properties">Properties</TabsTrigger>
              <TabsTrigger value="minerals">Minerals</TabsTrigger>
              <TabsTrigger value="pricing">Pricing</TabsTrigger>
              <TabsTrigger value="map">Map</TabsTrigger>
            </TabsList>

            <TabsContent value="properties" className="space-y-4 pt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Droplet className="mr-2 h-5 w-5" />
                    Water Properties
                  </CardTitle>
                  <CardDescription>Physical and chemical properties of the water source</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-800">
                      <div className="text-sm font-medium text-gray-500 dark:text-gray-400">pH Level</div>
                      <div className="mt-1 text-2xl font-bold">{source.properties.ph}</div>
                      <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {source.properties.ph < 7 ? "Acidic" : source.properties.ph > 7 ? "Alkaline" : "Neutral"}
                      </div>
                    </div>
                    <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-800">
                      <div className="text-sm font-medium text-gray-500 dark:text-gray-400">TDS</div>
                      <div className="mt-1 text-2xl font-bold">{source.properties.tds} mg/L</div>
                      <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">Total Dissolved Solids</div>
                    </div>
                    <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-800">
                      <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Hardness</div>
                      <div className="mt-1 text-2xl font-bold">{source.properties.hardness}</div>
                      <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">Water hardness level</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="minerals" className="space-y-4 pt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="mr-2 h-5 w-5" />
                    Mineral Composition
                  </CardTitle>
                  <CardDescription>Detailed breakdown of minerals in mg/L</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(source.minerals).map(([mineral, value]) => (
                      <div key={mineral} className="grid grid-cols-[1fr_auto]">
                        <div>
                          <div className="text-sm font-medium capitalize">{mineral}</div>
                          <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-gray-800">
                            <div
                              className="h-2 rounded-full bg-blue-500"
                              style={{ width: `${Math.min(100, (value as number) * 2)}%` }}
                            />
                          </div>
                        </div>
                        <div className="ml-4 text-sm font-medium">{value} mg/L</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="pricing" className="space-y-4 pt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <DollarSign className="mr-2 h-5 w-5" />
                    Pricing Information
                  </CardTitle>
                  <CardDescription>Current retail prices by bottle size</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {source.bottleTypes.map((bottle, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-800"
                      >
                        <div>
                          <div className="font-medium">{bottle.size}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{bottle.material} bottle</div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold">RM {bottle.price.toFixed(2)}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Updated: {bottle.lastUpdated}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="map" className="pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Source Location</CardTitle>
                  <CardDescription>Geographic location of the water source</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px] rounded-lg border border-gray-200 dark:border-gray-800">
                    {/* Map would be rendered here with the source's coordinates */}
                    <div className="flex h-full items-center justify-center bg-gray-100 dark:bg-gray-800">
                      <div className="text-center">
                        <MapPin className="mx-auto h-8 w-8 text-gray-400" />
                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                          Coordinates: {source.location.coordinates[0]}, {source.location.coordinates[1]}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

