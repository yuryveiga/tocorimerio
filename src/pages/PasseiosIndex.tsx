import { useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { TourItem, TourCardProps } from "@/components/TourItem";
import { useSiteData } from "@/hooks/useSiteData";
import { useLocale } from "@/contexts/LocaleContext";
import { getCanonicalUrl, getHreflangLinks, generateBreadcrumbsSchema } from "@/utils/seo";
import { BASE_URL } from "@/utils/seo";
import { slugify } from "@/utils/slugify";
import { TOUR_CATEGORIES, getCategoryCopy, getCategorySlug } from "@/lib/tourCategories";

const PasseiosIndex = () => {
  const { tours, isLoading } = useSiteData();
  const { language } = useLocale();
  const [activeCategory, setActiveCategory] = useState<string>("ALL");

  const sortedTours = [...(tours || [])].sort((a, b) => {
    if (a.is_featured !== b.is_featured) return a.is_featured ? -1 : 1;
    return (a.sort_order ?? 0) - (b.sort_order ?? 0);
  });

  // Categorias na ordem comercial da taxonomia, identificadas pelo slug da URL.
  const categories = useMemo(() => {
    const present = new Set<string>();
    sortedTours.forEach((t) => {
      const s = getCategorySlug(t.category);
      if (s) present.add(s);
    });
    const known = TOUR_CATEGORIES.filter((c) => present.has(c.slug)).map((c) => ({
      slug: c.slug,
      label: getCategoryCopy(c, language).label,
    }));
    const extras = Array.from(present)
      .filter((s) => !TOUR_CATEGORIES.some((c) => c.slug === s))
      .map((s) => ({ slug: s, label: s.replace(/-/g, " ") }));
    return [...known, ...extras];
  }, [tours, language]);

  const visibleTours =
    activeCategory === "ALL"
      ? sortedTours
      : sortedTours.filter((t) => getCategorySlug(t.category) === activeCategory);


  const title =
    language === "pt"
      ? "Passeios no Rio de Janeiro | Tours Guiados e Privativos"
      : language === "es"
      ? "Tours en Río de Janeiro | Tours Guiados y Privados"
      : "Rio de Janeiro Tours | Guided & Private Tours";

  const description =
    language === "pt"
      ? "Catálogo completo de passeios no Rio de Janeiro: city tours, trilhas, experiências culturais e bate e volta, com guias locais bilíngues e transporte privativo."
      : language === "es"
      ? "Catálogo completo de tours en Río de Janeiro: city tours, senderismo, experiencias culturales y excursiones, con guías locales bilingües y transporte privado."
      : "Every Rio de Janeiro tour in one place: city tours, hiking, cultural experiences and day trips, run by bilingual local guides with private transport.";

  const keywords =
    "rio de janeiro tours, rio tours, guided tours rio de janeiro, rio de janeiro experiences, best rio tours, private tours rio, hiking rio de janeiro, city tour rio de janeiro";

  const h1 =
    language === "pt"
      ? "Passeios no Rio de Janeiro"
      : language === "es"
      ? "Tours en Río de Janeiro"
      : "Rio de Janeiro Tours";

  const subtitle =
    language === "pt"
      ? "Conheça nossa lista completa de experiências cuidadosamente selecionadas."
      : language === "es"
      ? "Descubre nuestra lista completa de experiencias cuidadosamente seleccionadas."
      : "Explore our complete list of carefully curated experiences.";

  const intro =
    language === "pt"
      ? "Todos os passeios abaixo são operados diretamente pela Tocorime Rio, com guias locais bilíngues e transporte privativo. Escolha por categoria, veja a duração e o preço inicial de cada experiência e clique em ver disponibilidade para reservar."
      : language === "es"
      ? "Todos los tours de esta página los operamos directamente en Tocorime Rio, con guías locales bilingües y transporte privado. Elige por categoría, revisa la duración y el precio inicial y haz clic en ver disponibilidad para reservar."
      : "Every tour on this page is run directly by Tocorime Rio, with bilingual local guides and private transport. Browse by category, check the duration and starting price, then open availability to book.";

  const browseByCategory =
    language === "pt" ? "Escolha por categoria" : language === "es" ? "Elige por categoría" : "Browse by category";

  const lookingForLabel =
    language === "pt"
      ? "Procurando algo específico?"
      : language === "es"
      ? "¿Buscas algo específico?"
      : "Looking for something specific?";

  const hubs =
    language === "pt"
      ? [
          { to: "/private-tours-rio-de-janeiro", label: "Passeios privativos no Rio" },
          { to: "/custom-private-tour-rio-de-janeiro", label: "Roteiro sob medida" },
          { to: "/your-private-guide-in-rio", label: "Guia privativo por hora" },
          { to: "/maracana-calendario", label: "Jogos no Maracanã" },
          { to: "/things-to-do-in-rio-de-janeiro", label: "O que fazer no Rio" },
        ]
      : language === "es"
      ? [
          { to: "/private-tours-rio-de-janeiro", label: "Tours privados en Río" },
          { to: "/custom-private-tour-rio-de-janeiro", label: "Itinerario a medida" },
          { to: "/your-private-guide-in-rio", label: "Guía privado por hora" },
          { to: "/maracana-calendario", label: "Partidos en el Maracaná" },
          { to: "/things-to-do-in-rio-de-janeiro", label: "Qué hacer en Río" },
        ]
      : [
          { to: "/private-tours-rio-de-janeiro", label: "Private tours in Rio" },
          { to: "/custom-private-tour-rio-de-janeiro", label: "Custom private tour" },
          { to: "/your-private-guide-in-rio", label: "Private guide by the hour" },
          { to: "/maracana-calendario", label: "Maracanã match calendar" },
          { to: "/things-to-do-in-rio-de-janeiro", label: "Things to do in Rio" },
        ];

  const faqs =
    language === "pt"
      ? [
          {
            q: "Os passeios são privativos?",
            a: "Sim. Todas as experiências desta página são operadas de forma privativa para o seu grupo, com guia local bilíngue.",
          },
          {
            q: "Como vejo a disponibilidade e o preço final?",
            a: "Abra a página do passeio e clique em ver disponibilidade. O total aparece antes do pagamento, já com a quantidade de viajantes escolhida.",
          },
          {
            q: "Em quais idiomas os guias atendem?",
            a: "Português, inglês e espanhol.",
          },
          {
            q: "Posso montar um roteiro que não está na lista?",
            a: "Sim. Use a página de roteiro sob medida e conte o que você quer fazer, quantas pessoas são e as datas da viagem.",
          },
        ]
      : language === "es"
      ? [
          {
            q: "¿Los tours son privados?",
            a: "Sí. Todas las experiencias de esta página se operan de forma privada para tu grupo, con guía local bilingüe.",
          },
          {
            q: "¿Cómo veo la disponibilidad y el precio final?",
            a: "Abre la página del tour y haz clic en ver disponibilidad. El total aparece antes del pago, ya con el número de viajeros elegido.",
          },
          {
            q: "¿En qué idiomas atienden los guías?",
            a: "Portugués, inglés y español.",
          },
          {
            q: "¿Puedo armar un itinerario que no está en la lista?",
            a: "Sí. Usa la página de itinerario a medida y cuéntanos qué quieres hacer, cuántas personas son y las fechas del viaje.",
          },
        ]
      : [
          {
            q: "Are the tours private?",
            a: "Yes. Every experience on this page runs privately for your group, with a bilingual local guide.",
          },
          {
            q: "How do I see availability and the final price?",
            a: "Open the tour page and click check availability. The total is shown before payment, based on the number of travellers you choose.",
          },
          {
            q: "Which languages do the guides speak?",
            a: "Portuguese, English and Spanish.",
          },
          {
            q: "Can I build an itinerary that is not listed here?",
            a: "Yes. Use the custom private tour page and tell us what you want to do, how many people are travelling and your dates.",
          },
        ];

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

  const breadcrumbSchema = generateBreadcrumbsSchema([
    { name: language === "pt" ? "Início" : language === "es" ? "Inicio" : "Home", url: getCanonicalUrl("/") },
    { name: h1, url: getCanonicalUrl("/passeio") },
  ]);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
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
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
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
          <header className="text-center mb-8">
            <h1 className="font-serif text-4xl sm:text-5xl font-bold text-foreground mb-3">
              {h1}
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">{subtitle}</p>
            <p className="text-muted-foreground text-base max-w-3xl mx-auto mt-4">{intro}</p>
          </header>

          {!isLoading && categories.length > 1 && (
            <section aria-labelledby="browse-by-category" className="mb-8 text-center">
              <h2
                id="browse-by-category"
                className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-3"
              >
                {browseByCategory}
              </h2>
              <div className="flex flex-wrap justify-center gap-x-4 gap-y-2">
                {categories.map((c) => (
                  <Link
                    key={c}
                    to={`/passeios/${slugify(c)}`}
                    className="text-sm font-semibold text-primary hover:underline capitalize"
                  >
                    {c.toLowerCase()}
                  </Link>
                ))}
              </div>
            </section>
          )}

          {!isLoading && categories.length > 1 && (
            <nav
              aria-label={language === "pt" ? "Filtrar por categoria" : language === "es" ? "Filtrar por categoría" : "Filter by category"}
              className="-mx-4 px-4 mb-8 flex gap-2 overflow-x-auto snap-x scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] sm:flex-wrap sm:justify-center sm:mx-0 sm:px-0"
            >
              {[{ value: "ALL", label: language === "pt" ? "Todos" : language === "es" ? "Todos" : "All" },
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

          <section aria-labelledby="looking-for" className="mt-16 border-t border-border pt-10">
            <h2 id="looking-for" className="font-serif text-2xl sm:text-3xl font-bold text-foreground mb-4">
              {lookingForLabel}
            </h2>
            <ul className="flex flex-wrap gap-x-6 gap-y-3">
              {hubs.map((hub) => (
                <li key={hub.to}>
                  <Link to={hub.to} className="text-primary font-semibold hover:underline">
                    {hub.label} →
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="tours-faq" className="mt-14 max-w-3xl">
            <h2 id="tours-faq" className="font-serif text-2xl sm:text-3xl font-bold text-foreground mb-6">
              {language === "pt"
                ? "Perguntas frequentes"
                : language === "es"
                ? "Preguntas frecuentes"
                : "Frequently asked questions"}
            </h2>
            <div className="space-y-6">
              {faqs.map((f) => (
                <div key={f.q} className="border-b border-border pb-6">
                  <h3 className="font-semibold text-foreground mb-2">{f.q}</h3>
                  <p className="text-muted-foreground">{f.a}</p>
                </div>
              ))}
            </div>
          </section>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PasseiosIndex;
