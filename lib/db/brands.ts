// ==========================================
// Brand Operations (JSON storage)
// ==========================================

import { getAll, findOne, insert, update, remove } from "@/lib/json-store";
import { Brand, BrandWithStats, SourceType } from "@/lib/types/db";

// Get all brands
export async function getBrands(): Promise<Brand[]> {
  const brands = await getAll("brands");
  return brands.sort((a: Brand, b: Brand) =>
    (a.brand_name || "").localeCompare(b.brand_name || "")
  );
}

// Get brand by ID
export async function getBrandById(id: string): Promise<Brand | null> {
  return findOne("brands", (b) => b.id === id);
}

// Create new brand
export async function createBrand(data: Partial<Brand>): Promise<Brand> {
  const record: Record<string, any> = {};
  if (data.brand_name !== undefined) record.brand_name = data.brand_name;
  if (data.parent_company !== undefined)
    record.parent_company = data.parent_company;
  if (data.website_url !== undefined) record.website_url = data.website_url;
  return insert("brands", record);
}

// Update brand
export async function updateBrand(
  id: string,
  data: Partial<Brand>
): Promise<Brand | null> {
  const patch: Record<string, any> = {};
  if (data.brand_name !== undefined) patch.brand_name = data.brand_name;
  if (data.parent_company !== undefined)
    patch.parent_company = data.parent_company;
  if (data.website_url !== undefined) patch.website_url = data.website_url;
  return update("brands", (b) => b.id === id, patch);
}

// Delete brand
export async function deleteBrand(id: string): Promise<boolean> {
  const n = await remove("brands", (b) => b.id === id);
  return n > 0;
}

// Search brands by name
export async function searchBrands(searchQuery: string): Promise<Brand[]> {
  const brands = await getAll("brands");
  const q = searchQuery.toLowerCase();
  return brands
    .filter((b: Brand) => (b.brand_name || "").toLowerCase().includes(q))
    .sort((a: Brand, b: Brand) =>
      (a.brand_name || "").localeCompare(b.brand_name || "")
    );
}

// Get brand by exact name
export async function getBrandByName(name: string): Promise<Brand | null> {
  return findOne("brands", (b) => b.brand_name === name);
}

function toNum(v: any): number | null {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
}

// Get all brands with aggregate stats across their approved products.
// A single pass over products/sources/images/links keeps this O(n).
export async function getBrandsWithStats(): Promise<BrandWithStats[]> {
  const [brands, products, sources, links, images] = await Promise.all([
    getAll("brands"),
    getAll("products"),
    getAll("sources"),
    getAll("productImages"),
    getAll("images"),
  ]);

  const sourcesById = new Map<string, any>();
  for (const s of sources as any[]) sourcesById.set(s.id, s);

  const linksByProduct = new Map<string, any[]>();
  for (const l of links as any[]) {
    const arr = linksByProduct.get(l.product_id) || [];
    arr.push(l);
    linksByProduct.set(l.product_id, arr);
  }
  const imagesById = new Map<string, any>();
  for (const i of images as any[]) imagesById.set(i.id, i);

  const statsByBrand = new Map<
    string,
    {
      productCount: number;
      phSum: number;
      phCount: number;
      tdsSum: number;
      tdsCount: number;
      waterTypes: Set<SourceType>;
      sourceLocations: Set<string>;
      imageUrl: string | null;
      featuredProductId: string | null;
      firstProductId: string | null;
    }
  >();

  for (const p of products as any[]) {
    if (p.status !== "approved") continue;
    if (!p.brand_id) continue;

    let s = statsByBrand.get(p.brand_id);
    if (!s) {
      s = {
        productCount: 0,
        phSum: 0,
        phCount: 0,
        tdsSum: 0,
        tdsCount: 0,
        waterTypes: new Set<SourceType>(),
        sourceLocations: new Set<string>(),
        imageUrl: null,
        featuredProductId: null,
        firstProductId: null,
      };
      statsByBrand.set(p.brand_id, s);
    }

    s.productCount += 1;
    if (!s.firstProductId) s.firstProductId = p.id;

    const ph = toNum(p.ph_level);
    if (ph !== null) {
      s.phSum += ph;
      s.phCount += 1;
    }
    const tds = toNum(p.tds);
    if (tds !== null) {
      s.tdsSum += tds;
      s.tdsCount += 1;
    }

    if (p.source_id) {
      const src = sourcesById.get(p.source_id);
      if (src) {
        if (src.type) s.waterTypes.add(src.type as SourceType);
        if (src.location_address) s.sourceLocations.add(src.location_address);
      }
    }

    // First product with an image wins as the representative image.
    if (!s.imageUrl) {
      const productLinks = (linksByProduct.get(p.id) || []).sort(
        (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
      );
      for (const l of productLinks) {
        const img = imagesById.get(l.image_id);
        if (img) {
          s.imageUrl = `/api/images/${img.id}`;
          s.featuredProductId = p.id;
          break;
        }
      }
    }
  }

  const result: BrandWithStats[] = (brands as Brand[])
    .map((b) => {
      const s = statsByBrand.get(b.id);
      return {
        ...b,
        productCount: s?.productCount ?? 0,
        avgPh: s && s.phCount > 0 ? s.phSum / s.phCount : null,
        avgTds: s && s.tdsCount > 0 ? s.tdsSum / s.tdsCount : null,
        waterTypes: s ? Array.from(s.waterTypes) : [],
        sourceLocations: s ? Array.from(s.sourceLocations) : [],
        imageUrl: s?.imageUrl ?? null,
        featuredProductId: s?.featuredProductId ?? s?.firstProductId ?? null,
      };
    })
    // Only brands with at least one approved product are shown on the home view.
    .filter((b) => b.productCount > 0)
    .sort((a, b) =>
      (a.brand_name || "").localeCompare(b.brand_name || "")
    );

  return result;
}