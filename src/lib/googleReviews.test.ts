import { describe, expect, it } from "vitest";
import { parseGoogleReviews } from "../../supabase/functions/_shared/googleReviews";

const block = (name: string, stars: number, date: string) => `![](https://lh3.googleusercontent.com/a/avatar-${name})

${name}

2 reviews · 2 photos



${"".repeat(stars)}${date}

New

Amazing guide and amazing day.

Like

Share
`;
describe("Google public review parsing", () => {
  it("imports only five-star reviews from the requested public format", () => {
    expect(parseGoogleReviews(block("Ana", 5, "a week ago") + block("Bob", 4, "a day ago")).map(r => [r.author, r.rating, r.source])).toEqual([["Ana", 5, "google"]]);
  });
  it("orders visible reviews by relative age without inventing publication dates", () => {
    const result = parseGoogleReviews(block("Old", 5, "3 months ago") + block("Recent", 5, "a week ago"));
    expect(result.map(r => r.author)).toEqual(["Recent", "Old"]);
    expect(result.every(r => r.published_at === null)).toBe(true);
  });
  it("caps available five-star imports at five", () => {
    expect(parseGoogleReviews(Array.from({ length: 7 }, (_, i) => block(`Person${i}`, 5, `${i + 1} days ago`)).join(""))).toHaveLength(5);
  });
  it("preserves previous import when a page has no usable reviews", () => {
    expect(() => parseGoogleReviews("Loading Google Maps")).toThrow("mantendo a importação anterior");
  });
  it("deduplicates repeated reviewer blocks", () => {
    expect(parseGoogleReviews(block("Ana", 5, "a week ago").repeat(2))).toHaveLength(1);
  });
});