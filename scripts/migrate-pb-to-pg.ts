#!/usr/bin/env ts-node
/**
 * PocketBase to PostgreSQL Migration Script
 *
 * Usage:
 *   export PB_URL="https://pb2.muaz.app"
 *   export PB_ADMIN_EMAIL="admin@example.com"
 *   export PB_ADMIN_PASSWORD="password"
 *   export DB_HOST="localhost"
 *   export DB_NAME="cariair"
 *   export DB_USER="postgres"
 *   export DB_PASS=""
 *   npx ts-node scripts/migrate-pb-to-pg.ts
 */

import PocketBase from 'pocketbase';
import { Pool } from 'pg';
import { randomUUID } from 'crypto';

// Initialize PocketBase client
const pbUrl = process.env.PB_URL || 'https://pb2.muaz.app';
console.log(`📡 Connecting to PocketBase at: ${pbUrl}`);
const pb = new PocketBase(pbUrl);

// Initialize PostgreSQL pool
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'cariair',
});

// ID mapping store (PB short ID -> UUID)
const idMap: Map<string, Map<string, string>> = new Map();

function getOrCreateUUID(collection: string, pbId: string): string {
  if (!idMap.has(collection)) {
    idMap.set(collection, new Map());
  }
  const collectionMap = idMap.get(collection)!;

  if (!collectionMap.has(pbId)) {
    collectionMap.set(pbId, randomUUID());
  }

  return collectionMap.get(pbId)!;
}

function getUUID(collection: string, pbId: string | null | undefined): string | null {
  if (!pbId) return null;
  const collectionMap = idMap.get(collection);
  return collectionMap?.get(pbId) || null;
}

// Migration state tracking
interface MigrationStats {
  collection: string;
  exported: number;
  imported: number;
  errors: string[];
}

const stats: MigrationStats[] = [];

async function authenticatePB() {
  console.log('🔐 Authenticating with PocketBase...');
  await pb.admins.authWithPassword(
    process.env.PB_ADMIN_EMAIL!,
    process.env.PB_ADMIN_PASSWORD!
  );
  console.log('✅ PocketBase authenticated');
}

async function migrateBrands() {
  console.log('\n📦 Migrating brands...');
  const collection = 'brands';
  const stat: MigrationStats = { collection, exported: 0, imported: 0, errors: [] };

  try {
    const records = await pb.collection(collection).getFullList({
      sort: '-created',
    });
    stat.exported = records.length;

    const client = await pool.connect();
    try {
      for (const record of records) {
        try {
          const uuid = getOrCreateUUID('brands', record.id);
          await client.query(`
            INSERT INTO brands (id, brand_name, parent_company, website_url, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (id) DO UPDATE SET
              brand_name = EXCLUDED.brand_name,
              parent_company = EXCLUDED.parent_company,
              website_url = EXCLUDED.website_url,
              updated_at = EXCLUDED.updated_at
          `, [
            uuid,
            record.brand_name,
            record.parent_company || null,
            record.website_url || null,
            record.created,
            record.updated,
          ]);
          stat.imported++;
        } catch (err: any) {
          stat.errors.push(`Brand ${record.id}: ${err.message}`);
        }
      }
    } finally {
      client.release();
    }
  } catch (err: any) {
    stat.errors.push(`Failed to export: ${err.message}`);
  }

  stats.push(stat);
  console.log(`   ✅ ${stat.imported}/${stat.exported} brands migrated`);
}

