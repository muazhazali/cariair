import PocketBase from 'pocketbase';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read values from environment variables only.
const pbUrl = process.env.NEXT_PUBLIC_POCKETBASE_URL;
const email = process.env.POCKETBASE_ADMIN_EMAIL;
const password = process.env.POCKETBASE_ADMIN_PASSWORD;

if (!pbUrl || !email || !password) {
    console.error('Error: NEXT_PUBLIC_POCKETBASE_URL, POCKETBASE_ADMIN_EMAIL and POCKETBASE_ADMIN_PASSWORD must be set in .env');
    process.exit(1);
}

const pb = new PocketBase(pbUrl);
pb.autoCancellation(false);

// Helper to parse SQL values
// Handles basic SQL value syntax: strings in '', numbers, NULL
function parseSqlValues(valuesStr) {
    const rows = [];
    let currentRow = [];
    let currentVal = '';
    let inQuote = false;
    let inParenthesis = false;

    // Remove starting ( and ending )? 
    // The input is like: (1, 'A'), (2, 'B');
    // We'll iterate char by char
    
    // Actually, regex might be safer for this specific file format which is clean
    // The format is (val1, val2, ...), (val1, val2, ...)
    
    // Let's use a simpler regex approach for the rows
    // Split by `), (` handling the start and end
    // But strings might contain `), (`. 
    // Given the seed file content, strings are simple.
    
    // Let's iterate manually
    let buffer = '';
    let rowValues = [];
    
    for (let i = 0; i < valuesStr.length; i++) {
        const char = valuesStr[i];
        
        if (char === '(' && !inQuote && !inParenthesis) {
            inParenthesis = true;
            rowValues = [];
            buffer = '';
            continue;
        }
        
        if (char === ')' && !inQuote && inParenthesis) {
            // End of row
            // Push last value
            rowValues.push(parseValue(buffer));
            rows.push(rowValues);
            inParenthesis = false;
            buffer = '';
            continue;
        }
        
        if (char === "'" && (i === 0 || valuesStr[i-1] !== '\\')) {
            inQuote = !inQuote;
        }
        
        if (char === ',' && !inQuote && inParenthesis) {
            rowValues.push(parseValue(buffer));
            buffer = '';
            continue;
        }
        
        if (inParenthesis) {
            buffer += char;
        }
    }
    return rows;
}

