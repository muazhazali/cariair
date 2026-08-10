// ==========================================
// Brand Operations (JSON storage)
// ==========================================

import { getAll, findOne, insert, update, remove } from "@/lib/json-store";
import { Brand } from "@/lib/types/db";

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