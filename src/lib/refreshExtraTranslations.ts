import { supabase } from "@/integrations/supabase/client";

/** After an admin saves a tour or blog post, refresh its German, French and Italian text in the background. */
export function refreshExtraTranslations(table: "tours" | "blog_posts", id: string | undefined | null) {
  if (!id) return;
  for (const lang of ["de", "fr", "it"]) {
    supabase.functions
      .invoke("translate-content-languages", { body: { table, lang, id } })
      .then(({ error }) => error && console.error(`translate ${lang} failed:`, error.message));
  }
}
