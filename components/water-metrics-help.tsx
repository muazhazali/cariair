"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { RegistryGlyph } from "@/components/editorial-primitives"

interface Props { translations: { index: string; trigger: string; title: string; phTitle: string; phDesc: string; phAcidic: string; phNeutral: string; phAlkaline: string; tdsTitle: string; tdsDesc: string; tdsLow: string; tdsMedium: string; tdsHigh: string } }

export function WaterMetricsHelp({ translations: t }: Props) {
  return <Dialog><DialogTrigger asChild><Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:bg-transparent hover:text-foreground"><span className="grid h-5 w-5 place-items-center rounded-full border border-current font-mono text-[10px]">?</span>{t.trigger}</Button></DialogTrigger><DialogContent className="max-w-lg rounded-xl border-border p-0"><DialogHeader className="border-b border-border p-6 pr-12"><p className="section-index">{t.index}</p><DialogTitle className="font-display text-3xl font-normal tracking-[-0.03em]">{t.title}</DialogTitle></DialogHeader><div className="space-y-8 p-6 text-sm"><MetricHelp index="01" title={t.phTitle} description={t.phDesc} items={[t.phAcidic,t.phNeutral,t.phAlkaline]} /><MetricHelp index="02" title={t.tdsTitle} description={t.tdsDesc} items={[t.tdsLow,t.tdsMedium,t.tdsHigh]} /></div></DialogContent></Dialog>
}

function MetricHelp({ index, title, description, items }: { index: string; title: string; description: string; items: string[] }) {
  return <section className="grid gap-4 sm:grid-cols-[2.5rem_1fr]"><span className="font-mono text-[10px] text-muted-foreground">{index}</span><div><h3 className="text-base font-semibold">{title}</h3><p className="mt-1.5 leading-6 text-muted-foreground">{description}</p><ul className="mt-4 divide-y divide-border border-y border-border">{items.map((item, i) => <li key={item} className="flex gap-3 py-2.5"><span className="font-mono text-[10px] text-survey">0{i+1}</span><span>{item}</span></li>)}</ul></div></section>
}
