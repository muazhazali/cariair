#!/usr/bin/env node
// ==========================================
// Seed PostgreSQL with Initial Data
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

async function seed() {
  console.log('🌱 Seeding PostgreSQL database...\n');

  const pg = new Pool(PG_CONFIG);

  try {
    // Read schema file
    const schemaPath = path.join(process.cwd(), 'sql', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');

    console.log('Creating tables...');
    await pg.query(schema);
    console.log('✅ Tables created\n');

    // Verify counts
    const brands = await pg.query('SELECT COUNT(*) FROM brands');
    const sources = await pg.query('SELECT COUNT(*) FROM sources');

    console.log('Seed data loaded:');
    console.log(`  Brands: ${brands.rows[0].count}`);
    console.log(`  Sources: ${sources.rows[0].count}`);
    console.log('\n✅ Seeding completed!');

  } catch (error) {
    console.error('\n❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await pg.end();
  }
}

seed().catch(console.error);
