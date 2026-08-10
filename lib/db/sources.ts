// ==========================================
// Source Operations (JSON storage)
// ==========================================

import { getAll, findOne, insert, update, remove } from "@/lib/json-store";
import { Source, SourceType } from "@/lib/types/db";

function toNum(v: any): number | null {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
}

// Normalize lat/lng to numbers (stored as strings from Postgres decimal).
function normalizeSource(s: any): Source {
  return { ...s, lat: toNum(s.lat), lng: toNum(s.lng) };
}

// Get all sources
export async function getSources(): Promise<Source[]> {
  const items = await getAll("sources");
  return items
    .map(normalizeSource)
    .sort((a: Source, b: Source) =>
      (a.source_name || "").localeCompare(b.source_name || "")
    );
}

// Get source by ID
export async function getSourceById(id: string): Promise<Source | null> {
  const s = await findOne("sources", (s) => s.id === id);
  return s ? normalizeSource(s) : null;
}

// Create new source
export async function createSource(data: Partial<Source>): Promise<Source> {
  const record: Record<string, any> = {
    country: data.country ?? "Malaysia",
  };
  if (data.source_name !== undefined) record.source_name = data.source_name;
  if (data.type !== undefined) record.type = data.type;
  if (data.location_address !== undefined)
    record.location_address = data.location_address;
  if (data.lat !== undefined) record.lat = data.lat;
  if (data.lng !== undefined) record.lng = data.lng;
  if (data.kkm_approval_number !== undefined)
    record.kkm_approval_number = data.kkm_approval_number;
  if (data.country !== undefined) record.country = data.country;
  return insert("sources", record);
}

// Update source
export async function updateSource(
  id: string,
  data: Partial<Source>
): Promise<Source | null> {
  const patch: Record<string, any> = {};
  if (data.source_name !== undefined) patch.source_name = data.source_name;
  if (data.type !== undefined) patch.type = data.type;
  if (data.location_address !== undefined)
    patch.location_address = data.location_address;
  if (data.lat !== undefined) patch.lat = data.lat;
  if (data.lng !== undefined) patch.lng = data.lng;
  if (data.kkm_approval_number !== undefined)
    patch.kkm_approval_number = data.kkm_approval_number;
  if (data.country !== undefined) patch.country = data.country;
  return update("sources", (s) => s.id === id, patch);
}

// Delete source
export async function deleteSource(id: string): Promise<boolean> {
  const n = await remove("sources", (s) => s.id === id);
  return n > 0;
}

// Get sources by type
export async function getSourcesByType(type: SourceType): Promise<Source[]> {
  const items = await getAll("sources");
  return items
    .map(normalizeSource)
    .filter((s: Source) => s.type === type)
    .sort((a: Source, b: Source) =>
      (a.source_name || "").localeCompare(b.source_name || "")
    );
}

// Get sources with coordinates (for map)
export async function getSourcesWithCoordinates(): Promise<Source[]> {
  const items = await getAll("sources");
  return items
    .map(normalizeSource)
    .filter((s: Source) => s.lat != null && s.lng != null)
    .sort((a: Source, b: Source) =>
      (a.source_name || "").localeCompare(b.source_name || "")
    );
}

// Get unique source types
export async function getSourceTypes(): Promise<string[]> {
  const items = await getAll("sources");
  const types = new Set<string>();
  for (const s of items as Source[]) {
    if (s.type) types.add(s.type);
  }
  return Array.from(types).sort();
}