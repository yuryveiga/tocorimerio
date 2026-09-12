import { useParams, Navigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowLeft } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { TourItem, TourCardProps } from "@/components/TourItem";
import { useSiteData } from "@/hooks/useSiteData";
import { useLocale } from "@/contexts/LocaleContext";
import { getCanonicalUrl, BASE_URL, generateBreadcrumbsSchema } from "@/utils/seo";
import {
  TOUR_CATEGORIES,
  getCategoryBySlug,
  getCategoryCopy,
  getCategoryLabel,
  getCategorySlug,
} from "@/lib/tourCategories";

interface PasseiosCategoriaProps {
  categoriaOverride?: string;
  pathOverride?: string;
}

export default function PasseiosCategoria({ categoriaOverride, pathOverride }: PasseiosCategoriaProps = {}) {
  const params = useParams<{ categoria: string }>();
  const categoria = categoriaOverride || params.categoria;
  const { tours, isLoading } = useSiteData();
  const { language } = useLocale();

  const category = getCategoryBySlug(categoria);
  const categorySlug = category?.slug || categoria || "";

  const filtered = (tours || []).filter((t) => getCategorySlug(t.category) === categorySlug);

  if (!isLoading && filtered.length === 0) {
    return <Navigate to="/passeio" replace />;
  }

  const sorted = [...filtered].sort((a, b) => {
    if (a.is_featured !== b.is_featured) return a.is_featured ? -1 : 1;
    return (a.sort_order ?? 0) - (b.sort_order ?? 0);
  });

  const copy = category ? getCategoryCopy(category, language) : undefined;
  const categoryName = copy?.label || getCategoryLabel(filtered[0]?.category, language) || categoria || "";
  const h1 =
    copy?.h1 ||
    (language === "pt"
      ? `${categoryName} no Rio de Janeiro`
      : language === "es"
        ? `${categoryName} en Río de Janeiro`
        : `${categoryName} in Rio de Janeiro`);

  const title =
    copy?.title ||
    (language === "pt"
      ? `${categoryName} no Rio de Janeiro | Tocorime Rio`
      : language === "es"
        ? `${categoryName} en Río de Janeiro | Tocorime Rio`
        : `${categoryName} in Rio de Janeiro | Tocorime Rio`);

  const description =
    copy?.description ||
    (language === "pt"
      ? `Confira as opções de ${categoryName} no Rio de Janeiro: duração, preço inicial e reserva online com guia local.`
      : language === "es"
        ? `Mira las opciones de ${categoryName} en Río de Janeiro: duración, precio inicial y reserva online con guía local.`
        : `Compare ${categoryName} options in Rio de Janeiro: duration, starting price and online booking with a local guide.`);

  const canonical = getCanonicalUrl(pathOverride || `/passeios/${categorySlug}`);

  const availableSlugs = new Set((tours || []).map((t) => getCategorySlug(t.category)));
  const otherCategories = TOUR_CATEGORIES.filter(
    (c) => c.slug !== categorySlug && availableSlugs.has(c.slug),
  );

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
    { name: categoryName, url: getCanonicalUrl(`/passeios/${categorySlug}`) },
  ]);

  const hubLinks =
    language === "pt"
      ? [
          { to: "/passeio", label: "Todos os passeios no Rio" },
          { to: "/private-tours-rio-de-janeiro", label: "Passeios privativos no Rio" },
          { to: "/custom-private-tour-rio-de-janeiro", label: "Roteiro sob medida" },
          { to: "/your-private-guide-in-rio", label: "Guia privativo por hora" },
          { to: "/maracana-calendario", label: "Jogos no Maracanã" },
        ]
      : language === "es"
        ? [
            { to: "/passeio", label: "Todos los tours en Río" },
            { to: "/private-tours-rio-de-janeiro", label: "Tours privados en Río" },
            { to: "/custom-private-tour-rio-de-janeiro", label: "Itinerario a medida" },
            { to: "/your-private-guide-in-rio", label: "Guía privado por hora" },
            { to: "/maracana-calendario", label: "Partidos en el Maracaná" },
          ]
        : [
            { to: "/passeio", label: "All Rio de Janeiro tours" },
            { to: "/private-tours-rio-de-janeiro", label: "Private tours in Rio" },
            { to: "/custom-private-tour-rio-de-janeiro", label: "Custom private tour" },
            { to: "/your-private-guide-in-rio", label: "Private guide by the hour" },
            { to: "/maracana-calendario", label: "Maracanã match calendar" },
          ];

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
            <ArrowLeft className="w-4 h-4" />{" "}
            {language === "pt"
              ? "Todos os passeios"
              : language === "es"
                ? "Todos los paseos"
                : "All tours"}
          </Link>

          <header className="text-center mb-8">
            <h1 className="font-serif text-4xl sm:text-5xl font-bold text-foreground mb-3">{h1}</h1>
            {copy?.intro && (
              <p className="text-muted-foreground text-base sm:text-lg max-w-3xl mx-auto">{copy.intro}</p>
            )}
            <p className="text-sm text-muted-foreground mt-3">
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

          {otherCategories.length > 0 && (
            <section aria-labelledby="other-categories" className="mt-14 border-t border-border pt-8">
              <h2
                id="other-categories"
                className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-3"
              >
                {language === "pt"
                  ? "Outras categorias"
                  : language === "es"
                    ? "Otras categorías"
                    : "Other categories"}
              </h2>
              <div className="flex flex-wrap gap-x-4 gap-y-2">
                {otherCategories.map((c) => (
                  <Link
                    key={c.slug}
                    to={`/passeios/${c.slug}`}
                    className="text-sm font-semibold text-primary hover:underline"
                  >
                    {getCategoryCopy(c, language).label}
                  </Link>
                ))}
              </div>
            </section>
          )}

          <section className="mt-10 border-t border-border pt-8">
            <h2 className="font-serif text-2xl font-bold text-foreground mb-4">
              {language === "pt"
                ? "Procurando algo específico?"
                : language === "es"
                  ? "¿Buscas algo específico?"
                  : "Looking for something specific?"}
            </h2>
            <ul className="flex flex-wrap gap-x-6 gap-y-3">
              {hubLinks.map((hub) => (
                <li key={hub.to}>
                  <Link to={hub.to} className="text-primary font-semibold hover:underline">
                    {hub.label} →
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
