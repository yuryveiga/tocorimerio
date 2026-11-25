import { tl } from "@/lib/tl";
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
    { icon: Star, label: tl(language, { pt: "5.0 no TripAdvisor", es: "5.0 en TripAdvisor", en: "5.0 on TripAdvisor", de: "5.0 auf TripAdvisor", fr: "5.0 sur TripAdvisor", it: "5.0 su TripAdvisor" })},
    { icon: Users, label: tl(language, { pt: "+2.000 viajantes felizes", es: "+2.000 viajeros felices", en: "+2,000 happy travelers", de: "+2.000 zufriedene Reisende", fr: "+2 000 voyageurs satisfaits", it: "+2.000 viaggiatori soddisfatti" })},
    { icon: BadgeCheck, label: tl(language, { pt: "Cadastur certificado", es: "Cadastur certificado", en: "Cadastur certified", de: "Cadastur-zertifiziert", fr: "Certifié Cadastur", it: "Certificato Cadastur" })},
    { icon: Award, label: tl(language, { pt: "Guias bilíngues locais", es: "Guías bilingües locales", en: "Local bilingual guides", de: "Lokale zweisprachige Guides", fr: "Guides locaux bilingues", it: "Guide locali bilingui" })},
    { icon: ShieldCheck, label: tl(language, { pt: "Transfer privativo incluso", es: "Traslado privado incluido", en: "Private transfer included", de: "Privater Transfer inbegriffen", fr: "Transfert privé inclus", it: "Transfer privato incluso" })},
    { icon: Lock, label: tl(language, { pt: "Pagamento 100% seguro", es: "Pago 100% seguro", en: "100% secure payment", de: "100 % sichere Zahlung", fr: "Paiement 100 % sécurisé", it: "Pagamento sicuro al 100%" })},
    { icon: MapPin, label: tl(language, { pt: "Roteiros sob medida", es: "Itinerarios a la medida", en: "Tailor-made itineraries", de: "Maßgeschneiderte Reiserouten", fr: "Itinéraires sur mesure", it: "Itinerari su misura" })},
    { icon: Clock, label: tl(language, { pt: "Atendimento 24/7", es: "Atención 24/7", en: "24/7 support", de: "24/7-Support", fr: "Assistance 24/7", it: "Assistenza 24/7" })},
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