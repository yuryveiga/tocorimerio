import type { Match } from "@/hooks/useMatches";
import { getMatchEventStatus } from "./matchEventStatus";

export const FLAMENGO_ESTUDIANTES_PATH = "/flamengo-x-estudiantes-libertadores-maracana";
export const FLAMENGO_ESTUDIANTES_SLUG = "flamengo-vs-estudiantes-de-la-plata-2026-10-22";
export const FLAMENGO_ESTUDIANTES_BUY_URL = `https://tocorimerio.com/match/${FLAMENGO_ESTUDIANTES_SLUG}`;
export const FLAMENGO_ESTUDIANTES_CANONICAL = `https://tocorimerio.com${FLAMENGO_ESTUDIANTES_PATH}`;

// Exibe o nome oficial da competição (Libertadores) em vez do rótulo interno do cadastro.
export function getFlamengoEstudiantesCompetitionLabel(competition?: string | null) {
  if (!competition) return "";
  return /libertadores/i.test(competition) ? "Libertadores" : competition;
}

export const flamengoEstudiantesCopy = {
  pt: {
    title: "Flamengo x Estudiantes no Maracanã: Ingressos | Tocorime Rio",
    description: "Flamengo x Estudiantes de la Plata no Maracanã pela Libertadores: consulte data, horário, preços e disponibilidade atualizados. Escolha seu pacote e reserve online com a Tocorime Rio.",
    intro: "Flamengo e Estudiantes de la Plata se enfrentam no Maracanã em uma noite decisiva de Copa Libertadores no Rio de Janeiro. Confira os dados do jogo e consulte os pacotes disponíveis para viver essa partida de perto.",
    buy: "Ver ingressos e disponibilidade", from: "A partir de", perPerson: "por pessoa", details: "Informações do jogo", date: "Data e horário", venue: "Estádio", competition: "Competição", included: "O que está incluso", ticket: "Ingresso para o jogo", transfer: "Transporte de ida e volta", guide: "Acompanhamento de guia", about: "Flamengo x Estudiantes no Maracanã", planning: "Prepare sua ida ao estádio", planningText: "Confira o setor e os serviços de cada pacote antes de reservar. Leve seu documento de identificação e verifique as orientações de acesso e o ponto de encontro na página de compra. A programação do jogo pode sofrer alterações; consulte os dados atualizados antes de sair.",
    aboutText: "Para quem procura ingressos para Flamengo x Estudiantes no Rio, o Maracanã reúne a maior torcida do Brasil e a tradição de um dos clubes mais vencedores da Argentina em noites de Libertadores. Escolher o setor e planejar o deslocamento com antecedência ajuda a aproveitar a chegada ao estádio e o ambiente das torcidas.",
    faq: "Perguntas frequentes", faqBuy: "Como comprar ingressos para Flamengo x Estudiantes?", faqBuyAnswer: "Acesse a página de compra do jogo para consultar setores, preços e disponibilidade. Escolha o pacote e conclua a reserva por lá.", faqServices: "Todos os pacotes incluem os mesmos serviços?", faqServicesAnswer: "Confira a descrição do pacote escolhido na página de compra. Os serviços e as condições podem variar de acordo com o setor e a opção selecionada.", faqWhen: "Quando e onde acontece Flamengo x Estudiantes?", unavailable: "Consulte a disponibilidade na página de compra.", loading: "Consultando informações do jogo…", calendar: "Calendário de jogos", football: "Experiências de futebol no Rio", home: "Início", final: "Escolha seu lugar para Flamengo x Estudiantes",
  },
  en: {
    title: "Flamengo vs Estudiantes at Maracanã: Tickets | Tocorime Rio",
    description: "Flamengo vs Estudiantes de la Plata at Maracanã in the Copa Libertadores: check the match date, kick-off time, current prices and availability. Choose your package and book with Tocorime Rio.",
    intro: "Flamengo and Estudiantes de la Plata face off at Maracanã for a decisive Copa Libertadores night in Rio de Janeiro. Check the match details and available packages to experience the game in person.",
    buy: "Check tickets and availability", from: "From", perPerson: "per person", details: "Match information", date: "Date and kick-off", venue: "Stadium", competition: "Competition", included: "What is included", ticket: "Match ticket", transfer: "Round-trip transport", guide: "Guide assistance", about: "Flamengo vs Estudiantes at Maracanã", planning: "Plan your stadium visit", planningText: "Check the seating sector and services in each package before booking. Bring your identification and review entry instructions and the meeting point on the booking page. Match schedules may change; check the latest details before leaving.",
    aboutText: "For visitors looking for Flamengo vs Estudiantes tickets in Rio, Maracanã brings together Brazil's biggest fanbase and one of Argentina's most successful clubs on a Libertadores night. Choosing your seating sector and planning transport in advance helps you enjoy the arrival at the stadium and the atmosphere in the stands.",
    faq: "Frequently asked questions", faqBuy: "How can I buy Flamengo vs Estudiantes tickets?", faqBuyAnswer: "Visit the match booking page to check seating sectors, prices and availability. Select your package and complete your reservation there.", faqServices: "Do all packages include the same services?", faqServicesAnswer: "Check the description of your selected package on the booking page. Services and conditions may vary by seating sector and package.", faqWhen: "When and where is Flamengo vs Estudiantes?", unavailable: "Check availability on the booking page.", loading: "Checking match information…", calendar: "Match calendar", football: "Football experiences in Rio", home: "Home", final: "Choose your place for Flamengo vs Estudiantes",
  },
  es: {
    title: "Flamengo vs Estudiantes en el Maracaná: Entradas | Tocorime Rio",
    description: "Flamengo vs Estudiantes de La Plata en el Maracaná por la Copa Libertadores: consulta fecha, horario, precios y disponibilidad actualizados. Elige tu paquete y reserva con Tocorime Rio.",
    intro: "Flamengo y Estudiantes de La Plata se enfrentan en el Maracaná en una noche decisiva de Copa Libertadores en Río de Janeiro. Consulta los datos del partido y los paquetes disponibles para vivirlo de cerca.",
    buy: "Ver entradas y disponibilidad", from: "Desde", perPerson: "por persona", details: "Información del partido", date: "Fecha y horario", venue: "Estadio", competition: "Competición", included: "Qué está incluido", ticket: "Entrada para el partido", transfer: "Transporte de ida y vuelta", guide: "Acompañamiento de guía", about: "Flamengo vs Estudiantes en el Maracaná", planning: "Prepara tu visita al estadio", planningText: "Revisa el sector y los servicios de cada paquete antes de reservar. Lleva tu documento de identidad y consulta las indicaciones de acceso y el punto de encuentro en la página de compra. La programación puede cambiar; verifica los datos actualizados antes de salir.",
    aboutText: "Para quienes buscan entradas para Flamengo vs Estudiantes en Río, el Maracaná reúne a la hinchada más grande de Brasil y la tradición de uno de los clubes más ganadores de Argentina en noches de Libertadores. Elegir el sector y planificar el traslado con antelación ayuda a disfrutar de la llegada al estadio y el ambiente de las hinchadas.",
    faq: "Preguntas frecuentes", faqBuy: "¿Cómo comprar entradas para Flamengo vs Estudiantes?", faqBuyAnswer: "Accede a la página de compra del partido para consultar sectores, precios y disponibilidad. Elige tu paquete y completa la reserva allí.", faqServices: "¿Todos los paquetes incluyen los mismos servicios?", faqServicesAnswer: "Consulta la descripción del paquete elegido en la página de compra. Los servicios y condiciones pueden variar según el sector y la opción seleccionada.", faqWhen: "¿Cuándo y dónde se juega Flamengo vs Estudiantes?", unavailable: "Consulta la disponibilidad en la página de compra.", loading: "Consultando información del partido…", calendar: "Calendario de partidos", football: "Experiencias de fútbol en Río", home: "Inicio", final: "Elige tu lugar para Flamengo vs Estudiantes",
  },
};

