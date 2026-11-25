// One-time/occasional batch: fills German, French and Italian tour and blog
// fields from English with Lovable AI. Callable only with the project's
// LOVABLE_API_KEY (server-to-server); never runs on visits.
import { createClient } from "npm:@supabase/supabase-js@2";

const NAMES: Record<string, string> = { de: "German", fr: "French", it: "Italian" };
const TOUR_TEXT = ["title", "short_description", "category", "difficulty", "meeting_point_address", "meta_title", "meta_description"];
const TOUR_JSON = ["itinerary_json", "included_json", "highlights_json", "faq_json"];
const BLOG_TEXT = ["title", "excerpt", "content"];

async function translate(lang: string, payload: Record<string, unknown>) {
  const key = Deno.env.get("LOVABLE_API_KEY")!;
  for (let attempt = 0; attempt < 3; attempt++) {
    const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3.8-flash",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: `Translate every string value in this JSON from English to ${NAMES[lang]} for Tocorime Rio, a private tours company in Rio de Janeiro. Keep the same keys and structure, HTML tags, Markdown, URLs, emojis, numbers, icon names and proper names (Maracanã, Cristo Redentor, Pão de Açúcar, Pedra da Gávea, Rocinha, Tocorime Rio). Do not translate values of keys named "icon". Return only the JSON object.` },
          { role: "user", content: JSON.stringify(payload) },
        ],
      }),
    });
    if (r.ok) {
      const j = await r.json();
      const text = String(j.choices?.[0]?.message?.content ?? "").replace(/^```json\s*|```\s*$/g, "");
      try { return JSON.parse(text); } catch { /* retry */ }
    } else if (r.status !== 429 && r.status < 500) {
      throw new Error(`[${r.status}] ${await r.text()}`);
    }
    await new Promise((res) => setTimeout(res, 2000 * (attempt + 1)));
  }
  throw new Error("translation failed");
}

const filled = (v: unknown) => v !== null && v !== undefined && v !== "" && !(Array.isArray(v) && v.length === 0);

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  const auth = req.headers.get("Authorization")?.replace("Bearer ", "") ?? "";
  const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  let allowed = !!auth && auth === Deno.env.get("LOVABLE_API_KEY");
  if (!allowed && auth) {
    const { data: u } = await db.auth.getUser(auth);
    if (u?.user) {
      const { data: role } = await db.from("user_roles").select("role").eq("user_id", u.user.id).eq("role", "admin").maybeSingle();
      allowed = !!role;
    }
  }
  if (!allowed) return new Response("forbidden", { status: 403, headers: cors });
  const { table, lang, limit = 1, force = false, id } = await req.json();
  if (!NAMES[lang] || !["tours", "blog_posts"].includes(table)) return new Response("bad request", { status: 400, headers: cors });
  const fields = table === "tours" ? [...TOUR_TEXT, ...TOUR_JSON] : BLOG_TEXT;
  const active = table === "tours" ? "is_active" : "is_published";
  let q = db.from(table).select(`id,slug,title_${lang}`);
  q = id ? q.eq("id", id) : q.eq(active, true);
  const { data: rows, error } = await q.order("created_at") as unknown as { data: Record<string, unknown>[] | null; error: unknown };
  if (error) return new Response(JSON.stringify(error), { status: 500 });
  const todo = rows!.filter((r) => force || !!id || !filled(r[`title_${lang}`])).sort(() => Math.random() - 0.5).slice(0, limit);
  const done: string[] = [];
  for (const lite of todo) {
    const { data: row, error: re } = await db.from(table).select("*").eq("id", lite.id).single();
    if (re || !row) return new Response(JSON.stringify({ done, error: re }), { status: 500, headers: cors });
    const src: Record<string, unknown> = {};
    for (const f of fields) {
      const v = filled(row[`${f}_en`]) ? row[`${f}_en`] : row[f];
      if (filled(v)) src[f] = v;
    }
    const out = await translate(lang, src);
    const update: Record<string, unknown> = {};
    for (const f of Object.keys(src)) if (filled(out[f])) update[`${f}_${lang}`] = out[f];
    const { error: e } = await db.from(table).update(update).eq("id", row.id);
    if (e) return new Response(JSON.stringify({ done, error: e }), { status: 500 });
    done.push(row.slug || row.id);
  }
  const remaining = rows!.filter((r) => !filled(r[`title_${lang}`])).length - done.length;
  return new Response(JSON.stringify({ done, remaining }), { headers: { ...cors, "Content-Type": "application/json" } });
});
