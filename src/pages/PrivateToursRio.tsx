import { lazy, Suspense } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { TourItem, TourCardProps } from "@/components/TourItem";
import { useSiteData } from "@/hooks/useSiteData";
import { getCanonicalUrl, getHreflangLinks, BASE_URL, DEFAULT_OG_IMAGE } from "@/utils/seo";

const Footer = lazy(() => import("@/components/Footer").then((m) => ({ default: m.Footer })));
const ReviewsSection = lazy(() => import("@/components/ReviewsSection").then((m) => ({ default: m.ReviewsSection })));

const PATH = "/private-tours-rio-de-janeiro";

const TITLE = "Private Tours in Rio de Janeiro | Local Bilingual Guides";
const DESCRIPTION =
  "Private tours in Rio de Janeiro with local bilingual guides, private transport, hotel pickup and flexible itineraries. Check availability and book online.";
const KEYWORDS =
  "private tours Rio de Janeiro, Rio private tours, private tour Rio, private guide Rio de Janeiro, private city tour Rio, english speaking guide Rio de Janeiro";

const BENEFITS: { title: string; text: string }[] = [
  {
    title: "Local guides, not scripts",
    text: "Every tour is led by a licensed guide who lives in Rio and speaks English, Spanish and Portuguese. You get context, safety and honest advice — not a memorised speech.",
  },
  {
    title: "Flexible itinerary",
    text: "Your group decides the pace. Start earlier for better light at Christ the Redeemer, swap a museum for a beach, or stretch lunch. Nothing is locked to a bus schedule.",
  },
  {
    title: "Hotel pickup",
    text: "We meet you at your hotel or Airbnb in the South Zone, Centro or Barra, and drop you back at the end. No meeting points to find on your own.",
  },
  {
    title: "Private transportation",
    text: "Air-conditioned private vehicle with a driver on the tours that include transport, so you spend the day sightseeing instead of queueing for cars.",
  },
];

const FAQS = [
  {
    q: "What is included in a private tour in Rio de Janeiro?",
    a: "It depends on the experience, but private tours generally include a licensed bilingual guide, private transportation and hotel pickup. Attraction tickets, meals and drinks are listed individually on each tour page, under what's included and what's not included.",
  },
  {
    q: "How much does a private tour in Rio cost?",
    a: "Full experiences have fixed prices that drop per person as the group grows — each tour page shows the final price for your group size. If you prefer to hire a guide by the hour instead of booking a set itinerary, that starts at R$200 per hour.",
  },
  {
    q: "Are the guides English-speaking?",
    a: "Yes. All of our guides work in English, Spanish and Portuguese. If you need another language, ask on WhatsApp before booking and we will confirm availability.",
  },
  {
    q: "Can the itinerary be changed during the tour?",
    a: "Yes — that is the main reason to go private. Within the time booked, you and your guide can reorder stops, spend longer somewhere or adapt to weather and traffic.",
  },
  {
    q: "Is hotel pickup included?",
    a: "Hotel pickup is included on the tours that list it under what's included. Walking tours normally start at a meeting point in the neighbourhood, shown on the tour page.",
  },
  {
    q: "Can I book at the last minute?",
    a: "Often yes, subject to guide and vehicle availability. For next-day or same-day requests, message us on WhatsApp and we will confirm before you pay.",
  },
  {
    q: "What happens if it rains?",
    a: "Viewpoints and hikes can be moved to another day or replaced with an indoor itinerary in the historic centre. We contact you in advance whenever the forecast makes the original plan pointless.",
  },
];

