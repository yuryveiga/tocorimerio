import { useParams, Navigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useState, useEffect, useMemo } from "react";
import { ArrowLeft, ChevronDown, ChevronUp } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { TourItem, TourCardProps } from "@/components/TourItem";
import { useSiteData } from "@/hooks/useSiteData";
import { useLocale } from "@/contexts/LocaleContext";
import { getCanonicalUrl, BASE_URL, generateBreadcrumbsSchema } from "@/utils/seo";
import { slugify } from "@/utils/slugify";

const CATEGORY_INTROS: Record<string, { pt: { h2: string; p: string[] }; en: { h2: string; p: string[] }; es: { h2: string; p: string[] } }> = {
  "city-tour": {
    pt: {
      h2: "O que é um City Tour no Rio de Janeiro?",
      p: [
        "O city tour no Rio de Janeiro é a melhor forma de descobrir a Cidade Maravilhosa de verdade — com guia local, transporte privativo e roteiro sob medida para o seu grupo. Em poucas horas, você visita os cartões-postais mais icônicos do Rio, como o Cristo Redentor, o Pão de Açúcar e o Mirante Dona Marta, enquanto mergulha na história, na cultura e na energia única que fazem do Rio uma das cidades mais fascinantes do mundo.",
        "Diferente dos passeios em grupo lotados, nossos city tours privados em Rio de Janeiro garantem atenção exclusiva, flexibilidade de horários e a liberdade de explorar cada atração no seu próprio ritmo. Seja um tour completo pelo Rio, um passeio pelo Centro Histórico, uma experiência cultural na Rocinha ou uma aventura náutica pela Baía de Guanabara — cada roteiro é pensado para transformar sua visita ao Rio de Janeiro em uma memória inesquecível.",
        "Com guias bilíngues apaixonados pela cidade, transfer incluso e avaliação 5.0 no TripAdvisor, a Tocorime Rio oferece os melhores city tours no Rio de Janeiro para famílias, casais e viajantes que buscam autenticidade, segurança e conforto.",
      ],
    },
    en: {
      h2: "What is a City Tour in Rio de Janeiro?",
      p: [
        "A city tour in Rio de Janeiro is the best way to truly discover the Marvelous City — with a local guide, private transportation and a custom-made itinerary for your group. In just a few hours, you visit Rio's most iconic landmarks, such as Christ the Redeemer, Sugarloaf Mountain and Mirante Dona Marta, while diving into the history, culture and unique energy that make Rio one of the most fascinating cities in the world.",
        "Unlike crowded group tours, our private city tours in Rio de Janeiro guarantee exclusive attention, flexible schedules and the freedom to explore each attraction at your own pace. Whether it's a complete tour of Rio, a walk through the Historic Downtown, a cultural experience in Rocinha or a boat adventure across Guanabara Bay — every itinerary is designed to turn your visit to Rio de Janeiro into an unforgettable memory.",
        "With bilingual guides passionate about the city, transfer included and a 5.0 rating on TripAdvisor, Tocorime Rio offers the best city tours in Rio de Janeiro for families, couples and travelers looking for authenticity, safety and comfort.",
      ],
    },
    es: {
      h2: "¿Qué es un City Tour en Río de Janeiro?",
      p: [
        "El city tour en Río de Janeiro es la mejor manera de descubrir de verdad la Ciudad Maravillosa — con guía local, transporte privado e itinerario hecho a la medida de tu grupo. En pocas horas, visitas las postales más icónicas de Río, como el Cristo Redentor, el Pan de Azúcar y el Mirante Dona Marta, mientras te sumerges en la historia, la cultura y la energía única que hacen de Río una de las ciudades más fascinantes del mundo.",
        "A diferencia de los tours en grupo abarrotados, nuestros city tours privados en Río de Janeiro garantizan atención exclusiva, flexibilidad de horarios y la libertad de explorar cada atracción a tu propio ritmo. Ya sea un tour completo por Río, un paseo por el Centro Histórico, una experiencia cultural en la Rocinha o una aventura náutica por la Bahía de Guanabara — cada itinerario está pensado para transformar tu visita a Río de Janeiro en un recuerdo inolvidable.",
        "Con guías bilingües apasionados por la ciudad, traslado incluido y una valoración de 5.0 en TripAdvisor, Tocorime Rio ofrece los mejores city tours en Río de Janeiro para familias, parejas y viajeros que buscan autenticidad, seguridad y comodidad.",
      ],
    },
  },
  "trilha": {
    pt: {
      h2: "Trilhas no Rio de Janeiro: Natureza, Vistas e Aventura",
      p: [
        "As trilhas no Rio de Janeiro são muito mais do que simples caminhadas — são portas de entrada para paisagens de tirar o fôlego, história e biodiversidade única. Com montanhas, florestas tropicais e costas paradisíacas, a cidade oferece roteiros para todos os níveis, desde trilhas leves em meio à mata atlântica até ascensões desafiadoras com vistas panorâmicas de 360°.",
        "Nossos passeios de hiking no Rio de Janeiro são guiados por especialistas locais que conhecem cada sendero, mirante e ponto de interesse. Seja a icônica Trilha do Morro Dois Irmãos com vista para o Leblon, a desafiadora Pedra da Gávea, ou a exuberante Floresta da Tijuca — cada roteiro é pensado para oferecer segurança, informação e momentos inesquecíveis na natureza.",
        "Com grupos reduzidos, guias bilíngues e todo o suporte necessário, a Tocorime Rio transforma cada trilha em uma experiência completa de aventura e descoberta. Ideal para quem busca atividade física, contato com a natureza e as melhores vistas do Rio de Janeiro.",
      ],
    },
    en: {
      h2: "Hiking in Rio de Janeiro: Nature, Views & Adventure",
      p: [
        "Hiking in Rio de Janeiro is much more than just walking — it's a gateway to breathtaking landscapes, history and unique biodiversity. With mountains, tropical rainforests and paradise coastlines, the city offers trails for every level, from easy walks through the Atlantic Forest to challenging climbs with 360° panoramic views.",
        "Our hiking tours in Rio de Janeiro are led by local experts who know every trail, viewpoint and point of interest. Whether it's the iconic Morro Dois Irmãos trail overlooking Leblon, the challenging Pedra da Gávea, or the lush Tijuca Forest — each itinerary is designed to offer safety, knowledge and unforgettable moments in nature.",
        "With small groups, bilingual guides and all the support you need, Tocorime Rio turns every hike into a complete adventure and discovery experience. Perfect for those seeking physical activity, contact with nature and the best views of Rio de Janeiro.",
      ],
    },
    es: {
      h2: "Senderismo en Río de Janeiro: Naturaleza, Vistas y Aventura",
      p: [
        "Las trilhas en Río de Janeiro son mucho más que simples caminatas — son puertas de entrada a paisajes de película, historia y biodiversidad única. Con montañas, selvas tropicales y costas paradisíacas, la ciudad ofrece rutas para todos los niveles, desde senderos suaves por la mata atlántica hasta ascensos desafiantes con vistas panorámicas de 360°.",
        "Nuestros tours de senderismo en Río de Janeiro están guiados por expertos locales que conocen cada sendero, mirador y punto de interés. Ya sea la icónica Trilha do Morro Dois Irmãos con vista al Leblon, la desafiante Pedra da Gávea, o la exuberante Floresta da Tijuca — cada itinerario está pensado para ofrecer seguridad, información y momentos inolvidables en la naturaleza.",
        "Con grupos reducidos, guías bilingües y todo el apoyo necesario, Tocorime Rio transforma cada trilha en una experiencia completa de aventura y descubrimiento. Ideal para quien busca actividad física, contacto con la naturaleza y las mejores vistas de Río de Janeiro.",
      ],
    },
  },
  "um-dia": {
    pt: {
      h2: "Passeios de 1 Dia no Rio de Janeiro: O Melhor da Cidade em Poucas Horas",
      p: [
        "Os passeios de um dia no Rio de Janeiro são perfeitos para quem quer aproveitar ao máximo a cidade sem perder tempo. Com roteiros completos, transporte privativo e guia bilíngue, você conhece os principais pontos turísticos, experiências culturais e cenários naturais em um único dia — com organização, conforto e atenção exclusiva.",
        "Desde city tours clássicos com Cristo Redentor e Pão de Açúcar até experiências temáticas como gastronomia, arte de rua, favelas e praias secretas, nossos day trips no Rio de Janeiro são pensados para viajantes que valorizam eficiência e qualidade. Cada itinerário é montado sob medida para o seu perfil, interesses e ritmo.",
        "Com avaliação 5.0 no TripAdvisor e atendimento premium da Tocorime Rio, os passeios de 1 dia são a escolha ideal para cruzeiristas, viajantes em conexão e quem quer viver o melhor do Rio de Janeiro em pouco tempo — sem abrir mão de autenticidade e experiências memoráveis.",
      ],
    },
    en: {
      h2: "One-Day Tours in Rio de Janeiro: The Best of the City in Just a Few Hours",
      p: [
        "One-day tours in Rio de Janeiro are perfect for those who want to make the most of the city without wasting time. With complete itineraries, private transportation and a bilingual guide, you visit the main tourist spots, cultural experiences and natural scenery in a single day — with organization, comfort and exclusive attention.",
        "From classic city tours with Christ the Redeemer and Sugarloaf Mountain to themed experiences like gastronomy, street art, favelas and secret beaches, our day trips in Rio de Janeiro are designed for travelers who value efficiency and quality. Each itinerary is tailor-made to your profile, interests and pace.",
        "With a 5.0 rating on TripAdvisor and premium service from Tocorime Rio, one-day tours are the ideal choice for cruise passengers, travelers on a layover and anyone who wants to experience the best of Rio de Janeiro in a short time — without giving up authenticity and memorable experiences.",
      ],
    },
    es: {
      h2: "Excursiones de un Día en Río de Janeiro: Lo Mejor de la Ciudad en Pocas Horas",
      p: [
        "Las excursiones de un día en Río de Janeiro son perfectas para quien quiere aprovechar al máximo la ciudad sin perder tiempo. Con itinerarios completos, transporte privado y guía bilingüe, visitas los principales puntos turísticos, experiencias culturales y escenarios naturales en un solo día — con organización, comodidad y atención exclusiva.",
        "Desde city tours clásicos con el Cristo Redentor y el Pan de Azúcar hasta experiencias temáticas como gastronomía, arte callejero, favelas y playas secretas, nuestros day trips en Río de Janeiro están pensados para viajeros que valoran la eficiencia y la calidad. Cada itinerario está montado a medida de tu perfil, intereses y ritmo.",
        "Con una valoración de 5.0 en TripAdvisor y atención premium de Tocorime Rio, las excursiones de un día son la opción ideal para cruceristas, viajeros en conexión y quien quiere vivir lo mejor de Río de Janeiro en poco tiempo — sin renunciar a la autenticidad y experiencias memorables.",
      ],
    },
  },
};

