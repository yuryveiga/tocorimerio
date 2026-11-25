import { supabase } from "@/integrations/supabase/client";

async function callTranslate(text: string, target: string, source: string, html: boolean): Promise<string> {
  if (!text || text.trim() === "") return "";
  const { data, error } = await supabase.functions.invoke("translate-text", {
    body: { text, target, source, html },
  });
  if (error || !data || typeof data.text !== "string") {
    const message = error?.message || data?.error || "Translation failed";
    console.error("Translation API error:", message);
    throw new Error(message);
  }
  return data.text;
}

export function translateText(text: string, targetLang: string, sourceLang: string = "pt"): Promise<string> {
  return callTranslate(text, targetLang, sourceLang, false);
}

/** Translates HTML content in one call, preserving tags. */
export function translateHtml(html: string, targetLang: string, sourceLang: string = "pt"): Promise<string> {
  return callTranslate(html, targetLang, sourceLang, true);
}
