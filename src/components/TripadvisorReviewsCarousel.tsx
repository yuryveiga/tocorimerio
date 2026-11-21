import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ExternalLink, Star } from "lucide-react";
import { useLocale } from "@/contexts/LocaleContext";
import { fetchLovable } from "@/integrations/lovable/client";
import { Button } from "@/components/ui/button";
import { type CarouselApi, Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { TRIPADVISOR_URL, type TripadvisorReview } from "../../supabase/functions/_shared/tripadvisorReviews";
import { REVIEWS_AUTOPLAY_INTERVAL_MS, shouldAutoplayReviews } from "@/lib/carouselAutoplay";

interface ReviewSnapshot { reviews: TripadvisorReview[]; synced_at: string }

function ReviewAvatar({ review }: { review: TripadvisorReview }) {
  const [failed, setFailed] = useState(false);
  const fallback = (
    <div aria-hidden="true" className="h-11 w-11 shrink-0 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold">{review.author.slice(0, 1).toUpperCase()}</div>
  );
  if (!review.avatar_url || failed) return fallback;
  return <img src={review.avatar_url} alt="" aria-hidden="true" width="44" height="44" loading="lazy" referrerPolicy="no-referrer" onError={() => setFailed(true)} className="h-11 w-11 shrink-0 rounded-full object-cover" />;
}

export function TripadvisorReviewsCarousel() {
  const { t, language } = useLocale();
  const { data, isPending } = useQuery({
    queryKey: ["tripadvisor-review-snapshot"],
    queryFn: () => fetchLovable<ReviewSnapshot>("tripadvisor_review_snapshot", "reviews,synced_at"),
    staleTime: 60 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
  const reviews = data?.[0]?.reviews ?? [];
  const [api, setApi] = useState<CarouselApi>();
  const [paused, setPaused] = useState(false);
  const autoplayOn = shouldAutoplayReviews(reviews.length);
  useEffect(() => {
    if (!api || !autoplayOn || paused) return;
    const timer = window.setInterval(() => {
      if (document.hidden) return;
      if (api.canScrollNext()) api.scrollNext(); else api.scrollTo(0);
    }, REVIEWS_AUTOPLAY_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [api, autoplayOn, paused]);
  const copy = language === "pt"
    ? { read: "Ler avaliação", next: "Próximas avaliações", previous: "Avaliações anteriores", source: "Avaliações no Tripadvisor", empty: "Veja as avaliações de nossos visitantes no Tripadvisor." }
    : language === "es"
    ? { read: "Leer opinión", next: "Opiniones siguientes", previous: "Opiniones anteriores", source: "Opiniones en Tripadvisor", empty: "Consulta las opiniones de nuestros visitantes en Tripadvisor." }
    : { read: "Read review", next: "Next reviews", previous: "Previous reviews", source: "Tripadvisor reviews", empty: "Read our visitors’ reviews on Tripadvisor." };

  return (
    <section id="reviews" className="py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <img src="/logos/tripadvisor.webp" alt="Tripadvisor" width="140" height="42" loading="lazy" className="h-10 w-36 object-contain mx-auto mb-5" />
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4 text-balance">{t("visitantes_dizem")}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto font-sans">{t("reviews_desc")}</p>
        </div>

        {reviews.length > 0 ? (
          <Carousel opts={{ align: "start", loop: reviews.length > 4 }} setApi={setApi} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} aria-label={copy.source} className="w-full">
            <CarouselContent>
              {reviews.map((review) => (
                <CarouselItem key={review.id} className="md:basis-1/2 lg:basis-1/4">
                  <article className="h-[370px] rounded-lg border border-border bg-card text-card-foreground p-6 flex flex-col">
                    <div className="flex items-center gap-3 mb-5">
                      <ReviewAvatar review={review} />
                      <div className="min-w-0">
                        <p className="font-semibold truncate">{review.author}</p>
                        <p className="text-xs text-muted-foreground truncate" lang="pt-BR">{review.date_label}</p>
                      </div>
                    </div>
                    <div className="flex gap-1 text-primary mb-3" aria-label={`${review.rating}/5`}>
                      {Array.from({ length: 5 }, (_, index) => <Star key={index} aria-hidden="true" className={`h-4 w-4 ${index < review.rating ? "fill-current" : "text-muted-foreground/30"}`} />)}
                    </div>
                    <h3 className="font-semibold line-clamp-2 mb-2" lang="pt-BR">{review.title}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground line-clamp-5 whitespace-pre-line" lang="pt-BR">{review.text}</p>
                    <div className="mt-auto pt-4 flex items-center justify-between gap-2">
                      <span className="text-xs text-muted-foreground">Tripadvisor</span>
                      <Button variant="link" asChild className="h-auto p-0 text-xs"><a href={review.url} target="_blank" rel="noopener noreferrer">{copy.read}<ExternalLink className="h-3 w-3 ml-1" /></a></Button>
                    </div>
                  </article>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="flex justify-center gap-3 mt-6">
              <CarouselPrevious aria-label={copy.previous} title={copy.previous} className="static translate-x-0 translate-y-0 h-10 w-10" />
              <CarouselNext aria-label={copy.next} title={copy.next} className="static translate-x-0 translate-y-0 h-10 w-10" />
            </div>
          </Carousel>
        ) : isPending ? (
          <div aria-busy="true" className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 h-[370px] overflow-hidden">
            {[0, 1, 2, 3].map(i => <div key={i} className="rounded-lg bg-muted animate-pulse motion-reduce:animate-none h-full" />)}
          </div>
        ) : <p className="text-center text-muted-foreground">{copy.empty}</p>}

        <div className="text-center mt-8">
          <Button variant="link" asChild><a href={TRIPADVISOR_URL} target="_blank" rel="noopener noreferrer">{t("ver_todas_tripadvisor")}<ExternalLink className="h-4 w-4 ml-2" /></a></Button>
        </div>
      </div>
    </section>
  );
}