export function buildFlamengoEstudiantesEvent(match: Match, description: string, image: string) {
  const price = Number(match.min_price ?? match.price);
  const remaining = Math.max(0, match.available_spots - match.sold_count);
  const canBuy = remaining > 0 && match.status === "available" && new Date(match.match_date).getTime() > Date.now();
  return {
    "@context": "https://schema.org", "@type": "SportsEvent",
    name: `${match.home_team} x ${match.away_team}`, description,
    startDate: match.match_date, url: FLAMENGO_ESTUDIANTES_CANONICAL, image: [image],
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: getMatchEventStatus(match.status),
    location: { "@type": "Place", name: match.stadium || match.venue, address: { "@type": "PostalAddress", addressLocality: "Rio de Janeiro", addressRegion: "RJ", addressCountry: "BR" } },
    homeTeam: { "@type": "SportsTeam", name: match.home_team },
    awayTeam: { "@type": "SportsTeam", name: match.away_team },
    performer: [{ "@type": "SportsTeam", name: match.home_team }, { "@type": "SportsTeam", name: match.away_team }],
    ...(price > 0 ? { offers: { "@type": "Offer", url: FLAMENGO_ESTUDIANTES_BUY_URL, price, priceCurrency: "BRL", availability: canBuy ? "https://schema.org/InStock" : "https://schema.org/SoldOut", validFrom: new Date().toISOString() } } : {}),
  };
}
