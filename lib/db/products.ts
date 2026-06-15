// ==========================================
// Product Database Operations
// ==========================================

import { query, withTransaction } from '@/lib/db';
import { Product, ProductStatus, SearchFilters, PaginatedResponse } from '@/lib/types/db';

// Get all products with optional filters
export async function getProducts(
  filters?: SearchFilters,
  options?: { limit?: number; offset?: number }
): Promise<PaginatedResponse<Product>> {
  const limit = options?.limit || 50;
  const offset = options?.offset || 0;

  let sql = `
    SELECT 
      p.*,
      b.id as brand_id,
      b.brand_name,
      b.parent_company as brand_parent_company,
      b.website_url as brand_website_url,
      b.created_at as brand_created_at,
      b.updated_at as brand_updated_at,
      s.id as source_id_val,
      s.source_name,
      s.type as source_type,
      s.location_address,
      s.lat,
      s.lng,
      s.kkm_approval_number,
      s.country as source_country,
      s.created_at as source_created_at,
      s.updated_at as source_updated_at,
      m.id as manufacturer_id_val,
      m.name as manufacturer_name,
      m.address as manufacturer_address,
      m.created_at as manufacturer_created_at,
      m.updated_at as manufacturer_updated_at
    FROM products p
    LEFT JOIN brands b ON p.brand_id = b.id
    LEFT JOIN sources s ON p.source_id = s.id
    LEFT JOIN manufacturers m ON p.manufacturer_id = m.id
  `;

  const params: any[] = [];
  const conditions: string[] = [];
  let paramIndex = 1;

  // Build filter conditions
  if (filters) {
    // Text search
    if (filters.query) {
      conditions.push(`(
        p.product_name ILIKE $${paramIndex} 
        OR p.barcode ILIKE $${paramIndex}
        OR b.brand_name ILIKE $${paramIndex}
      )`);
      params.push(`%${filters.query}%`);
      paramIndex++;
    }

    // Source type filter
    if (filters.types && filters.types.length > 0) {
      conditions.push(`s.type = ANY($${paramIndex})`);
      params.push(filters.types);
      paramIndex++;
    }

    // Excluded types
    if (filters.excludedTypes && filters.excludedTypes.length > 0) {
      conditions.push(`s.type IS NULL OR s.type != ALL($${paramIndex})`);
      params.push(filters.excludedTypes);
      paramIndex++;
    }

    // Brand filter
    if (filters.brands && filters.brands.length > 0) {
      conditions.push(`p.brand_id = ANY($${paramIndex}::uuid[])`);
      params.push(filters.brands);
      paramIndex++;
    }

    // Excluded brands
    if (filters.excludedBrands && filters.excludedBrands.length > 0) {
      conditions.push(`p.brand_id IS NULL OR p.brand_id != ALL($${paramIndex}::uuid[])`);
      params.push(filters.excludedBrands);
      paramIndex++;
    }

    // pH range
    if (filters.minPh !== undefined && filters.minPh > 0) {
      conditions.push(`p.ph_level >= $${paramIndex}`);
      params.push(filters.minPh);
      paramIndex++;
    }
    if (filters.maxPh !== undefined && filters.maxPh < 14) {
      conditions.push(`p.ph_level <= $${paramIndex}`);
      params.push(filters.maxPh);
      paramIndex++;
    }

    // TDS range
    if (filters.minTds !== undefined && filters.minTds > 0) {
      conditions.push(`p.tds >= $${paramIndex}`);
      params.push(filters.minTds);
      paramIndex++;
    }
    if (filters.maxTds !== undefined && filters.maxTds < 500) {
      conditions.push(`p.tds <= $${paramIndex}`);
      params.push(filters.maxTds);
      paramIndex++;
    }
  }

  // Default: only show approved products
  conditions.push(`p.status = 'approved'`);

  if (conditions.length > 0) {
    sql += ' WHERE ' + conditions.join(' AND ');
  }

  // Get total count
  const countSql = sql.replace(/SELECT[\s\S]*?FROM/i, 'SELECT COUNT(*) FROM');
  const countResult = await query<{ count: string }>(countSql, params);
  const total = parseInt(countResult.rows[0].count);

  // Add pagination
  sql += ` ORDER BY p.product_name LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
  params.push(limit, offset);

  const result = await query<Product>(sql, params);

  // Transform rows to products with expanded fields
  const products = result.rows.map(row => transformProductRow(row));

  // Fetch images for each product
  const { getProductImages } = await import('./images');
  const productsWithImages = await Promise.all(
    products.map(async (product) => {
      const images = await getProductImages(product.id);
      return {
        ...product,
        images: images.map((img: { id: string; filename: string }) => ({
          id: img.id,
          filename: img.filename,
          url: `/api/images/${img.id}`,
        })),
      };
    })
  );

  return {
    items: productsWithImages,
    total,
    page: Math.floor(offset / limit) + 1,
    perPage: limit
  };
}

// Get single product by ID
export async function getProductById(id: string): Promise<Product | null> {
  const sql = `
    SELECT 
      p.*,
      b.id as brand_id,
      b.brand_name,
      b.parent_company as brand_parent_company,
      b.website_url as brand_website_url,
      b.created_at as brand_created_at,
      b.updated_at as brand_updated_at,
      s.id as source_id_val,
      s.source_name,
      s.type as source_type,
      s.location_address,
      s.lat,
      s.lng,
      s.kkm_approval_number,
      s.country as source_country,
      s.created_at as source_created_at,
      s.updated_at as source_updated_at,
      m.id as manufacturer_id_val,
      m.name as manufacturer_name,
      m.address as manufacturer_address,
      m.created_at as manufacturer_created_at,
      m.updated_at as manufacturer_updated_at
    FROM products p
    LEFT JOIN brands b ON p.brand_id = b.id
    LEFT JOIN sources s ON p.source_id = s.id
    LEFT JOIN manufacturers m ON p.manufacturer_id = m.id
    WHERE p.id = $1
  `;

  const result = await query<Product>(sql, [id]);

  if (result.rows.length === 0) {
    return null;
  }

  const product = transformProductRow(result.rows[0]);

  // Fetch images for the product
  const { getProductImages } = await import('./images');
  const images = await getProductImages(product.id);
  product.images = images.map((img: { id: string; filename: string }) => ({
    id: img.id,
    filename: img.filename,
    url: `/api/images/${img.id}`,
  }));

  return product;
}

// Create new product
export async function createProduct(data: Partial<Product>): Promise<Product> {
  const columns: string[] = [];
  const values: any[] = [];
  const placeholders: string[] = [];
  let index = 1;

  const fields: (keyof Product)[] = [
    'brand_id', 'manufacturer_id', 'source_id', 'submitted_by',
    'product_name', 'barcode', 'ph_level', 'tds', 'minerals_json', 'status'
  ];

  for (const field of fields) {
    if (data[field] !== undefined) {
      columns.push(field);
      values.push(field === 'minerals_json' ? JSON.stringify(data[field]) : data[field]);
      placeholders.push(`$${index}`);
      index++;
    }
  }

  const sql = `
    INSERT INTO products (${columns.join(', ')})
    VALUES (${placeholders.join(', ')})
    RETURNING *
  `;

  const result = await query<Product>(sql, values);
  return result.rows[0];
}

// Update product
export async function updateProduct(
  id: string,
  data: Partial<Product>
): Promise<Product | null> {
  const updates: string[] = [];
  const values: any[] = [];
  let index = 1;

  const fields: (keyof Product)[] = [
    'brand_id', 'manufacturer_id', 'source_id',
    'product_name', 'barcode', 'ph_level', 'tds', 'minerals_json', 'status'
  ];

  for (const field of fields) {
    if (data[field] !== undefined) {
      updates.push(`${field} = $${index}`);
      values.push(field === 'minerals_json' ? JSON.stringify(data[field]) : data[field]);
      index++;
    }
  }

  if (updates.length === 0) {
    return getProductById(id);
  }

  values.push(id);
  const sql = `
    UPDATE products
    SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
    WHERE id = $${index}
    RETURNING *
  `;

  const result = await query<Product>(sql, values);
  return result.rows[0] || null;
}

// Delete product
export async function deleteProduct(id: string): Promise<boolean> {
  return await withTransaction(async (client) => {
    // Delete associated product_images first
    await client.query('DELETE FROM product_images WHERE product_id = $1', [id]);
    
    // Delete product
    const result = await client.query(
      'DELETE FROM products WHERE id = $1 RETURNING id',
      [id]
    );
    
    return result.rows.length > 0;
  });
}

// Get products by brand
export async function getProductsByBrand(brandId: string): Promise<Product[]> {
  const result = await query<Product>(
    'SELECT * FROM products WHERE brand_id = $1 AND status = $2 ORDER BY product_name',
    [brandId, 'approved']
  );
  return result.rows;
}

// Get products by source
export async function getProductsBySource(sourceId: string): Promise<Product[]> {
  const result = await query<Product>(
    'SELECT * FROM products WHERE source_id = $1 AND status = $2 ORDER BY product_name',
    [sourceId, 'approved']
  );
  return result.rows;
}

// Transform database row to Product with expanded fields
function transformProductRow(row: any): Product {
  const product: Product = {
    id: row.id,
    brand_id: row.brand_id,
    manufacturer_id: row.manufacturer_id,
    source_id: row.source_id,
    submitted_by: row.submitted_by,
    product_name: row.product_name,
    barcode: row.barcode,
    ph_level: row.ph_level,
    tds: row.tds,
    minerals_json: row.minerals_json,
    status: row.status,
    created_at: row.created_at,
    updated_at: row.updated_at
  };

  // Add expanded brand if present
  if (row.brand_name) {
    product.brand = {
      id: row.brand_id,
      brand_name: row.brand_name,
      parent_company: row.brand_parent_company,
      website_url: row.brand_website_url,
      created_at: row.brand_created_at,
      updated_at: row.brand_updated_at
    };
  }

  // Add expanded source if present
  if (row.source_name) {
    product.source = {
      id: row.source_id_val,
      source_name: row.source_name,
      type: row.source_type,
      location_address: row.location_address,
      lat: row.lat,
      lng: row.lng,
      kkm_approval_number: row.kkm_approval_number,
      country: row.source_country,
      created_at: row.source_created_at,
      updated_at: row.source_updated_at
    };
  }

  // Add expanded manufacturer if present
  if (row.manufacturer_name) {
    product.manufacturer = {
      id: row.manufacturer_id_val,
      name: row.manufacturer_name,
      address: row.manufacturer_address,
      created_at: row.manufacturer_created_at,
      updated_at: row.manufacturer_updated_at
    };
  }

  return product;
}
