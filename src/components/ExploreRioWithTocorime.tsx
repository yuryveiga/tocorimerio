import { Link } from "react-router-dom";
import Clock from "lucide-react/dist/esm/icons/clock";
import Star from "lucide-react/dist/esm/icons/star";
import ArrowRight from "lucide-react/dist/esm/icons/arrow-right";
import Compass from "lucide-react/dist/esm/icons/compass";
import { Button } from "@/components/ui/button";
import { OptimizedImage } from "@/components/OptimizedImage";
import { useLocale } from "@/contexts/LocaleContext";
import { useSiteData } from "@/hooks/useSiteData";
import { getTourMinPrice } from "@/utils/pricing";
import type { TourCardProps } from "@/components/TourItem";
import type { BlogTourTarget } from "@/lib/blogTourMapping";

const COPY = {
  pt: {
    eyebrow: "Explore o Rio com a Tocorime",
    heading: (name: string) => `Quer conhecer ${name} com um guia local?`,
    desc: "Guia bilíngue local, roteiro planejado com cuidado e transporte privativo incluído.",
    from: "A partir de",
    perPerson: "por pessoa",
  },
  en: {
    eyebrow: "Explore Rio with Tocorime",
    heading: (name: string) => `Want to experience ${name} with a local guide?`,
    desc: "A bilingual local guide, a carefully planned route and private transportation.",
    from: "From",
    perPerson: "per person",
  },
  es: {
    eyebrow: "Explora Río con Tocorime",
    heading: (name: string) => `¿Quieres conocer ${name} con un guía local?`,
    desc: "Guía local bilingüe, ruta planificada con cuidado y transporte privado.",
    from: "Desde",
    perPerson: "por persona",
  },
};

const getCopy = (language: string) => COPY[language as keyof typeof COPY] || COPY.en;

const localizedTitle = (tour: TourCardProps, language: string) => {
  if (language === "pt") return tour.title;
  const translated = (tour as unknown as Record<string, string | undefined>)[`title_${language}`];
  return translated || tour.title_en || tour.title;
};

type Props = {
  target: BlogTourTarget;
  tours: TourCardProps[];
  className?: string;
};

/**
 * Reusable contextual funnel block ("Explore Rio with Tocorime").
 * Shows image, tour name, duration, starting price, rating and a
 * "Check Availability" CTA with a descriptive anchor.
 */
export const ExploreRioWithTocorime = ({ target, tours, className = "" }: Props) => {
  const { t, language, formatPrice } = useLocale();
  const { siteSettings } = useSiteData();
  const hidePrices = siteSettings?.["hide_prices"] === "true";
  const copy = getCopy(language);

  const tour = target.type === "tour" ? tours.find((item) => item.slug === target.slug) : undefined;

  // A tour target whose tour is currently unavailable should not render a dead link.
  if (target.type === "tour" && !tour) return null;

  const name = tour
    ? localizedTitle(tour, language)
    : target.type === "page"
      ? target.label[language] || target.label.en
      : "";
  const href = tour ? `/passeio/${tour.slug}` : target.type === "page" ? target.path : "/#tours";
  const minPrice = tour ? getTourMinPrice(tour) : 0;

  return (
    <aside
      className={`my-10 rounded-2xl border border-primary/20 bg-primary/5 overflow-hidden ${className}`}
      aria-label={copy.eyebrow}
    >
      <div className="flex flex-col sm:flex-row">
        {tour?.image_url && (
          <Link to={href} className="sm:w-56 shrink-0" aria-label={name}>
            <OptimizedImage
              src={tour.image_url}
              alt={name}
              width={480}
              containerClassName="w-full h-40 sm:h-full"
              fit="cover"
              className="w-full h-full"
              loading="lazy"
            />
          </Link>
        )}

        <div className="flex-1 p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-2">
            <Compass className="w-4 h-4 text-accent" />
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-accent">
              {copy.eyebrow}
            </span>
          </div>

          <h3 className="font-serif text-xl sm:text-2xl font-bold leading-tight mb-2 text-foreground">
            {copy.heading(name)}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">{copy.desc}</p>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-4 text-xs font-semibold text-muted-foreground">
            {tour?.duration && (
              <span className="inline-flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> {tour.duration}
              </span>
            )}
            <span className="inline-flex items-center gap-1 text-foreground">
              <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" /> 5.0
            </span>
            {tour && !hidePrices && minPrice > 0 && (
              <span className="text-foreground">
                {copy.from} <strong>{formatPrice(minPrice)}</strong> {copy.perPerson}
              </span>
            )}
          </div>

          <Link to={href} className="inline-block">
            <Button className="rounded-full h-11 px-6 font-bold text-xs uppercase tracking-wider gap-2">
              {t("check_availability")}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>

          <div className="mt-3">
            <Link to={href} className="text-xs font-bold text-accent hover:underline">
              {name}
            </Link>
          </div>
        </div>
      </div>
    </aside>
  );
};
