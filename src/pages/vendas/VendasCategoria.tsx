import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { useSiteData } from "@/hooks/useSiteData";
import { useLocale } from "@/contexts/LocaleContext";
import { slugify } from "@/utils/slugify";
import { tl } from "@/lib/tl";
import { TourItem, TourCardProps } from "@/components/TourItem";
import { VendasLayout } from "./VendasLayout";
import { VENDAS_CATEGORIES, VENDAS_SITE_URL } from "./config";

export default function VendasCategoria() {
  const { slug } = useParams<{ slug: string }>();
  const cat = VENDAS_CATEGORIES.find((c) => c.slug === slug);
  const { tours, isLoading } = useSiteData();
  const { siteLanguage } = useLocale();
  if (!cat) return <Navigate to="/vendas" replace />;
  const lang = siteLanguage as keyof typeof cat.name;

  const list = (tours || []).filter((t) => slugify(t.category || "") === cat.categoria)
    .sort((a: any, b: any) => (a.is_featured === b.is_featured ? (a.sort_order ?? 0) - (b.sort_order ?? 0) : a.is_featured ? -1 : 1));

  return (
    <VendasLayout>
      <div className="sticky top-14 z-20 flex h-12 items-center gap-2 border-b border-border bg-background px-2">
        <Link to="/vendas" className="inline-flex h-11 items-center gap-1 rounded-lg px-2 text-sm font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <ArrowLeft className="h-4 w-4" /> {tl(siteLanguage, { pt: "Voltar", en: "Back", es: "Volver", de: "Zurück", fr: "Retour", it: "Indietro" })}
        </Link>
        <h1 className="flex-1 truncate font-serif text-lg font-bold">{cat.name[lang] || cat.name.pt}</h1>
      </div>
      <div className="px-4 pb-8 pt-2">
        <a href={`${VENDAS_SITE_URL}${cat.sitePath}`} className="inline-flex items-center gap-1 py-2 text-xs text-muted-foreground underline-offset-4 hover:underline">
          {tl(siteLanguage, { pt: "Abrir no site", en: "Open on website", es: "Abrir en el sitio", de: "Auf der Website öffnen", fr: "Ouvrir sur le site", it: "Apri sul sito" })} <ExternalLink className="h-3 w-3" />
        </a>
        <div className="mt-2 space-y-6">
          {isLoading
            ? [1, 2].map((i) => <div key={i} className="h-96 animate-pulse rounded-2xl bg-muted" />)
            : list.map((tour) => <div key={tour.id}><TourItem tour={tour as unknown as TourCardProps} /></div>)}
        </div>
      </div>
    </VendasLayout>
  );
}
