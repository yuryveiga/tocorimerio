import { describe, expect, it } from "vitest";
import { REVIEWS_AUTOPLAY_INTERVAL_MS, shouldAutoplayReviews } from "./carouselAutoplay";

describe("reviews carousel autoplay", () => {
  it("rotates automatically every 5 seconds once the full set of 10 reviews is loaded", () => {
    expect(REVIEWS_AUTOPLAY_INTERVAL_MS).toBe(5000);
    expect(shouldAutoplayReviews(10, false)).toBe(true);
  });

  it("stays still when there are not enough reviews to loop back to the first one", () => {
    expect(shouldAutoplayReviews(3, false)).toBe(false);
    expect(shouldAutoplayReviews(0, false)).toBe(false);
  });

  it("stays still for visitors who ask the browser to reduce motion", () => {
    expect(shouldAutoplayReviews(10, true)).toBe(false);
  });
});
