# PocketBase to PostgreSQL Migration

Migrate your data from `pb2.muaz.app` to PostgreSQL.

## Prerequisites

1. PostgreSQL database running (local or remote)
2. Admin access to `pb2.muaz.app`
3. Node.js and pnpm installed

## Quick Start

### 1. Setup Environment

Create `.env.migration` file:

```bash
cat > .env.migration << 'EOF'
# PocketBase (your instance)
PB_URL="https://pb2.muaz.app"
PB_ADMIN_EMAIL="your-admin-email@example.com"
PB_ADMIN_PASSWORD="your-admin-password"

# PostgreSQL (target database)
DB_HOST="localhost"
DB_PORT="5432"
DB_USER="postgres"
DB_PASS="your-db-password"
DB_NAME="cariair"
EOF
```

### 2. Install Dependencies

```bash
pnpm add -D pocketbase
```

### 3. Prepare Target Database

```bash
# Create database (if not exists)
createdb cariair

# Run schema
psql -h $DB_HOST -U $DB_USER -d $DB_NAME -f sql/schema.sql
```

### 4. Run Migration

```bash
# Load environment and run
export $(cat .env.migration | xargs)
npx ts-node scripts/migrate-pb-to-pg.ts
```

The script will:
1. Connect to `pb2.muaz.app`
2. Export all collections (brands, sources, manufacturers, users, products, images)
3. Import into PostgreSQL
4. Verify data integrity
5. Report any errors

### 5. Update Application

Add to `.env.local`:

```bash
# Database
DB_HOST="localhost"
DB_PORT="5432"
DB_USER="postgres"
DB_PASS="your-db-password"
DB_NAME="cariair"

# Auth (generate new secret)
AUTH_SECRET="your-random-secret-here"
AUTH_GOOGLE_ID="your-google-client-id"
AUTH_GOOGLE_SECRET="your-google-client-secret"

# Optional: Groq for chatbot
GROQ_API_KEY="your-groq-api-key"
```

Generate auth secret:
```bash
openssl rand -base64 32
```

### 6. Start Application

```bash
pnpm dev
```

Test:
- http://localhost:3000/search
- http://localhost:3000/login

## What Gets Migrated

| Collection | Records | Notes |
|------------|---------|-------|
| brands | ✅ | All brand data |
| sources | ✅ | Water sources with coordinates |
| manufacturers | ✅ | Manufacturer info |
| users | ✅ | Without passwords (must reset) |
| products | ✅ | With mineral JSON, pH, TDS |
| images | ✅ | Downloaded to BYTEA |

## What Doesn't Migrate

- **Passwords** - PB uses different hashing than NextAuth
- **Sessions** - Users will need to re-login
- **OAuth tokens** - Google OAuth must be reconfigured

## Verification

The migration script automatically verifies:

- ✅ Row counts match
- ✅ No orphaned records (foreign key integrity)
- ✅ Data quality (pH, TDS, coordinates present)
- ✅ Images downloaded correctly

Manual verification:

```bash
# Check counts
psql -h $DB_HOST -U $DB_USER -d $DB_NAME -c "
SELECT 'brands', COUNT(*) FROM brands UNION ALL
SELECT 'sources', COUNT(*) FROM sources UNION ALL
SELECT 'products', COUNT(*) FROM products;
"

# Test image
# Get an image ID from the images table, then:
curl http://localhost:3000/api/images/[ID] > test-image.jpg
file test-image.jpg
```

## Troubleshooting

### "Cannot connect to pb2.muaz.app"
- Check PB_URL has `https://` prefix
- Verify admin credentials
- Ensure pb2.muaz.app is accessible

### "Connection refused" to PostgreSQL
- Check PostgreSQL is running: `sudo service postgresql status`
- Verify DB_HOST and credentials
- Check pg_hba.conf allows connections

### "Foreign key violation"
- Migration runs in correct order (brands → sources → manufacturers → users → products → images)
- If error persists, check PB for orphaned records

### "Image download failed"
- Some images may be missing in PB
- Errors are logged but migration continues
- Check `images.errors` in summary

## Rollback

If migration fails:

```bash
# Reset PostgreSQL
psql -h $DB_HOST -U $DB_USER -d $DB_NAME -c "
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
"

# Re-run schema
psql -h $DB_HOST -U $DB_USER -d $DB_NAME -f sql/schema.sql

# Re-run migration
npx ts-node scripts/migrate-pb-to-pg.ts
```

PocketBase remains untouched during migration.

## Post-Migration Checklist

- [ ] Migration completed without errors
- [ ] Row counts match between PB and PG
- [ ] Images display correctly
- [ ] Product search works
- [ ] User login works (with password reset)
- [ ] Google OAuth configured
- [ ] Production database backed up
- [ ] DNS/domain pointed to new deployment
