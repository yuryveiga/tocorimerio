import { describe, expect, it } from "vitest";
import { parseTripadvisorReviews, TRIPADVISOR_URL, TRIPADVISOR_WEEKLY_CRON } from "../../supabase/functions/_shared/tripadvisorReviews";

const review = `[Ana](https://www.tripadvisor.com.br/Profile/ana)

5 de 5 círculos

### [Ótimo passeio](https://www.tripadvisor.com.br/ShowUserReviews-g303506-d25363992-r123-Tocorime_Rio_Tours.html)

nov. de 2026 • Casal

Adoramos conhecer o Rio com nosso guia.

Leia mais

Feita em 20 de novembro de 2026

[Administrador](https://www.tripadvisor.com.br/Profile/admin)

Obrigado pela visita!`;

describe("weekly Tripadvisor import", () => {
  it("collects only the requested business URL", () => {
    expect(TRIPADVISOR_URL).toBe("https://www.tripadvisor.com.br/Attraction_Review-g303506-d25363992-Reviews-Tocorime_Rio_Tours-Rio_de_Janeiro_State_of_Rio_de_Janeiro.html");
  });
  it("runs once per week on Monday", () => {
    expect(TRIPADVISOR_WEEKLY_CRON.split(" ").slice(2)).toEqual(["*", "*", "1"]);
    expect(TRIPADVISOR_WEEKLY_CRON.split(" ").slice(0, 2)).toEqual(["0", "9"]);
  });
  it("keeps the source rating and excludes management replies", () => {
    expect(parseTripadvisorReviews(review)[0]).toMatchObject({ author: "Ana", rating: 5, text: "Adoramos conhecer o Rio com nosso guia.", published_at: "2026-11-20" });
  });
  it("deduplicates the same source review", () => {
    expect(parseTripadvisorReviews(`${review}\n\n* * *\n\n${review}`)).toHaveLength(1);
  });
  it("rejects failed or empty collections instead of erasing real reviews", () => {
    expect(() => parseTripadvisorReviews("Access denied")).toThrow("mantendo a última importação");
  });
  it("rejects untrusted links and missing ratings", () => {
    expect(() => parseTripadvisorReviews(review.replace("/ShowUserReviews-g", "/untrusted-g"))).toThrow();
    expect(() => parseTripadvisorReviews(review.replace("5 de 5 círculos", ""))).toThrow();
  });
});