"use client"

import { useState } from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, BarChart3, Table2 } from "lucide-react"
import { getImageUrl } from "@/lib/pocketbase"
import { Product } from "@/lib/types/pocketbase"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts"
import { getMineralInfo } from "@/lib/mineral-data"

interface MobileComparisonCarouselProps {
  products: Product[]
}

export function MobileComparisonCarousel({ products }: MobileComparisonCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [viewMode, setViewMode] = useState<"chart" | "table">("chart")

  if (products.length === 0) {
    return null
  }

  const currentProduct = products[currentIndex]
  const brand = currentProduct.expand?.brand
  const source = currentProduct.expand?.source
  const imageUrl = currentProduct.images && currentProduct.images.length > 0
    ? getImageUrl(currentProduct, currentProduct.images[0])
    : '/placeholder.jpg'

  // Parse minerals
  let minerals: any[] = []
  if (typeof currentProduct.minerals_json === 'string') {
    try {
      minerals = JSON.parse(currentProduct.minerals_json)
    } catch (e) {
      console.error("Error parsing minerals JSON", e)
    }
  } else if (Array.isArray(currentProduct.minerals_json)) {
    minerals = currentProduct.minerals_json
  }

  // Sort minerals by amount and take top 5
  const topMinerals = minerals
    .sort((a, b) => (b.amount || 0) - (a.amount || 0))
    .slice(0, 5)
    .map((mineral) => {
      const info = getMineralInfo(mineral.name)
      return {
        ...mineral,
        info,
      }
    })

  // Prepare chart data
  const chartData = topMinerals.map((m) => ({
    name: m.info.symbol,
    amount: m.amount,
    color: m.info.color,
    fullName: m.info.name,
  }))

  // Helper functions for pH and TDS
  const getPhColor = (ph: number | undefined) => {
    if (!ph) return "#94a3b8"
    if (ph < 6.5) return "#ef4444"
    if (ph > 8) return "#3b82f6"
    return "#22c55e"
  }

  const getPhLabel = (ph: number | undefined) => {
    if (!ph) return "Unknown"
    if (ph < 6.5) return "Acidic"
    if (ph > 8) return "Alkaline"
    return "Neutral"
  }

  const getTdsColor = (tds: number | undefined) => {
    if (!tds) return "#94a3b8"
    if (tds < 100) return "#22c55e"
    if (tds < 300) return "#eab308"
    return "#ef4444"
  }

  const getTdsLevel = (tds: number | undefined) => {
    if (!tds) return "Unknown"
    if (tds < 100) return "Low"
    if (tds < 300) return "Moderate"
    return "High"
  }

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? products.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === products.length - 1 ? 0 : prev + 1))
  }

  return (
    <div className="space-y-4">
      {/* Product Header with Navigation */}
      <Card className="border-2">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="outline"
              size="icon"
              onClick={handlePrevious}
              disabled={products.length <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex-1 text-center">
              <div className="text-sm text-gray-500 mb-1">
                {currentIndex + 1} of {products.length}
              </div>
              <div className="relative h-32 w-32 mx-auto bg-gray-100 dark:bg-gray-800 rounded-lg">
                <Image
                  src={imageUrl}
                  alt={currentProduct.product_name || "Product"}
                  fill
                  className="object-contain p-2"
                />
              </div>
              <h3 className="font-bold text-lg mt-2">{currentProduct.product_name}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {brand?.brand_name || "Unknown Brand"}
              </p>
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={handleNext}
              disabled={products.length <= 1}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* View Mode Toggle */}
          <div className="flex gap-2">
            <Button
              variant={viewMode === "chart" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("chart")}
              className="flex-1"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Chart
            </Button>
            <Button
              variant={viewMode === "table" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("table")}
              className="flex-1"
            >
              <Table2 className="h-4 w-4 mr-2" />
              Table
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Chart View */}
      {viewMode === "chart" && (
        <div className="space-y-4">
          {/* pH Card */}
          <Card className="border-2">
            <CardContent className="p-4">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getPhColor(currentProduct.ph_level) }} />
                pH Level
              </h4>
              <div className="flex items-center justify-between">
                <div className="text-4xl font-bold" style={{ color: getPhColor(currentProduct.ph_level) }}>
                  {currentProduct.ph_level || "N/A"}
                </div>
                <Badge variant="secondary">{getPhLabel(currentProduct.ph_level)}</Badge>
              </div>
              <div className="mt-3 h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full transition-all duration-500"
                  style={{
                    width: currentProduct.ph_level ? `${(currentProduct.ph_level / 14) * 100}%` : "0%",
                    backgroundColor: getPhColor(currentProduct.ph_level),
                  }}
                />
              </div>
            </CardContent>
          </Card>

          {/* TDS Card */}
          <Card className="border-2">
            <CardContent className="p-4">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getTdsColor(currentProduct.tds) }} />
                TDS (Total Dissolved Solids)
              </h4>
              <div className="flex items-center justify-between">
                <div className="text-4xl font-bold" style={{ color: getTdsColor(currentProduct.tds) }}>
                  {currentProduct.tds || "N/A"}
                  {currentProduct.tds && <span className="text-sm font-normal ml-2">mg/L</span>}
                </div>
                <Badge variant="secondary">{getTdsLevel(currentProduct.tds)}</Badge>
              </div>
              <div className="mt-3 h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full transition-all duration-500"
                  style={{
                    width: currentProduct.tds ? `${Math.min((currentProduct.tds / 500) * 100, 100)}%` : "0%",
                    backgroundColor: getTdsColor(currentProduct.tds),
                  }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Top 5 Minerals Chart */}
          {topMinerals.length > 0 && (
            <Card className="border-2">
              <CardContent className="p-4">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-purple-500" />
                  Top 5 Minerals
                </h4>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload
                          return (
                            <div className="bg-white dark:bg-gray-800 p-3 border rounded shadow-lg">
                              <p className="font-semibold">{data.fullName}</p>
                              <p className="text-sm">{data.amount} mg/L</p>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                    <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Table View */}
      {viewMode === "table" && (
        <Card className="border-2">
          <CardContent className="p-4">
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b pb-2">
                <span className="font-semibold">pH Level</span>
                <span>{currentProduct.ph_level || "N/A"}</span>
              </div>
              <div className="flex justify-between items-center border-b pb-2">
                <span className="font-semibold">TDS</span>
                <span>{currentProduct.tds ? `${currentProduct.tds} mg/L` : "N/A"}</span>
              </div>
              <div className="flex justify-between items-center border-b pb-2">
                <span className="font-semibold">Water Type</span>
                <Badge variant="outline">{source?.type || "Unknown"}</Badge>
              </div>
              <div className="flex justify-between items-center border-b pb-2">
                <span className="font-semibold">Location</span>
                <span className="text-sm text-right">{source?.location_address || "N/A"}</span>
              </div>
              {topMinerals.length > 0 && (
                <div className="pt-2">
                  <h5 className="font-semibold mb-2">Top Minerals</h5>
                  <div className="space-y-2">
                    {topMinerals.map((mineral, index) => (
                      <div key={index} className="flex justify-between items-center text-sm">
                        <span className="flex items-center gap-2">
                          <span>{mineral.info.icon}</span>
                          {mineral.info.name}
                        </span>
                        <span className="font-semibold" style={{ color: mineral.info.color }}>
                          {mineral.amount} {mineral.unit || "mg/L"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Swipe Indicator */}
      {products.length > 1 && (
        <div className="flex justify-center gap-2">
          {products.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex
                  ? "bg-primary w-6"
                  : "bg-gray-300 dark:bg-gray-700"
              }`}
              aria-label={`Go to product ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
