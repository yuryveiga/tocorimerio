import Star from "lucide-react/dist/esm/icons/star";
import ShieldCheck from "lucide-react/dist/esm/icons/shield-check";
import Award from "lucide-react/dist/esm/icons/award";
import Lock from "lucide-react/dist/esm/icons/lock";
import BadgeCheck from "lucide-react/dist/esm/icons/badge-check";
import Users from "lucide-react/dist/esm/icons/users";
import MapPin from "lucide-react/dist/esm/icons/map-pin";
import Clock from "lucide-react/dist/esm/icons/clock";
import { useLocale } from "@/contexts/LocaleContext";

/**
 * Infinite, seamless marquee of trust signals.
 * Surgical placement: thin band directly under the hero. Pauses on hover.
 */
export function TrustMarquee() {
  const { language } = useLocale();

  const items = [
    { icon: Star, label: language === "pt" ? "5.0 no TripAdvisor" : language === "es" ? "5.0 en TripAdvisor" : "5.0 on TripAdvisor" },
    { icon: Users, label: language === "pt" ? "+2.000 viajantes felizes" : language === "es" ? "+2.000 viajeros felices" : "+2,000 happy travelers" },
    { icon: BadgeCheck, label: language === "pt" ? "Cadastur certificado" : language === "es" ? "Cadastur certificado" : "Cadastur certified" },
    { icon: Award, label: language === "pt" ? "Guias bilíngues locais" : language === "es" ? "Guías bilingües locales" : "Local bilingual guides" },
    { icon: ShieldCheck, label: language === "pt" ? "Transfer privativo incluso" : language === "es" ? "Traslado privado incluido" : "Private transfer included" },
    { icon: Lock, label: language === "pt" ? "Pagamento 100% seguro" : language === "es" ? "Pago 100% seguro" : "100% secure payment" },
    { icon: MapPin, label: language === "pt" ? "Roteiros sob medida" : language === "es" ? "Itinerarios a la medida" : "Tailor-made itineraries" },
    { icon: Clock, label: language === "pt" ? "Atendimento 24/7" : language === "es" ? "Atención 24/7" : "24/7 support" },
  ];

  // Duplicate the list so the -50% translation loops seamlessly.
  const loop = [...items, ...items];

  return (
    <section
      aria-label="Trust badges"
      className="relative bg-background border-y border-border/60 py-3 overflow-hidden"
    >
      {/* Fade edges */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-background to-transparent z-10" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-background to-transparent z-10" />

      <div className="trust-marquee-track">
        {loop.map((item, i) => {
          const Icon = item.icon;
          return (
            <div
              key={i}
              className="flex items-center gap-2 px-6 text-sm font-medium text-muted-foreground whitespace-nowrap"
            >
              <Icon className="w-4 h-4 text-accent shrink-0" />
              <span>{item.label}</span>
              <span className="ml-6 text-border" aria-hidden="true">•</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}