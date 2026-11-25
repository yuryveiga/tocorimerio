/**
 * German, French and Italian reuse the English layout of each page. To show
 * their own database text, copy `field_<lang>` over `field_en` when it exists;
 * untranslated fields keep the English text.
 */
export type ExtraLanguage = "de" | "fr" | "it";

export const isExtraLanguage = (l: string): l is ExtraLanguage => l === "de" || l === "fr" || l === "it";

const hasValue = (v: unknown) =>
  v !== null && v !== undefined && v !== "" && !(Array.isArray(v) && v.length === 0);

export function overlayLanguage<T extends Record<string, unknown>>(row: T, lang: string): T {
  if (!row || !isExtraLanguage(lang)) return row;
  const out: Record<string, unknown> = { ...row };
  const suffix = `_${lang}`;
  for (const key of Object.keys(row)) {
    if (!key.endsWith(suffix)) continue;
    const base = key.slice(0, -suffix.length);
    if (hasValue(row[key])) out[`${base}_en`] = row[key];
  }
  return out as T;
}

/** Comma-separated `col_<lang>` list for a select string. */
export const extraColumns = (fields: string[], lang: string) =>
  isExtraLanguage(lang) ? fields.map((f) => `${f}_${lang}`).join(",") : "";
