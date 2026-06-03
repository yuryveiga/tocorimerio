import { useParams, Navigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useState } from "react";
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
};

const CATEGORY_SEO: Record<string, { title: string; description: string; ogTitle: string; ogDescription: string }> = {
  "city-tour": {
    title: "City Tour in Rio de Janeiro | Private Guided Tours | Tocorime Rio",
    description: "Explore Rio de Janeiro with a local guide on a private, tailored city tour. Christ the Redeemer, Sugar Loaf, favelas & more. Rated 5.0 on TripAdvisor.",
    ogTitle: "City Tour in Rio de Janeiro — Private Tours with Local Guide",
    ogDescription: "Discover the real Rio de Janeiro: private city tours, bilingual guides, and custom itineraries. From Christ the Redeemer to the Historic Center — unforgettable experiences await.",
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

  if (paragraphs.length <= 1) {
    return <p>{paragraphs[0]}</p>;
  }

  return (
    <>
      <p>{paragraphs[0]}</p>

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

  const categoryName = filtered[0]?.category || categoria || "";
  const intro = categoria ? CATEGORY_INTROS[categoria] : undefined;
  const introContent = intro ? intro[language] || intro.en : undefined;
  const title =
    language === "pt"
      ? `${categoryName} no Rio de Janeiro | Tocorime Rio`
      : language === "es"
      ? `${categoryName} en Río de Janeiro | Tocorime Rio`
      : `${categoryName} in Rio de Janeiro | Tocorime Rio`;

  const description =
    language === "pt"
      ? `Confira todas as opções de ${categoryName} no Rio de Janeiro: roteiros completos, guias bilíngues e atendimento premium.`
      : language === "es"
      ? `Mira todas las opciones de ${categoryName} en Río de Janeiro: itinerarios completos, guías bilingües y atención premium.`
      : `Explore all ${categoryName} options in Rio de Janeiro: complete itineraries, bilingual guides and premium service.`;

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
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <script type="application/ld+json">{JSON.stringify(itemListSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
      </Helmet>

      <Header />

      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to="/passeio" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-6 text-sm">
            <ArrowLeft className="w-4 h-4" /> Todos os passeios
          </Link>

          <header className="text-center mb-12">
            <h1 className="font-serif text-4xl sm:text-5xl font-bold text-foreground mb-3 capitalize">
              {categoryName}
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {sorted.length} {sorted.length === 1 ? "experiência disponível" : "experiências disponíveis"}
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
