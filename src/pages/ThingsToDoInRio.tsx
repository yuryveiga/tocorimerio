import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { TourItem, TourCardProps } from "@/components/TourItem";
import { useSiteData } from "@/hooks/useSiteData";
import { useLocale } from "@/contexts/LocaleContext";
import { getCanonicalUrl, getHreflangLinks, BASE_URL } from "@/utils/seo";

const PATH = "/things-to-do-in-rio-de-janeiro";

const TITLE = "Things to Do in Rio de Janeiro: 2026 Local Guide & Tours";
const DESCRIPTION =
  "What to do in Rio de Janeiro, chosen by local guides: Christ the Redeemer, Sugarloaf, hikes, favela and coffee tours. Book a private English-speaking guide.";

const HIGHLIGHTS: { title: string; text: string; to: string; cta: string }[] = [
  {
    title: "1. Christ the Redeemer & the classic city tour",
    text: "The single thing every first-timer wants. Going with a guide means skipping the ticket confusion, arriving at the right hour for light and crowds, and understanding what you are looking at.",
    to: "/city-tour",
    cta: "See city tours",
  },
  {
    title: "2. Sugarloaf, Urca and the sunset",
    text: "Late afternoon is the best slot: you go up in daylight and come down over a lit city. Pair it with a drink in Urca, where cariocas sit on the seawall.",
    to: "/blog/best-sunset-spots-rio-de-janeiro",
    cta: "Best sunset spots",
  },
  {
    title: "3. Hiking: Pedra da Gávea, Dois Irmãos, Tijuca Forest",
    text: "Rio has the largest urban forest in the world. Trails range from a 40-minute walk to a demanding 6-hour scramble — the right pick depends on your fitness and the season.",
    to: "/hiking",
    cta: "See hikes",
  },
  {
    title: "4. A community-led favela tour in Rocinha",
    text: "Done properly, with local residents, it is one of the most honest experiences in the city. Done badly, it is voyeurism. Read the guide before you book anything.",
    to: "/blog/best-favela-tour-in-rocinha-for-cultural-immersion",
    cta: "How to choose",
  },
  {
    title: "5. Historic centre, Little Africa and specialty coffee",
    text: "Colonial squares, imperial palaces and the port district where Brazil's Black history was written — ending in the best specialty coffee shops downtown.",
    to: "/blog/the-best-specialty-coffee-shops-in-the-center-of-rio-de-janeiro",
    cta: "Downtown coffee guide",
  },
  {
    title: "6. A match at Maracanã",
    text: "Flamengo, Fluminense or Vasco at the Maracanã is the loudest thing you will do in Brazil. Sector choice matters a lot for a first visit.",
    to: "/maracana-calendario",
    cta: "Match calendar",
  },
  {
    title: "7. Beaches beyond Copacabana",
    text: "Ipanema's Posto 9, Leblon, Prainha and Grumari. Which one to pick depends on the day, the swell and how far you want to travel.",
    to: "/blog/tours-in-copacabana-the-iconic-rio-beach-without-tourist-traps",
    cta: "Beach guide",
  },
  {
    title: "8. Feijoada, botecos and Lapa at night",
    text: "Saturday feijoada, then samba in Lapa. Where locals actually go, and what to avoid on Rua do Lavradio.",
    to: "/blog/best-feijoada-rio-de-janeiro-tourists",
    cta: "Where to eat feijoada",
  },
];

const FAQS = [
  {
    q: "How many days do you need in Rio de Janeiro?",
    a: "Four full days covers the essentials without rushing: one for Christ the Redeemer and the historic centre, one for Sugarloaf and the beaches, one hike, and one flexible day for a favela tour, Maracanã or a day trip.",
  },
  {
    q: "What is the best time of year to visit Rio?",
    a: "May to October is drier, cooler and far less crowded. December to March is hot and humid with strong afternoon rain, but it is also when the city is at its most alive, ending in Carnival.",
  },
  {
    q: "Is Rio de Janeiro safe for tourists?",
    a: "Rio is safe for visitors who follow local habits: leave valuables at the hotel, use apps instead of hailing cars, avoid empty streets at night and do not walk into communities on your own. A local guide removes most of the guesswork.",
  },
  {
    q: "Do I need a guide, or can I do Rio on my own?",
    a: "You can do the beaches and Copacabana alone. For Christ the Redeemer, hikes, favelas, the historic centre and Maracanã, a licensed bilingual guide saves time, money on tickets and a lot of confusion.",
  },
  {
    q: "How much does a private tour in Rio de Janeiro cost?",
    a: "Private tours with Tocorime Rio start at around R$200 per hour for a licensed English-speaking guide, with fixed-price full experiences for hikes, city tours and cultural itineraries. Every price on the site is final, with no hidden fees.",
  },
  {
    q: "What should I do in Rio when it rains?",
    a: "The historic centre works perfectly in the rain: museums, colonial churches, the Royal Portuguese Reading Room and the specialty coffee shops downtown. Hikes and viewpoints are the ones to reschedule.",
  },
];

