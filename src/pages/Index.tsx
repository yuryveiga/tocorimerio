import { lazy, Suspense } from "react";
import { Helmet } from "react-helmet-async";
import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { UrgencyBar } from "@/components/UrgencyBar";
import { CopaDoMundoBanner } from "@/components/CopaDoMundoBanner";
import { useSiteData } from "@/hooks/useSiteData";
import { useLocale } from "@/contexts/LocaleContext";
import { getCanonicalUrl, generateLocalBusinessSchema, getHreflangLinks } from "@/utils/seo";
import { ViewFadeIn } from "@/components/ViewFadeIn";

// Lazy load sections below the fold
const WeatherSection = lazy(() => import("@/components/WeatherSection").then(m => ({ default: m.WeatherSection })));
const ToursSection = lazy(() => import("@/components/ToursSection").then(m => ({ default: m.ToursSection })));
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
  const siteTitle = siteSettings?.site_title || (language === 'pt' ? "Passeios Privativos Exclusivos no Rio de Janeiro | Experiências Locais Autênticas" : language === 'es' ? "Tours Privados Exclusivos en Río de Janeiro | Experiencias Locales Auténticas" : "Exclusive Private Tours in Rio de Janeiro | Authentic Local Experiences");
  const siteDescription = siteSettings?.site_description || (language === 'pt' ? "Descubra o melhor do Rio de Janeiro com nossos guias especialistas. Tours privativos e personalizados para garantir segurança e exclusividade." : language === 'es' ? "Descubra lo mejor de Río de Janeiro con nuestros guías expertos. Tours privados y personalizados para garantizar seguridad y exclusividad." : "Discover the best of Rio de Janeiro with our expert guides. Private and personalized tours to ensure safety and exclusivity.");

  return (
    <main>
      <Helmet>
        <title>{siteTitle}</title>
        <meta name="description" content={siteDescription} />
        <link
          rel="preload"
          as="image"
          href="https://ogzasprtfgimjqrtcseg.supabase.co/storage/v1/object/public/site-images/1776157066514_2zl4bonrweg.webp"
          type="image/webp"
          fetchPriority="high"
        />
        <meta property="og:title" content={siteTitle} />
        <meta property="og:description" content={siteDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={getCanonicalUrl("/")} />
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
      <CopaDoMundoBanner />
      <Header />
      <HeroSection />
      
      {/* Each lazy section in its own Suspense so a slow chunk
          doesn't hold back the others from rendering. */}
      <Suspense fallback={<SectionLoader />}><ToursSection /></Suspense>
      <Suspense fallback={<SectionLoader />}><WhyChooseUs /></Suspense>
      <Suspense fallback={null}><ViewFadeIn><ReviewsSection /></ViewFadeIn></Suspense>
      <Suspense fallback={null}><ViewFadeIn><WeatherSection /></ViewFadeIn></Suspense>
      <Suspense fallback={null}><ViewFadeIn><AboutSection /></ViewFadeIn></Suspense>
      <Suspense fallback={null}><ViewFadeIn><ContactSection /></ViewFadeIn></Suspense>
      <Suspense fallback={null}><ViewFadeIn><GallerySection /></ViewFadeIn></Suspense>
      <Suspense fallback={null}><ViewFadeIn><BlogCarousel /></ViewFadeIn></Suspense>
      <Suspense fallback={null}><Footer /></Suspense>
    </main>
  );
};

export default Index;