async function migrateSources() {
  console.log('\n📦 Migrating sources...');
  const collection = 'sources';
  const stat: MigrationStats = { collection, exported: 0, imported: 0, errors: [] };

  try {
    const records = await pb.collection(collection).getFullList({
      sort: '-created',
    });
    stat.exported = records.length;

    const client = await pool.connect();
    try {
      for (const record of records) {
        try {
          const uuid = getOrCreateUUID('sources', record.id);
          // Validate source_type against enum
          const validTypes = ['Underground', 'Spring', 'Municipal', 'Oxygenated'];
          const sourceType = validTypes.includes(record.type) ? record.type : null;

          await client.query(`
            INSERT INTO sources (
              id, source_name, type, location_address, lat, lng,
              kkm_approval_number, country, created_at, updated_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            ON CONFLICT (id) DO UPDATE SET
              source_name = EXCLUDED.source_name,
              type = EXCLUDED.type,
              location_address = EXCLUDED.location_address,
              lat = EXCLUDED.lat,
              lng = EXCLUDED.lng,
              kkm_approval_number = EXCLUDED.kkm_approval_number,
              country = EXCLUDED.country,
              updated_at = EXCLUDED.updated_at
          `, [
            uuid,
            record.source_name,
            sourceType,
            record.location_address || null,
            record.lat || null,
            record.lng || null,
            record.kkm_approval_number || null,
            record.country || 'Malaysia',
            record.created,
            record.updated,
          ]);
          stat.imported++;
        } catch (err: any) {
          stat.errors.push(`Source ${record.id}: ${err.message}`);
        }
      }
    } finally {
      client.release();
    }
  } catch (err: any) {
    stat.errors.push(`Failed to export: ${err.message}`);
  }

  stats.push(stat);
  console.log(`   ✅ ${stat.imported}/${stat.exported} sources migrated`);
}

async function migrateManufacturers() {
  console.log('\n📦 Migrating manufacturers...');
  const collection = 'manufacturers';
  const stat: MigrationStats = { collection, exported: 0, imported: 0, errors: [] };

  try {
    const records = await pb.collection(collection).getFullList({
      sort: '-created',
    });
    stat.exported = records.length;

    const client = await pool.connect();
    try {
      for (const record of records) {
        try {
          const uuid = getOrCreateUUID('manufacturers', record.id);
          await client.query(`
            INSERT INTO manufacturers (id, name, address, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (id) DO UPDATE SET
              name = EXCLUDED.name,
              address = EXCLUDED.address,
              updated_at = EXCLUDED.updated_at
          `, [
            uuid,
            record.name,
            record.address || null,
            record.created,
            record.updated,
          ]);
          stat.imported++;
        } catch (err: any) {
          stat.errors.push(`Manufacturer ${record.id}: ${err.message}`);
        }
      }
    } finally {
      client.release();
    }
  } catch (err: any) {
    stat.errors.push(`Failed to export: ${err.message}`);
  }

  stats.push(stat);
  console.log(`   ✅ ${stat.imported}/${stat.exported} manufacturers migrated`);
}

async function migrateUsers() {
  console.log('\n📦 Migrating users...');
  const collection = 'users';
  const stat: MigrationStats = { collection, exported: 0, imported: 0, errors: [] };

  try {
    const records = await pb.collection(collection).getFullList({
      sort: '-created',
    });
    stat.exported = records.length;

    const client = await pool.connect();
    try {
      for (const record of records) {
        try {
          // Skip users without email
          if (!record.email) {
            stat.errors.push(`User ${record.id}: No email address`);
            continue;
          }

          const uuid = getOrCreateUUID('users', record.id);
          await client.query(`
            INSERT INTO users (id, email, email_verified, name, image, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            ON CONFLICT (id) DO UPDATE SET
              email = EXCLUDED.email,
              name = EXCLUDED.name,
              image = EXCLUDED.image,
              updated_at = EXCLUDED.updated_at
          `, [
            uuid,
            record.email,
            record.verified ? record.updated : null,
            record.name || null,
            record.avatar || null,
            record.created,
            record.updated,
          ]);
          stat.imported++;
        } catch (err: any) {
          stat.errors.push(`User ${record.id}: ${err.message}`);
        }
      }
    } finally {
      client.release();
    }
  } catch (err: any) {
    stat.errors.push(`Failed to export: ${err.message}`);
  }

  stats.push(stat);
  console.log(`   ✅ ${stat.imported}/${stat.exported} users migrated`);
  console.log('   ⚠️  Note: Users will need to reset passwords (PB hashing incompatible with NextAuth)');
}

