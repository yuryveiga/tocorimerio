export const BASE_URL = "https://tocorimerio.com";

/**
 * Gera uma URL canônica limpa, removendo barras finais e parâmetros de consulta.
 * @param path O caminho da página (ex: "/blog/meu-post")
 * @returns A URL canônica completa
 */
export const getCanonicalUrl = (path: string = "") => {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  // Remove trailing slash unless it's just the root
  const finalPath = cleanPath === "/" ? "" : cleanPath.replace(/\/$/, "");
  return `${BASE_URL}${finalPath}`;
};

export const generateLocalBusinessSchema = (siteTitle: string, description: string, imageUrl?: string) => {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": siteTitle,
    "image": imageUrl || `${BASE_URL}/og-image.png`,
    "description": description,
    "url": BASE_URL,
    "telephone": "+5521999999999",
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
    "@type": "TourPackage",
    "name": name,
    "description": description,
    "image": imageUrl,
    "url": url,
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
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "5.0",
      "bestRating": "5",
      "ratingCount": "128"
    }
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
