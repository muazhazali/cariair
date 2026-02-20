"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Filter, Mountain, Waves, Building2, Zap, Sparkles, GlassWater } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

interface ProductFiltersProps {
  brands: { id: string; brand_name: string }[]
  basePath?: string
  onApply?: (filters: any) => void
  defaultValues?: {
    types?: string[]
    brands?: string[]
    minPh?: number
    maxPh?: number
    minTds?: number
    maxTds?: number
  }
}

const WATER_TYPES = ["Underground", "Spring", "Municipal", "Oxygenated", "Mineral", "Drinking"]

export function ProductFilters({ brands, basePath = "/search", onApply, defaultValues }: ProductFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // State initialization
  const [types, setTypes] = React.useState<string[]>(
    defaultValues?.types || searchParams.getAll("type")
  )
  const [phRange, setPhRange] = React.useState<[number, number]>([
    defaultValues?.minPh ?? (Number(searchParams.get("min_ph")) || 0),
    defaultValues?.maxPh ?? (Number(searchParams.get("max_ph")) || 14),
  ])
  const [tdsRange, setTdsRange] = React.useState<[number, number]>([
    defaultValues?.minTds ?? (Number(searchParams.get("min_tds")) || 0),
    defaultValues?.maxTds ?? (Number(searchParams.get("max_tds")) || 500),
  ])
  const [selectedBrands, setSelectedBrands] = React.useState<string[]>(
    defaultValues?.brands || searchParams.getAll("brand")
  )
  const [isOpen, setIsOpen] = React.useState(false)

  // Initialize with all selected if no params and defaultValues provided (Client-side mode)
  // Or if we want "Select All" to be the default state when empty.
  React.useEffect(() => {
    if (onApply && !searchParams.toString() && !defaultValues) {
      // If in client mode (onApply exists) and no params, we might want to default to ALL.
      // But usually the parent controls defaultValues.
    }
  }, [])

  // Update URL on apply
  const applyFilters = () => {
    if (onApply) {
      onApply({
        types,
        brands: selectedBrands,
        minPh: phRange[0],
        maxPh: phRange[1],
        minTds: tdsRange[0],
        maxTds: tdsRange[1]
      })
      setIsOpen(false)
      return
    }

    const params = new URLSearchParams(searchParams.toString())

    // Clear existing
    params.delete("type")
    params.delete("brand")
    params.delete("min_ph")
    params.delete("max_ph")
    params.delete("min_tds")
    params.delete("max_tds")
    params.delete("page") // Reset to page 1

    // Set new values
    types.forEach((t) => params.append("type", t))
    selectedBrands.forEach((b) => params.append("brand", b))

    if (phRange[0] > 0 || phRange[1] < 14) {
      params.set("min_ph", phRange[0].toString())
      params.set("max_ph", phRange[1].toString())
    }

    if (tdsRange[0] > 0 || tdsRange[1] < 500) {
      params.set("min_tds", tdsRange[0].toString())
      params.set("max_tds", tdsRange[1].toString())
    }

    router.push(`${basePath}?${params.toString()}`)
    setIsOpen(false)
  }

  const resetFilters = () => {
    if (onApply) {
      // Reset to ALL if that's the desired default
      const allTypes = WATER_TYPES
      const allBrands = brands.map(b => b.id)
      setTypes(allTypes)
      setSelectedBrands(allBrands)
      setPhRange([0, 14])
      setTdsRange([0, 500])

      onApply({
        types: allTypes,
        brands: allBrands,
        minPh: 0,
        maxPh: 14,
        minTds: 0,
        maxTds: 500
      })
      setIsOpen(false)
      return
    }

    setTypes([])
    setPhRange([0, 14])
    setTdsRange([0, 500])
    setSelectedBrands([])
    router.push(basePath)
    setIsOpen(false)
  }

  const FilterContent = (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium mb-4">Water Type</h3>
        <div className="space-y-3">
          {WATER_TYPES.map((type) => (
            <div key={type} className="flex items-center space-x-2">
              <Checkbox
                id={`type-${type}`}
                checked={types.includes(type)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setTypes([...types, type])
                  } else {
                    setTypes(types.filter((t) => t !== type))
                  }
                }}
              />
              <Label htmlFor={`type-${type}`} className="text-sm font-normal cursor-pointer flex items-center gap-2">
                <span className="opacity-70 scale-90">
                  {type === "Underground" && <Mountain className="h-3.5 w-3.5" />}
                  {type === "Spring" && <Waves className="h-3.5 w-3.5" />}
                  {type === "Municipal" && <Building2 className="h-3.5 w-3.5" />}
                  {type === "Oxygenated" && <Zap className="h-3.5 w-3.5" />}
                  {type === "Mineral" && <Sparkles className="h-3.5 w-3.5" />}
                  {type === "Drinking" && <GlassWater className="h-3.5 w-3.5" />}
                </span>
                {type}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium">pH Level</h3>
          <span className="text-xs text-muted-foreground">
            {phRange[0]} - {phRange[1]}
          </span>
        </div>
        <Slider
          value={phRange}
          min={0}
          max={14}
          step={0.1}
          minStepsBetweenThumbs={0.5}
          onValueChange={(value) => setPhRange(value as [number, number])}
          className="mb-6"
        />
      </div>

      <Separator />

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium">TDS (mg/L)</h3>
          <span className="text-xs text-muted-foreground">
            {tdsRange[0]} - {tdsRange[1]}
          </span>
        </div>
        <Slider
          value={tdsRange}
          min={0}
          max={500}
          step={10}
          minStepsBetweenThumbs={10}
          onValueChange={(value) => setTdsRange(value as [number, number])}
          className="mb-6"
        />
      </div>

      <Separator />

      <div>
        <h3 className="text-sm font-medium mb-4">Brands</h3>
        <ScrollArea className="h-[200px] pr-4">
          <div className="space-y-3">
            {brands.map((brand) => (
              <div key={brand.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`brand-${brand.id}`}
                  checked={selectedBrands.includes(brand.id)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedBrands([...selectedBrands, brand.id])
                    } else {
                      setSelectedBrands(selectedBrands.filter((b) => b !== brand.id))
                    }
                  }}
                />
                <Label htmlFor={`brand-${brand.id}`} className="text-sm font-normal cursor-pointer">
                  {brand.brand_name}
                </Label>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      <div className="flex gap-2 pt-4">
        <Button onClick={applyFilters} className="flex-1">Apply Filters</Button>
        <Button variant="outline" onClick={resetFilters}>Reset</Button>
      </div>
    </div>
  )

  const activeFilterCount =
    types.length +
    selectedBrands.length +
    (phRange[0] > 0 || phRange[1] < 14 ? 1 : 0) +
    (tdsRange[0] > 0 || tdsRange[1] < 500 ? 1 : 0)

  return (
    <>
      {/* Mobile Filter Button */}
      <div className="md:hidden mb-4">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="w-full relative">
              <Filter className="mr-2 h-4 w-4" />
              Filters
              {activeFilterCount > 0 && (
                <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] sm:w-[400px]">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
              <SheetDescription>
                Refine your search results
              </SheetDescription>
            </SheetHeader>
            <div className="py-6 h-full overflow-y-auto pb-20">
              {FilterContent}
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Filter Sidebar */}
      <div className="hidden md:block">
        <div className="sticky top-20">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">Filters</h2>
            <Button variant="ghost" size="sm" onClick={resetFilters}>
              Reset
            </Button>
          </div>
          {FilterContent}
        </div>
      </div>
    </>
  )
}
