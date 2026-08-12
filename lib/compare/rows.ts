import type { Product } from "@/lib/types/db"
import { getMineralInfo } from "@/lib/mineral-data"

export type AttributeRow = {
  key: string
  label: string
  kind: "text" | "numeric"
  unit?: string
  values: (string | number | null)[] // aligned to products order; null = unknown
  // index of the "best" value in this row, or null when not comparable / tied / all null
  bestIndex: number | null
  // "higher" or "lower" is better, or null for non-comparable rows
  direction: "higher" | "lower" | null
}

export type MineralRow = {
  key: string
  label: string
  symbol: string
  values: (number | null)[] // mg/L per product, null = not reported
  bestIndex: number | null
  direction: "higher" | "lower"
  // max absolute value across the set, for sorting relevance
  maxAcrossSet: number
}

export type CompareRows = {
  attributes: AttributeRow[]
  minerals: MineralRow[]
}

// Minerals where a lower value is generally desirable (health-wise).
// Everything else defaults to "higher is better".
const LOWER_IS_BETTER = new Set([
  "sodium",
  "chloride",
  "sulfate",
  "sulphate",
  "nitrate",
  "fluoride",
])

// Stable key for a mineral name (lowercased, trimmed).
function mineralKey(name: string): string {
  return name.toLowerCase().trim()
}

// Parse a product's mineral map into a normalized record keyed by mineral key.
export function normalizeMinerals(product: Product): Record<string, number | null> {
  const raw = product.minerals_json
  let entries: Array<{ name: string; amount: number | null }> = []

  type MineralEntry = { name: string; amount: number | null }

  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        entries = (parsed as MineralEntry[]).map((m) => ({ name: m.name, amount: m.amount }))
      } else if (parsed && typeof parsed === "object") {
        entries = (Object.values(parsed) as MineralEntry[]).map((m) => ({ name: m.name, amount: m.amount }))
      }
    } catch {
      entries = []
    }
  } else if (Array.isArray(raw)) {
    entries = (raw as MineralEntry[]).map((m) => ({ name: m.name, amount: m.amount }))
  } else if (raw && typeof raw === "object") {
    entries = (Object.values(raw) as MineralEntry[]).map((m) => ({ name: m.name, amount: m.amount }))
  }

  const out: Record<string, number | null> = {}
  for (const entry of entries) {
    if (!entry?.name) continue
    const key = mineralKey(entry.name)
    if (key === "sulphate") {
      // normalize sulphate -> sulfate for display unification
      out["sulfate"] = entry.amount == null ? null : Number(entry.amount)
      continue
    }
    out[key] = entry.amount == null ? null : Number(entry.amount)
  }
  return out
}

function fmtNum(value: number | null | undefined, digits = 1): string {
  if (value == null || Number.isNaN(value)) return "—"
  const n = Number(value)
  // Use 1 decimal for small values, 0 for large integers
  if (n >= 100) return n.toFixed(0)
  if (Number.isInteger(n)) return n.toFixed(0)
  return n.toFixed(digits)
}

function pickBest(
  values: (number | null)[],
  direction: "higher" | "lower",
): number | null {
  const valid = values
    .map((v, i) => (v == null || Number.isNaN(v) ? null : { v: v as number, i }))
    .filter((x): x is { v: number; i: number } => x !== null)
  if (valid.length < 2) return null
  let best = valid[0]
  for (const candidate of valid) {
    if (direction === "higher" && candidate.v > best.v) best = candidate
    if (direction === "lower" && candidate.v < best.v) best = candidate
  }
  // Tie? mark no single best.
  const ties = valid.filter((c) => c.v === best.v)
  if (ties.length > 1) return null
  return best.i
}

export function buildCompareRows(products: Product[]): CompareRows {
  const n = products.length

  // ---- Attribute rows ----
  const phValues: (number | null)[] = products.map((p) => (p.ph_level == null ? null : Number(p.ph_level)))
  const tdsValues: (number | null)[] = products.map((p) => (p.tds == null ? null : Number(p.tds)))

  const attributes: AttributeRow[] = [
    {
      key: "waterType",
      label: "waterType",
      kind: "text",
      values: products.map((p) => p.source?.type ?? p.water_type ?? null),
      bestIndex: null,
      direction: null,
    },
    {
      key: "ph",
      label: "phLevel",
      kind: "numeric",
      values: phValues.map((v) => (v == null ? null : v)),
      bestIndex: pickBest(phValues, "higher"),
      direction: "higher",
    },
    {
      key: "tds",
      label: "tdsMgL",
      kind: "numeric",
      unit: "mg/L",
      values: tdsValues.map((v) => (v == null ? null : v)),
      // TDS isn't strictly "higher is better" — leave non-directional but still show numeric
      bestIndex: null,
      direction: null,
    },
    {
      key: "sourceType",
      label: "sourceType",
      kind: "text",
      values: products.map((p) => p.source?.type ?? null),
      bestIndex: null,
      direction: null,
    },
    {
      key: "sourceLocation",
      label: "location",
      kind: "text",
      values: products.map((p) => p.source?.location_address ?? null),
      bestIndex: null,
      direction: null,
    },
    {
      key: "manufacturer",
      label: "manufacturer",
      kind: "text",
      values: products.map((p) => p.manufacturer?.name ?? null),
      bestIndex: null,
      direction: null,
    },
    {
      key: "kkmApproval",
      label: "kkmApproval",
      kind: "text",
      values: products.map((p) => p.source?.kkm_approval_number ?? null),
      bestIndex: null,
      direction: null,
    },
  ]

  // ---- Mineral rows: union across selected products ----
  const perProduct = products.map(normalizeMinerals)
  const unionKeys = new Set<string>()
  for (const map of perProduct) {
    for (const key of Object.keys(map)) unionKeys.add(key)
  }

  const mineralRows: MineralRow[] = []
  for (const key of unionKeys) {
    const info = getMineralInfo(key === "sulphate" ? "sulfate" : key)
    const values = perProduct.map((m) => {
      const v = m[key] ?? m[key === "sulfate" ? "sulphate" : "sulphate"]
      return v == null ? null : Number(v)
    })
    const direction: "higher" | "lower" = LOWER_IS_BETTER.has(key) ? "lower" : "higher"
    const maxAcrossSet = Math.max(0, ...values.map((v) => (v == null ? 0 : v)))
    mineralRows.push({
      key,
      label: info.name,
      symbol: info.symbol,
      values,
      bestIndex: pickBest(values, direction),
      direction,
      maxAcrossSet,
    })
  }

  // Sort minerals by max value across the set, descending — most differentiating first.
  mineralRows.sort((a, b) => b.maxAcrossSet - a.maxAcrossSet)

  return { attributes, minerals: mineralRows }
}

export function formatAttributeValue(row: AttributeRow, value: string | number | null): string {
  if (value == null) return "—"
  if (row.kind === "numeric") return fmtNum(value as number)
  return String(value)
}

export function formatMineralValue(value: number | null): string {
  if (value == null) return "—"
  return fmtNum(value, 1)
}