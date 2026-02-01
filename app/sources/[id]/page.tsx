import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, MapPin, Droplet, BarChart3, DollarSign, Calendar } from "lucide-react"
import { pb, getImageUrl } from "@/lib/pocketbase"
import { Product } from "@/lib/types/pocketbase"

// Fetch product from PocketBase
async function getProduct(id: string): Promise<Product | null> {
  try {
    const product = await pb.collection('products').getOne<Product>(id, {
      expand: 'brand,source,manufacturer',
    });
    return product;
  } catch (error) {
    console.error("Error fetching product:", error);
    return null;
  }
}

export default async function SourcePage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const product = await getProduct(id)

  if (!product) {
    notFound()
  }

  const brand = product.expand?.brand;
  const source = product.expand?.source;
  const imageUrl = product.images && product.images.length > 0 
    ? getImageUrl(product, product.images[0])
    : '/placeholder.jpg';
  
  // Parse minerals if it's a string, or use as is if it's already an object/array
  let minerals: any[] = [];
  if (typeof product.minerals_json === 'string') {
    try {
      minerals = JSON.parse(product.minerals_json);
    } catch (e) {
      console.error("Error parsing minerals JSON", e);
    }
  } else if (Array.isArray(product.minerals_json)) {
    minerals = product.minerals_json;
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
            <Image src={imageUrl} alt={product.product_name || "Product Image"} fill className="object-contain p-4" />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Brand:</span>
                <span className="text-sm font-medium">{brand?.brand_name || "Unknown"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Parent Company:</span>
                <span className="text-sm font-medium">{brand?.parent_company || "-"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Country:</span>
                <span className="text-sm font-medium">{source?.country || "Malaysia"}</span>
              </div>
              {brand?.website_url && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Website:</span>
                  <a
                    href={brand.website_url}
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
                <span className="text-sm text-gray-500 dark:text-gray-400">Status:</span>
                <Badge variant={product.status === 'approved' ? 'default' : 'secondary'}>
                  {product.status || 'Pending'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Created:</span>
                <span className="text-sm font-medium flex items-center">
                  <Calendar className="mr-1 h-3 w-3" />
                  {new Date(product.created).toLocaleDateString()}
                </span>
              </div>
              {source?.kkm_approval_number && (
                 <div className="flex items-center justify-between">
                   <span className="text-sm text-gray-500 dark:text-gray-400">KKM Approval:</span>
                   <span className="text-sm font-medium">{source.kkm_approval_number}</span>
                 </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{product.product_name}</h1>
            <div className="mt-2 flex items-center gap-2">
              <Badge variant="outline">{source?.type || "Mineral Water"}</Badge>
              {source?.location_address && (
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <MapPin className="mr-1 h-3 w-3" />
                  {source.location_address}
                </div>
              )}
            </div>
          </div>

          <Tabs defaultValue="properties">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="properties">Properties</TabsTrigger>
              <TabsTrigger value="minerals">Minerals</TabsTrigger>
              {/* <TabsTrigger value="pricing">Pricing</TabsTrigger> */} 
              {/* Pricing is per bottle type, but we only have one product here. Maybe show volume? */}
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
                      <div className="mt-1 text-2xl font-bold">{product.ph_level || "-"}</div>
                      <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {product.ph_level ? (product.ph_level < 7 ? "Acidic" : product.ph_level > 7 ? "Alkaline" : "Neutral") : ""}
                      </div>
                    </div>
                    <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-800">
                      <div className="text-sm font-medium text-gray-500 dark:text-gray-400">TDS</div>
                      <div className="mt-1 text-2xl font-bold">{product.tds || "-"} mg/L</div>
                      <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">Total Dissolved Solids</div>
                    </div>
                    {/* Hardness not in DB product model currently, maybe in minerals? */}
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
                  <CardDescription>Detailed breakdown of minerals</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {minerals.length > 0 ? (
                      minerals.map((mineral: any, index: number) => (
                        <div key={index} className="grid grid-cols-[1fr_auto]">
                          <div>
                            <div className="text-sm font-medium capitalize">{mineral.name} ({mineral.symbol})</div>
                            <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-gray-800">
                              <div
                                className="h-2 rounded-full bg-blue-500"
                                style={{ width: `${Math.min(100, (mineral.amount) * 2)}%` }}
                              />
                            </div>
                          </div>
                          <div className="ml-4 text-sm font-medium">{mineral.amount} {mineral.unit}</div>
                        </div>
                      ))
                    ) : (
                       <p className="text-sm text-gray-500">No mineral data available.</p>
                    )}
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
                    <div className="flex h-full items-center justify-center bg-gray-100 dark:bg-gray-800">
                      <div className="text-center">
                        <MapPin className="mx-auto h-8 w-8 text-gray-400" />
                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                          {source?.location_address}
                        </p>
                         {source?.lat && source?.lng && (
                            <p className="text-xs text-gray-400">
                                {source.lat}, {source.lng}
                            </p>
                         )}
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
