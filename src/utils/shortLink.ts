import { supabase } from "@/integrations/supabase/client";

const ALPHABET = "abcdefghijkmnopqrstuvwxyz23456789";
const SHORT_LINK_BASE = "https://tocorimerio.com";

function randomCode(length = 6) {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join("");
}

/** Turns "João Silva · Tour Personalizado" into "joao-silva-tour-personalizado" */
export function slugifyCode(input: string) {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

/**
 * Creates a branded short link (https://tocorimerio.com/r/joao-silva-passeio) pointing to `targetUrl`.
 * When `preferredSlug` is given it is used as the code, adding a numeric suffix if already taken.
 * Falls back to a random code, and finally to the original URL.
 */
export async function createShortLink(
  targetUrl: string,
  label?: string,
  preferredSlug?: string
): Promise<string> {
  const base = preferredSlug ? slugifyCode(preferredSlug) : "";

  if (base) {
    for (let attempt = 0; attempt < 5; attempt++) {
      const code = attempt === 0 ? base : `${base}-${attempt + 1}`;
      const { error } = await supabase
        .from("short_links")
        .insert({ code, target_url: targetUrl, label: label ?? null });

      if (!error) return `${SHORT_LINK_BASE}/r/${code}`;
      if (error.code !== "23505") break;
    }
  }

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
