// ==========================================
// Product Operations (JSON storage)
// Filters, joins, and pagination performed in-memory.
// Field names are snake_case (matching original Postgres schema).
// ==========================================

import { getAll, insert, update, remove } from "@/lib/json-store";
import {
  Product,
  ProductStatus,
  SearchFilters,
  PaginatedResponse,
  Brand,
  Manufacturer,
  Source,
  ImageView,
} from "@/lib/types/db";
import { getProductImages } from "./images";

function toNum(v: any): number | null {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
}

function matchFilters(p: Product, filters: SearchFilters): boolean {
  // Text search across product_name, barcode, brand name
  if (filters.query) {
    const q = filters.query.toLowerCase();
    const inName = (p.product_name || "").toLowerCase().includes(q);
    const inBarcode = (p.barcode || "").toLowerCase().includes(q);
    const inBrand = (p.brand?.brand_name || "").toLowerCase().includes(q);
    if (!inName && !inBarcode && !inBrand) return false;
  }

  // Source type filter (matches any)
  if (filters.types && filters.types.length > 0) {
    if (!p.source || !p.source.type) return false;
    if (!filters.types.includes(p.source.type)) return false;
  }

  // Excluded source types
  if (filters.excludedTypes && filters.excludedTypes.length > 0) {
    const t = p.source?.type;
    if (!t || filters.excludedTypes.includes(t)) return false;
  }

  // Brand filter (matches any)
  if (filters.brands && filters.brands.length > 0) {
    if (!p.brand_id || !filters.brands.includes(p.brand_id)) return false;
  }

  // Excluded brands
  if (filters.excludedBrands && filters.excludedBrands.length > 0) {
    if (!p.brand_id || filters.excludedBrands.includes(p.brand_id)) return false;
  }

  // pH range
  const ph = toNum(p.ph_level);
  if (filters.minPh !== undefined && filters.minPh > 0) {
    if (ph === null || ph < filters.minPh) return false;
  }
  if (filters.maxPh !== undefined && filters.maxPh < 14) {
    if (ph === null || ph > filters.maxPh) return false;
  }

  // TDS range
  const tds = toNum(p.tds);
  if (filters.minTds !== undefined && filters.minTds > 0) {
    if (tds === null || tds < filters.minTds) return false;
  }
  if (filters.maxTds !== undefined && filters.maxTds < 500) {
    if (tds === null || tds > filters.maxTds) return false;
  }

  return true;
}

// Expand a product's brand/manufacturer/source by joining collections.
async function expandProduct(
  raw: any,
  brands: Brand[],
  manufacturers: Manufacturer[],
  sources: Source[]
): Promise<Product> {
  const product: Product = {
    id: raw.id,
    brand_id: raw.brand_id ?? null,
    manufacturer_id: raw.manufacturer_id ?? null,
    source_id: raw.source_id ?? null,
    submitted_by: raw.submitted_by ?? null,
    product_name: raw.product_name ?? null,
    barcode: raw.barcode ?? null,
    ph_level: toNum(raw.ph_level),
    tds: toNum(raw.tds),
    minerals_json: raw.minerals_json ?? null,
    status: (raw.status as ProductStatus) ?? "pending",
    created_at: raw.created_at,
    updated_at: raw.updated_at,
  };

  if (product.brand_id) {
    const brand = brands.find((b) => b.id === product.brand_id);
    if (brand) product.brand = brand;
  }
  if (product.manufacturer_id) {
    const manufacturer = manufacturers.find(
      (m) => m.id === product.manufacturer_id
    );
    if (manufacturer) product.manufacturer = manufacturer;
  }
  if (product.source_id) {
    const source = sources.find((s) => s.id === product.source_id);
    if (source) {
      product.source = {
        ...source,
        lat: toNum(source.lat),
        lng: toNum(source.lng),
      };
    }
  }

  return product;
}

function attachImageUrls(images: any[]): ImageView[] {
  return images.map((img) => ({
    id: img.id,
    filename: img.filename,
    url: `/api/images/${img.id}`,
  }));
}

