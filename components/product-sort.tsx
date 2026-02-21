"use client"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"
import { useTranslations } from "next-intl"

export type SortOption =
  | "name_asc"
  | "name_desc"
  | "ph_asc"
  | "ph_desc"
  | "tds_asc"
  | "tds_desc"

interface ProductSortProps {
  value: SortOption
  onValueChange: (value: SortOption) => void
}

export function ProductSort({ value, onValueChange }: ProductSortProps) {
  const t = useTranslations('sort')
  const sortOptions: { value: SortOption; label: string }[] = [
    { value: "name_asc", label: t('nameAsc') },
    { value: "name_desc", label: t('nameDesc') },
    { value: "ph_asc", label: t('phAsc') },
    { value: "ph_desc", label: t('phDesc') },
    { value: "tds_asc", label: t('tdsAsc') },
    { value: "tds_desc", label: t('tdsDesc') },
  ]

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-[200px]">
        <div className="flex items-center gap-2">
          <ArrowUpDown className="h-4 w-4" />
          <SelectValue placeholder={t('placeholder')} />
        </div>
      </SelectTrigger>
      <SelectContent>
        {sortOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export function sortProducts<T extends { product_name?: string; ph_level?: number; tds?: number }>(
  products: T[],
  sortOption: SortOption
): T[] {
  const sorted = [...products]

  switch (sortOption) {
    case "name_asc":
      return sorted.sort((a, b) => 
        (a.product_name || "").localeCompare(b.product_name || "")
      )
    case "name_desc":
      return sorted.sort((a, b) => 
        (b.product_name || "").localeCompare(a.product_name || "")
      )
    case "ph_asc":
      return sorted.sort((a, b) => {
        const phA = a.ph_level ?? 0
        const phB = b.ph_level ?? 0
        return phA - phB
      })
    case "ph_desc":
      return sorted.sort((a, b) => {
        const phA = a.ph_level ?? 0
        const phB = b.ph_level ?? 0
        return phB - phA
      })
    case "tds_asc":
      return sorted.sort((a, b) => {
        const tdsA = a.tds ?? 0
        const tdsB = b.tds ?? 0
        return tdsA - tdsB
      })
    case "tds_desc":
      return sorted.sort((a, b) => {
        const tdsA = a.tds ?? 0
        const tdsB = b.tds ?? 0
        return tdsB - tdsA
      })
    default:
      return sorted
  }
}
