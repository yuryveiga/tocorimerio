/**
 * inline-critical-css.js
 *
 * Runs after prerender. For every dist/**\/*.html, extracts the CSS rules
 * actually used by that HTML and inlines them in <style>, then defers the
 * full CSS file with rel="preload" + onload swap. This removes the
 * render-blocking CSS request from the critical path (LCP/FCP win).
 *
 * Uses Beasties (maintained fork of Critters).
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Beasties from "beasties";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.resolve(__dirname, "../dist");

async function walk(dir) {
  const out = [];
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(full)));
    else if (entry.isFile() && entry.name.endsWith(".html")) out.push(full);
  }
  return out;
}

async function main() {
  console.log("\n🎨  Inlining critical CSS into prerendered HTML…\n");

  const beasties = new Beasties({
    path: distPath,
    publicPath: "/",
    // swap-high: non-blocking preload + fetchpriority=high on the deferred sheet
    preload: "swap-high",
    pruneSource: false,
    inlineFonts: false,
    fonts: false,
    compress: true,
    // Only inline keyframes whose names appear in the critical CSS
    keyframes: "critical",
    // Drop inline <style> rules already covered by external CSS
    reduceInlineStyles: true,
    mergeStylesheets: true,
    logLevel: "warn",
  });

  const files = await walk(distPath);
  let ok = 0;
  let fail = 0;

  for (const file of files) {
    try {
      const html = await fs.readFile(file, "utf8");
      const processed = await beasties.process(html);
      await fs.writeFile(file, processed);
      ok++;
    } catch (err) {
      fail++;
      console.warn(`  ⚠ ${path.relative(distPath, file)}: ${err.message}`);
    }
  }

  console.log(`\n✨  Inlined critical CSS in ${ok} files (${fail} skipped).\n`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});