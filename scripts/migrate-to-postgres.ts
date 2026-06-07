#!/usr/bin/env node
// ==========================================
// Migration Script: PocketBase → PostgreSQL
// ==========================================

import PocketBase from 'pocketbase';
import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';

// Configuration
const POCKETBASE_URL = process.env.POCKETBASE_URL || 'https://pb2.muaz.app';
const PG_CONFIG = {
  host: process.env.DB_HOST || '192.168.1.108',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || 'Muazoreo123',
  database: process.env.DB_NAME || 'postgres',
};

// ID mapping (PocketBase ID → PostgreSQL UUID)
const idMaps = {
  users: new Map<string, string>(),
  brands: new Map<string, string>(),
  manufacturers: new Map<string, string>(),
  sources: new Map<string, string>(),
  images: new Map<string, string>(),
  products: new Map<string, string>(),
};

// Progress tracking
let migratedCount = {
  users: 0,
  brands: 0,
  manufacturers: 0,
  sources: 0,
  images: 0,
  products: 0,
};

async function migrate() {
  console.log('🚀 Starting migration from PocketBase to PostgreSQL\n');
  console.log(`PocketBase: ${POCKETBASE_URL}`);
  console.log(`PostgreSQL: ${PG_CONFIG.host}:${PG_CONFIG.port}/${PG_CONFIG.database}\n`);

  // Connect to databases
  const pb = new PocketBase(POCKETBASE_URL);
  const pg = new Pool(PG_CONFIG);

  try {
    // Test connections
    console.log('Testing connections...');
    await pg.query('SELECT NOW()');
    console.log('✅ PostgreSQL connected\n');

    // Note: PocketBase connection will be tested during data fetch

    // Run migrations in order
    await migrateUsers(pb, pg);
    await migrateBrands(pb, pg);
    await migrateManufacturers(pb, pg);
    await migrateSources(pb, pg);
    await migrateImages(pb, pg);
    await migrateProducts(pb, pg);

    // Summary
    console.log('\n✅ Migration completed successfully!\n');
    console.log('Summary:');
    console.log(`  Users: ${migratedCount.users}`);
    console.log(`  Brands: ${migratedCount.brands}`);
    console.log(`  Manufacturers: ${migratedCount.manufacturers}`);
    console.log(`  Sources: ${migratedCount.sources}`);
    console.log(`  Images: ${migratedCount.images}`);
    console.log(`  Products: ${migratedCount.products}`);

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await pg.end();
  }
}

// Migrate Users
async function migrateUsers(pb: PocketBase, pg: Pool) {
  console.log('📦 Migrating users...');
  
  try {
    const users = await pb.collection('users').getFullList({
      sort: 'created',
    });

    console.log(`  Found ${users.length} users`);

    for (const user of users) {
      // Check if user already exists
      const existing = await pg.query('SELECT id FROM users WHERE email = $1', [user.email]);
      
      if (existing.rows.length > 0) {
        idMaps.users.set(user.id, existing.rows[0].id);
        continue;
      }

      // Insert user
      const result = await pg.query(
        `INSERT INTO users (email, name, image, email_verified, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id`,
        [
          user.email,
          user.name || null,
          user.avatarUrl || null,
          user.verified ? new Date(user.created) : null,
          new Date(user.created),
          new Date(user.updated),
        ]
      );

      idMaps.users.set(user.id, result.rows[0].id);
      migratedCount.users++;
    }

    console.log(`  ✅ Migrated ${migratedCount.users} users\n`);
  } catch (error) {
    console.log('  ⚠️  Skipping users (may require admin auth):', (error as Error).message);
    console.log('  Users can be migrated manually or registered fresh\n');
  }
}

// Migrate Brands
async function migrateBrands(pb: PocketBase, pg: Pool) {
  console.log('📦 Migrating brands...');
  
  const brands = await pb.collection('brands').getFullList({
    sort: 'brand_name',
  });

  console.log(`  Found ${brands.length} brands`);

  for (const brand of brands) {
    // Check if brand already exists by name
    const existing = await pg.query('SELECT id FROM brands WHERE brand_name = $1', [brand.brand_name]);
    
    if (existing.rows.length > 0) {
      idMaps.brands.set(brand.id, existing.rows[0].id);
      continue;
    }

    const result = await pg.query(
      `INSERT INTO brands (brand_name, parent_company, website_url, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [
        brand.brand_name,
        brand.parent_company || null,
        brand.website_url || null,
        new Date(brand.created),
        new Date(brand.updated),
      ]
    );

    idMaps.brands.set(brand.id, result.rows[0].id);
    migratedCount.brands++;
  }

  console.log(`  ✅ Migrated ${migratedCount.brands} brands\n`);
}

// Migrate Manufacturers
async function migrateManufacturers(pb: PocketBase, pg: Pool) {
  console.log('📦 Migrating manufacturers...');
  
  const manufacturers = await pb.collection('manufacturers').getFullList({
    sort: 'name',
  });

  console.log(`  Found ${manufacturers.length} manufacturers`);

  for (const mfg of manufacturers) {
    // Check if manufacturer already exists by name
    const existing = await pg.query('SELECT id FROM manufacturers WHERE name = $1', [mfg.name]);
    
    if (existing.rows.length > 0) {
      idMaps.manufacturers.set(mfg.id, existing.rows[0].id);
      continue;
    }

    const result = await pg.query(
      `INSERT INTO manufacturers (name, address, created_at, updated_at)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      [
        mfg.name,
        mfg.address || null,
        new Date(mfg.created),
        new Date(mfg.updated),
      ]
    );

    idMaps.manufacturers.set(mfg.id, result.rows[0].id);
    migratedCount.manufacturers++;
  }

  console.log(`  ✅ Migrated ${migratedCount.manufacturers} manufacturers\n`);
}

