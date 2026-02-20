import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, MapPin, Droplet, BarChart3, Calendar, Building2, Globe, CheckCircle2 } from "lucide-react"
import { pb, getImageUrl } from "@/lib/pocketbase"
import { Product } from "@/lib/types/pocketbase"
import { SingleSourceMap } from "@/components/single-source-map"
import { MineralCompositionPanel } from "@/components/mineral-composition-panel"
import { HealthBenefitsPanel } from "@/components/health-benefits-panel"

export const dynamic = 'force-dynamic'

// Fetch product from PocketBase
async function getProduct(id: string): Promise<Product | null> {
  try {
    const product = await pb.collection('products').getOne<Product>(id, {
      expand: 'brand,source,manufacturer',
    });
    return product;
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    // Re-throw env errors so Vercel shows 500 with message instead of silent 404
    if (msg.includes("NEXT_PUBLIC_POCKETBASE_URL")) {
      throw error;
    }
    console.error("[sources/[id]] Error fetching product:", id, error);
    return null;
  }
}

export default async function SourcePage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    notFound();
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      <div className="container px-4 py-6 md:px-6 md:py-8">
        <Button variant="ghost" asChild className="mb-6 -ml-2">
          <Link href="/sources">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to all sources
          </Link>
        </Button>

        {/* Hero Section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
            <div className="flex-1">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3">
                {product.product_name}
              </h1>
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <Badge variant="outline" className="text-sm px-3 py-1">
                  {source?.type || "Mineral Water"}
                </Badge>
                {source?.location_address && (
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <MapPin className="mr-1.5 h-4 w-4" />
                    <span>{source.location_address}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="relative w-full md:w-64 h-64 md:h-64 rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-lg">
              <Image 
                src={imageUrl} 
                alt={product.product_name || "Product Image"} 
                fill 
                className="object-contain p-6" 
              />
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Sidebar - Company Info */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Building2 className="mr-2 h-5 w-5" />
                  Company Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Brand</span>
                  <p className="text-base font-semibold mt-1">{brand?.brand_name || "Unknown"}</p>
                </div>
                {brand?.parent_company && (
                  <div>
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Parent Company</span>
                    <p className="text-base font-medium mt-1">{brand.parent_company}</p>
                  </div>
                )}
                <div>
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Country</span>
                  <p className="text-base font-medium mt-1">{source?.country || "Malaysia"}</p>
                </div>
                {brand?.website_url && (
                  <div>
                    <a
                      href={brand.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-sm font-medium text-primary hover:underline"
                    >
                      <Globe className="mr-2 h-4 w-4" />
                      Visit website
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <CheckCircle2 className="mr-2 h-5 w-5" />
                  Verification
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Status</span>
                  <div className="mt-1">
                    <Badge variant={product.status === 'approved' ? 'default' : 'secondary'} className="text-sm">
                      {product.status || 'Pending'}
                    </Badge>
                  </div>
                </div>
                <div>
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Created</span>
                  <p className="text-base font-medium mt-1 flex items-center">
                    <Calendar className="mr-2 h-4 w-4" />
                    {new Date(product.created).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
                {source?.kkm_approval_number && (
                  <div>
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">KKM Approval</span>
                    <p className="text-base font-medium mt-1 font-mono text-sm">{source.kkm_approval_number}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Content - Properties, Minerals, Map */}
          <div className="lg:col-span-2 space-y-6">
            {/* Water Properties Section */}
            <Card className="border-2">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center text-xl">
                  <Droplet className="mr-2 h-6 w-6 text-blue-500" />
                  Water Properties
                </CardTitle>
                <CardDescription className="text-base mt-2">
                  Physical and chemical properties of the water source
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border-2 border-gray-200 dark:border-gray-800 p-6 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20">
                    <div className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">pH Level</div>
                    <div className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                      {product.ph_level || "-"}
                    </div>
                    <div className="text-sm font-medium text-gray-600 dark:text-gray-500">
                      {product.ph_level ? (
                        product.ph_level < 7 ? (
                          <span className="text-red-600 dark:text-red-400">Acidic</span>
                        ) : product.ph_level > 7 ? (
                          <span className="text-blue-600 dark:text-blue-400">Alkaline</span>
                        ) : (
                          <span className="text-gray-600 dark:text-gray-400">Neutral</span>
                        )
                      ) : ""}
                    </div>
                  </div>
                  <div className="rounded-xl border-2 border-gray-200 dark:border-gray-800 p-6 bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/30 dark:to-green-900/20">
                    <div className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">TDS</div>
                    <div className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                      {product.tds || "-"}
                    </div>
                    <div className="text-sm font-medium text-gray-600 dark:text-gray-500">
                      {product.tds ? "mg/L" : ""}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Total Dissolved Solids
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Mineral Composition Section - Enhanced */}
            <MineralCompositionPanel minerals={minerals} productName={product.product_name || "Unknown"} />

            {/* Health Benefits Section */}
            <HealthBenefitsPanel
              minerals={minerals}
              phLevel={product.ph_level}
              tds={product.tds}
              productName={product.product_name || "Unknown"}
            />

            {/* Map Section */}
            {source?.lat && source?.lng ? (
              <Card className="border-2">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center text-xl">
                    <MapPin className="mr-2 h-6 w-6 text-red-500" />
                    Source Location
                  </CardTitle>
                  <CardDescription className="text-base mt-2">
                    Geographic location of the water source
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <SingleSourceMap
                    lat={source.lat}
                    lng={source.lng}
                    sourceName={source.source_name || product.product_name}
                    locationAddress={source.location_address}
                    height="500px"
                  />
                </CardContent>
              </Card>
            ) : (
              <Card className="border-2">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center text-xl">
                    <MapPin className="mr-2 h-6 w-6 text-red-500" />
                    Source Location
                  </CardTitle>
                  <CardDescription className="text-base mt-2">
                    Geographic location of the water source
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[500px] rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center bg-gray-50 dark:bg-gray-900/50">
                    <div className="text-center">
                      <MapPin className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-700 mb-3" />
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Location data not available
                      </p>
                      {source?.location_address && (
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                          {source.location_address}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
