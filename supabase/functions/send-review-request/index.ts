// One-off Tripadvisor review request to paying customers. Admin-only; "test" sends a sample to the owner.
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";

const OWNER = "tocorimeriotours@gmail.com";
const LINK = "https://www.tripadvisor.com/UserReviewEdit-g303506-d25363992";
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
const headers = { ...corsHeaders, "Content-Type": "application/json" };
const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status, headers });

function html(first: string, tour: string) {
  const n = esc(first), t = esc(tour);
  const btn = (label: string) => `<p style="text-align:center;margin:20px 0"><a href="${LINK}" style="background:#1f7a4d;color:#ffffff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold">${label}</a></p>`;
  return `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#222;line-height:1.5">
<h2 style="color:#1f7a4d">Tocorime Rio</h2>
<p>Hi ${n},</p><p>Thank you for booking <strong>${t}</strong> with Tocorime Rio!</p>
<p>If you have a minute, an honest review on Tripadvisor helps other travelers find us and means a lot to our small team.</p>${btn("Leave a review")}
<hr style="border:none;border-top:1px solid #ddd">
<p>Olá ${n}, obrigado por reservar <strong>${t}</strong> com a Tocorime Rio! Se puder, deixe uma avaliação sincera no Tripadvisor — ajuda muito nossa pequena equipe.</p>${btn("Avaliar no Tripadvisor")}
<hr style="border:none;border-top:1px solid #ddd">
<p>Hola ${n}, ¡gracias por reservar <strong>${t}</strong> con Tocorime Rio! Si tienes un minuto, una reseña sincera en Tripadvisor nos ayuda muchísimo.</p>${btn("Dejar una reseña")}
<p>Obrigado / Thank you / Gracias,<br>Marius – Tocorime Rio</p></div>`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const url = Deno.env.get("SUPABASE_URL")!, svc = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, resend = Deno.env.get("RESEND_API_KEY");
  if (!resend) return json({ error: "Server configuration error" }, 500);
  const token = (req.headers.get("authorization") ?? "").replace(/^Bearer /, "");
  const db = createClient(url, svc);
  const { data: u } = await db.auth.getUser(token);
  if (!u?.user) return json({ error: "Unauthorized" }, 401);
  const { data: role } = await db.from("user_roles").select("role").eq("user_id", u.user.id).eq("role", "admin").maybeSingle();
  if (!role) return json({ error: "Forbidden" }, 403);
  const mode = (await req.json().catch(() => ({}))).mode;
  if (mode !== "test" && mode !== "all") return json({ error: "mode must be test or all" }, 400);

  const { data: sales, error } = await db.from("sales").select("customer_name, customer_email, tour_title, created_at")
    .eq("is_paid", true).or("is_cancelled.is.null,is_cancelled.eq.false").like("customer_email", "%@%").order("created_at", { ascending: false });
  if (error) return json({ error: error.message }, 500);
  const seen = new Map<string, { name: string; tour: string }>();
  for (const s of sales ?? []) {
    const e = s.customer_email.trim().toLowerCase();
    if (!seen.has(e)) seen.set(e, { name: (s.customer_name || "").trim().split(/\s+/)[0] || "there", tour: s.tour_title || "your experience" });
  }
  const list = mode === "test" ? [[OWNER, [...seen.values()][0] ?? { name: "Marius", tour: "Maracanã Matchday" }] as const] : [...seen.entries()];
  const results: { to: string; ok: boolean; status: number }[] = [];
  for (const [to, v] of list) {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${resend}`, "Content-Type": "application/json", ...(mode === "all" ? { "Idempotency-Key": `tripadvisor-review-2026-11-${to}` } : {}) },
      body: JSON.stringify({ from: "Tocorime Rio <reservas@tocorimerio.com>", reply_to: OWNER, to: [to], subject: `${mode === "test" ? "[TESTE] " : ""}How was your experience with Tocorime Rio?`, html: html(v.name, v.tour) }),
    });
    if (!r.ok) console.error(`Resend [${r.status}]: ${await r.text()}`);
    results.push({ to: mode === "test" ? to : to.replace(/^(.).*@/, "$1***@"), ok: r.ok, status: r.status });
  }
  return json({ mode, sent: results.filter((r) => r.ok).length, total: results.length, results });
});
