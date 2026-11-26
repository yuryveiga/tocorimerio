import { supabase } from "@/integrations/supabase/client";
import { changedTranslationFields, TRANSLATION_FIELDS, translationSource } from "./translationChanges";

/** After an admin saves a tour or blog post, refresh its German, French and Italian text in the background. */
export function refreshExtraTranslations(table: "tours" | "blog_posts", id: string | undefined | null, before?: object | null, after?: object) {
  if (!id) return;
  const changed = after ? changedTranslationFields(table, before, after) : [...TRANSLATION_FIELDS[table]];
  for (const lang of ["de", "fr", "it"]) {
    const missing = after ? TRANSLATION_FIELDS[table].filter((f) => {
      const value = (after as Record<string, unknown>)[`${f}_${lang}`];
      return translationSource(after, f) && (value === null || value === undefined || value === "" || (Array.isArray(value) && value.length === 0));
    }) : [];
    const fields = [...new Set([...changed, ...missing])];
    if (fields.length === 0) continue;
    supabase.functions
      .invoke("translate-content-languages", { body: { table, lang, id, fields } })
      .then(({ error }) => error && console.error(`translate ${lang} failed:`, error.message));
  }
}
