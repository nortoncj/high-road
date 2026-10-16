// Converts big PNG/JPGs to WebP, max 1600px wide.
// Usage: node scripts/optimize-images.mjs public/assets/img app/assets
import sharp from "sharp";
import { readdir, stat } from "node:fs/promises";
import path from "node:path";

const MAX_WIDTH = 1600;
const MIN_BYTES = 200 * 1024; // skip files already under 200 KB
const kb = (b) => `${Math.round(b / 1024)} KB`;

async function walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(file);
      continue;
    }
    if (!/\.(png|jpe?g)$/i.test(entry.name)) continue;

    const before = (await stat(file)).size;
    if (before < MIN_BYTES) continue;

    const out = file.replace(/\.(png|jpe?g)$/i, ".webp");
    await sharp(file)
      .resize({ width: MAX_WIDTH, withoutEnlargement: true })
      .webp({ quality: 78, effort: 6 })
      .toFile(out);

    console.log(`${file}  ${kb(before)} -> ${kb((await stat(out)).size)}`);
  }
}

for (const dir of process.argv.slice(2)) await walk(dir);
