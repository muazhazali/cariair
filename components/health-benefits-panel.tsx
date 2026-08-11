"use client"

import { useTranslations } from "next-intl"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from "recharts"
import { PanelHeading, RegistryGlyph } from "@/components/editorial-primitives"

interface Mineral { name: string; symbol?: string; amount: number; unit?: string }
interface Props { minerals: Mineral[]; phLevel?: number | null; tds?: number | null; productName: string }

export function HealthBenefitsPanel({ minerals, phLevel, tds, productName }: Props) {
  const t = useTranslations("healthPanel")
  let score = 5
  if (phLevel) score += phLevel >= 6.5 && phLevel <= 8.5 ? 2 : phLevel >= 6 && phLevel <= 9 ? 1 : 0
  if (tds) score += tds >= 50 && tds <= 150 ? 2 : tds >= 30 && tds <= 300 ? 1 : 0
  if (minerals.length >= 8) score += 1
  else if (minerals.length >= 5) score += 0.5
  for (const key of ["calcium", "magnesium", "potassium"]) if (minerals.some((mineral) => mineral.name.toLowerCase().includes(key))) score += 0.5
  const wellnessScore = Math.min(10, Math.max(1, Math.round(score * 10) / 10))

  const radarData = [
    { category: t("phBalance"), value: phLevel ? phLevel >= 6.5 && phLevel <= 8.5 ? 90 : phLevel >= 6 && phLevel <= 9 ? 70 : 50 : 50 },
    { category: t("mineralRichness"), value: Math.min(100, (minerals.length / 10) * 100) },
    { category: t("purity"), value: tds ? tds >= 50 && tds <= 150 ? 90 : tds >= 30 && tds <= 300 ? 70 : 50 : 50 },
  ]

  const categories = [
    { id: "bone", title: "Bone & teeth", benefits: [] as string[] },
    { id: "heart", title: "Cardiovascular", benefits: [] as string[] },
    { id: "muscle", title: "Muscle & energy", benefits: [] as string[] },
    { id: "hydration", title: "Hydration & balance", benefits: [] as string[] },
    { id: "brain", title: "Nervous system", benefits: [] as string[] },
    { id: "immune", title: "Immune system", benefits: [] as string[] },
  ]

  for (const mineral of minerals) {
    const name = mineral.name.toLowerCase()
    if (name.includes("calcium")) { categories[0].benefits.push(`Calcium (${mineral.amount} mg/L) supports bones and teeth.`); categories[1].benefits.push("Calcium supports heart-muscle function.") }
    if (name.includes("magnesium")) { categories[2].benefits.push(`Magnesium (${mineral.amount} mg/L) supports energy production and muscle function.`); categories[4].benefits.push("Magnesium supports nervous-system function.") }
    if (name.includes("potassium")) { categories[1].benefits.push(`Potassium (${mineral.amount} mg/L) supports normal heart rhythm.`); categories[3].benefits.push("Potassium contributes to fluid balance.") }
    if (name.includes("sodium")) { categories[3].benefits.push(`Sodium (${mineral.amount} mg/L) contributes to fluid balance.`); categories[4].benefits.push("Sodium helps transmit nerve signals.") }
    if (name.includes("bicarbonate")) categories[3].benefits.push("Bicarbonate contributes to the water's buffering profile.")
    if (name.includes("silica")) categories[0].benefits.push("Silica is associated with connective tissue.")
    if (name.includes("fluoride")) categories[0].benefits.push(`Fluoride (${mineral.amount} mg/L) contributes to tooth-mineral content.`)
    if (name.includes("zinc")) categories[5].benefits.push(`Zinc (${mineral.amount} mg/L) supports normal immune function.`)
    if (name.includes("iron")) categories[2].benefits.push("Iron contributes to normal oxygen transport.")
  }
  if (phLevel && phLevel >= 6.5 && phLevel <= 8.5) categories[3].benefits.push(`The measured pH is ${phLevel}, within the common bottled-water range.`)
  const activeCategories = categories.filter((category) => category.benefits.length > 0)

  const highlights: { text: string; benefit: string }[] = []
  if (minerals.some((mineral) => mineral.name.toLowerCase().includes("calcium") && mineral.amount > 20)) highlights.push({ text: t("highCalcium"), benefit: t("highCalciumBenefit") })
  if (minerals.some((mineral) => mineral.name.toLowerCase().includes("magnesium") && mineral.amount > 10)) highlights.push({ text: t("richMagnesium"), benefit: t("richMagnesiumBenefit") })
  if (phLevel && phLevel >= 7.5 && phLevel <= 8.5) highlights.push({ text: t("alkalineWater"), benefit: t("alkalineWaterBenefit") })
  if (minerals.length >= 8) highlights.push({ text: t("mineralRich"), benefit: t("mineralRichBenefit") })

  return (
    <section className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="grid gap-6 border-b border-border p-6 sm:grid-cols-[1fr_auto] sm:items-start sm:p-8">
        <PanelHeading index="05 / Profile" title={t("title")} description={t("description", { productName })} />
        <div className="border-l border-border pl-6"><span className="font-display text-6xl leading-none tracking-[-0.05em] tabular-nums">{wellnessScore}</span><p className="mt-1 text-[10px] uppercase tracking-[0.1em] text-muted-foreground">{t("wellnessScore")}</p></div>
      </div>

      <div className="space-y-10 p-6 sm:p-8">
        <div className="rounded-lg border border-border bg-[#f4f2ec] p-4">
          <p className="section-index text-center">{t("waterQualityProfile")}</p>
          <ResponsiveContainer width="100%" height={260}><RadarChart data={radarData}><PolarGrid stroke="#cbc8be" /><PolarAngleAxis dataKey="category" tick={{ fill: "#66645f", fontSize: 11 }} /><PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} /><Radar name="Quality score" dataKey="value" stroke="#66765a" fill="#9cab91" fillOpacity={0.38} /></RadarChart></ResponsiveContainer>
        </div>

        {highlights.length > 0 && <div className="grid gap-3 sm:grid-cols-2">{highlights.map((highlight, index) => <article key={highlight.text} className="rounded-lg border border-border bg-[#edf3ec] p-5"><span className="font-mono text-[10px] text-[#346538]">0{index + 1}</span><h3 className="mt-4 text-sm font-semibold text-[#346538]">{highlight.text}</h3><p className="mt-1 text-xs leading-5 text-muted-foreground">{highlight.benefit}</p></article>)}</div>}

        {activeCategories.length > 0 && <div><h3 className="font-display text-3xl tracking-[-0.03em]">{t("healthBenefitsTitle")}</h3><Accordion type="single" collapsible className="mt-5 w-full">{activeCategories.map((category, index) => <AccordionItem key={category.id} value={category.id} className="border-border"><AccordionTrigger className="py-5 hover:no-underline"><span className="flex items-center gap-3 text-left"><span className="font-mono text-[10px] text-muted-foreground">0{index + 1}</span><span className="font-medium">{category.title}</span><span className="rounded-full bg-muted px-2 py-0.5 font-mono text-[9px] text-muted-foreground">{category.benefits.length}</span></span></AccordionTrigger><AccordionContent><ul className="space-y-2 pb-3 pl-7">{category.benefits.map((benefit) => <li key={benefit} className="border-l border-border pl-4 text-sm leading-6 text-muted-foreground">{benefit}</li>)}</ul></AccordionContent></AccordionItem>)}</Accordion></div>}

        <aside className="flex items-start gap-3 border-t border-border pt-5"><RegistryGlyph kind="info" className="h-8 w-8" /><p className="max-w-3xl text-xs leading-5 text-muted-foreground">{t("disclaimer")}</p></aside>
      </div>
    </section>
  )
}
