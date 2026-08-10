// ==========================================
// Manufacturer Operations (JSON storage)
// ==========================================

import { getAll, findOne, insert, update, remove } from "@/lib/json-store";
import { Manufacturer } from "@/lib/types/db";

// Get all manufacturers
export async function getManufacturers(): Promise<Manufacturer[]> {
  const items = await getAll("manufacturers");
  return items.sort((a: Manufacturer, b: Manufacturer) =>
    (a.name || "").localeCompare(b.name || "")
  );
}

// Get manufacturer by ID
export async function getManufacturerById(
  id: string
): Promise<Manufacturer | null> {
  return findOne("manufacturers", (m) => m.id === id);
}

// Create new manufacturer
export async function createManufacturer(
  data: Partial<Manufacturer>
): Promise<Manufacturer> {
  const record: Record<string, any> = {};
  if (data.name !== undefined) record.name = data.name;
  if (data.address !== undefined) record.address = data.address;
  return insert("manufacturers", record);
}

// Update manufacturer
export async function updateManufacturer(
  id: string,
  data: Partial<Manufacturer>
): Promise<Manufacturer | null> {
  const patch: Record<string, any> = {};
  if (data.name !== undefined) patch.name = data.name;
  if (data.address !== undefined) patch.address = data.address;
  return update("manufacturers", (m) => m.id === id, patch);
}

// Delete manufacturer
export async function deleteManufacturer(id: string): Promise<boolean> {
  const n = await remove("manufacturers", (m) => m.id === id);
  return n > 0;
}

// Search manufacturers by name
export async function searchManufacturers(
  searchQuery: string
): Promise<Manufacturer[]> {
  const items = await getAll("manufacturers");
  const q = searchQuery.toLowerCase();
  return items
    .filter((m: Manufacturer) => (m.name || "").toLowerCase().includes(q))
    .sort((a: Manufacturer, b: Manufacturer) =>
      (a.name || "").localeCompare(b.name || "")
    );
}