/**
 * convert-fonts.js
 * Converts local TTF fonts to WOFF2 for self-hosting.
 * Eliminates the Google Fonts network round-trip from the critical path.
 *
 * Usage: node scripts/convert-fonts.js
 */

import { readFileSync, writeFileSync, existsSync, statSync } from "fs";
import { resolve, dirname, basename } from "path";
import { fileURLToPath } from "url";
import ttf2woff2 from "ttf2woff2";

const __dirname = dirname(fileURLToPath(import.meta.url));
const FONTS_DIR = resolve(__dirname, "../public/fonts");

const TTF_FILES = [
  "PlayfairDisplay-700.ttf",
  "Poppins-400.ttf",
  "Poppins-600.ttf",
];

async function main() {
  console.log("\n🔤  Converting TTF fonts to WOFF2…\n");

  for (const ttfFile of TTF_FILES) {
    const srcPath = resolve(FONTS_DIR, ttfFile);
    const destPath = srcPath.replace(/\.ttf$/, ".woff2");

    if (!existsSync(srcPath)) {
      console.log(`  ⚠  Skipping (not found): ${ttfFile}`);
      continue;
    }

    if (existsSync(destPath)) {
      console.log(`  ✓  Already exists: ${basename(destPath)}`);
      continue;
    }

    try {
      const input = readFileSync(srcPath);
      const output = ttf2woff2(input);
      writeFileSync(destPath, output);

      const srcSize = statSync(srcPath).size;
      const destSize = statSync(destPath).size;
      const savings = (((srcSize - destSize) / srcSize) * 100).toFixed(1);

      console.log(
        `  ✅  ${ttfFile} → ${basename(destPath)}  (${(srcSize / 1024).toFixed(0)}KB → ${(destSize / 1024).toFixed(0)}KB, -${savings}%)`
      );
    } catch (err) {
      console.error(`  ❌  Failed: ${ttfFile} — ${err.message}`);
    }
  }

  console.log("\n✨  Done.\n");
}

main();
