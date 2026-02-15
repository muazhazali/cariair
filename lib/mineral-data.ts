// Mineral data including health benefits and daily recommended intake

export interface MineralInfo {
  name: string
  symbol: string
  healthBenefit: string
  dailyIntake?: number // in mg for adults
  unit: string
  color: string
  icon: string // emoji or icon name
}

export const mineralDatabase: Record<string, MineralInfo> = {
  calcium: {
    name: "Calcium",
    symbol: "Ca",
    healthBenefit: "Essential for bone health, teeth strength, and muscle function",
    dailyIntake: 1000, // mg
    unit: "mg/L",
    color: "#10b981", // green
    icon: "🦴",
  },
  magnesium: {
    name: "Magnesium",
    symbol: "Mg",
    healthBenefit: "Supports energy production, muscle relaxation, and nervous system",
    dailyIntake: 400, // mg
    unit: "mg/L",
    color: "#8b5cf6", // purple
    icon: "⚡",
  },
  potassium: {
    name: "Potassium",
    symbol: "K",
    healthBenefit: "Regulates blood pressure, heart function, and fluid balance",
    dailyIntake: 3500, // mg
    unit: "mg/L",
    color: "#f59e0b", // amber
    icon: "❤️",
  },
  sodium: {
    name: "Sodium",
    symbol: "Na",
    healthBenefit: "Maintains fluid balance and supports nerve function",
    dailyIntake: 2300, // mg (max recommended)
    unit: "mg/L",
    color: "#3b82f6", // blue
    icon: "💧",
  },
  bicarbonate: {
    name: "Bicarbonate",
    symbol: "HCO3",
    healthBenefit: "Helps regulate pH balance and supports digestion",
    dailyIntake: undefined,
    unit: "mg/L",
    color: "#06b6d4", // cyan
    icon: "⚖️",
  },
  chloride: {
    name: "Chloride",
    symbol: "Cl",
    healthBenefit: "Aids digestion and maintains proper fluid balance",
    dailyIntake: 2300, // mg
    unit: "mg/L",
    color: "#14b8a6", // teal
    icon: "🧪",
  },
  sulfate: {
    name: "Sulfate",
    symbol: "SO4",
    healthBenefit: "Supports detoxification and protein synthesis",
    dailyIntake: undefined,
    unit: "mg/L",
    color: "#a855f7", // purple
    icon: "🔬",
  },
  silica: {
    name: "Silica",
    symbol: "Si",
    healthBenefit: "Promotes healthy skin, hair, nails, and joint health",
    dailyIntake: undefined,
    unit: "mg/L",
    color: "#ec4899", // pink
    icon: "💎",
  },
  fluoride: {
    name: "Fluoride",
    symbol: "F",
    healthBenefit: "Strengthens tooth enamel and prevents dental cavities",
    dailyIntake: 4, // mg
    unit: "mg/L",
    color: "#6366f1", // indigo
    icon: "🦷",
  },
  nitrate: {
    name: "Nitrate",
    symbol: "NO3",
    healthBenefit: "Supports cardiovascular health in low amounts",
    dailyIntake: undefined,
    unit: "mg/L",
    color: "#84cc16", // lime
    icon: "🌱",
  },
  iron: {
    name: "Iron",
    symbol: "Fe",
    healthBenefit: "Essential for oxygen transport and energy production",
    dailyIntake: 18, // mg
    unit: "mg/L",
    color: "#dc2626", // red
    icon: "🩸",
  },
  zinc: {
    name: "Zinc",
    symbol: "Zn",
    healthBenefit: "Supports immune function and wound healing",
    dailyIntake: 11, // mg
    unit: "mg/L",
    color: "#78716c", // stone
    icon: "🛡️",
  },
}

// Helper function to get mineral info
export function getMineralInfo(mineralName: string): MineralInfo {
  const key = mineralName.toLowerCase().trim()
  return mineralDatabase[key] || {
    name: mineralName,
    symbol: mineralName.substring(0, 2).toUpperCase(),
    healthBenefit: "Contributes to overall mineral content",
    dailyIntake: undefined,
    unit: "mg/L",
    color: "#6b7280", // gray
    icon: "🔹",
  }
}

// Calculate percentage of daily intake
export function calculateDailyIntakePercentage(
  mineralName: string,
  amount: number, // in mg/L
  dailyConsumption: number = 2 // liters per day
): number | null {
  const info = getMineralInfo(mineralName)
  if (!info.dailyIntake) return null

  const totalIntake = amount * dailyConsumption
  return (totalIntake / info.dailyIntake) * 100
}
