import { lazy, Suspense } from "react";
import { LazyMount } from "@/components/LazyMount";
import { Helmet } from "react-helmet-async";
import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { TrustMarquee } from "@/components/TrustMarquee";
import { useSiteData } from "@/hooks/useSiteData";
import { useLocale } from "@/contexts/LocaleContext";
import { getCanonicalUrl, generateTravelAgencySchema, getHreflangLinks } from "@/utils/seo";

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
const FinalCTASection = lazy(() => import("@/components/FinalCTASection").then(m => ({ default: m.FinalCTASection })));
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
  const contactEmail = socialMedia.find((s) => s.platform?.toLowerCase() === 'email')?.url;
  // sameAs: apenas perfis oficiais realmente cadastrados (sem inventar redes).
  const officialProfiles = socialMedia
    .filter((s) => ['instagram', 'tripadvisor', 'youtube', 'facebook'].includes((s.platform || '').toLowerCase()))
    .map((s) => s.url)
    .filter((u): u is string => !!u && u.startsWith('http'));
  const siteTitle = language === 'pt'
    ? (siteSettings?.site_title || "Passeios Privados no Rio de Janeiro | Tocorime Rio")
    : language === 'es'
    ? (siteSettings?.site_title_es || siteSettings?.site_title || "Tours Privados en Río de Janeiro | Tocorime Rio")
    : (siteSettings?.site_title_en || siteSettings?.site_title || "Private Tours in Rio de Janeiro | Tocorime Rio");
  const siteDescription = language === 'pt'
    ? (siteSettings?.site_description || "Explore o Rio de Janeiro com guias locais bilíngues, passeios privados, roteiros flexíveis e reserva segura. Descubra as experiências Tocorime Rio.")
    : language === 'es'
    ? (siteSettings?.site_description_es || siteSettings?.site_description || "Explora Río de Janeiro con guías locales bilingües, tours privados, itinerarios flexibles y reserva segura. Descubre las experiencias Tocorime Rio.")
    : (siteSettings?.site_description_en || siteSettings?.site_description || "Explore Rio de Janeiro with bilingual local guides, private tours, flexible itineraries and secure booking. Discover Tocorime Rio experiences.");

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
          {JSON.stringify(generateTravelAgencySchema({
            description: siteDescription,
            imageUrl: images?.hero_bg,
            telephone: businessPhone,
            email: contactEmail,
            sameAs: officialProfiles,
          }))}
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
      <div className="order-10 md:order-10"><LazyMount minHeight={380}><Suspense fallback={null}><FinalCTASection /></Suspense></LazyMount></div>
      <div className="order-11 md:order-11"><LazyMount minHeight={1350}><Suspense fallback={null}><Footer /></Suspense></LazyMount></div>
    </main>
  );
};

export default Index;
