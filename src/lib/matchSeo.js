/** Shared by the browser and static route generator; only registered venue/date data is used. */
export function getMatchSeo(match, language = 'en') {
  const rawVenue = String(match.stadium || match.venue || '').trim();
  const normalized = rawVenue.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const venue = /maracana|mario filho/.test(normalized) || !rawVenue ? 'Maracanã' : rawVenue;
  const date = new Date(match.match_date);
  const dateLabel = Number.isFinite(date.getTime())
    ? new Intl.DateTimeFormat(language === 'pt' ? 'pt-BR' : language === 'es' ? 'es-ES' : 'en-GB', { timeZone: 'America/Sao_Paulo', day: '2-digit', month: '2-digit', year: 'numeric' }).format(date)
    : '';
  const teams = `${match.home_team} ${language === 'pt' ? 'x' : 'vs'} ${match.away_team}`;
  const datedVenue = `${venue}${dateLabel ? ` · ${dateLabel}` : ''}`;
  if (language === 'pt') return {
    title: `${teams}: Ingressos ${datedVenue} | Tocorime Rio`,
    description: `Ingresso para ${teams} no ${venue}${dateLabel ? ` em ${dateLabel}` : ''}. Consulte setores, preços e disponibilidade dos pacotes com transporte e guia.`,
    venue,
  };
  if (language === 'es') return {
    title: `${teams}: Entradas ${datedVenue} | Tocorime Rio`,
    description: `Entradas para ${teams} en ${venue}${dateLabel ? ` el ${dateLabel}` : ''}. Consulta sectores, precios y disponibilidad de paquetes con transporte y guía.`,
    venue,
  };
  return {
    title: `${teams}: ${datedVenue} Tickets | Tocorime Rio`,
    description: `Tickets for ${teams} at ${venue}${dateLabel ? ` on ${dateLabel}` : ''}. Check seating, prices and availability of matchday packages with transport and a guide.`,
    venue,
  };
}