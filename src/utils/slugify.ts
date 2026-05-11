/**
 * Utility to generate SEO-friendly slugs from arbitrary text.
 * Robustly handles accented characters by normalizing them (á -> a).
 */
export const slugify = (text: string): string => {
  if (!text) return "";
  
  const slug = text
    .toString()
    .toLowerCase()
    .trim()
    .normalize("NFD") // Split accents from letters (e.g. "ã" -> "a" + "~")
    .replace(/[\u0300-\u036f]/g, "") // Remove the accent marks
    .replace(/[^\w\s-]/g, "") // Remove all non-word characters (except space and hyphen)
    .replace(/[\s_]+/g, "-") // Replace spaces and underscores with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with a single one
    .replace(/^-+/, "") // Trim hyphens from the start
    .replace(/-+$/, ""); // Trim hyphens from the end

  // Manual fixes for corrupted partner data
  const slugFixes: Record<string, string> = {
    'vitria': 'vitoria',
    'operrio': 'operario',
    'ferrovirio': 'ferroviario',
    'so-paulo': 'sao-paulo',
  };
  
  let clean = slug;
  Object.keys(slugFixes).forEach(bad => {
    clean = clean.replace(new RegExp(bad, 'g'), slugFixes[bad]);
  });
  
  return clean;
};
