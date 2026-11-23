import { describe, expect, it } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { parseAirbnbReviews, parseViatorReviews } from "../../supabase/functions/_shared/partnerReviews";

const sample = (n: string) => `/tmp/rv/${n}.md`;
describe.skipIf(!existsSync(sample("airbnb")))("partner reviews", () => {
  it("reads five Airbnb reviews with photo and month", () => {
    const r = parseAirbnbReviews(readFileSync(sample("airbnb"), "utf8"));
    expect(r).toHaveLength(5);
    expect(r[0].author).toBe("María Fernanda");
    expect(r[0].published_at).toBe("2026-09-01");
    expect(r[0].avatar_url).toMatch(/^https:\/\/a0\.muscache\.com\//);
  });
  it("reads five Viator reviews without host replies", () => {
    const r = parseViatorReviews(readFileSync(sample("viator"), "utf8"));
    expect(r).toHaveLength(5);
    expect(r[0].author).toBe("Thomas_S");
    expect(r[0].published_at).toBe("2026-09-01");
    expect(r.some(x => x.text.includes("Thank you so much"))).toBe(false);
  });
});
