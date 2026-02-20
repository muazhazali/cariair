import { pb } from "@/lib/pocketbase"
import { Product } from "@/lib/types/pocketbase"

export interface SearchFilters {
  query?: string
  types?: string[]
  excludedTypes?: string[]
  brands?: string[]
  excludedBrands?: string[]
  minPh?: number
  maxPh?: number
  minTds?: number
  maxTds?: number
}

export async function getBrands() {
  try {
    return await pb.collection('brands').getFullList({
      sort: 'brand_name',
      requestKey: null // Disable auto-cancellation
    });
  } catch (error) {
    console.error("Error fetching brands:", error);
    return [];
  }
}

export async function searchWaterSources(filters: SearchFilters): Promise<Product[]> {
  try {
    const filterParts: string[] = [];

    // Text Search
    if (filters.query && filters.query.trim()) {
      filterParts.push(`(product_name ~ "${filters.query}" || barcode ~ "${filters.query}" || brand.brand_name ~ "${filters.query}" || source.location_address ~ "${filters.query}")`);
    }

    // Source Type
    if (filters.excludedTypes && filters.excludedTypes.length > 0) {
      // Exclusion logic (optimized for "select all except few")
      const typeFilters = filters.excludedTypes.map(t => `source.type != "${t}"`).join(" && ");
      filterParts.push(`(${typeFilters})`);
    } else if (filters.types && filters.types.length > 0) {
      // Inclusion logic
      const typeFilters = filters.types.map(t => `source.type = "${t}"`).join(" || ");
      filterParts.push(`(${typeFilters})`);
    }

    // Brands
    if (filters.excludedBrands && filters.excludedBrands.length > 0) {
      // Exclusion logic (optimized for "select all except few")
      const brandFilters = filters.excludedBrands.map(b => `brand != "${b}"`).join(" && ");
      filterParts.push(`(${brandFilters})`);
    } else if (filters.brands && filters.brands.length > 0) {
      // Inclusion logic
      const brandFilters = filters.brands.map(b => `brand = "${b}"`).join(" || ");
      filterParts.push(`(${brandFilters})`);
    }

    // pH - only add if stricter than defaults (0-14)
    if (filters.minPh !== undefined && filters.minPh > 0) filterParts.push(`ph_level >= ${filters.minPh}`);
    if (filters.maxPh !== undefined && filters.maxPh < 14) filterParts.push(`ph_level <= ${filters.maxPh}`);

    // TDS - only add if stricter than defaults (0-500)
    if (filters.minTds !== undefined && filters.minTds > 0) filterParts.push(`tds >= ${filters.minTds}`);
    if (filters.maxTds !== undefined && filters.maxTds < 500) filterParts.push(`tds <= ${filters.maxTds}`);

    const filter = filterParts.length > 0 ? filterParts.join(" && ") : "";

    const result = await pb.collection('products').getList<Product>(1, 50, {
      filter,
      expand: 'brand,source,manufacturer',
      sort: 'product_name', // Sort by name since created field is missing
      requestKey: null // Disable auto-cancellation
    });

    return result.items;
  } catch (error) {
    console.error("Error searching products:", error);
    // Return empty array instead of throwing to prevent build failures
    // The error is logged for debugging purposes
    return [];
  }
}