function parseValue(val) {
    val = val.trim();
    if (val.toUpperCase() === 'NULL') return null;
    if (val.startsWith("'") && val.endsWith("'")) {
        return val.slice(1, -1).replace(/\\'/g, "'");
    }
    if (val === 'TRUE') return true;
    if (val === 'FALSE') return false;
    return isNaN(Number(val)) ? val : Number(val);
}

async function main() {
    try {
        console.log(`Connecting to ${pbUrl}...`);
        await pb.admins.authWithPassword(email, password);
        console.log('Authenticated as admin.');

        const sqlPath = path.join(__dirname, 'seed.sql');
        const sqlContent = fs.readFileSync(sqlPath, 'utf8');

        // Extract tables data
        const minerals = [];
        const brands = [];
        const sources = [];
        const products = [];
        const productMinerals = [];
        
        // --- 1. Minerals ---
        const mineralsMatch = sqlContent.match(/INSERT INTO minerals .*? VALUES\s*([\s\S]*?);/);
        if (mineralsMatch) {
            const rows = parseSqlValues(mineralsMatch[1]);
            rows.forEach(r => {
                minerals.push({ id: r[0], name: r[1], symbol: r[2], unit: 'mg/L' }); // Default unit from SQL schema
            });
            console.log(`Parsed ${minerals.length} minerals.`);
        }

        // --- 2. Brands ---
        const brandsMatch = sqlContent.match(/INSERT INTO brands .*? VALUES\s*([\s\S]*?);/);
        if (brandsMatch) {
            const rows = parseSqlValues(brandsMatch[1]);
            rows.forEach(r => {
                brands.push({ id: r[0], brand_name: r[1], parent_company: r[2], website_url: r[3] });
            });
            console.log(`Parsed ${brands.length} brands.`);
        }

        // --- 3. Sources ---
        const sourcesMatch = sqlContent.match(/INSERT INTO sources .*? VALUES\s*([\s\S]*?);/);
        if (sourcesMatch) {
            const rows = parseSqlValues(sourcesMatch[1]);
            rows.forEach(r => {
                // (id, source_name, type, location_address, state_province, country, kkm_approval_number)
                sources.push({
                    id: r[0],
                    source_name: r[1],
                    type: r[2],
                    location_address: r[3],
                    state: r[4],
                    country: r[5],
                    kkm: r[6]
                });
            });
            console.log(`Parsed ${sources.length} sources.`);
        }

        // --- 4. Products ---
        // INSERT INTO products (id, brand_id, source_id, product_name, product_type, treatment_process, volume_ml, barcode, ph_level, tds, manufacturer_name, image_url)
        // Note: SQL parsing relies on order. The SQL file explicitly lists columns.
        const productsMatch = sqlContent.match(/INSERT INTO products .*? VALUES\s*([\s\S]*?);/);
        if (productsMatch) {
            // Remove comments
            const cleanValues = productsMatch[1].replace(/--.*$/gm, '').trim();
            const rows = parseSqlValues(cleanValues);
            rows.forEach(r => {
                if (r.length < 12) return; // Skip empty/malformed rows
                products.push({
                    id: r[0],
                    brand_id: r[1],
                    source_id: r[2],
                    product_name: r[3],
                    product_type: r[4],
                    treatment: r[5],
                    volume: r[6],
                    barcode: r[7],
                    ph: r[8],
                    tds: r[9],
                    manufacturer_name: r[10],
                    image_url: r[11]
                });
            });
            console.log(`Parsed ${products.length} products.`);
        }

        // --- 5. Product Minerals ---
        // We have multiple INSERT statements for product_minerals
        const prodMinMatches = sqlContent.matchAll(/INSERT INTO product_minerals .*? VALUES\s*([\s\S]*?);/g);
        for (const match of prodMinMatches) {
            const rows = parseSqlValues(match[1]);
            rows.forEach(r => {
                productMinerals.push({ product_id: r[0], mineral_id: r[1], amount: r[2] });
            });
        }
        console.log(`Parsed ${productMinerals.length} product_mineral entries.`);

        // === Seeding ===

        // Helper to find or create
        async function upsert(collection, filter, data) {
            try {
                const record = await pb.collection(collection).getFirstListItem(filter);
                console.log(`  [${collection}] Found existing: ${filter}`);
                return record;
            } catch (e) {
                if (e.status === 404) {
                    const record = await pb.collection(collection).create(data);
                    console.log(`  [${collection}] Created: ${filter}`);
                    return record;
                }
                throw e;
            }
        }

        // 1. Brands
        const brandMap = new Map(); // sql_id -> pb_id
        for (const b of brands) {
            const data = {
                brand_name: b.brand_name,
                parent_company: b.parent_company,
                website_url: b.website_url
            };
            const record = await upsert('brands', `brand_name="${b.brand_name}"`, data);
            brandMap.set(b.id, record.id);
        }

        // 2. Sources
        const sourceMap = new Map(); // sql_id -> pb_id
        for (const s of sources) {
            // Combine address
            const fullAddress = [s.location_address, s.state, s.country].filter(Boolean).join(', ');
            
            // Map SQL type to PB type options if needed. 
            // PB options: ["Underground", "Spring", "Municipal", "Oxygenated"]
            // SQL types: 'Underground', 'Spring', 'Municipal/Treated', 'Underground (Oxygenated)'
            let type = s.type;
            if (type === 'Municipal/Treated') type = 'Municipal';
            if (type.includes('Oxygenated')) type = 'Oxygenated';

            const data = {
                source_name: s.source_name,
                type: type,
                location_address: fullAddress,
                kkm_approval_number: s.kkm
            };
            const record = await upsert('sources', `source_name="${s.source_name}"`, data);
            sourceMap.set(s.id, record.id);
        }

        // 3. Manufacturers
        const manufacturerMap = new Map(); // name -> pb_id
        const uniqueManufacturers = [...new Set(products.map(p => p.manufacturer_name).filter(Boolean))];
        
        for (const name of uniqueManufacturers) {
            const data = { name: name };
            const record = await upsert('manufacturers', `name="${name}"`, data);
            manufacturerMap.set(name, record.id);
        }

        // 4. Products
        for (const p of products) {
            // Prepare minerals json
            const pMinerals = productMinerals.filter(pm => pm.product_id === p.id);
            const mineralsJson = pMinerals.map(pm => {
                const m = minerals.find(min => min.id === pm.mineral_id);
                return {
                    name: m.name,
                    symbol: m.symbol,
                    amount: pm.amount,
                    unit: m.unit
                };
            });

            // Relations
            const brandId = brandMap.get(p.brand_id);
            const sourceId = sourceMap.get(p.source_id);
            const manufacturerId = manufacturerMap.get(p.manufacturer_name);

            if (!brandId) console.warn(`Warning: Brand ID ${p.brand_id} not found for product ${p.product_name}`);
            
            const data = {
                brand: brandId,
                source: sourceId,
                manufacturer: manufacturerId,
                product_name: p.product_name,
                barcode: p.barcode,
                ph_level: p.ph,
                tds: p.tds,
                minerals_json: mineralsJson,
                status: 'approved', // Default to approved for seeded data
                // images: ... (Need to upload files if they exist locally, skipping for now as strict file upload requires FormData and files)
            };

            // Check uniqueness by barcode if present, else by name + brand
            let filter;
            let existingRecord = null;

            if (p.barcode) {
                try {
                    existingRecord = await pb.collection('products').getFirstListItem(`barcode="${p.barcode}"`);
                    // If found, check if it's the same product
                    if (existingRecord.product_name !== p.product_name || existingRecord.brand !== brandId) {
                        console.warn(`  [products] Barcode collision! ${p.barcode} exists for '${existingRecord.product_name}' but trying to insert '${p.product_name}'. Clearing barcode for new product.`);
                        p.barcode = null; // Clear barcode to allow insertion
                        existingRecord = null; // Proceed to insert as new
                    }
                } catch (e) {
                    // Not found, safe to proceed
                }
            }

            if (!existingRecord) {
                 // Try finding by name + brand
                 try {
                    existingRecord = await pb.collection('products').getFirstListItem(`product_name="${p.product_name}" && brand="${brandId}"`);
                 } catch (e) {}
            }

            if (existingRecord) {
                console.log(`  [products] Found existing: ${p.product_name} (${existingRecord.id})`);
                // Optional: Update fields if needed?
            } else {
                try {
                    const created = await pb.collection('products').create(data);
                    console.log(`  [products] Created: ${p.product_name}`);
                } catch (e) {
                    console.error(`Failed to insert product ${p.product_name}:`, e.message);
                    if (e.data) console.error(JSON.stringify(e.data, null, 2));
                }
            }
        }

        console.log('Seeding completed!');

    } catch (error) {
        console.error('Fatal Error:', error);
        process.exit(1);
    }
}

main();
