import { describe, expect, it } from "vitest";
import { generateSportsEventSchema } from "@/utils/seo";
import { getMatchEventStatus } from "./matchEventStatus";

describe("match event schema", () => {
  it("keeps sold-out fixtures scheduled and maps cancellation", () => {
    expect(getMatchEventStatus("sold_out")).toBe("https://schema.org/EventScheduled");
    expect(getMatchEventStatus("cancelled")).toBe("https://schema.org/EventCancelled");
  });
  it("does not invent an end time or Tocorime as organizer", () => {
    const event = generateSportsEventSchema({ name: "A x B", description: "", startDate: "2099-01-01T00:00:00Z", url: "https://tocorimerio.com/match/a", homeTeam: "A", awayTeam: "B" });
    expect(event).not.toHaveProperty("endDate");
    expect(event).not.toHaveProperty("organizer");
  });
});