const CATEGORY_SEO: Record<string, { title: string; description: string; ogTitle: string; ogDescription: string }> = {
  "city-tour": {
    title: "City Tour in Rio de Janeiro | Private Guided Tours | Tocorime Rio",
    description: "Explore Rio de Janeiro with a local guide on a private, tailored city tour. Christ the Redeemer, Sugar Loaf, favelas & more. Rated 5.0 on TripAdvisor.",
    ogTitle: "City Tour in Rio de Janeiro — Private Tours with Local Guide",
    ogDescription: "Discover the real Rio de Janeiro: private city tours, bilingual guides, and custom itineraries. From Christ the Redeemer to the Historic Center — unforgettable experiences await.",
  },
  "trilha": {
    title: "Hiking in Rio de Janeiro | Private Guided Trails | Tocorime Rio",
    description: "Hike Rio de Janeiro's most iconic trails with a certified local guide. Pedra da Gávea, Sugarloaf, Tijuca Forest, rock climbing & more. Private & safe. Book now.",
    ogTitle: "Hiking in Rio de Janeiro — Private Guided Trails with Local Experts",
    ogDescription: "Explore Rio de Janeiro's stunning nature on a private guided hike. From Pedra da Gávea to wild beaches, certified guides lead you safely through the city's most breathtaking trails.",
  },
  "um-dia": {
    title: "One-Day Tours in Rio de Janeiro | Full-Day Private Tours | Tocorime Rio",
    description: "Make the most of your day in Rio de Janeiro with a full-day private tour. Visit Niterói, iconic landmarks & hidden gems with a bilingual guide. Book now.",
    ogTitle: "One-Day Tours in Rio de Janeiro — See the Best of the City in a Single Day",
    ogDescription: "Don't waste a single hour in Rio. Our one-day private tours take you through the city's highlights and hidden treasures — with a bilingual guide, private transport, and no shortcuts.",
  },
};

