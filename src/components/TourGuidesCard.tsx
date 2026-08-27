import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLocale } from "@/contexts/LocaleContext";
import type { Guide } from "@/components/GuidesSection";

export function TourGuidesCard() {
  const { t, language } = useLocale();
  const [guides, setGuides] = useState<Guide[]>([]);

  useEffect(() => {
    supabase
      .from("guides")
      .select("id,name,role,role_en,role_es,photo_url,languages,sort_order,is_active")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .then(({ data }) => setGuides((data as Guide[]) || []));
  }, []);

  if (!guides.length) return null;



  return (
    <div className="p-6 bg-muted/30 border border-border/50 rounded-2xl relative overflow-hidden group">
      <h4 className="font-black text-[10px] uppercase tracking-widest text-accent mb-4">
        {t("ex_guide_eyebrow") || "Your Local Expert"}
      </h4>
      <Link to="/about-us#guides" className="block" aria-label={t("ex_guide_cta") || "Meet our guides"}>
        <div className="flex flex-wrap gap-4 mb-4">
          {guides.map((guide) => (
            <div key={guide.id} className="flex flex-col items-center gap-1.5 w-16 group/guide">
              <div className="w-14 h-14 rounded-full overflow-hidden shrink-0 border-2 border-background shadow-md group-hover/guide:border-accent/40 group-hover/guide:scale-105 transition-all">
                {guide.photo_url ? (
                  <img
                    src={guide.photo_url}
                    alt={guide.name}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-primary/10 flex items-center justify-center font-serif text-lg font-bold text-primary">
                    {guide.name.charAt(0)}
                  </div>
                )}
              </div>
              <p className="text-[11px] font-bold text-foreground leading-tight text-center line-clamp-2">
                {guide.name.split(" ")[0]}
              </p>
            </div>
          ))}
        </div>
        <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-accent hover:gap-3 transition-all">
          {language === "pt" ? "Conheça nossos guias" : language === "es" ? "Conoce a nuestros guías" : "Meet our guides"}
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </span>
      </Link>
    </div>
  );
}
