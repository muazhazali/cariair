// ==========================================
// Brand Database Operations
// ==========================================

import { query } from '@/lib/db';
import { Brand } from '@/lib/types/db';

// Get all brands
export async function getBrands(): Promise<Brand[]> {
  const result = await query<Brand>(
    'SELECT * FROM brands ORDER BY brand_name'
  );
  return result.rows;
}

// Get brand by ID
export async function getBrandById(id: string): Promise<Brand | null> {
  const result = await query<Brand>(
    'SELECT * FROM brands WHERE id = $1',
    [id]
  );
  return result.rows[0] || null;
}

// Create new brand
export async function createBrand(data: Partial<Brand>): Promise<Brand> {
  const columns: string[] = [];
  const values: any[] = [];
  const placeholders: string[] = [];
  let index = 1;

  const fields: (keyof Brand)[] = ['brand_name', 'parent_company', 'website_url'];

  for (const field of fields) {
    if (data[field] !== undefined && data[field] !== null) {
      columns.push(field);
      values.push(data[field]);
      placeholders.push(`$${index}`);
      index++;
    }
  }

  const sql = `
    INSERT INTO brands (${columns.join(', ')})
    VALUES (${placeholders.join(', ')})
    RETURNING *
  `;

  const result = await query<Brand>(sql, values);
  return result.rows[0];
}

// Update brand
export async function updateBrand(
  id: string,
  data: Partial<Brand>
): Promise<Brand | null> {
  const updates: string[] = [];
  const values: any[] = [];
  let index = 1;

  const fields: (keyof Brand)[] = ['brand_name', 'parent_company', 'website_url'];

  for (const field of fields) {
    if (data[field] !== undefined) {
      updates.push(`${field} = $${index}`);
      values.push(data[field]);
      index++;
    }
  }

  if (updates.length === 0) {
    return getBrandById(id);
  }

  values.push(id);
  const sql = `
    UPDATE brands
    SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
    WHERE id = $${index}
    RETURNING *
  `;

  const result = await query<Brand>(sql, values);
  return result.rows[0] || null;
}

// Delete brand
export async function deleteBrand(id: string): Promise<boolean> {
  const result = await query<Brand>(
    'DELETE FROM brands WHERE id = $1 RETURNING id',
    [id]
  );
  return result.rows.length > 0;
}

// Search brands by name
export async function searchBrands(searchQuery: string): Promise<Brand[]> {
  const result = await query<Brand>(
    'SELECT * FROM brands WHERE brand_name ILIKE $1 ORDER BY brand_name',
    [`%${searchQuery}%`]
  );
  return result.rows;
}

// Get brand by exact name
export async function getBrandByName(name: string): Promise<Brand | null> {
  const result = await query<Brand>(
    'SELECT * FROM brands WHERE brand_name = $1',
    [name]
  );
  return result.rows[0] || null;
}
