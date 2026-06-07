# Post-Migration Testing Guide

## Quick Manual Tests

Open your browser and test these URLs:

### 1. Homepage
URL: http://localhost:3000

✅ Check:
- Page loads without errors
- Statistics display (15 products, 14 brands, 13 sources)
- Featured products load
- Map section displays
- Search bar works

### 2. Products Page
URL: http://localhost:3000/sources

✅ Check:
- Products list displays
- Filters work (try clicking filter buttons)
- Product cards show images
- pH and TDS values display
- Brand names show correctly

### 3. Product Detail
URL: http://localhost:3000/sources/{product-id}

Get a product ID from the products page, then:
✅ Check:
- Product info displays
- Image loads
- Map shows location
- Minerals panel works
- Brand info shows

### 4. Login Page
URL: http://localhost:3000/login

✅ Check:
- Login form displays
- Google OAuth button shows
- Can log in with email/password

### 5. Registration
URL: http://localhost:3000/register

✅ Check:
- Registration form displays
- Can create new account
- Auto-login works after registration

### 6. API Endpoints (curl/Postman)

```bash
# Health check
curl http://localhost:3000/api/health

# List products
curl http://localhost:3000/api/products

# List brands
curl http://localhost:3000/api/brands

# List sources
curl http://localhost:3000/api/sources
```

## Verification Checklist

- [ ] Database connected
- [ ] Homepage loads
- [ ] Products display
- [ ] Product images load
- [ ] Map displays
- [ ] Filters work
- [ ] Search works
- [ ] Product detail page works
- [ ] Login works
- [ ] Registration works
- [ ] OAuth works (Google)
- [ ] No console errors

## Troubleshooting

### If pages don't load:
1. Check if dev server is running: `pnpm dev`
2. Check database connection: http://localhost:3000/api/health
3. Check PostgreSQL is running

### If images don't load:
1. Check image IDs are correct
2. Test: `curl http://localhost:3000/api/images/{id}`

### If auth doesn't work:
1. Check AUTH_SECRET is set
2. Check Google OAuth credentials
3. Verify users table has records

## Next Steps After Testing

Once all tests pass:
1. ✅ Remove pocketbase from package.json dependencies
2. ✅ Clean up migration scripts
3. ✅ Update documentation
4. ✅ Deploy to production
