#!/usr/bin/env node
// ==========================================
// Verify Migration Results
// ==========================================

import { Pool } from 'pg';

const PG_CONFIG = {
  host: process.env.DB_HOST || '192.168.1.108',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || 'Muazoreo123',
  database: process.env.DB_NAME || 'postgres',
};

async function verify() {
  console.log('🔍 Verifying Migration Results\n');

  const pg = new Pool(PG_CONFIG);

  try {
    // Count records in each table
    console.log('📊 Record Counts:\n');
    
    const tables = [
      { name: 'users', label: 'Users' },
      { name: 'brands', label: 'Brands' },
      { name: 'manufacturers', label: 'Manufacturers' },
      { name: 'sources', label: 'Sources' },
      { name: 'images', label: 'Images' },
      { name: 'products', label: 'Products' },
      { name: 'product_images', label: 'Product-Image Links' },
    ];

    for (const table of tables) {
      const result = await pg.query(`SELECT COUNT(*) FROM ${table.name}`);
      console.log(`  ${table.label.padEnd(25)} ${result.rows[0].count}`);
    }

    // Show sample products
    console.log('\n📦 Sample Products:\n');
    const products = await pg.query(`
      SELECT 
        p.product_name,
        b.brand_name,
        p.ph_level,
        p.tds,
        p.status
      FROM products p
      LEFT JOIN brands b ON p.brand_id = b.id
      LIMIT 5
    `);

    products.rows.forEach((p, i) => {
      console.log(`  ${i + 1}. ${p.brand_name} - ${p.product_name}`);
      console.log(`     pH: ${p.ph_level}, TDS: ${p.tds}, Status: ${p.status}`);
    });

    // Show images
    console.log('\n🖼️  Images:\n');
    const images = await pg.query(`
      SELECT filename, mime_type, size_bytes
      FROM images
      LIMIT 5
    `);

    images.rows.forEach((img, i) => {
      console.log(`  ${i + 1}. ${img.filename} (${img.mime_type}, ${(img.size_bytes / 1024).toFixed(1)} KB)`);
    });

    // Test image serving
    console.log('\n✅ Test Image URLs:\n');
    const imageIds = await pg.query('SELECT id FROM images LIMIT 3');
    imageIds.rows.forEach((row, i) => {
      console.log(`  ${i + 1}. http://localhost:3000/api/images/${row.id}`);
    });

    console.log('\n✅ Migration verification complete!');

  } catch (error) {
    console.error('\n❌ Verification failed:', error);
    process.exit(1);
  } finally {
    await pg.end();
  }
}

verify().catch(console.error);
