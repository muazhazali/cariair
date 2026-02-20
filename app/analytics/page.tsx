import { AnalyticsDashboard } from "@/components/analytics-dashboard"
import { searchWaterSources, getBrands } from "@/lib/products"

export const dynamic = 'force-dynamic'

export default async function AnalyticsPage() {
  // Fetch all products and brands for analytics
  const [allProducts, brands] = await Promise.all([
    searchWaterSources({}), // Get all products
    getBrands()
  ])

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      <div className="container py-8 md:py-12">
        <div className="flex flex-col gap-3 mb-10">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
            Water Analytics & Insights
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl">
            Explore market trends, mineral distributions, and data-driven insights about
            mineral and drinking water sources in Malaysia.
          </p>
        </div>

        <AnalyticsDashboard products={allProducts} brands={brands} />
      </div>
    </div>
  )
}
