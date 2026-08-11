import { cn } from "@/lib/utils"

export function WaterTypeBadge({ type, className }: { type: string | undefined | null; className?: string }) {
  return <span className={cn("inline-flex items-center gap-2 rounded-full bg-[#e1f3ee] px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-[#346558]", className)}><span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />{type || "Unknown"}</span>
}
