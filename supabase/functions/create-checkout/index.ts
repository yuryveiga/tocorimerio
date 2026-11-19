import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@13?target=deno";
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Last-resort rates; normally replaced by the weekly stored fallback.
const CHECKOUT_FALLBACK_RATES: Record<string, number> = {
  brl: 1,
  usd: 0.172, // 1 USD ≈ R$ 5,81
  eur: 0.157, // 1 EUR ≈ R$ 6,38
  cny: 1.23,
};

async function getStoredFallbackRates(): Promise<Record<string, number> | null> {
  try {
    const client = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data } = await client.from("site_settings").select("value").eq("key", "fallback_exchange_rates").maybeSingle();
    return data?.value ? JSON.parse(data.value) : null;
  } catch {
    return null;
  }
}

async function getExchangeRates() {
  try {
    const response = await fetch('https://open.er-api.com/v6/latest/BRL');
    if (!response.ok) throw new Error('Failed to fetch rates');
    const data = await response.json();
    return data.rates;
  } catch (error) {
    console.error('Error fetching dynamic rates for checkout, using fallbacks:', error);
    return null;
  }
}

const PARTNER_URL = "https://mwxbskzggzznxvkwgrnz.supabase.co";
const PARTNER_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13eGJza3pnZ3p6bnh2a3dncm56Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzNjE5OTUsImV4cCI6MjA4ODkzNzk5NX0.EFfaaN79uifOMgFdIZlQ5C8c-HQH-YodNGWf0MEcf9o";
const num = (v: unknown) => { const n = Number(v); return Number.isFinite(n) ? n : 0; };

// Per-person BRL prices the public catalogue allows for this tour and group size.
function allowedTourPrices(tour: any, quantity: number): number[] {
  let base = 0;
  const baseP = num(tour.price);
  if (tour.pricing_model === "tiered") {
    const tiers = [...(tour.tiered_pricing_json || [])].sort((a: any, b: any) => num(a.min_people) - num(b.min_people));
    const hit = tiers.find((t: any) => quantity >= num(t.min_people) && quantity <= (t.max_people == null ? Infinity : num(t.max_people)));
    base = num((hit || tiers[tiers.length - 1])?.price_per_person);
  } else if (tour.pricing_model === "dynamic") {
    base = quantity === 1 ? num(tour.price_1_person) : quantity === 2 ? num(tour.price_2_people)
      : quantity <= 6 ? num(tour.price_3_6_people) : num(tour.price_7_19_people);
  } else if (tour.pricing_model === "group") {
    base = baseP / quantity;
  } else if (tour.pricing_model === "custom") {
    return [];
  } else {
    base = baseP;
  }
  const options = Array.isArray(tour.custom_options_json) && tour.use_custom_options ? tour.custom_options_json : [];
  const prices = options.length ? options.map((o: any) => base + num(o.price)) : [base];
  return prices.filter((p: number) => p > 0);
}