export default function PrivateToursRio() {
  const { tours, isLoading, socialMedia } = useSiteData();

  const wa = socialMedia.find(
    (s) => s.platform?.toLowerCase().includes("whatsapp") && s.is_active !== false
  );
  const waMessage =
    "Hi! I'm interested in a private tour in Rio de Janeiro. Could you tell me about availability?";
  const waUrl = wa?.url || "";
  const waLink = !waUrl
    ? "#"
    : waUrl.startsWith("http")
      ? `${waUrl}${waUrl.includes("?") ? "&" : "?"}text=${encodeURIComponent(waMessage)}`
      : `https://wa.me/${waUrl.replace(/[^\d+]/g, "").replace("+", "")}?text=${encodeURIComponent(waMessage)}`;

  const featured = [...(tours || [])]
    .sort((a, b) => {
      if (a.is_featured !== b.is_featured) return a.is_featured ? -1 : 1;
      return (a.sort_order ?? 0) - (b.sort_order ?? 0);
    })
    .slice(0, 6);

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Private Tours in Rio de Janeiro",
    serviceType: "Private guided tour",
    description: DESCRIPTION,
    provider: {
      "@type": "TravelAgency",
      name: "Tocorime Rio",
      url: BASE_URL,
      image: DEFAULT_OG_IMAGE,
    },
    areaServed: { "@type": "City", name: "Rio de Janeiro" },
    availableLanguage: ["en", "pt", "es"],
    url: `${BASE_URL}${PATH}`,
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${BASE_URL}/` },
      { "@type": "ListItem", position: 2, name: "Private Tours in Rio de Janeiro", item: `${BASE_URL}${PATH}` },
    ],
  };

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Private tours in Rio de Janeiro",
    itemListElement: featured.map((t: any, i: number) => ({
      "@type": "ListItem",
      position: i + 1,
      name: t.title_en || t.title,
      url: `${BASE_URL}/passeio/${t.slug || t.id}`,
    })),
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{TITLE}</title>
        <meta name="description" content={DESCRIPTION} />
        <meta name="keywords" content={KEYWORDS} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={getCanonicalUrl(PATH)} />
        {getHreflangLinks(PATH).map((l) => (
          <link key={l.hreflang} rel="alternate" hrefLang={l.hreflang} href={l.href} />
        ))}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={getCanonicalUrl(PATH)} />
        <meta property="og:title" content={TITLE} />
        <meta property="og:description" content={DESCRIPTION} />
        <meta property="og:site_name" content="Tocorime Rio" />
        <meta property="og:locale" content="en_US" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={TITLE} />
        <meta name="twitter:description" content={DESCRIPTION} />
        <script type="application/ld+json">{JSON.stringify(serviceSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
        {featured.length > 0 && <script type="application/ld+json">{JSON.stringify(itemListSchema)}</script>}
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>

      <Header />

      <main className="pt-28 sm:pt-32 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <header className="mb-8">
            <h1 className="font-serif text-3xl sm:text-5xl font-bold text-foreground mb-4">
              Private Tours in Rio de Janeiro
            </h1>
            <p className="text-lg text-muted-foreground">
              Discover Rio safely with bilingual local guides, private transportation and tailor-made experiences.
              Small groups or fully private, final prices with no hidden fees, and a 5.0 rating on TripAdvisor.
            </p>
          </header>

          <div className="flex flex-wrap gap-3 mb-12">
            <Link
              to="/passeio"
              className="inline-flex min-h-[44px] items-center rounded-full bg-primary px-6 py-3 text-primary-foreground font-semibold hover:opacity-90 transition"
            >
              Check Availability
            </Link>
            <Link
              to="/custom-private-tour-rio-de-janeiro"
              className="inline-flex min-h-[44px] items-center rounded-full border border-border px-6 py-3 font-semibold text-foreground hover:bg-muted transition"
            >
              Plan a Custom Tour
            </Link>
          </div>

          <section className="mb-14">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-foreground mb-6">
              Why choose a private tour in Rio
            </h2>
            <div className="grid gap-6 sm:grid-cols-2">
              {BENEFITS.map((b) => (
                <article key={b.title}>
                  <h3 className="font-serif text-lg font-bold text-foreground mb-1">{b.title}</h3>
                  <p className="text-muted-foreground text-sm sm:text-base">{b.text}</p>
                </article>
              ))}
            </div>
          </section>
        </div>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-14">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-foreground mb-3">
            Top private experiences
          </h2>
          <p className="text-muted-foreground mb-8 max-w-2xl">
            Our most booked private tours. Each page shows duration, group type, what's included and the final price for
            your group.
          </p>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-80 rounded-2xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.map((tour) => (
                <TourItem key={tour.id} tour={tour as TourCardProps} />
              ))}
            </div>
          )}
          <div className="mt-8 flex flex-wrap gap-4 text-sm">
            <Link to="/city-tour" className="text-primary font-semibold hover:underline">
              Rio city tours →
            </Link>
            <Link to="/hiking" className="text-primary font-semibold hover:underline">
              Hiking tours →
            </Link>
            <Link to="/one-day" className="text-primary font-semibold hover:underline">
              One-day tours →
            </Link>
            <Link to="/maracana-calendario" className="text-primary font-semibold hover:underline">
              Maracanã matchdays →
            </Link>
            <Link to="/your-private-guide-in-rio" className="text-primary font-semibold hover:underline">
              Hire a guide by the hour →
            </Link>
          </div>
        </section>

        <Suspense fallback={<div className="h-40" />}>
          <ReviewsSection />
        </Suspense>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <section className="mb-14">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-foreground mb-6">
              Private tours in Rio: frequently asked questions
            </h2>
            <div className="space-y-6">
              {FAQS.map((f) => (
                <article key={f.q}>
                  <h3 className="font-semibold text-foreground mb-1">{f.q}</h3>
                  <p className="text-muted-foreground text-sm sm:text-base">{f.a}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-border p-6 sm:p-8 text-center">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-foreground mb-3">Ready to Explore Rio?</h2>
            <p className="text-muted-foreground mb-6">
              Pick an experience, or tell us what you like and we build the itinerary around it.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                to="/passeio"
                className="inline-flex min-h-[44px] items-center rounded-full bg-primary px-6 py-3 text-primary-foreground font-semibold hover:opacity-90 transition"
              >
                Check Availability
              </Link>
              <Link
                to="/custom-private-tour-rio-de-janeiro"
                className="inline-flex min-h-[44px] items-center rounded-full border border-border px-6 py-3 font-semibold text-foreground hover:bg-muted transition"
              >
                Plan a Custom Tour
              </Link>
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[44px] items-center rounded-full border border-border px-6 py-3 font-semibold text-foreground hover:bg-muted transition"
              >
                Ask on WhatsApp
              </a>
            </div>
          </section>
        </div>
      </main>

      <Suspense fallback={null}>
        <Footer />
      </Suspense>
    </div>
  );
}
