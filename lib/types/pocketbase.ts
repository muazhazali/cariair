export interface BaseModel {
  id: string;
  created: string;
  updated: string;
  collectionId: string;
  collectionName: string;
  expand?: { [key: string]: any };
}

export interface Brand extends BaseModel {
  brand_name: string;
  parent_company?: string;
  website_url?: string;
}

export interface Manufacturer extends BaseModel {
  name: string;
  address?: string;
}

export interface Source extends BaseModel {
  source_name?: string;
  type?: "Underground" | "Spring" | "Municipal" | "Oxygenated";
  location_address?: string;
  lat?: number;
  lng?: number;
  kkm_approval_number?: string;
  country?: string;
}

export interface Product extends BaseModel {
  brand?: string; // Relation ID
  manufacturer?: string; // Relation ID
  source?: string; // Relation ID
  product_name?: string;
  barcode?: string;
  ph_level?: number;
  tds?: number;
  images?: string[]; // File names
  minerals_json?: any; // JSON
  status?: "pending" | "approved" | "rejected";
  submitted_by?: string; // Relation ID

  // Expanded fields (optional, populated when using expand)
  expand?: {
    brand?: Brand;
    manufacturer?: Manufacturer;
    source?: Source;
    submitted_by?: any; // User type
  };
}
