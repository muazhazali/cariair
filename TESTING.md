# Migration Testing Checklist

## Pre-Test Setup
- [x] PostgreSQL database running
- [x] Database schema applied
- [x] Data migrated from PocketBase
- [x] Next.js dev server running

## API Tests

### Health Check
```bash
curl http://localhost:3000/api/health
```
Expected: Status 200, database connected, counts correct

### Products API
```bash
# List all products
curl http://localhost:3000/api/products

# Filter by brand
curl "http://localhost:3000/api/products?brands=uuid"

# Get single product
curl http://localhost:3000/api/products/uuid
```

### Auth API
```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password123"}'

# Login via NextAuth (handled by /api/auth/callback/credentials)
```

### Images
```bash
# Test image serving
curl http://localhost:3000/api/images/{uuid}
```

## Frontend Tests

### Pages to Test
1. **Homepage** (http://localhost:3000)
   - Stats load correctly
   - Featured products display
   - Map loads
   - Search works

2. **Products Page** (http://localhost:3000/sources)
   - Products list
   - Filters work
   - Search works
   - Sorting works

3. **Product Detail** (http://localhost:3000/sources/{id})
   - Product info displays
   - Images load
   - Map shows location
   - Minerals panel loads

4. **Login** (http://localhost:3000/login)
   - Form displays
   - Email login works
   - Google OAuth works

5. **Register** (http://localhost:3000/register)
   - Form displays
   - Registration works
   - Auto-login after register

6. **Contribute** (http://localhost:3000/contribute)
   - Form displays
   - Brands/manufacturers/sources load
   - Can submit product

## Component Tests

- Product cards render
- Product comparison works
- Mobile carousel works
- Filters work
- Image loading works

## Data Verification

- All 15 products migrated
- All 14 images accessible
- Brands display correctly
- Sources have coordinates
- Product relations work

## Expected Issues

None! Everything should work seamlessly.
