import { Star } from "lucide-react";
import { useSiteData } from "@/hooks/useSiteData";
import { useLocale } from "@/contexts/LocaleContext";

interface SocialProofProps {
  className?: string;
  light?: boolean;
}

export const SocialProof = ({ className = "", light = true }: SocialProofProps) => {
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
      className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 transition-all hover:scale-105 active:scale-95 ${
        light 
          ? 'bg-white/10 backdrop-blur-sm text-white border border-white/20 hover:bg-white/20' 
          : 'bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20'
      } ${className}`}
    >
      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
      <span className="text-xs sm:text-sm font-bold font-sans">
        ★ 5.0 — 200+ {language === 'pt' ? 'avaliações' : language === 'es' ? 'evaluaciones' : 'reviews'}
      </span>
    </a>
  );
};
