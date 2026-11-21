export const REVIEWS_AUTOPLAY_INTERVAL_MS = 5000;

/**
 * The reviews carousel only rotates on its own when there are enough cards to
 * loop back to the first one, and never for visitors who asked the browser to
 * reduce motion.
 */
export function shouldAutoplayReviews(reviewCount: number, prefersReducedMotion: boolean): boolean {
  return reviewCount > 3 && !prefersReducedMotion;
}
