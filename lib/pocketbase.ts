import PocketBase from 'pocketbase';

// Lazy singleton: URL is read on first use (at request time on server), not at module load.
// This fixes Vercel 404s where env was undefined at load time (e.g. build before env was set).
let _pb: PocketBase | null = null;

function getPbUrl(): string {
  const pbUrl = process.env.NEXT_PUBLIC_POCKETBASE_URL;
  if (!pbUrl) {
    throw new Error('Missing NEXT_PUBLIC_POCKETBASE_URL environment variable');
  }
  return pbUrl;
}

function getPb(): PocketBase {
  if (!_pb) {
    _pb = new PocketBase(getPbUrl());
  }
  return _pb;
}

// Lazy proxy so existing code using `pb` keeps working; first access initializes with current env.
export const pb = new Proxy({} as PocketBase, {
  get(_, prop) {
    return (getPb() as unknown as Record<string, unknown>)[prop as string];
  },
});

// Helper to check if user is logged in
export const isUserLoggedIn = () => {
  return getPb().authStore.isValid;
};

// Helper to get current user
export const getCurrentUser = () => {
  return getPb().authStore.model;
};

// Helper to logout
export const logout = () => {
  getPb().authStore.clear();
};

// Helper to get image URL (uses same base URL as client)
export const getImageUrl = (record: any, filename: string) => {
  return `${getPbUrl()}/api/files/${record.collectionId}/${record.id}/${filename}`;
};
