/**
 * Blog → Tour funnel mapping.
 *
 * Maps a blog article (slug / title / tags) to the commercial experience that
 * best matches its search intent, so every article can point readers to a
 * concrete "Check Availability" step:
 *
 *   Google → Blog → Tour → Check Availability → Booking
 *
 * Rules are ordered: the first matching rule wins, and extra rules add
 * secondary suggestions. Only ACTIVE tour slugs are used; when a topic has no
 * tour (e.g. multi-day itineraries) the target is a commercial landing page.
 */

export type BlogTourTarget =
  | { type: "tour"; slug: string }
  | { type: "page"; path: string; label: Record<string, string> };

type Rule = {
  /** Lowercase keywords matched against slug + title + tags. */
  keywords: string[];
  targets: BlogTourTarget[];
};

const CUSTOM_TOUR: BlogTourTarget = {
  type: "page",
  path: "/custom-private-tour-rio-de-janeiro",
  label: {
    pt: "Tour privativo personalizado no Rio",
    en: "Custom Private Tour in Rio de Janeiro",
    es: "Tour privado personalizado en Río",
  },
};

const PRIVATE_TOURS: BlogTourTarget = {
  type: "page",
  path: "/private-tours-rio-de-janeiro",
  label: {
    pt: "Passeios privativos no Rio de Janeiro",
    en: "Private Tours in Rio de Janeiro",
    es: "Tours privados en Río de Janeiro",
  },
};

