// ==========================================
// Manufacturer Database Operations
// ==========================================

import { query } from '@/lib/db';
import { Manufacturer } from '@/lib/types/db';

// Get all manufacturers
export async function getManufacturers(): Promise<Manufacturer[]> {
  const result = await query(
    'SELECT * FROM manufacturers ORDER BY name'
  );
  return result.rows;
}

// Get manufacturer by ID
export async function getManufacturerById(id: string): Promise<Manufacturer | null> {
  const result = await query(
    'SELECT * FROM manufacturers WHERE id = $1',
    [id]
  );
  return result.rows[0] || null;
}

// Create new manufacturer
export async function createManufacturer(data: Partial<Manufacturer>): Promise<Manufacturer> {
  const columns: string[] = [];
  const values: any[] = [];
  const placeholders: string[] = [];
  let index = 1;

  const fields: (keyof Manufacturer)[] = ['name', 'address'];

  for (const field of fields) {
    if (data[field] !== undefined && data[field] !== null) {
      columns.push(field);
      values.push(data[field]);
      placeholders.push(`$${index}`);
      index++;
    }
  }

  const sql = `
    INSERT INTO manufacturers (${columns.join(', ')})
    VALUES (${placeholders.join(', ')})
    RETURNING *
  `;

  const result = await query(sql, values);
  return result.rows[0];
}

// Update manufacturer
export async function updateManufacturer(
  id: string,
  data: Partial<Manufacturer>
): Promise<Manufacturer | null> {
  const updates: string[] = [];
  const values: any[] = [];
  let index = 1;

  const fields: (keyof Manufacturer)[] = ['name', 'address'];

  for (const field of fields) {
    if (data[field] !== undefined) {
      updates.push(`${field} = $${index}`);
      values.push(data[field]);
      index++;
    }
  }

  if (updates.length === 0) {
    return getManufacturerById(id);
  }

  values.push(id);
  const sql = `
    UPDATE manufacturers
    SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
    WHERE id = $${index}
    RETURNING *
  `;

  const result = await query(sql, values);
  return result.rows[0] || null;
}

// Delete manufacturer
export async function deleteManufacturer(id: string): Promise<boolean> {
  const result = await query(
    'DELETE FROM manufacturers WHERE id = $1 RETURNING id',
    [id]
  );
  return result.rows.length > 0;
}

// Search manufacturers by name
export async function searchManufacturers(searchQuery: string): Promise<Manufacturer[]> {
  const result = await query(
    'SELECT * FROM manufacturers WHERE name ILIKE $1 ORDER BY name',
    [`%${searchQuery}%`]
  );
  return result.rows;
}
