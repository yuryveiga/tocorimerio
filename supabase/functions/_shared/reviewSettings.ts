import type { TripadvisorReview } from "./tripadvisorReviews.ts";

export const REVIEW_SETTINGS_KEY = "review_carousel_settings";
export const GOOGLE_REVIEWS_URL = "https://www.google.com/maps/place/Tocorime+Rio/@-22.9542571,-43.1883411,17z/data=!4m8!3m7!1s0x2acf3837a7420fe1:0x664e0c0a1047d810!8m2!3d-22.9542571!4d-43.1857662!9m1!1b1!16s%2Fg%2F11yxhrmjc9?entry=ttu";
export const REVIEW_SOURCES = ["tripadvisor", "airbnb", "viator", "google"] as const;
export type ReviewSource = typeof REVIEW_SOURCES[number];
export type ReviewSettings = Record<ReviewSource, { enabled: boolean; limit: number }>;
export const DEFAULT_REVIEW_SETTINGS: ReviewSettings = {
  tripadvisor: { enabled: true, limit: 16 },
  airbnb: { enabled: true, limit: 5 },
  viator: { enabled: true, limit: 5 },
  google: { enabled: false, limit: 5 },
};

export function readReviewSettings(value: unknown): ReviewSettings {
  let raw = value;
  if (typeof raw === "string") {
    try { raw = JSON.parse(raw); } catch { raw = null; }
  }
  const result = structuredClone(DEFAULT_REVIEW_SETTINGS);
  if (!raw || typeof raw !== "object") return result;
  for (const source of REVIEW_SOURCES) {
    const candidate = (raw as Record<string, unknown>)[source];
    if (!candidate || typeof candidate !== "object") continue;
    const { enabled, limit } = candidate as Record<string, unknown>;
    if (typeof enabled === "boolean") result[source].enabled = enabled;
    if (typeof limit === "number" && Number.isInteger(limit) && limit >= 1 && limit <= (source === "tripadvisor" ? 16 : 5)) result[source].limit = limit;
  }
  return result;
}

// Newest among the reviews actually supplied by each provider, never a claim
// that Google's public API exposes its complete or newest review feed.
export function selectCarouselReviews(reviews: TripadvisorReview[], settings: ReviewSettings): TripadvisorReview[] {
  const sorted = [...reviews].sort((a, b) => (b.published_at ?? "").localeCompare(a.published_at ?? ""));
  const counts = new Map<ReviewSource, number>();
  return sorted.filter(review => {
    const source = review.source ?? "tripadvisor";
    if (!REVIEW_SOURCES.includes(source) || !settings[source].enabled) return false;
    if (source === "google" && review.rating !== 5) return false;
    const count = counts.get(source) ?? 0;
    if (count >= settings[source].limit) return false;
    counts.set(source, count + 1);
    return true;
  });
}