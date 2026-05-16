import { useEffect, useRef } from "react";
import { useLocale } from "@/contexts/LocaleContext";
import { useSiteData } from "@/hooks/useSiteData";

export function ReviewsSection() {
  const { t } = useLocale();
  const { socialMedia } = useSiteData();
  const sectionRef = useRef<HTMLElement>(null);

  const tripAdvisorSocial = socialMedia.find(s =>
    s.platform.toLowerCase().includes('tripadvisor') && s.is_active !== false
  );
  const tripAdvisorUrl = tripAdvisorSocial?.url || "https://www.tripadvisor.com.br/";

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    // Load Elfsight only when the section enters the viewport
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          const script = document.createElement("script");
          script.src = "https://elfsightcdn.com/platform.js";
          script.async = true;
          document.body.appendChild(script);
          observer.disconnect();
        }
      },
      { rootMargin: "400px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} id="reviews" className="py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4 text-balance">
            {t("visitantes_dizem")}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto font-sans">
            {t("reviews_desc")}
          </p>
        </div>

        <div className="min-h-[400px] flex items-center justify-center">
          <div 
            className="elfsight-app-a8e8bba0-e42c-47cd-a67d-a76cbb8bbd82" 
            data-elfsight-app-lazy
          />
        </div>

        <div className="text-center mt-10">
          <a
            href={tripAdvisorUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors font-sans"
          >
            {t("ver_todas_tripadvisor")}
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
