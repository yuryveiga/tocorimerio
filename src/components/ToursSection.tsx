import { useState, memo, useMemo } from "react";
import { Link } from "react-router-dom";
import { Clock, Users, Star, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSiteData } from "@/hooks/useSiteData";
import { useLocale } from "@/contexts/LocaleContext";
import { OptimizedImage } from "./OptimizedImage";
import { getTourMinPrice } from "@/utils/pricing";
import { useMatches } from "@/hooks/useMatches";
import { getMatchDateInRio } from "@/lib/dateUtils";

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
  custom_options_json?: any[];
  included_json?: any[];
  included_json_en?: any[];
  included_json_es?: any[];
  match_date?: string;
};

export const TourCard = memo(({ tour }: { tour: TourCardProps }) => {
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

    // Se for o passeio do Maracanã e não tiver itens, injeta os solicitados como fallback
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
              {new Date(tour.match_date).toLocaleDateString(language === 'pt' ? 'pt-BR' : language === 'es' ? 'es-ES' : 'en-US', { month: 'short' })}
            </span>
            <span className="text-2xl font-black leading-none">
              {new Date(tour.match_date).getUTCDate()}
            </span>
          </div>
        )}
        
        {/* Scarcity Badge */}
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

        {/* Floating Price Badge */}
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
              {included.slice(0, 3).map((item: any, i: number) => (
                <li key={i} className="flex items-center gap-2 text-[11px] font-bold text-foreground/70">
                  <div className="w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5 text-primary" />
                  </div>
                  <span className="line-clamp-1">{typeof item === 'string' ? item : item.text || item.title}</span>
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

TourCard.displayName = "TourCard";


export function ToursSection() {
  const { tours, siteSettings, isLoading: siteDataLoading } = useSiteData();
  const { data: matches, isLoading: matchesLoading } = useMatches();
  const { t, language } = useLocale();
  const [activeTab, setActiveTab] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const isLoading = siteDataLoading;
  const columns = Number(siteSettings['home_tours_columns']) || 3;
  const count = Number(siteSettings['home_tours_count']) || 6;
  const homeMatchesCount = Number(siteSettings['home_matches_count']) || 0;
  
  // Dynamic categories from settings (up to 3)
  const categories = useMemo(() => [
    {
      value: siteSettings['home_category_1'] || 'CITY TOUR',
      label: language === 'pt' 
        ? (siteSettings['home_category_1_label'] || siteSettings['city_tours_title'] || t("city_tours"))
        : (siteSettings[`home_category_1_label_${language}`] || siteSettings[`city_tours_title_${language}`] || t("city_tours")),
    },
    {
      value: siteSettings['home_category_2'] || 'TRILHA',
      label: language === 'pt' 
        ? (siteSettings['home_category_2_label'] || siteSettings['hiking_tours_title'] || t("trilhas"))
        : (siteSettings[`home_category_2_label_${language}`] || siteSettings[`hiking_tours_title_${language}`] || t("trilhas")),
    },
    // 3rd category only if configured
    ...(siteSettings['home_category_3'] ? [{
      value: siteSettings['home_category_3'],
      label: language === 'pt' 
        ? (siteSettings['home_category_3_label'] || siteSettings['home_category_3'])
        : (siteSettings[`home_category_3_label_${language}`] || siteSettings['home_category_3_label'] || siteSettings['home_category_3']),
    }] : []),
  ], [siteSettings, language, t]);

  const handleTabChange = (idx: number) => {
    if (idx !== activeTab) {
      setIsAnimating(true);
      setActiveTab(idx);
      setTimeout(() => setIsAnimating(false), 500);
    }
  };

  const gridColsClass = columns === 1 ? "lg:grid-cols-1 max-w-2xl mx-auto" : 
                        columns === 2 ? "lg:grid-cols-2" : 
                        columns === 4 ? "lg:grid-cols-4" : "lg:grid-cols-3";

  const activeCat = categories[activeTab];
  
  const displayTours = useMemo(() => {
    const filteredTours = tours
      .filter(t => (t.category || "").toUpperCase().includes((activeCat?.value || "").toUpperCase()))
      .sort((a, b) => {
        const isMatchDayA = a.title?.includes('Maracanã MatchDay');
        const isMatchDayB = b.title?.includes('Maracanã MatchDay');
        
        if (isMatchDayA && !isMatchDayB) return -1;
        if (!isMatchDayA && isMatchDayB) return 1;
        
        return (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0);
      });

    // Se a categoria for CITY TOUR ou FUTEBOL, e houver configuração de matches na home
    if (homeMatchesCount > 0 && (activeCat?.value === 'CITY TOUR' || activeCat?.value === 'FUTEBOL')) {
      const matchCards = (matches || [])
        .filter(m => m.status === 'available' && getMatchDateInRio(m.match_date) >= new Date())
        .slice(0, homeMatchesCount)
        .map(m => ({
          id: `match-${m.id}`,
          title: `${m.home_team} x ${m.away_team}`,
          title_en: `${m.home_team} vs ${m.away_team}`,
          title_es: `${m.home_team} x ${m.away_team}`,
          short_description: language === 'pt' ? `Experiência completa no Maracanã. Inclui guia, transfer e ingresso oficial.` : language === 'es' ? `Experiencia completa en el Maracanã. Incluye guía, traslado y entrada oficial.` : `Complete Maracanã experience. Includes guide, transfer, and official ticket.`,
          price: m.price,
          duration: "6-7 horas",
          max_group_size: 15,
          image_url: "https://ogzasprtfgimjqrtcseg.supabase.co/storage/v1/render/image/public/site-images/1776136644074_ueljwux2xe.webp?quality=70&width=800&format=avif&resize=cover&v=1777777351048",
          is_featured: true,
          category: 'CITY TOUR',
          category_en: 'CITY TOUR',
          category_es: 'CITY TOUR',
          external_url: `/match/${m.slug || m.id}`,
          included_json: language === 'pt' ? ["Ingresso", "Guia", "Transfer"] : language === 'es' ? ["Entrada", "Guía", "Traslado"] : ["Ticket", "Guide", "Transfer"],
          pricing_model: 'fixed',
          match_date: m.match_date
        }));

      return [...matchCards, ...filteredTours];
    }

    return filteredTours;
  }, [tours, matches, activeCat, homeMatchesCount, language]);

  
  // Title and subtitle
  const toursSectionTitleKey = language === 'pt' ? 'tours_section_title' : `tours_section_title_${language}`;
  const toursSectionSubtitleKey = language === 'pt' ? 'tours_section_subtitle' : `tours_section_subtitle_${language}`;
  const toursTitle = siteSettings[toursSectionTitleKey] || siteSettings['tours_section_title'] || (language === 'pt' ? 'Conheça o Melhor do Rio de Janeiro' : language === 'es' ? 'Descubre lo mejor de Río' : 'Discover the Best of Rio');
  const toursSubtitle = siteSettings[toursSectionSubtitleKey] || siteSettings['tours_section_subtitle'] || (language === 'pt' ? 'City tours completos, passeios de barco em Arraial do Cabo e Angra dos Reis, e experiências inesquecíveis com guias especializados.' : language === 'es' ? 'Tours completos por la ciudad, paseos en barco en Arraial do Cabo y Angra dos Reis, y experiencias increibles con guías especializados.' : 'Complete city tours, boat trips in Arraial do Cabo and Angra dos Reis, and unforgettable experiences with specialized guides.');

  return (
    <section id="tours" className="py-20 lg:py-28 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-foreground mb-3 text-balance">{toursTitle}</h2>
          {toursSubtitle && <p className="text-muted-foreground text-lg max-w-xl mx-auto font-sans">{toursSubtitle}</p>}
        </div>
        
        <div role="tablist" className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((cat, idx) => (
            <Button
              key={cat.value}
              role="tab"
              aria-selected={activeTab === idx}
              aria-controls={`panel-${idx}`}
              id={`tab-${idx}`}
              size="lg"
              variant={activeTab === idx ? 'default' : 'outline'}
              onClick={() => handleTabChange(idx)}
              className={`font-sans px-8 rounded-full ${activeTab !== idx ? 'border-2' : ''}`}
            >
              {cat.label}
            </Button>
          ))}
        </div>
        
        <div 
          id={`panel-${activeTab}`}
          role="tabpanel"
          aria-labelledby={`tab-${activeTab}`}
          className={`transition-all duration-500 ease-in-out ${isAnimating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}
        >
          {isLoading ? (
            <div className={`grid grid-cols-1 md:grid-cols-2 ${gridColsClass} gap-8`}>
              {[1, 2, 3].map((i) => <div key={i} className="h-80 bg-muted rounded-2xl animate-pulse" />)}
            </div>
          ) : displayTours.length > 0 ? (
            <div className={`grid grid-cols-1 md:grid-cols-2 ${gridColsClass} gap-8`}>
              {displayTours.slice(0, count).map((tour) => <TourCard key={`${activeTab}-${tour.id}`} tour={tour as TourCardProps} />)}
            </div>
          ) : (
            <p className="text-center text-muted-foreground">{language === 'pt' ? 'Nenhum passeio disponível' : 'No tours available'}</p>
          )}
        </div>
      </div>
    </section>
  );
}
