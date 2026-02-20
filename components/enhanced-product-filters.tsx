"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Filter, X, ChevronDown, Sparkles, Heart, Bone, Droplets, Zap } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

interface EnhancedProductFiltersProps {
  brands: { id: string; brand_name: string }[]
  onApply?: (filters: any) => void
  defaultValues?: {
    types?: string[]
    brands?: string[]
    minPh?: number
    maxPh?: number
    minTds?: number
    maxTds?: number
  }
  /** "sidebar" renders the filter content inline (desktop). "dialog" wraps in a button+dialog (default). */
  mode?: "sidebar" | "dialog"
}

const WATER_TYPES = ["Underground", "Spring", "Municipal", "Oxygenated"]

// Health goal presets
const HEALTH_PRESETS = [
  {
    id: "bone",
    name: "Bone Health",
    icon: Bone,
    description: "High calcium content",
    filters: {
      minPh: 7.0,
      maxPh: 8.5,
      // Would filter by calcium content if we had that capability
    },
  },
  {
    id: "heart",
    name: "Heart Health",
    icon: Heart,
    description: "Low sodium, high potassium",
    filters: {
      minPh: 7.0,
      maxPh: 8.0,
    },
  },
  {
    id: "hydration",
    name: "Optimal Hydration",
    icon: Droplets,
    description: "Balanced minerals, neutral pH",
    filters: {
      minPh: 6.5,
      maxPh: 7.5,
      minTds: 50,
      maxTds: 150,
    },
  },
  {
    id: "energy",
    name: "Energy & Performance",
    icon: Zap,
    description: "Rich in magnesium",
    filters: {
      minPh: 7.0,
      maxPh: 8.5,
      minTds: 100,
      maxTds: 300,
    },
  },
]

