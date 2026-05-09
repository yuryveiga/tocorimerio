import { useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { useSiteData } from "@/hooks/useSiteData";
import { useLocale } from "@/contexts/LocaleContext";

export function FloatingButtons() {
  const { socialMedia } = useSiteData();
  const { language } = useLocale();
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  useEffect(() => {
    if (isAdmin) return;
    
    // Delay non-critical script to improve initial TBT
    const timer = setTimeout(() => {
      const script = document.createElement("script");
      script.src = "https://elfsightcdn.com/platform.js";
      script.async = true;
      document.body.appendChild(script);
    }, 2000);

    return () => clearTimeout(timer);
  }, [isAdmin]);

  const socialLinks = useMemo(() => {
    const tripAdvisor = socialMedia.find(s => 
      s.platform.toLowerCase().includes('tripadvisor') && s.is_active !== false
    );
    
    const instagram = socialMedia.find(s => 
      s.platform.toLowerCase().includes('instagram') && s.is_active !== false
    );
    
    const whatsapp = socialMedia.find(s => 
      s.platform.toLowerCase().includes('whatsapp') || 
      (s.icon_name && s.icon_name.toLowerCase().includes('phone'))
    );

    const youtube = socialMedia.find(s => 
      s.platform.toLowerCase().includes('youtube') && s.is_active !== false
    );

    return { tripAdvisor, instagram, whatsapp, youtube };
  }, [socialMedia]);

  if (isAdmin) return null;

  const { tripAdvisor, instagram, whatsapp, youtube } = socialLinks;

  const handleWhatsApp = () => {
    if (!whatsapp) return;
    const cleanNumber = whatsapp.url.replace(/[^\d+]/g, "");
    const message = encodeURIComponent("Olá, vim pelo site");
    const url = whatsapp.url.startsWith('http') 
      ? `${whatsapp.url}${whatsapp.url.includes('?') ? '&' : '?'}text=${message}`
      : `https://wa.me/${cleanNumber.replace('+', '')}?text=${message}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed right-4 bottom-4 md:right-6 md:bottom-6 z-50 flex flex-col gap-2 md:gap-3 items-end pointer-events-auto">
      {tripAdvisor && (
        <div className="w-14 min-h-[56px] flex items-center justify-center">
          <div 
            className="elfsight-app-4a2f6277-e52c-46f0-95d8-12ba7e619e77" 
            data-elfsight-app-lazy
          />
        </div>
      )}
      
      {whatsapp && (
        <button
          onClick={handleWhatsApp}
          className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-[#25D366] text-white shadow-2xl hover:scale-110 active:scale-95 transition-all flex items-center justify-center group relative"
          aria-label="WhatsApp"
        >
          <svg viewBox="0 0 24 24" className="w-7 h-7 md:w-8 md:h-8" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          <span className="absolute right-full mr-3 bg-background border border-border px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-xl pointer-events-none">
            {language === 'pt' ? 'Dúvidas? Fale conosco' : 'Questions? Chat with us'}
          </span>
        </button>
      )}
    </div>
  );
}