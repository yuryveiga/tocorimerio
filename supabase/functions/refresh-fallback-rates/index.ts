import { createClient } from "npm:@supabase/supabase-js@2";
import { authenticateCronRequest } from "../_shared/cron-auth.ts";

// Weekly job: stores the latest BRL-based rates as fallback for site and checkout.
Deno.serve(async (req) => {
  const denied = authenticateCronRequest(req);
  if (denied) return denied;
  try {
    const res = await fetch("https://open.er-api.com/v6/latest/BRL");
    if (!res.ok) throw new Error(`rates ${res.status}`);
    const data = await res.json();
    const r = data?.rates ?? {};
    const rates = { BRL: 1, USD: Number(r.USD), EUR: Number(r.EUR), CNY: Number(r.CNY) };
    if (![rates.USD, rates.EUR, rates.CNY].every((v) => Number.isFinite(v) && v > 0)) {
      throw new Error("invalid rates");
    }
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const value = JSON.stringify({ ...rates, updated_at: new Date().toISOString() });
    const { data: existing } = await supabase.from("site_settings").select("id").eq("key", "fallback_exchange_rates").maybeSingle();
    const { error } = existing
      ? await supabase.from("site_settings").update({ value, updated_at: new Date().toISOString() }).eq("id", existing.id)
      : await supabase.from("site_settings").insert({ key: "fallback_exchange_rates", value });
    if (error) throw error;
    return new Response(value, { headers: { "Content-Type": "application/json" } });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: String(e) }), { status: 500 });
  }
});