export function EnhancedProductFilters({ brands, onApply, defaultValues, mode = "dialog" }: EnhancedProductFiltersProps) {
  // State initialization
  const [types, setTypes] = React.useState<string[]>(defaultValues?.types || WATER_TYPES)
  const [phRange, setPhRange] = React.useState<[number, number]>([
    defaultValues?.minPh ?? 0,
    defaultValues?.maxPh ?? 14,
  ])
  const [tdsRange, setTdsRange] = React.useState<[number, number]>([
    defaultValues?.minTds ?? 0,
    defaultValues?.maxTds ?? 500,
  ])
  const [selectedBrands, setSelectedBrands] = React.useState<string[]>(
    defaultValues?.brands || brands.map(b => b.id)
  )
  const [isOpen, setIsOpen] = React.useState(false)
  const [selectedPreset, setSelectedPreset] = React.useState<string | null>(null)

  // Collapsible sections state
  const [openSections, setOpenSections] = React.useState({
    presets: true,
    waterType: true,
    ph: true,
    tds: true,
    brands: true,
  })

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  // Apply filters
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
    }
  }

  // Reset filters to "all selected"
  const resetFilters = () => {
    const allTypes = WATER_TYPES
    const allBrands = brands.map(b => b.id)
    setTypes(allTypes)
    setSelectedBrands(allBrands)
    setPhRange([0, 14])
    setTdsRange([0, 500])

    if (onApply) {
      onApply({
        types: allTypes,
        brands: allBrands,
        minPh: 0,
        maxPh: 14,
        minTds: 0,
        maxTds: 500
      })
      setIsOpen(false)
    }
  }

  // Clear all filters (deselect all)
  const clearAllFilters = () => {
    setTypes([])
    setSelectedBrands([])
    setPhRange([0, 14])
    setTdsRange([0, 500])

    if (onApply) {
      onApply({
        types: [],
        brands: [],
        minPh: 0,
        maxPh: 14,
        minTds: 0,
        maxTds: 500
      })
      setIsOpen(false)
    }
  }

  // Apply health preset
  const applyPreset = (preset: typeof HEALTH_PRESETS[0]) => {
    if (selectedPreset === preset.id) {
      setSelectedPreset(null)
      setPhRange([0, 14])
      setTdsRange([0, 500])
    } else {
      setSelectedPreset(preset.id)
      setPhRange([preset.filters.minPh ?? 0, preset.filters.maxPh ?? 14])
      setTdsRange([preset.filters.minTds ?? 0, preset.filters.maxTds ?? 500])
    }
  }

  // Remove individual filter
  const removeTypeFilter = (type: string) => {
    setTypes(prev => prev.filter(t => t !== type))
  }

  const removeBrandFilter = (brandId: string) => {
    setSelectedBrands(prev => prev.filter(b => b !== brandId))
  }

  const resetPhFilter = () => {
    setPhRange([0, 14])
  }

  const resetTdsFilter = () => {
    setTdsRange([0, 500])
  }

  // Calculate active filter count
  const activeFilterCount =
    (types.length < WATER_TYPES.length ? 1 : 0) +
    (selectedBrands.length < brands.length ? 1 : 0) +
    (phRange[0] > 0 || phRange[1] < 14 ? 1 : 0) +
    (tdsRange[0] > 0 || tdsRange[1] < 500 ? 1 : 0)

  // Get active filters for chips display
  const getActiveFilters = () => {
    const filters: { type: string; label: string; value: string; onRemove: () => void }[] = []

    // Water types
    if (types.length > 0 && types.length < WATER_TYPES.length) {
      types.forEach(type => {
        filters.push({
          type: 'waterType',
          label: 'Type',
          value: type,
          onRemove: () => removeTypeFilter(type)
        })
      })
    }

    // Brands
    if (selectedBrands.length > 0 && selectedBrands.length < brands.length) {
      selectedBrands.slice(0, 3).forEach(brandId => {
        const brand = brands.find(b => b.id === brandId)
        if (brand) {
          filters.push({
            type: 'brand',
            label: 'Brand',
            value: brand.brand_name,
            onRemove: () => removeBrandFilter(brandId)
          })
        }
      })
      if (selectedBrands.length > 3) {
        filters.push({
          type: 'brand',
          label: 'Brand',
          value: `+${selectedBrands.length - 3} more`,
          onRemove: () => {}
        })
      }
    }

    // pH Range
    if (phRange[0] > 0 || phRange[1] < 14) {
      filters.push({
        type: 'ph',
        label: 'pH',
        value: `${phRange[0]} - ${phRange[1]}`,
        onRemove: resetPhFilter
      })
    }

    // TDS Range
    if (tdsRange[0] > 0 || tdsRange[1] < 500) {
      filters.push({
        type: 'tds',
        label: 'TDS',
        value: `${tdsRange[0]} - ${tdsRange[1]} mg/L`,
        onRemove: resetTdsFilter
      })
    }

    return filters
  }

  const activeFilters = getActiveFilters()

  const FilterContent = (
    <div className="space-y-4">
      {/* Health Goal Presets */}
      <Collapsible open={openSections.presets} onOpenChange={() => toggleSection('presets')}>
        <CollapsibleTrigger className="flex items-center justify-between w-full group">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-purple-500" />
            Recommended for Me
          </h3>
          <ChevronDown className={`h-4 w-4 transition-transform ${openSections.presets ? 'rotate-180' : ''}`} />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-3">
          <div className="grid grid-cols-2 gap-2">
            {HEALTH_PRESETS.map((preset) => (
              <Button
                key={preset.id}
                variant="outline"
                size="sm"
                onClick={() => applyPreset(preset)}
                className={`h-auto p-3 flex flex-col items-start gap-1 overflow-hidden min-w-0 transition-colors ${selectedPreset === preset.id ? "bg-purple-100 border-purple-400 dark:bg-purple-950/40 dark:border-purple-600" : "hover:bg-purple-50 dark:hover:bg-purple-950/20"}`}
              >
                <div className="flex items-center gap-2 w-full min-w-0">
                  <preset.icon className="h-4 w-4 shrink-0" />
                  <span className="text-xs font-semibold break-words">{preset.name}</span>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400 text-left break-words">
                  {preset.description}
                </span>
              </Button>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>

      <Separator />

      {/* Water Type Filter */}
      <Collapsible open={openSections.waterType} onOpenChange={() => toggleSection('waterType')}>
        <CollapsibleTrigger className="flex items-center justify-between w-full group">
          <h3 className="text-sm font-semibold">Water Type</h3>
          <ChevronDown className={`h-4 w-4 transition-transform ${openSections.waterType ? 'rotate-180' : ''}`} />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-3">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Checkbox
                id="select-all-types"
                checked={types.length === WATER_TYPES.length}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setTypes(WATER_TYPES)
                  } else {
                    setTypes([])
                  }
                }}
              />
              <Label htmlFor="select-all-types" className="text-sm font-medium cursor-pointer">
                Select All
              </Label>
            </div>
            <Separator />
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
                <Label htmlFor={`type-${type}`} className="text-sm font-normal cursor-pointer">
                  {type}
                </Label>
              </div>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>

      <Separator />

      {/* pH Level Filter */}
      <Collapsible open={openSections.ph} onOpenChange={() => toggleSection('ph')}>
        <CollapsibleTrigger className="flex items-center justify-between w-full group">
          <h3 className="text-sm font-semibold">pH Level</h3>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {phRange[0]} - {phRange[1]}
            </span>
            <ChevronDown className={`h-4 w-4 transition-transform ${openSections.ph ? 'rotate-180' : ''}`} />
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-3">
          <Slider
            value={phRange}
            min={0}
            max={14}
            step={0.1}
            minStepsBetweenThumbs={0.5}
            onValueChange={(value) => setPhRange(value as [number, number])}
            className="mb-6"
          />
        </CollapsibleContent>
      </Collapsible>

      <Separator />

      {/* TDS Filter */}
      <Collapsible open={openSections.tds} onOpenChange={() => toggleSection('tds')}>
        <CollapsibleTrigger className="flex items-center justify-between w-full group">
          <h3 className="text-sm font-semibold">TDS (mg/L)</h3>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {tdsRange[0]} - {tdsRange[1]}
            </span>
            <ChevronDown className={`h-4 w-4 transition-transform ${openSections.tds ? 'rotate-180' : ''}`} />
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-3">
          <Slider
            value={tdsRange}
            min={0}
            max={500}
            step={10}
            minStepsBetweenThumbs={10}
            onValueChange={(value) => setTdsRange(value as [number, number])}
            className="mb-6"
          />
        </CollapsibleContent>
      </Collapsible>

      <Separator />

      {/* Brands Filter */}
      <Collapsible open={openSections.brands} onOpenChange={() => toggleSection('brands')}>
        <CollapsibleTrigger className="flex items-center justify-between w-full group">
          <h3 className="text-sm font-semibold">Brands</h3>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {selectedBrands.length} selected
            </span>
            <ChevronDown className={`h-4 w-4 transition-transform ${openSections.brands ? 'rotate-180' : ''}`} />
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-3">
          <div className="space-y-3 mb-3">
            <div className="flex items-center gap-2">
              <Checkbox
                id="select-all-brands"
                checked={selectedBrands.length === brands.length}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedBrands(brands.map(b => b.id))
                  } else {
                    setSelectedBrands([])
                  }
                }}
              />
              <Label htmlFor="select-all-brands" className="text-sm font-medium cursor-pointer">
                Select All
              </Label>
            </div>
          </div>
          <Separator className="mb-3" />
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
        </CollapsibleContent>
      </Collapsible>

      {/* Action Buttons */}
      <div className="flex flex-col gap-2 pt-4">
        <Button onClick={applyFilters} className="w-full">
          Apply Filters
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-2">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={clearAllFilters} className="flex-1" size="sm">
            Clear All
          </Button>
          <Button variant="outline" onClick={resetFilters} className="flex-1" size="sm">
            Reset
          </Button>
        </div>
      </div>
    </div>
  )

  // Sidebar mode: render filter content inline (for desktop sidebar)
  if (mode === "sidebar") {
    return <>{FilterContent}</>
  }

  // Dialog mode: render a trigger button that opens a dialog (legacy / not used directly)
  return (
    <>
      {/* Active Filter Chips (shown above results) */}
      {activeFilters.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-400 self-center">Active filters:</span>
          {activeFilters.map((filter, index) => (
            <Badge
              key={`${filter.type}-${index}`}
              variant="secondary"
              className="gap-1 pr-1"
            >
              <span className="text-xs">
                <span className="font-semibold">{filter.label}:</span> {filter.value}
              </span>
              {filter.value !== `+${selectedBrands.length - 3} more` && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={filter.onRemove}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </Badge>
          ))}
        </div>
      )}

      {/* Filter Button - Dialog trigger */}
      <div className="mb-4">
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full relative">
              <Filter className="mr-2 h-4 w-4" />
              Filters
              {activeFilterCount > 0 && (
                <Badge variant="default" className="ml-2 h-5 min-w-5 px-1.5">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[95vw] w-full sm:max-w-[600px] max-h-[85vh] p-0">
            <DialogHeader className="px-6 pt-6 pb-4">
              <DialogTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filter Water Sources
              </DialogTitle>
              <DialogDescription>
                Refine your search results by adjusting the filters below
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="h-[calc(85vh-120px)] px-6">
              {FilterContent}
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>
    </>
  )
}
