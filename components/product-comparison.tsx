"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { X, Scale, BarChart3, Table2 } from "lucide-react"
import { getImageUrl } from "@/lib/pocketbase"
import { Product } from "@/lib/types/pocketbase"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MobileComparisonCarousel } from "@/components/mobile-comparison-carousel"
import { useIsMobile } from "@/hooks/use-mobile"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  RadialBarChart,
  RadialBar,
} from "recharts"

interface ProductComparisonProps {
  products: Product[]
  onRemove: (productId: string) => void
  onClear: () => void
}

export function ProductComparison({ products, onRemove, onClear }: ProductComparisonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const isMobile = useIsMobile()

  if (products.length === 0) {
    return null
  }

  // Helper function to get pH color
  const getPhColor = (ph: number | undefined) => {
    if (!ph) return "#94a3b8" // gray
    if (ph < 6.5) return "#ef4444" // red - acidic
    if (ph > 8) return "#3b82f6" // blue - alkaline
    return "#22c55e" // green - neutral
  }

  // Helper function to get pH label
  const getPhLabel = (ph: number | undefined) => {
    if (!ph) return "Unknown"
    if (ph < 6.5) return "Acidic"
    if (ph > 8) return "Alkaline"
    return "Neutral"
  }

  // Helper function to get TDS color
  const getTdsColor = (tds: number | undefined) => {
    if (!tds) return "#94a3b8" // gray
    if (tds < 100) return "#22c55e" // green - low
    if (tds < 300) return "#eab308" // yellow - moderate
    return "#ef4444" // red - high
  }

  // Helper function to get TDS level
  const getTdsLevel = (tds: number | undefined) => {
    if (!tds) return "Unknown"
    if (tds < 100) return "Low"
    if (tds < 300) return "Moderate"
    return "High"
  }

  // Prepare pH comparison data
  const phData = products.map((product) => ({
    name: product.expand?.brand?.brand_name || "Unknown",
    pH: product.ph_level || 0,
    color: getPhColor(product.ph_level),
    label: getPhLabel(product.ph_level),
  }))

  // Prepare TDS comparison data
  const tdsData = products.map((product) => ({
    name: product.expand?.brand?.brand_name || "Unknown",
    tds: product.tds || 0,
    color: getTdsColor(product.tds),
    level: getTdsLevel(product.tds),
    percentage: product.tds ? Math.min((product.tds / 500) * 100, 100) : 0,
  }))

  // Prepare minerals data - combine all unique minerals from all products
  const getMineralsData = () => {
    const mineralsMap = new Map<string, any>()

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
        const key = mineral.name || mineral.symbol
        if (!mineralsMap.has(key)) {
          mineralsMap.set(key, {
            name: key,
            symbol: mineral.symbol,
          })
        }
        // Add this product's mineral amount
        const brandName = product.expand?.brand?.brand_name || "Unknown"
        mineralsMap.get(key)![brandName] = mineral.amount || 0
      })
    })

    return Array.from(mineralsMap.values())
  }

  const mineralsData = getMineralsData()

  // Chart view components
  const PhComparisonChart = () => (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <BarChart3 className="h-5 w-5 text-blue-500" />
        pH Level Comparison
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={phData} layout="horizontal">
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" domain={[0, 14]} label={{ value: 'pH Level', position: 'bottom' }} />
          <YAxis type="category" dataKey="name" width={120} />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload
                return (
                  <div className="bg-white dark:bg-gray-800 p-3 border rounded shadow-lg">
                    <p className="font-semibold">{data.name}</p>
                    <p className="text-sm">pH: {data.pH}</p>
                    <p className="text-sm" style={{ color: data.color }}>
                      {data.label}
                    </p>
                  </div>
                )
              }
              return null
            }}
          />
          <Bar dataKey="pH" radius={[0, 8, 8, 0]}>
            {phData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="flex justify-center gap-6 mt-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: "#ef4444" }} />
          <span>Acidic (&lt;6.5)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: "#22c55e" }} />
          <span>Neutral (6.5-8)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: "#3b82f6" }} />
          <span>Alkaline (&gt;8)</span>
        </div>
      </div>
    </Card>
  )

  const TdsComparisonChart = () => (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <BarChart3 className="h-5 w-5 text-green-500" />
        TDS Comparison (Total Dissolved Solids)
      </h3>
      <div className="space-y-6">
        {tdsData.map((item, index) => (
          <div key={index} className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-medium">{item.name}</span>
              <span className="text-sm font-semibold">
                {item.tds} mg/L - <span style={{ color: item.color }}>{item.level}</span>
              </span>
            </div>
            <div className="relative h-8 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <div
                className="absolute h-full rounded-full transition-all duration-500"
                style={{
                  width: `${item.percentage}%`,
                  backgroundColor: item.color,
                }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-center gap-6 mt-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: "#22c55e" }} />
          <span>Low (&lt;100)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: "#eab308" }} />
          <span>Moderate (100-300)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: "#ef4444" }} />
          <span>High (&gt;300)</span>
        </div>
      </div>
    </Card>
  )

  const MineralsComparisonChart = () => {
    if (mineralsData.length === 0) {
      return (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Mineral Composition</h3>
          <p className="text-center text-gray-500 dark:text-gray-400 py-8">
            No mineral data available for comparison
          </p>
        </Card>
      )
    }

    // Colors for different products
    const colors = ["#8b5cf6", "#3b82f6", "#10b981"]

    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-purple-500" />
          Mineral Composition (mg/L)
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={mineralsData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis label={{ value: 'mg/L', angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Legend />
            {products.map((product, index) => {
              const brandName = product.expand?.brand?.brand_name || "Unknown"
              return (
                <Bar
                  key={product.id}
                  dataKey={brandName}
                  fill={colors[index % colors.length]}
                  radius={[8, 8, 0, 0]}
                />
              )
            })}
          </BarChart>
        </ResponsiveContainer>
      </Card>
    )
  }

  const ComparisonTable = () => (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b">
              <th className="text-left p-2 font-semibold">Property</th>
              {products.map((product) => (
                <th key={product.id} className="text-center p-2 font-semibold min-w-[150px]">
                  <div className="flex flex-col items-center gap-2">
                    <div className="relative h-24 w-24 bg-gray-100 dark:bg-gray-800 rounded">
                      {product.images && product.images.length > 0 ? (
                        <Image
                          src={getImageUrl(product, product.images[0])}
                          alt={product.product_name || "Product"}
                          fill
                          className="object-contain p-2"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-xs text-gray-400">
                          No Image
                        </div>
                      )}
                    </div>
                    <div className="text-sm font-medium">
                      {product.expand?.brand?.brand_name || "Unknown Brand"}
                    </div>
                    <div className="text-xs text-gray-500">
                      {product.product_name || "Unknown Product"}
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="p-2 font-medium">pH Level</td>
              {products.map((product) => (
                <td key={product.id} className="p-2 text-center">
                  {product.ph_level ?? "N/A"}
                </td>
              ))}
            </tr>
            <tr className="border-b">
              <td className="p-2 font-medium">TDS (mg/L)</td>
              {products.map((product) => (
                <td key={product.id} className="p-2 text-center">
                  {product.tds ? `${product.tds} mg/L` : "N/A"}
                </td>
              ))}
            </tr>
            <tr className="border-b">
              <td className="p-2 font-medium">Water Type</td>
              {products.map((product) => (
                <td key={product.id} className="p-2 text-center">
                  <Badge variant="outline">
                    {product.expand?.source?.type || "Unknown"}
                  </Badge>
                </td>
              ))}
            </tr>
            <tr className="border-b">
              <td className="p-2 font-medium">Location</td>
              {products.map((product) => (
                <td key={product.id} className="p-2 text-center text-sm">
                  {product.expand?.source?.location_address || "N/A"}
                </td>
              ))}
            </tr>
            <tr className="border-b">
              <td className="p-2 font-medium">Brand Website</td>
              {products.map((product) => (
                <td key={product.id} className="p-2 text-center">
                  {product.expand?.brand?.website_url ? (
                    <a
                      href={product.expand.brand.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline text-sm"
                    >
                      Visit
                    </a>
                  ) : (
                    "N/A"
                  )}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )

  return (
    <>
      {/* Floating Comparison Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="shadow-lg"
          size="lg"
        >
          <Scale className="h-5 w-5 mr-2" />
          Compare ({products.length}/3)
        </Button>
      </div>

      {/* Comparison Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Product Comparison</DialogTitle>
            <DialogDescription>
              Compare up to 3 products side by side
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                {products.length} {products.length === 1 ? "product" : "products"} selected
              </div>
              <Button variant="outline" size="sm" onClick={onClear}>
                Clear All
              </Button>
            </div>

            {/* Mobile vs Desktop View */}
            {isMobile ? (
              <MobileComparisonCarousel products={products} />
            ) : (
              <Tabs defaultValue="charts" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="charts" className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Chart View
                  </TabsTrigger>
                  <TabsTrigger value="table" className="flex items-center gap-2">
                    <Table2 className="h-4 w-4" />
                    Table View
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="charts" className="space-y-6 mt-6">
                  <PhComparisonChart />
                  <TdsComparisonChart />
                  <MineralsComparisonChart />
                </TabsContent>

                <TabsContent value="table" className="mt-6">
                  <ComparisonTable />
                </TabsContent>
              </Tabs>
            )}

            <div className="flex flex-wrap gap-2 pt-4 border-t">
              {products.map((product) => (
                <Card key={product.id} className="p-3 flex items-center gap-2">
                  <div className="relative h-12 w-12 bg-gray-100 dark:bg-gray-800 rounded">
                    {product.images && product.images.length > 0 ? (
                      <Image
                        src={getImageUrl(product, product.images[0])}
                        alt={product.product_name || "Product"}
                        fill
                        className="object-contain p-1"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-xs text-gray-400">
                        No Image
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">
                      {product.expand?.brand?.brand_name || "Unknown"}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {product.product_name || "Unknown"}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemove(product.id)}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
