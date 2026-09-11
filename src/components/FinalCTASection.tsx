import { Button } from "@/components/ui/button";
import { useLocale } from "@/contexts/LocaleContext";
import { useSiteData } from "@/hooks/useSiteData";
import ArrowRight from "lucide-react/dist/esm/icons/arrow-right";
import MessageCircle from "lucide-react/dist/esm/icons/message-circle";
import { ViewFadeIn } from "./ViewFadeIn";

export const FinalCTASection = () => {
  const { t, language } = useLocale();
  const { socialMedia } = useSiteData();

  const openWhatsApp = () => {
    const whatsapp = socialMedia.find(s =>
      s.platform?.toLowerCase().includes('whatsapp') ||
      (s.icon_name && s.icon_name.toLowerCase().includes('phone'))
    );
    const text = language === 'pt'
      ? 'Olá! Quero planejar um tour personalizado no Rio de Janeiro.'
      : language === 'es'
      ? '¡Hola! Quiero planificar un tour personalizado en Río de Janeiro.'
      : 'Hello! I want to plan a custom tour in Rio de Janeiro.';
    if (whatsapp) {
      const cleanNumber = whatsapp.url.replace(/[^\d+]/g, "");
      const url = whatsapp.url.startsWith('http')
        ? whatsapp.url
        : `https://wa.me/${cleanNumber.replace('+', '')}?text=${encodeURIComponent(text)}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      window.open(`https://wa.me/5521970702523?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
    }
  };

  const scrollToTours = () => {
    document.getElementById('tours')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="py-16 sm:py-20 bg-primary text-primary-foreground relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-emerald-900 opacity-95" />
      <div className="relative container mx-auto px-4 text-center">
        <ViewFadeIn>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold mb-3 text-balance">
            {t('final_cta_title')}
          </h2>
          <p className="text-primary-foreground/85 text-base sm:text-lg max-w-xl mx-auto mb-8 font-sans">
            {t('final_cta_sub')}
          </p>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 max-w-2xl mx-auto">
            <Button
              size="lg"
              onClick={scrollToTours}
              className="h-13 sm:h-12 px-8 text-base font-bold font-sans bg-accent hover:bg-accent/90 text-accent-foreground shadow-lg hover:scale-[1.02] transition-all"
            >
              {t('check_availability')}
              <ArrowRight className="w-5 h-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={openWhatsApp}
              className="h-13 sm:h-12 px-8 text-base font-semibold font-sans border-2 bg-white/10 backdrop-blur-sm border-white/40 text-white hover:bg-white hover:text-foreground"
            >
              {t('plan_custom_tour')}
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={openWhatsApp}
              className="h-13 sm:h-12 px-8 text-base font-semibold font-sans border-2 border-[#25D366]/60 text-white hover:bg-[#25D366]/20"
            >
              <MessageCircle className="w-5 h-5 text-[#25D366]" />
              {language === 'pt' ? 'Chamar no WhatsApp' : language === 'es' ? 'Preguntar por WhatsApp' : 'Ask on WhatsApp'}
            </Button>
          </div>
        </ViewFadeIn>
      </div>
    </section>
  );
};
