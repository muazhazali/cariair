export const WATER_TYPE_BADGE_CLASSES: Record<string, string> = {
  Underground: "bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/40 dark:text-indigo-300 dark:border-indigo-800",
  Spring: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-800",
  Municipal: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-800",
  Oxygenated: "bg-cyan-100 text-cyan-700 border-cyan-200 dark:bg-cyan-900/40 dark:text-cyan-300 dark:border-cyan-800",
  Mineral: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800",
  Drinking: "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700",
}

export const WATER_TYPE_DOT_CLASSES: Record<string, string> = {
  Underground: "bg-indigo-500",
  Spring: "bg-emerald-500",
  Municipal: "bg-amber-500",
  Oxygenated: "bg-cyan-500",
  Mineral: "bg-blue-500",
  Drinking: "bg-gray-500",
}

export const WATER_TYPE_LABEL_CLASSES: Record<string, string> = {
  Underground: "text-indigo-600 dark:text-indigo-400",
  Spring: "text-emerald-600 dark:text-emerald-400",
  Municipal: "text-amber-600 dark:text-amber-400",
  Oxygenated: "text-cyan-600 dark:text-cyan-400",
  Mineral: "text-blue-600 dark:text-blue-400",
  Drinking: "text-gray-600 dark:text-gray-400",
}

export function getWaterTypeBadgeClass(type: string | undefined | null): string {
  if (!type) return "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300"

  // Try exact match first
  if (WATER_TYPE_BADGE_CLASSES[type]) {
    return WATER_TYPE_BADGE_CLASSES[type]
  }

  // Try case-insensitive match
  const lowercaseType = type.toLowerCase()
  const match = Object.entries(WATER_TYPE_BADGE_CLASSES).find(
    ([key]) => key.toLowerCase() === lowercaseType
  )

  if (match) {
    return match[1]
  }

  // Fallback
  return "bg-secondary text-secondary-foreground border-border"
}
