import PocketBase from 'pocketbase';
import { Pool } from 'pg';
import { randomUUID } from 'crypto';

const pb = new PocketBase('https://pb2.muaz.app');
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'postgres',
  database: 'cariair',
});

const idMap: Map<string, Map<string, string>> = new Map();

function getUUID(collection: string, pbId: string | null | undefined): string | null {
  if (!pbId) return null;
  if (!idMap.has(collection)) idMap.set(collection, new Map());
  const col = idMap.get(collection)!;
  if (!col.has(pbId)) col.set(pbId, randomUUID());
  return col.get(pbId)!;
}

async function migrate() {
  console.log('🔐 Authenticating...');
  await pb.admins.authWithPassword('tikushijo@gmail.com', 'Muazoreo123');
  console.log('✅ Authenticated\n');

  const client = await pool.connect();
  
  try {
    // Clear existing seed data
    console.log('🧹 Clearing seed data...');
    await client.query('DELETE FROM products');
    await client.query('DELETE FROM manufacturers');
    await client.query('DELETE FROM sources');
    await client.query('DELETE FROM brands');
    await client.query("DELETE FROM users WHERE email != 'test@gmail.com'");
    console.log('   ✅ Cleared\n');

    // Migrate brands
    console.log('📦 Migrating brands...');
    const brands = await pb.collection('brands').getFullList();
    console.log(`   Found ${brands.length} brands`);
    for (const r of brands) {
      const uuid = getUUID('brands', r.id);
      await client.query(`INSERT INTO brands (id, brand_name, parent_company, website_url, created_at, updated_at) VALUES ($1,$2,$3,$4,$5,$6)`, [uuid, r.brand_name, r.parent_company||null, r.website_url||null, r.created, r.updated]);
    }
    console.log(`   ✅ Migrated ${brands.length} brands`);

    // Migrate sources
    console.log('📦 Migrating sources...');
    const sources = await pb.collection('sources').getFullList();
    console.log(`   Found ${sources.length} sources`);
    for (const r of sources) {
      const uuid = getUUID('sources', r.id);
      const validTypes = ['Underground', 'Spring', 'Municipal', 'Oxygenated'];
      const type = validTypes.includes(r.type) ? r.type : null;
      await client.query(`INSERT INTO sources (id, source_name, type, location_address, lat, lng, kkm_approval_number, country, created_at, updated_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`, [uuid, r.source_name, type, r.location_address||null, r.lat||null, r.lng||null, r.kkm_approval_number||null, r.country||'Malaysia', r.created, r.updated]);
    }
    console.log(`   ✅ Migrated ${sources.length} sources`);

    // Migrate manufacturers
    console.log('📦 Migrating manufacturers...');
    const mfrs = await pb.collection('manufacturers').getFullList();
    console.log(`   Found ${mfrs.length} manufacturers`);
    for (const r of mfrs) {
      const uuid = getUUID('manufacturers', r.id);
      await client.query(`INSERT INTO manufacturers (id, name, address, created_at, updated_at) VALUES ($1,$2,$3,$4,$5)`, [uuid, r.name, r.address||null, r.created, r.updated]);
    }
    console.log(`   ✅ Migrated ${mfrs.length} manufacturers`);

    // Migrate users (skip duplicates by email)
    console.log('📦 Migrating users...');
    const users = await pb.collection('users').getFullList();
    console.log(`   Found ${users.length} users`);
    let usersMigrated = 0;
    for (const r of users) {
      if (!r.email) continue;
      const existing = await client.query('SELECT id FROM users WHERE email = $1', [r.email]);
      if (existing.rows.length > 0) {
        console.log(`   ⚠️  Skipping user ${r.email} - already exists`);
        continue;
      }
      const uuid = getUUID('users', r.id);
      await client.query(`INSERT INTO users (id, email, email_verified, name, image, created_at, updated_at) VALUES ($1,$2,$3,$4,$5,$6,$7)`, [uuid, r.email, r.verified?r.updated:null, r.name||null, r.avatar||null, r.created, r.updated]);
      usersMigrated++;
    }
    console.log(`   ✅ Migrated ${usersMigrated}/${users.length} users`);

    // Migrate products
    console.log('📦 Migrating products...');
    const products = await pb.collection('products').getFullList();
    console.log(`   Found ${products.length} products`);
    let productsMigrated = 0;
    let productsError = 0;
    for (const r of products) {
      try {
        const uuid = getUUID('products', r.id);
        const brandId = getUUID('brands', r.brand);
        const mfrId = getUUID('manufacturers', r.manufacturer);
        const sourceId = getUUID('sources', r.source);
        const userId = getUUID('users', r.submitted_by);
        
        // Convert minerals array to JSON object
        let mineralsJson: any = null;
        if (r.minerals_json) {
          const minerals = typeof r.minerals_json === 'string' ? JSON.parse(r.minerals_json) : r.minerals_json;
          if (Array.isArray(minerals)) {
            mineralsJson = {};
            for (const m of minerals) {
              if (m.symbol) {
                (mineralsJson as any)[m.symbol] = { name: m.name, amount: m.amount, unit: m.unit };
              }
            }
          } else {
            mineralsJson = minerals;
          }
        }
        
        await client.query(`INSERT INTO products (id, brand_id, manufacturer_id, source_id, submitted_by, product_name, barcode, ph_level, tds, minerals_json, status, created_at, updated_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`, 
          [uuid, brandId, mfrId, sourceId, userId, r.product_name||null, r.barcode||null, r.ph_level||null, r.tds||null, JSON.stringify(mineralsJson), r.status||'pending', r.created, r.updated]);
        productsMigrated++;
      } catch (err: any) {
        console.log(`   ⚠️  Error migrating product ${r.id}: ${err.message}`);
        productsError++;
      }
    }
    console.log(`   ✅ Migrated ${productsMigrated}/${products.length} products (${productsError} errors)`);

    console.log('\n🎉 Migration complete!');

    // Show counts
    console.log('\n📊 Final counts:');
    const tables = ['brands', 'sources', 'manufacturers', 'users', 'products'];
    for (const t of tables) {
      const result = await client.query(`SELECT COUNT(*) FROM ${t}`);
      console.log(`   ${t}: ${result.rows[0].count}`);
    }

    // Sample product
    console.log('\n📋 Sample migrated product:');
    const sample = await client.query('SELECT product_name, brand_id, ph_level, tds FROM products LIMIT 1');
    if (sample.rows.length > 0) {
      console.log(`   ${JSON.stringify(sample.rows[0], null, 2)}`);
    }

  } catch (err: any) {
    console.error('❌ Error:', err.message);
    console.error(err);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
