// One-off script: attach brand-named orphan images in public/images/db/
// (e.g. cactus.webp, dasani.webp) to the corresponding brand's approved product(s)
// that currently have no image. Registers each file as an Image record in db.json
// and creates a productImages link.
//
// Run with: pnpm exec node scripts/attach-brand-images.mjs

import { promises as fs } from "fs"
import path from "path"

const IMG_DIR = path.join(process.cwd(), "public", "images", "db")
const DB_PATH = path.join(process.cwd(), "data", "db.json")
const DB_BACKUP = path.join(process.cwd(), "data", "db.json.bak2")

// Brand-name -> brand_id mapping (built from db.json at runtime).

function normalize(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "")
}

async function main() {
  const raw = await fs.readFile(DB_PATH, "utf8")
  const db = JSON.parse(raw)
  await fs.writeFile(DB_BACKUP, raw)
  console.log(`Backed up db.json -> ${DB_BACKUP}`)

  const brands = db.brands || []
  const products = db.products || []
  const existingImages = db.images || []
  const links = db.productImages || []

  // Build brand lookup by normalized name
  const brandByName = new Map()
  for (const b of brands) {
    brandByName.set(normalize(b.brand_name || ""), b)
    // Also map common variants
  }
  // Manual aliases for known brand-name file mismatches
  const ALIASES = {
    desa_mineral: "desa",
    le_minerale: "le_minerale",
    ice_mountain: "ice_mountain",
  }

  // Index existing image file basenames so we don't duplicate-register
  const existingByFilename = new Set(existingImages.map((i) => i.filename))
  const existingLinksByProduct = new Map()
  for (const l of links) {
    if (!existingLinksByProduct.has(l.product_id)) existingLinksByProduct.set(l.product_id, [])
    existingLinksByProduct.get(l.product_id).push(l)
  }

  const files = await fs.readdir(IMG_DIR)
  const orphanBrandFiles = files.filter(
    (f) => !f.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i) && f.endsWith(".webp")
  )

  let attached = 0
  const errors = []

  for (const file of orphanBrandFiles) {
    const base = file.replace(/\.webp$/i, "")
    const norm = normalize(base)
    let brand = brandByName.get(norm) || brandByName.get(ALIASES[norm] || norm)
    if (!brand) {
      // Try contains-match (e.g. "desa_mineral" contains "desa")
      for (const b of brands) {
        if (norm.includes(normalize(b.brand_name || "")) || normalize(b.brand_name || "").includes(norm)) {
          brand = b
          break
        }
      }
    }
    if (!brand) {
      errors.push({ file, error: `No brand match for "${base}"` })
      continue
    }

    // Find approved products for this brand, prefer ones with no image
    const brandProducts = products
      .filter((p) => p.brand_id === brand.id && p.status === "approved")
      .sort((a, b) => (a.product_name || "").localeCompare(b.product_name || ""))

    if (brandProducts.length === 0) {
      errors.push({ file, error: `Brand "${brand.brand_name}" has no approved products` })
      continue
    }

    const target = brandProducts.find((p) => {
      const ls = existingLinksByProduct.get(p.id) || []
      return ls.length === 0
    }) || brandProducts[0]

    const filePath = path.join(IMG_DIR, file)
    const stat = await fs.stat(filePath)
    const filename = file // keep brand name as filename

    // Register image record if not already present (by filename)
    let imgRecord = existingImages.find((i) => i.filename === filename)
    if (!imgRecord) {
      imgRecord = {
        id: crypto.randomUUID(),
        filename,
        mime_type: "image/webp",
        ext: "webp",
        size_bytes: stat.size,
        created_at: new Date().toISOString(),
      }
      db.images.push(imgRecord)
    }

    // Avoid duplicate link for this product+image
    const alreadyLinked = (links || []).some(
      (l) => l.product_id === target.id && l.image_id === imgRecord.id
    )
    if (!alreadyLinked) {
      db.productImages.push({
        product_id: target.id,
        image_id: imgRecord.id,
        sort_order: 0,
        created_at: new Date().toISOString(),
      })
      // Track so subsequent iterations see it
      if (!existingLinksByProduct.has(target.id)) existingLinksByProduct.set(target.id, [])
      existingLinksByProduct.get(target.id).push({ product_id: target.id, image_id: imgRecord.id })
    }

    attached++
    console.log(
      `Attached ${file} -> ${brand.brand_name} / "${target.product_name}" (${target.id})`
    )
  }

  await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2) + "\n")
  console.log(`\nDone. Attached ${attached} images.`)
  if (errors.length) {
    console.error("\nErrors:")
    for (const e of errors) console.error(`  ${e.file}: ${e.error}`)
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})