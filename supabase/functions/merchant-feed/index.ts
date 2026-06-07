import { createClient } from "npm:@supabase/supabase-js@2";

const SITE = "https://tocorimerio.com";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function esc(s: string): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function stripHtml(s: string): string {
  return String(s ?? "").replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

function truncate(s: string, n: number): string {
  if (s.length <= n) return s;
  return s.slice(0, n - 1).trimEnd() + "…";
}

type Item = {
  id: string;
  title: string;
  description: string;
  link: string;
  image_link: string;
  price: number;
  availability: "in_stock" | "out_of_stock";
  product_type: string;
  brand: string;
};

async function buildItems(): Promise<Item[]> {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const items: Item[] = [];

  const { data: tours } = await supabase
    .from("tours")
    .select("id, slug, title, title_en, short_description, short_description_en, price, price_1_person, price_2_people, image_url, category, is_active")
    .eq("is_active", true);

  for (const t of tours ?? []) {
    if (!t.slug || !t.image_url) continue;
    const price = Number(t.price) || Number(t.price_1_person) || Number(t.price_2_people) || 0;
    if (price <= 0) continue;
    const title = t.title_en || t.title || "";
    const desc = stripHtml(t.short_description_en || t.short_description || title);
    items.push({
      id: `tour-${t.slug}`,
      title: truncate(title, 150),
      description: truncate(desc || title, 5000),
      link: `${SITE}/passeio/${t.slug}`,
      image_link: t.image_url,
      price,
      availability: "in_stock",
      product_type: `Tours > ${t.category || "Rio de Janeiro"}`,
      brand: "Tocorime Rio",
    });
  }

  const { data: matches } = await supabase
    .from("matches")
    .select("id, slug, home_team, away_team, match_date, price, image_url, venue, competition, available_spots, sold_count, status")
    .gte("match_date", new Date().toISOString());

  for (const m of matches ?? []) {
    if (!m.slug || !m.home_team || !m.away_team) continue;
    const price = Number(m.price) || 0;
    if (price <= 0) continue;
    const remaining = (m.available_spots ?? 0) - (m.sold_count ?? 0);
    const title = `${m.home_team} vs ${m.away_team} — ${m.venue || "Maracanã"}`;
    const date = new Date(m.match_date).toISOString().slice(0, 10);
    const desc = `${m.competition || "Football"} match at ${m.venue || "Maracanã"} on ${date}. Ticket + bilingual guide + transfer included.`;
    items.push({
      id: `match-${m.slug}`,
      title: truncate(title, 150),
      description: truncate(desc, 5000),
      link: `${SITE}/match/${m.slug}`,
      image_link: m.image_url || `${SITE}/og-image.jpg`,
      price,
      availability: m.status === "available" && remaining > 0 ? "in_stock" : "out_of_stock",
      product_type: "Tickets > Football > Maracanã",
      brand: "Tocorime Rio",
    });
  }

  return items;
}

function toXml(items: Item[]): string {
  const entries = items.map((i) => `
    <item>
      <g:id>${esc(i.id)}</g:id>
      <g:title>${esc(i.title)}</g:title>
      <g:description>${esc(i.description)}</g:description>
      <g:link>${esc(i.link)}</g:link>
      <g:image_link>${esc(i.image_link)}</g:image_link>
      <g:availability>${i.availability}</g:availability>
      <g:price>${i.price.toFixed(2)} BRL</g:price>
      <g:brand>${esc(i.brand)}</g:brand>
      <g:condition>new</g:condition>
      <g:identifier_exists>no</g:identifier_exists>
      <g:product_type>${esc(i.product_type)}</g:product_type>
    </item>`).join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>Tocorime Rio — Tours & Tickets</title>
    <link>${SITE}</link>
    <description>Private guided tours and Maracanã match tickets in Rio de Janeiro.</description>${entries}
  </channel>
</rss>`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    const format = url.searchParams.get("format") || (url.pathname.endsWith(".json") ? "json" : "xml");
    const items = await buildItems();

    if (format === "json") {
      return new Response(JSON.stringify({ count: items.length, items }, null, 2), {
        headers: { ...corsHeaders, "Content-Type": "application/json; charset=utf-8", "Cache-Control": "public, max-age=3600" },
      });
    }

    return new Response(toXml(items), {
      headers: { ...corsHeaders, "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=3600" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});