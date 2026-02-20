"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Search } from "@/components/search"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { pb } from "@/lib/pocketbase"
import { Droplet, Map, Zap, ArrowRight } from "lucide-react"

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
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-64 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 animate-pulse" />
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
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => {
        const brand = product.expand?.brand
        const source = product.expand?.source

        return (
          <Link
            key={product.id}
            href={`/sources/${product.id}`}
            className="group relative flex flex-col p-6 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-200"
          >
            {/* Brand/Product Name */}
            <div className="mb-4">
              <h3 className="text-lg font-bold group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                {brand?.brand_name || product.product_name || "Unknown Product"}
              </h3>
              {brand && product.product_name && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{product.product_name}</p>
              )}
            </div>

            {/* Water Properties */}
            <div className="space-y-3 flex-1">
              {/* pH Level */}
              {product.ph_level !== undefined && product.ph_level !== null && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">pH Level</span>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-24 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          product.ph_level < 7
                            ? "bg-orange-500"
                            : product.ph_level > 7.5
                            ? "bg-blue-500"
                            : "bg-green-500"
                        }`}
                        style={{ width: `${(product.ph_level / 14) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold min-w-[2rem] text-right">{product.ph_level}</span>
                  </div>
                </div>
              )}

              {/* TDS */}
              {product.tds !== undefined && product.tds !== null && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">TDS</span>
                  <span className="text-sm font-semibold">{product.tds} mg/L</span>
                </div>
              )}

              {/* Source Location */}
              {source?.location_address && (
                <div className="flex items-start gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                  <Map className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <span className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                    {source.location_address}
                  </span>
                </div>
              )}

              {/* Source Type Badge */}
              {source?.type && (
                <div className="pt-2">
                  <Badge variant="secondary" className="text-xs">
                    {source.type}
                  </Badge>
                </div>
              )}
            </div>

            {/* Hover Arrow */}
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <ArrowRight className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
          </Link>
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
          {/* Subtle gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100/20 via-transparent to-transparent dark:from-blue-900/20" />

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
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 mr-2">Quick filters:</span>
                {quickFilters.map((filter) => (
                  <Badge
                    key={filter.query}
                    variant="secondary"
                    className="cursor-pointer hover:bg-blue-100 hover:text-blue-700 dark:hover:bg-blue-900 dark:hover:text-blue-300 transition-colors px-3 py-1.5"
                    onClick={() => handleQuickFilter(filter.query)}
                  >
                    {filter.label}
                  </Badge>
                ))}
              </div>

              {/* Live Statistics */}
              <div className="grid grid-cols-3 gap-8 md:gap-12 w-full max-w-2xl mt-8 pt-8 border-t border-gray-200 dark:border-gray-800">
                <div className="flex flex-col items-center gap-2">
                  <div className="text-3xl md:text-4xl font-bold text-blue-600 dark:text-blue-400">
                    {loading ? "..." : stats.totalProducts}
                  </div>
                  <div className="text-xs md:text-sm text-gray-500 dark:text-gray-400 font-medium">Products</div>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="text-3xl md:text-4xl font-bold text-cyan-600 dark:text-cyan-400">
                    {loading ? "..." : stats.totalBrands}
                  </div>
                  <div className="text-xs md:text-sm text-gray-500 dark:text-gray-400 font-medium">Brands</div>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="text-3xl md:text-4xl font-bold text-teal-600 dark:text-teal-400">
                    {loading ? "..." : stats.totalSources}
                  </div>
                  <div className="text-xs md:text-sm text-gray-500 dark:text-gray-400 font-medium">Water Sources</div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mt-4">
                <Button size="lg" onClick={() => router.push("/sources")} className="gap-2">
                  Browse All Sources
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button size="lg" variant="outline" onClick={() => router.push("/sources?compare=true")} className="gap-2">
                  <Zap className="h-4 w-4" />
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
              <div className="flex items-center gap-3">
                <Map className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Explore Water Sources Across Malaysia</h2>
              </div>
              <Button variant="ghost" asChild className="hidden md:flex">
                <Link href="/map">View Full Map</Link>
              </Button>
            </div>

            <div className="h-[500px] md:h-[600px] rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-lg">
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

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
        <div className="container flex flex-col gap-4 py-8 px-4 md:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Droplet className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <span className="font-semibold">CariAir</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              © 2025 CariAir. Open-source project for the community.
            </p>
            <nav className="flex gap-4">
              <Link href="/about" className="text-xs text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors">
                About
              </Link>
              <Link href="/contribute" className="text-xs text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors">
                Contribute
              </Link>
              <Link href="/learn" className="text-xs text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors">
                Learn
              </Link>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  )
}

