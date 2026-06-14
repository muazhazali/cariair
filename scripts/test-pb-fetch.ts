import PocketBase from 'pocketbase';

const pb = new PocketBase('https://pb2.muaz.app');

async function testFetch() {
  try {
    await pb.admins.authWithPassword('tikushijo@gmail.com', 'Muazoreo123');
    console.log('Authenticated\n');
    
    // Try fetching brands with error details
    console.log('Testing brands fetch...');
    try {
      const brands = await pb.collection('brands').getFullList();
      console.log(`✅ Got ${brands.length} brands`);
      if (brands.length > 0) {
        console.log('Sample brand:', JSON.stringify(brands[0], null, 2));
      }
    } catch (e: any) {
      console.log('❌ Error:', e.message);
      console.log('Status:', e.status);
      console.log('Response:', e.response);
    }
    
    // Try fetching products
    console.log('\nTesting products fetch...');
    try {
      const products = await pb.collection('products').getFullList();
      console.log(`✅ Got ${products.length} products`);
      if (products.length > 0) {
        console.log('Sample product:', JSON.stringify(products[0], null, 2).substring(0, 500));
      }
    } catch (e: any) {
      console.log('❌ Error:', e.message);
      console.log('Status:', e.status);
      console.log('Response:', e.response);
    }
    
  } catch (error: any) {
    console.error('Auth error:', error.message);
  }
}

testFetch();
