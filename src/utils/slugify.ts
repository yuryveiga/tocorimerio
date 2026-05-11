/**
 * Utility to generate SEO-friendly slugs from arbitrary text.
 * Robustly handles accented characters by normalizing them (á -> a).
 */
export const slugify = (text: string): string => {
  if (!text) return "";
  
  return text
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
};
