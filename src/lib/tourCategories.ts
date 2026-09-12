import { slugify } from "@/utils/slugify";

/**
 * Taxonomia comercial única dos passeios.
 *
 * O `slug` é a URL estável da categoria (`/passeios/<slug>`) e NÃO muda quando o
 * rótulo visível muda. `dbValues` são os textos aceitos na coluna `tours.category`
 * (o primeiro é o canônico; os demais são valores legados que continuam funcionando).
 *
 * "Private" não é categoria: todos os passeios são privativos. Isso é atributo do
 * produto (badge "Private & Exclusive") e tem o hub /private-tours-rio-de-janeiro.
 */

export type CategoryLang = "pt" | "en" | "es";

export interface TourCategory {
  slug: string;
  dbValues: string[];
  label: Record<CategoryLang, string>;
  h1: Record<CategoryLang, string>;
  intro: Record<CategoryLang, string>;
  title: Record<CategoryLang, string>;
  description: Record<CategoryLang, string>;
}

export const TOUR_CATEGORIES: TourCategory[] = [
  {
    slug: "city-tour",
    dbValues: ["CITY TOUR", "CITY TOURS"],
    label: { pt: "City Tours", en: "City Tours", es: "City Tours" },
    h1: {
      pt: "City Tours no Rio de Janeiro",
      en: "City Tours in Rio de Janeiro",
      es: "City Tours en Río de Janeiro",
    },
    intro: {
      pt: "Os cartões-postais do Rio em um único roteiro: Cristo Redentor, Pão de Açúcar e mirantes, sempre com guia local e transporte privativo. Compare duração e preço inicial e reserve a data que quiser.",
      en: "Rio's landmarks in one itinerary: Christ the Redeemer, Sugarloaf and the best viewpoints, always with a local guide and private transport. Compare duration and starting price, then pick your date.",
      es: "Los grandes iconos de Río en un solo itinerario: Cristo Redentor, Pan de Azúcar y miradores, siempre con guía local y transporte privado. Compara duración y precio inicial y elige tu fecha.",
    },
    title: {
      pt: "City Tour no Rio de Janeiro | Tours Privativos | Tocorime Rio",
      en: "City Tours in Rio de Janeiro | Private Guided Tours | Tocorime Rio",
      es: "City Tour en Río de Janeiro | Tours Privados | Tocorime Rio",
    },
    description: {
      pt: "City tours privativos no Rio de Janeiro com guia local: Cristo Redentor, Pão de Açúcar e mirantes. Veja duração, preço inicial e reserve online.",
      en: "Private city tours in Rio de Janeiro with a local guide: Christ the Redeemer, Sugarloaf and the best viewpoints. Compare duration, starting price and book online.",
      es: "City tours privados en Río de Janeiro con guía local: Cristo Redentor, Pan de Azúcar y miradores. Mira duración, precio inicial y reserva online.",
    },
  },
  {
    // URL mantida (/passeios/trilha e /hiking) — rótulo agora é Hiking & Nature.
    slug: "trilha",
    dbValues: ["TRILHA", "HIKING & NATURE"],
    label: { pt: "Trilhas & Natureza", en: "Hiking & Nature", es: "Senderismo y Naturaleza" },
    h1: {
      pt: "Trilhas e Natureza no Rio de Janeiro",
      en: "Hiking Tours in Rio de Janeiro",
      es: "Senderismo en Río de Janeiro",
    },
    intro: {
      pt: "Trilhas guiadas, escalada e cachoeiras com guia credenciado e grupo privativo. Cada experiência mostra duração, nível de dificuldade e preço inicial para você escolher a certa.",
      en: "Guided trails, rock climbing and waterfalls with a certified guide and a private group. Every experience shows duration, difficulty level and starting price so you can pick the right one.",
      es: "Senderos guiados, escalada y cascadas con guía acreditado y grupo privado. Cada experiencia muestra duración, nivel de dificultad y precio inicial para que elijas la ideal.",
    },
    title: {
      pt: "Trilhas no Rio de Janeiro | Hiking Privativo | Tocorime Rio",
      en: "Hiking in Rio de Janeiro | Private Guided Trails | Tocorime Rio",
      es: "Senderismo en Río de Janeiro | Rutas Privadas | Tocorime Rio",
    },
    description: {
      pt: "Trilhas privativas no Rio de Janeiro com guia credenciado: Pedra da Gávea, Pedra Bonita, Pico da Tijuca, escalada e cachoeiras. Duração, dificuldade e preço.",
      en: "Private hiking tours in Rio de Janeiro with a certified guide: Pedra da Gávea, Pedra Bonita, Tijuca Peak, rock climbing and waterfalls. Duration, difficulty and price.",
      es: "Senderismo privado en Río de Janeiro con guía acreditado: Pedra da Gávea, Pedra Bonita, Pico da Tijuca, escalada y cascadas. Duración, dificultad y precio.",
    },
  },
  {
    slug: "culture-history",
    dbValues: ["CULTURE & HISTORY"],
    label: { pt: "Cultura & História", en: "Culture & History", es: "Cultura e Historia" },
    h1: {
      pt: "Cultura e História no Rio de Janeiro",
      en: "Culture & History Tours in Rio de Janeiro",
      es: "Cultura e Historia en Río de Janeiro",
    },
    intro: {
      pt: "Centro histórico, Pequena África e comunidades vivas, contados por quem nasceu e vive no Rio. Tours a pé ou com transporte privativo, sempre em grupo fechado.",
      en: "The historic centre, Little Africa and living communities, told by people born and raised in Rio. Walking or private-transport tours, always in a closed group.",
      es: "Centro histórico, Pequeña África y comunidades vivas, contados por quien nació y vive en Río. Tours a pie o con transporte privado, siempre en grupo cerrado.",
    },
    title: {
      pt: "Tours de Cultura e História no Rio | Tocorime Rio",
      en: "Culture & History Tours in Rio de Janeiro | Tocorime Rio",
      es: "Tours de Cultura e Historia en Río | Tocorime Rio",
    },
    description: {
      pt: "Tours privativos de cultura e história no Rio de Janeiro: centro histórico, Pequena África e Rocinha, com guias locais. Veja duração, preço e reserve.",
      en: "Private culture and history tours in Rio de Janeiro: historic centre, Little Africa and Rocinha, with local guides. Check duration, price and book online.",
      es: "Tours privados de cultura e historia en Río de Janeiro: centro histórico, Pequeña África y Rocinha, con guías locales. Mira duración, precio y reserva.",
    },
  },
  {
    slug: "sailing-boat-tours",
    dbValues: ["SAILING & BOAT TOURS"],
    label: { pt: "Veleiro & Barco", en: "Sailing & Boat Tours", es: "Vela y Barcos" },
    h1: {
      pt: "Passeios de Veleiro e Barco no Rio de Janeiro",
      en: "Sailing & Boat Tours in Rio de Janeiro",
      es: "Paseos en Velero y Barco en Río de Janeiro",
    },
    intro: {
      pt: "O Rio visto da água: Baía de Guanabara e Ilhas Cagarras em veleiro privativo, com tripulação e paradas para banho. Compare duração e preço por barco.",
      en: "Rio seen from the water: Guanabara Bay and the Cagarras Islands on a private sailboat, with crew and swim stops. Compare duration and price per boat.",
      es: "Río visto desde el agua: Bahía de Guanabara e Islas Cagarras en velero privado, con tripulación y paradas de baño. Compara duración y precio por barco.",
    },
    title: {
      pt: "Passeio de Veleiro no Rio de Janeiro | Tocorime Rio",
      en: "Sailing Tours in Rio de Janeiro | Private Boat Trips | Tocorime Rio",
      es: "Paseo en Velero en Río de Janeiro | Tocorime Rio",
    },
    description: {
      pt: "Passeios privativos de veleiro no Rio de Janeiro: Baía de Guanabara e Ilhas Cagarras, com tripulação e paradas para banho. Veja duração e preço.",
      en: "Private sailing tours in Rio de Janeiro: Guanabara Bay and Cagarras Islands, with crew and swim stops. Check duration, price and availability.",
      es: "Paseos privados en velero en Río de Janeiro: Bahía de Guanabara e Islas Cagarras, con tripulación y paradas de baño. Mira duración y precio.",
    },
  },
  {
    slug: "food-coffee",
    dbValues: ["FOOD & COFFEE"],
    label: { pt: "Gastronomia & Café", en: "Food & Coffee", es: "Gastronomía y Café" },
    h1: {
      pt: "Gastronomia e Café no Rio de Janeiro",
      en: "Food & Coffee Tours in Rio de Janeiro",
      es: "Gastronomía y Café en Río de Janeiro",
    },
    intro: {
      pt: "Degustação de cafés especiais brasileiros e sabores cariocas com curadoria de guias locais. Experiências curtas, privativas e fáceis de encaixar no seu dia.",
      en: "Brazilian specialty coffee tastings and Rio flavours curated by local guides. Short, private experiences that fit easily into your day.",
      es: "Cata de cafés especiales brasileños y sabores cariocas con curaduría de guías locales. Experiencias cortas, privadas y fáciles de encajar en tu día.",
    },
    title: {
      pt: "Tour de Café e Gastronomia no Rio | Tocorime Rio",
      en: "Coffee & Food Tours in Rio de Janeiro | Tocorime Rio",
      es: "Tour de Café y Gastronomía en Río | Tocorime Rio",
    },
    description: {
      pt: "Degustação de café brasileiro e experiências gastronômicas privativas no Rio de Janeiro, com guia local. Veja duração, preço inicial e reserve.",
      en: "Brazilian coffee tasting and private food experiences in Rio de Janeiro with a local guide. Check duration, starting price and book online.",
      es: "Cata de café brasileño y experiencias gastronómicas privadas en Río de Janeiro con guía local. Mira duración, precio inicial y reserva.",
    },
  },
  {
    slug: "football-maracana",
    dbValues: ["FOOTBALL & MARACANÃ", "FUTEBOL"],
    label: { pt: "Futebol & Maracanã", en: "Football & Maracanã", es: "Fútbol y Maracaná" },
    h1: {
      pt: "Futebol e Maracanã no Rio de Janeiro",
      en: "Football & Maracanã Experiences in Rio de Janeiro",
      es: "Fútbol y Maracaná en Río de Janeiro",
    },
    intro: {
      pt: "Jogo no Maracanã com ingresso oficial, transporte e guia bilíngue do começo ao fim. Veja o calendário de partidas para escolher a data.",
      en: "Matchday at the Maracanã with an official ticket, transport and a bilingual guide from start to finish. Check the match calendar to pick your date.",
      es: "Partido en el Maracaná con entrada oficial, transporte y guía bilingüe de principio a fin. Consulta el calendario para elegir tu fecha.",
    },
    title: {
      pt: "Jogo no Maracanã com Guia | Experiência Completa | Tocorime Rio",
      en: "Maracanã Football Experience | Ticket, Transport & Guide | Tocorime Rio",
      es: "Partido en el Maracaná con Guía | Experiencia Completa | Tocorime Rio",
    },
    description: {
      pt: "Assista a um jogo no Maracanã com ingresso oficial, transporte e guia bilíngue. Veja as datas disponíveis e reserve sua experiência.",
      en: "Watch a match at the Maracanã with an official ticket, transport and a bilingual guide. Check available dates and book your experience.",
      es: "Vive un partido en el Maracaná con entrada oficial, transporte y guía bilingüe. Consulta las fechas disponibles y reserva.",
    },
  },
  {
    slug: "transfers",
    dbValues: ["TRANSFERS", "TRANSFER"],
    label: { pt: "Transfers", en: "Transfers", es: "Traslados" },
    h1: {
      pt: "Transfers no Rio de Janeiro",
      en: "Private Transfers in Rio de Janeiro",
      es: "Traslados en Río de Janeiro",
    },
    intro: {
      pt: "Transfer privativo de aeroporto, porto e dentro da cidade, com motorista aguardando na chegada. Preço fechado, sem surpresa e sem fila de táxi.",
      en: "Private airport, cruise port and in-city transfers with a driver waiting on arrival. Fixed price, no surprises and no taxi queues.",
      es: "Traslado privado de aeropuerto, puerto y dentro de la ciudad, con conductor esperando a la llegada. Precio fijo, sin sorpresas ni colas de taxi.",
    },
    title: {
      pt: "Transfer Aeroporto Rio de Janeiro | Privativo | Tocorime Rio",
      en: "Airport Transfer Rio de Janeiro | Private Transfers | Tocorime Rio",
      es: "Traslado Aeropuerto Río de Janeiro | Privado | Tocorime Rio",
    },
    description: {
      pt: "Transfer privativo no Rio de Janeiro: aeroporto, porto e city. Motorista aguardando na chegada e preço fechado. Solicite sua reserva.",
      en: "Private transfers in Rio de Janeiro: airport, cruise port and in-city. Driver waiting on arrival, fixed price. Request your booking.",
      es: "Traslados privados en Río de Janeiro: aeropuerto, puerto y ciudad. Conductor esperando a la llegada y precio fijo. Solicita tu reserva.",
    },
  },
  {
    // URL mantida (/passeios/um-dia e /one-day) — rótulo agora é Day Trips.
    slug: "um-dia",
    dbValues: ["UM DIA", "DAY TRIPS"],
    label: { pt: "Passeios de Um Dia", en: "Day Trips", es: "Excursiones de un Día" },
    h1: {
      pt: "Passeios de Um Dia saindo do Rio de Janeiro",
      en: "Day Trips from Rio de Janeiro",
      es: "Excursiones de un Día desde Río de Janeiro",
    },
    intro: {
      pt: "Bate e volta com transporte privativo e guia: Niterói, Arraial do Cabo e arredores em um único dia. Compare duração e preço inicial e reserve a data.",
      en: "Full-day trips with private transport and a guide: Niterói, Arraial do Cabo and beyond in a single day. Compare duration and starting price, then book.",
      es: "Excursiones de día completo con transporte privado y guía: Niterói, Arraial do Cabo y alrededores en un solo día. Compara duración y precio y reserva.",
    },
    title: {
      pt: "Passeios de Um Dia no Rio de Janeiro | Bate e Volta | Tocorime Rio",
      en: "Day Trips from Rio de Janeiro | Full-Day Private Tours | Tocorime Rio",
      es: "Excursiones de un Día desde Río | Tocorime Rio",
    },
    description: {
      pt: "Bate e volta saindo do Rio de Janeiro com transporte privativo e guia bilíngue: Niterói, Arraial do Cabo e mais. Duração, preço e reserva online.",
      en: "Full-day trips from Rio de Janeiro with private transport and a bilingual guide: Niterói, Arraial do Cabo and more. Duration, price and online booking.",
      es: "Excursiones de un día desde Río de Janeiro con transporte privado y guía bilingüe: Niterói, Arraial do Cabo y más. Duración, precio y reserva.",
    },
  },
];

