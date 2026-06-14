# PocketBase to PostgreSQL Migration Plan

## Overview

The PostgreSQL schema is already prepared for PocketBase migration. This plan covers exporting data from PocketBase and importing it into PostgreSQL.

## Pre-Migration Checklist

- [ ] Backup PocketBase database (`pb_data/data.db`)
- [ ] Ensure PostgreSQL is running and accessible
- [ ] Verify environment variables are configured:
  ```bash
  DB_HOST=localhost
  DB_PORT=5432
  DB_USER=postgres
  DB_PASS=
  DB_NAME=cariair
  ```
- [ ] Run `pnpm run db:schema` to create PostgreSQL tables

## Migration Script

Create `scripts/migrate-pb-to-pg.ts`:

```typescript
#!/usr/bin/env ts-node
/**
 * PocketBase to PostgreSQL Migration Script
 * 
 * Usage:
 *   export PB_URL="http://127.0.0.1:8090"
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
import { toCamelCase } from '../lib/db';

// Initialize PocketBase client
const pb = new PocketBase(process.env.PB_URL || 'http://127.0.0.1:8090');

// Initialize PostgreSQL pool
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'cariair',
});

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
          await client.query(`
            INSERT INTO brands (id, brand_name, parent_company, website_url, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (id) DO UPDATE SET
              brand_name = EXCLUDED.brand_name,
              parent_company = EXCLUDED.parent_company,
              website_url = EXCLUDED.website_url,
              updated_at = EXCLUDED.updated_at
          `, [
            record.id,
            record.brand_name,
            record.parent_company || null,
            record.website_url || null,
            record.created,
            record.updated,
          ]);
          stat.imported++;
        } catch (err) {
          stat.errors.push(`Brand ${record.id}: ${err.message}`);
        }
      }
    } finally {
      client.release();
    }
  } catch (err) {
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
            record.id,
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
        } catch (err) {
          stat.errors.push(`Source ${record.id}: ${err.message}`);
        }
      }
    } finally {
      client.release();
    }
  } catch (err) {
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
          await client.query(`
            INSERT INTO manufacturers (id, name, address, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (id) DO UPDATE SET
              name = EXCLUDED.name,
              address = EXCLUDED.address,
              updated_at = EXCLUDED.updated_at
          `, [
            record.id,
            record.name,
            record.address || null,
            record.created,
            record.updated,
          ]);
          stat.imported++;
        } catch (err) {
          stat.errors.push(`Manufacturer ${record.id}: ${err.message}`);
        }
      }
    } finally {
      client.release();
    }
  } catch (err) {
    stat.errors.push(`Failed to export: ${err.message}`);
  }
  
  stats.push(stat);
  console.log(`   ✅ ${stat.imported}/${stat.exported} manufacturers migrated`);
}

async function migrateProducts() {
  console.log('\n📦 Migrating products...');
  const collection = 'products';
  const stat: MigrationStats = { collection, exported: 0, imported: 0, errors: [] };
  
  try {
    // Fetch in batches to handle large datasets
    const batchSize = 100;
    let page = 1;
    let hasMore = true;
    
    const client = await pool.connect();
    try {
      while (hasMore) {
        const result = await pb.collection(collection).getList(page, batchSize, {
          sort: '-created',
        });
        
        stat.exported += result.items.length;
        
        for (const record of result.items) {
          try {
            // Convert minerals from PB format to JSON
            let mineralsJson = null;
            if (record.minerals) {
              mineralsJson = typeof record.minerals === 'string' 
                ? JSON.parse(record.minerals)
                : record.minerals;
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
              record.id,
              record.brand_id || null,
              record.manufacturer_id || null,
              record.source_id || null,
              record.submitted_by || null,
              record.product_name || null,
              record.barcode || null,
              record.ph_level || null,
              record.tds || null,
              mineralsJson,
              record.status || 'pending',
              record.created,
              record.updated,
            ]);
            stat.imported++;
          } catch (err) {
            stat.errors.push(`Product ${record.id}: ${err.message}`);
          }
        }
        
        hasMore = result.items.length === batchSize;
        page++;
        
        if (page % 10 === 0) {
          console.log(`   ⏳ Processed ${stat.exported} products...`);
        }
      }
    } finally {
      client.release();
    }
  } catch (err) {
    stat.errors.push(`Failed to export: ${err.message}`);
  }
  
  stats.push(stat);
  console.log(`   ✅ ${stat.imported}/${stat.exported} products migrated`);
}

async function migrateImages() {
  console.log('\n📦 Migrating images...');
  const collection = 'images';
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
          // Download image from PB
          const url = pb.files.getUrl(record, record.image);
          const response = await fetch(url);
          const buffer = Buffer.from(await response.arrayBuffer());
          
          await client.query(`
            INSERT INTO images (id, filename, mime_type, data, size_bytes, created_at)
            VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (id) DO UPDATE SET
              filename = EXCLUDED.filename,
              mime_type = EXCLUDED.mime_type,
              data = EXCLUDED.data,
              size_bytes = EXCLUDED.size_bytes
          `, [
            record.id,
            record.image,
            response.headers.get('content-type') || 'image/jpeg',
            buffer,
            buffer.length,
            record.created,
          ]);
          
          // Handle product_images junction if present
          if (record.product_id) {
            await client.query(`
              INSERT INTO product_images (product_id, image_id, sort_order)
              VALUES ($1, $2, $3)
              ON CONFLICT DO NOTHING
            `, [record.product_id, record.id, record.sort_order || 0]);
          }
          
          stat.imported++;
        } catch (err) {
          stat.errors.push(`Image ${record.id}: ${err.message}`);
        }
      }
    } finally {
      client.release();
    }
  } catch (err) {
    stat.errors.push(`Failed to export: ${err.message}`);
  }
  
  stats.push(stat);
  console.log(`   ✅ ${stat.imported}/${stat.exported} images migrated`);
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
          // Skip users without email (shouldn't happen but safety check)
          if (!record.email) {
            stat.errors.push(`User ${record.id}: No email address`);
            continue;
          }
          
          // Note: PocketBase stores passwords with its own hashing
          // Users will need to reset passwords as PB hash won't work with NextAuth
          await client.query(`
            INSERT INTO users (id, email, email_verified, name, image, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            ON CONFLICT (id) DO UPDATE SET
              email = EXCLUDED.email,
              name = EXCLUDED.name,
              image = EXCLUDED.image,
              updated_at = EXCLUDED.updated_at
          `, [
            record.id,
            record.email,
            record.verified ? record.updated : null,
            record.name || null,
            record.avatar || null,
            record.created,
            record.updated,
          ]);
          stat.imported++;
        } catch (err) {
          stat.errors.push(`User ${record.id}: ${err.message}`);
        }
      }
    } finally {
      client.release();
    }
  } catch (err) {
    stat.errors.push(`Failed to export: ${err.message}`);
  }
  
  stats.push(stat);
  console.log(`   ✅ ${stat.imported}/${stat.exported} users migrated`);
  console.log('   ⚠️  Note: Users will need to reset passwords (PB hashing incompatible with NextAuth)');
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
    await migrateImages();
    
    await printSummary();
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
```

## Dependencies

Add to `package.json` devDependencies:

```json
{
  "pocketbase": "^0.25.0"
}
```

## Environment Variables

Create `.env.migration`:

```bash
# PocketBase
PB_URL="http://127.0.0.1:8090"
PB_ADMIN_EMAIL="admin@example.com"
PB_ADMIN_PASSWORD="your-admin-password"

# PostgreSQL (same as your app)
DB_HOST="localhost"
DB_PORT="5432"
DB_USER="postgres"
DB_PASS=""
DB_NAME="cariair"
```

## Migration Steps

### 1. Prepare

```bash
# Install dependencies
pnpm add -D pocketbase

# Create scripts directory
mkdir -p scripts

# Place the migration script
cat > scripts/migrate-pb-to-pg.ts << 'EOF'
# ... migration script content ...
EOF

# Make executable
chmod +x scripts/migrate-pb-to-pg.ts
```

### 2. Setup Target Database

```bash
# Ensure PostgreSQL is running
# Run schema to create tables
pnpm run db:schema
```

### 3. Dry Run (Optional)

```bash
# Export PocketBase data to JSON for inspection
npx pocketbase export --url=$PB_URL --email=$PB_ADMIN_EMAIL --password=$PB_ADMIN_PASSWORD --output=pb_export.json

# Review exported data
jq '.collections[] | {name: .name, count: .data.length}' pb_export.json
```

### 4. Run Migration

```bash
# Load env vars and run
export $(cat .env.migration | xargs)
npx ts-node scripts/migrate-pb-to-pg.ts
```

### 5. Verify Migration

```bash
# Connect to PostgreSQL and verify counts
psql -h $DB_HOST -U $DB_USER -d $DB_NAME -c "
SELECT 'brands' as table, count(*) as count FROM brands
UNION ALL
SELECT 'sources', count(*) FROM sources
UNION ALL
SELECT 'manufacturers', count(*) FROM manufacturers
UNION ALL
SELECT 'products', count(*) FROM products
UNION ALL
SELECT 'images', count(*) FROM images
UNION ALL
SELECT 'users', count(*) FROM users;
"
```

## Post-Migration Tasks

### 1. Update Application

No code changes needed - the app already uses PostgreSQL!

### 2. User Passwords

PocketBase uses bcrypt with different settings than NextAuth. Users must reset passwords:

```bash
# Send password reset emails or prepare notification
# Add banner to login page:
```

```tsx
// app/login/page.tsx - Add migration notice
<div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
  <p className="text-sm text-yellow-800">
    We've migrated our database. If you had an account before, 
    please use &quot;Forgot password&quot; to reset your password.
  </p>
</div>
```

### 3. Image URLs

If images were referenced by PocketBase URL patterns, update:

```typescript
// Before (PocketBase)
const imageUrl = pb.files.getUrl(product, product.image);

// After (PostgreSQL)
const imageUrl = `/api/images/${image.id}`;
```

### 4. Switch Production

1. Deploy application with PostgreSQL
2. Run migration on production
3. Update DNS
4. Monitor error logs

## Rollback Plan

If migration fails:

1. Keep PocketBase running during transition
2. Application can be reverted to use PocketBase by reverting to old code
3. PostgreSQL data can be wiped: `DROP SCHEMA public CASCADE; CREATE SCHEMA public;`
4. Re-run migration after fixes

## Known Limitations

1. **Passwords**: Cannot migrate PB passwords - users must reset
2. **Real-time**: PB had realtime subscriptions - replace with polling/WebSockets if needed
3. **Admin UI**: PB had built-in admin - use pgAdmin or similar for PostgreSQL
4. **File Storage**: Images moved from PB filesystem to PostgreSQL BYTEA - monitor DB size

## Migration Checklist

- [ ] Backup PocketBase `pb_data/` directory
- [ ] Test migration on local/staging first
- [ ] Notify users of potential password reset requirement
- [ ] Schedule downtime (if needed)
- [ ] Run migration
- [ ] Verify data counts
- [ ] Test critical paths (search, auth, images)
- [ ] Monitor error rates
- [ ] Decommission PocketBase after stable period