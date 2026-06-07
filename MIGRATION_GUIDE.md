# Migration Execution Guide

This guide walks you through executing the migration from PocketBase to PostgreSQL.

## Prerequisites

1. PostgreSQL server running at `192.168.1.108:5432`
2. Node.js and pnpm installed
3. `.env` file configured with database credentials

## Step-by-Step Migration

### Step 1: Install Dependencies

```bash
pnpm install
```

### Step 2: Create Database Schema

Run the SQL schema file to create all tables:

```bash
# Using psql command line
psql -h 192.168.1.108 -U postgres -d postgres -f sql/schema.sql

# Or using the seed script
pnpm seed:postgres
```

**Expected output:**
```
🌱 Seeding PostgreSQL database...
Creating tables...
✅ Tables created

Seed data loaded:
  Brands: 14
  Sources: 13
✅ Seeding completed!
```

### Step 3: Verify Database Setup

Check that tables were created:

```sql
-- Connect to PostgreSQL and list tables
\dt

-- Should show:
-- accounts
-- brands
-- images
-- manufacturers
-- product_images
-- products
-- sessions
-- sources
-- users
-- verification_tokens
```

### Step 4: Test API Health

Start the development server:

```bash
pnpm dev
```

Test the health endpoint:

```bash
curl http://localhost:3000/api/health
```

**Expected response:**
```json
{
  "status": "healthy",
  "database": "connected",
  "stats": {
    "brands": 14,
    "sources": 13,
    "products": 0
  }
}
```

### Step 5: Run Data Migration (Optional)

If you want to migrate existing PocketBase data:

```bash
# Set environment variables
export POCKETBASE_URL=https://pb2.muaz.app
export POCKETBASE_ADMIN_EMAIL=your-admin-email
export POCKETBASE_ADMIN_PASSWORD=your-admin-password

# Run migration
pnpm migrate
```

**Note:** The migration script will:
- Fetch all data from PocketBase
- Download product images
- Store images as BYTEA in PostgreSQL
- Transfer all products with relations

**Migration output:**
```
🚀 Starting migration from PocketBase to PostgreSQL
PocketBase: https://pb2.muaz.app
PostgreSQL: 192.168.1.108:5432/postgres

Testing connections...
✅ PostgreSQL connected

📦 Migrating brands...
  Found 14 brands
  ✅ Migrated 14 brands

📦 Migrating sources...
  Found 13 sources
  ✅ Migrated 13 sources

📦 Migrating images...
  ✅ Migrated 15 images

📦 Migrating products...
  Found 15 products
  ✅ Migrated 15 products

✅ Migration completed successfully!

Summary:
  Users: 0
  Brands: 14
  Manufacturers: 10
  Sources: 13
  Images: 15
  Products: 15
```

## Step 6: Update Application Code

The following files have been updated to use PostgreSQL:

1. ✅ `lib/products.ts` - Updated to use PostgreSQL functions
2. ✅ `lib/auth.ts` - NextAuth.js configuration
3. ✅ API routes in `app/api/`

### Files Still Needing Updates

Run this command to find files still referencing PocketBase:

```bash
grep -r "pocketbase" --include="*.ts" --include="*.tsx" app/ components/ lib/ --exclude-dir=node_modules
```

Expected files to update:
- `app/login/page.tsx`
- `app/register/page.tsx`
- `app/contribute/page.tsx`
- `app/page.tsx`
- `app/sources/[id]/page.tsx`
- `components/water-sources-display.tsx`
- `components/water-source-map.tsx`
- `components/product-card.tsx`
- `components/product-comparison.tsx`
- `components/mobile-comparison-carousel.tsx`

## Step 7: Update Components

### Example: Update Login Page

Replace:
```typescript
import { pb } from '@/lib/pocketbase';
await pb.collection('users').authWithPassword(email, password);
```

With:
```typescript
import { signIn } from '@/lib/auth';
await signIn('credentials', { email, password, redirect: false });
```

### Example: Update Data Fetching

Replace:
```typescript
import { pb } from '@/lib/pocketbase';
const result = await pb.collection('products').getList(1, 50);
```

With:
```typescript
const response = await fetch('/api/products');
const { items } = await response.json();
```

