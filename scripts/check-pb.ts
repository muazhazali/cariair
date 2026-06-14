import PocketBase from 'pocketbase';

const pb = new PocketBase('https://pb2.muaz.app');

async function checkCollections() {
  try {
    console.log('🔐 Authenticating...');
    await pb.admins.authWithPassword(
      'tikushijo@gmail.com',
      'Muazoreo123'
    );
    console.log('✅ Authenticated\n');
    
    // Get list of collections
    console.log('📋 Fetching collections...');
    const collections = await pb.collections.getFullList();
    
    console.log(`\nFound ${collections.length} collections:\n`);
    for (const col of collections) {
      try {
        const records = await pb.collection(col.name).getList(1, 1);
        console.log(`  📁 ${col.name} (${records.totalItems} records)`);
      } catch (e: any) {
        console.log(`  📁 ${col.name} (error: ${e.message})`);
      }
    }
  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }
}

checkCollections();
