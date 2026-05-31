export const BASE_URL = "https://tocorimerio.com";

/**
 * Gera uma URL canônica limpa: HTTPS, sem www, sem barra final, sem query.
 * @param path O caminho da página (ex: "/blog/meu-post")
 * @returns A URL canônica completa
 */
export const getCanonicalUrl = (path: string = "") => {
  // Strip query string and hash if accidentally included
  const noQuery = String(path || "").split("?")[0].split("#")[0];
  const cleanPath = noQuery.startsWith("/") ? noQuery : `/${noQuery}`;
  // Remove trailing slash unless it's just the root
  const finalPath = cleanPath === "/" ? "" : cleanPath.replace(/\/+$/g, "");
  return `${BASE_URL}${finalPath}`;
};

/**
 * Corrige slugs de jogos vindos do parceiro que possuem caracteres corrompidos.
 */
export const cleanMatchSlug = (slug: string = "") => {
  if (!slug) return "";
  const slugFixes: Record<string, string> = {
    'vitria': 'vitoria',
    'operrio': 'operario',
    'ferrovirio': 'ferroviario',
    'so-paulo': 'sao-paulo',
  };
  let clean = slug;
  Object.keys(slugFixes).forEach(bad => {
    clean = clean.replace(new RegExp(bad, 'g'), slugFixes[bad]);
  });
  return clean;
};

/**
 * Converte um slug limpo de volta para o formato "sujo" esperado pelo banco do parceiro.
 */
export const uncleanMatchSlug = (slug: string = "") => {
  if (!slug) return "";
  const reverseFixes: Record<string, string> = {
    'vitoria': 'vitria',
    'operario': 'operrio',
    'ferroviario': 'ferrovirio',
    'sao-paulo': 'so-paulo',
  };
  let dirty = slug;
  Object.keys(reverseFixes).forEach(good => {
    dirty = dirty.replace(new RegExp(good, 'g'), reverseFixes[good]);
  });
  return dirty;
};

/**
 * Gera as tags hreflang para SEO multilíngue.
 * O site é uma SPA sem prefixo de idioma na URL, então apontamos
 * todas as variantes para a mesma URL canônica + x-default.
 * Isso sinaliza ao Google que existem versões traduzidas no mesmo path.
 */
export const getHreflangLinks = (path: string = "") => {
  const url = getCanonicalUrl(path);
  return [
    { hreflang: "pt-BR", href: url },
    { hreflang: "en", href: url },
    { hreflang: "es", href: url },
    { hreflang: "x-default", href: url },
  ];
};

/**
 * Gera schema "Article" / "BlogPosting" completo para rich snippets de blog.
 */
export const generateArticleSchema = (params: {
  title: string;
  description: string;
  imageUrl: string;
  url: string;
  datePublished?: string;
  dateModified?: string;
  authorName?: string;
}) => ({
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": params.title,
  "description": params.description,
  "image": params.imageUrl,
  "datePublished": params.datePublished,
  "dateModified": params.dateModified || params.datePublished,
  "author": {
    "@type": "Organization",
    "name": params.authorName || "Tocorime Rio",
    "url": BASE_URL,
  },
  "publisher": {
    "@type": "Organization",
    "name": "Tocorime Rio",
    "logo": {
      "@type": "ImageObject",
      "url": `${BASE_URL}/favicon.png`,
    },
  },
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": params.url,
  },
});

/**
 * Gera schema "SportsEvent" para páginas de jogos / eventos esportivos.
 */
export const generateSportsEventSchema = (params: {
  name: string;
  description: string;
  startDate: string; // ISO
  endDate?: string;
  imageUrl?: string;
  url: string;
  homeTeam: string;
  awayTeam: string;
  venueName?: string;
  venueAddress?: string;
  offerUrl?: string;
  offerPrice?: number;
  offerCurrency?: string;
}) => ({
  "@context": "https://schema.org",
  "@type": "SportsEvent",
  "name": params.name,
  "description": params.description,
  "startDate": params.startDate,
  "endDate": params.endDate || params.startDate,
  "eventStatus": "https://schema.org/EventScheduled",
  "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
  "image": params.imageUrl,
  "url": params.url,
  "location": {
    "@type": "Place",
    "name": params.venueName || "Estádio do Maracanã",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": params.venueAddress || "Av. Pres. Castelo Branco, Portão 3",
      "addressLocality": "Rio de Janeiro",
      "addressRegion": "RJ",
      "postalCode": "20271-130",
      "addressCountry": "BR",
    },
  },
  "homeTeam": { "@type": "SportsTeam", "name": params.homeTeam },
  "awayTeam": { "@type": "SportsTeam", "name": params.awayTeam },
  "performer": [
    { "@type": "SportsTeam", "name": params.homeTeam },
    { "@type": "SportsTeam", "name": params.awayTeam },
  ],
  "competitor": [
    { "@type": "SportsTeam", "name": params.homeTeam },
    { "@type": "SportsTeam", "name": params.awayTeam },
  ],
  "organizer": {
    "@type": "Organization",
    "name": "Tocorime Rio",
    "url": BASE_URL,
  },
  ...(params.offerUrl && {
    offers: {
      "@type": "Offer",
      "url": params.offerUrl,
      "price": params.offerPrice ?? 0,
      "priceCurrency": params.offerCurrency || "BRL",
      "availability": "https://schema.org/InStock",
      "validFrom": new Date().toISOString(),
    },
  }),
});

