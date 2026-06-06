import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@13?target=deno";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const CHECKOUT_FALLBACK_RATES: Record<string, number> = {
  brl: 1,
  usd: 0.18, // 1 USD ≈ R$ 5,55
  eur: 0.16, // 1 EUR ≈ R$ 6,25
};

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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { items, sale_ids, customer, currency = "brl", apply_fee = false } = await req.json();
    const targetCurrency = currency.toLowerCase();

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

    // Get current rate for the target currency
    let rate = CHECKOUT_FALLBACK_RATES[targetCurrency] || 1;
    if (targetCurrency !== 'brl') {
      const dynamicRates = await getExchangeRates();
      if (dynamicRates && dynamicRates[targetCurrency.toUpperCase()]) {
        rate = dynamicRates[targetCurrency.toUpperCase()];
        console.log(`Using dynamic rate for ${targetCurrency}: ${rate}`);
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
      const unitPrice = item.price_brl ? (item.price_brl * rate) : item.price;
      
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

    const lineItems = processedItems.map((item: any) => ({
      price_data: {
        currency: targetCurrency,
        product_data: {
          name: item.title,
          description: `${item.quantity} pessoa(s) - ${item.date} ${item.period}`,
        },
        unit_amount: Math.round(item.final_price * 100),
      },
      quantity: parseInt(item.quantity),
    }));

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
      success_url: `${origin}/confirmacao?sale_ids=${encodeURIComponent(JSON.stringify(sale_ids))}`,
      cancel_url: `${origin}/carrinho?canceled=true`,
      customer_email: customer?.email,
      metadata: metadata,
    });

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
