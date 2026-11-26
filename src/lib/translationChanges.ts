export const TRANSLATION_FIELDS = {
  tours: ["title", "short_description", "category", "difficulty", "meeting_point_address", "meta_title", "meta_description", "itinerary_json", "included_json", "highlights_json", "faq_json"],
  blog_posts: ["title", "excerpt", "content"],
} as const;

const filled = (v: unknown) => v !== null && v !== undefined && v !== "" && !(Array.isArray(v) && v.length === 0);
export const translationSource = (row: Record<string, unknown>, field: string) => filled(row[`${field}_en`]) ? row[`${field}_en`] : row[field];

/** Photo, price and status changes do not invalidate translated text. */
export function changedTranslationFields(table: keyof typeof TRANSLATION_FIELDS, before: Record<string, unknown> | null | undefined, after: Record<string, unknown>) {
  return TRANSLATION_FIELDS[table].filter((field) => !before || JSON.stringify(translationSource(before, field)) !== JSON.stringify(translationSource(after, field)));
}