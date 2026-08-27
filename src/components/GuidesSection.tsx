import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLocale } from "@/contexts/LocaleContext";
import { OptimizedImage } from "./OptimizedImage";

export type Guide = {
  id: string;
  name: string;
  role?: string | null;
  role_en?: string | null;
  role_es?: string | null;
  bio?: string | null;
  bio_en?: string | null;
  bio_es?: string | null;
  photo_url?: string | null;
  languages?: string[] | null;
  sort_order?: number;
  is_active?: boolean;
};

export function GuidesSection() {
  const { language } = useLocale();
  const [guides, setGuides] = useState<Guide[]>([]);

  useEffect(() => {
    supabase
      .from("guides")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .then(({ data }) => setGuides((data as Guide[]) || []));
  }, []);

  if (!guides.length) return null;

  const heading =
    language === "pt" ? "Conheça nossos guias" : language === "es" ? "Conoce a nuestros guías" : "Meet our guides";
  const eyebrow = language === "pt" ? "Nossa equipe" : language === "es" ? "Nuestro equipo" : "Our team";

  const pick = (g: Guide, field: "role" | "bio") => {
    if (language === "en") return g[`${field}_en`] || g[field];
    if (language === "es") return g[`${field}_es`] || g[field];
    return g[field];
  };

  return (
    <section id="guides" className="py-20 lg:py-28 bg-muted/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="text-primary text-xs uppercase tracking-[0.3em] font-semibold mb-4 block font-sans">
            {eyebrow}
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground">{heading}</h2>
          <div className="w-16 h-0.5 bg-primary mx-auto mt-8" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
          {guides.map((guide) => (
            <article key={guide.id} className="flex flex-col">
              <div className="aspect-[3/4] overflow-hidden rounded-2xl bg-muted mb-6">
                {guide.photo_url && (
                  <OptimizedImage
                    src={guide.photo_url}
                    alt={guide.name}
                    containerClassName="w-full h-full"
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <h3 className="font-serif text-2xl text-foreground mb-2">{guide.name}</h3>
              {(pick(guide, "role") || guide.languages?.length) && (
                <p className="text-primary text-xs uppercase tracking-widest font-medium mb-4 font-sans">
                  {[pick(guide, "role"), guide.languages?.join(" • ")].filter(Boolean).join(" | ")}
                </p>
              )}
              <p className="text-muted-foreground text-sm leading-relaxed font-sans whitespace-pre-wrap">
                {pick(guide, "bio")}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
