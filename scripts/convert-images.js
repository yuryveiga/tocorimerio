/**
 * convert-images.js
 * Converts local image assets (JPG/PNG) to WebP format without resizing.
 * Runs as part of the postbuild pipeline.
 *
 * Usage: node scripts/convert-images.js
 */

import sharp from "sharp";
import { existsSync, mkdirSync } from "fs";
import { resolve, dirname, basename, extname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

// ─── Targets ──────────────────────────────────────────────────────────────────
// Add any local image file here that should be converted.
// Output goes to the same folder with a .webp extension.
const TARGETS = [
  resolve(ROOT, "src/assets/maracana-hero.jpg"),
  resolve(ROOT, "src/assets/maracana-fans.jpg"),
  resolve(ROOT, "src/assets/rio-skyline.jpg"),
  resolve(ROOT, "src/assets/bolivar-crest.png"),
  resolve(ROOT, "public/maracana-hero.jpg"),
];

// ─── Conversion options ────────────────────────────────────────────────────────
const WEBP_QUALITY = 82; // 80–85 = visually lossless, ~40-55% smaller than JPG

async function convertToWebP(srcPath) {
  if (!existsSync(srcPath)) {
    console.log(`  ⚠  Skipping (not found): ${srcPath}`);
    return;
  }

  const ext = extname(srcPath);
  const destPath = srcPath.replace(new RegExp(`${ext}$`), ".webp");

  if (existsSync(destPath)) {
    console.log(`  ✓  Already exists: ${basename(destPath)}`);
    return;
  }

  try {
    await sharp(srcPath)
      .webp({ quality: WEBP_QUALITY, effort: 4 })
      .toFile(destPath);

    const { size: srcSize } = (await import("fs")).statSync(srcPath);
    const { size: destSize } = (await import("fs")).statSync(destPath);
    const savings = (((srcSize - destSize) / srcSize) * 100).toFixed(1);

    console.log(
      `  ✅  ${basename(srcPath)} → ${basename(destPath)}  (${(srcSize / 1024).toFixed(0)}KB → ${(destSize / 1024).toFixed(0)}KB, -${savings}%)`
    );
  } catch (err) {
    console.error(`  ❌  Failed: ${basename(srcPath)} — ${err.message}`);
  }
}

async function main() {
  console.log("\n🖼  Converting images to WebP (no resize)…\n");
  for (const target of TARGETS) {
    await convertToWebP(target);
  }
  console.log("\n✨  Done.\n");
}

main();
