import { lazy, Suspense, useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import { Calendar, MapPin, Star, Check, Clock, Bus, Users, ShieldCheck, Hotel, Headphones, Ticket, Wine, ChevronDown, Flame, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCanonicalUrl, getHreflangLinks, generateSportsEventSchema, generateBreadcrumbsSchema } from "@/utils/seo";
import heroImg from "@/assets/maracana-hero.jpg";
import fansImg from "@/assets/maracana-fans.jpg";
import skylineImg from "@/assets/rio-skyline.jpg";

const Footer = lazy(() => import("@/components/Footer").then(m => ({ default: m.Footer })));

const BOOKING_URL = "https://tocorimerio.com/match/flamengo-vs-vasco-da-gama-2026-05-03";
const MATCH_DATE = new Date("2026-05-03T16:00:00-03:00");
const PAGE_PATH = "/flamengo-x-vasco-maracana";

// ========= Countdown =========
function useCountdown(target: Date) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const diff = Math.max(0, target.getTime() - now);
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  return { days, hours, minutes, seconds };
}

const TimeBox = ({ value, label }: { value: number; label: string }) => (
  <div className="flex flex-col items-center">
    <div className="bg-white/5 backdrop-blur-sm border border-[#c9a84c]/30 rounded-2xl px-4 py-5 sm:px-8 sm:py-6 min-w-[80px] sm:min-w-[120px]">
      <div className="font-serif text-4xl sm:text-6xl font-bold text-white tabular-nums leading-none">
        {String(value).padStart(2, "0")}
      </div>
    </div>
    <span className="mt-2 text-[10px] sm:text-xs uppercase tracking-[0.25em] text-[#c9a84c] font-semibold">{label}</span>
  </div>
);

// ========= Packages =========
const packages = [
  {
    name: "East Lower",
    badge: "Best Value",
    price: "US$114.52",
    seats: "Only 8 seats left",
    accent: "border-white/10",
    features: ["Round-trip transfer", "Facial biometrics", "East Lower sector seat", "Multilingual guide"],
    popular: false,
  },
  {
    name: "West Lower",
    badge: "Most Popular",
    price: "US$140.64",
    seats: "Only 8 seats left",
    accent: "border-[#c9a84c] ring-1 ring-[#c9a84c]/40",
    features: ["Round-trip transfer", "Assigned seat", "Facial biometrics", "West Lower — best view", "Multilingual guide"],
    popular: true,
  },
  {
    name: "West Upper",
    badge: "Family Friendly",
    price: "US$130.59",
    seats: "20 seats available",
    accent: "border-white/10",
    features: ["Round-trip transfer", "No biometrics needed", "Parking access", "West Upper sector seat", "Multilingual guide"],
    popular: false,
  },
  {
    name: "Maracanã Club",
    badge: "All-Inclusive",
    price: "US$180.82",
    seats: "Only 8 seats left",
    accent: "border-white/10",
    features: ["Round-trip transfer", "No biometrics needed", "Parking access", "Menu included", "Drinks + draft beer", "Multilingual guide"],
    popular: false,
  },
  {
    name: "Maracanã Mais",
    badge: "VIP Premium",
    price: "US$261.18",
    seats: "Only 8 seats left",
    accent: "border-[#c9a84c] ring-1 ring-[#c9a84c]/40",
    features: ["Round-trip transfer", "Assigned seat", "Facial biometrics", "Parking access", "Menu included", "Drinks included", "Premium VIP lounge", "Multilingual guide"],
    popular: false,
  },
];

