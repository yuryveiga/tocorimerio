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