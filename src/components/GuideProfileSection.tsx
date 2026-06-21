import React from 'react';
import { useLocale } from '@/contexts/LocaleContext';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { ViewFadeIn } from './ViewFadeIn';

export const GuideProfileSection = () => {
  const { t } = useLocale();

  return (
    <section className="py-12 bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <ViewFadeIn>
          <div className="flex flex-col md:flex-row items-center gap-8 p-8 md:p-12 bg-muted/30 border border-border/50 rounded-3xl relative overflow-hidden group hover:border-accent/20 transition-colors">
            <div className="w-28 h-28 md:w-36 md:h-36 rounded-full overflow-hidden shrink-0 border-4 border-background shadow-xl">
              <img 
                src="/__l5e/assets-v1/ff11c649-d82d-46b6-b474-e88118fed024/marius-guide.jpg" 
                alt="Marius Dobbin" 
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            
            <div className="text-center md:text-left flex-1 flex flex-col items-center md:items-start">
              <span className="inline-block px-3 py-1 mb-4 text-[10px] font-black uppercase tracking-[0.25em] text-accent bg-accent/10 rounded-full">
                {t("ex_guide_eyebrow") || "Your Local Expert"}
              </span>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
                Marius Dobbin
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed mb-6 max-w-2xl mx-auto md:mx-0 font-light">
                {t("ex_guide_desc") || "Born and raised in Rio, I've turned a lifelong passion for my hometown into my life's work. I craft every journey with an obsessive attention to detail, pairing true insider knowledge with impeccable service to ensure you experience Rio authentically, comfortably, and safely."}
              </p>
              <Link to="/your-private-guide-in-rio" className="group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-accent px-8 py-3.5 font-bold text-white transition-all hover:scale-105 hover:shadow-[0_0_40px_8px_rgba(255,107,53,0.3)]">
                <span className="relative z-10 flex items-center gap-2 uppercase tracking-wider text-xs">
                  {t("ex_guide_cta") || "Discover my story"}
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
