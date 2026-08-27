import React, { useEffect, useState } from 'react';
import { useLocale } from '@/contexts/LocaleContext';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { ViewFadeIn } from './ViewFadeIn';
import { supabase } from '@/integrations/supabase/client';
import type { Guide } from '@/components/GuidesSection';

export const GuideProfileSection = () => {
  const { t, language } = useLocale();
  const [guides, setGuides] = useState<Guide[]>([]);

  useEffect(() => {
    supabase
      .from('guides')
      .select('id,name,role,role_en,role_es,bio,bio_en,bio_es,photo_url,languages,sort_order,is_active')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .then(({ data }) => setGuides((data as Guide[]) || []));
  }, []);

  if (!guides.length) return null;

  const heading =
    language === 'pt' ? 'Conheça nossos guias' : language === 'es' ? 'Conoce a nuestros guías' : 'Meet our guides';

  return (
    <section className="py-12 bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <ViewFadeIn>
          <div className="p-8 md:p-12 bg-muted/30 border border-border/50 rounded-3xl relative overflow-hidden group hover:border-accent/20 transition-colors">
            <div className="text-center mb-8">
              <span className="inline-block px-3 py-1 mb-4 text-[10px] font-black uppercase tracking-[0.25em] text-accent bg-accent/10 rounded-full">
                {t("ex_guide_eyebrow") || "Your Local Expert"}
              </span>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground">
                {heading}
              </h2>
            </div>

            <Link to="/about-us#guides" className="block" aria-label={heading}>
              <div className="flex flex-wrap justify-center gap-6 md:gap-10 mb-8">
                {guides.map((guide) => (
                  <div key={guide.id} className="flex flex-col items-center gap-2 w-24 group/guide">
                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden shrink-0 border-4 border-background shadow-xl group-hover/guide:border-accent/30 group-hover/guide:scale-105 transition-all">
                      {guide.photo_url ? (
                        <img
                          src={guide.photo_url}
                          alt={guide.name}
                          loading="lazy"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-primary/10 flex items-center justify-center font-serif text-2xl font-bold text-primary">
                          {guide.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <p className="font-serif text-sm md:text-base font-bold text-foreground leading-tight text-center">
                      {guide.name.split(' ')[0]}
                    </p>
                  </div>
                ))}
              </div>
            </Link>

            <div className="flex justify-center">
              <Link to="/about-us#guides" className="group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-accent px-8 py-3.5 font-bold text-white transition-all hover:scale-105 hover:shadow-[0_0_40px_8px_rgba(255,107,53,0.3)]">
                <span className="relative z-10 flex items-center gap-2 uppercase tracking-wider text-xs">
                  {heading}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 z-0 h-full w-full bg-gradient-to-r from-accent via-orange-500 to-accent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              </Link>
            </div>
          </div>
        </ViewFadeIn>
      </div>
    </section>
  );
};
