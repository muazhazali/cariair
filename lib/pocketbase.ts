import PocketBase from 'pocketbase';

// Use the environment variable or fallback to the provided URL
const pbUrl = process.env.NEXT_PUBLIC_POCKETBASE_URL || 'https://pb2.muaz.app';

export const pb = new PocketBase(pbUrl);

// Helper to check if user is logged in
export const isUserLoggedIn = () => {
  return pb.authStore.isValid;
};

// Helper to get current user
export const getCurrentUser = () => {
  return pb.authStore.model;
};

// Helper to logout
export const logout = () => {
  pb.authStore.clear();
};

// Helper to get image URL
export const getImageUrl = (record: any, filename: string) => {
  return `${pbUrl}/api/files/${record.collectionId}/${record.id}/${filename}`;
};
