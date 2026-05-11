import { Helmet } from "react-helmet-async";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { TourItem, TourCardProps } from "@/components/TourItem";
import { useSiteData } from "@/hooks/useSiteData";
import { getCanonicalUrl } from "@/utils/seo";
import { Button } from "@/components/ui/button";
import { ArrowRight, MapPin, Star, ShieldCheck, Users } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useLocale } from "@/contexts/LocaleContext";

const OurTours = () => {
  const { tours, isLoading } = useSiteData();
  const { setLanguage } = useLocale();
  const navigate = useNavigate();

  useEffect(() => {
    setLanguage('en');
  }, [setLanguage]);

  // Filter and sort tours for the English landing page
  const sortedTours = [...(tours || [])]
    .filter(t => !t.hidden)
    .sort((a, b) => {
      if (a.is_featured !== b.is_featured) return a.is_featured ? -1 : 1;
      return (a.sort_order ?? 0) - (b.sort_order ?? 0);
    });

  const title = "Our Best Tours in Rio de Janeiro | Tocorime Rio";
  const description = "Discover the best experiences in Rio de Janeiro. City tours, Christ the Redeemer, Sugarloaf, Maracanã tickets and private experiences with local bilingual guides.";
  const canonical = getCanonicalUrl("/our-tours");

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
        <meta property="og:image" content="https://mwxbskzggzznxvkwgrnz.supabase.co/storage/v1/object/public/site-images/rio-hero.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      <Header />

      <main>
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center">
              <h1 className="font-serif text-5xl sm:text-7xl font-bold text-foreground mb-6 tracking-tight">
                Experience Rio <br />
                <span className="text-primary italic">Like a Local</span>
              </h1>
              <p className="text-muted-foreground text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
                Carefully curated experiences, premium service, and bilingual expert guides 
                to make your stay in Rio de Janeiro unforgettable.
              </p>
              <div className="flex flex-wrap justify-center gap-4 mb-8">
                <Button asChild size="lg" className="rounded-full px-8 h-14 text-lg">
                  <a href="#tours">View All Tours</a>
                </Button>
                <Button asChild variant="outline" size="lg" className="rounded-full px-8 h-14 text-lg">
                  <Link to="/maracana-calendario">Maracanã Tickets</Link>
                </Button>
              </div>

              <div className="flex items-center justify-center gap-4 pt-4 border-t border-border/50 max-w-xs mx-auto">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Other versions:</span>
                <button onClick={() => { setLanguage('pt'); navigate('/passeio'); }} className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-1.5">
                  <span>🇧🇷</span> PT
                </button>
                <button onClick={() => { setLanguage('es'); navigate('/passeio'); }} className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-1.5">
                  <span>🇪🇸</span> ES
                </button>
              </div>
            </div>
          </div>
          
          {/* Subtle decoration */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-0 opacity-10 pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary rounded-full blur-[120px]" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500 rounded-full blur-[120px]" />
          </div>
        </section>

        {/* Features */}
        <section className="py-12 border-y border-border bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { icon: <Star className="text-primary" />, title: "Premium Quality", desc: "Top-rated guides and vehicles" },
                { icon: <ShieldCheck className="text-primary" />, title: "Secure Booking", desc: "Trusted payment and instant confirm" },
                { icon: <Users className="text-primary" />, title: "Small Groups", desc: "More personal and intimate experiences" },
                { icon: <MapPin className="text-primary" />, title: "Local Experts", desc: "Deep knowledge of Rio's secrets" }
              ].map((f, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-background border border-border flex items-center justify-center shrink-0">
                    {f.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground">{f.title}</h3>
                    <p className="text-xs text-muted-foreground">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Tours Grid */}
        <section id="tours" className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
              <div>
                <h2 className="font-serif text-4xl font-bold text-foreground mb-4">Our Tour Collection</h2>
                <p className="text-muted-foreground max-w-xl">
                  From iconic landmarks like Christ the Redeemer to hidden gems in the rainforest, 
                  browse our complete list of Rio de Janeiro tours.
                </p>
              </div>
              <div className="flex gap-2">
                <span className="px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20">
                  {sortedTours.length} Experiences Available
                </span>
              </div>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-[450px] bg-muted rounded-3xl animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {sortedTours.map((tour) => (
                  <TourItem key={tour.id} tour={tour as unknown as TourCardProps} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-foreground text-background overflow-hidden relative">
          <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
            <h2 className="font-serif text-4xl sm:text-5xl font-bold mb-6">Need a custom itinerary?</h2>
            <p className="text-background/70 text-lg mb-10">
              Our experts can design the perfect private experience for your family or group. 
              Contact us via WhatsApp for a personalized quote.
            </p>
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full h-14 px-10 text-lg">
              <a href="https://wa.me/5521999999999" target="_blank" rel="noopener noreferrer">
                Contact Our Experts
                <ArrowRight className="w-5 h-5 ml-2" />
              </a>
            </Button>
          </div>
          
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default OurTours;
