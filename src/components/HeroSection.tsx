import { useState, useEffect } from "react";
import ChevronDown from "lucide-react/dist/esm/icons/chevron-down";
import ArrowRight from "lucide-react/dist/esm/icons/arrow-right";
import ShieldCheck from "lucide-react/dist/esm/icons/shield-check";
import Award from "lucide-react/dist/esm/icons/award";
import Lock from "lucide-react/dist/esm/icons/lock";
import Flame from "lucide-react/dist/esm/icons/flame";
import { Button } from "@/components/ui/button";
import { useSiteData } from "@/hooks/useSiteData";
import { useLocale } from "@/contexts/LocaleContext";
import { SocialProof } from "./SocialProof";

export function HeroSection() {
  const { images, siteSettings, socialMedia } = useSiteData();
  const { t, language } = useLocale();
  const [currentBg, setCurrentBg] = useState(0);
  const heroStyle = siteSettings['hero_style'] || "style1";

  const heroTitleKey = language === 'pt' ? 'hero_title' : `hero_title_${language}`;
  const heroSubtitleKey = language === 'pt' ? 'hero_subtitle' : `hero_subtitle_${language}`;

  const heroTitle = siteSettings[heroTitleKey] || siteSettings['hero_title'] || `${t("conheca_melhor")} ${t("rio_janeiro")}`;
  const heroSubtitle = siteSettings[heroSubtitleKey] || siteSettings['hero_subtitle'] || t("hero_desc");

  const siteName = siteSettings['site_name'] || 'Tocorime Rio';
  const logoUrl = siteSettings?.logo_url || images['logo'];

  // Default shown immediately — no API wait (critical for LCP)
  const DEFAULT_HERO = "https://ogzasprtfgimjqrtcseg.supabase.co/storage/v1/object/public/site-images/1776157066514_2zl4bonrweg.webp";

  const availableBgs = [
    images["hero_bg"],
    images["hero_bg_2"],
    images["hero_bg_3"]
  ].filter(Boolean);

  // If admin hasn't set any images yet, show the default immediately.
  // Once the API resolves, availableBgs will have real URLs and override.
  const heroBgs = availableBgs.length > 0 ? availableBgs : [DEFAULT_HERO];

  useEffect(() => {
    if (heroBgs.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentBg((prev) => (prev + 1) % heroBgs.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [heroBgs.length]);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const handleWhatsAppClick = () => {
    const whatsapp = socialMedia.find(s => 
      s.platform.toLowerCase().includes('whatsapp') || 
      (s.icon_name && s.icon_name.toLowerCase().includes('phone'))
    );
    if (whatsapp) {
      const cleanNumber = whatsapp.url.replace(/[^\d+]/g, "");
      const url = whatsapp.url.startsWith('http') 
        ? whatsapp.url 
        : `https://wa.me/${cleanNumber.replace('+', '')}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      // Fallback
      window.open('https://wa.me/5521999999999', '_blank');
    }
  };

  // ======== Reusable hero content blocks (shared across all 3 styles) ========
  const MiniBrand = ({ light = true }: { light?: boolean }) => (
    <div className={`flex items-center justify-center gap-2.5 mb-4 ${light ? 'text-white/90' : 'text-foreground/85'}`}>
      {logoUrl && (
        <img
          src={logoUrl}
          alt={siteName}
          className="h-20 w-20 sm:h-24 sm:w-24 object-contain drop-shadow-lg"
          loading="eager"
        />
      )}
      <span className="font-serif text-2xl sm:text-3xl font-semibold tracking-tight">{siteName}</span>
    </div>
  );

  const SocialProofChip = ({ light = true }: { light?: boolean }) => (
    <SocialProof light={light} className="mb-6" />
  );

  const Audience = ({ light = true }: { light?: boolean }) => (
    <p className={`text-sm sm:text-base font-sans font-medium mb-5 ${light ? 'text-white/80' : 'text-muted-foreground'}`}>
      {t('hero_audience')}
    </p>
  );

  const Guarantees = ({ light = true }: { light?: boolean }) => (
    <div className={`flex flex-wrap items-center justify-center gap-x-5 gap-y-2 mb-7 text-xs sm:text-sm font-medium ${light ? 'text-white/85' : 'text-muted-foreground'}`}>
      <span className="inline-flex items-center gap-1.5"><Award className="w-4 h-4 text-accent" />{t('guarantee_guides')}</span>
      <span className="inline-flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-accent" />{t('guarantee_entry')}</span>
      <span className="inline-flex items-center gap-1.5"><Lock className="w-4 h-4 text-accent" />{t('guarantee_payment')}</span>
    </div>
  );

  const HeroCTAs = ({ light = true }: { light?: boolean }) => (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 w-full sm:w-auto mx-auto">
      <Button
        size="lg"
        onClick={handleWhatsAppClick}
        className="group h-14 sm:h-12 text-base sm:text-lg px-8 font-bold font-sans bg-accent hover:bg-accent/90 text-accent-foreground shadow-[0_8px_30px_-4px_hsl(var(--accent)/0.5)] hover:shadow-[0_12px_40px_-4px_hsl(var(--accent)/0.7)] transition-all hover:scale-[1.02]"
      >
        {language === 'pt' ? 'Tour Personalizado' : language === 'es' ? 'Tour Personalizado' : 'Custom Tour'}
        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
      </Button>
      <Button
        size="lg"
        variant="outline"
        onClick={() => scrollTo("tours")}
        className={`h-14 sm:h-12 text-base sm:text-lg px-8 font-semibold font-sans border-2 ${light ? 'bg-white/10 backdrop-blur-sm border-white/40 text-white hover:bg-white hover:text-foreground' : ''}`}
      >
        {t('cta_see_tours')}
      </Button>
    </div>
  );

  const ScarcityBadge = ({ light = true }: { light?: boolean }) => (
    <div className="mt-6 flex justify-center">
      <span className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs sm:text-sm font-bold animate-pulse ${light ? 'bg-accent/95 text-accent-foreground shadow-lg' : 'bg-accent/15 text-accent border border-accent/40'}`}>
        <Flame className="w-4 h-4" />
        {t('last_spots_week')}
      </span>
    </div>
  );

  const renderSlideshowBackgrounds = () => (
    <>
      {heroBgs.map((bg, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 bg-cover bg-center bg-no-repeat ${index === currentBg ? 'opacity-100' : 'opacity-0'}`}
          style={{ backgroundImage: `url(${bg})` }}
        >
          {/* Hidden <img> so the browser preload scanner can fetch the image.
              fetchpriority="high" on index 0 tells the browser this is LCP-critical. */}
          <img
            src={bg}
            alt=""
            aria-hidden="true"
            width={1920}
            height={1080}
            className="absolute inset-0 w-full h-full object-cover opacity-0 pointer-events-none select-none"
            fetchPriority={index === 0 ? "high" : "low"}
            loading={index === 0 ? "eager" : "lazy"}
            decoding={index === 0 ? "sync" : "async"}
          />
        </div>
      ))}
      <div className="absolute inset-0 bg-black/50" />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background via-background/20 to-transparent z-[5]" />
    </>
  );

  // ============================ STYLE 3: Glassmorphism ============================
  if (heroStyle === "style3") {
    return (
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black">
        {renderSlideshowBackgrounds()}
        <div className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-6 mt-16 animate-fade-in-up">
          <div className="bg-background/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 sm:p-12 text-center shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent to-transparent opacity-60"></div>

            <MiniBrand />
            <div className="flex justify-center"><SocialProofChip /></div>

            <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl font-bold mb-4 text-white text-balance drop-shadow-lg leading-tight">
              {heroTitle}
            </h1>

            <p className="text-base sm:text-lg text-white/90 max-w-2xl mx-auto mb-3 font-sans">
              {heroSubtitle}
            </p>

            <Audience />
            <Guarantees />
            <HeroCTAs />
            <ScarcityBadge />
          </div>
        </div>
      </section>
    );
  }

  // ============================ STYLE 2: Split Screen ============================
  if (heroStyle === "style2") {
    return (
      <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-background">
        <div className="absolute inset-0 w-full lg:w-[70%] lg:left-[30%] z-0 h-[50vh] lg:h-full top-0 lg:top-0 mt-16 lg:mt-0">
          {renderSlideshowBackgrounds()}
          <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-background via-background/90 to-transparent w-full lg:w-64 z-10 hidden lg:block"></div>
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background via-background/90 to-transparent h-32 z-10 block lg:hidden"></div>
        </div>

        <div className="w-full lg:w-[55%] relative z-10 flex items-center justify-center p-6 sm:p-12 lg:p-20 bg-background lg:bg-transparent lg:bg-gradient-to-r lg:from-background lg:via-background lg:to-transparent mt-[50vh] lg:mt-0">
          <div className="max-w-xl w-full text-center lg:text-left animate-fade-in-up">
            <div className="lg:justify-start"><MiniBrand light={false} /></div>
            <SocialProofChip light={false} />

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-7xl font-extrabold mb-4 text-foreground text-balance leading-[1.05]">
              {heroTitle}
            </h1>

            <p className="text-base sm:text-lg text-muted-foreground mb-3 font-sans leading-relaxed">
              {heroSubtitle}
            </p>

            <Audience light={false} />

            <div className="lg:[&>div]:justify-start"><Guarantees light={false} /></div>

            <div className="lg:[&>div]:!mx-0 lg:[&>div]:justify-start"><HeroCTAs light={false} /></div>

            <div className="lg:[&>div]:!justify-start"><ScarcityBadge light={false} /></div>
          </div>
        </div>
      </section>
    );
  }

  // ============================ STYLE 1: Classic (default) ============================
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black">
      {renderSlideshowBackgrounds()}

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white mt-16">
        <div className="animate-fade-in-up">
          <MiniBrand />
          <div className="flex justify-center"><SocialProofChip /></div>

          <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold mb-4 text-white text-balance drop-shadow-2xl leading-[1.05] tracking-tight">
            {heroTitle}
          </h1>

          <p className="text-base sm:text-xl text-white/90 max-w-3xl mx-auto mb-3 font-sans drop-shadow">
            {heroSubtitle}
          </p>

          <Audience />
          <Guarantees />
          <HeroCTAs />
          <ScarcityBadge />
        </div>
      </div>

      <button
        onClick={() => scrollTo("tours")}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 animate-bounce p-2 hover:text-accent transition-colors focus:outline-none"
        aria-label={language === 'pt' ? "Rolar para passeios" : "Scroll to tours"}
      >
        <ChevronDown className="w-7 h-7 text-white/70" />
      </button>
    </section>
  );
}
