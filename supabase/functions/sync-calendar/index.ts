import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { isPrivilegedCaller } from "../_shared/privilegedCaller.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Base64url encode from Uint8Array
function base64url(data: Uint8Array): string {
  let binary = "";
  for (const byte of data) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64urlStr(str: string): string {
  return base64url(new TextEncoder().encode(str));
}

function base64ToUint8Array(b64: string): Uint8Array {
  // Ensure only valid base64 characters remain
  const cleaned = b64.replace(/[^A-Za-z0-9+/]/g, "");
  // Add proper padding
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
  console.log("Key decoded successfully, byte length:", binaryDer.length);
  
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

async function isCalendarCaller(req: Request, db: any): Promise<boolean> {
  if (await isPrivilegedCaller(req, db)) return true;
  const bearer = req.headers.get("Authorization")?.replace(/^Bearer\s+/i, "") || "";
  if (!bearer) return false;
  const { data } = await db.auth.getUser(bearer);
  if (!data?.user) return false;
  const { data: role } = await db.from("user_roles").select("id").eq("user_id", data.user.id).eq("role", "admin").maybeSingle();
  return !!role;
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

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { saleId, finSaleId, remove } = await req.json();
    if (!saleId && !finSaleId) throw new Error("Venda não informada");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );
    if (!(await isCalendarCaller(req, supabase))) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const { data: sale, error: fetchError } = await supabase
      .from(finSaleId ? "fin_vendas" : "sales")
      .select("*")
      .eq("id", finSaleId || saleId)
      .single();

    if (fetchError || !sale) throw new Error("Venda não encontrada");

    const GOOGLE_EMAIL = Deno.env.get("GOOGLE_SERVICE_ACCOUNT_EMAIL");
    const GOOGLE_KEY = Deno.env.get("GOOGLE_PRIVATE_KEY")?.replace(/\\n/g, "\n");
    const CALENDAR_ID = Deno.env.get("GOOGLE_CALENDAR_ID");

    if (!GOOGLE_EMAIL || !GOOGLE_KEY || !CALENDAR_ID) {
      throw new Error("Configurações do Google ausentes no servidor.");
    }

    const token = await getAccessToken(GOOGLE_EMAIL, GOOGLE_KEY);
    const calendarBase = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(CALENDAR_ID)}/events`;
    const authHeaders = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

    if (finSaleId && remove) {
      if (sale.google_event_id) {
        const response = await fetch(`${calendarBase}/${encodeURIComponent(sale.google_event_id)}`, { method: "DELETE", headers: authHeaders });
        if (!response.ok && response.status !== 404 && response.status !== 410) throw new Error(await response.text());
      }
      const { error } = await supabase.from("fin_vendas").update({ google_event_id: null }).eq("id", finSaleId);
      if (error) throw error;
      return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const startDate = finSaleId ? new Date(`${sale.data_tour || sale.data}T10:00:00-03:00`) : new Date(sale.selected_date);
    if (Number.isNaN(startDate.getTime())) throw new Error("Data do passeio inválida");
    if (!finSaleId) {
      if (sale.selected_period === "Manhã") startDate.setHours(9, 0, 0);
      else if (sale.selected_period === "Tarde") startDate.setHours(14, 0, 0);
      else startDate.setHours(10, 0, 0);
    }
    const endDate = new Date(startDate);
    endDate.setHours(startDate.getHours() + 4);

    const event = finSaleId ? {
      summary: `Reserva do Site Tocorime: ${sale.tour} - ${sale.nome_pax}`,
      description: `Cliente: ${sale.nome_pax}\nTelefone: ${sale.contato || "Não informado"}\nPessoas: ${sale.quantidade || 1}\nGuia: ${sale.guia_responsavel || "Não definido"}\nTotal: R$ ${sale.valor_cobrado}\nData: ${sale.data_tour || sale.data}\nOrigem: Financeiro\nStatus: Sincronizado`,
      start: { dateTime: startDate.toISOString(), timeZone: "America/Sao_Paulo" },
      end: { dateTime: endDate.toISOString(), timeZone: "America/Sao_Paulo" },
      colorId: "5",
    } : {
      summary: `Reserva do Site Tocorime: ${sale.tour_title} - ${sale.customer_name}`,
      description: `Cliente: ${sale.customer_name}\nEmail: ${sale.customer_email}\nTelefone: ${sale.customer_phone || 'Não informado'}\nPessoas: ${sale.quantity}\nTipo: ${sale.is_private ? 'Privativo' : 'Grupo Aberto'}\nPeríodo: ${sale.selected_period || 'Não definido'}\nTotal: R$ ${sale.total_price}\nData: ${sale.selected_date}\nStatus: Sincronizado`,
      start: { dateTime: startDate.toISOString(), timeZone: "America/Sao_Paulo" },
      end: { dateTime: endDate.toISOString(), timeZone: "America/Sao_Paulo" },
      colorId: "5",
    };

    let response: Response | null = null;
    if (finSaleId && sale.google_event_id) {
      response = await fetch(`${calendarBase}/${encodeURIComponent(sale.google_event_id)}`, { method: "PATCH", headers: authHeaders, body: JSON.stringify(event) });
      if (response.status === 404 || response.status === 410) response = null;
    }
    if (!response) response = await fetch(calendarBase, { method: "POST", headers: authHeaders, body: JSON.stringify(event) });
    if (!response.ok) throw new Error(await response.text());

    const savedEvent = await response.json();
    if (finSaleId) {
      const { error } = await supabase.from("fin_vendas").update({ google_event_id: savedEvent.id }).eq("id", finSaleId);
      if (error) throw error;
    }
    return new Response(JSON.stringify({ success: true, eventId: savedEvent.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    console.error("sync-calendar error:", message);
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