### Example: Update Image URLs

Replace:
```typescript
import { getImageUrl } from '@/lib/pocketbase';
const url = getImageUrl(product, product.images[0]);
```

With:
```typescript
const url = `/api/images/${product.images[0].id}`;
```

## Step 8: Testing

### Authentication Tests

1. **Register new user:**
   - Visit `/register`
   - Create account with email/password
   - Check database: `SELECT * FROM users WHERE email = 'your@email.com';`

2. **Login:**
   - Visit `/login`
   - Login with credentials
   - Verify session created

3. **Google OAuth:**
   - Visit `/login`
   - Click "Sign in with Google"
   - Complete OAuth flow

### Data Tests

1. **List products:**
   ```bash
   curl http://localhost:3000/api/products | jq
   ```

2. **Filter products:**
   ```bash
   curl "http://localhost:3000/api/products?brands=uuid-here" | jq
   ```

3. **Get single product:**
   ```bash
   curl http://localhost:3000/api/products/uuid-here | jq
   ```

4. **List brands:**
   ```bash
   curl http://localhost:3000/api/brands | jq
   ```

5. **List sources:**
   ```bash
   curl http://localhost:3000/api/sources | jq
   ```

### Image Tests

1. **Upload image:** (via contribute page)
2. **View image:**
   ```bash
   curl http://localhost:3000/api/images/uuid-here --output test.jpg
   ```

## Step 9: Cleanup

After successful migration:

1. Remove PocketBase dependencies:
   ```bash
   pnpm remove pocketbase
   ```

2. Delete old files:
   ```bash
   rm lib/pocketbase.ts
   rm lib/types/pocketbase.ts
   ```

3. Remove old seed scripts:
   ```bash
   rm scripts/seed-from-sql.mjs
   rm scripts/create-collections.mjs
   rm scripts/setup-rules.mjs
   rm scripts/seed-user.mjs
   ```

4. Update package.json scripts:
   ```json
   {
     "scripts": {
       "dev": "next dev",
       "build": "next build",
       "start": "next start",
       "lint": "next lint",
       "db:seed": "npx ts-node --env-file=.env scripts/seed-postgres.ts"
     }
   }
   ```

## Troubleshooting

### Connection Errors

**Error:** `connection refused`
- Verify PostgreSQL is running: `psql -h 192.168.1.108 -U postgres`
- Check firewall settings
- Verify credentials in `.env`

**Error:** `database "postgres" does not exist`
- Connect and create database:
  ```bash
  psql -h 192.168.1.108 -U postgres
  CREATE DATABASE cariair;
  ```
- Update `.env`: `DB_NAME=cariair`

### Migration Errors

**Error:** `PocketBase auth failed`
- Export admin credentials:
  ```bash
  export POCKETBASE_ADMIN_EMAIL=your-email
  export POCKETBASE_ADMIN_PASSWORD=your-password
  ```

**Error:** `duplicate key value`
- Some records already exist
- Migration script handles this by skipping duplicates

### API Errors

**Error:** `Unauthorized`
- Check session: Visit `/api/auth/session`
- Verify `AUTH_SECRET` is set

**Error:** `Failed to fetch products`
- Check database connection: `curl http://localhost:3000/api/health`
- Verify tables exist

## Verification Checklist

- [ ] Database schema created
- [ ] Health endpoint returns 200
- [ ] Brands endpoint returns data
- [ ] Sources endpoint returns data
- [ ] Products endpoint returns data
- [ ] Product detail page works
- [ ] Images display correctly
- [ ] Login with email works
- [ ] Login with Google works
- [ ] Registration works
- [ ] Contribute form submits
- [ ] Map displays sources
- [ ] Search/filtering works

## Support

If you encounter issues:

1. Check application logs: `pnpm dev`
2. Check PostgreSQL logs
3. Verify environment variables
4. Test database connectivity
5. Review error messages carefully

## Post-Migration

Once migration is complete:

1. Keep PocketBase instance running as backup
2. Monitor application logs for errors
3. Test all features thoroughly
4. Inform team members of changes
5. Update documentation

---

**Migration completed:** Run `pnpm dev` to start the application!
