import { describe, expect, it } from "vitest";
import type { Match } from "@/hooks/useMatches";
import { buildFlamengoEstudiantesEvent, getFlamengoEstudiantesCompetitionLabel, FLAMENGO_ESTUDIANTES_BUY_URL, FLAMENGO_ESTUDIANTES_CANONICAL, FLAMENGO_ESTUDIANTES_PATH } from "./flamengoEstudiantesLanding";

const match: Match = { id: "test", home_team: "Flamengo", away_team: "Estudiantes de la Plata", match_date: "2099-10-23T00:30:00+00:00", venue: "Maracanã", price: 1160, min_price: 1160, available_spots: 20, sold_count: 8, status: "available", competition: "Libertadores - Jogo de Volta - ALTÍSSIMA DEMANDA" };
describe("Flamengo Estudiantes landing", () => {
  it("points purchases to the exact requested match and keeps its own canonical", () => {
    const event = buildFlamengoEstudiantesEvent(match, "", "");
    expect(FLAMENGO_ESTUDIANTES_BUY_URL).toBe("https://tocorimerio.com/match/flamengo-vs-estudiantes-de-la-plata-2026-10-22");
    expect(event.offers?.url).toBe(FLAMENGO_ESTUDIANTES_BUY_URL);
    expect(event.url).toBe("https://tocorimerio.com/flamengo-x-estudiantes-libertadores-maracana");
    expect(event.url).toBe(FLAMENGO_ESTUDIANTES_CANONICAL);
  });
  it("uses the live price and date without deriving the date from the slug", () => {
    const event = buildFlamengoEstudiantesEvent(match, "", "");
    expect(event.offers?.price).toBe(1160);
    expect(event.startDate).toBe("2099-10-23T00:30:00+00:00");
    expect(Number.isNaN(Date.parse(event.offers?.validFrom || ""))).toBe(false);
  });
  it("does not mark depleted inventory as in stock", () => {
    expect(buildFlamengoEstudiantesEvent({ ...match, sold_count: 20 }, "", "").offers?.availability).toBe("https://schema.org/SoldOut");
  });
  it("does not invent an offer when no real price exists", () => {
    expect(buildFlamengoEstudiantesEvent({ ...match, price: 0, min_price: 0 }, "", "")).not.toHaveProperty("offers");
  });
  it("displays Libertadores instead of the internal competition label", () => {
    expect(getFlamengoEstudiantesCompetitionLabel(match.competition)).toBe("Libertadores");
    expect(getFlamengoEstudiantesCompetitionLabel("Copa do Brasil")).toBe("Copa do Brasil");
    expect(getFlamengoEstudiantesCompetitionLabel(null)).toBe("");
  });
  it("names the address after the Libertadores", () => {
    expect(FLAMENGO_ESTUDIANTES_PATH).toBe("/flamengo-x-estudiantes-libertadores-maracana");
    expect(FLAMENGO_ESTUDIANTES_CANONICAL).toBe("https://tocorimerio.com/flamengo-x-estudiantes-libertadores-maracana");
  });
});