export default function ThingsToDoInRio() {
  const { tours, isLoading } = useSiteData();
  const { language } = useLocale();

  const featured = [...(tours || [])]
    .sort((a, b) => {
      if (a.is_featured !== b.is_featured) return a.is_featured ? -1 : 1;
      return (a.sort_order ?? 0) - (b.sort_order ?? 0);
    })
    .slice(0, 6);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${BASE_URL}/` },
      { "@type": "ListItem", position: 2, name: "Things to Do in Rio de Janeiro", item: `${BASE_URL}${PATH}` },
    ],
  };

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Best things to do in Rio de Janeiro",
    itemListElement: HIGHLIGHTS.map((h, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: h.title.replace(/^\d+\.\s*/, ""),
      url: `${BASE_URL}${h.to}`,
    })),
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{TITLE}</title>
        <meta name="description" content={DESCRIPTION} />
        <meta
          name="keywords"
          content="things to do in rio de janeiro, what to do in rio de janeiro, rio de janeiro tours, private tour rio de janeiro, rio de janeiro itinerary, best time to visit rio, english speaking guide rio"
        />
        <link rel="canonical" href={getCanonicalUrl(PATH)} />
        {getHreflangLinks(PATH).map((l) => (
          <link key={l.hreflang} rel="alternate" hrefLang={l.hreflang} href={l.href} />
        ))}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={getCanonicalUrl(PATH)} />
        <meta property="og:title" content={TITLE} />
        <meta property="og:description" content={DESCRIPTION} />
        <meta property="og:site_name" content="Tocorime Rio" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={TITLE} />
        <meta name="twitter:description" content={DESCRIPTION} />
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(itemListSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>

      <Header />

      <main className="pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <header className="mb-10">
            <h1 className="font-serif text-4xl sm:text-5xl font-bold text-foreground mb-4">
              Things to Do in Rio de Janeiro
            </h1>
            <p className="text-lg text-muted-foreground">
              Written by the local guides who run the tours. No affiliate lists, no copied itineraries — this is what we
              actually recommend to visitors, in the order most people should do it.
            </p>
          </header>

          <div className="flex flex-wrap gap-3 mb-14">
            <Link
              to="/passeio"
              className="inline-flex items-center rounded-full bg-primary px-6 py-3 text-primary-foreground font-semibold hover:opacity-90 transition"
            >
              Browse all tours
            </Link>
            <Link
              to="/your-private-guide-in-rio"
              className="inline-flex items-center rounded-full border border-border px-6 py-3 font-semibold text-foreground hover:bg-muted transition"
            >
              Hire a private guide by the hour
            </Link>
            <Link
              to="/private-tours-rio-de-janeiro"
              className="inline-flex items-center rounded-full border border-border px-6 py-3 font-semibold text-foreground hover:bg-muted transition"
            >
              Private tours in Rio
            </Link>
          </div>

          <section className="space-y-10 mb-16">
            <h2 className="font-serif text-3xl font-bold text-foreground">
              The 8 things worth your time in Rio
            </h2>
            {HIGHLIGHTS.map((h) => (
              <article key={h.title}>
                <h3 className="font-serif text-xl font-bold text-foreground mb-2">{h.title}</h3>
                <p className="text-muted-foreground mb-2">{h.text}</p>
                <Link to={h.to} className="text-primary font-semibold hover:underline">
                  {h.cta} →
                </Link>
              </article>
            ))}
          </section>
        </div>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          <h2 className="font-serif text-3xl font-bold text-foreground mb-3">
            Book it with a local guide
          </h2>
          <p className="text-muted-foreground mb-8 max-w-2xl">
            Small groups or fully private, licensed bilingual guides, final prices with no hidden fees.
          </p>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-96 bg-muted rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featured.map((tour) => (
                <TourItem key={tour.id} tour={tour as unknown as TourCardProps} />
              ))}
            </div>
          )}
          <div className="mt-8">
            <Link to="/passeio" className="text-primary font-semibold hover:underline">
              See every tour in Rio de Janeiro →
            </Link>
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-serif text-3xl font-bold text-foreground mb-6">
            Frequently asked questions about visiting Rio
          </h2>
          <div className="space-y-6">
            {FAQS.map((f) => (
              <div key={f.q} className="border-b border-border pb-6">
                <h3 className="font-semibold text-foreground mb-2">{f.q}</h3>
                <p className="text-muted-foreground">{f.a}</p>
              </div>
            ))}
          </div>

          {language !== "en" && (
            <p className="mt-10 text-sm text-muted-foreground">
              Esta página é escrita em inglês por ser voltada a visitantes internacionais.
            </p>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