async function migrateProducts() {
  console.log('\n📦 Migrating products...');
  const collection = 'products';
  const stat: MigrationStats = { collection, exported: 0, imported: 0, errors: [] };

  try {
    const records = await pb.collection(collection).getFullList({
      sort: '-created',
    });
    stat.exported = records.length;

    const client = await pool.connect();
    try {
      for (const record of records) {
        try {
          const uuid = getOrCreateUUID('products', record.id);

          // Map foreign key references to UUIDs (PB uses different field names)
          const brandId = getUUID('brands', record.brand);
          const manufacturerId = getUUID('manufacturers', record.manufacturer);
          const sourceId = getUUID('sources', record.source);
          const submittedBy = getUUID('users', record.submitted_by);

          // Convert minerals from PB format to JSON
          let mineralsJson = null;
          if (record.minerals_json) {
            mineralsJson = typeof record.minerals_json === 'string'
              ? JSON.parse(record.minerals_json)
              : record.minerals_json;
          }

          await client.query(`
            INSERT INTO products (
              id, brand_id, manufacturer_id, source_id, submitted_by,
              product_name, barcode, ph_level, tds, minerals_json,
              status, created_at, updated_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            ON CONFLICT (id) DO UPDATE SET
              brand_id = EXCLUDED.brand_id,
              manufacturer_id = EXCLUDED.manufacturer_id,
              source_id = EXCLUDED.source_id,
              product_name = EXCLUDED.product_name,
              barcode = EXCLUDED.barcode,
              ph_level = EXCLUDED.ph_level,
              tds = EXCLUDED.tds,
              minerals_json = EXCLUDED.minerals_json,
              status = EXCLUDED.status,
              updated_at = EXCLUDED.updated_at
          `, [
            uuid,
            brandId,
            manufacturerId,
            sourceId,
            submittedBy,
            record.product_name || null,
            record.barcode || null,
            record.ph_level || null,
            record.tds || null,
            mineralsJson,
            record.status || 'pending',
            record.created,
            record.updated,
          ]);

          // Store product images info for later processing
          // Images in PB are stored as filenames in the product record
          if (record.images && Array.isArray(record.images) && record.images.length > 0) {
            // Images will need to be downloaded from PB file storage
            // This is a placeholder for image migration
            console.log(`      ℹ️  Product ${record.id} has ${record.images.length} images: ${record.images.join(', ')}`);
          }

          stat.imported++;
        } catch (err: any) {
          stat.errors.push(`Product ${record.id}: ${err.message}`);
        }
      }
    } finally {
      client.release();
    }
  } catch (err: any) {
    stat.errors.push(`Failed to export: ${err.message}`);
  }

  stats.push(stat);
  console.log(`   ✅ ${stat.imported}/${stat.exported} products migrated`);
}

async function migrateImages() {
  console.log('\n📦 Migrating images...');
  const stat: MigrationStats = { collection: 'images', exported: 0, imported: 0, errors: [] };

  // In PB, images are stored as files referenced from products
  // We'll need to download them from PB file storage
  console.log('   ℹ️  Images are stored as files in PB. Manual migration required.');
  console.log('   Images referenced from products will need to be downloaded from:');
  console.log('   https://pb2.muaz.app/api/files/{collection}/{recordId}/{filename}');

  stats.push(stat);
}

