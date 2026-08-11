"use client"

import { useTranslations } from "next-intl"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { calculateDailyIntakePercentage, getMineralInfo } from "@/lib/mineral-data"
import { PanelHeading, RegistryGlyph } from "@/components/editorial-primitives"

interface Mineral { name: string; symbol?: string; amount: number; unit?: string }

export function MineralCompositionPanel({ minerals }: { minerals: Mineral[]; productName: string }) {
  const t = useTranslations("mineralPanel")
  const enriched = (minerals || []).map((mineral) => ({
    ...mineral,
    info: getMineralInfo(mineral.name),
    daily: calculateDailyIntakePercentage(mineral.name, mineral.amount),
  })).sort((a, b) => (b.amount || 0) - (a.amount || 0))

  if (enriched.length === 0) {
    return <section className="rounded-xl border border-border bg-card p-6 sm:p-8"><PanelHeading index="04 / Composition" title={t("title")} description={t("description")} /><div className="mt-8 grid min-h-40 place-items-center border-y border-border py-10 text-center"><RegistryGlyph kind="info" className="mx-auto" /><p className="mt-4 text-sm text-muted-foreground">{t("noData")}</p></div></section>
  }

  const chartData = enriched.map((mineral) => ({ name: mineral.info.symbol, amount: mineral.amount, fullName: mineral.info.name }))
  const highlights = enriched.filter((mineral) => mineral.daily != null && mineral.daily >= 10).slice(0, 3)

  return (
    <section className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="flex flex-col gap-5 border-b border-border p-6 sm:flex-row sm:items-start sm:justify-between sm:p-8">
        <PanelHeading index="04 / Composition" title={t("title")} description={t("description")} />
        <span className="self-start rounded-full bg-[#e1f3ee] px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-[#346558]">{t("mineralsDetected", { count: enriched.length })}</span>
      </div>

      <div className="space-y-10 p-6 sm:p-8">
        <div className="rounded-lg border border-border bg-[#f4f2ec] p-3 sm:p-5">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} margin={{ top: 12, right: 8, bottom: 0, left: -18 }}>
              <CartesianGrid stroke="#dedbd2" strokeDasharray="2 4" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: "#787774", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#787774", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ border: "1px solid #dedbd2", borderRadius: 6, boxShadow: "0 4px 18px rgba(52,50,42,.04)", fontSize: 12 }} formatter={(value) => [`${value} mg/L`, t("amount")]} labelFormatter={(label, payload) => payload?.[0]?.payload?.fullName || label} />
              <Bar dataKey="amount" fill="#66765a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div>
          <h3 className="font-display text-3xl tracking-[-0.03em]">{t("compositionDetails")}</h3>
          <div className="mt-5 overflow-x-auto border-y border-border">
            <table className="w-full min-w-[42rem] text-left">
              <thead><tr className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground"><th className="px-3 py-3 font-medium">{t("mineral")}</th><th className="px-3 py-3 text-right font-medium">{t("amount")}</th><th className="px-3 py-3 font-medium">{t("healthBenefit")}</th><th className="px-3 py-3 text-center font-medium" title={t("dailyTooltip")}>{t("dailyPct")}</th></tr></thead>
              <tbody>{enriched.map((mineral) => <tr key={mineral.name} className="border-t border-border transition-colors hover:bg-muted/50"><td className="px-3 py-4"><span className="font-semibold">{mineral.info.name}</span><span className="ml-2 font-mono text-[10px] text-muted-foreground">{mineral.info.symbol}</span></td><td className="px-3 py-4 text-right font-mono tabular-nums">{mineral.amount}<span className="ml-1 text-[10px] text-muted-foreground">{mineral.unit || "mg/L"}</span></td><td className="max-w-sm px-3 py-4 text-xs leading-5 text-muted-foreground">{mineral.info.healthBenefit}</td><td className="px-3 py-4 text-center">{mineral.daily != null ? <span className="rounded-full bg-[#edf3ec] px-2 py-1 font-mono text-[10px] text-[#346538]">{mineral.daily.toFixed(1)}%</span> : <span className="text-xs text-muted-foreground">—</span>}</td></tr>)}</tbody>
            </table>
          </div>
        </div>

        <aside className="rounded-lg border border-border bg-[#edf3ec] p-5">
          <p className="section-index text-[#346538]">{t("keyHighlights")}</p>
          <ul className="mt-3 space-y-2 text-sm leading-6">{highlights.length > 0 ? highlights.map((mineral, index) => <li key={mineral.name} className="grid grid-cols-[1.5rem_1fr] gap-2"><span className="font-mono text-[10px] text-[#346538]">0{index + 1}</span><span><strong>{mineral.info.name}:</strong> {t("provides")} {mineral.daily?.toFixed(0)}% {t("ofDailyIntake")}</span></li>) : <li className="text-muted-foreground">{t("traceAmounts")}</li>}</ul>
        </aside>
      </div>
    </section>
  )
}
