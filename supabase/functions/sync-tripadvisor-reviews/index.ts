import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3";
import { authenticateCronRequest } from "../_shared/cron-auth.ts";
import { AIRBNB_URL, parseAirbnbReviews, parseViatorReviews, VIATOR_URL } from "../_shared/partnerReviews.ts";
import { MAX_STORED_REVIEWS, parseTripadvisorReviews, TRIPADVISOR_PAGE_URLS, TRIPADVISOR_URL, type TripadvisorReview } from "../_shared/tripadvisorReviews.ts";

const headers = { ...corsHeaders, "Content-Type": "application/json" };
Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const cronDenied = authenticateCronRequest(request);
  const dbUrl = Deno.env.get("SUPABASE_URL");
  const dbKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!dbUrl || !dbKey) return new Response(JSON.stringify({ error: "Server configuration error" }), { status: 500, headers });
  const db = createClient(dbUrl, dbKey);
  if (cronDenied) {
    const bearer = request.headers.get("Authorization")?.replace(/^Bearer\s+/i, "");
    if (!bearer) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers });
    const { data: identity, error: authError } = await db.auth.getUser(bearer);
    if (authError || !identity.user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers });
    const { data: role, error: roleError } = await db.from("user_roles").select("user_id").eq("user_id", identity.user.id).eq("role", "admin").limit(1).maybeSingle();
    if (roleError || !role) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers });
  }
  if (request.method !== "POST") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers });
  const parsed = z.object({}).strict().safeParse(await request.json().catch(() => null));
  if (!parsed.success) return new Response(JSON.stringify({ error: "Expected an empty JSON object" }), { status: 400, headers });
  const attemptedAt = new Date().toISOString();
  const { data: status } = await db.from("tripadvisor_sync_status").select("last_success_at").eq("id", "tocorime").maybeSingle();
  try {
    const key = Deno.env.get("FIRECRAWL_API_KEY");
    const gatewayKey = Deno.env.get("LOVABLE_API_KEY");
    if (!key || !gatewayKey) throw new Error("Firecrawl connection is unavailable");
    // Two fixed pages per week (10 reviews each), deterministic parsing and no
    // translation/AI requests. A failure on page 2 never erases page 1.
    const merged = new Map<string, TripadvisorReview>();
    let creditsUsed = 0;
    for (const pageUrl of TRIPADVISOR_PAGE_URLS) {
      const response = await fetch("https://connector-gateway.lovable.dev/firecrawl/v2/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${gatewayKey}`, "X-Connection-Api-Key": key },
        body: JSON.stringify({ url: pageUrl, formats: ["markdown"], maxAge: 0, waitFor: 2000 }),
        signal: AbortSignal.timeout(90000),
      });
      if (!response.ok) {
        const details = await response.text();
        console.error(`Firecrawl [${response.status}] ${pageUrl}: ${details}`);
        if (merged.size === 0) {
          await db.from("tripadvisor_sync_status").upsert({ id: "tocorime", last_attempt_at: attemptedAt, last_success_at: status?.last_success_at ?? null, last_error: `Firecrawl [${response.status}]: ${details}`.slice(0, 2000) });
          return new Response(JSON.stringify({ error: "Tripadvisor collection failed", status: response.status, details }), { status: response.status, headers });
        }
        break;
      }
      const data = await response.json();
      if (data.success !== true || typeof data.data?.markdown !== "string") throw new Error("Tripadvisor: resposta sem conteúdo válido");
      creditsUsed += data.data?.creditsUsed ?? data.creditsUsed ?? 0;
      try {
        for (const review of parseTripadvisorReviews(data.data.markdown)) merged.set(review.id, review);
      } catch (parseError) {
        if (merged.size === 0) throw parseError;
        console.error(`Tripadvisor page ignored: ${pageUrl}`, parseError);
      }
    }
    const tripadvisor = [...merged.values()]
      .sort((a, b) => (b.published_at ?? "").localeCompare(a.published_at ?? ""))
      .slice(0, MAX_STORED_REVIEWS);
    // Airbnb and Viator: 5 newest each. A failure keeps that site's previous reviews.
    const { data: previous } = await db.from("tripadvisor_review_snapshot").select("reviews").eq("id", "tocorime").maybeSingle();
    const previousReviews = (previous?.reviews ?? []) as TripadvisorReview[];
    const partners: TripadvisorReview[] = [];
    for (const [source, pageUrl, parse] of [["airbnb", AIRBNB_URL, parseAirbnbReviews], ["viator", VIATOR_URL, parseViatorReviews]] as const) {
      try {
        const response = await fetch("https://connector-gateway.lovable.dev/firecrawl/v2/scrape", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${gatewayKey}`, "X-Connection-Api-Key": key },
          body: JSON.stringify({ url: pageUrl, formats: ["markdown"], maxAge: 0, waitFor: 2000 }),
          signal: AbortSignal.timeout(90000),
        });
        if (!response.ok) throw new Error(`Firecrawl [${response.status}]: ${await response.text()}`);
        const data = await response.json();
        creditsUsed += data.data?.creditsUsed ?? data.creditsUsed ?? 0;
        partners.push(...parse(String(data.data?.markdown ?? "")));
      } catch (partnerError) {
        console.error(`${source} reviews kept from previous import:`, partnerError);
        partners.push(...previousReviews.filter((r) => r.source === source));
      }
    }
    const reviews = [...tripadvisor, ...partners]
      .sort((a, b) => (b.published_at ?? "").localeCompare(a.published_at ?? ""));
    const syncedAt = new Date().toISOString();
    const { error } = await db.from("tripadvisor_review_snapshot").upsert({ id: "tocorime", source_url: TRIPADVISOR_URL, reviews, synced_at: syncedAt });
    if (error) throw error;
    const { error: statusError } = await db.from("tripadvisor_sync_status").upsert({ id: "tocorime", last_attempt_at: attemptedAt, last_success_at: syncedAt, last_error: null });
    if (statusError) throw statusError;
    return new Response(JSON.stringify({ success: true, count: reviews.length, synced_at: syncedAt, credits_used: creditsUsed }), { headers });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Tripadvisor collection failed:", message);
    await db.from("tripadvisor_sync_status").upsert({ id: "tocorime", last_attempt_at: attemptedAt, last_success_at: status?.last_success_at ?? null, last_error: message.slice(0, 2000) });
    return new Response(JSON.stringify({ error: message }), { status: 502, headers });
  }
});