import type { Match } from "@/hooks/useMatches";
import { getMatchEventDetails, getMatchEventStatus } from "./matchEventStatus";

export const VASCO_BOCA_PATH = "/vasco-x-boca-sulamericana-maracana";
export const VASCO_BOCA_SLUG = "vasco-da-gama-vs-boca-juniors-2026-10-20";
export const VASCO_BOCA_BUY_URL = `https://tocorimerio.com/match/${VASCO_BOCA_SLUG}`;
export const VASCO_BOCA_CANONICAL = `https://tocorimerio.com${VASCO_BOCA_PATH}`;

// Exibe o nome oficial da competição (Sulamericana) em vez do rótulo interno do cadastro.
export function getVascoBocaCompetitionLabel(competition?: string | null) {
  if (!competition) return "";
  return /sul[\s-]*amer/i.test(competition) ? "Sulamericana" : competition;
}

export const vascoBocaCopy = {
  pt: {
    title: "Vasco x Boca Juniors no Maracanã: Ingressos | Tocorime Rio",
    description: "Vasco x Boca Juniors no Maracanã: consulte data, horário, preços e disponibilidade atualizados. Escolha seu pacote e reserve online com a Tocorime Rio.",
    intro: "Vasco da Gama e Boca Juniors se encontram no Maracanã em uma noite de futebol sul-americano no Rio de Janeiro. Confira os dados do jogo e consulte os pacotes disponíveis para acompanhar a partida de perto.",
    buy: "Ver ingressos e disponibilidade", from: "A partir de", perPerson: "por pessoa", details: "Informações do jogo", date: "Data e horário", venue: "Estádio", competition: "Competição", included: "O que está incluso", ticket: "Ingresso para o jogo", transfer: "Transporte de ida e volta", guide: "Acompanhamento de guia", about: "Vasco x Boca no Maracanã", planning: "Prepare sua ida ao estádio", planningText: "Confira o setor e os serviços de cada pacote antes de reservar. Leve seu documento de identificação e verifique as orientações de acesso e o ponto de encontro na página de compra. A programação do jogo pode sofrer alterações; consulte os dados atualizados antes de sair.",
    aboutText: "Para quem procura ingressos para Vasco x Boca Juniors no Rio, o Maracanã reúne a tradição do futebol carioca e a presença de um dos clubes mais conhecidos da Argentina. Escolher o setor e planejar o deslocamento com antecedência ajuda a aproveitar a chegada ao estádio e o ambiente das torcidas.",
    faq: "Perguntas frequentes", faqBuy: "Como comprar ingressos para Vasco x Boca?", faqBuyAnswer: "Acesse a página de compra do jogo para consultar setores, preços e disponibilidade. Escolha o pacote e conclua a reserva por lá.", faqServices: "Todos os pacotes incluem os mesmos serviços?", faqServicesAnswer: "Confira a descrição do pacote escolhido na página de compra. Os serviços e as condições podem variar de acordo com o setor e a opção selecionada.", faqWhen: "Quando e onde acontece Vasco x Boca?", unavailable: "Consulte a disponibilidade na página de compra.", loading: "Consultando informações do jogo…", calendar: "Calendário de jogos", football: "Experiências de futebol no Rio", home: "Início", final: "Escolha seu lugar para Vasco x Boca",
  },
  en: {
    title: "Vasco vs Boca Juniors at Maracanã: Tickets | Tocorime Rio",
    description: "Vasco vs Boca Juniors at Maracanã: check the match date, kick-off time, current prices and availability. Choose your package and book with Tocorime Rio.",
    intro: "Vasco da Gama and Boca Juniors meet at Maracanã for a night of South American football in Rio de Janeiro. Check the match details and available packages to experience the game in person.",
    buy: "Check tickets and availability", from: "From", perPerson: "per person", details: "Match information", date: "Date and kick-off", venue: "Stadium", competition: "Competition", included: "What is included", ticket: "Match ticket", transfer: "Round-trip transport", guide: "Guide assistance", about: "Vasco vs Boca at Maracanã", planning: "Plan your stadium visit", planningText: "Check the seating sector and services in each package before booking. Bring your identification and review entry instructions and the meeting point on the booking page. Match schedules may change; check the latest details before leaving.",
    aboutText: "For visitors looking for Vasco vs Boca Juniors tickets in Rio, Maracanã brings together Rio's football tradition and one of Argentina's best-known clubs. Choosing your seating sector and planning transport in advance helps you enjoy the arrival at the stadium and the atmosphere in the stands.",
    faq: "Frequently asked questions", faqBuy: "How can I buy Vasco vs Boca tickets?", faqBuyAnswer: "Visit the match booking page to check seating sectors, prices and availability. Select your package and complete your reservation there.", faqServices: "Do all packages include the same services?", faqServicesAnswer: "Check the description of your selected package on the booking page. Services and conditions may vary by seating sector and package.", faqWhen: "When and where is Vasco vs Boca?", unavailable: "Check availability on the booking page.", loading: "Checking match information…", calendar: "Match calendar", football: "Football experiences in Rio", home: "Home", final: "Choose your place for Vasco vs Boca",
  },
  es: {
    title: "Vasco vs Boca Juniors en el Maracaná: Entradas | Tocorime Rio",
    description: "Vasco vs Boca Juniors en el Maracaná: consulta fecha, horario, precios y disponibilidad actualizados. Elige tu paquete y reserva con Tocorime Rio.",
    intro: "Vasco da Gama y Boca Juniors se encuentran en el Maracaná para una noche de fútbol sudamericano en Río de Janeiro. Consulta los datos del partido y los paquetes disponibles para vivirlo de cerca.",
    buy: "Ver entradas y disponibilidad", from: "Desde", perPerson: "por persona", details: "Información del partido", date: "Fecha y horario", venue: "Estadio", competition: "Competición", included: "Qué está incluido", ticket: "Entrada para el partido", transfer: "Transporte de ida y vuelta", guide: "Acompañamiento de guía", about: "Vasco vs Boca en el Maracaná", planning: "Prepara tu visita al estadio", planningText: "Revisa el sector y los servicios de cada paquete antes de reservar. Lleva tu documento de identidad y consulta las indicaciones de acceso y el punto de encuentro en la página de compra. La programación puede cambiar; verifica los datos actualizados antes de salir.",
    aboutText: "Para quienes buscan entradas para Vasco vs Boca Juniors en Río, el Maracaná reúne la tradición del fútbol carioca y uno de los clubes más conocidos de Argentina. Elegir el sector y planificar el traslado con antelación ayuda a disfrutar de la llegada al estadio y el ambiente de las hinchadas.",
    faq: "Preguntas frecuentes", faqBuy: "¿Cómo comprar entradas para Vasco vs Boca?", faqBuyAnswer: "Accede a la página de compra del partido para consultar sectores, precios y disponibilidad. Elige tu paquete y completa la reserva allí.", faqServices: "¿Todos los paquetes incluyen los mismos servicios?", faqServicesAnswer: "Consulta la descripción del paquete elegido en la página de compra. Los servicios y condiciones pueden variar según el sector y la opción seleccionada.", faqWhen: "¿Cuándo y dónde se juega Vasco vs Boca?", unavailable: "Consulta la disponibilidad en la página de compra.", loading: "Consultando información del partido…", calendar: "Calendario de partidos", football: "Experiencias de fútbol en Río", home: "Inicio", final: "Elige tu lugar para Vasco vs Boca",
  },
};

