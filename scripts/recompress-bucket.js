/**
 * recompress-bucket.js
 *
 * One-off / re-runnable maintenance script:
 * Downloads every image in the `site-images` Supabase Storage bucket,
 * recompresses it as WebP q=78 with sharp (no resize), and re-uploads it
 * with Cache-Control: public, max-age=31536000, immutable.
 *
 * Idempotent: skips files already smaller than the recompressed candidate.
 *
 * Required env vars:
 *   - SUPABASE_URL or VITE_SUPABASE_URL
 *   - SUPABASE_SERVICE_ROLE_KEY
 */
import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";

const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY env vars.");
  process.exit(1);
}

const BUCKET = "site-images";
const QUALITY = 65;
const supabase = createClient(url, key);

async function listAll() {
  const all = [];
  const PAGE = 1000;
  let offset = 0;
  while (true) {
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .list("", { limit: PAGE, offset, sortBy: { column: "name", order: "asc" } });
    if (error) throw error;
    if (!data || data.length === 0) break;
    all.push(...data.filter((f) => f.name && !f.name.endsWith("/")));
    if (data.length < PAGE) break;
    offset += PAGE;
  }
  return all;
}

function isImage(name) {
  return /\.(jpe?g|png|webp|avif|gif)$/i.test(name);
}

async function processOne(file) {
  const name = file.name;
  if (!isImage(name)) return { name, status: "skip-nonimage" };

  const { data: blob, error: dlErr } = await supabase.storage
    .from(BUCKET)
    .download(name);
  if (dlErr) return { name, status: "fail-download", error: dlErr.message };

  const srcBuf = Buffer.from(await blob.arrayBuffer());
  const srcSize = srcBuf.length;

  let outBuf;
  try {
    outBuf = await sharp(srcBuf, { failOn: "none" })
      .rotate()
      .webp({ quality: QUALITY, effort: 6, smartSubsample: true })
      .toBuffer();
  } catch (e) {
    return { name, status: "fail-encode", error: e.message };
  }

  const savings = srcSize - outBuf.length;
  const savingsPct = (savings / srcSize) * 100;

  // Only re-upload if we save at least 5% AND at least 5 KiB.
  if (savings < 5 * 1024 || savingsPct < 5) {
    // Still refresh cache header even if we don't recompress.
    const { error: upErr } = await supabase.storage
      .from(BUCKET)
      .update(name, srcBuf, {
        cacheControl: "31536000",
        upsert: true,
        contentType: blob.type || "image/webp",
      });
    return {
      name,
      status: upErr ? "fail-cache-refresh" : "cache-only",
      srcSize,
      error: upErr?.message,
    };
  }

  const { error: upErr } = await supabase.storage
    .from(BUCKET)
    .update(name, outBuf, {
      cacheControl: "31536000",
      upsert: true,
      contentType: "image/webp",
    });
  if (upErr) return { name, status: "fail-upload", error: upErr.message };

  return {
    name,
    status: "recompressed",
    srcSize,
    outSize: outBuf.length,
    savings,
    savingsPct,
  };
}

async function main() {
  console.log(`\n🗜  Recompressing bucket "${BUCKET}" (WebP q=${QUALITY}, no resize)…\n`);
  const files = await listAll();
  console.log(`Found ${files.length} files.\n`);

  let totalBefore = 0;
  let totalAfter = 0;
  let touched = 0;
  let cacheOnly = 0;
  let failed = 0;

  for (let i = 0; i < files.length; i++) {
    const r = await processOne(files[i]);
    const tag = `[${i + 1}/${files.length}]`;
    if (r.status === "recompressed") {
      totalBefore += r.srcSize;
      totalAfter += r.outSize;
      touched++;
      console.log(
        `${tag} ✅ ${r.name}  ${(r.srcSize / 1024).toFixed(0)}KB → ${(r.outSize / 1024).toFixed(0)}KB  (-${r.savingsPct.toFixed(1)}%)`,
      );
    } else if (r.status === "cache-only") {
      cacheOnly++;
      console.log(`${tag} 🪵 ${r.name}  cache refreshed (no recompress)`);
    } else if (r.status === "skip-nonimage") {
      console.log(`${tag} ⏭  ${r.name}  (not an image)`);
    } else {
      failed++;
      console.warn(`${tag} ❌ ${r.name}  ${r.status}: ${r.error || ""}`);
    }
  }

  console.log(
    `\n✨  Done. Recompressed ${touched}, cache-only ${cacheOnly}, failed ${failed}.`,
  );
  if (touched > 0) {
    const pct = ((totalBefore - totalAfter) / totalBefore) * 100;
    console.log(
      `Total saved: ${((totalBefore - totalAfter) / 1024 / 1024).toFixed(2)} MiB (${pct.toFixed(1)}%)\n`,
    );
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});