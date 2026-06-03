import { useParams, Navigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowLeft } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { TourItem, TourCardProps } from "@/components/TourItem";
import { useSiteData } from "@/hooks/useSiteData";
import { useLocale } from "@/contexts/LocaleContext";
import { getCanonicalUrl, BASE_URL, generateBreadcrumbsSchema } from "@/utils/seo";
import { slugify } from "@/utils/slugify";

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
