"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Heart, Activity, Bone, Droplets, Brain, Shield, Zap, Info } from "lucide-react"
import { getMineralInfo } from "@/lib/mineral-data"
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { useTranslations } from "next-intl"

interface Mineral {
  name: string
  symbol?: string
  amount: number
  unit?: string
}

interface HealthBenefitsPanelProps {
  minerals: Mineral[]
  phLevel?: number
  tds?: number
  productName: string
}

export function HealthBenefitsPanel({ minerals, phLevel, tds, productName }: HealthBenefitsPanelProps) {
  const t = useTranslations('healthPanel')

  // Calculate wellness score (1-10 scale)
  const calculateWellnessScore = (): number => {
    let score = 5 // Base score

    // pH scoring (optimal is 6.5-8.5)
    if (phLevel) {
      if (phLevel >= 6.5 && phLevel <= 8.5) score += 2
      else if (phLevel >= 6 && phLevel <= 9) score += 1
    }

    // TDS scoring (optimal is 50-150)
    if (tds) {
      if (tds >= 50 && tds <= 150) score += 2
      else if (tds >= 30 && tds <= 300) score += 1
    }

    // Mineral diversity scoring
    if (minerals.length >= 8) score += 1
    if (minerals.length >= 5) score += 0.5

    // Check for key minerals
    const hasCa = minerals.some(m => m.name.toLowerCase().includes('calcium'))
    const hasMg = minerals.some(m => m.name.toLowerCase().includes('magnesium'))
    const hasK = minerals.some(m => m.name.toLowerCase().includes('potassium'))

    if (hasCa) score += 0.5
    if (hasMg) score += 0.5
    if (hasK) score += 0.5

    return Math.min(10, Math.max(1, Math.round(score * 10) / 10))
  }

  const wellnessScore = calculateWellnessScore()

  // Prepare radar chart data
  const radarData = [
    {
      category: t('phBalance'),
      value: phLevel
        ? phLevel >= 6.5 && phLevel <= 8.5
          ? 90
          : phLevel >= 6 && phLevel <= 9
          ? 70
          : 50
        : 50,
    },
    {
      category: t('mineralRichness'),
      value: Math.min(100, (minerals.length / 10) * 100),
    },
    {
      category: t('purity'),
      value: tds
        ? tds >= 50 && tds <= 150
          ? 90
          : tds >= 30 && tds <= 300
          ? 70
          : 50
        : 50,
    },
  ]

  // Health benefits categorization
  const healthCategories = [
    {
      id: "bone",
      title: "Bone & Teeth Health",
      icon: Bone,
      color: "text-green-600",
      benefits: [] as string[],
    },
    {
      id: "heart",
      title: "Cardiovascular Health",
      icon: Heart,
      color: "text-red-600",
      benefits: [] as string[],
    },
    {
      id: "muscle",
      title: "Muscle Function & Energy",
      icon: Zap,
      color: "text-yellow-600",
      benefits: [] as string[],
    },
    {
      id: "hydration",
      title: "Hydration & Balance",
      icon: Droplets,
      color: "text-blue-600",
      benefits: [] as string[],
    },
    {
      id: "brain",
      title: "Nervous System & Brain",
      icon: Brain,
      color: "text-purple-600",
      benefits: [] as string[],
    },
    {
      id: "immune",
      title: "Immune System",
      icon: Shield,
      color: "text-orange-600",
      benefits: [] as string[],
    },
  ]

  // Map minerals to health categories
  minerals.forEach((mineral) => {
    const name = mineral.name.toLowerCase()
    const info = getMineralInfo(mineral.name)

    if (name.includes('calcium')) {
      healthCategories[0].benefits.push(`Rich in calcium (${mineral.amount} mg/L) - Essential for strong bones and teeth`)
      healthCategories[1].benefits.push(`Calcium supports heart muscle function and blood pressure regulation`)
    }
    if (name.includes('magnesium')) {
      healthCategories[2].benefits.push(`Contains magnesium (${mineral.amount} mg/L) - Supports energy production and muscle relaxation`)
      healthCategories[4].benefits.push(`Magnesium helps maintain healthy nervous system function`)
    }
    if (name.includes('potassium')) {
      healthCategories[1].benefits.push(`Potassium (${mineral.amount} mg/L) - Helps regulate blood pressure and heart rhythm`)
      healthCategories[3].benefits.push(`Potassium maintains proper fluid balance in cells`)
    }
    if (name.includes('sodium')) {
      healthCategories[3].benefits.push(`Sodium (${mineral.amount} mg/L) - Supports fluid balance and nutrient absorption`)
      healthCategories[4].benefits.push(`Sodium aids in nerve signal transmission`)
    }
    if (name.includes('bicarbonate')) {
      healthCategories[3].benefits.push(`Bicarbonate helps regulate pH balance in the body`)
    }
    if (name.includes('silica')) {
      healthCategories[0].benefits.push(`Silica promotes healthy bones, joints, and connective tissue`)
    }
    if (name.includes('fluoride')) {
      healthCategories[0].benefits.push(`Fluoride (${mineral.amount} mg/L) - Strengthens tooth enamel and prevents cavities`)
    }
    if (name.includes('zinc')) {
      healthCategories[5].benefits.push(`Zinc (${mineral.amount} mg/L) - Supports immune function and wound healing`)
    }
    if (name.includes('iron')) {
      healthCategories[2].benefits.push(`Iron supports oxygen transport and energy levels`)
    }
  })

  // pH-based benefits
  if (phLevel) {
    if (phLevel >= 7 && phLevel <= 8.5) {
      healthCategories[3].benefits.push(`Alkaline pH (${phLevel}) may help neutralize acidity in the body`)
    } else if (phLevel >= 6.5 && phLevel < 7) {
      healthCategories[3].benefits.push(`Neutral pH (${phLevel}) - Well-balanced for daily hydration`)
    }
  }

  // Filter out empty categories
  const activeCategories = healthCategories.filter(cat => cat.benefits.length > 0)

  // Key highlights
  const keyHighlights = []
  if (minerals.some(m => m.name.toLowerCase().includes('calcium') && m.amount > 20)) {
    keyHighlights.push({ text: t('highCalcium'), benefit: t('highCalciumBenefit'), icon: "🦴" })
  }
  if (minerals.some(m => m.name.toLowerCase().includes('magnesium') && m.amount > 10)) {
    keyHighlights.push({ text: t('richMagnesium'), benefit: t('richMagnesiumBenefit'), icon: "⚡" })
  }
  if (phLevel && phLevel >= 7.5 && phLevel <= 8.5) {
    keyHighlights.push({ text: t('alkalineWater'), benefit: t('alkalineWaterBenefit'), icon: "⚖️" })
  }
  if (minerals.length >= 8) {
    keyHighlights.push({ text: t('mineralRich'), benefit: t('mineralRichBenefit'), icon: "💎" })
  }

  return (
    <Card className="border-2">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center text-xl">
              <Heart className="mr-2 h-6 w-6 text-red-500" />
              {t('title')}
            </CardTitle>
            <CardDescription className="text-base mt-2">
              {t('description', { productName })}
            </CardDescription>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-primary">{wellnessScore}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{t('wellnessScore')}</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Wellness Radar Chart */}
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-lg p-4">
          <h4 className="font-semibold text-sm mb-3 text-center">{t('waterQualityProfile')}</h4>
          <ResponsiveContainer width="100%" height={250}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="category" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} />
              <Radar
                name="Quality Score"
                dataKey="value"
                stroke="#8b5cf6"
                fill="#8b5cf6"
                fillOpacity={0.6}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Key Highlights */}
        {keyHighlights.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {keyHighlights.map((highlight, index) => (
              <div
                key={index}
                className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg p-4 border border-green-200 dark:border-green-900"
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{highlight.icon}</span>
                  <div>
                    <div className="font-semibold text-sm text-green-700 dark:text-green-400">
                      {highlight.text}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {highlight.benefit}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Health Categories Accordion */}
        {activeCategories.length > 0 && (
          <div>
            <h4 className="font-semibold text-lg mb-3">{t('healthBenefitsTitle')}</h4>
            <Accordion type="single" collapsible className="w-full">
              {activeCategories.map((category) => (
                <AccordionItem key={category.id} value={category.id}>
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-3">
                      <category.icon className={`h-5 w-5 ${category.color}`} />
                      <span className="font-medium">{category.title}</span>
                      <Badge variant="secondary" className="ml-2">
                        {category.benefits.length}
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="space-y-2 pt-2">
                      {category.benefits.map((benefit, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <span className={`mt-0.5 ${category.color}`}>✓</span>
                          <span className="text-gray-700 dark:text-gray-300">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        )}

        {/* Disclaimer */}
        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-800">
          <div className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400">
            <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <p>{t('disclaimer')}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
