import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Helper to get image URL from image ID (client-safe)
export function getImageUrl(imageId: string | { id: string }, image?: { id: string }): string {
  if (typeof imageId === 'string') {
    return `/api/images/${imageId}`;
  }
  // Handle object form: getImageUrl(product, image)
  const id = image?.id || (imageId as { id: string }).id;
  return `/api/images/${id}`;
}
