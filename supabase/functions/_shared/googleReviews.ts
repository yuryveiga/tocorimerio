import { GOOGLE_REVIEWS_URL } from "./reviewSettings.ts";
import type { TripadvisorReview } from "./tripadvisorReviews.ts";

function age(label: string): number {
  const match = label.match(/^(a|an|\d+) (day|week|month|year)s? ago$/i);
  if (!match) return Infinity;
  return (/^a/.test(match[1]) ? 1 : Number(match[1])) * ({ day: 1, week: 7, month: 30, year: 365 }[match[2].toLowerCase()] ?? Infinity);
}

export function parseGoogleReviews(markdown: string): TripadvisorReview[] {
  const reviews = new Map<string, TripadvisorReview>();
  const blocks = markdown.split(/(?=!\[\]\(https:\/\/lh3\.googleusercontent\.com\/)/);
  for (const block of blocks) {
    const match = block.match(/^!\[\]\((https:\/\/lh3\.googleusercontent\.com\/[^\s)]+)\)\s*\n\s*([^\n]+)\s*\n[\s\S]*?\s*\n\s*(+)([^\n]+)\n([\s\S]*?)(?:Like|Share|See more reviews|$)/);
    if (!match || [...match[3]].length !== 5) continue;
    const author = match[2].trim();
    const dateLabel = match[4].trim();
    const text = match[5].replace(/^\s*New\s*\n/, "").trim().replace(/…More\s*$/, "…").replace(/More\s*$/, "");
    if (!author || author.length > 200 || text.length < 10 || text.length > 12000) continue;
    const id = `google-${encodeURIComponent(author.toLowerCase())}`;
    reviews.set(id, { id, author, avatar_url: match[1], title: "", text, rating: 5, date_label: dateLabel, published_at: null, url: GOOGLE_REVIEWS_URL, source: "google" });
  }
  if (!reviews.size) throw new Error("Google: nenhuma avaliação pública de 5 estrelas encontrada; mantendo a importação anterior.");
  // Relative dates determine order only; do not invent an exact publication date.
  return [...reviews.values()].sort((a, b) => age(a.date_label) - age(b.date_label)).slice(0, 5);
}