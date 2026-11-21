export const REVIEWS_AUTOPLAY_INTERVAL_MS = 5000;

/** The reviews carousel rotates on its own whenever there are more cards than fit on screen. */
export function shouldAutoplayReviews(reviewCount: number): boolean {
  return reviewCount > 4;
}