export const generateLocalBusinessSchema = (siteTitle: string, description: string, imageUrl?: string, telephone?: string) => {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": siteTitle,
    "image": imageUrl || `${BASE_URL}/og-image.png`,
    "description": description,
    "url": BASE_URL,
    ...(telephone ? { "telephone": telephone } : {}),
    "priceRange": "$$",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Rio de Janeiro",
      "addressRegion": "RJ",
      "addressCountry": "BR"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": -22.9068,
      "longitude": -43.1729
    },
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      "opens": "08:00",
      "closes": "20:00"
    }
  };
};

export const generateTouristAttractionSchema = (name: string, description: string, imageUrl: string) => {
  return {
    "@type": "TouristAttraction",
    "name": name,
    "description": description,
    "image": imageUrl,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Rio de Janeiro",
      "addressRegion": "RJ",
      "addressCountry": "BR"
    }
  };
};

export const generateTourPackageSchema = (
  name: string,
  description: string,
  imageUrl: string,
  url: string,
  price: number,
  currency: string = "BRL"
) => {
  return {
    "@type": "Product",
    "name": name,
    "description": description,
    "image": imageUrl,
    "url": url,
    "brand": {
      "@type": "Organization",
      "name": "Tocorime Rio"
    },
    "offers": {
      "@type": "Offer",
      "price": price,
      "priceCurrency": currency,
      "availability": "https://schema.org/InStock",
      "url": url
    },
    "provider": {
      "@type": "Organization",
      "name": "Tocorime Rio",
      "url": BASE_URL
    },
    "performer": {
      "@type": "Organization",
      "name": "Tocorime Rio",
      "url": BASE_URL
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "5.0",
      "bestRating": "5",
      "ratingCount": "128"
    }
  };
};

/**
 * Gera schema de BreadcrumbList válido.
 * Filtra itens sem URL ou nome para evitar erros de nó pai vazio.
 */
export const generateBreadcrumbsSchema = (items: { name: string; url: string }[]) => {
  const validItems = items.filter(item => item && item.name && item.url && item.url !== "");
  
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": validItems.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": {
        "@type": "WebPage",
        "@id": item.url,
        "name": item.name
      }
    }))
  };
};
export const generateFAQSchema = (faqs: { q: string; a: string }[]) => {
  return {
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.a
      }
    }))
  };
};

/**
 * Gera uma meta descrição otimizada para SEO, curta e com CTA.
 * @param text O texto original (pode ser longo e conter HTML)
 * @param title O título do item (para contexto)
 * @param language O idioma atual
 * @returns Descrição otimizada (máx 160 caracteres)
 */
export const generateOptimizedMetaDescription = (text: string, title: string = "", language: string = "pt") => {
  if (!text) return "";

  // 1. Limpa HTML e espaços extras
  let clean = text
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  // 2. Define o CTA e Símbolos por idioma
  const ctas: Record<string, string> = {
    pt: "Reserve agora! ✓",
    en: "Book now! ✓",
    es: "¡Reserva ahora! ✓"
  };

  const cta = ctas[language] || ctas.pt;
  const maxLength = 155 - cta.length;

  // 3. Corta o texto preservando palavras completas se possível
  if (clean.length > maxLength) {
    clean = clean.substring(0, maxLength).trim();
    // Tenta cortar no último espaço para não quebrar palavra
    const lastSpace = clean.lastIndexOf(" ");
    if (lastSpace > maxLength * 0.8) {
      clean = clean.substring(0, lastSpace);
    }
    clean += "...";
  }

  // 4. Monta a string final
  return `${clean} ${cta}`;
};
