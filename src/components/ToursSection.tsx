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
import { cleanMatchSlug } from "@/utils/seo";

import { TourItem, TourCardProps } from "./TourItem";




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
              {displayTours.slice(0, count).map((tour) => (
                <div key={`${activeTab}-${tour.id}`} data-tour-card>
                  <TourItem tour={tour as TourCardProps} />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground">{language === 'pt' ? 'Nenhum passeio disponível' : 'No tours available'}</p>
          )}
        </div>
      </div>
    </section>
  );
}
