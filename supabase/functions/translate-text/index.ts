// Admin-only translation via Lovable AI. Replaces the rate-limited free Google endpoint.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const LANGS: Record<string, string> = {
  en: "English", es: "Spanish", pt: "Brazilian Portuguese",
  zh: "Simplified Chinese", "zh-CN": "Simplified Chinese", "zh-TW": "Traditional Chinese",
};
const PROTECTED = "Tocorime Rio, Favela Rio Tour, Rocinha, Pedra da Gávea, Angra dos Reis, Arraial do Cabo, Búzios, Petrópolis, Maracanã, Cristo Redentor, Pão de Açúcar, Pedra Bonita, Pedra do Telégrafo, Ipanema, Copacabana, Leblon, Lapa, Santa Marta, Marius";
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...cors, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const bearer = req.headers.get("Authorization")?.replace(/^Bearer\s+/i, "") || "";
  const { data: u } = bearer ? await supabase.auth.getUser(bearer) : { data: { user: null } };
  if (!u?.user) return json({ error: "Unauthorized" }, 401);
  const { data: role } = await supabase.from("user_roles").select("role").eq("user_id", u.user.id).eq("role", "admin").maybeSingle();
  if (!role) return json({ error: "Unauthorized" }, 401);

  const { text, target, source = "pt", html = false } = await req.json().catch(() => ({}));
  if (typeof text !== "string" || !text.trim()) return json({ text: "" });
  if (text.length > 60000 || !LANGS[target] || !LANGS[source]) return json({ error: "Invalid input" }, 400);

  const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "openai/gpt-6-astra",
      reasoning_effort: "low",
      messages: [
        { role: "system", content: `Translate from ${LANGS[source]} to ${LANGS[target]} for a Rio de Janeiro tourism website. Keep these names unchanged: ${PROTECTED}. ${html ? "Input is HTML: preserve every tag, attribute and URL exactly; translate only visible text." : "Preserve line breaks and emojis."} Output only the translation, no notes, no code fences.` },
        { role: "user", content: text },
      ],
    }),
  });
  if (!r.ok) return json({ error: `AI ${r.status}` }, r.status === 429 || r.status === 402 ? r.status : 502);
  const d = await r.json();
  let out: string = d?.choices?.[0]?.message?.content ?? "";
  out = out.replace(/^```(?:html)?\s*/i, "").replace(/\s*```$/, "").trim();
  return json({ text: out });
});
