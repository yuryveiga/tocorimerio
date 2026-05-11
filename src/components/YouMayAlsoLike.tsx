import { useMemo, useRef } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSiteData } from "@/hooks/useSiteData";
import { useLocale } from "@/contexts/LocaleContext";
import { TourItem, TourCardProps } from "./TourItem";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const YouMayAlsoLike = ({ excludeId }: { excludeId?: string }) => {
  const { tours } = useSiteData();
  const { language } = useLocale();
  const [emblaRef, emblaApi] = useEmblaCarousel({ align: "start", loop: true, slidesToScroll: 1 });
  const seedRef = useRef(Math.random());

  const items = useMemo(() => {
    void seedRef.current;
    return shuffle((tours || []).filter((t: any) => t.id !== excludeId));
  }, [tours, excludeId]);

  if (!items.length) return null;

  const title = language === "pt" ? "Você também pode gostar" : language === "es" ? "También te puede gustar" : "You may also like";

  return (
    <section className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8 gap-4">
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">{title}</h2>
          <div className="flex gap-2 shrink-0">
            <Button variant="outline" size="icon" className="rounded-full" onClick={() => emblaApi?.scrollPrev()} aria-label="Previous">
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button variant="outline" size="icon" className="rounded-full" onClick={() => emblaApi?.scrollNext()} aria-label="Next">
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex -ml-6">
            {items.map((tour) => (
              <div
                key={tour.id}
                data-tour-card
                className="pl-6 shrink-0 grow-0 basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4"
              >
                <TourItem tour={tour as unknown as TourCardProps} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default YouMayAlsoLike;