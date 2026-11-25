import { tl } from "@/lib/tl";
import { useMemo, useState } from "react";
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
  const [activeCategory, setActiveCategory] = useState<string>("ALL");

  const sortedTours = [...(tours || [])].sort((a, b) => {
    if (a.is_featured !== b.is_featured) return a.is_featured ? -1 : 1;
    return (a.sort_order ?? 0) - (b.sort_order ?? 0);
  });

  const categories = useMemo(() => {
    const set = new Set<string>();
    sortedTours.forEach((t) => {
      const c = (t.category || "").trim().toUpperCase();
      if (c) set.add(c);
    });
    return Array.from(set).sort();
  }, [tours]);

  const visibleTours =
    activeCategory === "ALL"
      ? sortedTours
      : sortedTours.filter((t) => (t.category || "").trim().toUpperCase() === activeCategory);


  const title =tl(language, { pt: "Todos os Passeios no Rio de Janeiro | Tocorime Rio", es: "Todos los Tours en Río de Janeiro | Tocorime Rio", en: "All Tours in Rio de Janeiro | Tocorime Rio", de: "Alle Touren in Rio de Janeiro | Tocorime Rio", fr: "Toutes les visites à Rio de Janeiro | Tocorime Rio", it: "Tutti i Tour a Rio de Janeiro | Tocorime Rio" });

  const description =tl(language, { pt: "Lista completa de passeios, city tours, trilhas e experiências exclusivas no Rio de Janeiro com guias bilíngues.", es: "Lista completa de tours, city tours, senderismo y experiencias exclusivas en Río de Janeiro con guías bilingües.", en: "Explore a curated selection of private tours in Rio de Janeiro with Tocorime Rio. From thrilling hiking adventures like Pedra da Gávea to cultural immersions and coffee tastings, find your perfect Rio experience.", de: "Entdecken Sie eine ausgewählte Auswahl privater Touren in Rio de Janeiro mit Tocorime Rio. Von aufregenden Wanderabenteuern wie der Pedra da Gávea bis hin zu kulturellen Einblicken und Kaffeeverkostungen – finden Sie Ihr perfektes Rio-Erlebnis.", fr: "Découvrez une sélection exclusive de visites privées à Rio de Janeiro avec Tocorime Rio. Des randonnées palpitantes comme la Pedra da Gávea aux immersions culturelles et dégustations de café, trouvez votre expérience idéale à Rio.", it: "Esplora una selezione curata di tour privati a Rio de Janeiro con Tocorime Rio. Dalle emozionanti avventure di trekking come la Pedra da Gávea alle immersioni culturali e degustazioni di caffè, trova la tua esperienza perfetta a Rio." });

  const keywords =
    "Rio de Janeiro tours, private tours Rio, adventure tours Rio, cultural tours Rio, Pedra da Gávea, Sugarloaf hiking, Little Africa Rio, coffee tasting Rio, Tijuca Forest, Tocorime Rio";

  const h1 =tl(language, { pt: "Passeios no Rio de Janeiro", es: "Tours en Río de Janeiro", en: "Tours in Rio de Janeiro", de: "Touren in Rio de Janeiro", fr: "Visites à Rio de Janeiro", it: "Tour a Rio de Janeiro" });

  const subtitle =tl(language, { pt: "Conheça nossa lista completa de experiências cuidadosamente selecionadas.", es: "Descubre nuestra lista completa de experiencias cuidadosamente seleccionadas.", en: "Explore our complete list of carefully curated experiences.", de: "Entdecken Sie unsere vollständige Liste sorgfältig ausgewählter Erlebnisse.", fr: "Découvrez notre liste complète d'expériences soigneusement sélectionnées.", it: "Esplora la nostra lista completa di esperienze selezionate con cura." });

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
        <meta name="keywords" content={keywords} />
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
        {/* Google tag (gtag.js) */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=AW-18075082892"></script>
        <script>
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'AW-18075082892');
          `}
        </script>
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

          {!isLoading && categories.length > 1 && (
            <nav
              aria-label={tl(language, { pt: "Filtrar por categoria", es: "Filtrar por categoría", en: "Filter by category", de: "Nach Kategorie filtern", fr: "Filtrer par catégorie", it: "Filtra per categoria" })}
              className="-mx-4 px-4 mb-8 flex gap-2 overflow-x-auto snap-x scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] sm:flex-wrap sm:justify-center sm:mx-0 sm:px-0"
            >
              {[{ value: "ALL", label: tl(language, { pt: "Todos", es: "Todos", en: "All", de: "Alle", fr: "Tous", it: "Tutti" })},
                ...categories.map((c) => ({ value: c, label: c }))].map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setActiveCategory(c.value)}
                  aria-pressed={activeCategory === c.value}
                  className={`shrink-0 snap-start min-h-[44px] px-4 rounded-full border text-xs font-black uppercase tracking-widest transition-colors ${
                    activeCategory === c.value
                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                      : "bg-card text-muted-foreground border-border hover:border-primary/40"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </nav>
          )}

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-96 bg-muted rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : visibleTours.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {visibleTours.map((tour) => (
                <div key={tour.id} data-tour-card>
                  <TourItem tour={tour as unknown as TourCardProps} />
                </div>
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
