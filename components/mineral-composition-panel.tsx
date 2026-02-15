"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BarChart3, Info } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { getMineralInfo, calculateDailyIntakePercentage } from "@/lib/mineral-data"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Cell,
} from "recharts"

interface Mineral {
  name: string
  symbol?: string
  amount: number
  unit?: string
}

interface MineralCompositionPanelProps {
  minerals: Mineral[]
  productName: string
}

export function MineralCompositionPanel({ minerals, productName }: MineralCompositionPanelProps) {
  if (!minerals || minerals.length === 0) {
    return (
      <Card className="border-2">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center text-xl">
            <BarChart3 className="mr-2 h-6 w-6 text-purple-500" />
            Mineral Profile
          </CardTitle>
          <CardDescription className="text-base mt-2">
            Detailed breakdown of minerals and their health benefits
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <BarChart3 className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-700 mb-3" />
            <p className="text-sm text-gray-500 dark:text-gray-400">No mineral data available</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Enrich minerals with database information
  const enrichedMinerals = minerals.map((mineral) => {
    const info = getMineralInfo(mineral.name)
    const dailyIntakePercentage = calculateDailyIntakePercentage(mineral.name, mineral.amount)

    return {
      ...mineral,
      info,
      dailyIntakePercentage,
    }
  })

  // Sort by amount (highest first)
  enrichedMinerals.sort((a, b) => (b.amount || 0) - (a.amount || 0))

  // Prepare chart data
  const chartData = enrichedMinerals.map((m) => ({
    name: m.info.symbol,
    amount: m.amount,
    color: m.info.color,
    fullName: m.info.name,
  }))

  return (
    <Card className="border-2">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center text-xl">
              <BarChart3 className="mr-2 h-6 w-6 text-purple-500" />
              Mineral Profile
            </CardTitle>
            <CardDescription className="text-base mt-2">
              Detailed breakdown of minerals and their health benefits
            </CardDescription>
          </div>
          <Badge variant="secondary" className="text-sm">
            {enrichedMinerals.length} minerals detected
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Visual Chart */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-lg p-4">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis label={{ value: 'mg/L', angle: -90, position: 'insideLeft' }} />
              <RechartsTooltip
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
        </div>

        {/* Detailed Table */}
        <div className="space-y-4">
          <h4 className="font-semibold text-lg">Mineral Composition Details</h4>
          <div className="rounded-lg border overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Mineral</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold">Amount</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Health Benefit</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger className="flex items-center gap-1 mx-auto">
                          Daily %
                          <Info className="h-3 w-3" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">
                            Percentage of recommended daily intake based on drinking 2L per day
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {enrichedMinerals.map((mineral, index) => (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{mineral.info.icon}</span>
                        <div>
                          <div className="font-semibold">{mineral.info.name}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {mineral.info.symbol}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="font-bold text-lg" style={{ color: mineral.info.color }}>
                        {mineral.amount}
                      </span>
                      <span className="text-xs text-gray-500 ml-1">{mineral.unit || "mg/L"}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {mineral.info.healthBenefit}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {mineral.dailyIntakePercentage !== null ? (
                        <Badge
                          variant={
                            mineral.dailyIntakePercentage >= 20
                              ? "default"
                              : mineral.dailyIntakePercentage >= 10
                              ? "secondary"
                              : "outline"
                          }
                        >
                          {mineral.dailyIntakePercentage.toFixed(1)}%
                        </Badge>
                      ) : (
                        <span className="text-xs text-gray-400">N/A</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Key Highlights */}
        <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4 border border-blue-200 dark:border-blue-900">
          <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
            <Info className="h-4 w-4 text-blue-600" />
            Key Highlights
          </h4>
          <ul className="space-y-1 text-sm">
            {enrichedMinerals
              .filter((m) => m.dailyIntakePercentage && m.dailyIntakePercentage >= 10)
              .slice(0, 3)
              .map((mineral, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-blue-600 dark:text-blue-400">✓</span>
                  <span>
                    <strong>{mineral.info.name}:</strong> Provides{" "}
                    {mineral.dailyIntakePercentage?.toFixed(0)}% of daily recommended intake
                  </span>
                </li>
              ))}
            {enrichedMinerals.filter((m) => m.dailyIntakePercentage && m.dailyIntakePercentage >= 10)
              .length === 0 && (
              <li className="text-gray-600 dark:text-gray-400">
                Contains trace amounts of essential minerals
              </li>
            )}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