const RULES: Rule[] = [
  // Rocinha / favela articles → Rocinha Favela Tour
  {
    keywords: ["rocinha", "favela", "comunidade"],
    targets: [{ type: "tour", slug: "favela-rio-tour-rocinha" }],
  },
  // Maracanã / football articles → Maracanã MatchDay + fixture calendar
  {
    keywords: ["maracana", "maracanã", "football", "futebol", "soccer", "flamengo", "fluminense", "vasco", "botafogo", "ingressos", "tickets", "copa do mundo", "world cup", "matchday", "estadio", "stadium"],
    targets: [
      { type: "tour", slug: "maracana-matchday" },
      {
        type: "page",
        path: "/maracana-calendario",
        label: {
          pt: "Calendário de jogos e ingressos do Maracanã",
          en: "Maracanã match calendar & tickets",
          es: "Calendario de partidos y entradas de Maracanã",
        },
      },
    ],
  },

  // Tijuca articles → Pico da Tijuca hiking tour
  {
    keywords: ["tijuca", "floresta da tijuca", "tijuca forest", "ecoturismo"],
    targets: [
      { type: "tour", slug: "pico-da-tijuca-hiking-tour-o-ponto-mais-alto-do-parque-nacional-da-tijuca" },
      { type: "tour", slug: "trilha-da-pedra-bonita" },
    ],
  },
  // Hiking articles → hiking tours
  {
    keywords: ["hiking", "hike", "trilha", "trilhas", "trekking", "senderismo", "pedra da gavea", "pedra bonita"],
    targets: [
      { type: "tour", slug: "pedra-da-gavea-trilha" },
      { type: "tour", slug: "pico-da-tijuca-hiking-tour-o-ponto-mais-alto-do-parque-nacional-da-tijuca" },
    ],
  },
  // Christ the Redeemer / Sugarloaf → City Tour Expresso (Christ + Sugarloaf)
  {
    keywords: ["christ", "cristo", "redentor", "corcovado", "sugarloaf", "pao de acucar", "pão de açúcar", "bondinho"],
    targets: [
      { type: "tour", slug: "cristo-redentor-pao-de-acucar" },
      { type: "tour", slug: "amanhecer-no-parque-bondinho" },
    ],
  },
  // Santa Teresa / historic centre / city sightseeing → City Tour
  {
    keywords: ["santa teresa", "city tour", "centro historico", "centro histórico", "historic centre", "historic center", "lapa", "pontos turisticos", "pontos turísticos", "bondinho de santa teresa", "imperial"],
    targets: [
      { type: "tour", slug: "city-tour-rio-completo" },
      { type: "tour", slug: "tour-pe-centro-historico" },
    ],
  },
  // Multi-day itineraries → Custom Private Tour
  {
    keywords: ["3 days", "3 dias", "roteiro", "itinerary", "days in rio", "dias no rio", "one week", "uma semana"],
    targets: [CUSTOM_TOUR],
  },
  // Airport / transport articles → Transfers
  {
    keywords: ["airport", "aeroporto", "transfer", "transporte", "flights", "rotas aereas", "rotas aéreas", "como chegar"],
    targets: [{ type: "tour", slug: "transfer-aeroporto-cidade" }],
  },
  // Coffee articles → Brazilian coffee tasting
  {
    keywords: ["coffee", "cafeteria", "cafeterias", "café", "cafe"],
    targets: [{ type: "tour", slug: "degustacao-de-cafe-brasileiro" }],
  },
  // Food / feijoada / boteco → historic centre walking + city tour (food stops)
  {
    keywords: ["feijoada", "feijoadas", "gastronomia", "comida", "food", "boteco", "botecos", "restaurant", "culinary"],
    targets: [
      { type: "tour", slug: "tour-pe-centro-historico" },
      { type: "tour", slug: "city-tour-rio-completo" },
    ],
  },
  // Sunset / sailing / boat → sailing experiences
  {
    keywords: ["sunset", "por do sol", "pôr do sol", "sailing", "boat", "barco", "veleiro", "guanabara", "cagarras"],
    targets: [
      { type: "tour", slug: "sunset-sailing-rio" },
      { type: "tour", slug: "sailing-rio-ilhas-cagarras" },
    ],
  },
  // Arraial do Cabo / diving
  {
    keywords: ["arraial", "diving", "mergulho", "scuba", "caribe brasileiro"],
    targets: [{ type: "tour", slug: "scuba-diving-in-arraial-do-cabo" }],
  },
  // Niterói
  {
    keywords: ["niteroi", "niterói"],
    targets: [{ type: "tour", slug: "um-dia-em-niteroi" }],
  },
  // Waterfalls
  {
    keywords: ["cachoeira", "cachoeiras", "waterfall", "horto"],
    targets: [{ type: "tour", slug: "cachoeiras-horto" }],
  },
  // Climbing
  {
    keywords: ["escalada", "climbing"],
    targets: [{ type: "tour", slug: "escalada-rocha-rio" }],
  },
  // Afro-Brazilian history and culture
  {
    keywords: ["pequena africa", "pequena áfrica", "afro", "samba", "cultura", "culture", "history", "historia", "história"],
    targets: [{ type: "tour", slug: "pequena-frica-experience-hist-ria-cultura-e-resist-ncia-no-cora-o-do-rio" }],
  },
  // Families / kids, safety, choosing a guide, prices → private / custom tours
  {
    keywords: ["family", "families", "familia", "família", "children", "criancas", "crianças", "kids", "safe", "safety", "seguranca", "segurança", "guide", "guia", "private tour", "tour privado", "quanto custa", "how much"],
    targets: [PRIVATE_TOURS, CUSTOM_TOUR],
  },
];

const normalize = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/-/g, " ");

/**
 * Resolves up to `limit` contextual targets for a post, ordered by relevance.
 * Always returns at least one target so no article is a dead end.
 */
export function resolveBlogTourTargets(
  post: { slug?: string | null; title?: string | null; tags?: string[] | null; excerpt?: string | null },
  limit = 3,
): BlogTourTarget[] {
  const haystack = normalize(
    [post.slug, post.title, post.excerpt, ...(post.tags || [])].filter(Boolean).join(" "),
  );

  const found: BlogTourTarget[] = [];
  const seen = new Set<string>();

  const push = (target: BlogTourTarget) => {
    const key = target.type === "tour" ? `t:${target.slug}` : `p:${target.path}`;
    if (seen.has(key)) return;
    seen.add(key);
    found.push(target);
  };

  for (const rule of RULES) {
    if (rule.keywords.some((kw) => haystack.includes(normalize(kw)))) {
      rule.targets.forEach(push);
    }
    if (found.length >= limit) break;
  }

  if (found.length === 0) {
    push(PRIVATE_TOURS);
    push(CUSTOM_TOUR);
  }

  return found.slice(0, limit);
}

export { CUSTOM_TOUR, PRIVATE_TOURS };
