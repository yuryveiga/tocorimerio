import { memo, useMemo, useState } from "react";
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
  pricing_model?: 'fixed' | 'dynamic' | 'group' | 'custom' | 'tiered';
  price_1_person?: number;
  price_2_people?: number;
  price_3_6_people?: number;
  price_7_19_people?: number;
  use_custom_options?: boolean;
  custom_options_json?: Array<{ price: number; label?: string }>;
  included_json?: Array<string | { text: string; title?: string }>;
  included_json_en?: Array<string | { text: string; title?: string }>;
  included_json_es?: Array<string | { text: string; title?: string }>;
  tiered_pricing_json?: { min_people: number; max_people: number | null; price_per_person: number }[];
  match_date?: string;
};

export const TourItem = memo(({ tour }: { tour: TourCardProps }) => {
  const { t, formatPrice, language } = useLocale();
  const { siteSettings } = useSiteData();
  const hidePrices = siteSettings['hide_prices'] === 'true';
  const hideUrgency = siteSettings['hide_urgency'] === 'true';
  const [showDetails, setShowDetails] = useState(false);

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
          sizes="(max-width: 640px) 92vw, (max-width: 1024px) 50vw, 33vw" 
          containerClassName="w-full h-full"
          fit="cover"
          className="w-full h-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.2,0.8,0.2,1)] group-hover:scale-110" 
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

        {!hidePrices && (() => {
          const minPrice = getTourMinPrice(tour);
          if (minPrice <= 0) return null;
          return (
            <div className="absolute bottom-4 right-4 bg-primary/95 text-white px-4 py-2 rounded-xl shadow-2xl backdrop-blur-md border border-white/20 z-10 animate-fade-in flex flex-col items-end">
              <span className="text-[8px] font-black uppercase tracking-tighter opacity-70 leading-none mb-1">
                {t("a_partir_de")}
              </span>
              <span className="text-xl font-black font-sans leading-none">
                {formatPrice(minPrice)}
              </span>
            </div>
          );
        })()}


      </div>
      <div className="p-4 sm:p-6 flex flex-col flex-grow">
        <h3 className="font-serif text-lg sm:text-xl font-semibold text-foreground mb-2 line-clamp-2 sm:min-h-[3.5rem] group-hover:text-primary transition-colors">{title}</h3>
        <div className="hidden sm:block mb-6">
          <p className="text-muted-foreground text-sm font-sans line-clamp-2 min-h-[2.5rem] leading-relaxed">{short_description}</p>
        </div>

        {/* Mobile: compact meta row (price · duration · category) */}
        <div className="sm:hidden flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-bold text-muted-foreground mb-3">
          {!hidePrices && getTourMinPrice(tour) > 0 && (
            <span className="text-foreground font-black">{formatPrice(getTourMinPrice(tour))}</span>
          )}
          {tour.duration && (
            <span className="flex items-center gap-1">
              <span className="opacity-40">·</span>
              <Clock className="w-3 h-3 text-primary" />
              {durationStr?.split(' ')[0]} {t("horas")}
            </span>
          )}
          {category && (
            <span className="flex items-center gap-1">
              <span className="opacity-40">·</span>
              <span className="uppercase tracking-wider">{category}</span>
            </span>
          )}
        </div>

        {/* Mobile: long description collapsed behind "Ver detalhes" */}
        <div className="sm:hidden mb-3">
          {showDetails && (
            <p className="text-muted-foreground text-sm font-sans leading-relaxed mb-2">{short_description}</p>
          )}
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowDetails(v => !v); }}
            aria-expanded={showDetails}
            aria-label={`${showDetails
              ? (language === 'pt' ? 'Ocultar detalhes de' : language === 'es' ? 'Ocultar detalles de' : 'Hide details of')
              : (language === 'pt' ? 'Ver detalhes de' : language === 'es' ? 'Ver detalles de' : 'View details of')} ${title}`}
            className="inline-flex items-center min-h-[44px] py-2 pr-3 text-[11px] font-bold uppercase tracking-wider text-primary underline underline-offset-4"
          >
            {showDetails
              ? (language === 'pt' ? 'Ocultar detalhes' : language === 'es' ? 'Ocultar detalles' : 'Hide details')
              : (language === 'pt' ? 'Ver detalhes' : language === 'es' ? 'Ver detalles' : 'View details')}
          </button>
        </div>

        <div className="mt-auto space-y-4">
          <div className="hidden sm:flex items-center gap-4 text-[10px] text-muted-foreground font-black uppercase tracking-[0.15em] opacity-60 min-h-[18px]">
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
            <ul className="hidden sm:block space-y-1.5 mb-6">
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

          <div className={`w-full h-12 sm:h-14 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-accent/20 ${hidePrices ? 'bg-accent' : 'bg-accent hover:brightness-110'} hover:shadow-accent/40 group-hover:scale-[1.02] transition-all duration-500 border-none text-white flex items-center justify-center`}>
            <div className="flex items-center gap-2">
              {hidePrices 
                ? (language === 'pt' ? 'VER DETALHES' : language === 'es' ? 'VER DETALLES' : 'VIEW DETAILS')
                : (isExternal 
                    ? (language === 'pt' ? 'RESERVAR AGORA' : language === 'es' ? 'RESERVAR AHORA' : 'BOOK NOW') 
                    : t("reservar"))}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* WhatsApp inline CTA */}
          <a
            href={`https://wa.me/5521970702523?text=${encodeURIComponent(language === 'pt' ? `Olá! Tenho interesse no passeio: ${title}` : language === 'es' ? `¡Hola! Me interesa el tour: ${title}` : `Hello! I'm interested in the tour: ${title}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className="hidden sm:flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-[#25D366]/30 text-[#25D366] hover:bg-[#25D366]/10 transition-colors text-[11px] font-bold uppercase tracking-wider"
          >
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 shrink-0" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            {language === 'pt' ? 'Perguntar no WhatsApp' : language === 'es' ? 'Preguntar por WhatsApp' : 'Ask on WhatsApp'}
          </a>
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
        className="tilt-card block bg-card rounded-2xl overflow-hidden shadow-lg border border-border/50 group hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-primary"
        aria-label={`${isExternal ? (language === 'pt' ? 'Saber mais sobre' : 'Learn more about') : t("reservar")} ${title}`}
      >
        {CardContent}
      </a>
    );
  }

  return (
    <Link 
      to={href} 
      className="tilt-card block bg-card rounded-2xl overflow-hidden shadow-lg border border-border/50 group hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-primary"
      aria-label={`${t("reservar")} ${title}`}
    >
      {CardContent}
    </Link>
  );
});

TourItem.displayName = "TourItem";