const bySlug = new Map(TOUR_CATEGORIES.map((c) => [c.slug, c]));

const byDbValue = new Map<string, TourCategory>();
TOUR_CATEGORIES.forEach((c) => {
  c.dbValues.forEach((v) => byDbValue.set(v.trim().toUpperCase(), c));
  byDbValue.set(slugify(c.slug), c);
  c.dbValues.forEach((v) => byDbValue.set(slugify(v), c));
});

export function getCategoryBySlug(slug?: string | null): TourCategory | undefined {
  if (!slug) return undefined;
  return bySlug.get(slug) || byDbValue.get(slugify(slug));
}

/** Categoria a partir do valor salvo em `tours.category`. */
export function getCategoryByValue(value?: string | null): TourCategory | undefined {
  if (!value) return undefined;
  return byDbValue.get(value.trim().toUpperCase()) || byDbValue.get(slugify(value));
}

function lang(language: string): CategoryLang {
  return language === "pt" || language === "es" ? language : "en";
}

/** Rótulo visível da categoria; cai no valor bruto se for uma categoria nova/custom. */
export function getCategoryLabel(value?: string | null, language = "en"): string {
  const cat = getCategoryByValue(value);
  if (!cat) return (value || "").trim();
  return cat.label[lang(language)];
}

export function getCategoryCopy(cat: TourCategory, language: string) {
  const l = lang(language);
  return {
    label: cat.label[l],
    h1: cat.h1[l],
    intro: cat.intro[l],
    title: cat.title[l],
    description: cat.description[l],
  };
}

/** Slug de URL da categoria (`/passeios/<slug>`) a partir do valor do banco. */
export function getCategorySlug(value?: string | null): string {
  return getCategoryByValue(value)?.slug || slugify(value || "");
}

/** Ordem comercial das categorias, usada nos filtros e nos links do hub. */
export function sortCategoryValues(values: string[]): string[] {
  const order = new Map(TOUR_CATEGORIES.map((c, i) => [c.slug, i]));
  return [...values].sort((a, b) => {
    const ia = order.get(getCategorySlug(a)) ?? 999;
    const ib = order.get(getCategorySlug(b)) ?? 999;
    if (ia !== ib) return ia - ib;
    return a.localeCompare(b);
  });
}
