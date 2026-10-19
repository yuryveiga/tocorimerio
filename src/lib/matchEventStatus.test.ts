import { describe, expect, it } from "vitest";
import { generateSportsEventSchema } from "@/utils/seo";
import { getMatchEventDetails, getMatchEventStatus } from "./matchEventStatus";
import { buildVascoBocaEvent } from "./vascoBocaLanding";
import { buildFlamengoEstudiantesEvent } from "./flamengoEstudiantesLanding";
import type { Match } from "@/hooks/useMatches";

const match: Match = { id: "test", home_team: "Flamengo", away_team: "Estudiantes de la Plata", match_date: "2026-10-22T21:30:00-03:00", venue: "Maracanã", price: 1160, available_spots: 20, sold_count: 0, status: "available" };
const builders = {
  general: () => generateSportsEventSchema({ name: "Flamengo x Estudiantes", description: "", startDate: match.match_date, url: "https://tocorimerio.com/match/test", homeTeam: match.home_team, awayTeam: match.away_team }),
  vasco: () => buildVascoBocaEvent(match, "", ""),
  flamengo: () => buildFlamengoEstudiantesEvent(match, "", ""),
};

describe("match event schema", () => {
  it("keeps sold-out fixtures scheduled and maps cancellation", () => {
    expect(getMatchEventStatus("sold_out")).toBe("https://schema.org/EventScheduled");
    expect(getMatchEventStatus("cancelled")).toBe("https://schema.org/EventCancelled");
  });
  it.each(Object.entries(builders))("%s ends exactly 90 minutes after kickoff, across midnight", (_, build) => {
    const event = build();
    expect(event.endDate).toBe("2026-10-23T02:00:00.000Z");
    expect(Date.parse(event.endDate || "") - Date.parse(event.startDate)).toBe(90 * 60 * 1000);
  });
  it.each(Object.entries(builders))("%s uses the home team as organizer", (_, build) => {
    expect(build().organizer).toEqual({ "@type": "SportsTeam", name: "Flamengo" });
  });
  it("omits details when kickoff or home team is missing", () => {
    expect(getMatchEventDetails("invalid", "")).toEqual({});
  });
});