interface IntroParagraphsProps {
  paragraphs: string[];
  language: string;
}

function IntroParagraphs({ paragraphs, language }: IntroParagraphsProps) {
  const [expanded, setExpanded] = useState(false);
  const readMoreLabel =
    language === "pt" ? "Ler mais" : language === "es" ? "Leer más" : "Read more";
  const readLessLabel =
    language === "pt" ? "Ler menos" : language === "es" ? "Leer menos" : "Read less";

  // Split first paragraph into "first sentence" + "rest"
  // First sentence = up to (and including) the first "." that is followed by a space or end.
  const { firstSentence, restOfFirst } = useMemo(() => {
    const p = paragraphs[0] || "";
    const match = p.match(/^([\s\S]*?[.!?])(\s+[\s\S]*)?$/);
    if (!match) return { firstSentence: p, restOfFirst: "" };
    return { firstSentence: match[1], restOfFirst: match[2] || "" };
  }, [paragraphs]);

  // Typewriter on first sentence (skipped if reduced motion).
  const [typed, setTyped] = useState(() => {
    if (typeof window === "undefined") return firstSentence;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? firstSentence
      : "";
  });
  const [typingDone, setTypingDone] = useState(typed === firstSentence);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setTyped(firstSentence);
      setTypingDone(true);
      return;
    }
    setTyped("");
    setTypingDone(false);
    let i = 0;
    const total = firstSentence.length;
    // Target ~3.2s for the full sentence regardless of length
    const stepMs = Math.max(12, Math.min(40, Math.round(3200 / Math.max(total, 1))));
    const id = window.setInterval(() => {
      i += 1;
      setTyped(firstSentence.slice(0, i));
      if (i >= total) {
        window.clearInterval(id);
        setTypingDone(true);
      }
    }, stepMs);
    return () => window.clearInterval(id);
  }, [firstSentence]);

  if (paragraphs.length <= 1) {
    return (
      <p>
        <span>{typed}</span>
        {!typingDone && <span className="tw-caret" aria-hidden="true" />}
        {typingDone && restOfFirst}
      </p>
    );
  }

  return (
    <>
      <p>
        <span>{typed}</span>
        {!typingDone && <span className="tw-caret" aria-hidden="true" />}
        {typingDone && restOfFirst}
      </p>

      {expanded && (
        <>
          {paragraphs.slice(1).map((p, i) => (
            <p key={i + 1}>{p}</p>
          ))}
        </>
      )}

      <button
        onClick={() => setExpanded((v) => !v)}
        className="inline-flex items-center gap-1.5 mt-2 text-primary hover:text-primary/80 font-medium text-sm transition-colors focus:outline-none focus:underline"
        type="button"
      >
        {expanded ? (
          <>
            {readLessLabel} <ChevronUp className="w-4 h-4" />
          </>
        ) : (
          <>
            {readMoreLabel} <ChevronDown className="w-4 h-4" />
          </>
        )}
      </button>
    </>
  );
}

