import Stripe from "https://esm.sh/stripe@13?target=deno";
import { createClient } from "npm:@supabase/supabase-js@2";

const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };
const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status, headers: { ...cors, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const bearer = req.headers.get("Authorization")?.replace(/^Bearer /, "");
    const { data: u } = bearer ? await db.auth.getUser(bearer) : { data: null };
    if (!u?.user) return json({ error: "Não autenticado" }, 401);
    const { data: roles } = await db.from("user_roles").select("role").eq("user_id", u.user.id).eq("role", "admin").limit(1);
    if (!roles?.length) return json({ error: "Apenas administradores" }, 403);

    const body = await req.json().catch(() => ({}));
    const method = body.method === "pix" ? "pix" : body.method === "card" ? "card" : null;
    const amount = Math.round(Number(body.amount) * 100);
    const desc = String(body.description || "Passeio Tocorime Rio").slice(0, 200);
    const name = String(body.customer_name || "").slice(0, 120);
    if (!method) return json({ error: "Modo de pagamento inválido" }, 400);
    if (!Number.isFinite(amount) || amount < 100 || amount > 10_000_000) return json({ error: "Valor cobrado inválido (mínimo R$ 1,00)" }, 400);

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2023-10-16" });
    const metadata = { origem: "financeiro", pax: name, tour: desc };

    if (method === "pix") {
      const pi = await stripe.paymentIntents.create({
        amount, currency: "brl", payment_method_types: ["pix"], description: `${desc} · ${name}`, metadata,
        payment_method_data: { type: "pix" } as never, confirm: true,
        payment_method_options: { pix: { expires_after_seconds: 86400 } } as never,
      });
      const qr = (pi.next_action as Record<string, any> | null)?.pix_display_qr_code;
      if (!qr) return json({ error: "O Stripe não devolveu o QR Code Pix." }, 502);
      return json({ type: "pix", id: pi.id, image: qr.image_url_png, code: qr.data, expires_at: qr.expires_at });
    }

    const price = await stripe.prices.create({ currency: "brl", unit_amount: amount, product_data: { name: `${desc}${name ? " · " + name : ""}`.slice(0, 250) } });
    const link = await stripe.paymentLinks.create({ line_items: [{ price: price.id, quantity: 1 }], payment_method_types: ["card"], metadata });
    return json({ type: "card", id: link.id, url: link.url });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erro";
    console.error("fin-stripe-charge", msg);
    return json({ error: /pix/i.test(msg) ? "Pix não está ativado na sua conta Stripe: " + msg : msg }, 400);
  }
});
