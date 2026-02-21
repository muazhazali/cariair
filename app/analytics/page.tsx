import { AnalyticsDashboard } from "@/components/analytics-dashboard"
import { getAllProducts, getBrands } from "@/lib/products"
import { getTranslations } from "next-intl/server"

export const dynamic = 'force-dynamic'

export default async function AnalyticsPage() {
  const t = await getTranslations("analytics")

  const [allProducts, brands] = await Promise.all([
    getAllProducts(),
    getBrands()
  ])

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      <div className="container py-8 md:py-12">
        <div className="flex flex-col gap-3 mb-10">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
            {t("title")}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl">
            {t("description")}
          </p>
        </div>

        <AnalyticsDashboard products={allProducts} brands={brands} />
      </div>
    </div>
  )
}
