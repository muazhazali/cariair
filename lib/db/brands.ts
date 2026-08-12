import { getAll, write } from "@/lib/json-store";
import type { Brand, BrandWithStats, SourceType } from "@/lib/types/db";
import { slugify } from "./products";

export async function getBrands(): Promise<Brand[]> {
  const products = await getAll("products");
  const brands = new Map<string, Brand>();
  for (const product of products) {
    const id = slugify(product.brand);
    if (!brands.has(id)) brands.set(id, {
      id,
      brand_name: product.brand,
      parent_company: product.parent_company,
      website_url: product.website_url,
      created_at: product.created_at,
      updated_at: product.updated_at,
    });
  }
  return [...brands.values()].sort((a, b) => a.brand_name.localeCompare(b.brand_name));
}

export async function getBrandById(id: string): Promise<Brand | null> {
  return (await getBrands()).find((brand) => brand.id === id) ?? null;
}

export async function getBrandByName(name: string): Promise<Brand | null> {
  return (await getBrands()).find((brand) => brand.brand_name === name) ?? null;
}

export async function searchBrands(query: string): Promise<Brand[]> {
  const value = query.toLowerCase();
  return (await getBrands()).filter((brand) => brand.brand_name.toLowerCase().includes(value));
}

export async function createBrand(_data?: Partial<Brand>): Promise<never> {
  throw new Error("Brands are created with their first flat product record");
}

export async function updateBrand(id: string, data: Partial<Brand>): Promise<Brand | null> {
  let changed = false;
  await write((db) => {
    for (const product of db.products) {
      if (slugify(product.brand) !== id) continue;
      if (data.parent_company !== undefined) product.parent_company = data.parent_company;
      if (data.website_url !== undefined) product.website_url = data.website_url;
      product.updated_at = new Date().toISOString();
      changed = true;
    }
  });
  return changed ? getBrandById(id) : null;
}

export async function deleteBrand(_id?: string): Promise<boolean> {
  throw new Error("Delete the brand's product records instead");
}

export async function getBrandsWithStats(): Promise<BrandWithStats[]> {
  const [brands, products] = await Promise.all([getBrands(), getAll("products")]);
  return brands.map((brand) => {
    const matching = products.filter((product) => slugify(product.brand) === brand.id && product.status === "approved");
    const ph = matching.map((product) => product.ph).filter((value): value is number => value !== null);
    const tds = matching.map((product) => product.tds_mg_l).filter((value): value is number => value !== null);
    const sourceTypes = new Set<SourceType>();
    const typeMap: Record<string, SourceType> = { underground: "Underground", spring: "Spring", municipal: "Municipal", oxygenated: "Oxygenated" };
    for (const product of matching) if (product.source_type && typeMap[product.source_type]) sourceTypes.add(typeMap[product.source_type]);
    return {
      ...brand,
      productCount: matching.length,
      avgPh: ph.length ? ph.reduce((sum, value) => sum + value, 0) / ph.length : null,
      avgTds: tds.length ? tds.reduce((sum, value) => sum + value, 0) / tds.length : null,
      waterTypes: [...sourceTypes],
      sourceLocations: [...new Set(matching.map((product) => product.source_address).filter((value): value is string => Boolean(value)))],
      imageUrl: matching[0] ? `/images/products/${matching[0].image}` : null,
      featuredProductId: matching[0]?.id ?? null,
    };
  });
}
