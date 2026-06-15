import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Helper to get image URL from image ID (client-safe)
// Supports multiple formats:
// - getImageUrl('uuid-string') - direct ID
// - getImageUrl({ id: 'uuid' }) - image object
// - getImageUrl(product, product.images[0]) - product + image object (legacy)
export function getImageUrl(
  imageId: string | { id?: string } | undefined,
  image?: { id?: string } | undefined
): string {
  // Handle undefined/null
  if (!imageId) {
    return '/placeholder.jpg';
  }

  // If first arg is a string, it's the image ID
  if (typeof imageId === 'string') {
    return `/api/images/${imageId}`;
  }

  // Handle object form - extract id from various possible locations
  // This handles: getImageUrl(product, imageObject) or getImageUrl(imageObject)
  const id = image?.id || imageId?.id;

  if (id) {
    return `/api/images/${id}`;
  }

  return '/placeholder.jpg';
}
