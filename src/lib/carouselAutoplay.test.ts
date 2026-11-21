import { describe, expect, it } from "vitest";
import { REVIEWS_AUTOPLAY_INTERVAL_MS, shouldAutoplayReviews } from "./carouselAutoplay";

describe("reviews carousel autoplay", () => {
  it("rotates every 5 seconds when there are more reviews than visible cards", () => {
    expect(REVIEWS_AUTOPLAY_INTERVAL_MS).toBe(5000);
    expect(shouldAutoplayReviews(12)).toBe(true);
  });
  it("stays still when all reviews already fit", () => {
    expect(shouldAutoplayReviews(4)).toBe(false);
  });
});
