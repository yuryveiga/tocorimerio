import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@13?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ---- Google Calendar JWT Auth (Deno-compatible) ----

function base64url(data: Uint8Array): string {
  let binary = "";
  for (const byte of data) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64urlStr(str: string): string {
  return base64url(new TextEncoder().encode(str));
}

function base64ToUint8Array(b64: string): Uint8Array {
  const cleaned = b64.replace(/[^A-Za-z0-9+/]/g, "");
  const pad = cleaned.length % 4;
  const padded = pad ? cleaned + "=".repeat(4 - pad) : cleaned;
  const binString = atob(padded);
  const bytes = new Uint8Array(binString.length);
  for (let i = 0; i < binString.length; i++) {
    bytes[i] = binString.charCodeAt(i);
  }
  return bytes;
}

async function importPrivateKey(pem: string): Promise<CryptoKey> {
  const pemContents = pem
    .replace(/-----BEGIN (?:RSA )?PRIVATE KEY-----/g, "")
    .replace(/-----END (?:RSA )?PRIVATE KEY-----/g, "");
  const binaryDer = base64ToUint8Array(pemContents);
  return crypto.subtle.importKey(
    "pkcs8",
    binaryDer.buffer as ArrayBuffer,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );
}

async function createGoogleJWT(email: string, key: string, scopes: string[]): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = base64urlStr(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = base64urlStr(JSON.stringify({
    iss: email,
    sub: email,
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
    scope: scopes.join(" "),
  }));
  const signingInput = `${header}.${payload}`;
  const privateKey = await importPrivateKey(key);
  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    privateKey,
    new TextEncoder().encode(signingInput)
  );
  return `${signingInput}.${base64url(new Uint8Array(signature))}`;
}

async function getAccessToken(email: string, key: string): Promise<string> {
  const jwt = await createGoogleJWT(email, key, [
    "https://www.googleapis.com/auth/calendar.events",
  ]);
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });
  if (!res.ok) throw new Error(`Token exchange failed: ${await res.text()}`);
  const data = await res.json();
  return data.access_token;
}

// ---- WhatsApp Alert ----


// ---- Email Alert ----

async function sendEmailAlert(sale: Record<string, any>, supabaseUrl: string, isCustomer = false) {
  try {
    const DEFAULT_ADMIN_EMAIL = "tocorimeriotours@gmail.com, veiga.yury@gmail.com";
    const rawAdminEmail = Deno.env.get("ADMIN_EMAIL") || "";
    // Guard against a misconfigured ADMIN_EMAIL secret (e.g. an API key pasted by mistake)
    const adminEmail = rawAdminEmail.includes("@") ? rawAdminEmail : DEFAULT_ADMIN_EMAIL;
    const to = isCustomer ? sale.customer_email : adminEmail;
    const replyTo = isCustomer ? "tocorimeriotours@gmail.com" : undefined;
    
    const res = await fetch(`${supabaseUrl}/functions/v1/send-alert-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}`,
      },
      body: JSON.stringify({
        to: to,
        customerName: sale.customer_name,
        customerEmail: sale.customer_email,
        customerPhone: sale.customer_phone,
        total: sale.total_price,
        isCustomerCopy: isCustomer,
        selectedPeriod: sale.selected_period,
        isPrivate: sale.is_private,
        replyTo: replyTo,
        items: [{
          tour: sale.tour_title,
          quantity: sale.quantity,
          price: sale.total_price / (sale.quantity || 1),
          date: sale.selected_date
        }]
      }),
    });

    if (!res.ok) {
      console.error("Email alert failed:", await res.text());
    } else {
      console.log("Email alert sent successfully for sale:", sale.id);
    }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("Email alert error:", msg);
  }
}

// ---- Google Calendar Event Creation ----

