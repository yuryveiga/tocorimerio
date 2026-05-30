import { useLocale } from "@/contexts/LocaleContext";
import { Button } from "@/components/ui/button";
import ArrowRight from "lucide-react/dist/esm/icons/arrow-right";
import Calendar from "lucide-react/dist/esm/icons/calendar";
import { useLocation, Link } from "react-router-dom";
import { useEffect, useState } from "react";

export function MobileStickyCTA() {
  const { t, language } = useLocale();
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(false);

  // Don't show on admin or checkout/cart pages
  const isExcludedPage = 
    location.pathname.startsWith('/admin') || 
    location.pathname.includes('/carrinho') ||
    location.pathname.includes('/checkout');

  useEffect(() => {
    const handleScroll = () => {
      // Show after scrolling 300px
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (isExcludedPage) return null;

  return (
    <div 
      className={`fixed bottom-0 left-0 right-0 z-40 p-4 transition-all duration-500 transform lg:hidden ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
      }`}
    >
      <div className="bg-card/80 backdrop-blur-xl border border-white/20 rounded-2xl p-4 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] flex items-center justify-between gap-4">
        <div className="flex-1">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-0.5">
            {language === 'pt' ? 'Gostou do Rio?' : language === 'es' ? '¿Te gusta Río?' : 'Loving Rio?'}
          </p>
          <p className="text-sm font-bold text-foreground leading-tight">
            {language === 'pt' ? 'Reserve seu passeio agora' : language === 'es' ? 'Reserva tu tour ahora' : 'Book your tour now'}
          </p>
        </div>
        
        <Link to="/#tours" className="shrink-0">
          <Button className="rounded-xl h-12 px-6 font-black text-xs uppercase tracking-wider shadow-lg shadow-primary/25 bg-primary hover:bg-primary/90 flex items-center gap-2 group">
            {t("reservar")}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
