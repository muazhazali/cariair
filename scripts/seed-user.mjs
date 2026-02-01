import PocketBase from 'pocketbase';

const pbUrl = process.env.NEXT_PUBLIC_POCKETBASE_URL || 'https://pb2.muaz.app';
const email = process.env.POCKETBASE_ADMIN_EMAIL || 'tikushijo@gmail.com';
const password = process.env.POCKETBASE_ADMIN_PASSWORD || 'Muazoreo123!';

const pb = new PocketBase(pbUrl);

async function main() {
  try {
    console.log('Authenticating as superadmin...');
    await pb.admins.authWithPassword(email, password);
    console.log('Authenticated.');

    const email = 'test@gmail.com';
    const password = 'test1234'; // Min 8 chars required by PocketBase

    console.log(`Checking if user ${email} exists...`);
    
    let userId;
    try {
      const users = await pb.collection('users').getList(1, 1, {
        filter: `email = "${email}"`,
      });
      if (users.items.length > 0) {
        userId = users.items[0].id;
        console.log(`User ${email} found (ID: ${userId}).`);
      }
    } catch (e) {
      console.log('Error checking user (might not exist yet).');
    }

    if (userId) {
      console.log(`Updating password for ${email}...`);
      await pb.collection('users').update(userId, {
        password: password,
        passwordConfirm: password,
      });
      console.log('Password updated.');
    } else {
      console.log(`Creating user ${email}...`);
      await pb.collection('users').create({
        email: email,
        password: password,
        passwordConfirm: password,
        emailVisibility: true,
      });
      console.log('User created successfully.');
    }

  } catch (error) {
    console.error('Error:', error);
    if (error.response) {
      console.log(JSON.stringify(error.response, null, 2));
    }
    process.exit(1);
  }
}

main();
