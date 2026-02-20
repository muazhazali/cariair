import PocketBase from 'pocketbase';

const pbUrl = process.env.NEXT_PUBLIC_POCKETBASE_URL;
const email = process.env.POCKETBASE_ADMIN_EMAIL;
const password = process.env.POCKETBASE_ADMIN_PASSWORD;

if (!pbUrl || !email || !password) {
  console.error(
    'Error: NEXT_PUBLIC_POCKETBASE_URL, POCKETBASE_ADMIN_EMAIL, and POCKETBASE_ADMIN_PASSWORD must be set in .env'
  );
  process.exit(1);
}

const pb = new PocketBase(pbUrl);

async function main() {
  try {
    console.log('Authenticating as superadmin...');
    await pb.admins.authWithPassword(email, password);
    console.log('Authenticated.');

    const collections = ['brands', 'manufacturers', 'sources', 'products'];

    for (const name of collections) {
      console.log(`Updating rules for ${name}...`);
      try {
        const collection = await pb.collections.getOne(name);
        
        const updates = {};
        
        // Allow everyone to view (public)
        if (collection.listRule !== '') {
            updates.listRule = '';
            updates.viewRule = '';
        }

        // For products, allow authenticated create
        if (name === 'products') {
            updates.createRule = '@request.auth.id != ""';
            updates.updateRule = '@request.auth.id = submitted_by';
        }

        if (Object.keys(updates).length > 0) {
            await pb.collections.update(collection.id, updates);
            console.log(`Updated ${name} rules.`);
        } else {
            console.log(`${name} rules already set.`);
        }

      } catch (e) {
        console.error(`Error updating ${name}:`, e.message);
      }
    }

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
