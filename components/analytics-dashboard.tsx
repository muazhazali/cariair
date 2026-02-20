"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts"
import { Product, Brand } from "@/lib/types/pocketbase"
import { TrendingUp, Droplets, BarChart3, Map, Heart, Info } from "lucide-react"
import { getMineralInfo } from "@/lib/mineral-data"

interface AnalyticsDashboardProps {
  products: Product[]
  brands: Brand[]
}

export function AnalyticsDashboard({ products, brands }: AnalyticsDashboardProps) {
  // Calculate average pH by brands
  const getAveragePhByBrand = () => {
    const brandPh: Record<string, { total: number; count: number; name: string }> = {}

    products.forEach((product) => {
      if (product.ph_level && product.expand?.brand) {
        const brandId = product.expand.brand.id
        const brandName = product.expand.brand.brand_name

        if (!brandPh[brandId]) {
          brandPh[brandId] = { total: 0, count: 0, name: brandName }
        }
        brandPh[brandId].total += product.ph_level
        brandPh[brandId].count += 1
      }
    })

    return Object.entries(brandPh)
      .map(([id, data]) => ({
        brand: data.name,
        avgPh: Number((data.total / data.count).toFixed(2)),
      }))
      .sort((a, b) => b.avgPh - a.avgPh)
      .slice(0, 10) // Top 10 brands
  }

  // Calculate average TDS by brands
  const getAverageTdsByBrand = () => {
    const brandTds: Record<string, { total: number; count: number; name: string }> = {}

    products.forEach((product) => {
      if (product.tds && product.expand?.brand) {
        const brandId = product.expand.brand.id
        const brandName = product.expand.brand.brand_name

        if (!brandTds[brandId]) {
          brandTds[brandId] = { total: 0, count: 0, name: brandName }
        }
        brandTds[brandId].total += product.tds
        brandTds[brandId].count += 1
      }
    })

    return Object.entries(brandTds)
      .map(([id, data]) => ({
        brand: data.name,
        avgTds: Number((data.total / data.count).toFixed(2)),
      }))
      .sort((a, b) => b.avgTds - a.avgTds)
      .slice(0, 10) // Top 10 brands
  }

  // Water type distribution
  const getWaterTypeDistribution = () => {
    const typeCount: Record<string, number> = {}

    products.forEach((product) => {
      const type = product.expand?.source?.type || "Unknown"
      typeCount[type] = (typeCount[type] || 0) + 1
    })

    return Object.entries(typeCount).map(([type, count]) => ({
      type,
      count,
      percentage: ((count / products.length) * 100).toFixed(1),
    }))
  }

  // Get mineral distribution across all products
  const getMineralDistribution = () => {
    const mineralTotals: Record<string, { total: number; count: number }> = {}

    products.forEach((product) => {
      let minerals: any[] = []
      if (typeof product.minerals_json === 'string') {
        try {
          minerals = JSON.parse(product.minerals_json)
        } catch (e) {
          console.error("Error parsing minerals JSON", e)
        }
      } else if (Array.isArray(product.minerals_json)) {
        minerals = product.minerals_json
      }

      minerals.forEach((mineral: any) => {
        const name = mineral.name?.toLowerCase() || 'unknown'
        if (!mineralTotals[name]) {
          mineralTotals[name] = { total: 0, count: 0 }
        }
        mineralTotals[name].total += mineral.amount || 0
        mineralTotals[name].count += 1
      })
    })

    return Object.entries(mineralTotals)
      .map(([name, data]) => {
        const info = getMineralInfo(name)
        return {
          name: info.name,
          symbol: info.symbol,
          avgAmount: Number((data.total / data.count).toFixed(2)),
          frequency: data.count,
          color: info.color,
        }
      })
      .sort((a, b) => b.avgAmount - a.avgAmount)
      .slice(0, 10)
  }

  // Top brands by major minerals
  const getTopBrandsByMinerals = () => {
    const targetMinerals = ['calcium', 'magnesium', 'potassium', 'sodium']
    const brandMinerals: Record<string, Record<string, number>> = {}

    products.forEach((product) => {
      if (!product.expand?.brand) return

      const brandName = product.expand.brand.brand_name
      if (!brandMinerals[brandName]) {
        brandMinerals[brandName] = {}
      }

      let minerals: any[] = []
      if (typeof product.minerals_json === 'string') {
        try {
          minerals = JSON.parse(product.minerals_json)
        } catch (e) {}
      } else if (Array.isArray(product.minerals_json)) {
        minerals = product.minerals_json
      }

      minerals.forEach((mineral: any) => {
        const name = mineral.name?.toLowerCase()
        if (targetMinerals.includes(name)) {
          brandMinerals[brandName][name] = Math.max(
            brandMinerals[brandName][name] || 0,
            mineral.amount || 0
          )
        }
      })
    })

    return Object.entries(brandMinerals)
      .map(([brand, minerals]) => ({
        brand,
        Calcium: minerals.calcium || 0,
        Magnesium: minerals.magnesium || 0,
        Potassium: minerals.potassium || 0,
        Sodium: minerals.sodium || 0,
      }))
      .filter(item => item.Calcium > 0 || item.Magnesium > 0 || item.Potassium > 0 || item.Sodium > 0)
      .sort((a, b) => (b.Calcium + b.Magnesium) - (a.Calcium + a.Magnesium))
      .slice(0, 8)
  }

  // pH distribution
  const getPhDistribution = () => {
    const ranges = [
      { range: '0-5.5', min: 0, max: 5.5, label: 'Very Acidic', count: 0 },
      { range: '5.5-6.5', min: 5.5, max: 6.5, label: 'Acidic', count: 0 },
      { range: '6.5-7.5', min: 6.5, max: 7.5, label: 'Neutral', count: 0 },
      { range: '7.5-8.5', min: 7.5, max: 8.5, label: 'Alkaline', count: 0 },
      { range: '8.5+', min: 8.5, max: 14, label: 'Very Alkaline', count: 0 },
    ]

    products.forEach((product) => {
      if (product.ph_level) {
        const range = ranges.find(r => product.ph_level! >= r.min && product.ph_level! < r.max)
        if (range) range.count++
      }
    })

    return ranges
  }

  // Calculate stats
  const avgPhByBrand = getAveragePhByBrand()
  const avgTdsByBrand = getAverageTdsByBrand()
  const waterTypeDistribution = getWaterTypeDistribution()
  const mineralDistribution = getMineralDistribution()
  const topBrandsByMinerals = getTopBrandsByMinerals()
  const phDistribution = getPhDistribution()

  const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4']

  // Health recommendations
  const healthRecommendations = [
    {
      goal: "Bone Health",
      icon: "🦴",
      minerals: ["Calcium", "Magnesium", "Phosphorus"],
      description: "Look for waters high in calcium and magnesium",
      topBrands: topBrandsByMinerals
        .sort((a, b) => b.Calcium - a.Calcium)
        .slice(0, 3)
        .map(b => b.brand),
    },
    {
      goal: "Heart Health",
      icon: "❤️",
      minerals: ["Potassium", "Magnesium"],
      description: "Waters with potassium and low sodium support cardiovascular health",
      topBrands: topBrandsByMinerals
        .sort((a, b) => b.Potassium - a.Potassium)
        .slice(0, 3)
        .map(b => b.brand),
    },
    {
      goal: "Hydration & Energy",
      icon: "⚡",
      minerals: ["Magnesium", "Potassium", "Sodium"],
      description: "Balanced electrolytes for optimal hydration and energy",
      topBrands: topBrandsByMinerals
        .sort((a, b) => (b.Magnesium + b.Potassium) - (a.Magnesium + a.Potassium))
        .slice(0, 3)
        .map(b => b.brand),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Key Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Droplets className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
            <p className="text-xs text-muted-foreground">Across {brands.length} brands</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg pH Level</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(products.reduce((sum, p) => sum + (p.ph_level || 0), 0) / products.filter(p => p.ph_level).length).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Based on {products.filter(p => p.ph_level).length} products</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg TDS</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(products.reduce((sum, p) => sum + (p.tds || 0), 0) / products.filter(p => p.tds).length)}
              <span className="text-sm font-normal ml-1">mg/L</span>
            </div>
            <p className="text-xs text-muted-foreground">Total Dissolved Solids</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Most Common Type</CardTitle>
            <Map className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {waterTypeDistribution.sort((a, b) => b.count - a.count)[0]?.type || "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">
              {waterTypeDistribution.sort((a, b) => b.count - a.count)[0]?.percentage || 0}% of all products
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="market" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="market">Market Overview</TabsTrigger>
          <TabsTrigger value="minerals">Mineral Analysis</TabsTrigger>
          <TabsTrigger value="health">Health Insights</TabsTrigger>
        </TabsList>

        {/* Market Overview Tab */}
        <TabsContent value="market" className="space-y-6 mt-6">
          {/* Average pH by Brands */}
          <Card>
            <CardHeader>
              <CardTitle>Average pH Level by Brand (Top 10)</CardTitle>
              <CardDescription>Comparison of pH levels across different water brands</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={avgPhByBrand}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="brand" angle={-45} textAnchor="end" height={100} />
                  <YAxis domain={[0, 14]} label={{ value: 'pH Level', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Bar dataKey="avgPh" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Average TDS by Brands */}
          <Card>
            <CardHeader>
              <CardTitle>Average TDS by Brand (Top 10)</CardTitle>
              <CardDescription>Total Dissolved Solids comparison across brands</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={avgTdsByBrand}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="brand" angle={-45} textAnchor="end" height={100} />
                  <YAxis label={{ value: 'TDS (mg/L)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Bar dataKey="avgTds" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Water Type Distribution */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Water Type Distribution</CardTitle>
                <CardDescription>Market share by water source type</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={waterTypeDistribution}
                      dataKey="count"
                      nameKey="type"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={(entry) => `${entry.type} (${entry.percentage}%)`}
                    >
                      {waterTypeDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>pH Distribution</CardTitle>
                <CardDescription>Distribution of products by pH range</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={phDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#10b981" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Mineral Analysis Tab */}
        <TabsContent value="minerals" className="space-y-6 mt-6">
          {/* Top Brands by Major Minerals */}
          <Card>
            <CardHeader>
              <CardTitle>Top Brands by Major Minerals</CardTitle>
              <CardDescription>Comparison of calcium, magnesium, potassium, and sodium content</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={topBrandsByMinerals}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="brand" angle={-45} textAnchor="end" height={100} />
                  <YAxis label={{ value: 'Amount (mg/L)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Calcium" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Magnesium" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Potassium" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Sodium" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Average Mineral Content */}
          <Card>
            <CardHeader>
              <CardTitle>Most Common Minerals</CardTitle>
              <CardDescription>Average mineral content across all products (Top 10)</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={mineralDistribution} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" label={{ value: 'Average Amount (mg/L)', position: 'bottom' }} />
                  <YAxis type="category" dataKey="name" width={120} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload
                        return (
                          <div className="bg-white dark:bg-gray-800 p-3 border rounded shadow-lg">
                            <p className="font-semibold">{data.name} ({data.symbol})</p>
                            <p className="text-sm">Avg: {data.avgAmount} mg/L</p>
                            <p className="text-xs text-gray-500">Found in {data.frequency} products</p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Bar dataKey="avgAmount" radius={[0, 8, 8, 0]}>
                    {mineralDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Health Insights Tab */}
        <TabsContent value="health" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" />
                Recommended Minerals by Health Goal
              </CardTitle>
              <CardDescription>
                Discover which minerals to look for based on your health objectives
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {healthRecommendations.map((rec, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-lg border-2 bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-950"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <span className="text-3xl">{rec.icon}</span>
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold">{rec.goal}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{rec.description}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {rec.minerals.map((mineral, idx) => (
                        <Badge key={idx} variant="secondary">
                          {mineral}
                        </Badge>
                      ))}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">
                        Top Recommended Brands:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {rec.topBrands.map((brand, idx) => (
                          <Badge key={idx} variant="outline" className="font-medium">
                            {brand}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  <p className="font-semibold mb-2">How to Use These Insights:</p>
                  <ul className="space-y-1 list-disc list-inside">
                    <li>Choose water based on your specific health needs and mineral requirements</li>
                    <li>Consider pH levels - slightly alkaline (7.5-8.5) is often preferred for drinking</li>
                    <li>TDS between 50-150 mg/L is considered optimal for taste and health</li>
                    <li>Consult with a healthcare professional for personalized recommendations</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
