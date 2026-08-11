"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface HomeFiltersProps {
  brands: { id: string; brand_name: string }[]
  currentQuery: string
  currentTypes: string[]
  currentBrands: string[]
  currentMinPh?: number
  currentMaxPh?: number
  currentMinTds?: number
  currentMaxTds?: number
  currentSort: string
  resultCount: number
}

const WATER_TYPES = ["Underground", "Spring", "Municipal", "Oxygenated", "Mineral", "Drinking"]

export function HomeFilters({ brands, currentQuery, currentTypes, currentBrands, currentMinPh,
  currentMaxPh, currentMinTds, currentMaxTds, currentSort, resultCount }: HomeFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tf = useTranslations("filters")
  const ts = useTranslations("sourcesView")
  const tso = useTranslations("sort")
  const [query, setQuery] = useState(currentQuery)
  const [isOpen, setIsOpen] = useState(false)
  const [types, setTypes] = useState<string[]>(currentTypes)
  const [selectedBrands, setSelectedBrands] = useState<string[]>(currentBrands)
  const [phRange, setPhRange] = useState<[number, number]>([currentMinPh ?? 0, currentMaxPh ?? 14])
  const [tdsRange, setTdsRange] = useState<[number, number]>([currentMinTds ?? 0, currentMaxTds ?? 500])

  const applyFilters = () => {
    const params = new URLSearchParams()
    if (query.trim()) params.set("q", query.trim())
    types.forEach((type) => params.append("type", type))
    selectedBrands.forEach((brand) => params.append("brand", brand))
    if (phRange[0] > 0 || phRange[1] < 14) {
      params.set("min_ph", phRange[0].toString()); params.set("max_ph", phRange[1].toString())
    }
    if (tdsRange[0] > 0 || tdsRange[1] < 500) {
      params.set("min_tds", tdsRange[0].toString()); params.set("max_tds", tdsRange[1].toString())
    }
    if (currentSort !== "name_asc") params.set("sort", currentSort)
    router.push(params.size ? `/?${params.toString()}` : "/")
    setIsOpen(false)
  }

  const clearFilters = () => {
    setQuery(""); setTypes([]); setSelectedBrands([]); setPhRange([0, 14]); setTdsRange([0, 500])
    router.push("/"); setIsOpen(false)
  }

  const handleSort = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === "name_asc") params.delete("sort"); else params.set("sort", value)
    router.push(params.size ? `/?${params.toString()}` : "/")
  }

  const activeFilterCount = types.length + selectedBrands.length +
    (phRange[0] > 0 || phRange[1] < 14 ? 1 : 0) + (tdsRange[0] > 0 || tdsRange[1] < 500 ? 1 : 0)

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
      <div className="flex min-w-0 flex-1 gap-2">
        <div className="relative min-w-0 flex-1">
          <SearchGlyph />
          <Label htmlFor="registry-search" className="sr-only">{ts("searchPlaceholder")}</Label>
          <Input id="registry-search" placeholder={ts("searchPlaceholder")} value={query}
            onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => event.key === "Enter" && applyFilters()}
            className="h-11 rounded-md border-border bg-background pl-10 pr-10 shadow-none focus-visible:ring-1" />
          {query && (
            <button type="button" onClick={() => setQuery("")} aria-label={tf("reset")}
              className="absolute right-3 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center text-muted-foreground transition-colors hover:text-foreground">
              <CloseGlyph />
            </button>
          )}
        </div>
        <Button onClick={applyFilters} className="h-11 rounded-md px-5 active:scale-[.98]">{ts("search")}</Button>
      </div>

      <div className="flex items-center gap-2">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="h-10 rounded-md border-border bg-background shadow-none">
              <FilterGlyph /> {tf("filterButton")}
              {activeFilterCount > 0 && <span className="rounded-full bg-[#dfe8d9] px-1.5 py-0.5 font-mono text-[10px] text-[#405039]">{activeFilterCount}</span>}
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full border-l border-border bg-background p-0 sm:max-w-md">
            <SheetHeader className="border-b border-border px-6 py-6 text-left">
              <p className="section-index">Registry controls</p>
              <SheetTitle className="font-display text-3xl font-normal tracking-[-0.03em]">{tf("title")}</SheetTitle>
            </SheetHeader>
            <div className="h-[calc(100dvh-11rem)] space-y-8 overflow-y-auto px-6 py-7">
              <FilterSection title={tf("waterType")}>
                <div className="grid grid-cols-2 gap-2">
                  {WATER_TYPES.map((type) => (
                    <label key={type} htmlFor={`type-${type}`} className="flex cursor-pointer items-center gap-2.5 rounded-md border border-border px-3 py-2.5 text-sm transition-colors hover:bg-muted">
                      <Checkbox id={`type-${type}`} checked={types.includes(type)} onCheckedChange={(checked) => setTypes(checked ? [...types, type] : types.filter((item) => item !== type))} />
                      {type}
                    </label>
                  ))}
                </div>
              </FilterSection>
              <FilterSection title={tf("phLevel")} value={`${phRange[0]} — ${phRange[1]}`}>
                <Slider value={phRange} min={0} max={14} step={0.1} onValueChange={(value) => setPhRange(value as [number, number])} />
              </FilterSection>
              <FilterSection title={tf("tds")} value={`${tdsRange[0]} — ${tdsRange[1]}`}>
                <Slider value={tdsRange} min={0} max={500} step={10} onValueChange={(value) => setTdsRange(value as [number, number])} />
              </FilterSection>
              <FilterSection title={tf("brands")}>
                <div className="max-h-52 space-y-1 overflow-y-auto pr-2">
                  {brands.map((brand) => (
                    <label key={brand.id} htmlFor={`brand-${brand.id}`} className="flex cursor-pointer items-center gap-3 border-b border-border py-2.5 text-sm">
                      <Checkbox id={`brand-${brand.id}`} checked={selectedBrands.includes(brand.id)} onCheckedChange={(checked) => setSelectedBrands(checked ? [...selectedBrands, brand.id] : selectedBrands.filter((item) => item !== brand.id))} />
                      {brand.brand_name}
                    </label>
                  ))}
                </div>
              </FilterSection>
            </div>
            <div className="absolute inset-x-0 bottom-0 flex gap-2 border-t border-border bg-background p-4">
              <Button onClick={applyFilters} className="h-11 flex-1">{tf("applyFilters")}</Button>
              <Button variant="outline" onClick={clearFilters} className="h-11 border-border shadow-none">{tf("clearAll")}</Button>
            </div>
          </SheetContent>
        </Sheet>

        <Select onValueChange={handleSort} value={currentSort}>
          <SelectTrigger className="h-10 w-[9.5rem] rounded-md border-border bg-background shadow-none sm:w-[11rem]">
            <SelectValue placeholder={tso("placeholder")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name_asc">{tso("nameAsc")}</SelectItem><SelectItem value="name_desc">{tso("nameDesc")}</SelectItem>
            <SelectItem value="ph_asc">{tso("phAsc")}</SelectItem><SelectItem value="ph_desc">{tso("phDesc")}</SelectItem>
            <SelectItem value="tds_asc">{tso("tdsAsc")}</SelectItem><SelectItem value="tds_desc">{tso("tdsDesc")}</SelectItem>
          </SelectContent>
        </Select>
        <span className="ml-auto hidden whitespace-nowrap font-mono text-[11px] text-muted-foreground sm:block">{ts("waterSourcesFound", { count: resultCount })}</span>
      </div>
    </div>
  )
}

function FilterSection({ title, value, children }: { title: string; value?: string; children: React.ReactNode }) {
  return <section><div className="mb-4 flex items-center justify-between"><h3 className="text-sm font-semibold">{title}</h3>{value && <span className="font-mono text-xs text-muted-foreground">{value}</span>}</div>{children}</section>
}

function SearchGlyph() { return <svg viewBox="0 0 20 20" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" fill="none"><circle cx="8.5" cy="8.5" r="5" stroke="currentColor" strokeWidth="1.8"/><path d="m12.2 12.2 4 4" stroke="currentColor" strokeWidth="1.8"/></svg> }
function CloseGlyph() { return <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" aria-hidden="true"><path d="m5 5 10 10M15 5 5 15" fill="none" stroke="currentColor" strokeWidth="1.8"/></svg> }
function FilterGlyph() { return <svg viewBox="0 0 20 20" className="h-4 w-4" aria-hidden="true" fill="none"><path d="M3 5h14M6 10h8M8 15h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="square"/></svg> }