const features = [
  { icon: Ticket, title: "Official Midfield Tickets", desc: "Best seats with unobstructed view of the pitch. West sector — fully covered." },
  { icon: Bus, title: "Executive Transfer", desc: "Air-conditioned vans with tracked fleet. Drop-off inside the stadium parking lot." },
  { icon: Users, title: "Multilingual Guides", desc: "Expert guides in English, Spanish, Portuguese and French bringing Brazilian football culture to life." },
  { icon: ShieldCheck, title: "Licensed & Trusted", desc: "CADASTUR-registered tourism company specialized in sports experiences. Operating since 2011." },
  { icon: Hotel, title: "Hotel Pickup", desc: "Convenient pickup from South Zone hotels in Rio. Our guide meets you at the lobby by name." },
  { icon: Headphones, title: "Full Support Team", desc: "Dedicated escort throughout the event. Skip-the-line entry through express security." },
];

const journey = [
  { time: "3h Before", title: "Hotel Pickup", desc: "Executive van with stops at South Zone hotels. Our guide picks you up by name. Relax and enjoy the ride." },
  { time: "1h–1h30 Before", title: "Stadium Arrival & Entry", desc: "Drop-off directly inside the stadium parking lot — exclusive access. Time for photos and pre-match atmosphere." },
  { time: "Kickoff", title: "The Match!", desc: "Live the full Brazilian fan experience in the most iconic stadium in the world. Feel the roar of 70,000 passionate fans." },
  { time: "After Match", title: "Return to Hotel", desc: "Safe and comfortable transport back to your hotel. Share unforgettable memories on the ride home." },
];

const youtubeVideos = [
  { id: "AeFVFfV1Ad0", title: "Maracanã Magic: Flamengo vs. Santos", views: "2.7K views" },
  { id: "-jRfvnBfytM", title: "Fla x Flu 2026 | Pure Emotion at Maracanã!", views: "1.5K views" },
  { id: "dACXIZKx7xs", title: "Unbelievable Atmosphere! Flamengo vs Madureira", views: "1.1K views" },
  { id: "dHbE1oFTd10", title: "Inside Maracanã: Matchday Experience", views: "613 views" },
  { id: "OvF7wAvubRk", title: "Unbelievable Matchday Vibes at Maracanã!", views: "535 views" },
  { id: "_XnRIRkhY28", title: "The Best Way to Watch Football in Rio!", views: "503 views" },
];