interface PasseiosCategoriaProps {
  categoriaOverride?: string;
  pathOverride?: string;
}

export default function PasseiosCategoria({ categoriaOverride, pathOverride }: PasseiosCategoriaProps = {}) {
  const params = useParams<{ categoria: string }>();
  const categoria = categoriaOverride || params.categoria;
  const { tours, isLoading } = useSiteData();
  const { language } = useLocale();

  const filtered = (tours || []).filter((t) => slugify(t.category || "") === categoria);

  if (!isLoading && filtered.length === 0) {
    return <Navigate to="/passeio" replace />;
  }

  const sorted = [...filtered].sort((a, b) => {
    if (a.is_featured !== b.is_featured) return a.is_featured ? -1 : 1;
    return (a.sort_order ?? 0) - (b.sort_order ?? 0);
  });

  const firstTour: any = filtered[0];
  const categoryName =
    (language === "en" && firstTour?.category_en) ||
    (language === "es" && firstTour?.category_es) ||
    firstTour?.category ||
    categoria ||
    "";
  const intro = categoria ? CATEGORY_INTROS[categoria] : undefined;
  const introContent = intro ? intro[language] || intro.en : undefined;

  const seo = categoria ? CATEGORY_SEO[categoria] : undefined;

  const title = seo
    ? seo.title
    : language === "pt"
      ? `${categoryName} no Rio de Janeiro | Tocorime Rio`
      : language === "es"
        ? `${categoryName} en Río de Janeiro | Tocorime Rio`
        : `${categoryName} in Rio de Janeiro | Tocorime Rio`;

  const description = seo
    ? seo.description
    : language === "pt"
      ? `Confira todas as opções de ${categoryName} no Rio de Janeiro: roteiros completos, guias bilíngues e atendimento premium.`
      : language === "es"
        ? `Mira todas las opciones de ${categoryName} en Río de Janeiro: itinerarios completos, guías bilingües y atención premium.`
        : `Explore all ${categoryName} options in Rio de Janeiro: complete itineraries, bilingual guides and premium service.`;

  const ogTitle = seo ? seo.ogTitle : title;
  const ogDescription = seo ? seo.ogDescription : description;

  const canonical = getCanonicalUrl(pathOverride || `/passeios/${categoria}`);

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: categoryName,
    itemListElement: sorted.map((t, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${BASE_URL}/passeio/${t.slug || t.id}`,
      name: t.title,
      image: t.image_url,
    })),
  };

  const breadcrumbSchema = generateBreadcrumbsSchema([
    { name: "Início", url: getCanonicalUrl("/") },
    { name: "Passeios", url: getCanonicalUrl("/passeio") },
    { name: categoryName, url: getCanonicalUrl(`/passeios/${categoria}`) },
  ]);

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={canonical} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonical} />
        <meta property="og:title" content={ogTitle} />
        <meta property="og:description" content={ogDescription} />
        <script type="application/ld+json">{JSON.stringify(itemListSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
      </Helmet>

      <Header />

      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to="/passeio" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-6 text-sm">
            <ArrowLeft className="w-4 h-4" />{" "}
            {language === "pt"
              ? "Todos os passeios"
              : language === "es"
                ? "Todos los paseos"
                : "All tours"}
          </Link>

          <header className="text-center mb-12">
            <h1 className="font-serif text-4xl sm:text-5xl font-bold text-foreground mb-3 capitalize">
              {categoryName}
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {sorted.length}{" "}
              {language === "pt"
                ? sorted.length === 1
                  ? "experiência disponível"
                  : "experiências disponíveis"
                : language === "es"
                  ? sorted.length === 1
                    ? "experiencia disponible"
                    : "experiencias disponibles"
                  : sorted.length === 1
                    ? "experience available"
                    : "experiences available"}
            </p>
          </header>

          {introContent && (
            <section className="max-w-3xl mx-auto mb-12">
              <div className="relative bg-accent/30 border-l-4 border-primary pl-6 pr-6 py-6 rounded-r-xl">
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-foreground mb-4">
                  {introContent.h2}
                </h2>
                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  <IntroParagraphs
                    paragraphs={introContent.p}
                    language={language}
                  />
                </div>
              </div>
            </section>
          )}

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-96 bg-muted rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {sorted.map((tour) => (
                <div key={tour.id} data-tour-card>
                  <TourItem tour={tour as unknown as TourCardProps} />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
