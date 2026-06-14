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
    // Migrate brands
    console.log('📦 Migrating brands...');
    const brands = await pb.collection('brands').getFullList();
    console.log(`   Found ${brands.length} brands`);
    for (const r of brands) {
      const uuid = getUUID('brands', r.id);
      await client.query(`INSERT INTO brands (id, brand_name, parent_company, website_url, created_at, updated_at) VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT (id) DO NOTHING`, [uuid, r.brand_name, r.parent_company||null, r.website_url||null, r.created, r.updated]);
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
      await client.query(`INSERT INTO sources (id, source_name, type, location_address, lat, lng, kkm_approval_number, country, created_at, updated_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) ON CONFLICT (id) DO NOTHING`, [uuid, r.source_name, type, r.location_address||null, r.lat||null, r.lng||null, r.kkm_approval_number||null, r.country||'Malaysia', r.created, r.updated]);
    }
    console.log(`   ✅ Migrated ${sources.length} sources`);

    // Migrate manufacturers
    console.log('📦 Migrating manufacturers...');
    const mfrs = await pb.collection('manufacturers').getFullList();
    console.log(`   Found ${mfrs.length} manufacturers`);
    for (const r of mfrs) {
      const uuid = getUUID('manufacturers', r.id);
      await client.query(`INSERT INTO manufacturers (id, name, address, created_at, updated_at) VALUES ($1,$2,$3,$4,$5) ON CONFLICT (id) DO NOTHING`, [uuid, r.name, r.address||null, r.created, r.updated]);
    }
    console.log(`   ✅ Migrated ${mfrs.length} manufacturers`);

    // Migrate users
    console.log('📦 Migrating users...');
    const users = await pb.collection('users').getFullList();
    console.log(`   Found ${users.length} users`);
    for (const r of users) {
      if (!r.email) continue;
      const uuid = getUUID('users', r.id);
      await client.query(`INSERT INTO users (id, email, email_verified, name, image, created_at, updated_at) VALUES ($1,$2,$3,$4,$5,$6,$7) ON CONFLICT (id) DO NOTHING`, [uuid, r.email, r.verified?r.updated:null, r.name||null, r.avatar||null, r.created, r.updated]);
    }
    console.log(`   ✅ Migrated ${users.length} users`);

    // Migrate products
    console.log('📦 Migrating products...');
    const products = await pb.collection('products').getFullList();
    console.log(`   Found ${products.length} products`);
    for (const r of products) {
      const uuid = getUUID('products', r.id);
      const brandId = getUUID('brands', r.brand);
      const mfrId = getUUID('manufacturers', r.manufacturer);
      const sourceId = getUUID('sources', r.source);
      const userId = getUUID('users', r.submitted_by);
      const minerals = r.minerals_json ? (typeof r.minerals_json === 'string' ? JSON.parse(r.minerals_json) : r.minerals_json) : null;
      
      await client.query(`INSERT INTO products (id, brand_id, manufacturer_id, source_id, submitted_by, product_name, barcode, ph_level, tds, minerals_json, status, created_at, updated_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) ON CONFLICT (id) DO NOTHING`, 
        [uuid, brandId, mfrId, sourceId, userId, r.product_name||null, r.barcode||null, r.ph_level||null, r.tds||null, minerals, r.status||'pending', r.created, r.updated]);
    }
    console.log(`   ✅ Migrated ${products.length} products`);

    console.log('\n🎉 Migration complete!');

    // Show counts
    console.log('\n📊 Final counts:');
    const tables = ['brands', 'sources', 'manufacturers', 'users', 'products'];
    for (const t of tables) {
      const result = await client.query(`SELECT COUNT(*) FROM ${t}`);
      console.log(`   ${t}: ${result.rows[0].count}`);
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
