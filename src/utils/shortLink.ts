import { supabase } from "@/integrations/supabase/client";

const ALPHABET = "abcdefghijkmnopqrstuvwxyz23456789";
const SHORT_LINK_BASE = "https://tocorimerio.com";

function randomCode(length = 6) {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join("");
}

/**
 * Creates a branded short link (https://tocorimerio.com/r/abc123) pointing to `targetUrl`.
 * Falls back to the original URL if the short link cannot be created.
 */
export async function createShortLink(targetUrl: string, label?: string): Promise<string> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = randomCode();
    const { error } = await supabase
      .from("short_links")
      .insert({ code, target_url: targetUrl, label: label ?? null });

    if (!error) return `${SHORT_LINK_BASE}/r/${code}`;
    // 23505 = unique violation -> retry with a new code
    if (error.code !== "23505") break;
  }

  return targetUrl;
}
