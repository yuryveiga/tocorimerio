import { lazy, Suspense } from "react";
import { LazyMount } from "@/components/LazyMount";
import { Helmet } from "react-helmet-async";
import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { TrustMarquee } from "@/components/TrustMarquee";
import { UrgencyBar } from "@/components/UrgencyBar";
import { useSiteData } from "@/hooks/useSiteData";
import { useLocale } from "@/contexts/LocaleContext";
import { getCanonicalUrl, generateLocalBusinessSchema, getHreflangLinks } from "@/utils/seo";
import { ViewFadeIn } from "@/components/ViewFadeIn";

// Lazy load sections below the fold
const WeatherSection = lazy(() => import("@/components/WeatherSection").then(m => ({ default: m.WeatherSection })));
const ToursSection = lazy(() => import("@/components/ToursSection").then(m => ({ default: m.ToursSection })));
const GuideProfileSection = lazy(() => import("@/components/GuideProfileSection").then(m => ({ default: m.GuideProfileSection })));
const WhyChooseUs = lazy(() => import("@/components/WhyChooseUs").then(m => ({ default: m.WhyChooseUs })));
const ReviewsSection = lazy(() => import("@/components/ReviewsSection").then(m => ({ default: m.ReviewsSection })));
const AboutSection = lazy(() => import("@/components/AboutSection").then(m => ({ default: m.AboutSection })));
const ContactSection = lazy(() => import("@/components/ContactSection").then(m => ({ default: m.ContactSection })));
const GallerySection = lazy(() => import("@/components/GallerySection").then(m => ({ default: m.GallerySection })));
const BlogCarousel = lazy(() => import("@/components/BlogCarousel").then(m => ({ default: m.BlogCarousel })));
const Footer = lazy(() => import("@/components/Footer").then(m => ({ default: m.Footer })));

const SectionLoader = () => <div className="h-40 w-full flex items-center justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;

const Index = () => {
  const { siteSettings, images, socialMedia } = useSiteData();
  const { language } = useLocale();
  const whatsappSocial = socialMedia.find((s) => s.platform?.toLowerCase().includes('whatsapp'));
  const businessPhone = whatsappSocial?.url
    ? (whatsappSocial.url.startsWith('http')
        ? '+' + whatsappSocial.url.replace(/[^\d]/g, '')
        : whatsappSocial.url)
    : undefined;
  const siteTitle = siteSettings?.site_title || (language === 'pt' ? "Passeios Privativos no Rio | Tocorime Rio" : language === 'es' ? "Tours Privados en Río | Tocorime Rio" : "Private Tours in Rio de Janeiro | Tocorime Rio");
  const siteDescription = siteSettings?.site_description || (language === 'pt' ? "Descubra o melhor do Rio de Janeiro com nossos guias especialistas. Tours privativos e personalizados para garantir segurança e exclusividade." : language === 'es' ? "Descubra lo mejor de Río de Janeiro con nuestros guías expertos. Tours privados y personalizados para garantizar seguridad y exclusividad." : "Discover the best of Rio de Janeiro with our expert guides. Private and personalized tours to ensure safety and exclusivity.");

  return (
    <main className="flex flex-col">
      <Helmet>
        <title>{siteTitle}</title>
        <meta name="description" content={siteDescription} />
        <meta property="og:title" content={siteTitle} />
        <meta property="og:description" content={siteDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={getCanonicalUrl("/")} />
        <meta property="og:image" content={`${getCanonicalUrl("")}/og-image.jpg`} />
        <meta property="og:site_name" content="Tocorime Rio" />
        <meta property="og:locale" content={language === 'pt' ? 'pt_BR' : language === 'es' ? 'es_ES' : 'en_US'} />
        <link rel="canonical" href={getCanonicalUrl("/")} />
        {getHreflangLinks("/").map((l) => (
          <link key={l.hreflang} rel="alternate" hrefLang={l.hreflang} href={l.href} />
        ))}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={siteTitle} />
        <meta name="twitter:description" content={siteDescription} />
        <script type="application/ld+json">
          {JSON.stringify(generateLocalBusinessSchema("Tocorime Rio", siteDescription, images?.hero_bg, businessPhone))}
        </script>
      </Helmet>
      <Header />
      <HeroSection />
      <TrustMarquee />

      {/* Each lazy section in its own Suspense so a slow chunk
          doesn't hold back the others from rendering. */}
      {/* Mobile order: tours → how to book → social proof → guide/story → editorial.
          Desktop keeps the original order via md:order-none. */}
      <div className="order-1 md:order-1"><Suspense fallback={<SectionLoader />}><ToursSection /></Suspense></div>
      {/* minHeight values measured on mobile (390×844) to prevent CLS on mount. */}
      <div className="order-2 md:order-3"><LazyMount minHeight={880}><Suspense fallback={null}><WhyChooseUs /></Suspense></LazyMount></div>
      <div className="order-3 md:order-4"><LazyMount minHeight={772}><Suspense fallback={null}><ReviewsSection /></Suspense></LazyMount></div>
      <div className="order-4 md:order-7"><LazyMount minHeight={1362}><Suspense fallback={null}><ContactSection /></Suspense></LazyMount></div>
      <div className="order-5 md:order-2"><LazyMount minHeight={760}><Suspense fallback={null}><GuideProfileSection /></Suspense></LazyMount></div>
      <div className="order-6 md:order-6"><LazyMount minHeight={1412}><Suspense fallback={null}><AboutSection /></Suspense></LazyMount></div>
      <div className="order-7 md:order-5"><LazyMount minHeight={890}><Suspense fallback={null}><WeatherSection /></Suspense></LazyMount></div>
      <div className="order-8 md:order-8"><LazyMount minHeight={749}><Suspense fallback={null}><GallerySection /></Suspense></LazyMount></div>
      <div className="order-9 md:order-9"><LazyMount minHeight={1036}><Suspense fallback={null}><BlogCarousel /></Suspense></LazyMount></div>
      <div className="order-10 md:order-10"><LazyMount minHeight={1350}><Suspense fallback={null}><Footer /></Suspense></LazyMount></div>
    </main>
  );
};

export default Index;