async function verifyMigration() {
  console.log('\n🔍 Verifying migration...');

  const client = await pool.connect();
  try {
    // Check row counts
    const tables = ['brands', 'sources', 'manufacturers', 'users', 'products', 'images'];
    console.log('\n📊 Row counts in PostgreSQL:');
    for (const table of tables) {
      const result = await client.query(`SELECT COUNT(*) FROM ${table}`);
      console.log(`   ${table}: ${result.rows[0].count}`);
    }

    // Check for orphaned records
    console.log('\n🔗 Checking referential integrity:');

    const orphanChecks = [
      {
        name: 'Products with invalid brand_id',
        query: `SELECT COUNT(*) FROM products p LEFT JOIN brands b ON p.brand_id = b.id WHERE p.brand_id IS NOT NULL AND b.id IS NULL`
      },
      {
        name: 'Products with invalid source_id',
        query: `SELECT COUNT(*) FROM products p LEFT JOIN sources s ON p.source_id = s.id WHERE p.source_id IS NOT NULL AND s.id IS NULL`
      },
      {
        name: 'Products with invalid manufacturer_id',
        query: `SELECT COUNT(*) FROM products p LEFT JOIN manufacturers m ON p.manufacturer_id = m.id WHERE p.manufacturer_id IS NOT NULL AND m.id IS NULL`
      }
    ];

    for (const check of orphanChecks) {
      const result = await client.query(check.query);
      const count = parseInt(result.rows[0].count);
      if (count > 0) {
        console.log(`   ⚠️  ${check.name}: ${count}`);
      } else {
        console.log(`   ✅ ${check.name}: OK`);
      }
    }

    // Check data quality
    console.log('\n📈 Data quality checks:');
    const qualityChecks = [
      {
        name: 'Products with pH data',
        query: `SELECT COUNT(*) FROM products WHERE ph_level IS NOT NULL`
      },
      {
        name: 'Products with TDS data',
        query: `SELECT COUNT(*) FROM products WHERE tds IS NOT NULL`
      },
      {
        name: 'Products with mineral data',
        query: `SELECT COUNT(*) FROM products WHERE minerals_json IS NOT NULL`
      },
      {
        name: 'Sources with coordinates',
        query: `SELECT COUNT(*) FROM sources WHERE lat IS NOT NULL AND lng IS NOT NULL`
      },
      {
        name: 'Approved products',
        query: `SELECT COUNT(*) FROM products WHERE status = 'approved'`
      }
    ];

    for (const check of qualityChecks) {
      const result = await client.query(check.query);
      console.log(`   ${check.name}: ${result.rows[0].count}`);
    }

    console.log('\n✅ Verification complete');
  } finally {
    client.release();
  }
}

async function printSummary() {
  console.log('\n╔══════════════════════════════════════════════════════════╗');
  console.log('║              MIGRATION SUMMARY                           ║');
  console.log('╠══════════════════════════════════════════════════════════╣');

  let totalExported = 0;
  let totalImported = 0;
  let totalErrors = 0;

  for (const stat of stats) {
    totalExported += stat.exported;
    totalImported += stat.imported;
    totalErrors += stat.errors.length;

    const status = stat.imported === stat.exported ? '✅' : '⚠️';
    console.log(`║ ${status} ${stat.collection.padEnd(15)} ${String(stat.imported).padStart(5)}/${String(stat.exported).padEnd(5)} ${stat.errors.length > 0 ? `(${stat.errors.length} errors)` : ''}`.padEnd(58) + '║');
  }

  console.log('╠══════════════════════════════════════════════════════════╣');
  console.log(`║ Total: ${String(totalImported).padStart(5)}/${String(totalExported).padEnd(5)} records migrated`.padEnd(58) + '║');
  if (totalErrors > 0) {
    console.log(`║ Errors: ${totalErrors} (see details below)`.padEnd(58) + '║');
  }
  console.log('╚══════════════════════════════════════════════════════════╝');

  // Print errors if any
  if (totalErrors > 0) {
    console.log('\n❌ ERRORS:');
    for (const stat of stats) {
      if (stat.errors.length > 0) {
        console.log(`\n${stat.collection}:`);
        stat.errors.slice(0, 10).forEach(err => console.log(`  - ${err}`));
        if (stat.errors.length > 10) {
          console.log(`  ... and ${stat.errors.length - 10} more`);
        }
      }
    }
  }
}

async function main() {
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║      PocketBase → PostgreSQL Migration                    ║');
  console.log('╚══════════════════════════════════════════════════════════╝');

  try {
    await authenticatePB();

    // Migration order matters for foreign key constraints
    await migrateBrands();
    await migrateSources();
    await migrateManufacturers();
    await migrateUsers(); // Before products for submitted_by references
    await migrateProducts();
    await migrateImages(); // Images need manual handling

    await printSummary();
    await verifyMigration();

    console.log('\n🎉 Migration complete!');
    console.log('\n⚠️  IMPORTANT REMINDERS:');
    console.log('   1. Users must reset passwords (PB hash incompatible with NextAuth)');
    console.log('   2. Images need manual migration from PB file storage');
    console.log('   3. Test product search: http://localhost:3000/search');

  } catch (error: any) {
    console.error('\n❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
