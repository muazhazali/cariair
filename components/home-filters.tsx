"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Search, SlidersHorizontal, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface HomeFiltersProps {
  brands: { id: string; brand_name: string }[]
  currentQuery: string
  currentTypes: string[]
  currentBrands: string[]
  currentMinPh?: number
  currentMaxPh?: number
  currentMinTds?: number
  currentMaxTds?: number
  resultCount: number
}

const WATER_TYPES = ["Underground", "Spring", "Municipal", "Oxygenated", "Mineral", "Drinking"]

export function HomeFilters({
  brands,
  currentQuery,
  currentTypes,
  currentBrands,
  currentMinPh,
  currentMaxPh,
  currentMinTds,
  currentMaxTds,
  resultCount,
}: HomeFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(currentQuery)
  const [isOpen, setIsOpen] = useState(false)

  // Filter states
  const [types, setTypes] = useState<string[]>(currentTypes)
  const [selectedBrands, setSelectedBrands] = useState<string[]>(currentBrands)
  const [phRange, setPhRange] = useState<[number, number]>([
    currentMinPh ?? 0,
    currentMaxPh ?? 14,
  ])
  const [tdsRange, setTdsRange] = useState<[number, number]>([
    currentMinTds ?? 0,
    currentMaxTds ?? 500,
  ])

  const applyFilters = () => {
    const params = new URLSearchParams()

    if (query.trim()) params.set("q", query.trim())
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

    router.push(`/?${params.toString()}`)
    setIsOpen(false)
  }

  const clearFilters = () => {
    setQuery("")
    setTypes([])
    setSelectedBrands([])
    setPhRange([0, 14])
    setTdsRange([0, 500])
    router.push("/")
    setIsOpen(false)
  }

  const handleSort = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("sort", value)
    router.push(`/?${params.toString()}`)
  }

  const activeFilterCount =
    types.length +
    selectedBrands.length +
    (phRange[0] > 0 || phRange[1] < 14 ? 1 : 0) +
    (tdsRange[0] > 0 || tdsRange[1] < 500 ? 1 : 0)

  const hasFilters = query || activeFilterCount > 0

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {/* Search Input */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search brands or products..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && applyFilters()}
          className="pl-9"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2"
          >
            <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
          </button>
        )}
      </div>

      {/* Filter Button (Mobile) */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" className="sm:hidden">
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Filters
            {activeFilterCount > 0 && (
              <span className="ml-2 text-xs bg-primary text-primary-foreground rounded-full px-1.5 py-0.5">
                {activeFilterCount}
              </span>
            )}
          </Button>
        </SheetTrigger>

        {/* Filter Button (Desktop) */}
        <Button
          variant="outline"
          onClick={() => setIsOpen(true)}
          className="hidden sm:flex"
        >
          <SlidersHorizontal className="h-4 w-4 mr-2" />
          Filters
          {activeFilterCount > 0 && (
            <span className="ml-2 text-xs bg-primary text-primary-foreground rounded-full px-1.5 py-0.5">
              {activeFilterCount}
            </span>
          )}
        </Button>

        <SheetContent side="right" className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Filters</SheetTitle>
          </SheetHeader>

          <div className="mt-6 space-y-6 overflow-y-auto h-[calc(100vh-200px)]">
            {/* Water Type */}
            <div>
              <h4 className="font-medium mb-3">Water Type</h4>
              <div className="space-y-2">
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
                    <Label htmlFor={`type-${type}`} className="text-sm">
                      {type}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* pH Range */}
            <div>
              <div className="flex justify-between mb-3">
                <h4 className="font-medium">pH Range</h4>
                <span className="text-sm text-muted-foreground">
                  {phRange[0]} - {phRange[1]}
                </span>
              </div>
              <Slider
                value={phRange}
                min={0}
                max={14}
                step={0.1}
                onValueChange={(value) => setPhRange(value as [number, number])}
              />
            </div>

            {/* TDS Range */}
            <div>
              <div className="flex justify-between mb-3">
                <h4 className="font-medium">TDS (mg/L)</h4>
                <span className="text-sm text-muted-foreground">
                  {tdsRange[0]} - {tdsRange[1]}
                </span>
              </div>
              <Slider
                value={tdsRange}
                min={0}
                max={500}
                step={10}
                onValueChange={(value) => setTdsRange(value as [number, number])}
              />
            </div>

            {/* Brands */}
            <div>
              <h4 className="font-medium mb-3">Brands</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
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
                    <Label htmlFor={`brand-${brand.id}`} className="text-sm">
                      {brand.brand_name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-4 bg-background border-t flex gap-2">
            <Button onClick={applyFilters} className="flex-1">
              Apply Filters
            </Button>
            <Button variant="outline" onClick={clearFilters}>
              Clear
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Apply Search Button */}
      <Button onClick={applyFilters} className="hidden sm:flex">
        Search
      </Button>

      {/* Result Count */}
      <div className="flex items-center gap-2 ml-auto">
        <span className="text-sm text-muted-foreground">
          {resultCount} result{resultCount !== 1 ? "s" : ""}
        </span>

        {/* Sort Dropdown */}
        <Select onValueChange={handleSort} defaultValue="name_asc">
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name_asc">Name A-Z</SelectItem>
            <SelectItem value="name_desc">Name Z-A</SelectItem>
            <SelectItem value="ph_asc">pH Low to High</SelectItem>
            <SelectItem value="ph_desc">pH High to Low</SelectItem>
            <SelectItem value="tds_asc">TDS Low to High</SelectItem>
            <SelectItem value="tds_desc">TDS High to Low</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
