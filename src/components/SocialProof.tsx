import { Star } from "lucide-react";
import { useSiteData } from "@/hooks/useSiteData";
import { useLocale } from "@/contexts/LocaleContext";

interface SocialProofProps {
  className?: string;
  light?: boolean;
  hideReviewsOnMobile?: boolean;
  compact?: boolean;
}

export const SocialProof = ({ className = "", light = true, hideReviewsOnMobile = false, compact = false }: SocialProofProps) => {
  const { socialMedia } = useSiteData();
  const { language } = useLocale();
  
  const tripAdvisorSocial = socialMedia.find(s => 
    s.platform.toLowerCase().includes('tripadvisor') && s.is_active !== false
  );
  const tripAdvisorUrl = tripAdvisorSocial?.url || "https://www.tripadvisor.com.br/";

  return (
    <a 
      href={tripAdvisorUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-2 rounded-full transition-all hover:scale-105 active:scale-95 ${
        compact ? 'px-2 py-1' : 'px-4 py-1.5'
      } ${
        light 
          ? 'bg-white/10 backdrop-blur-sm text-white border border-white/20 hover:bg-white/20' 
          : 'bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20'
      } ${className}`}
    >
      <Star className={`fill-yellow-400 text-yellow-400 ${compact ? 'w-3 h-3' : 'w-4 h-4'}`} />
      <span className={`font-bold font-sans ${compact ? 'text-[10px]' : 'text-xs sm:text-sm'}`}>
        {hideReviewsOnMobile ? (
          <>
            <span className="sm:hidden">★ 5.0</span>
            <span className="hidden sm:inline">★ 5.0 — 200+ {language === 'pt' ? 'avaliações' : language === 'es' ? 'evaluaciones' : 'reviews'}</span>
          </>
        ) : (
          <>★ 5.0 — 200+ {language === 'pt' ? 'avaliações' : language === 'es' ? 'evaluaciones' : 'reviews'}</>
        )}
      </span>
    </a>
  );
};