async function createGoogleCalendarEvent(sale: Record<string, any>) {
  const GOOGLE_EMAIL = Deno.env.get("GOOGLE_SERVICE_ACCOUNT_EMAIL");
  const GOOGLE_KEY = Deno.env.get("GOOGLE_PRIVATE_KEY")?.replace(/\\n/g, "\n");
  const CALENDAR_ID = Deno.env.get("GOOGLE_CALENDAR_ID");

  if (!GOOGLE_EMAIL || !GOOGLE_KEY || !CALENDAR_ID) {
    console.warn("Google Calendar credentials missing. Skipping event creation.");
    return;
  }

  try {
    const token = await getAccessToken(GOOGLE_EMAIL, GOOGLE_KEY);

    const startDate = new Date(sale.selected_date);
    if (sale.selected_period === "Manhã") startDate.setHours(9, 0, 0);
    else if (sale.selected_period === "Tarde") startDate.setHours(14, 0, 0);
    else if (sale.selected_period === "Noite") startDate.setHours(19, 0, 0);
    else startDate.setHours(10, 0, 0);

    const endDate = new Date(startDate);
    endDate.setHours(startDate.getHours() + 4);

    const event = {
      summary: `Reserva do Site Tocorime: ${sale.tour_title} - ${sale.customer_name}`,
      description: `Cliente: ${sale.customer_name}\nEmail: ${sale.customer_email}\nTelefone: ${sale.customer_phone || 'Não informado'}\nPessoas: ${sale.quantity}\nTipo: ${sale.is_private ? 'Privativo' : 'Grupo Aberto'}\nPeríodo: ${sale.selected_period || 'Não definido'}\nTotal: R$ ${sale.total_price}\nData: ${sale.selected_date}\nStatus: Pago via Stripe`,
      start: { dateTime: startDate.toISOString(), timeZone: "America/Sao_Paulo" },
      end: { dateTime: endDate.toISOString(), timeZone: "America/Sao_Paulo" },
      colorId: "2",
    };

    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(CALENDAR_ID)}/events`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(event),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Google Calendar API error: ${error}`);
    }

    console.log(`Event created successfully for sale ${sale.id}`);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error creating Google Calendar event:", message);
  }
}

// ---- External Webhook Alert ----

async function sendExternalWebhook(sale: Record<string, any>) {
  const WEBHOOK_URL = Deno.env.get("EXTERNAL_WEBHOOK_URL");
  if (!WEBHOOK_URL) return;

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: "sale.paid",
        timestamp: new Date().toISOString(),
        data: sale
      }),
    });

    if (!response.ok) {
      console.error(`External webhook failed: ${await response.text()}`);
    } else {
      console.log(`External webhook sent successfully for sale: ${sale.id}`);
    }
  } catch (error: unknown) {
    console.error("External webhook error:", error);
  }
}

// ---- Stripe Webhook Handler ----

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!stripeKey || !webhookSecret || !supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing environment variables");
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    const signature = req.headers.get("stripe-signature");
    if (!signature) throw new Error("No signature");

    const body = await req.text();
    let event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      console.error(`Webhook signature verification failed: ${message}`);
      return new Response(`Webhook Error: ${message}`, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as any;
      const saleIdsStr = session.metadata?.sale_ids;
      
      if (saleIdsStr) {
        const saleIds = JSON.parse(saleIdsStr);
        console.log(`Processing payment for sales: ${saleIds.join(", ")}`);

        for (const id of saleIds) {
          const { data: sale, error: updateError } = await supabase
            .from("sales")
            .update({ is_paid: true })
            .eq("id", id)
            .select()
            .single();
          
          if (updateError) {
            console.error(`Error updating sale ${id}:`, updateError);
            continue;
          }

          console.log(`Sale ${id} marked as paid. Sending notifications...`);
          await createGoogleCalendarEvent(sale);
          
          await sendEmailAlert(sale, supabaseUrl); // Admin alert
          await sendEmailAlert(sale, supabaseUrl, true); // Customer confirmation
          await sendExternalWebhook(sale); // External notification

          await supabase.from("sales").update({ emails_sent: true }).eq("id", id);
        }
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Webhook error:", message);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
