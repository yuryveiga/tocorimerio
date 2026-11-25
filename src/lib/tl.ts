/**
 * Picks inline page copy. Portuguese and Spanish keep their own text; English
 * pages show German, French or Italian when the visitor chose one of those.
 */
type Copy = { pt: string; es: string; en: string; de?: string; fr?: string; it?: string };

let current = "en";
/** Set by LocaleProvider on each render with the visitor's chosen language. */
export const setTlLanguage = (l: string) => { current = l; };

export function tl(language: string, copy: Copy): string {
  if (language === "pt") return copy.pt;
  if (language === "es") return copy.es;
  if (current === "de" || current === "fr" || current === "it") return copy[current] || copy.en;
  return copy.en;
}
