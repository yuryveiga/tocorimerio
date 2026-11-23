import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { authenticateCronRequest } from "../_shared/cron-auth.ts";

// Weekly: finds new r/riodejaneiro questions about football tickets and emails
// the owner a ready reply to post manually. Never posts to Reddit.
const headers = { ...corsHeaders, "Content-Type": "application/json" };
const QUERY = 'site:reddit.com/r/riodejaneiro (maracana OR maracanã OR flamengo OR fluminense OR botafogo OR vasco) (ticket OR tickets OR game OR match)';
const REPLY = `Hi! Local guide here (disclosure: I run Tocorime Rio). Foreigners usually can't buy on the club sites because of CPF, facial recognition and PIX. Options: 1) a friend with CPF registers you (biometrics are personal, so it rarely works); 2) partner packages that include an official ticket. If you go solo, take the metro to Maracanã station, sit in the home sections and avoid away colours. Upcoming games: https://tocorimerio.com/maracana-calendario?utm_source=reddit&utm_medium=social`;
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const denied = authenticateCronRequest(request);
  if (denied) return denied;
  const key = Deno.env.get("FIRECRAWL_API_KEY"), gw = Deno.env.get("LOVABLE_API_KEY"), resend = Deno.env.get("RESEND_API_KEY");
  if (!key || !gw || !resend) return new Response(JSON.stringify({ error: "Server configuration error" }), { status: 500, headers });
  const res = await fetch("https://connector-gateway.lovable.dev/firecrawl/v2/search", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${gw}`, "X-Connection-Api-Key": key },
    body: JSON.stringify({ query: QUERY, limit: 10, tbs: "qdr:w" }),
    signal: AbortSignal.timeout(60000),
  });
  if (!res.ok) {
    const details = await res.text();
    console.error(`Firecrawl [${res.status}]: ${details}`);
    return new Response(JSON.stringify({ error: "Search failed", status: res.status, details }), { status: res.status, headers });
  }
  const data = await res.json();
  const posts = ((data.data?.web ?? []) as { url?: string; title?: string; description?: string }[])
    .filter((p) => typeof p.url === "string" && /reddit\.com\/r\/riodejaneiro\/comments\//i.test(p.url));
  if (posts.length === 0) return new Response(JSON.stringify({ found: 0 }), { headers });
  const html = `<h2>Perguntas novas no Reddit (r/riodejaneiro)</h2><p>Abra cada link, confira se a resposta faz sentido e poste com a sua conta.</p>
${posts.map((p) => `<p><a href="${esc(p.url!)}">${esc(p.title ?? p.url!)}</a><br><small>${esc(p.description ?? "")}</small></p>`).join("")}
<h3>Resposta sugerida (adapte à pergunta)</h3><pre style="white-space:pre-wrap">${esc(REPLY)}</pre>`;
  const mail = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${resend}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: "Tocorime Rio <reservas@tocorimerio.com>", to: ["tocorimeriotours@gmail.com"], subject: `Reddit: ${posts.length} pergunta(s) sobre jogos`, html }),
  });
  if (!mail.ok) {
    const details = await mail.text();
    console.error(`Resend [${mail.status}]: ${details}`);
    return new Response(JSON.stringify({ error: "Email failed", status: mail.status, details }), { status: mail.status, headers });
  }
  return new Response(JSON.stringify({ found: posts.length }), { headers });
});
