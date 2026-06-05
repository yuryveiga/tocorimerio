import { lazy, Suspense, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import ArrowRight from "lucide-react/dist/esm/icons/arrow-right";
import Star from "lucide-react/dist/esm/icons/star";
import Award from "lucide-react/dist/esm/icons/award";
import ShieldCheck from "lucide-react/dist/esm/icons/shield-check";
import MapPin from "lucide-react/dist/esm/icons/map-pin";
import Sparkles from "lucide-react/dist/esm/icons/sparkles";
import Sun from "lucide-react/dist/esm/icons/sun";
import Mountain from "lucide-react/dist/esm/icons/mountain";
import Building2 from "lucide-react/dist/esm/icons/building-2";
import Clock from "lucide-react/dist/esm/icons/clock";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { ViewFadeIn } from "@/components/ViewFadeIn";
import { useSiteData } from "@/hooks/useSiteData";
import { useLocale } from "@/contexts/LocaleContext";

const Footer = lazy(() => import("@/components/Footer").then(m => ({ default: m.Footer })));
const ReviewsSection = lazy(() => import("@/components/ReviewsSection").then(m => ({ default: m.ReviewsSection })));
const GallerySection = lazy(() => import("@/components/GallerySection").then(m => ({ default: m.GallerySection })));
const BlogCarousel = lazy(() => import("@/components/BlogCarousel").then(m => ({ default: m.BlogCarousel })));

// Hero + category fallback images (Rio-themed, royalty free)
const HERO_BG = "/hero-experiences.jpg";
const IMG_CITY = "https://images.unsplash.com/photo-1516306580123-e6e52b1b7b5f?q=80&w=1600&auto=format&fit=crop";
const IMG_HIKING = "https://images.unsplash.com/photo-1761325970855-9786c0164b68?q=80&w=1600&auto=format&fit=crop";
const IMG_ONEDAY = "https://images.unsplash.com/photo-1544989164-31dc3c645987?q=80&w=1600&auto=format&fit=crop";

export default function Experiences() {
  const { socialMedia } = useSiteData();
  const { t } = useLocale();
  const [scrollY, setScrollY] = useState(0);

  const CATEGORIES = [
    {
      slug: "/passeios/city-tour",
      label: t("city_tours"),
      tag: t("ex_tag_popular"),
      icon: Building2,
      desc: t("ex_cat_city_desc"),
      image: IMG_CITY,
    },
    {
      slug: "/passeios/hiking",
      label: t("trilhas"),
      tag: t("ex_tag_adventurers"),
      icon: Mountain,
      desc: t("ex_cat_hiking_desc"),
      image: IMG_HIKING,
    },
    {
      slug: "/passeios/one-day",
      label: t("ex_cat_oneday_label"),
      tag: t("ex_tag_daytrips"),
      icon: Sun,
      desc: t("ex_cat_oneday_desc"),
      image: IMG_ONEDAY,
    },
  ];

  const BADGES = [
    { title: t("ex_badge1_title"), sub: t("ex_badge1_sub"), icon: Award },
    { title: t("ex_badge2_title"), sub: t("ex_badge2_sub"), icon: Star },
    { title: t("ex_badge3_title"), sub: t("ex_badge3_sub"), icon: ShieldCheck },
    { title: t("ex_badge4_title"), sub: t("ex_badge4_sub"), icon: ShieldCheck },
  ];

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        setScrollY(window.scrollY);
        raf = 0;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const whatsapp = socialMedia.find(
    (s) => s.platform?.toLowerCase().includes("whatsapp") || s.icon_name?.toLowerCase().includes("phone")
  );
  const waUrl = whatsapp
    ? whatsapp.url.startsWith("http")
      ? whatsapp.url
      : `https://wa.me/${whatsapp.url.replace(/[^\d+]/g, "").replace("+", "")}`
    : "https://wa.me/5521999999999";

  return (
    <>
      <Helmet>
        <title>{t("ex_meta_title")}</title>
        <meta name="description" content={t("ex_meta_desc")} />
        <link rel="canonical" href="https://tocorimerio.com/experiences" />
        <meta property="og:title" content={t("ex_og_title")} />
        <meta property="og:description" content={t("ex_og_desc")} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://tocorimerio.com/experiences" />
        <meta property="og:image" content={HERO_BG} />
      </Helmet>

      <Header />

      {/* ─── HERO ───────────────────────────────────────────────────────────── */}
      <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden bg-black">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${HERO_BG})`,
            transform: `translate3d(0, ${Math.min(scrollY * 0.35, 240)}px, 0) scale(1.06)`,
            animation: "ken-burns 18s ease-in-out infinite alternate",
            willChange: "transform",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/55 to-black/80" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent z-[5]" />

        <div
          className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white pt-24 pb-12"
          style={{
            transform: `translate3d(0, ${Math.min(scrollY * 0.18, 120)}px, 0)`,
            opacity: Math.max(1 - scrollY / 700, 0),
          }}
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md border border-white/25 px-4 py-1.5 mb-6 text-xs font-bold uppercase tracking-[0.2em]">
            <Sparkles className="w-3.5 h-3.5 text-accent" />
            {t("ex_low_season")}
          </div>

          <h1 className="title-reveal font-serif text-4xl sm:text-6xl lg:text-7xl font-bold mb-6 text-balance drop-shadow-2xl leading-[1.05] tracking-tight">
            <span style={{ animationDelay: "0.1s" }}>{t("ex_hero_1")}</span>{" "}
            <span style={{ animationDelay: "0.22s" }}>{t("ex_hero_2")}</span>{" "}
            <span style={{ animationDelay: "0.34s" }}>{t("ex_hero_3")}</span>{" "}
            <span style={{ animationDelay: "0.46s" }}>{t("ex_hero_4")}</span>{" "}
            <span style={{ animationDelay: "0.58s" }}>{t("ex_hero_5")}</span>{" "}
            <span style={{ animationDelay: "0.70s" }}>{t("ex_hero_6")}</span>
          </h1>

          <p className="text-base sm:text-xl text-white/90 max-w-2xl mx-auto mb-8 font-sans" dangerouslySetInnerHTML={{ __html: t("ex_hero_sub").replace('5.0', '<strong>5.0</strong>') }} />

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4">
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="shimmer-cta inline-flex items-center justify-center gap-2 h-14 px-8 text-lg font-bold rounded-md bg-accent hover:bg-accent/90 text-accent-foreground shadow-[0_8px_30px_-4px_hsl(var(--accent)/0.5)] hover:shadow-[0_12px_40px_-4px_hsl(var(--accent)/0.7)] transition-all hover:scale-[1.02]"
            >
              {t("ex_plan_trip")}
              <ArrowRight className="w-5 h-5" />
            </a>
            <a
              href="#experiences"
              className="inline-flex items-center justify-center h-14 px-8 text-lg font-semibold rounded-md border-2 bg-white/10 backdrop-blur-sm border-white/40 text-white hover:bg-white hover:text-foreground transition-all"
            >
              {t("ex_explore")}
            </a>
          </div>

          {/* Inline trust strip */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-white/85 text-sm font-medium">
            <span className="inline-flex items-center gap-1.5">
              {[0, 1, 2, 3, 4].map((i) => (
                <Star key={i} className="w-4 h-4 fill-accent text-accent" />
              ))}
              <span className="ml-1">{t("ex_trust_1")}</span>
            </span>
            <span className="inline-flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-accent" /> {t("ex_trust_2")}</span>
            <span className="inline-flex items-center gap-1.5"><MapPin className="w-4 h-4 text-accent" /> {t("ex_trust_3")}</span>
          </div>
        </div>
      </section>

      {/* ─── TRUST BADGES ──────────────────────────────────────────────────── */}
      <section className="py-12 bg-background border-b border-border/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {BADGES.map((b, i) => (
              <ViewFadeIn key={b.title} delay={i * 0.08}>
                <div className="group flex items-center gap-3 rounded-2xl border border-border/60 bg-card p-4 hover:border-accent/60 hover:shadow-lg transition-all">
                  <div className="w-11 h-11 rounded-xl bg-accent/10 text-accent flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <b.icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-sm leading-tight text-foreground">{b.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{b.sub}</p>
                  </div>
                </div>
              </ViewFadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 3 CATEGORY CARDS ──────────────────────────────────────────────── */}
      <section id="experiences" className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ViewFadeIn>
            <div className="text-center mb-14">
              <p className="text-xs font-black uppercase tracking-[0.3em] text-accent mb-3">{t("ex_mid_eyebrow")}</p>
              <h2 className="font-serif text-3xl md:text-5xl font-bold text-foreground mb-4 text-balance">
                {t("ex_mid_title")}
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
                {t("ex_mid_desc")}
              </p>
            </div>
          </ViewFadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {CATEGORIES.map((cat, i) => (
              <ViewFadeIn key={cat.slug} delay={i * 0.12}>
                <Link
                  to={cat.slug}
                  className="tilt-card group block relative h-[480px] rounded-3xl overflow-hidden shadow-xl border border-border/40 focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <img
                    src={cat.image}
                    alt={cat.label}
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.10]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-accent/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  {/* Tag */}
                  <div className="absolute top-5 left-5">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/95 text-accent-foreground px-3 py-1 text-[10px] font-black uppercase tracking-widest backdrop-blur-sm">
                      <Sparkles className="w-3 h-3" />
                      {cat.tag}
                    </span>
                  </div>

                  {/* Icon top-right */}
                  <div className="absolute top-5 right-5 w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md border border-white/30 text-white flex items-center justify-center">
                    <cat.icon className="w-5 h-5" />
                  </div>

                  {/* Content */}
                  <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                    <h3 className="font-serif text-3xl font-bold mb-2 drop-shadow-lg leading-tight">
                      {cat.label}
                    </h3>
                    <p className="text-white/85 text-sm mb-4 leading-relaxed line-clamp-3">
                      {cat.desc}
                    </p>
                    <span className="inline-flex items-center gap-2 text-accent font-bold text-sm uppercase tracking-wide group-hover:gap-3 transition-all">
                      {t("ex_view_tours")}
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </Link>
              </ViewFadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ─── STRATEGIC PHRASE: Low season ──────────────────────────────────── */}
      <section className="relative py-20 bg-primary text-primary-foreground overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_30%_20%,white,transparent_40%)]" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ViewFadeIn>
            <Clock className="w-10 h-10 mx-auto mb-6 text-accent" />
            <h2 className="font-serif text-3xl md:text-5xl font-bold mb-4 text-balance">
              {t("ex_promo_title")}
            </h2>
            <p className="text-lg md:text-xl text-primary-foreground/85 max-w-2xl mx-auto mb-8">
              {t("ex_promo_desc")}
            </p>
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="shimmer-cta inline-flex items-center justify-center gap-2 h-14 px-10 text-lg font-bold rounded-md bg-accent hover:bg-accent/90 text-accent-foreground shadow-2xl transition-all hover:scale-[1.02]"
            >
              {t("ex_promo_cta")}
              <ArrowRight className="w-5 h-5" />
            </a>
          </ViewFadeIn>
        </div>
      </section>

      {/* ─── REVIEWS ───────────────────────────────────────────────────────── */}
      <Suspense fallback={<div className="h-40" />}>
        <ReviewsSection />
      </Suspense>

      {/* ─── FINAL CTA ─────────────────────────────────────────────────────── */}
      <section className="py-24 bg-background text-center">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <ViewFadeIn>
            <h2 className="font-serif text-3xl md:text-5xl font-bold text-foreground mb-4 text-balance">
              {t("ex_final_title")}
            </h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
              {t("ex_final_desc")}
            </p>
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="shimmer-cta inline-flex items-center justify-center gap-2 h-14 px-10 text-lg font-bold rounded-md bg-accent hover:bg-accent/90 text-accent-foreground shadow-[0_8px_30px_-4px_hsl(var(--accent)/0.5)] hover:shadow-[0_12px_40px_-4px_hsl(var(--accent)/0.7)] transition-all hover:scale-[1.02]"
            >
              {t("ex_final_cta")}
              <ArrowRight className="w-5 h-5" />
            </a>
          </ViewFadeIn>
        </div>
      </section>

      <Suspense fallback={null}>
        <GallerySection />
      </Suspense>

      <Suspense fallback={null}>
        <BlogCarousel title={t("ex_blog_title")} />
      </Suspense>

      <Suspense fallback={null}>
        <Footer />
      </Suspense>
    </>
  );
}