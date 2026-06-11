
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const isPrivateIp = (ip: string): boolean => {
  if (!ip) return true;
  if (ip === "127.0.0.1" || ip === "::1" || ip === "localhost") return true;
  if (ip.startsWith("10.") || ip.startsWith("192.168.") || ip.startsWith("169.254.")) return true;
  if (ip.startsWith("172.")) {
    const second = parseInt(ip.split(".")[1] || "0", 10);
    if (second >= 16 && second <= 31) return true;
  }
  if (ip.startsWith("fc") || ip.startsWith("fd") || ip.startsWith("fe80")) return true;
  return false;
};

const extractClientIp = (req: Request): string => {
  const cf = req.headers.get("cf-connecting-ip");
  if (cf) return cf.trim();
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  const xreal = req.headers.get("x-real-ip");
  if (xreal) return xreal.trim();
  return "";
};

const resolveCountry = async (req: Request): Promise<string> => {
  // Try Cloudflare-provided country first (instant, no network call)
  const cfCountry = req.headers.get("cf-ipcountry");
  if (cfCountry && cfCountry !== "XX" && cfCountry !== "T1") {
    return cfCountry;
  }

  const ip = extractClientIp(req);
  if (!ip || isPrivateIp(ip)) return "Unknown";

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(`https://ipapi.co/${ip}/country/`, {
      signal: controller.signal,
      headers: { "User-Agent": "tocorimerio-analytics/1.0" },
    });
    clearTimeout(timeout);
    if (!res.ok) return "Unknown";
    const text = (await res.text()).trim();
    // Expect a 2-letter ISO code; anything else is treated as unknown.
    if (!text || text.length !== 2 || !/^[A-Za-z]{2}$/.test(text)) return "Unknown";
    return text.toUpperCase();
  } catch (e) {
    console.warn("Country lookup failed:", (e as Error).message);
    return "Unknown";
  }
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { page_url, referrer, user_agent, session_id } = await req.json();

    const country = await resolveCountry(req);

    const { error } = await supabase
      .from("site_visits")
      .insert({
        page_url,
        referrer,
        user_agent,
        session_id,
        country
      });

    if (error) throw error;

    return new Response(JSON.stringify({ success: true, country }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error("Error tracking visit:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
