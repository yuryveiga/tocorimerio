import { Helmet } from "react-helmet-async";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { TourItem, TourCardProps } from "@/components/TourItem";
import { useSiteData } from "@/hooks/useSiteData";
import { useLocale } from "@/contexts/LocaleContext";
import { getCanonicalUrl, getHreflangLinks } from "@/utils/seo";
import { BASE_URL } from "@/utils/seo";

const PasseiosIndex = () => {
  const { tours, isLoading } = useSiteData();
  const { language } = useLocale();

  const sortedTours = [...(tours || [])].sort((a, b) => {
    if (a.is_featured !== b.is_featured) return a.is_featured ? -1 : 1;
    return (a.sort_order ?? 0) - (b.sort_order ?? 0);
  });

  const title =
    language === "pt"
      ? "Todos os Passeios no Rio de Janeiro | Tocorime Rio"
      : language === "es"
      ? "Todos los Tours en Río de Janeiro | Tocorime Rio"
      : "All Tours in Rio de Janeiro | Tocorime Rio";

  const description =
    language === "pt"
      ? "Lista completa de passeios, city tours, trilhas e experiências exclusivas no Rio de Janeiro com guias bilíngues."
      : language === "es"
      ? "Lista completa de tours, city tours, senderismo y experiencias exclusivas en Río de Janeiro con guías bilingües."
      : "Complete list of tours, city tours, hiking and exclusive experiences in Rio de Janeiro with bilingual guides.";

  const h1 =
    language === "pt"
      ? "Passeios no Rio de Janeiro"
      : language === "es"
      ? "Tours en Río de Janeiro"
      : "Tours in Rio de Janeiro";

  const subtitle =
    language === "pt"
      ? "Conheça nossa lista completa de experiências cuidadosamente selecionadas."
      : language === "es"
      ? "Descubre nuestra lista completa de experiencias cuidadosamente seleccionadas."
      : "Explore our complete list of carefully curated experiences.";

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: h1,
    itemListElement: sortedTours.map((t, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${BASE_URL}/passeio/${t.slug || t.id}`,
      name: (language === "en" ? t.title_en : language === "es" ? t.title_es : t.title) || t.title,
      image: t.image_url,
    })),
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={getCanonicalUrl("/passeio")} />
        {getHreflangLinks("/passeio").map((l) => (
          <link key={l.hreflang} rel="alternate" hrefLang={l.hreflang} href={l.href} />
        ))}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={getCanonicalUrl("/passeio")} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:site_name" content="Tocorime Rio" />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">{JSON.stringify(itemListSchema)}</script>
      </Helmet>

      <Header />

      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <header className="text-center mb-12">
            <h1 className="font-serif text-4xl sm:text-5xl font-bold text-foreground mb-3">
              {h1}
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">{subtitle}</p>
          </header>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-96 bg-muted rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : sortedTours.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {sortedTours.map((tour) => (
                <TourItem key={tour.id} tour={tour as unknown as TourCardProps} />
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground">
              {language === "pt" ? "Nenhum passeio disponível" : "No tours available"}
            </p>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PasseiosIndex;
