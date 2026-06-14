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

// Map to track PB product ID to UUID
const productIdMap: Map<string, string> = new Map();

async function getProductIdMap(client: any) {
  const result = await client.query('SELECT id, product_name FROM products');
  for (const row of result.rows) {
    productIdMap.set(row.product_name, row.id);
  }
}

async function downloadImages() {
  console.log('🔐 Authenticating with PocketBase...');
  await pb.admins.authWithPassword('tikushijo@gmail.com', 'Muazoreo123');
  console.log('✅ Authenticated\n');

  const client = await pool.connect();
  
  try {
    // Build product name to UUID map
    console.log('🗺️  Building product ID map...');
    await getProductIdMap(client);
    console.log(`   Mapped ${productIdMap.size} products\n`);

    // Fetch all products with images
    console.log('📦 Fetching products with images...');
    const products = await pb.collection('products').getFullList();
    
    let totalImages = 0;
    let downloadedImages = 0;
    let failedImages = 0;

    for (const product of products) {
      if (!product.images || !Array.isArray(product.images) || product.images.length === 0) {
        continue;
      }

      const pgProductId = productIdMap.get(product.product_name);
      if (!pgProductId) {
        console.log(`   ⚠️  Product not found in DB: ${product.product_name}`);
        continue;
      }

      console.log(`\n📷 Product: ${product.product_name} (${product.images.length} images)`);

      for (let i = 0; i < product.images.length; i++) {
        const filename = product.images[i];
        totalImages++;

        try {
          // Build image URL
          const imageUrl = pb.files.getUrl(product, filename);
          console.log(`   ⬇️  Downloading: ${filename}`);
          console.log(`      URL: ${imageUrl}`);

          // Download image
          const response = await fetch(imageUrl);
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          const contentType = response.headers.get('content-type') || 'image/webp';
          const buffer = Buffer.from(await response.arrayBuffer());

          console.log(`      Size: ${(buffer.length / 1024).toFixed(2)} KB`);

          // Store in PostgreSQL
          const imageResult = await client.query(
            `INSERT INTO images (id, filename, mime_type, data, size_bytes) VALUES ($1, $2, $3, $4, $5) RETURNING id`,
            [randomUUID(), filename, contentType, buffer, buffer.length]
          );

          const imageId = imageResult.rows[0].id;

          // Link to product
          await client.query(
            `INSERT INTO product_images (product_id, image_id, sort_order) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`,
            [pgProductId, imageId, i]
          );

          downloadedImages++;
          console.log(`      ✅ Saved to PostgreSQL`);

        } catch (err: any) {
          failedImages++;
          console.log(`      ❌ Error: ${err.message}`);
        }
      }
    }

    console.log('\n╔══════════════════════════════════════════════════════════╗');
    console.log('║              IMAGE DOWNLOAD SUMMARY                      ║');
    console.log('╠══════════════════════════════════════════════════════════╣');
    console.log(`║ Total images found:    ${totalImages.toString().padStart(3)}                            ║`);
    console.log(`║ Successfully downloaded: ${downloadedImages.toString().padStart(3)}                            ║`);
    console.log(`║ Failed:                 ${failedImages.toString().padStart(3)}                            ║`);
    console.log('╚══════════════════════════════════════════════════════════╝');

    // Verify
    const imgCount = await client.query('SELECT COUNT(*) FROM images');
    const linkCount = await client.query('SELECT COUNT(*) FROM product_images');
    console.log(`\n📊 Database counts:`);
    console.log(`   Images: ${imgCount.rows[0].count}`);
    console.log(`   Product-Image links: ${linkCount.rows[0].count}`);

    // Test serving an image
    console.log(`\n🧪 Test image URL:`);
    const testImg = await client.query('SELECT id FROM images LIMIT 1');
    if (testImg.rows.length > 0) {
      console.log(`   http://localhost:3000/api/images/${testImg.rows[0].id}`);
    }

  } catch (err: any) {
    console.error('❌ Error:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

downloadImages();
