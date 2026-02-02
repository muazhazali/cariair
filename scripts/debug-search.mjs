
import PocketBase from 'pocketbase';

const pbUrl = 'https://pb2.muaz.app';
const pb = new PocketBase(pbUrl);

async function testSearch(query) {
    console.log(`Searching for "${query}"...`);
    try {
        const filterParts = [];
        if (query) {
            filterParts.push(`product_name ~ "${query}"`);
            filterParts.push(`barcode ~ "${query}"`);
            filterParts.push(`brand.brand_name ~ "${query}"`);
            filterParts.push(`source.location_address ~ "${query}"`);
        }

        const filter = filterParts.length > 0 ? filterParts.join(" || ") : "";
        console.log(`Filter: ${filter}`);

        const result = await pb.collection('products').getList(1, 50, {
            filter,
            expand: 'brand,source,manufacturer',
        });
        console.log("Success!");
        console.log(`Found ${result.totalItems} items.`);
    } catch (error) {
        console.error("Error searching products:");
        console.error("Message:", error.message);
        console.error("Status:", error.status);
    }
}

testSearch(""); // All
testSearch("spritzer"); // Specific query
