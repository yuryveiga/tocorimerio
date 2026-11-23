import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { authenticateCronRequest } from "../_shared/cron-auth.ts";

// Weekly: finds new r/riodejaneiro questions about football tickets and emails
// the owner a ready reply to post manually. Never posts to Reddit.
const headers = { ...corsHeaders, "Content-Type": "application/json" };
const QUERY = 'site:reddit.com/r/riodejaneiro (maracana OR maracanã OR flamengo OR fluminense OR botafogo OR vasco) (ticket OR tickets OR game OR match)';
const REPLY = `Hi! Local guide here (disclosure: I run Tocorime Rio). Foreigners usually can't buy on the club sites because of CPF, facial recognition and PIX. Options: 1) a friend with CPF registers you (biometrics are personal, so it rarely works); 2) partner packages that include an official ticket. If you go solo, take the metro to Maracanã station, sit in the home sections and avoid away colours. Upcoming games: https://tocorimerio.com/maracana-calendario?utm_source=reddit&utm_medium=social`;
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));

// One small AI call per post (max 5/week); falls back to the fixed template.
async function draftReply(gw: string, title: string, question: string): Promise<string> {
  if (!question) return REPLY;
  try {
    const r = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${gw}` },
      body: JSON.stringify({
        model: "openai/gpt-6-astra",
        reasoning: { effort: "low" },
        max_output_tokens: 600,
        instructions: "You write a short, helpful Reddit comment (max 120 words, plain text, same language as the post) from a Rio local guide. Answer the actual question honestly first. Start with: 'Local guide here (disclosure: I run Tocorime Rio).' Mention once, at the end, this link: https://tocorimerio.com/maracana-calendario?utm_source=reddit&utm_medium=social . No hype, no invented prices or dates. Context: foreigners usually can't buy on club sites due to CPF, facial recognition and PIX; packages include an official ticket; best atmosphere is in home sections near organized fans; go by metro to Maracanã station.",
        input: `Title: ${title}\n\nPost: ${question}`,
      }),
      signal: AbortSignal.timeout(45000),
    });
    if (!r.ok) { console.error(`AI [${r.status}]: ${await r.text()}`); return REPLY; }
    const d = await r.json();
    const text = (d.output_text ?? d.output?.flatMap((o: any) => o.content ?? []).map((c: any) => c.text ?? "").join("") ?? "").trim();
    return text || REPLY;
  } catch (e) { console.error("AI error", e); return REPLY; }
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const denied = authenticateCronRequest(request);
  if (denied) return denied;
  const key = Deno.env.get("FIRECRAWL_API_KEY"), gw = Deno.env.get("LOVABLE_API_KEY"), resend = Deno.env.get("RESEND_API_KEY");
  if (!key || !gw || !resend) return new Response(JSON.stringify({ error: "Server configuration error" }), { status: 500, headers });
  const res = await fetch("https://connector-gateway.lovable.dev/firecrawl/v2/search", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${gw}`, "X-Connection-Api-Key": key },
    body: JSON.stringify({ query: QUERY, limit: 5, tbs: "qdr:w", scrapeOptions: { formats: ["markdown"], onlyMainContent: true } }),
    signal: AbortSignal.timeout(60000),
  });
  if (!res.ok) {
    const details = await res.text();
    console.error(`Firecrawl [${res.status}]: ${details}`);
    return new Response(JSON.stringify({ error: "Search failed", status: res.status, details }), { status: res.status, headers });
  }
  const data = await res.json();
  const posts = ((data.data?.web ?? []) as { url?: string; title?: string; description?: string; markdown?: string }[])
    .filter((p) => typeof p.url === "string" && /reddit\.com\/r\/riodejaneiro\/comments\//i.test(p.url));
  if (posts.length === 0) return new Response(JSON.stringify({ found: 0 }), { headers });
  const items: { url: string; title: string; question: string; reply: string }[] = [];
  for (const p of posts) {
    const question = (p.markdown || p.description || "").replace(/\s+/g, " ").trim().slice(0, 1500);
    items.push({ url: p.url!, title: p.title ?? p.url!, question, reply: await draftReply(gw, p.title ?? "", question) });
  }
  const html = `<h2>Perguntas novas no Reddit (r/riodejaneiro)</h2><p>Confira cada resposta e poste com a sua conta no link da pergunta.</p>
${items.map((i, n) => `<hr><h3>${n + 1}. <a href="${esc(i.url)}">${esc(i.title)}</a></h3><p><strong>Pergunta:</strong></p><blockquote style="border-left:3px solid #ccc;padding-left:10px;color:#444">${esc(i.question || "(abra o link para ler)")}</blockquote><p><strong>Resposta para copiar:</strong></p><pre style="white-space:pre-wrap;background:#f4f4f4;padding:10px">${esc(i.reply)}</pre>`).join("")}`;
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
