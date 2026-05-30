import { memo, useMemo } from "react";
import { Link } from "react-router-dom";
import Clock from "lucide-react/dist/esm/icons/clock";
import Users from "lucide-react/dist/esm/icons/users";
import Star from "lucide-react/dist/esm/icons/star";
import ArrowRight from "lucide-react/dist/esm/icons/arrow-right";
import Check from "lucide-react/dist/esm/icons/check";
import { Button } from "@/components/ui/button";
import { useSiteData } from "@/hooks/useSiteData";
import { useLocale } from "@/contexts/LocaleContext";
import { OptimizedImage } from "./OptimizedImage";
import { getTourMinPrice } from "@/utils/pricing";
import { cleanMatchSlug } from "@/utils/seo";

export type TourCardProps = {
  id: string;
  title: string;
  short_description: string;
  price: number;
  duration: string;
  max_group_size: number;
  image_url: string;
  is_featured: boolean;
  category: string;
  slug?: string;
  title_en?: string;
  title_es?: string;
  short_description_en?: string;
  short_description_es?: string;
  category_en?: string;
  category_es?: string;
  external_url?: string;
  pricing_model?: 'fixed' | 'dynamic' | 'group' | 'custom';
  price_1_person?: number;
  price_2_people?: number;
  price_3_6_people?: number;
  price_7_19_people?: number;
  use_custom_options?: boolean;
  custom_options_json?: Array<{ price: number; label?: string }>;
  included_json?: Array<string | { text: string; title?: string }>;
  included_json_en?: Array<string | { text: string; title?: string }>;
  included_json_es?: Array<string | { text: string; title?: string }>;
  match_date?: string;
};

