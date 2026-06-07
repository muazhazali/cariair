// ==========================================
// PostgreSQL Database Types
// Migration from PocketBase
// ==========================================

// Base model interface (similar to PocketBase)
export interface BaseModel {
  id: string;
  created_at: string;
  updated_at: string;
}

// User model (NextAuth.js compatible)
export interface User extends BaseModel {
  email: string;
  email_verified: string | null;
  name: string | null;
  image: string | null;
  password_hash: string | null;
}

// Account model (OAuth linking)
export interface Account {
  id: string;
  user_id: string;
  type: string;
  provider: string;
  provider_account_id: string;
  refresh_token: string | null;
  access_token: string | null;
  expires_at: number | null;
  token_type: string | null;
  scope: string | null;
  id_token: string | null;
  session_state: string | null;
  created_at: string;
  updated_at: string;
}

// Session model
export interface Session {
  id: string;
  user_id: string | null;
  session_token: string;
  expires: string;
  created_at: string;
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
export type SourceType = 'Underground' | 'Spring' | 'Municipal' | 'Oxygenated';

export interface Source extends BaseModel {
  source_name: string | null;
  type: SourceType | null;
  location_address: string | null;
  lat: number | null;
  lng: number | null;
  kkm_approval_number: string | null;
  country: string;
}

// Image model
export interface Image extends BaseModel {
  filename: string;
  mime_type: string;
  data: Buffer;
  size_bytes: number | null;
}

// Product model
export type ProductStatus = 'pending' | 'approved' | 'rejected';

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
  images?: Image[];
}

// Product images junction
export interface ProductImage {
  id: string;
  product_id: string;
  image_id: string;
  sort_order: number;
  created_at: string;
}

// Minerals JSON structure
export interface MineralComposition {
  [mineralName: string]: number;
}

// Search filters (from existing products.ts)
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

// Database query options
export interface QueryOptions {
  limit?: number;
  offset?: number;
  orderBy?: string;
  order?: 'asc' | 'desc';
}