// Migrate Sources
async function migrateSources(pb: PocketBase, pg: Pool) {
  console.log('📦 Migrating sources...');
  
  const sources = await pb.collection('sources').getFullList({
    sort: 'source_name',
  });

  console.log(`  Found ${sources.length} sources`);

  for (const source of sources) {
    // Check if source already exists by name
    const existing = await pg.query('SELECT id FROM sources WHERE source_name = $1', [source.source_name]);
    
    if (existing.rows.length > 0) {
      idMaps.sources.set(source.id, existing.rows[0].id);
      continue;
    }

    const result = await pg.query(
      `INSERT INTO sources (source_name, type, location_address, lat, lng, kkm_approval_number, country, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id`,
      [
        source.source_name || null,
        source.type || null,
        source.location_address || null,
        source.lat || null,
        source.lng || null,
        source.kkm_approval_number || null,
        source.country || 'Malaysia',
        new Date(source.created),
        new Date(source.updated),
      ]
    );

    idMaps.sources.set(source.id, result.rows[0].id);
    migratedCount.sources++;
  }

  console.log(`  ✅ Migrated ${migratedCount.sources} sources\n`);
}

// Migrate Images
async function migrateImages(pb: PocketBase, pg: Pool) {
  console.log('📦 Migrating images...');
  
  const products = await pb.collection('products').getFullList({
    expand: 'images',
  });

  // Create temp directory for downloads
  const tempDir = path.join(process.cwd(), 'temp', 'images');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  let imageCount = 0;

  for (const product of products) {
    if (!product.images || product.images.length === 0) continue;

    for (let i = 0; i < product.images.length; i++) {
      const filename = product.images[i];
      const pbImageId = `${product.id}/${filename}`;

      // Check if already migrated
      if (idMaps.images.has(pbImageId)) continue;

      try {
        // Download image from PocketBase
        const imageUrl = `${POCKETBASE_URL}/api/files/products/${product.id}/${filename}`;
        const response = await fetch(imageUrl);
        
        if (!response.ok) {
          console.log(`    ⚠️  Failed to download image: ${filename}`);
          continue;
        }

        const buffer = Buffer.from(await response.arrayBuffer());
        const mimeType = response.headers.get('content-type') || 'image/jpeg';

        // Insert into PostgreSQL
        const result = await pg.query(
          `INSERT INTO images (filename, mime_type, data, size_bytes)
           VALUES ($1, $2, $3, $4)
           RETURNING id`,
          [filename, mimeType, buffer, buffer.length]
        );

        idMaps.images.set(pbImageId, result.rows[0].id);
        imageCount++;

        if (imageCount % 5 === 0) {
          process.stdout.write(`  ${imageCount} images...\r`);
        }
      } catch (error) {
        console.log(`    ⚠️  Error processing image ${filename}:`, (error as Error).message);
      }
    }
  }

  // Cleanup temp directory
  try {
    fs.rmSync(tempDir, { recursive: true, force: true });
  } catch {
    // Ignore cleanup errors
  }

  migratedCount.images = imageCount;
  console.log(`  ✅ Migrated ${imageCount} images\n`);
}

// Migrate Products
async function migrateProducts(pb: PocketBase, pg: Pool) {
  console.log('📦 Migrating products...');
  
  const products = await pb.collection('products').getFullList({
    expand: 'brand,manufacturer,source',
  });

  console.log(`  Found ${products.length} products`);

  for (const product of products) {
    // Map IDs
    const brandId = product.brand ? idMaps.brands.get(product.brand) : null;
    const manufacturerId = product.manufacturer ? idMaps.manufacturers.get(product.manufacturer) : null;
    const sourceId = product.source ? idMaps.sources.get(product.source) : null;
    const submittedBy = product.submitted_by ? idMaps.users.get(product.submitted_by) : null;

    // Check if product already exists
    const existing = await pg.query(
      'SELECT id FROM products WHERE product_name = $1 AND brand_id = $2',
      [product.product_name, brandId]
    );

    let productId: string;

    if (existing.rows.length > 0) {
      productId = existing.rows[0].id;
    } else {
      // Insert product
      const result = await pg.query(
        `INSERT INTO products (brand_id, manufacturer_id, source_id, submitted_by, product_name, barcode, ph_level, tds, minerals_json, status, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         RETURNING id`,
        [
          brandId,
          manufacturerId,
          sourceId,
          submittedBy,
          product.product_name || null,
          product.barcode || null,
          product.ph_level || null,
          product.tds || null,
          product.minerals_json ? JSON.stringify(product.minerals_json) : null,
          product.status || 'pending',
          new Date(product.created),
          new Date(product.updated),
        ]
      );

      productId = result.rows[0].id;
      migratedCount.products++;
    }

    idMaps.products.set(product.id, productId);

    // Link images to product
    if (product.images && product.images.length > 0) {
      for (let i = 0; i < product.images.length; i++) {
        const filename = product.images[i];
        const pbImageId = `${product.id}/${filename}`;
        const imageId = idMaps.images.get(pbImageId);

        if (imageId) {
          await pg.query(
            `INSERT INTO product_images (product_id, image_id, sort_order)
             VALUES ($1, $2, $3)
             ON CONFLICT (product_id, sort_order) DO NOTHING`,
            [productId, imageId, i]
          );
        }
      }
    }
  }

  console.log(`  ✅ Migrated ${migratedCount.products} products\n`);
}

// Run migration
migrate().catch(console.error);
