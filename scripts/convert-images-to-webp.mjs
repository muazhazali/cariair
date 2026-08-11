// One-off script: convert all non-webp images in public/images/db/ to .webp,
// delete originals, and update data/db.json image records (ext, mime_type, size_bytes).
// Run with: pnpm exec node scripts/convert-images-to-webp.mjs

import { promises as fs } from "fs"
import path from "path"
import sharp from "sharp"

const IMG_DIR = path.join(process.cwd(), "public", "images", "db")
const DB_PATH = path.join(process.cwd(), "data", "db.json")
const DB_BACKUP = path.join(process.cwd(), "data", "db.json.bak")

const CONVERTIBLE_EXTS = new Set(["jpg", "jpeg", "png", "gif", "bmp", "tiff"])

async function main() {
  const files = await fs.readdir(IMG_DIR)

  // Build a map of files by id (filename without extension is the id)
  const byId = new Map()
  const orphans = []
  for (const f of files) {
    const dot = f.lastIndexOf(".")
    if (dot === -1) continue
    const base = f.slice(0, dot)
    const ext = f.slice(dot + 1).toLowerCase()
    if (base.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      // uuid-named -> tracked by db.json
      if (!byId.has(base)) byId.set(base, [])
      byId.get(base).push({ ext, file: f })
    } else {
      orphans.push({ base, ext, file: f })
    }
  }

  // Read db.json
  const raw = await fs.readFile(DB_PATH, "utf8")
  const db = JSON.parse(raw)
  await fs.writeFile(DB_BACKUP, raw)
  console.log(`Backed up db.json -> ${DB_BACKUP}`)

  const images = Array.isArray(db.images) ? db.images : []
  const imagesById = new Map(images.map((i) => [i.id, i]))

  let converted = 0
  let updatedRecords = 0
  const errors = []

  // Convert uuid-named files
  for (const [id, entries] of byId) {
    // pick the non-webp file if present, else skip
    const target = entries.find((e) => CONVERTIBLE_EXTS.has(e.ext))
    if (!target) continue
    const srcPath = path.join(IMG_DIR, target.file)
    const destPath = path.join(IMG_DIR, `${id}.webp`)
    try {
      const info = await sharp(srcPath)
        .webp({ quality: 82 })
        .toFile(destPath)
      // remove original
      if (srcPath !== destPath) await fs.unlink(srcPath)
      converted++
      console.log(`Converted ${target.file} -> ${id}.webp (${info.size} bytes)`)

      // update db record if exists
      const rec = imagesById.get(id)
      if (rec) {
        rec.ext = "webp"
        rec.mime_type = "image/webp"
        rec.size_bytes = info.size
        updatedRecords++
      } else {
        console.warn(`  (no db record for ${id})`)
      }
    } catch (e) {
      errors.push({ file: target.file, error: String(e) })
    }
  }

  // Convert orphan files (not tracked by db.json) — keep them for reference
  for (const o of orphans) {
    if (!CONVERTIBLE_EXTS.has(o.ext)) continue
    const srcPath = path.join(IMG_DIR, o.file)
    const destPath = path.join(IMG_DIR, `${o.base}.webp`)
    try {
      const info = await sharp(srcPath)
        .webp({ quality: 82 })
        .toFile(destPath)
      if (srcPath !== destPath) await fs.unlink(srcPath)
      converted++
      console.log(`Converted orphan ${o.file} -> ${o.base}.webp (${info.size} bytes)`)
    } catch (e) {
      errors.push({ file: o.file, error: String(e) })
    }
  }

  // Write updated db.json (preserve 2-space indent)
  await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2) + "\n")
  console.log(`\nDone. Converted ${converted} files, updated ${updatedRecords} db records.`)
  if (errors.length) {
    console.error("\nErrors:")
    for (const e of errors) console.error(`  ${e.file}: ${e.error}`)
    process.exit(1)
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})