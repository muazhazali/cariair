export const WATER_TYPE_BADGE_CLASSES: Record<string, string> = {
  Underground: "bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-950 dark:text-indigo-300 dark:border-indigo-800",
  Spring:      "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800",
  Municipal:   "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800",
  Oxygenated:  "bg-cyan-100 text-cyan-700 border-cyan-200 dark:bg-cyan-950 dark:text-cyan-300 dark:border-cyan-800",
}

export const WATER_TYPE_DOT_CLASSES: Record<string, string> = {
  Underground: "bg-indigo-500",
  Spring:      "bg-emerald-500",
  Municipal:   "bg-amber-500",
  Oxygenated:  "bg-cyan-500",
}

export const WATER_TYPE_LABEL_CLASSES: Record<string, string> = {
  Underground: "text-indigo-600 dark:text-indigo-400",
  Spring:      "text-emerald-600 dark:text-emerald-400",
  Municipal:   "text-amber-600 dark:text-amber-400",
  Oxygenated:  "text-cyan-600 dark:text-cyan-400",
}

export function getWaterTypeBadgeClass(type: string | undefined | null): string {
  return WATER_TYPE_BADGE_CLASSES[type ?? ""] ?? "bg-secondary text-secondary-foreground border-border"
}
