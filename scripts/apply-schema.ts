#!/usr/bin/env node
// ==========================================
// Apply PostgreSQL Schema
// ==========================================

import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';

const PG_CONFIG = {
  host: process.env.DB_HOST || '192.168.1.108',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || 'Muazoreo123',
  database: process.env.DB_NAME || 'postgres',
};

async function applySchema() {
  console.log('🚀 Applying PostgreSQL schema...\n');
  console.log(`Connecting to ${PG_CONFIG.host}:${PG_CONFIG.port}/${PG_CONFIG.database}\n`);

  const pg = new Pool(PG_CONFIG);

  try {
    // Test connection
    const testResult = await pg.query('SELECT NOW() as now, version() as version');
    console.log('✅ Connected to PostgreSQL');
    console.log(`   Time: ${testResult.rows[0].now}`);
    console.log(`   Version: ${testResult.rows[0].version.split(' ')[0]}\n`);

    // Read schema file
    const schemaPath = path.join(process.cwd(), 'sql', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');

    console.log('📋 Executing schema...\n');
    
    // Execute schema
    await pg.query(schema);

    console.log('✅ Schema applied successfully!\n');

    // Verify tables were created
    const tablesResult = await pg.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);

    console.log('Tables created:');
    tablesResult.rows.forEach(row => {
      console.log(`  • ${row.table_name}`);
    });

    // Count records in main tables
    console.log('\n📊 Record counts:');
    const counts = await pg.query(`
      SELECT 
        'brands' as table_name, COUNT(*) as count FROM brands
      UNION ALL
      SELECT 
        'sources', COUNT(*) FROM sources
      UNION ALL
      SELECT 
        'manufacturers', COUNT(*) FROM manufacturers
      UNION ALL
      SELECT 
        'products', COUNT(*) FROM products
      UNION ALL
      SELECT 
        'images', COUNT(*) FROM images
      UNION ALL
      SELECT 
        'users', COUNT(*) FROM users
    `);

    counts.rows.forEach(row => {
      console.log(`  ${row.table_name}: ${row.count}`);
    });

    console.log('\n✅ Schema verification complete!');

  } catch (error) {
    console.error('\n❌ Schema application failed:');
    console.error(error);
    process.exit(1);
  } finally {
    await pg.end();
  }
}

applySchema().catch(console.error);
