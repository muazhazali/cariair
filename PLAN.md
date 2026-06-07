# Migration Plan: PocketBase → PostgreSQL

## Overview

This document outlines the complete migration strategy from PocketBase to PostgreSQL for the CariAir project.

**Migration Date:** June 2026  
**Target Database:** PostgreSQL (192.168.1.108:5432)  
**Auth Strategy:** NextAuth.js v5 (Auth.js) with Google OAuth  
**API Pattern:** REST API Routes  
**Image Storage:** PostgreSQL BYTEA (binary data)

---

## Table of Contents

1. [Current State Analysis](#current-state-analysis)
2. [Architecture Overview](#architecture-overview)
3. [Database Schema](#database-schema)
4. [File Structure Changes](#file-structure-changes)
5. [Dependencies](#dependencies)
6. [Environment Variables](#environment-variables)
7. [API Mapping](#api-mapping)
8. [Component Migration Map](#component-migration-map)
9. [Migration Script](#migration-script)
10. [Execution Phases](#execution-phases)
11. [Testing Checklist](#testing-checklist)
12. [Rollback Plan](#rollback-plan)

---

## Current State Analysis

### PocketBase Usage

| Collection | Purpose | Records |
|------------|---------|---------|
| `products` | Water products with mineral data | ~15 |
| `brands` | Water brands (Spritzer, Cactus, etc.) | ~14 |
| `manufacturers` | Manufacturing companies | ~10 |
| `sources` | Water source locations | ~13 |
| `users` | User accounts with auth | Variable |

### Current Auth Flow

- Email/password authentication
- Google OAuth via `pb.collection('users').authWithOAuth2()`
- Session stored in `pb.authStore`

### Image Storage

- Product images stored in PocketBase file storage
- Accessed via `getImageUrl(record, filename)` helper
- ~15 product images to migrate

### Code References

- **50+ imports** of `@/lib/pocketbase`
- **15 files** require updates
- Data access pattern: `pb.collection('name').getList/getFullList/create()`

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Next.js Application                        │
├─────────────────────────────────────────────────────────────┤
│  ┌───────────┐  ┌───────────┐  ┌───────────┐               │
│  │   Pages   │  │Components │  │   API     │               │
│  │ /login    │  │ProductCard│  │/api/...   │               │
│  │ /register │  │WaterMap   │  │           │               │
│  └─────┬─────┘  └─────┬─────┘  └─────┬─────┘               │
│        │              │              │                        │
│        └──────────────┴──────────────┘                      │
│                       │                                      │
│              ┌────────▼────────┐                            │
│              │  REST API Layer │                            │
│              │  (/api/*)       │                            │
│              └────────┬────────┘                            │
│                       │                                      │
│        ┌──────────────┼──────────────┐                     │
│        │              │              │                       │
│   ┌────▼─────┐  ┌────▼─────┐  ┌────▼─────┐                 │
│   │/products │  │  /auth   │  │/migrate   │                 │
│   │ /brands  │  │/session  │  │  /images  │                 │
│   │ /sources │  │          │  │          │                 │
│   └────┬─────┘  └────┬─────┘  └────┬─────┘                 │
│        │              │              │                       │
│        └──────────────┴──────────────┘                      │
│                       │                                      │
│              ┌────────▼────────┐                            │
│              │  Database Layer │                            │
│              │  lib/db/*.ts    │                            │
│              └────────┬────────┘                            │
│                       │                                      │
│              ┌────────▼────────┐                            │
│              │    PostgreSQL   │                             │
│              │  (192.168.1.108)│                             │
│              │                 │                             │
│              │ ┌─────────────┐ │                             │
│              │ │products     │ │                             │
│              │ │brands       │ │                             │
│              │ │users        │ │                             │
│              │ │images (bytea)│ │                             │
│              │ └─────────────┘ │                             │
│              └─────────────────┘                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Database Schema

### Extensions Required

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
```

### Tables

#### 1. Users (NextAuth.js Compatible)

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    email_verified TIMESTAMP,
    name VARCHAR(255),
    image TEXT, -- avatar URL or base64
    password_hash VARCHAR(255), -- for credentials provider
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 2. Accounts (OAuth Linking)

```sql
CREATE TABLE accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(255) NOT NULL, -- 'oauth' | 'credentials'
    provider VARCHAR(255) NOT NULL, -- 'google' | 'credentials'
    provider_account_id VARCHAR(255) NOT NULL,
    refresh_token TEXT,
    access_token TEXT,
    expires_at INTEGER,
    token_type VARCHAR(255),
    scope VARCHAR(255),
    id_token TEXT,
    session_state VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(provider, provider_account_id)
);
```

#### 3. Sessions

```sql
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    expires TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### 4. Verification Tokens

```sql
CREATE TABLE verification_tokens (
    identifier VARCHAR(255) NOT NULL,
    token VARCHAR(255) NOT NULL,
    expires TIMESTAMP NOT NULL,
    PRIMARY KEY (identifier, token)
);
```

#### 5. Brands

```sql
CREATE TABLE brands (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brand_name VARCHAR(100) NOT NULL,
    parent_company VARCHAR(100),
    website_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 6. Manufacturers

```sql
CREATE TABLE manufacturers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(150) NOT NULL,
    address TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 7. Sources

```sql
CREATE TABLE sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_name VARCHAR(100),
    type VARCHAR(50) CHECK (type IN ('Underground', 'Spring', 'Municipal', 'Oxygenated')),
    location_address TEXT,
    lat DECIMAL(10, 8),
    lng DECIMAL(11, 8),
    kkm_approval_number VARCHAR(50),
    country VARCHAR(100) DEFAULT 'Malaysia',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 8. Images (BYTEA Storage)

```sql
CREATE TABLE images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    filename VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    data BYTEA NOT NULL,
    size_bytes INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### 9. Products

```sql
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brand_id UUID REFERENCES brands(id),
    manufacturer_id UUID REFERENCES manufacturers(id),
    source_id UUID REFERENCES sources(id),
    submitted_by UUID REFERENCES users(id),
    product_name VARCHAR(150),
    barcode VARCHAR(50),
    ph_level DECIMAL(4, 2),
    tds DECIMAL(6, 2),
    minerals_json JSONB,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 10. Product Images (Junction)

```sql
CREATE TABLE product_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    image_id UUID NOT NULL REFERENCES images(id) ON DELETE CASCADE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(product_id, sort_order)
);
```

### Indexes

```sql
CREATE INDEX idx_products_brand ON products(brand_id);
CREATE INDEX idx_products_source ON products(source_id);
CREATE INDEX idx_products_manufacturer ON products(manufacturer_id);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_submitted_by ON products(submitted_by);
CREATE INDEX idx_accounts_user ON accounts(user_id);
CREATE INDEX idx_sessions_token ON sessions(session_token);
CREATE INDEX idx_sessions_user ON sessions(user_id);
```

---

## File Structure Changes

### New Files

```
lib/
├── db.ts                    # PostgreSQL connection pool
├── auth.ts                  # NextAuth.js configuration
├── types/
│   └── db.ts               # PostgreSQL types
└── db/
    ├── index.ts            # Re-export all db functions
    ├── products.ts         # Product CRUD operations
    ├── brands.ts           # Brand CRUD operations
    ├── sources.ts          # Source CRUD operations
    ├── manufacturers.ts    # Manufacturer CRUD operations
    ├── users.ts            # User CRUD operations
    └── images.ts           # Image storage/retrieval

app/
├── api/
│   ├── auth/[...nextauth]/route.ts  # NextAuth.js handler
│   ├── products/route.ts            # GET /api/products
│   ├── products/[id]/route.ts       # GET /api/products/:id
│   ├── brands/route.ts              # GET /api/brands
│   ├── sources/route.ts             # GET /api/sources
│   ├── images/[id]/route.ts         # GET /api/images/:id
│   └── migrate/
│       └── route.ts                 # POST /api/migrate

scripts/
└── migrate-to-postgres.ts  # Migration script

types/
└── next-auth.d.ts          # NextAuth.js type extensions

sql/
└── schema.sql              # Complete database schema
```

### Modified Files

- `app/login/page.tsx` - Replace PocketBase auth with NextAuth.js
- `app/register/page.tsx` - Replace PocketBase user creation
- `app/contribute/page.tsx` - Replace PocketBase data creation
- `app/page.tsx` - Replace PocketBase data fetching
- `app/sources/[id]/page.tsx` - Replace PocketBase data fetching
- `components/water-sources-display.tsx` - Replace data fetching
- `components/water-source-map.tsx` - Replace data fetching
- `components/product-card.tsx` - Update image URLs
- `components/product-comparison.tsx` - Update image URLs
- `components/mobile-comparison-carousel.tsx` - Update image URLs
- `lib/products.ts` - Rewrite for PostgreSQL

### Deleted Files

- `lib/pocketbase.ts` - PocketBase client
- `lib/types/pocketbase.ts` - PocketBase types

---

## Dependencies

### Add to `package.json`

```json
{
  "dependencies": {
    "pg": "^8.11.3",
    "next-auth": "^5.0.0-beta.15",
    "@auth/pg-adapter": "^1.0.0",
    "bcryptjs": "^2.4.3",
    "uuid": "^9.0.1"
  },
  "devDependencies": {
    "@types/pg": "^8.10.9",
    "@types/bcryptjs": "^2.4.6",
    "@types/uuid": "^9.0.7"
  }
}
```

### Remove from `package.json`

```json
{
  "dependencies": {
    "pocketbase": "^0.26.8"
  }
}
```

---

## Environment Variables

### `.env` Additions

```bash
# PostgreSQL (existing)
DB_HOST=192.168.1.108
DB_PORT=5432
DB_USER=postgres
DB_PASS=Muazoreo123
DB_NAME=postgres

# NextAuth.js
AUTH_SECRET=your-random-secret-key-here
AUTH_GOOGLE_ID=your-google-client-id
AUTH_GOOGLE_SECRET=your-google-client-secret
AUTH_TRUST_HOST=true  # For development

# Database Connection String
DATABASE_URL=postgresql://postgres:Muazoreo123@192.168.1.108:5432/postgres

# Migration Script (temporary)
POCKETBASE_URL=https://pb2.muaz.app
POCKETBASE_ADMIN_EMAIL=admin@example.com
POCKETBASE_ADMIN_PASSWORD=admin-password
```

---

## API Mapping

| Operation | PocketBase | New REST API | Method |
|-----------|-----------|--------------|---------|
| **Auth** |||
| Login | `pb.authWithPassword()` | `/api/auth/callback/credentials` | POST |
| OAuth Login | `pb.authWithOAuth2()` | `/api/auth/signin/google` | GET/POST |
| Logout | `pb.authStore.clear()` | `/api/auth/signout` | POST |
| Get Session | `pb.authStore.model` | `/api/auth/session` | GET |
| Register | `pb.collection('users').create()` | `/api/auth/register` | POST |
| **Products** |||
| List Products | `pb.collection('products').getList()` | `/api/products` | GET |
| Get Product | `pb.collection('products').getOne()` | `/api/products/[id]` | GET |
| Create Product | `pb.collection('products').create()` | `/api/products` | POST |
| **Brands** |||
| List Brands | `pb.collection('brands').getFullList()` | `/api/brands` | GET |
| Create Brand | `pb.collection('brands').create()` | `/api/brands` | POST |
| **Sources** |||
| List Sources | `pb.collection('sources').getFullList()` | `/api/sources` | GET |
| **Images** |||
| Get Image | `getImageUrl(record, filename)` | `/api/images/[id]` | GET |

---

## Component Migration Map

| File | Current | New | Priority |
|------|---------|-----|----------|
| `lib/pocketbase.ts` | PocketBase client | Remove | P0 |
| `lib/types/pocketbase.ts` | PocketBase types | Remove | P0 |
| `lib/products.ts` | PocketBase queries | PostgreSQL functions | P0 |
| `lib/auth.ts` | N/A | NextAuth.js config | P0 |
| `app/login/page.tsx` | `pb.authWithPassword()` | `signIn('credentials')` | P0 |
| `app/register/page.tsx` | `pb.collection('users').create()` | Custom API call | P0 |
| `app/page.tsx` | `pb.collection().getList()` | `fetch('/api/products')` | P0 |
| `app/sources/[id]/page.tsx` | Direct PocketBase | `fetch('/api/products/[id]')` | P0 |
| `app/contribute/page.tsx` | `pb.collection().create()` | `fetch()` to REST API | P0 |
| `components/water-sources-display.tsx` | `pb.collection().getList()` | `fetch('/api/products')` | P0 |
| `components/water-source-map.tsx` | `pb.collection().getList()` | `fetch('/api/products')` | P0 |
| `components/product-card.tsx` | `getImageUrl()` | `/api/images/[id]` | P0 |
| `components/product-comparison.tsx` | `getImageUrl()` | `/api/images/[id]` | P0 |
| `components/mobile-comparison-carousel.tsx` | `getImageUrl()` | `/api/images/[id]` | P0 |

---

## Migration Script

### Overview

The migration script (`scripts/migrate-to-postgres.ts`) will:

1. Connect to PocketBase
2. Export all data from collections
3. Transform IDs from PocketBase format to UUID
4. Download all images from PocketBase
5. Insert data into PostgreSQL with proper relations
6. Store images as BYTEA
7. Verify data integrity

### Migration Flow

```typescript
async function migrate() {
  // 1. Connect to PocketBase
  const pb = new PocketBase(process.env.POCKETBASE_URL);
  await pb.admins.authWithPassword(
    process.env.POCKETBASE_ADMIN_EMAIL,
    process.env.POCKETBASE_ADMIN_PASSWORD
  );

  // 2. Connect to PostgreSQL
  const pg = new Pool({ /* connection config */ });

  // 3. Migrate Users
  const users = await pb.collection('users').getFullList();
  await migrateUsers(pg, users);

  // 4. Migrate Brands
  const brands = await pb.collection('brands').getFullList();
  const brandIdMap = await migrateBrands(pg, brands);

  // 5. Migrate Manufacturers
  const manufacturers = await pb.collection('manufacturers').getFullList();
  const manufacturerIdMap = await migrateManufacturers(pg, manufacturers);

  // 6. Migrate Sources
  const sources = await pb.collection('sources').getFullList();
  const sourceIdMap = await migrateSources(pg, sources);

  // 7. Migrate Images (download from PB, store as BYTEA)
  const images = await pb.collection('products').getFullList();
  const imageIdMap = await migrateImages(pg, pb, images);

  // 8. Migrate Products
  const products = await pb.collection('products').getFullList();
  await migrateProducts(pg, products, brandIdMap, manufacturerIdMap, sourceIdMap, imageIdMap);

  // 9. Verify
  await verifyMigration(pg);
}
```

---

## Execution Phases

### Phase 1: Database Setup (30 min)

- [ ] Execute SQL schema
- [ ] Verify tables created
- [ ] Test connection from Node.js

### Phase 2: Dependencies & Config (30 min)

- [ ] Install new dependencies
- [ ] Configure NextAuth.js
- [ ] Set up environment variables
- [ ] Create PostgreSQL connection pool

### Phase 3: Database Layer (2 hours)

- [ ] Create `lib/db.ts` connection
- [ ] Create `lib/db/products.ts`
- [ ] Create `lib/db/brands.ts`
- [ ] Create `lib/db/sources.ts`
- [ ] Create `lib/db/manufacturers.ts`
- [ ] Create `lib/db/users.ts`
- [ ] Create `lib/db/images.ts`

### Phase 4: REST API Routes (2 hours)

- [ ] Create `/api/auth/[...nextauth]/route.ts`
- [ ] Create `/api/products/route.ts`
- [ ] Create `/api/products/[id]/route.ts`
- [ ] Create `/api/brands/route.ts`
- [ ] Create `/api/sources/route.ts`
- [ ] Create `/api/images/[id]/route.ts`
- [ ] Create `/api/migrate/route.ts`

### Phase 5: Migration Script (1.5 hours)

- [ ] Create `scripts/migrate-to-postgres.ts`
- [ ] Test migration on local data
- [ ] Verify image migration (BYTEA)
- [ ] Verify relations maintained

### Phase 6: Component Updates (2 hours)

- [ ] Update `app/login/page.tsx`
- [ ] Update `app/register/page.tsx`
- [ ] Update `app/contribute/page.tsx`
- [ ] Update `app/page.tsx`
- [ ] Update `app/sources/[id]/page.tsx`
- [ ] Update `components/water-sources-display.tsx`
- [ ] Update `components/water-source-map.tsx`
- [ ] Update `components/product-card.tsx`
- [ ] Update `components/product-comparison.tsx`
- [ ] Update `components/mobile-comparison-carousel.tsx`
- [ ] Update `lib/products.ts`

### Phase 7: Cleanup (30 min)

- [ ] Remove `lib/pocketbase.ts`
- [ ] Remove `lib/types/pocketbase.ts`
- [ ] Remove `pocketbase` from package.json
- [ ] Update imports in all files

### Phase 8: Testing (1 hour)

- [ ] Run full test suite
- [ ] Verify all pages load
- [ ] Test auth flows
- [ ] Test data operations
- [ ] Verify images display

**Total Estimated Time: ~10 hours**

---

## Testing Checklist

### Authentication

- [ ] User can register with email/password
- [ ] User can login with email/password
- [ ] User can login with Google OAuth
- [ ] User can logout
- [ ] Session persists across page reloads
- [ ] Protected routes require authentication

### Data Operations

- [ ] Homepage displays featured products
- [ ] Products page lists all products
- [ ] Product detail page loads with full data
- [ ] Search functionality works
- [ ] Filters (brand, type, pH, TDS) work
- [ ] Map displays source locations
- [ ] Product comparison loads data

### Images

- [ ] Product images display correctly
- [ ] Images load from PostgreSQL BYTEA
- [ ] No broken image links
- [ ] Image caching works

### CRUD Operations

- [ ] New product can be submitted (contribute page)
- [ ] New brand can be created
- [ ] New source can be created
- [ ] Data validation works

### Performance

- [ ] Page load times < 3 seconds
- [ ] API responses < 500ms
- [ ] Image loading optimized

---

## Rollback Plan

If issues arise during or after migration:

### Immediate Rollback (Data intact in PocketBase)

1. Revert code changes from git
2. Restore `lib/pocketbase.ts`
3. Revert environment variables
4. Redeploy

### Data Recovery

- PocketBase instance remains untouched during migration
- All original data preserved
- Can switch back by restoring code and env vars

### Database Cleanup

If migration fails and needs restart:

```sql
-- Drop all tables and start fresh
DROP TABLE IF EXISTS product_images CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS images CASCADE;
DROP TABLE IF EXISTS sources CASCADE;
DROP TABLE IF EXISTS manufacturers CASCADE;
DROP TABLE IF EXISTS brands CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS accounts CASCADE;
DROP TABLE IF EXISTS verification_tokens CASCADE;
DROP TABLE IF EXISTS users CASCADE;
```

---

## Notes

### Image Storage Decision

Images stored as BYTEA in PostgreSQL because:
- Simple backup/restore (single database dump)
- Transactional consistency
- No external dependencies (S3, etc.)
- ~15 images, total size < 5MB
- PostgreSQL handles BYTEA efficiently at this scale

### Auth Decision

NextAuth.js chosen because:
- Official Next.js authentication
- Built-in PostgreSQL adapter
- Google OAuth support
- Session management included
- TypeScript support

### API Decision

REST API routes chosen because:
- Simple to understand and debug
- Standard HTTP methods
- Easy to test with curl/Postman
- No additional dependencies (tRPC)
- Works with Server Components

---

## Post-Migration

### Monitoring

- Monitor database connection pool usage
- Watch for slow queries
- Track API response times
- Monitor image serving performance

### Optimization Opportunities

- Add Redis for session caching
- Implement image CDN if traffic grows
- Add database read replicas
- Implement query caching

---

**Document Version:** 1.0  
**Last Updated:** June 7, 2026  
**Author:** Migration Assistant
