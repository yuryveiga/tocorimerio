import { lazy, Suspense, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useSiteData } from "@/hooks/useSiteData";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { getCanonicalUrl, getHreflangLinks, BASE_URL, DEFAULT_OG_IMAGE } from "@/utils/seo";

const Footer = lazy(() => import("@/components/Footer").then((m) => ({ default: m.Footer })));
const ReviewsSection = lazy(() => import("@/components/ReviewsSection").then((m) => ({ default: m.ReviewsSection })));

const PATH = "/custom-private-tour-rio-de-janeiro";

const TITLE = "Custom Private Tour in Rio de Janeiro | Built Around You";
const DESCRIPTION =
  "Tell us your dates, group and interests and a local guide builds your custom private tour in Rio de Janeiro. Free quote, flexible itinerary, no hidden fees.";
const KEYWORDS =
  "custom private tour Rio, tailor made tour Rio de Janeiro, custom tour Rio de Janeiro, private guide Rio de Janeiro, personalized Rio itinerary";

const INTEREST_OPTIONS = [
  "Christ the Redeemer & Sugarloaf",
  "Beaches & sunset",
  "Hiking & nature",
  "Favela & local culture",
  "Historic centre & museums",
  "Food, coffee & botecos",
  "Maracanã football match",
  "Samba & nightlife",
  "Day trip outside Rio",
  "Travelling with kids",
];

const STEPS = [
  {
    title: "1. Tell us the basics",
    text: "Dates, how many travellers, where you are staying and what you are curious about. Two minutes, no account needed.",
  },
  {
    title: "2. A guide writes your itinerary",
    text: "One of our local guides replies with a suggested day-by-day plan, timings and a final price for your group — nothing generic.",
  },
  {
    title: "3. Adjust and confirm",
    text: "Change anything you want, then confirm. You pay only after the itinerary and price are agreed.",
  },
];

const FAQS = [
  {
    q: "How much does a custom private tour in Rio cost?",
    a: "It depends on the itinerary, group size and whether transport and tickets are included. Hourly private guiding starts at R$200 per hour, and full-day custom itineraries are quoted per group. Every quote we send is a final price with no hidden fees.",
  },
  {
    q: "How long does it take to get a reply?",
    a: "Usually within a few hours during the day in Rio (UTC-3), and always within 24 hours. If your trip starts within 48 hours, message us on WhatsApp so we can confirm availability faster.",
  },
  {
    q: "Can you combine several experiences in one day?",
    a: "Yes. Most custom tours mix a landmark, a neighbourhood and something local — for example Christ the Redeemer in the morning, the historic centre and coffee in the afternoon.",
  },
  {
    q: "Do you organise tours for families with children?",
    a: "Yes. Tell us the children's ages in the form and the guide adapts distances, walking time and stops accordingly.",
  },
  {
    q: "Is hotel pickup possible?",
    a: "Hotel or Airbnb pickup is available on itineraries that include private transport. We confirm it in the quote.",
  },
  {
    q: "Which languages do the guides speak?",
    a: "English, Spanish and Portuguese. Ask in the form if you need another language and we will check availability.",
  },
];