// Get all products with optional filters + pagination.
export async function getProducts(
  filters?: SearchFilters,
  options?: { limit?: number; offset?: number }
): Promise<PaginatedResponse<Product>> {
  const limit = options?.limit ?? 50;
  const offset = options?.offset ?? 0;

  const [products, brands, manufacturers, sources, links, images] =
    await Promise.all([
      getAll("products"),
      getAll("brands"),
      getAll("manufacturers"),
      getAll("sources"),
      getAll("productImages"),
      getAll("images"),
    ]);

  // Expand each product (joins)
  const expanded = await Promise.all(
    (products as any[]).map((p) =>
      expandProduct(
        p,
        brands as Brand[],
        manufacturers as Manufacturer[],
        sources as Source[]
      )
    )
  );

  // Default: only approved products
  let filtered = expanded.filter((p) => p.status === "approved");

  // Apply user filters
  if (filters) {
    filtered = filtered.filter((p) => matchFilters(p, filters));
  }

  // Sort by product_name
  filtered.sort((a, b) =>
    (a.product_name || "").localeCompare(b.product_name || "")
  );

  const total = filtered.length;

  // Paginate
  const paged = filtered.slice(offset, offset + limit);

  // Attach images (use cached images/links rather than re-querying per product)
  const linksByProduct = new Map<string, any[]>();
  for (const l of links as any[]) {
    const arr = linksByProduct.get(l.product_id) || [];
    arr.push(l);
    linksByProduct.set(l.product_id, arr);
  }
  const imagesById = new Map<string, any>();
  for (const i of images as any[]) imagesById.set(i.id, i);

  const withImages = paged.map((p) => {
    const productLinks = (linksByProduct.get(p.id) || []).sort(
      (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
    );
    const imgs = productLinks
      .map((l) => imagesById.get(l.image_id))
      .filter(Boolean);
    return { ...p, images: attachImageUrls(imgs) };
  });

  return {
    items: withImages,
    total,
    page: Math.floor(offset / limit) + 1,
    perPage: limit,
  };
}

// Get single product by ID
export async function getProductById(id: string): Promise<Product | null> {
  const [products, brands, manufacturers, sources] = await Promise.all([
    getAll("products"),
    getAll("brands"),
    getAll("manufacturers"),
    getAll("sources"),
  ]);
  const raw = (products as any[]).find((p) => p.id === id);
  if (!raw) return null;

  const product = await expandProduct(
    raw,
    brands as Brand[],
    manufacturers as Manufacturer[],
    sources as Source[]
  );

  const images = await getProductImages(product.id);
  product.images = attachImageUrls(images);

  return product;
}

// Create new product
export async function createProduct(data: Partial<Product>): Promise<Product> {
  const record: Record<string, any> = {};
  if (data.brand_id !== undefined) record.brand_id = data.brand_id;
  if (data.manufacturer_id !== undefined)
    record.manufacturer_id = data.manufacturer_id;
  if (data.source_id !== undefined) record.source_id = data.source_id;
  if (data.submitted_by !== undefined) record.submitted_by = data.submitted_by;
  if (data.product_name !== undefined) record.product_name = data.product_name;
  if (data.barcode !== undefined) record.barcode = data.barcode;
  if (data.ph_level !== undefined) record.ph_level = data.ph_level;
  if (data.tds !== undefined) record.tds = data.tds;
  if (data.minerals_json !== undefined)
    record.minerals_json = data.minerals_json;
  record.status = data.status ?? "pending";
  return insert("products", record);
}

// Update product
export async function updateProduct(
  id: string,
  data: Partial<Product>
): Promise<Product | null> {
  const patch: Record<string, any> = {};
  if (data.brand_id !== undefined) patch.brand_id = data.brand_id;
  if (data.manufacturer_id !== undefined)
    patch.manufacturer_id = data.manufacturer_id;
  if (data.source_id !== undefined) patch.source_id = data.source_id;
  if (data.product_name !== undefined) patch.product_name = data.product_name;
  if (data.barcode !== undefined) patch.barcode = data.barcode;
  if (data.ph_level !== undefined) patch.ph_level = data.ph_level;
  if (data.tds !== undefined) patch.tds = data.tds;
  if (data.minerals_json !== undefined)
    patch.minerals_json = data.minerals_json;
  if (data.status !== undefined) patch.status = data.status;
  return update("products", (p) => p.id === id, patch);
}

// Delete product (also removes its image links)
export async function deleteProduct(id: string): Promise<boolean> {
  const n = await remove("products", (p) => p.id === id);
  if (n > 0) {
    await remove("productImages", (l) => l.product_id === id);
  }
  return n > 0;
}

// Get products by brand
export async function getProductsByBrand(brandId: string): Promise<Product[]> {
  const result = await getProducts(
    { brands: [brandId] },
    { limit: 500, offset: 0 }
  );
  return result.items;
}

// Get products by source
export async function getProductsBySource(
  sourceId: string
): Promise<Product[]> {
  const [products, brands, manufacturers, sources] = await Promise.all([
    getAll("products"),
    getAll("brands"),
    getAll("manufacturers"),
    getAll("sources"),
  ]);
  const rows = (products as any[]).filter(
    (p) => p.source_id === sourceId && p.status === "approved"
  );
  const expanded = await Promise.all(
    rows.map((p) =>
      expandProduct(
        p,
        brands as Brand[],
        manufacturers as Manufacturer[],
        sources as Source[]
      )
    )
  );
  expanded.sort((a, b) =>
    (a.product_name || "").localeCompare(b.product_name || "")
  );
  return expanded;
}