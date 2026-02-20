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

async function main() {
    try {
        console.log(`Connecting to ${pbUrl}...`);
        await pb.admins.authWithPassword(email, password);
        console.log('Authenticated as admin.');

        const schemaPath = path.join(__dirname, '../docs/pb-schema.json');
        const schemaContent = fs.readFileSync(schemaPath, 'utf8');
        const schema = JSON.parse(schemaContent);

        // Map to store collection name -> ID
        const collectionMap = new Map();

        // Get 'users' collection ID first as it's likely referenced
        try {
            const usersCollection = await pb.collections.getOne('users');
            collectionMap.set('users', usersCollection.id);
            console.log(`Found 'users' collection: ${usersCollection.id}`);
        } catch (e) {
            console.warn("Could not find 'users' collection (it might not be created yet, which is unusual for system collection).");
        }

        for (const collectionDef of schema) {
            const { name, type, schema: fieldsDef } = collectionDef;
            
            console.log(`Processing collection: ${name}...`);

            // Prepare fields, resolving relation IDs and flattening options
            const fields = fieldsDef.map(field => {
                // Flatten options into the field object (for PB v0.23+)
                const { options, ...rest } = field;
                const newField = { ...rest, ...(options || {}) };
                
                // Handle relation fields
                if (newField.type === 'relation' && newField.collectionId) {
                    const targetName = newField.collectionId;
                    if (collectionMap.has(targetName)) {
                        newField.collectionId = collectionMap.get(targetName);
                        console.log(`  Resolved relation ${field.name} -> ${targetName} (${newField.collectionId})`);
                    } else {
                        console.warn(`  WARNING: Could not resolve relation ${field.name} -> ${targetName}. The target collection might not exist yet.`);
                    }
                }
                return newField;
            });

            try {
                // Check if collection exists
                try {
                    const existing = await pb.collections.getOne(name);
                    console.log(`  Collection '${name}' already exists (ID: ${existing.id}). Skipping creation.`);
                    collectionMap.set(name, existing.id);
                    
                    // Optional: Update fields if needed? 
                    // For now, let's just skip to avoid destructive changes unless requested.
                    // But if the relation IDs in the existing collection are wrong (e.g. from previous bad import), we might want to update.
                    // Let's just proceed.
                } catch (e) {
                    if (e.status === 404) {
                        // Create collection
                        console.log(`  Creating collection '${name}'...`);
                        const created = await pb.collections.create({
                            name,
                            type,
                            fields
                        });
                        console.log(`  Created '${name}' (ID: ${created.id})`);
                        collectionMap.set(name, created.id);
                    } else {
                        throw e;
                    }
                }
            } catch (err) {
                console.error(`  Error processing collection '${name}':`, err.message);
                if (err.data) console.error(JSON.stringify(err.data, null, 2));
            }
        }

        console.log('Done!');

    } catch (error) {
        console.error('Fatal Error:', error);
        process.exit(1);
    }
}

main();
