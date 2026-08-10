// ==========================================
// Image Operations (file-backed; metadata in JSON store)
// Binary files live in public/images/db/<id>.<ext>
// ==========================================

import { promises as fs } from "fs";
import path from "path";
import { getAll, findOne, insert, remove, write } from "@/lib/json-store";
import { Image } from "@/lib/types/db";

const IMG_DIR = path.join(process.cwd(), "public", "images", "db");

const MIME_TO_EXT: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/gif": "gif",
  "image/webp": "webp",
  "image/svg+xml": "svg",
  "image/bmp": "bmp",
  "image/tiff": "tiff",
};

function filePathFor(img: Image): string {
  return path.join(IMG_DIR, `${img.id}.${img.ext}`);
}

// Store image: writes file to disk + metadata row to JSON store.
export async function storeImage(
  filename: string,
  mimeType: string,
  data: Buffer
): Promise<Image> {
  const ext = MIME_TO_EXT[mimeType] || "bin";
  const record: Record<string, any> = {
    filename,
    mime_type: mimeType,
    ext,
    size_bytes: data.length,
  };
  const img = (await insert("images", record)) as Image;

  await fs.mkdir(IMG_DIR, { recursive: true });
  await fs.writeFile(filePathFor(img), data);
  return img;
}

// Get image metadata by ID
export async function getImageById(id: string): Promise<Image | null> {
  return findOne("images", (i) => i.id === id);
}

// Get image data (reads binary file from disk).
export async function getImageData(
  id: string
): Promise<{ data: Buffer; mimeType: string; filename: string } | null> {
  const img = (await findOne("images", (i) => i.id === id)) as Image | null;
  if (!img) return null;
  try {
    const data = await fs.readFile(filePathFor(img));
    return { data, mimeType: img.mime_type, filename: img.filename };
  } catch {
    return null;
  }
}

// Get images for a product (metadata only, ordered by sort_order).
export async function getProductImages(productId: string): Promise<Image[]> {
  const [allImages, links] = await Promise.all([
    getAll("images"),
    getAll("productImages"),
  ]);
  const linksForProduct = (links as any[])
    .filter((l) => l.product_id === productId)
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
  return linksForProduct
    .map((l) => (allImages as any[]).find((i) => i.id === l.image_id))
    .filter(Boolean) as Image[];
}

// Link image to product
export async function linkImageToProduct(
  productId: string,
  imageId: string,
  sortOrder: number = 0
): Promise<void> {
  await write((db) => {
    const exists = (db.productImages as any[]).some(
      (l) => l.product_id === productId && l.image_id === imageId
    );
    if (!exists) {
      db.productImages.push({
        product_id: productId,
        image_id: imageId,
        sort_order: sortOrder,
        created_at: new Date().toISOString(),
      });
    }
  });
}

// Unlink image from product
export async function unlinkImageFromProduct(
  productId: string,
  imageId: string
): Promise<void> {
  await remove(
    "productImages",
    (l) => l.product_id === productId && l.image_id === imageId
  );
}

// Delete image (unlink from products, rm file, remove metadata row).
export async function deleteImage(id: string): Promise<boolean> {
  const img = (await findOne("images", (i) => i.id === id)) as Image | null;
  if (!img) return false;
  await remove("productImages", (l) => l.image_id === id);
  await remove("images", (i) => i.id === id);
  try {
    await fs.unlink(filePathFor(img));
  } catch {
    // file may not exist; ignore
  }
  return true;
}

// Update image sort order
export async function updateImageSortOrder(
  productId: string,
  imageId: string,
  sortOrder: number
): Promise<void> {
  await write((db) => {
    const link = (db.productImages as any[]).find(
      (l) => l.product_id === productId && l.image_id === imageId
    );
    if (link) link.sort_order = sortOrder;
  });
}

// Get primary image for product
export async function getPrimaryProductImage(
  productId: string
): Promise<Image | null> {
  const imgs = await getProductImages(productId);
  return imgs[0] || null;
}