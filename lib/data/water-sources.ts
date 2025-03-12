import { WaterSource } from "../data-schema"

export const waterSources: Record<string, WaterSource> = {
  "1": {
    id: 1,
    name: "Spritzer Natural Mineral Water",
    company: "Spritzer Bhd",
    country: "Malaysia",
    website: "https://www.spritzer.com.my",
    location: {
      state: "Perak",
      district: "Taiping",
      coordinates: [4.7729, 101.1536],
      watershed: "Tropical rainforest",
    },
    type: "Mineral",
    properties: {
      ph: 7.2,
      tds: 85,
      hardness: "Soft",
      conductivity: 100,
    },
    minerals: {
      calcium: 22.5,
      magnesium: 3.2,
      potassium: 1.1,
      sodium: 4.5,
      bicarbonate: 65.0,
      chloride: 2.8,
      sulfate: 5.3,
      silica: 55.2,
    },
    bottleTypes: [
      {
        size: "250ml",
        material: "PET",
        price: 1.2,
        lastUpdated: "2024-02-15",
      },
      {
        size: "500ml",
        material: "PET",
        price: 1.5,
        lastUpdated: "2024-02-15",
      },
      {
        size: "1.5L",
        material: "PET",
        price: 2.8,
        lastUpdated: "2024-02-15",
      },
      {
        size: "6L",
        material: "PET",
        price: 8.5,
        lastUpdated: "2024-02-10",
      },
    ],
    image: "/images/logos/spritzer-logo.png",
    logo: "/images/logos/spritzer-logo.png",
    lastVerified: "2024-02-15",
    verifiedBy: "muaz",
    description:
      "Spritzer Natural Mineral Water is extracted from deep underground sources in a protected rainforest, rich in minerals and silica.",
    certifications: ["ISO 9001:2000", "QUASI"],
    sourceDepth: 420,
    yearEstablished: 1989,
  },
  "2": {
    id: 2,
    name: "Cactus Natural Mineral Water",
    company: "Cactus Marketing Sdn Bhd",
    country: "Malaysia",
    website: "https://www.cactusmarketing.com.my",
    location: {
      state: "Johor",
      district: "Yong Peng",
      coordinates: [2.0321, 102.033],
      watershed: "Protected natural surroundings",
    },
    type: "Mineral",
    properties: {
      ph: 7.4,
      tds: 112,
      hardness: "Soft",
      conductivity: 120,
    },
    minerals: {
      calcium: 28,
      magnesium: 1.9,
      potassium: 2.2,
      sodium: 7.9,
      bicarbonate: 112,
      chloride: 0.5,
      sulfate: 3.0,
    },
    bottleTypes: [
      {
        size: "250ml",
        material: "PET",
        price: 13.2,
        lastUpdated: "2023-12-15",
      },
      {
        size: "500ml",
        material: "PET",
        price: 19.6,
        lastUpdated: "2023-12-15",
      },
      {
        size: "1.5L",
        material: "PET",
        price: 19.6,
        lastUpdated: "2023-12-15",
      },
      {
        size: "9.5L",
        material: "PET",
        price: 21.1,
        lastUpdated: "2023-12-15",
      },
    ],
    image: "/images/logos/cactus-logo.png",
    logo: "/images/logos/cactus-logo.png",
    lastVerified: "2024-02-15",
    verifiedBy: "muaz",
    description:
      "Cactus Natural Mineral Water is sourced from underground reserves in Yong Peng, providing a refreshing and mineral-rich hydration option.",
    certifications: ["HACCP", "SGS", "ABWA"],
    sourceDepth: 400,
    yearEstablished: 1996,
  },
  "3": {
    id: 3,
    name: "Bleu Natural Mineral Water",
    company: "Etika Beverages Sdn Bhd",
    country: "Malaysia",
    website: "https://www.etikaholdings.com/ETIKA%20html/Brands/Bleu.html",
    location: {
      state: "Selangor",
      district: "Bangi",
      coordinates: [2.9933, 101.7831],
      watershed: "Preserved underground water"
    },
    type: "Mineral",
    properties: {
      ph: 7.34,
      tds: 167,
      hardness: "Soft",
      conductivity: undefined
    },
    minerals: {
      calcium: 28.0,
      magnesium: 2.06,
      potassium: 20.1,
      sodium: 0,
      bicarbonate: 110,
      chloride: 0,
      sulfate: 1.17
    },
    bottleTypes: [
      {
        size: "600ml",
        material: "PET",
        price: 25.00,
        lastUpdated: "2024-01-04"
      }
    ],
    image: "/images/logos/bleu-logo.png",
    logo: "/images/logos/bleu-logo.png",
    lastVerified: "2024-01-04",
    verifiedBy: "muaz",
    description: "Bleu Natural Mineral Water is a premium mineral water sourced from preserved underground water, approved by the Ministry of Health Malaysia.",
    certifications: ["ABWA", "HACCP"],
    sourceDepth: undefined,
    yearEstablished: undefined
  },
  "4": {
    id: 4,
    name: "Desa Natural Mineral Water",
    company: "Desa Mineral Water (M) Sdn. Bhd.",
    country: "Malaysia",
    website: "https://www.desamineral.com.my",
    location: {
      state: "Johor",
      district: "Yong Peng",
      coordinates: [2.0321, 102.0330],
      watershed: "Natural unspoilt surroundings"
    },
    type: "Mineral",
    properties: {
      ph: 7.0,
      tds: 100,
      hardness: "Soft",
      conductivity: undefined
    },
    minerals: {
      calcium: 0,
      magnesium: 0,
      potassium: 0,
      sodium: 0,
      bicarbonate: 0,
      chloride: 0,
      sulfate: 0
    },
    bottleTypes: [
      {
        size: "250ml",
        material: "PET",
        price: 5.90,
        lastUpdated: "2024-02-17"
      },
      {
        size: "500ml",
        material: "PET",
        price: 14.60,
        lastUpdated: "2024-02-17"
      },
      {
        size: "1.5L",
        material: "PET",
        price: 14.60,
        lastUpdated: "2024-02-17"
      },
      {
        size: "9.5L",
        material: "PET",
        price: 19.80,
        lastUpdated: "2024-02-17"
      }
    ],
    image: "/images/logos/desa-logo.png",
    logo: "/images/logos/desa-logo.png",
    lastVerified: "2024-02-17",
    verifiedBy: "muaz",
    description: "Desa Natural Mineral Water is sourced from deep underground, ensuring a rich mineral profile and delivering quality hydration.",
    certifications: ["HACCP"],
    sourceDepth: 400,
    yearEstablished: 1995
  },
  "5": {
    id: 5,
    name: "Darussyifa' Mineral Water",
    company: "Koperasi Darussyifa Berhad",
    country: "Malaysia",
    website: "https://www.darussyifa.org",
    location: {
      state: "Selangor",
      district: "Bangi",
      coordinates: [2.9933, 101.7831],
      watershed: "Natural surroundings"
    },
    type: "Mineral",
    properties: {
      ph: 7.0,
      tds: 100,
      hardness: "Soft",
      conductivity: undefined
    },
    minerals: {
      calcium: 20.0,
      magnesium: 1.5,
      potassium: 3.0,
      sodium: 5.0,
      bicarbonate: 50.0,
      chloride: 0,
      sulfate: 0
    },
    bottleTypes: [
      {
        size: "500ml",
        material: "PET",
        price: 1.50,
        lastUpdated: "2024-02-20"
      },
      {
        size: "1.5L",
        material: "PET",
        price: 3.50,
        lastUpdated: "2024-02-20"
      },
      {
        size: "6L",
        material: "PET",
        price: 10.00,
        lastUpdated: "2024-02-20"
      }
    ],
    image: "/images/logos/darussyifa-logo.png",
    logo: "/images/logos/darussyifa-logo.png",
    lastVerified: "2024-02-20",
    verifiedBy: "muaz",
    description: "Darussyifa' Mineral Water is sourced from natural springs, providing a refreshing and mineral-rich hydration option for health-conscious consumers.",
    certifications: ["HACCP"],
    sourceDepth: undefined,
    yearEstablished: undefined
  }
}; 