export function buildVascoBocaEvent(match: Match, description: string, image: string) {
  const price = Number(match.min_price ?? match.price);
  const remaining = Math.max(0, match.available_spots - match.sold_count);
  const canBuy = remaining > 0 && match.status === "available" && new Date(match.match_date).getTime() > Date.now();
  return {
    "@context": "https://schema.org", "@type": "SportsEvent",
    name: `${match.home_team} x ${match.away_team}`, description,
    startDate: match.match_date, url: VASCO_BOCA_CANONICAL, image: [image],
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: getMatchEventStatus(match.status),
    ...getMatchEventDetails(match.match_date, match.home_team),
    location: { "@type": "Place", name: match.stadium || match.venue, address: { "@type": "PostalAddress", addressLocality: "Rio de Janeiro", addressRegion: "RJ", addressCountry: "BR" } },
    homeTeam: { "@type": "SportsTeam", name: match.home_team },
    awayTeam: { "@type": "SportsTeam", name: match.away_team },
    performer: [{ "@type": "SportsTeam", name: match.home_team }, { "@type": "SportsTeam", name: match.away_team }],
    ...(price > 0 ? { offers: { "@type": "Offer", url: VASCO_BOCA_BUY_URL, price, priceCurrency: "BRL", availability: canBuy ? "https://schema.org/InStock" : "https://schema.org/SoldOut", validFrom: new Date().toISOString() } } : {}),
  };
}