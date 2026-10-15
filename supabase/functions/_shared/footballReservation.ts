export interface ReservationIdentity {
  provider?: string | null;
  selected_period?: string | null;
  tour_title?: string | null;
  tour_slug?: string | null;
}

/** Presentation only: never changes reservation flags or payment data. */
export function isFootballReservation(reservation: ReservationIdentity): boolean {
  if (reservation.provider === "matchday" || reservation.selected_period === "match_time") return true;

  const identity = `${reservation.tour_title || ""} ${reservation.tour_slug || ""}`
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

  return /\b(match[ -]?day|football|futebol|soccer|nfl)\b|\b(jogo|jogos|match|matches)\b|[- ](?:vs|versus|x)[- ]/.test(identity);
}