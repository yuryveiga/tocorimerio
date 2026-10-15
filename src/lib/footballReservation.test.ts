import { describe, expect, it } from "vitest";
import { isFootballReservation } from "./footballReservation";

describe("football reservation classification", () => {
  it("recognizes football sold through matchday", () => {
    expect(isFootballReservation({ provider: "matchday" })).toBe(true);
  });
  it("recognizes the scheduled match period", () => {
    expect(isFootballReservation({ selected_period: "match_time" })).toBe(true);
  });
  it("recognizes football sold using a manual payment link", () => {
    expect(isFootballReservation({ provider: "tour", tour_title: "Maracanã MatchDay" })).toBe(true);
  });
  it.each(["Botafogo x Vasco - Nilton Santos", "Vasco vs Corinthians - São Januário", "Football Experiences in Rio", "NFL Rio"])("recognizes %s", (tour_title) => {
    expect(isFootballReservation({ tour_title })).toBe(true);
  });
  it("recognizes a match slug without a title", () => {
    expect(isFootballReservation({ tour_slug: "vasco-da-gama-vs-corinthians-2026-10-25" })).toBe(true);
  });
  it.each(["City Tour Completo", "Favela Rocinha Tour", "Maracanã Stadium Tour", "Transfer Aeroporto"])("preserves non-football classification for %s", (tour_title) => {
    expect(isFootballReservation({ tour_title })).toBe(false);
  });
  it("does not classify an unidentified reservation as football", () => {
    expect(isFootballReservation({})).toBe(false);
  });
});