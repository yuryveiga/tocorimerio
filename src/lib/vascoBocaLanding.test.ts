import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import type { Match } from "@/hooks/useMatches";
import { buildVascoBocaEvent, VASCO_BOCA_BUY_URL, VASCO_BOCA_CANONICAL, VASCO_BOCA_PATH } from "./vascoBocaLanding";

const match: Match = { id: "test", home_team: "Vasco da Gama", away_team: "Boca Juniors", match_date: "2099-10-21T00:30:00+00:00", venue: "Maracanã", price: 1150, min_price: 1200, available_spots: 20, sold_count: 1, status: "available" };
describe("Vasco Boca landing", () => {
  it("points purchases to the exact requested match and keeps its own canonical", () => {
    const event = buildVascoBocaEvent(match, "", "");
    expect(VASCO_BOCA_BUY_URL).toBe("https://tocorimerio.com/match/vasco-da-gama-vs-boca-juniors-2026-10-20");
    expect(event.offers?.url).toBe(VASCO_BOCA_BUY_URL);
    expect(event.url).toBe("https://tocorimerio.com/vasco-x-boca-sulamericana-maracana");
    expect(event.url).toBe(VASCO_BOCA_CANONICAL);
  });
  it("uses the live price and date without deriving the date from the slug", () => {
    const event = buildVascoBocaEvent(match, "", "");
    expect(event.offers?.price).toBe(1200);
    expect(event.startDate).toBe("2099-10-21T00:30:00+00:00");
    expect(Number.isNaN(Date.parse(event.offers?.validFrom || ""))).toBe(false);
  });
  it("does not mark depleted inventory as in stock", () => {
    expect(buildVascoBocaEvent({ ...match, sold_count: 20 }, "", "").offers?.availability).toBe("https://schema.org/SoldOut");
  });
  it("does not invent an offer when no real price exists", () => {
    expect(buildVascoBocaEvent({ ...match, price: 0, min_price: 0 }, "", "")).not.toHaveProperty("offers");
  });
  it("names the address after the Sulamericana, never the Libertadores", () => {
    expect(VASCO_BOCA_PATH).toBe("/vasco-x-boca-sulamericana-maracana");
    expect(VASCO_BOCA_PATH).not.toMatch(/libertadores/i);
    expect(VASCO_BOCA_CANONICAL).toBe("https://tocorimerio.com/vasco-x-boca-sulamericana-maracana");
  });
  it("keeps the retired libertadores address forwarding to the new one", () => {
    const main = readFileSync(new URL("../main.tsx", import.meta.url), "utf8");
    expect(main).toMatch(/"\/vasco-x-boca-libertadores-maracana"/);
    expect(main).toMatch(/\/vasco-x-boca-sulamericana-maracana\$\{search\}\$\{hash\}/);
  });
});