async function allowedMatchPrices(matchId: string): Promise<number[]> {
  if (!/^[0-9a-f-]{36}$/i.test(matchId)) return [];
  const h = { apikey: PARTNER_ANON_KEY, Authorization: `Bearer ${PARTNER_ANON_KEY}` };
  const [mRes, pRes] = await Promise.all([
    fetch(`${PARTNER_URL}/rest/v1/matches?id=eq.${matchId}&select=*`, { headers: h }),
    fetch(`${PARTNER_URL}/rest/v1/match_packages?match_id=eq.${matchId}&is_active=eq.true&select=price_brl`, { headers: h }),
  ]);
  if (!mRes.ok) return [];
  const [m] = await mRes.json();
  if (!m) return [];
  const packages = pRes.ok ? (await pRes.json()).map((x: any) => num(x?.price_brl)) : [];
  const sectors = Array.isArray(m.sectors_json) ? m.sectors_json.map((x: any) => num(x?.price)) : [];
  return [num(m.price), num(m.price_premium), ...sectors, ...packages].filter((p) => p > 0);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { items, sale_ids, customer, currency = "brl", apply_fee = false } = await req.json();
    const targetCurrency = String(currency).toLowerCase();
    if (!['brl', 'usd', 'eur', 'cny'].includes(targetCurrency)) {
      return new Response(JSON.stringify({ error: "Moeda inválida" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      throw new Error("Stripe API key not configured");
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: "2023-10-16",
    });

    if (!items || items.length === 0) {
      return new Response(
        JSON.stringify({ error: "Carrinho vazio" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const databaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const db = createClient(databaseUrl, serviceKey);
    let verifiedAdmin = false;
    const bearer = req.headers.get('Authorization')?.replace(/^Bearer /, '');
    if (bearer) {
      const { data: user } = await db.auth.getUser(bearer);
      if (user?.user) {
        const { data: admin } = await db.rpc('has_role', { _user_id: user.user.id, _role: 'admin' });
        verifiedAdmin = admin === true;
      }
    }

    const reject = (msg: string) => new Response(JSON.stringify({ error: msg }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

    // Public checkouts: every charged price comes from the server-side catalogue,
    // bound to an unpaid reservation owned by the same customer email.
    if (!verifiedAdmin) {
      if (!Array.isArray(items) || !Array.isArray(sale_ids) || items.length !== sale_ids.length || items.length > 20) return reject("Checkout inválido");
      const email = String(customer?.email || '').trim().toLowerCase();
      if (!email) return reject("Checkout inválido");
      const { data: sales } = await db.from('sales').select('id,tour_id,tour_title,quantity,provider,customer_email,is_paid,is_cancelled').in('id', sale_ids);
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const sale = sales?.find((x: any) => x.id === sale_ids[i]);
        const qty = Number(item.quantity);
        if (!sale || sale.is_paid || sale.is_cancelled || String(sale.customer_email).toLowerCase() !== email
          || !Number.isInteger(qty) || qty < 1 || qty > 100 || qty !== Number(sale.quantity)) return reject("Reserva inválida");
        const priceBrl = num(item.price_brl);
        if (sale.provider === 'matchday') {
          const allowed = await allowedMatchPrices(String(sale.tour_id));
          if (!allowed.some((p) => Math.abs(p - priceBrl) < 0.01)) return reject("Preço inválido");
        } else {
          const { data: tour } = await db.from('tours').select('*').eq('id', sale.tour_id).eq('is_active', true).maybeSingle();
          const allowed = tour ? allowedTourPrices(tour, qty) : [];
          if (!allowed.some((p) => Math.abs(p - priceBrl) < 0.01)) return reject("Preço inválido");
        }
        items[i] = { ...item, price: undefined, price_brl: priceBrl, quantity: qty, title: String(sale.tour_title || item.title || 'Reserva').slice(0, 250) };
      }
    }

    // Get current rate for the target currency
    let rate = CHECKOUT_FALLBACK_RATES[targetCurrency] || 1;
    if (targetCurrency !== 'brl') {
      const dynamicRates = await getExchangeRates();
      if (dynamicRates && dynamicRates[targetCurrency.toUpperCase()]) {
        rate = dynamicRates[targetCurrency.toUpperCase()];
        console.log(`Using dynamic rate for ${targetCurrency}: ${rate}`);
      } else if ((await getStoredFallbackRates())?.[targetCurrency.toUpperCase()]) {
        rate = (await getStoredFallbackRates())![targetCurrency.toUpperCase()];
        console.log(`Using weekly stored fallback rate for ${targetCurrency}: ${rate}`);
      } else {
        console.log(`Using fallback rate for ${targetCurrency}: ${rate}`);
      }
    }

    const origin = req.headers.get("origin") || req.headers.get("referer")?.replace(/\/$/, "") || "https://tocorimerio.lovable.app";

    console.log(`Processing checkout in ${targetCurrency} with rate ${rate}`);
    
    // We expect items[].price to be the base price in BRL
    // The frontend should pass the BRL price to ensure backend controls the conversion
    const processedItems = items.map((item: any) => {
      // If the price seems to be already converted (very low compared to BRL), we might need to be careful.
      // But according to the new plan, we'll ensure the price used for Stripe is:
      // original_brl_price * backend_rate
      
      // Note: If the frontend already sent a converted price, this might double-convert.
      // We need to decide if we trust the frontend price or recalculate.
      // Given the user request, the backend should "operate with the standard" if API is down.
      
      // Let's assume for now the frontend passes the price it wants to charge, 
      // but we will apply the rate logic if we have the BRL price.
      const unitPrice = item.price_brl ? (item.price_brl * rate) : Number(item.price);
      
      return {
        ...item,
        final_price: unitPrice
      };
    });

    // Calculate totals in cents for better precision
    const subtotalCents = processedItems.reduce((acc: number, item: any) => {
      return acc + Math.round(item.final_price * 100 * item.quantity);
    }, 0);
    
    const feeCents = apply_fee ? Math.round(subtotalCents * 0.05) : 0;
    const totalCents = subtotalCents + feeCents;

    console.log(`Subtotal: ${subtotalCents} cents, Fee: ${feeCents} cents, Total: ${totalCents} cents`);

    // Internal period keys that should not be shown to the customer on Stripe
    const INTERNAL_PERIODS = new Set(['morning', 'afternoon', 'night', 'match_time']);

    const lineItems = processedItems.map((item: any) => {
      const showPeriod = item.period && !INTERNAL_PERIODS.has(item.period);
      const description = showPeriod
        ? `${item.quantity} pessoa(s) - ${item.date} · ${item.period}`
        : `${item.quantity} pessoa(s) - ${item.date}`;

      return {
        price_data: {
          currency: targetCurrency,
          product_data: {
            name: item.title,
            description,
          },
          unit_amount: Math.round(item.final_price * 100),
        },
        quantity: parseInt(item.quantity),
      };
    });

    // Add 5% Service Fee
    if (feeCents > 0) {
      lineItems.push({
        price_data: {
          currency: targetCurrency,
          product_data: {
            name: "Taxa de Serviço (5%)",
            description: "Taxa de reserva e processamento",
          },
          unit_amount: feeCents,
        },
        quantity: 1,
      });
    }

    // Metadata for attribution
    const metadata: any = {
      sale_ids: JSON.stringify(sale_ids || []),
      source_platform: "Tocorime Rio",
      attribution_origin: "https://tocorime.com.br",
      total_with_fee_cents: totalCents.toString(),
      exchange_rate: rate.toString()
    };

    if (customer?.email) metadata.customer_email = customer.email;
    if (customer?.whatsapp) metadata.customer_phone = customer.whatsapp;

    const session = await stripe.checkout.sessions.create({
      line_items: lineItems,
      mode: "payment",
      success_url: `${origin}/confirmacao?sale_ids=${encodeURIComponent(JSON.stringify(sale_ids))}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/carrinho?canceled=true`,
      customer_email: customer?.email,
      metadata: metadata,
    });

    // Register only server-created Stripe sessions; due time is based on the pending sale's creation.
    if (Array.isArray(sale_ids) && sale_ids.length) {
      if (customer?.email || verifiedAdmin) {
        const { error: scheduleError } = await db.rpc('enqueue_pending_stripe_check', {
          _session_id: session.id, _sale_ids: sale_ids, _customer_email: verifiedAdmin ? null : customer.email,
        });
        if (scheduleError) console.error('Could not schedule delayed Stripe check:', scheduleError.code);
      }
    }

    return new Response(
      JSON.stringify({ url: session.url }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Checkout error:", error?.message);
    return new Response(
      JSON.stringify({ error: error?.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
