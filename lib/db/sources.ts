// ==========================================
// Source Database Operations
// ==========================================

import { query } from '@/lib/db';
import { Source, SourceType } from '@/lib/types/db';

// Get all sources
export async function getSources(): Promise<Source[]> {
  const result = await query(
    'SELECT * FROM sources ORDER BY source_name'
  );
  return result.rows;
}

// Get source by ID
export async function getSourceById(id: string): Promise<Source | null> {
  const result = await query(
    'SELECT * FROM sources WHERE id = $1',
    [id]
  );
  return result.rows[0] || null;
}

// Create new source
export async function createSource(data: Partial<Source>): Promise<Source> {
  const columns: string[] = [];
  const values: any[] = [];
  const placeholders: string[] = [];
  let index = 1;

  const fields: (keyof Source)[] = [
    'source_name', 'type', 'location_address', 'lat', 'lng', 
    'kkm_approval_number', 'country'
  ];

  for (const field of fields) {
    if (data[field] !== undefined && data[field] !== null) {
      columns.push(field);
      values.push(data[field]);
      placeholders.push(`$${index}`);
      index++;
    }
  }

  const sql = `
    INSERT INTO sources (${columns.join(', ')})
    VALUES (${placeholders.join(', ')})
    RETURNING *
  `;

  const result = await query(sql, values);
  return result.rows[0];
}

// Update source
export async function updateSource(
  id: string,
  data: Partial<Source>
): Promise<Source | null> {
  const updates: string[] = [];
  const values: any[] = [];
  let index = 1;

  const fields: (keyof Source)[] = [
    'source_name', 'type', 'location_address', 'lat', 'lng', 
    'kkm_approval_number', 'country'
  ];

  for (const field of fields) {
    if (data[field] !== undefined) {
      updates.push(`${field} = $${index}`);
      values.push(data[field]);
      index++;
    }
  }

  if (updates.length === 0) {
    return getSourceById(id);
  }

  values.push(id);
  const sql = `
    UPDATE sources
    SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
    WHERE id = $${index}
    RETURNING *
  `;

  const result = await query(sql, values);
  return result.rows[0] || null;
}

// Delete source
export async function deleteSource(id: string): Promise<boolean> {
  const result = await query(
    'DELETE FROM sources WHERE id = $1 RETURNING id',
    [id]
  );
  return result.rows.length > 0;
}

// Get sources by type
export async function getSourcesByType(type: SourceType): Promise<Source[]> {
  const result = await query(
    'SELECT * FROM sources WHERE type = $1 ORDER BY source_name',
    [type]
  );
  return result.rows;
}

// Get sources with coordinates (for map)
export async function getSourcesWithCoordinates(): Promise<Source[]> {
  const result = await query(
    'SELECT * FROM sources WHERE lat IS NOT NULL AND lng IS NOT NULL ORDER BY source_name'
  );
  return result.rows;
}

// Get unique source types
export async function getSourceTypes(): Promise<string[]> {
  const result = await query(
    'SELECT DISTINCT type FROM sources WHERE type IS NOT NULL ORDER BY type'
  );
  return result.rows.map(row => row.type);
}