export default function CustomTourRio() {
  const { socialMedia } = useSiteData();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [interests, setInterests] = useState<string[]>([]);

  const emailSocial = socialMedia.find((s) => s.platform?.toLowerCase() === "email");
  const contactEmail = emailSocial?.url || "";

  const wa = socialMedia.find(
    (s) => s.platform?.toLowerCase().includes("whatsapp") && s.is_active !== false
  );
  const waMessage =
    "Hi! I'd like a custom private tour in Rio de Janeiro. Could you help me build my itinerary?";
  const waUrl = wa?.url || "";
  const waLink = !waUrl
    ? "#"
    : waUrl.startsWith("http")
      ? `${waUrl}${waUrl.includes("?") ? "&" : "?"}text=${encodeURIComponent(waMessage)}`
      : `https://wa.me/${waUrl.replace(/[^\d+]/g, "").replace("+", "")}?text=${encodeURIComponent(waMessage)}`;

  const toggleInterest = (value: string) => {
    setInterests((prev) => (prev.includes(value) ? prev.filter((i) => i !== value) : [...prev, value]));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    setSubmitting(true);
    try {
      const lines = [
        `Travel date: ${fd.get("date") || "not informed"}`,
        `Travellers: ${fd.get("travelers") || "not informed"}`,
        `Hotel / area: ${fd.get("hotel") || "not informed"}`,
        `Interests: ${interests.length ? interests.join(", ") : "not informed"}`,
        "",
        String(fd.get("notes") || ""),
      ];
      const { error } = await supabase.functions.invoke("send-contact-email", {
        body: {
          to: contactEmail,
          senderName: String(fd.get("name") || ""),
          senderEmail: String(fd.get("email") || ""),
          senderPhone: String(fd.get("phone") || ""),
          tourInterest: "Custom Private Tour in Rio de Janeiro",
          message: lines.join("\n"),
        },
      });
      if (error) throw error;
      setSent(true);
      form.reset();
      setInterests([]);
      toast({ title: "Request sent!", description: "A local guide will reply with your itinerary shortly." });
    } catch (err) {
      toast({
        title: "Could not send",
        description: "Please try again or reach us on WhatsApp.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Custom Private Tour in Rio de Janeiro",
    serviceType: "Tailor-made private tour",
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
      { "@type": "ListItem", position: 2, name: "Private Tours in Rio de Janeiro", item: `${BASE_URL}/private-tours-rio-de-janeiro` },
      { "@type": "ListItem", position: 3, name: "Custom Private Tour in Rio de Janeiro", item: `${BASE_URL}${PATH}` },
    ],
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
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>

      <Header />

      <main className="pt-28 sm:pt-32 pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <header className="mb-8">
            <h1 className="font-serif text-3xl sm:text-5xl font-bold text-foreground mb-4">
              Custom Private Tour in Rio de Janeiro
            </h1>
            <p className="text-lg text-muted-foreground">
              Tell us your dates, your group and what you actually want to see. A local bilingual guide builds the
              itinerary around it — private transport, flexible timing and a final price with no hidden fees.
            </p>
          </header>

          <div className="flex flex-wrap gap-3 mb-12">
            <a
              href="#build-my-rio-tour"
              className="inline-flex min-h-[44px] items-center rounded-full bg-primary px-6 py-3 text-primary-foreground font-semibold hover:opacity-90 transition"
            >
              Build My Rio Tour
            </a>
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[44px] items-center rounded-full border border-border px-6 py-3 font-semibold text-foreground hover:bg-muted transition"
            >
              Ask on WhatsApp
            </a>
          </div>

          <section className="mb-14">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-foreground mb-6">How it works</h2>
            <div className="space-y-5">
              {STEPS.map((s) => (
                <article key={s.title}>
                  <h3 className="font-serif text-lg font-bold text-foreground mb-1">{s.title}</h3>
                  <p className="text-muted-foreground text-sm sm:text-base">{s.text}</p>
                </article>
              ))}
            </div>
          </section>

          <section id="build-my-rio-tour" className="mb-14 scroll-mt-28">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-foreground mb-2">Build my Rio tour</h2>
            <p className="text-muted-foreground mb-6">
              Only five fields. Everything else we sort out together.
            </p>

            {sent ? (
              <div className="rounded-2xl border border-border p-6">
                <p className="font-semibold text-foreground mb-2">Request received.</p>
                <p className="text-muted-foreground text-sm">
                  A local guide will reply with a suggested itinerary and price. If you prefer to talk right now, message
                  us on WhatsApp.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="rounded-2xl border border-border p-5 sm:p-6 space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="date">Date</Label>
                    <Input id="date" name="date" type="date" className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="travelers">Number of travellers</Label>
                    <Input id="travelers" name="travelers" type="number" min={1} placeholder="2" className="mt-1" />
                  </div>
                </div>

                <div>
                  <Label htmlFor="hotel">Hotel or neighbourhood</Label>
                  <Input id="hotel" name="hotel" placeholder="Copacabana, Ipanema, Centro…" className="mt-1" />
                </div>

                <div>
                  <span className="text-sm font-medium text-foreground">Interests</span>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {INTEREST_OPTIONS.map((opt) => {
                      const active = interests.includes(opt);
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => toggleInterest(opt)}
                          aria-pressed={active}
                          className={`rounded-full border px-3 py-2 text-sm transition min-h-[40px] ${
                            active
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border text-foreground hover:bg-muted"
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="name">Your name</Label>
                    <Input id="name" name="name" required className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" type="email" required className="mt-1" />
                  </div>
                </div>

                <div>
                  <Label htmlFor="phone">WhatsApp (optional)</Label>
                  <Input id="phone" name="phone" className="mt-1" />
                </div>

                <div>
                  <Label htmlFor="notes">Anything else? (optional)</Label>
                  <Textarea id="notes" name="notes" rows={3} className="mt-1" placeholder="Kids' ages, mobility, must-sees…" />
                </div>

                <Button type="submit" disabled={submitting} className="w-full h-12 text-base font-bold">
                  {submitting ? "Sending…" : "Build My Rio Tour"}
                </Button>
              </form>
            )}
          </section>

          <section className="mb-14">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-foreground mb-6">
              Custom tours in Rio: frequently asked questions
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
        </div>

        <Suspense fallback={<div className="h-40" />}>
          <ReviewsSection />
        </Suspense>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <section className="rounded-2xl border border-border p-6 sm:p-8 text-center">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-foreground mb-3">
              Prefer a ready-made experience?
            </h2>
            <p className="text-muted-foreground mb-6">
              Browse our private tours in Rio — city tours, hikes, cultural experiences and Maracanã matchdays.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                to="/private-tours-rio-de-janeiro"
                className="inline-flex min-h-[44px] items-center rounded-full bg-primary px-6 py-3 text-primary-foreground font-semibold hover:opacity-90 transition"
              >
                Private tours in Rio
              </Link>
              <Link
                to="/passeio"
                className="inline-flex min-h-[44px] items-center rounded-full border border-border px-6 py-3 font-semibold text-foreground hover:bg-muted transition"
              >
                Check Availability
              </Link>
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