const FlamengoVascoMaracana = () => {
  const { days, hours, minutes, seconds } = useCountdown(MATCH_DATE);

  const [activeVideo, setActiveVideo] = useState<string | null>(null);

  return (
    <div className="bg-[#0a0a0a] text-white min-h-screen">
      <Helmet>
        <title>Flamengo vs Vasco — Maracanã Matchday Experience | Tocorime Rio</title>
        <meta name="description" content="Live Flamengo vs Vasco at Maracanã on May 3, 2026. Match ticket + executive transfer + multilingual guide. From US$114.52 per person. Book your spot." />
        <meta property="og:title" content="Flamengo vs Vasco — Maracanã Matchday Experience" />
        <meta property="og:description" content="Match ticket + executive transfer + multilingual guide. From US$114.52 per person." />
        <meta property="og:image" content={heroImg} />
        <meta property="og:type" content="website" />
        <link rel="canonical" href={getCanonicalUrl(PAGE_PATH)} />
        {getHreflangLinks(PAGE_PATH).map((l) => (
          <link key={l.hreflang} rel="alternate" hrefLang={l.hreflang} href={l.href} />
        ))}
        <meta property="og:url" content={getCanonicalUrl(PAGE_PATH)} />
        <meta property="og:site_name" content="Tocorime Rio" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Flamengo vs Vasco — Maracanã Matchday Experience" />
        <meta name="twitter:description" content="Match ticket + executive transfer + multilingual guide. From US$114.52 per person." />
        <meta name="twitter:image" content={heroImg} />
        
        <script type="application/ld+json">
          {JSON.stringify(generateSportsEventSchema({
            name: "Flamengo vs Vasco — Campeonato Brasileiro 2026",
            description: "Clássico dos Milhões entre Flamengo e Vasco no Estádio do Maracanã, Rio de Janeiro.",
            startDate: MATCH_DATE.toISOString(),
            url: getCanonicalUrl(PAGE_PATH),
            homeTeam: "Flamengo",
            awayTeam: "Vasco da Gama",
            venueName: "Estádio do Maracanã",
            offerUrl: BOOKING_URL,
            offerPrice: 114.52,
            offerCurrency: "USD"
          }))}
        </script>

        <script type="application/ld+json">
          {JSON.stringify(generateBreadcrumbsSchema([
            { name: "Home", url: getCanonicalUrl("/") },
            { name: "Maracanã Matchday", url: getCanonicalUrl("/passeio/maracana-matchday") },
            { name: "Flamengo vs Vasco", url: getCanonicalUrl(PAGE_PATH) },
          ]))}
        </script>

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

      {/* ============ HEADER ============ */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/40 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <a href="#top" className="font-serif text-lg sm:text-xl font-bold tracking-tight">
            MARACANÃ <span className="text-[#c9a84c]">MATCHDAY</span>
          </a>
          <nav className="hidden md:flex items-center gap-7 text-xs uppercase tracking-widest font-semibold text-white/70">
            <a href="#packages" className="hover:text-white transition-colors">Packages</a>
            <a href="#experience" className="hover:text-white transition-colors">Experience</a>
            <a href="#gallery" className="hover:text-white transition-colors">Gallery</a>
          </nav>
          <Button asChild className="bg-[#e63946] hover:bg-[#c1303d] text-white font-bold rounded-md h-10 px-5 text-xs uppercase tracking-widest">
            <a href={BOOKING_URL}>Book Now</a>
          </Button>
        </div>
      </header>

      {/* ============ HERO ============ */}
      <section id="top" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        <div className="absolute inset-0">
          <img src={heroImg} alt="Maracanã Stadium at night packed with Flamengo fans" className="w-full h-full object-cover" width={1920} height={1080} fetchPriority="high" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 text-center py-16">
          <div className="inline-flex items-center gap-2 border border-[#e63946]/40 bg-[#e63946]/10 backdrop-blur-sm rounded-full px-4 py-1.5 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-[#e63946] animate-pulse" />
            <span className="text-[10px] sm:text-xs uppercase tracking-[0.3em] font-bold text-white">Campeonato Brasileiro 2026</span>
          </div>

          <h1 className="font-serif font-black tracking-tight leading-[0.9] text-white">
            <span className="block text-6xl sm:text-8xl lg:text-[10rem]">FLAMENGO</span>
            <span className="block text-2xl sm:text-3xl lg:text-4xl font-light italic text-[#c9a84c] my-2 sm:my-4">v s</span>
            <span className="block text-6xl sm:text-8xl lg:text-[10rem]">VASCO</span>
          </h1>

          <div className="mt-8 sm:mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-white/90">
            <span className="inline-flex items-center gap-2 text-sm sm:text-base font-semibold uppercase tracking-wider">
              <span className="w-0.5 h-4 bg-[#e63946]" />
              <Calendar className="w-4 h-4" /> May 3, 2026
            </span>
            <span className="inline-flex items-center gap-2 text-sm sm:text-base font-semibold uppercase tracking-wider">
              <span className="w-0.5 h-4 bg-[#e63946]" />
              <MapPin className="w-4 h-4" /> Maracanã Stadium
            </span>
            <span className="inline-flex items-center gap-2 text-sm sm:text-base font-semibold uppercase tracking-wider">
              <span className="w-0.5 h-4 bg-[#e63946]" /> Rio de Janeiro
            </span>
          </div>

          <div className="mt-5 inline-flex items-center gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-[#c9a84c] text-[#c9a84c]" />
            ))}
            <span className="text-xs sm:text-sm text-white/80 ml-1">5.0 — Google Reviews</span>
          </div>

          <div className="mt-9 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4">
            <Button asChild size="lg" className="h-14 px-8 text-sm uppercase tracking-widest font-bold bg-[#e63946] hover:bg-[#c1303d] rounded-md shadow-2xl shadow-[#e63946]/30">
              <a href={BOOKING_URL}>
                Book Your Experience <ArrowRight className="w-4 h-4 ml-1" />
              </a>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-14 px-8 text-sm uppercase tracking-widest font-bold bg-transparent border-2 border-white/30 hover:bg-white hover:text-black rounded-md">
              <a href="#packages">View Packages</a>
            </Button>
          </div>

          <p className="mt-6 text-xs sm:text-sm text-white/70 font-sans">
            Starting from <span className="font-bold text-[#c9a84c]">US$114.52</span> per person — Ticket + Transfer + Guide included
          </p>
        </div>

        <a href="#countdown" className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/60 hover:text-white transition-colors animate-bounce">
          <span className="text-[10px] uppercase tracking-[0.3em]">Scroll</span>
          <ChevronDown className="w-4 h-4" />
        </a>
      </section>

      {/* ============ COUNTDOWN ============ */}
      <section id="countdown" className="py-20 sm:py-28 bg-[#0a0a0a] border-y border-white/5">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-[10px] sm:text-xs uppercase tracking-[0.3em] text-[#c9a84c] font-semibold mb-3">Kickoff Countdown</p>
          <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold mb-12">The Clock Is Ticking</h2>
          <div className="flex justify-center gap-3 sm:gap-6">
            <TimeBox value={days} label="Days" />
            <TimeBox value={hours} label="Hours" />
            <TimeBox value={minutes} label="Minutes" />
            <TimeBox value={seconds} label="Seconds" />
          </div>
          <p className="mt-10 text-sm text-white/60 font-sans">Sunday, May 3, 2026 — Maracanã Stadium, Rio de Janeiro</p>
        </div>
      </section>

      {/* ============ PACKAGES ============ */}
      <section id="packages" className="py-20 sm:py-28 bg-gradient-to-b from-[#0a0a0a] to-[#0f0f0f]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-[10px] sm:text-xs uppercase tracking-[0.3em] text-[#c9a84c] font-semibold mb-3">Choose Your Experience</p>
            <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold mb-4">Match Packages</h2>
            <p className="max-w-2xl mx-auto text-white/70 font-sans">
              Every package includes official match tickets, round-trip executive transfer, and a multilingual guide.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {packages.map((pkg) => (
              <div key={pkg.name} className={`relative bg-white/[0.03] backdrop-blur-sm border ${pkg.accent} rounded-2xl p-6 sm:p-8 flex flex-col transition-all hover:bg-white/[0.05] hover:scale-[1.02]`}>
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#c9a84c] text-black text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full">
                    Most Popular
                  </div>
                )}
                <div className="text-[10px] uppercase tracking-[0.25em] text-[#c9a84c] font-semibold mb-2">{pkg.badge}</div>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold mb-4">{pkg.name}</h3>
                <div className="mb-1">
                  <span className="font-serif text-4xl font-bold text-white">{pkg.price}</span>
                </div>
                <div className="text-xs text-white/50 mb-2">per person</div>
                <div className="inline-flex items-center gap-1.5 text-[11px] text-[#e63946] font-semibold mb-6">
                  <Flame className="w-3 h-3" /> {pkg.seats}
                </div>

                <ul className="space-y-2.5 mb-7 flex-1">
                  {pkg.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-white/85">
                      <Check className="w-4 h-4 text-[#c9a84c] mt-0.5 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <Button asChild className="w-full h-12 bg-[#e63946] hover:bg-[#c1303d] text-white font-bold uppercase tracking-widest text-xs rounded-md">
                  <a href={BOOKING_URL}>Book Now</a>
                </Button>
              </div>
            ))}
          </div>

          <p className="text-center mt-10 text-sm text-white/60 font-sans">
            Groups of 6+ people get a <span className="text-[#c9a84c] font-bold">6% discount</span> — Contact us for custom VIP packages
          </p>
        </div>
      </section>

      {/* ============ EXPERIENCE / WHY CHOOSE ============ */}
      <section id="experience" className="py-20 sm:py-28 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-[10px] sm:text-xs uppercase tracking-[0.3em] text-[#c9a84c] font-semibold mb-3">Why Choose Us</p>
            <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold">The Complete Experience</h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 mb-14">
            <div className="rounded-2xl overflow-hidden aspect-[4/3] lg:aspect-auto">
              <img src={fansImg} alt="Passionate Flamengo fans celebrating at Maracanã" className="w-full h-full object-cover" loading="lazy" width={1280} height={960} />
            </div>
            <div className="rounded-2xl overflow-hidden aspect-[4/3] lg:aspect-auto bg-[#1a1a1a] flex items-center justify-center">
              <div className="text-center p-10">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full border border-[#c9a84c]/40 bg-[#c9a84c]/10 mb-5">
                  <Ticket className="w-7 h-7 text-[#c9a84c]" />
                </div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-[#c9a84c] mb-3">VIP Stadium Access</p>
                <p className="font-serif text-2xl sm:text-3xl font-bold leading-tight">A premium matchday from start to finish</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f) => (
              <div key={f.title} className="bg-white/[0.03] border border-white/10 rounded-xl p-6 hover:bg-white/[0.05] transition-colors">
                <div className="inline-flex items-center justify-center w-11 h-11 rounded-lg bg-[#e63946]/15 text-[#e63946] mb-4">
                  <f.icon className="w-5 h-5" />
                </div>
                <h3 className="font-serif text-xl font-bold mb-2">{f.title}</h3>
                <p className="text-sm text-white/65 font-sans leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ HOW IT WORKS ============ */}
      <section className="relative py-20 sm:py-28 overflow-hidden">
        <div className="absolute inset-0">
          <img src={skylineImg} alt="Rio de Janeiro skyline at dusk" className="w-full h-full object-cover opacity-25" loading="lazy" width={1280} height={720} />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-[#0a0a0a]/80 to-[#0a0a0a]" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-[10px] sm:text-xs uppercase tracking-[0.3em] text-[#c9a84c] font-semibold mb-3">Your Matchday Journey</p>
            <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold mb-4">How It Works</h2>
            <p className="max-w-2xl mx-auto text-white/70 font-sans">From hotel pickup to the final whistle, we handle every detail so you can focus on the experience of a lifetime.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {journey.map((step, i) => (
              <div key={step.title} className="relative bg-[#0a0a0a]/80 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                <div className="text-[#c9a84c] font-serif text-5xl font-bold opacity-40 mb-3">0{i + 1}</div>
                <div className="text-[10px] uppercase tracking-[0.25em] text-[#c9a84c] font-semibold mb-2">{step.time}</div>
                <h3 className="font-serif text-xl font-bold mb-2">{step.title}</h3>
                <p className="text-sm text-white/65 font-sans leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <span className="inline-flex items-center gap-2 text-sm text-white/70 font-sans">
              <Clock className="w-4 h-4 text-[#c9a84c]" /> Total Duration: 6–7 hours
            </span>
          </div>
        </div>
      </section>

      {/* ============ GALLERY (YOUTUBE) ============ */}
      <section id="gallery" className="py-20 sm:py-28 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-[10px] sm:text-xs uppercase tracking-[0.3em] text-[#c9a84c] font-semibold mb-3">See It For Yourself</p>
            <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold mb-4">Matchday Moments</h2>
            <p className="max-w-2xl mx-auto text-white/70 font-sans">Real footage from our matchday experiences. This is what awaits you at Maracanã.</p>
          </div>

          <Carousel className="w-full">
            <CarouselContent>
              {youtubeVideos.map((v) => (
                <CarouselItem key={v.id} className="basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/6">
                  <div className="group block rounded-xl overflow-hidden bg-[#1a1a1a] border border-white/10 hover:border-[#c9a84c]/50 transition-all h-full">
                    <div className="relative aspect-[9/16] bg-black">
                      {activeVideo === v.id ? (
                        <iframe
                          src={`https://www.youtube.com/embed/${v.id}?autoplay=1&rel=0&modestbranding=1`}
                          title={v.title}
                          className="absolute inset-0 w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      ) : (
                        <button 
                          onClick={() => setActiveVideo(v.id)}
                          className="absolute inset-0 w-full h-full group"
                        >
                          <img src={`https://img.youtube.com/vi/${v.id}/hqdefault.jpg`} alt={v.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                          <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                            <div className="w-14 h-14 rounded-full bg-[#e63946] flex items-center justify-center shadow-lg">
                              <svg className="w-5 h-5 text-white ml-0.5" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                            </div>
                          </div>
                        </button>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="text-sm font-semibold leading-snug line-clamp-2">{v.title}</h3>
                      <p className="text-xs text-white/50 mt-1">{v.views}</p>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="hidden sm:block">
              <CarouselPrevious className="lg:hidden -left-4 bg-black/50 border-white/20 hover:bg-[#e63946] hover:border-[#e63946]" />
              <CarouselNext className="lg:hidden -right-4 bg-black/50 border-white/20 hover:bg-[#e63946] hover:border-[#e63946]" />
            </div>
          </Carousel>

          <div className="text-center mt-10">
            <Button asChild variant="outline" className="bg-transparent border-white/30 hover:bg-white hover:text-black rounded-md">
              <a href="https://www.youtube.com/@maracanatalksbrxp" target="_blank" rel="noopener noreferrer">
                Watch more on YouTube
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* ============ FINAL CTA ============ */}
      <section className="relative py-24 sm:py-32 overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImg} alt="" className="w-full h-full object-cover" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/80 to-black" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 border border-[#e63946]/40 bg-[#e63946]/10 rounded-full px-4 py-1.5 mb-6">
            <Flame className="w-3.5 h-3.5 text-[#e63946]" />
            <span className="text-[10px] sm:text-xs uppercase tracking-[0.3em] font-bold">Limited Availability — Sells Out Fast</span>
          </div>
          <h2 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold mb-5 leading-[1.05]">
            Don't Miss the<br /><span className="text-[#c9a84c]">Rio Derby</span>
          </h2>
          <p className="max-w-2xl mx-auto text-white/75 font-sans mb-9 text-base sm:text-lg">
            Flamengo vs Vasco at Maracanã — one of the most intense rivalries in world football. Secure your spot for an unforgettable night in Rio de Janeiro.
          </p>
          <Button asChild size="lg" className="h-16 px-10 text-sm uppercase tracking-widest font-bold bg-[#e63946] hover:bg-[#c1303d] rounded-md shadow-2xl shadow-[#e63946]/40">
            <a href={BOOKING_URL}>
              Book Your Experience Now <ArrowRight className="w-4 h-4 ml-1" />
            </a>
          </Button>
          <p className="mt-5 text-sm text-white/60 font-sans">Starting from <span className="text-[#c9a84c] font-bold">US$114.52</span> per person</p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs uppercase tracking-widest text-white/60">
            <span className="inline-flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-[#c9a84c]" /> Secure Payment</span>
            <span className="inline-flex items-center gap-2"><Check className="w-4 h-4 text-[#c9a84c]" /> Free Cancellation 72h</span>
            <span className="inline-flex items-center gap-2"><Wine className="w-4 h-4 text-[#c9a84c]" /> Visa / MC / PIX</span>
          </div>
        </div>
      </section>

      {/* ============ FOOTER (Tocorime, lazy) ============ */}
      <Suspense fallback={<div className="h-40 bg-[#0a0a0a]" />}>
        <Footer />
      </Suspense>
    </div>
  );
};

export default FlamengoVascoMaracana;
