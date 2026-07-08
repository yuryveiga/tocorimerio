// Recompress images in the `site-images` bucket to WebP.
// Batched: processes up to `limit` files per invocation starting from `offset`.
// Admin-only: requires an authenticated user with the `admin` role.

import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { encode as encodeWebp } from "npm:@jsquash/webp@1.4.0";
import { decode as decodeJpeg } from "npm:@jsquash/jpeg@1.5.0";
import { decode as decodePng } from "npm:@jsquash/png@3.1.0";
import decodeWebpFn from "npm:@jsquash/webp@1.4.0/decode";
import resize from "npm:@jsquash/resize@2.1.0";

const BUCKET = "site-images";
const BACKUP_PREFIX = "originals/";
const QUALITY = 72;
const MAX_DIMENSION = 1920;

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

function isImage(name: string) {
  return /\.(jpe?g|png|webp)$/i.test(name);
}

async function decodeAny(name: string, buf: ArrayBuffer): Promise<ImageData> {
  const ext = name.toLowerCase().split(".").pop();
  if (ext === "jpg" || ext === "jpeg") return await decodeJpeg(buf);
  if (ext === "png") return await decodePng(buf);
  if (ext === "webp") return await decodeWebpFn(buf);
  throw new Error("unsupported: " + ext);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    // ---- Auth: verify caller is an admin ----
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace(/^Bearer\s+/i, "");
    if (!token) return json({ error: "missing auth" }, 401);

    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData?.user) return json({ error: "unauthorized" }, 401);

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);
    const { data: isAdmin, error: roleErr } = await admin.rpc("has_role", {
      _user_id: userData.user.id,
      _role: "admin",
    });
    if (roleErr || !isAdmin) return json({ error: "forbidden" }, 403);

    // ---- Params ----
    const body = req.method === "POST" ? await req.json().catch(() => ({})) : {};
    const offset = Number(body.offset ?? 0);
    const limit = Math.min(Number(body.limit ?? 6), 12);

    // ---- List files ----
    const { data: files, error: listErr } = await admin.storage
      .from(BUCKET)
      .list("", { limit: 1000, offset: 0, sortBy: { column: "name", order: "asc" } });
    if (listErr) return json({ error: listErr.message }, 500);

    const candidates = (files ?? []).filter(
      (f) => f.name && !f.name.endsWith("/") && !f.name.startsWith(BACKUP_PREFIX) && isImage(f.name),
    );

    const total = candidates.length;
    const slice = candidates.slice(offset, offset + limit);
    const results: any[] = [];

    for (const file of slice) {
      const name = file.name;
      try {
        const { data: blob, error: dlErr } = await admin.storage.from(BUCKET).download(name);
        if (dlErr || !blob) {
          results.push({ name, status: "fail-download", error: dlErr?.message });
          continue;
        }
        const srcBuf = await blob.arrayBuffer();
        const srcSize = srcBuf.byteLength;

        // Backup original (idempotent) before destructive ops.
        const { data: existingBackup } = await admin.storage
          .from(BUCKET)
          .list(BACKUP_PREFIX, { limit: 1, search: name });
        if (!(existingBackup ?? []).find((f) => f.name === name)) {
          await admin.storage.from(BUCKET).upload(BACKUP_PREFIX + name, srcBuf, {
            cacheControl: "31536000",
            upsert: false,
            contentType: blob.type || "application/octet-stream",
          });
        }

        // Decode / resize / encode as WebP.
        let image = await decodeAny(name, srcBuf);
        const wasResized = image.width > MAX_DIMENSION || image.height > MAX_DIMENSION;
        if (wasResized) {
          const scale = MAX_DIMENSION / Math.max(image.width, image.height);
          image = await resize(image, {
            width: Math.round(image.width * scale),
            height: Math.round(image.height * scale),
          });
        }
        const outBuf = await encodeWebp(image, { quality: QUALITY });
        const outSize = outBuf.byteLength;
        const savings = srcSize - outSize;
        const savingsPct = (savings / srcSize) * 100;

        if (!wasResized && (savings < 5 * 1024 || savingsPct < 5)) {
          // Only refresh cache header.
          await admin.storage.from(BUCKET).update(name, srcBuf, {
            cacheControl: "31536000",
            upsert: true,
            contentType: blob.type || "image/webp",
          });
          results.push({ name, status: "cache-only", srcSize });
          continue;
        }

        const { error: upErr } = await admin.storage.from(BUCKET).update(name, outBuf, {
          cacheControl: "31536000",
          upsert: true,
          contentType: "image/webp",
        });
        if (upErr) {
          results.push({ name, status: "fail-upload", error: upErr.message });
          continue;
        }
        results.push({
          name,
          status: "recompressed",
          srcSize,
          outSize,
          savings,
          savingsPct: Math.round(savingsPct * 10) / 10,
          resized: wasResized,
        });
      } catch (e) {
        results.push({ name, status: "fail", error: (e as Error).message });
      }
    }

    const nextOffset = offset + slice.length;
    return json({
      total,
      processed: slice.length,
      offset,
      nextOffset,
      done: nextOffset >= total,
      results,
    });
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}