export const TourItem = memo(({ tour }: { tour: TourCardProps }) => {
  const { t, formatPrice, language } = useLocale();
  const { siteSettings } = useSiteData();
  const hidePrices = siteSettings['hide_prices'] === 'true';
  const hideUrgency = siteSettings['hide_urgency'] === 'true';

  const getTranslated = (field: keyof TourCardProps): string => {
    if (language === 'pt') return String(tour[field] || "");
    const translated = (tour as Record<string, any>)[`${String(field)}_${language}`];
    return String(translated || tour[field] || "");
  };

  const title = getTranslated('title');
  const short_description = getTranslated('short_description');
  
  const category = (() => {
    const rawCat = tour?.category;
    if (rawCat === 'TRILHA') return t('trilhas');
    if (rawCat === 'CITY TOUR') return t('city_tours');
    return getTranslated('category');
  })();

  const durationStr = language === 'pt' ? tour.duration : tour.duration
    ?.replace(/horas/gi, t("horas"))
    .replace(/hora/gi, t("hora"))
    .replace(/minutos/gi, t("minutos"))
    .replace(/minuto/gi, t("minuto"));

  const included = useMemo(() => {
    let baseItems = [];
    if (language === 'pt') {
      baseItems = tour.included_json || [];
    } else {
      const translated = (tour as Record<string, any>)[`included_json_${language}`];
      baseItems = translated || tour.included_json || [];
    }

    if (tour.title?.includes('Maracanã MatchDay') && baseItems.length === 0) {
      if (language === 'pt') return ["Transfer", "Ingressos", "Guia Bilíngue"];
      if (language === 'es') return ["Traslado", "Entradas", "Guía Bilingüe"];
      return ["Transfer", "Tickets", "Bilingual Guide"];
    }

    return baseItems;
  }, [language, tour]);

  const href = tour.external_url || `/passeio/${tour.slug || tour.id}`;
  const isExternal = !!tour.external_url;

  const CardContent = (
    <>
      <div className="relative h-64 overflow-hidden bg-muted">
        <OptimizedImage 
          src={tour.image_url} 
          alt={title} 
          width={600} 
          containerClassName="w-full h-full"
          fit="cover"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
          loading="lazy" 
        />
        {tour.is_featured && (
          <div className="absolute top-4 left-4 bg-accent text-accent-foreground text-xs font-semibold px-3 py-1 rounded-full font-sans flex items-center gap-1">
            <Star className="w-3 h-3 fill-current" /> {t("destaque")}
          </div>
        )}
        <div className="absolute top-4 right-4 bg-card/90 backdrop-blur-sm text-foreground text-[10px] font-black px-3 py-1.5 rounded-full font-sans uppercase tracking-[0.15em] border border-border/50 shadow-sm z-10">{category}</div>
        
        {tour.match_date && (
          <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md text-primary px-3 py-2 rounded-xl shadow-xl border border-primary/20 z-10 flex flex-col items-center min-w-[60px]">
            <span className="text-[10px] font-black uppercase tracking-widest leading-none mb-1 opacity-70">
              {new Date(tour.match_date).toLocaleDateString(language === 'pt' ? 'pt-BR' : language === 'es' ? 'es-ES' : 'en-US', { month: 'short', timeZone: 'America/Sao_Paulo' })}
            </span>
            <span className="text-2xl font-black leading-none">
              {new Date(tour.match_date).toLocaleDateString('en-US', { day: 'numeric', timeZone: 'America/Sao_Paulo' })}
            </span>
          </div>
        )}
        
        {!hideUrgency && (() => {
          const scarcityMessages = {
            pt: ["Esgota rápido!", "Apenas 2 vagas p/ amanhã", "Mais reservado hoje", "Últimas vagas!", "Oferta termina logo"],
            en: ["Sells out fast!", "Only 2 spots for tomorrow", "Most booked today", "Last spots!", "Offer ends soon"],
            es: ["¡Se agota rápido!", "Solo 2 cupos para mañana", "Más reservado hoy", "¡Últimos cupos!", "Oferta termina pronto"]
          };
          const hash = tour.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
          const message = scarcityMessages[language as keyof typeof scarcityMessages]?.[hash % scarcityMessages.pt.length] || scarcityMessages.en[hash % scarcityMessages.en.length];
          
          return (
            <div className="absolute top-12 right-4 bg-red-600 text-white text-[9px] font-black px-3 py-1 rounded-full font-sans uppercase tracking-widest shadow-lg z-10 animate-pulse border border-white/20">
              {message}
            </div>
          );
        })()}

        {!hidePrices && (tour.price > 0 || tour.pricing_model === 'custom' || tour.pricing_model === 'dynamic') && (
          <div className="absolute bottom-4 right-4 bg-primary/95 text-white px-4 py-2 rounded-xl shadow-2xl backdrop-blur-md border border-white/20 z-10 animate-fade-in flex flex-col items-end">
            <span className="text-[8px] font-black uppercase tracking-tighter opacity-70 leading-none mb-1">
              {tour.pricing_model === 'group' ? t("por_grupo") : t("a_partir_de")}
            </span>
            <span className="text-xl font-black font-sans leading-none">
              {formatPrice(getTourMinPrice(tour))}
            </span>
          </div>
        )}
      </div>
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="font-serif text-xl font-semibold text-foreground mb-2 line-clamp-2 min-h-[3.5rem] group-hover:text-primary transition-colors">{title}</h3>
        <p className="text-muted-foreground text-sm mb-6 font-sans line-clamp-2 min-h-[2.5rem] leading-relaxed">{short_description}</p>

        <div className="mt-auto space-y-4">
          <div className="flex items-center gap-4 text-[10px] text-muted-foreground font-black uppercase tracking-[0.15em] opacity-60 min-h-[18px]">
            {tour.duration ? (
              <span className="flex items-center gap-1.5 bg-muted px-2 py-1 rounded-md">
                <Clock className="w-3.5 h-3.5 text-primary" />
                {durationStr?.split(' ')[0]} {t("horas")}
              </span>
            ) : (
              <span className="invisible">.</span>
            )}
            {tour.max_group_size > 1 && (
              <span className="flex items-center gap-1.5 bg-muted px-2 py-1 rounded-md">
                <Users className="w-3.5 h-3.5 text-primary" />
                {language === 'pt' ? `até ${tour.max_group_size}` : language === 'es' ? `hasta ${tour.max_group_size}` : `up to ${tour.max_group_size}`}
              </span>
            )}
          </div>
          
          {included.length > 0 && (
            <ul className="space-y-1.5 mb-6">
              {included.slice(0, 3).map((item, i: number) => (
                <li key={i} className="flex items-center gap-2 text-[11px] font-bold text-foreground/70">
                  <div className="w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5 text-primary" />
                  </div>
                  <span className="line-clamp-1">
                    {typeof item === 'string' ? item : (item as { text: string; title?: string }).text || (item as { text: string; title?: string }).title}
                  </span>
                </li>
              ))}
            </ul>
          )}

          <div className={`w-full h-14 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-accent/20 ${hidePrices ? 'bg-accent' : 'bg-accent hover:brightness-110'} hover:shadow-accent/40 group-hover:scale-[1.02] transition-all duration-500 border-none text-white flex items-center justify-center`}>
            <div className="flex items-center gap-2">
              {hidePrices 
                ? (language === 'pt' ? 'VER DETALHES' : language === 'es' ? 'VER DETALLES' : 'VIEW DETAILS')
                : (isExternal 
                    ? (language === 'pt' ? 'RESERVAR AGORA' : language === 'es' ? 'RESERVAR AHORA' : 'BOOK NOW') 
                    : t("reservar"))}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>
    </>
  );

  if (isExternal) {
    return (
      <a 
        href={href} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="block bg-card rounded-2xl overflow-hidden shadow-lg border border-border/50 group hover:shadow-xl transition-shadow duration-300 focus:outline-none focus:ring-2 focus:ring-primary"
        aria-label={`${isExternal ? (language === 'pt' ? 'Saber mais sobre' : 'Learn more about') : t("reservar")} ${title}`}
      >
        {CardContent}
      </a>
    );
  }

  return (
    <Link 
      to={href} 
      className="block bg-card rounded-2xl overflow-hidden shadow-lg border border-border/50 group hover:shadow-xl transition-shadow duration-300 focus:outline-none focus:ring-2 focus:ring-primary"
      aria-label={`${t("reservar")} ${title}`}
    >
      {CardContent}
    </Link>
  );
});

TourItem.displayName = "TourItem";
