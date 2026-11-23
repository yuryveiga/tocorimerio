import { describe, expect, it } from "vitest";
import { DEFAULT_REVIEW_SETTINGS, readReviewSettings, selectCarouselReviews } from "../../supabase/functions/_shared/reviewSettings";
import type { TripadvisorReview } from "../../supabase/functions/_shared/tripadvisorReviews";

function review(id: number, rating: number, date: string): TripadvisorReview {
  return { id: String(id), rating, published_at: date, source: "google", author: "Visitor", title: "", text: "A real visit", avatar_url: null, date_label: date, url: "https://www.google.com/maps" };
}
describe("review source configuration", () => {
  const settings = { ...DEFAULT_REVIEW_SETTINGS, google: { enabled: true, limit: 5 } };
  it("shows only Google reviews with exactly five stars", () => {
    expect(selectCarouselReviews([review(1, 4, "2026-11-23"), review(2, 5, "2026-11-22"), review(3, 0, "2026-11-21")], settings).map(r => r.id)).toEqual(["2"]);
  });
  it("orders available five-star Google reviews newest first", () => {
    expect(selectCarouselReviews([review(1, 5, "2026-11-01"), review(2, 5, "2026-11-23")], settings).map(r => r.id)).toEqual(["2", "1"]);
  });
  it("limits Google to five available reviews", () => {
    expect(selectCarouselReviews(Array.from({ length: 8 }, (_, i) => review(i, 5, `2026-11-${String(i + 1).padStart(2, "0")}`)), settings).map(r => r.id)).toEqual(["7", "6", "5", "4", "3"]);
  });
  it("does not show a disabled source", () => {
    expect(selectCarouselReviews([review(1, 5, "2026-11-23")], DEFAULT_REVIEW_SETTINGS)).toEqual([]);
  });
  it("rejects unsupported source limits", () => {
    expect(readReviewSettings({ google: { limit: 100 }, tripadvisor: { limit: -1 } })).toEqual(DEFAULT_REVIEW_SETTINGS);
  });
});