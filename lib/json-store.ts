// ==========================================
// JSON File Storage Engine
// Single combined data/db.json with atomic writes.
// ==========================================

import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "db.json");
const TMP_FILE = DB_FILE + ".tmp";

// Shape of the on-disk database.
export interface DatabaseShape {
  brands: any[];
  manufacturers: any[];
  sources: any[];
  products: any[];
  images: any[];
  productImages: any[];
  users: any[];
}

// In-memory cache (loaded once, kept in sync with writes).
let cache: DatabaseShape | null = null;

// Serialize writes so concurrent callers don't clobber each other.
let writeChain: Promise<void> = Promise.resolve();

// ---------- Helpers ----------

export function genId(): string {
  return crypto.randomUUID();
}

export function now(): string {
  return new Date().toISOString();
}

function emptyDb(): DatabaseShape {
  return {
    brands: [],
    manufacturers: [],
    sources: [],
    products: [],
    images: [],
    productImages: [],
    users: [],
  };
}

function deepClone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v));
}

// Load lazily; cache for the process lifetime.
async function load(): Promise<DatabaseShape> {
  if (cache) return cache;
  try {
    const raw = await fs.readFile(DB_FILE, "utf8");
    const parsed = JSON.parse(raw);
    // Merge with defaults so missing keys never crash callers.
    const base = emptyDb();
    cache = { ...base, ...parsed } as DatabaseShape;
  } catch (e) {
    const code = (e as NodeJS.ErrnoException).code;
    if (code === "ENOENT") {
      console.warn("[json-store] No db.json found; initializing empty database.");
      cache = emptyDb();
      await persist(cache);
    } else {
      throw e;
    }
  }
  return cache;
}

// Atomic persist: write tmp then rename. Updates in-memory cache.
async function persist(data: DatabaseShape): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const json = JSON.stringify(data, null, 2);
  await fs.writeFile(TMP_FILE, json, "utf8");
  await fs.rename(TMP_FILE, DB_FILE);
  cache = data;
}

// ---------- Public API ----------

// Read a collection (returns a shallow copy of the array so callers can
// mutate freely without corrupting the cache).
export async function getAll<K extends keyof DatabaseShape>(
  name: K
): Promise<DatabaseShape[K]> {
  const db = await load();
  // arrays of primitives/objects — shallow copy is enough; callers
  // should not mutate nested objects in place.
  return (db[name] as any[]).slice() as DatabaseShape[K];
}

// Find one by predicate.
export async function findOne<K extends keyof DatabaseShape>(
  name: K,
  predicate: (item: any) => boolean
): Promise<any | null> {
  const db = await load();
  const found = (db[name] as any[]).find(predicate);
  return found ? deepClone(found) : null;
}

// Insert a new record (record is assigned id/createdAt/updatedAt unless set).
export async function insert<K extends keyof DatabaseShape>(
  name: K,
  record: Record<string, any>
): Promise<any> {
  return runWrite(async (db) => {
    const row = {
      id: record.id ?? genId(),
      createdAt: record.createdAt ?? now(),
      updatedAt: record.updatedAt ?? now(),
      ...record,
    };
    (db[name] as any[]).push(row);
    return deepClone(row);
  });
}

// Update one matching record with a partial patch.
export async function update<K extends keyof DatabaseShape>(
  name: K,
  predicate: (item: any) => boolean,
  patch: Record<string, any>
): Promise<any | null> {
  return runWrite(async (db) => {
    const arr = db[name] as any[];
    const idx = arr.findIndex(predicate);
    if (idx === -1) return null;
    const updated = {
      ...arr[idx],
      ...patch,
      id: arr[idx].id, // never change id
      createdAt: arr[idx].createdAt, // preserve createdAt
      updatedAt: now(),
    };
    arr[idx] = updated;
    return deepClone(updated);
  });
}

// Delete all matching records. Returns count removed.
export async function remove<K extends keyof DatabaseShape>(
  name: K,
  predicate: (item: any) => boolean
): Promise<number> {
  return runWrite(async (db) => {
    const arr = db[name] as any[];
    const before = arr.length;
    const next = arr.filter((item) => !predicate(item));
    db[name] = next as any;
    return before - next.length;
  });
}

// Atomic update to the whole db (custom callback for multi-table writes).
export async function write<T>(
  fn: (db: DatabaseShape) => Promise<T> | T
): Promise<T> {
  return runWrite(async (db) => fn(db));
}

// Persist the current db snapshot (used by import/migration helpers).
export async function saveAll(data: DatabaseShape): Promise<void> {
  return runWrite(async (db) => {
    Object.assign(db, data);
  }) as unknown as Promise<void>;
}

// ---------- Internal: serialize + persist ----------

async function runWrite<T>(fn: (db: DatabaseShape) => Promise<T> | T): Promise<T> {
  const next = writeChain.then(async () => {
    const db = await load();
    const result = await fn(db);
    await persist(db);
    return result;
  });
  writeChain = next.then(
    () => undefined,
    () => undefined
  );
  return next;
}