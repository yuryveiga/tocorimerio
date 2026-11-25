import { Link } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import { useSiteData } from "@/hooks/useSiteData";
import { useLocale } from "@/contexts/LocaleContext";
import { slugify } from "@/utils/slugify";
import { tl } from "@/lib/tl";
import { VendasLayout } from "./VendasLayout";
import { VENDAS_CATEGORIES, VENDAS_SITE_URL, VENDAS_WHATSAPP } from "./config";

export default function VendasHome() {
  const { tours } = useSiteData();
  const { siteLanguage } = useLocale();
  const lang = siteLanguage as keyof (typeof VENDAS_CATEGORIES)[0]["name"];

  const imageFor = (categoria: string, fallback: string, photoFrom?: string) => {
    if (fallback) return fallback;
    const pick = photoFrom && (tours || []).find((t: any) => (t.slug || "").includes(photoFrom) && t.image_url);
    if (pick) return (pick as any).image_url;
    const list = (tours || []).filter((t) => slugify(t.category || "") === categoria)
      .sort((a: any, b: any) => (a.is_featured === b.is_featured ? (a.sort_order ?? 0) - (b.sort_order ?? 0) : a.is_featured ? -1 : 1));
    return (list[0] as any)?.image_url || "";
  };

  const footer = (
    <div className="sticky bottom-0 space-y-2 border-t border-border bg-background p-4">
      <a href={`https://wa.me/${VENDAS_WHATSAPP}`} target="_blank" rel="noopener noreferrer"
        className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-primary font-semibold text-primary-foreground shadow-md transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
        <MessageCircle className="h-5 w-5" />
        {tl(siteLanguage, { pt: "Falar no WhatsApp", en: "Chat on WhatsApp", es: "Hablar por WhatsApp", de: "Auf WhatsApp schreiben", fr: "Écrire sur WhatsApp", it: "Scrivi su WhatsApp" })}
      </a>
      <a href={VENDAS_SITE_URL} className="block py-2 text-center text-sm font-medium text-muted-foreground underline-offset-4 hover:underline">
        {tl(siteLanguage, { pt: "Ver site completo", en: "View full website", es: "Ver sitio completo", de: "Ganze Website ansehen", fr: "Voir le site complet", it: "Vedi il sito completo" })}
      </a>
    </div>
  );

  return (
    <VendasLayout footer={footer}>
      <div className="px-4 pb-6 pt-6">
        <h1 className="font-serif text-3xl font-bold text-foreground">
          {tl(siteLanguage, { pt: "Escolha seu passeio", en: "Choose your tour", es: "Elige tu paseo", de: "Wähle deine Tour", fr: "Choisissez votre visite", it: "Scegli il tuo tour" })}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {tl(siteLanguage, { pt: "Guias bilíngues, passeios privados e reserva segura.", en: "Bilingual guides, private tours and secure booking.", es: "Guías bilingües, paseos privados y reserva segura.", de: "Zweisprachige Guides, private Touren, sichere Buchung.", fr: "Guides bilingues, visites privées et réservation sécurisée.", it: "Guide bilingui, tour privati e prenotazione sicura." })}
        </p>
        <div className="mt-6 space-y-4">
          {VENDAS_CATEGORIES.map((c, i) => {
            const img = imageFor(c.categoria, c.image, c.photoFrom);
            return (
              <Link key={c.slug} to={`/vendas/${c.slug}`}
                className="group relative block h-[200px] overflow-hidden rounded-2xl bg-muted shadow-md transition active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                {img && <img src={img} alt={c.name[lang] || c.name.pt} loading={i === 0 ? "eager" : "lazy"} decoding="async"
                  className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105" />}
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/85 via-foreground/30 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4 text-background">
                  <h2 className="font-serif text-2xl font-bold uppercase tracking-wide">{c.name[lang] || c.name.pt}</h2>
                  <p className="text-sm opacity-90">{c.description[lang] || c.description.pt}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </VendasLayout>
  );
}
