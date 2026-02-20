"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Search } from "@/components/search"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { pb } from "@/lib/pocketbase"
import { Droplet, Map, ArrowRight } from "lucide-react"

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

import { ProductCard } from "@/components/product-card"

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
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
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
    </div>
  )
}

