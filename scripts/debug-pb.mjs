
import PocketBase from 'pocketbase';

const pbUrl = 'https://pb2.muaz.app';
const pb = new PocketBase(pbUrl);

async function testFetch() {
    console.log(`Connecting to ${pbUrl}`);
    try {
        console.log("Attempting to fetch products (match component)...");
        const result = await pb.collection('products').getList(1, 50, {
            expand: 'brand,source',
            requestKey: null,
        });
        console.log("Success!");
        console.log(`Found ${result.totalItems} items.`);
    } catch (error) {
        console.error("Error fetching products:");
        console.error("Status:", error.status);
        console.error("Message:", error.message);
    }
}

testFetch();
