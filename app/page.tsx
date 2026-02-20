"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Search } from "@/components/search"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { pb, getImageUrl } from "@/lib/pocketbase"
import { Droplet, Map, Zap, ArrowRight, MapPin } from "lucide-react"
import { getWaterTypeBadgeClass } from "@/lib/water-type-colors"

const WaterSourceMap = dynamic(() => import("@/components/water-source-map").then(mod => mod.WaterSourceMap), {
  ssr: false,
  loading: () => <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950">
    <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
      <Droplet className="h-5 w-5 animate-pulse" />
      <span>Loading map...</span>
    </div>
  </div>
})

interface Stats {
  totalProducts: number
  totalBrands: number
  totalSources: number
}

// Featured Products Component
function FeaturedProducts() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const result = await pb.collection("products").getList(1, 6, {
          expand: "brand,source,manufacturer",
          requestKey: null,
        })
        setProducts(result.items)
      } catch (error) {
        console.error("Error fetching featured products:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchFeaturedProducts()
  }, [])

  if (loading) {
    return (
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="overflow-hidden animate-pulse">
            <div className="relative h-48 sm:h-56 w-full bg-gray-200 dark:bg-gray-800" />
            <CardContent className="p-4 sm:p-5 space-y-3">
              <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded" />
              <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-2/3" />
              <div className="grid grid-cols-2 gap-3 pt-3">
                <div className="h-24 bg-gray-200 dark:bg-gray-800 rounded-lg" />
                <div className="h-24 bg-gray-200 dark:bg-gray-800 rounded-lg" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        No products found. Add some water sources to get started.
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => {
        const brand = product.expand?.brand
        const source = product.expand?.source
        const imageUrl = product.images && product.images.length > 0
          ? getImageUrl(product, product.images[0])
          : '/placeholder.jpg'

        return (
          <Card
            key={product.id}
            className="group overflow-hidden flex flex-col border-2 border-gray-200 dark:border-gray-800 transition-all duration-200 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-700 rounded-lg"
          >
            {/* Image Section */}
            <Link href={`/sources/${product.id}`} className="block">
              <div className="relative h-48 sm:h-56 w-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 overflow-hidden rounded-t-lg">
                <Image
                  src={imageUrl}
                  alt={product.product_name || "Product"}
                  fill
                  className="object-contain p-4 sm:p-6 transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute top-2 left-2 sm:top-3 sm:left-3">
                  <Badge variant="outline" className={`shadow-sm text-xs font-medium ${getWaterTypeBadgeClass(source?.type)}`}>
                    {source?.type || "Unknown"}
                  </Badge>
                </div>
              </div>
            </Link>

            <CardContent className="p-4 sm:p-5 flex-1 flex flex-col">
              {/* Product Name */}
              <Link href={`/sources/${product.id}`} className="block mb-2 sm:mb-3">
                {brand?.brand_name && (
                  <h3 className="text-lg sm:text-xl font-bold line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {brand.brand_name}
                  </h3>
                )}
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1" title={product.product_name}>
                  {product.product_name}
                </p>
              </Link>

              {/* Key Metrics */}
              <div className="space-y-2 sm:space-y-3 mb-3 sm:mb-4 flex-1">
                {source?.location_address && (
                  <div className="flex items-start gap-2">
                    <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 line-clamp-2" title={source.location_address}>
                      {source.location_address}
                    </span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 sm:gap-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                  {product.ph_level !== undefined && product.ph_level !== null ? (
                    <div className="flex flex-col items-center justify-center py-3 px-2 rounded-lg bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700">
                      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">pH Level</div>
                      <div className={`text-3xl font-bold ${
                        product.ph_level < 7
                          ? "text-orange-600 dark:text-orange-400"
                          : product.ph_level > 7.5
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-green-600 dark:text-green-400"
                      }`}>
                        {product.ph_level.toFixed(1)}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-3 px-2 rounded-lg bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700">
                      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">pH Level</div>
                      <div className="text-sm font-normal text-gray-400 mt-1">N/A</div>
                    </div>
                  )}

                  {product.tds !== undefined && product.tds !== null ? (
                    <div className="flex flex-col items-center justify-center py-3 px-2 rounded-lg bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700">
                      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">TDS</div>
                      <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                        {product.tds.toFixed(0)}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">mg/L</div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-3 px-2 rounded-lg bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700">
                      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">TDS</div>
                      <div className="text-sm font-normal text-gray-400 mt-1">N/A</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <Link href={`/sources/${product.id}`} className="block">
                <Button
                  variant="outline"
                  className="w-full border-2 text-sm group-hover:border-blue-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
                >
                  View Full Details
                </Button>
              </Link>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

export default function HomePage() {
  const router = useRouter()
  const [stats, setStats] = useState<Stats>({ totalProducts: 0, totalBrands: 0, totalSources: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [productsResult, brandsResult, sourcesResult] = await Promise.all([
          pb.collection("products").getList(1, 1, { requestKey: null }),
          pb.collection("brands").getList(1, 1, { requestKey: null }),
          pb.collection("sources").getList(1, 1, { requestKey: null })
        ])

        setStats({
          totalProducts: productsResult.totalItems,
          totalBrands: brandsResult.totalItems,
          totalSources: sourcesResult.totalItems
        })
      } catch (error) {
        console.error("Error fetching stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const quickFilters = [
    { label: "Low pH (<7)", query: "ph_low" },
    { label: "Alkaline (pH 7.5+)", query: "ph_alkaline" },
    { label: "Low TDS (<50)", query: "tds_low" },
    { label: "High Minerals", query: "tds_high" },
    { label: "Spring Water", query: "type_spring" },
    { label: "Mineral Water", query: "type_mineral" },
  ]

  const handleQuickFilter = (filterQuery: string) => {
    router.push(`/sources?filter=${filterQuery}`)
  }

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        {/* Hero Section - Prominent Search */}
        <section className="relative w-full py-16 md:py-24 lg:py-32 overflow-hidden">
          {/* Animated mesh gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100/20 via-transparent to-transparent dark:from-blue-900/20 animate-gradient-xy" />

          {/* Floating mesh orbs */}
          <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 dark:from-blue-600/20 dark:to-cyan-600/20 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-purple-400/20 to-pink-400/20 dark:from-purple-600/20 dark:to-pink-600/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-cyan-400/10 to-blue-400/10 dark:from-cyan-600/10 dark:to-blue-600/10 rounded-full blur-3xl animate-pulse-glow" />

          <div className="container relative px-4 md:px-6">
            <div className="flex flex-col items-center space-y-8 text-center">
              {/* Title with icon */}
              <div className="flex items-center gap-3 mb-2">
                <Droplet className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl bg-gradient-to-br from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent">
                  CariAir
                </h1>
              </div>

              <p className="max-w-[800px] text-lg md:text-xl text-gray-600 dark:text-gray-300">
                Malaysia's definitive mineral and spring water source registry. Search, compare, and discover the perfect water for your needs.
              </p>

              {/* Prominent Search Bar */}
              <div className="w-full max-w-2xl">
                <Search />
              </div>

              {/* Quick Filter Chips */}
              <div className="flex flex-wrap items-center justify-center gap-2 max-w-3xl">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300 mr-2">Quick filters:</span>
                {quickFilters.map((filter) => (
                  <Badge
                    key={filter.query}
                    variant="secondary"
                    className="cursor-pointer bg-white/40 dark:bg-black/40 backdrop-blur-sm border border-white/30 dark:border-white/20 hover:bg-blue-500 hover:text-white hover:border-blue-500 dark:hover:bg-blue-600 dark:hover:border-blue-600 transition-all duration-300 px-3 py-1.5 hover:scale-110 hover:shadow-lg"
                    onClick={() => handleQuickFilter(filter.query)}
                  >
                    {filter.label}
                  </Badge>
                ))}
              </div>

              {/* Live Statistics - Glassy */}
              <div className="w-full max-w-2xl mt-8">
                <div className="relative overflow-hidden rounded-lg border border-white/30 bg-white/20 shadow-2xl backdrop-blur-xl dark:border-white/20 dark:bg-black/20">
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-cyan-500/10" />

                  <div className="relative grid grid-cols-3 gap-6 md:gap-8 p-6 md:p-8">
                    <div className="flex flex-col items-center gap-2">
                      <div className="text-3xl md:text-4xl font-bold bg-gradient-to-br from-blue-600 to-blue-400 dark:from-blue-400 dark:to-blue-300 bg-clip-text text-transparent">
                        {loading ? "..." : stats.totalProducts}
                      </div>
                      <div className="text-xs md:text-sm text-gray-700 dark:text-gray-300 font-medium">Products</div>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <div className="text-3xl md:text-4xl font-bold bg-gradient-to-br from-cyan-600 to-cyan-400 dark:from-cyan-400 dark:to-cyan-300 bg-clip-text text-transparent">
                        {loading ? "..." : stats.totalBrands}
                      </div>
                      <div className="text-xs md:text-sm text-gray-700 dark:text-gray-300 font-medium">Brands</div>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <div className="text-3xl md:text-4xl font-bold bg-gradient-to-br from-teal-600 to-teal-400 dark:from-teal-400 dark:to-teal-300 bg-clip-text text-transparent">
                        {loading ? "..." : stats.totalSources}
                      </div>
                      <div className="text-xs md:text-sm text-gray-700 dark:text-gray-300 font-medium">Water Sources</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mt-4">
                <Button
                  size="lg"
                  onClick={() => router.push("/sources")}
                  className="gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 dark:from-blue-500 dark:to-cyan-500 dark:hover:from-blue-600 dark:hover:to-cyan-600 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group"
                >
                  Browse All Sources
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => router.push("/sources?compare=true")}
                  className="gap-2 border-2 border-blue-600/30 dark:border-blue-400/30 bg-white/40 dark:bg-black/40 backdrop-blur-sm hover:bg-blue-600 hover:text-white dark:hover:bg-blue-500 transition-all duration-300 hover:scale-105 hover:shadow-lg group"
                >
                  <Zap className="h-4 w-4 group-hover:rotate-12 transition-transform" />
                  Compare Waters
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Full-Width Map Section */}
        <section className="w-full py-12 md:py-16 bg-gray-50 dark:bg-gray-900">
          <div className="container px-4 md:px-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3 group">
                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 shadow-md group-hover:scale-110 transition-transform">
                  <Map className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">Explore Water Sources Across Malaysia</h2>
              </div>
              <Button variant="ghost" asChild className="hidden md:flex hover:bg-white/40 dark:hover:bg-black/40 backdrop-blur-sm transition-all hover:scale-105">
                <Link href="/map">View Full Map</Link>
              </Button>
            </div>

            <div className="h-[500px] md:h-[600px] rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800 shadow-lg">
              <WaterSourceMap />
            </div>

            <div className="mt-4 text-center">
              <Button variant="outline" asChild className="md:hidden">
                <Link href="/map">View Full Map</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Data Preview Section */}
        <section className="w-full py-12 md:py-16">
          <div className="container px-4 md:px-6">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">Featured Water Sources</h2>
                <p className="text-gray-500 dark:text-gray-400">
                  Explore detailed composition and quality data
                </p>
              </div>
              <Button variant="outline" asChild className="hidden md:flex">
                <Link href="/sources">View All</Link>
              </Button>
            </div>

            <FeaturedProducts />

            <div className="mt-8 text-center">
              <Button asChild>
                <Link href="/sources">Browse All Water Sources</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer - Glassy */}
      <footer className="relative mt-12 overflow-hidden">
        {/* Glassy footer background */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-100 to-transparent dark:from-gray-950 dark:to-transparent" />
        <div className="relative border-t border-white/30 dark:border-white/20 bg-white/20 backdrop-blur-xl dark:bg-black/20">
          <div className="container flex flex-col gap-4 py-8 px-4 md:px-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 group">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 shadow-md transition-transform group-hover:scale-110">
                  <Droplet className="h-5 w-5 text-white" />
                </div>
                <span className="font-bold text-lg bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-cyan-400">CariAir</span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-300 font-medium">
                © 2025 CariAir. Open-source project for the community.
              </p>
              <nav className="flex gap-4">
                <Link href="/about" className="text-xs text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors font-medium">
                  About
                </Link>
                <Link href="/contribute" className="text-xs text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors font-medium">
                  Contribute
                </Link>
                <Link href="/learn" className="text-xs text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors font-medium">
                  Learn
                </Link>
              </nav>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

