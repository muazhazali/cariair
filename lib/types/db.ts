// ==========================================
// Data Types (JSON storage) — snake_case, matching original Postgres schema
// ==========================================

// Base model interface
export interface BaseModel {
  id: string;
  created_at: string;
  updated_at: string;
}

// Brand model
export interface Brand extends BaseModel {
  brand_name: string;
  parent_company: string | null;
  website_url: string | null;
}

// Manufacturer model
export interface Manufacturer extends BaseModel {
  name: string;
  address: string | null;
}

// Source model
export type SourceType = "Underground" | "Spring" | "Municipal" | "Oxygenated";

export interface Source extends BaseModel {
  source_name: string | null;
  type: SourceType | null;
  location_address: string | null;
  lat: number | null;
  lng: number | null;
  kkm_approval_number: string | null;
  country: string;
}

// Image metadata (file-backed; binary lives in public/images/db/<id>.<ext>)
export interface Image {
  id: string;
  filename: string;
  mime_type: string;
  ext: string;
  size_bytes: number | null;
  created_at: string;
}

// Image view (for API responses)
export interface ImageView {
  id: string;
  filename: string;
  url: string;
}

// Product model
export type ProductStatus = "pending" | "approved" | "rejected";

export interface Product extends BaseModel {
  brand_id: string | null;
  manufacturer_id: string | null;
  source_id: string | null;
  submitted_by: string | null;
  product_name: string | null;
  barcode: string | null;
  ph_level: number | null;
  tds: number | null;
  minerals_json: Record<string, any> | null;
  status: ProductStatus;

  // Expanded fields (joined data)
  brand?: Brand;
  manufacturer?: Manufacturer;
  source?: Source;
  images?: ImageView[];
}

// Product images junction
export interface ProductImage {
  product_id: string;
  image_id: string;
  sort_order: number;
  created_at: string;
}

// Minerals JSON structure
export interface MineralComposition {
  [mineralName: string]: number;
}

// Search filters
export interface SearchFilters {
  query?: string;
  types?: string[];
  excludedTypes?: string[];
  brands?: string[];
  excludedBrands?: string[];
  minPh?: number;
  maxPh?: number;
  minTds?: number;
  maxTds?: number;
}

// Pagination response
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  perPage: number;
}

// Query options
export interface QueryOptions {
  limit?: number;
  offset?: number;
  orderBy?: string;
  order?: "asc" | "desc";
}