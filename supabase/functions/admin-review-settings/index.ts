import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3";
import { readReviewSettings, REVIEW_SETTINGS_KEY } from "../_shared/reviewSettings.ts";

const headers = { ...corsHeaders, "Content-Type": "application/json" };
const source = (max: number) => z.object({ enabled: z.boolean(), limit: z.number().int().min(1).max(max) }).strict();
const settingsSchema = z.object({ tripadvisor: source(16), airbnb: source(5), viator: source(5), google: source(5) }).strict();
const bodySchema = z.discriminatedUnion("action", [z.object({ action: z.literal("load") }).strict(), z.object({ action: z.literal("save"), settings: settingsSchema }).strict()]);
const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers });

Deno.serve(async request => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);
  const dbUrl = Deno.env.get("SUPABASE_URL");
  const dbKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!dbUrl || !dbKey) return json({ error: "Server configuration error" }, 500);
  const db = createClient(dbUrl, dbKey);
  try {
    const token = request.headers.get("Authorization")?.replace(/^Bearer\s+/i, "");
    if (!token) return json({ error: "Unauthorized" }, 401);
    const { data: identity, error: authError } = await db.auth.getUser(token);
    if (authError || !identity.user) return json({ error: "Unauthorized" }, 401);
    const { data: role, error: roleError } = await db.from("user_roles").select("user_id").eq("user_id", identity.user.id).eq("role", "admin").limit(1).maybeSingle();
    if (roleError || !role) return json({ error: "Forbidden" }, 403);
    const parsed = bodySchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return json({ error: "Configuração inválida", details: parsed.error.flatten() }, 400);
    if (parsed.data.action === "save") {
      // Google import is deliberately held until the declined connector is set up.
      if (parsed.data.settings.google.enabled) return json({ error: "A importação Google está pendente de conexão; nenhuma avaliação Google foi carregada." }, 409);
      const { error } = await db.from("site_settings").upsert({ key: REVIEW_SETTINGS_KEY, value: JSON.stringify(parsed.data.settings) }, { onConflict: "key" });
      if (error) throw error;
    }
    const [settingsResult, snapshotResult, statusResult] = await Promise.all([
      db.from("site_settings").select("value").eq("key", REVIEW_SETTINGS_KEY).maybeSingle(),
      db.from("tripadvisor_review_snapshot").select("reviews,synced_at").eq("id", "tocorime").maybeSingle(),
      db.from("tripadvisor_sync_status").select("last_attempt_at,last_success_at,last_error").eq("id", "tocorime").maybeSingle(),
    ]);
    for (const result of [settingsResult, snapshotResult, statusResult]) if (result.error) throw result.error;
    return json({ settings: readReviewSettings(settingsResult.data?.value), snapshot: snapshotResult.data, status: statusResult.data, google_status: "pending_connection" });
  } catch (error) {
    console.error("Review settings failed:", error);
    return json({ error: "Não foi possível carregar ou salvar as configurações de Reviews." }, 500);
  }
});