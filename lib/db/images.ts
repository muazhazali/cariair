// ==========================================
// Image Database Operations (BYTEA Storage)
// ==========================================

import { query, withTransaction } from '@/lib/db';
import { Image } from '@/lib/types/db';

// Store image in database
export async function storeImage(
  filename: string,
  mimeType: string,
  data: Buffer
): Promise<Image> {
  const sql = `
    INSERT INTO images (filename, mime_type, data, size_bytes)
    VALUES ($1, $2, $3, $4)
    RETURNING id, filename, mime_type, size_bytes, created_at
  `;

  const result = await query(sql, [filename, mimeType, data, data.length]);
  return result.rows[0];
}

// Get image by ID
export async function getImageById(id: string): Promise<Image | null> {
  const result = await query(
    'SELECT * FROM images WHERE id = $1',
    [id]
  );
  return result.rows[0] || null;
}

// Get image data only (for serving)
export async function getImageData(id: string): Promise<{ data: Buffer; mimeType: string; filename: string } | null> {
  const result = await query(
    'SELECT data, mime_type, filename FROM images WHERE id = $1',
    [id]
  );
  
  if (result.rows.length === 0) {
    return null;
  }

  return {
    data: result.rows[0].data,
    mimeType: result.rows[0].mime_type,
    filename: result.rows[0].filename
  };
}

// Get images for a product
export async function getProductImages(productId: string): Promise<Image[]> {
  const result = await query(
    `SELECT i.* 
     FROM images i
     JOIN product_images pi ON i.id = pi.image_id
     WHERE pi.product_id = $1
     ORDER BY pi.sort_order`,
    [productId]
  );
  return result.rows;
}

// Link image to product
export async function linkImageToProduct(
  productId: string,
  imageId: string,
  sortOrder: number = 0
): Promise<void> {
  await query(
    `INSERT INTO product_images (product_id, image_id, sort_order)
     VALUES ($1, $2, $3)
     ON CONFLICT (product_id, sort_order) DO NOTHING`,
    [productId, imageId, sortOrder]
  );
}

// Unlink image from product
export async function unlinkImageFromProduct(productId: string, imageId: string): Promise<void> {
  await query(
    'DELETE FROM product_images WHERE product_id = $1 AND image_id = $2',
    [productId, imageId]
  );
}

// Delete image (and unlink from all products)
export async function deleteImage(id: string): Promise<boolean> {
  return await withTransaction(async (client) => {
    // Unlink from products first
    await client.query('DELETE FROM product_images WHERE image_id = $1', [id]);
    
    // Delete image
    const result = await client.query(
      'DELETE FROM images WHERE id = $1 RETURNING id',
      [id]
    );
    
    return result.rows.length > 0;
  });
}

// Update image sort order
export async function updateImageSortOrder(
  productId: string,
  imageId: string,
  sortOrder: number
): Promise<void> {
  await query(
    `UPDATE product_images 
     SET sort_order = $1 
     WHERE product_id = $2 AND image_id = $3`,
    [sortOrder, productId, imageId]
  );
}

// Get primary image for product
export async function getPrimaryProductImage(productId: string): Promise<Image | null> {
  const result = await query(
    `SELECT i.* 
     FROM images i
     JOIN product_images pi ON i.id = pi.image_id
     WHERE pi.product_id = $1
     ORDER BY pi.sort_order
     LIMIT 1`,
    [productId]
  );
  return result.rows[0] || null;
}

