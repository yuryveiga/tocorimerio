/** Ticket availability does not change the fixture's scheduling status. */
export function getMatchEventStatus(status: string) {
  switch (status.toLowerCase()) {
    case "cancelled":
    case "canceled":
      return "https://schema.org/EventCancelled";
    case "postponed":
      return "https://schema.org/EventPostponed";
    case "rescheduled":
      return "https://schema.org/EventRescheduled";
    default:
      return "https://schema.org/EventScheduled";
  }
}

/** Apply the approved fixture timing and hosting-team rules to every event schema. */
export function getMatchEventDetails(startDate: string, homeTeam: string) {
  const start = Date.parse(startDate);
  const team = homeTeam.trim();
  return {
    ...(Number.isFinite(start) ? { endDate: new Date(start + 90 * 60 * 1000).toISOString() } : {}),
    ...(team ? { organizer: { "@type": "SportsTeam", name: team } } : {}),
  };
}