// Data schema for water source entries

export interface WaterSource {
  // Basic information
  id: number | string
  name: string
  company: string
  country: string
  website?: string

  // Location information
  location: {
    state: string
    district: string
    coordinates: [number, number] // [latitude, longitude]
    watershed?: string
  }

  // Water classification
  type: "Mineral" | "Spring" | "Filtered" | "Purified" | "Artesian" | "Other"

  // Water properties
  properties: {
    ph: number
    tds: number // Total Dissolved Solids in mg/L
    hardness: "Very Soft" | "Soft" | "Slightly Hard" | "Moderately Hard" | "Hard" | "Very Hard"
    conductivity?: number // Electrical conductivity in μS/cm
  }

  // Mineral composition in mg/L
  minerals: {
    calcium: number
    magnesium: number
    potassium: number
    sodium: number
    bicarbonate: number
    chloride: number
    sulfate: number
    nitrate?: number
    silica?: number
    fluoride?: number
    [key: string]: number | undefined // Allow for additional minerals
  }

  // Bottle types and pricing
  bottleTypes: Array<{
    size: string // e.g., "250ml", "500ml", "1L", "1.5L", "6L"
    material: "PET" | "Glass" | "Other"
    price: number // in Malaysian Ringgit (RM)
    lastUpdated: string // ISO date format
    retailers?: string[] // Optional list of retailers where this price was observed
  }>

  // Media
  image: string // URL to bottle image
  logo?: string // URL to brand logo

  // Verification
  lastVerified: string // ISO date format
  verifiedBy: string // GitHub username of the contributor

  // Additional information
  description?: string
  certifications?: string[] // e.g., "HACCP", "ISO 22000", etc.
  sourceDepth?: number // Depth of the water source in meters
  yearEstablished?: number // Year the water source was established
}

// Example of how to use the schema
export const exampleWaterSource: WaterSource = {
  id: 1,
  name: "Spritzer Natural Mineral Water",
  company: "Spritzer Bhd",
  country: "Malaysia",
  website: "https://www.spritzer.com.my",
  location: {
    state: "Perak",
    district: "Taiping",
    coordinates: [4.7729, 101.1536],
    watershed: "Tropical rainforest"
  },
  type: "Mineral",
  properties: {
    ph: 7.2,
    tds: 85,
    hardness: "Soft",
    conductivity: 100
  },
  minerals: {
    calcium: 22.5,
    magnesium: 3.2,
    potassium: 1.1,
    sodium: 4.5,
    bicarbonate: 65.0,
    chloride: 2.8,
    sulfate: 5.3,
    silica: 55.2
  },
  bottleTypes: [
    {
      size: "250ml",
      material: "PET",
      price: 1.2,
      lastUpdated: "2024-02-15"
    },
    {
      size: "500ml",
      material: "PET",
      price: 1.5,
      lastUpdated: "2024-02-15"
    },
    {
      size: "1.5L",
      material: "PET",
      price: 2.8,
      lastUpdated: "2024-02-15"
    },
    {
      size: "6L",
      material: "PET",
      price: 8.5,
      lastUpdated: "2024-02-10"
    }
  ],
  image: "/placeholder.svg?height=500&width=200",
  logo: "/images/logos/spritzer-logo.svg",
  lastVerified: "2024-02-15",
  verifiedBy: "muaz",
  description: "Spritzer Natural Mineral Water is extracted from deep underground sources in a protected rainforest, rich in minerals and silica.",
  certifications: ["ISO 9001:2000", "QUASI"],
  sourceDepth: 420,
  yearEstablished: 1989
}

