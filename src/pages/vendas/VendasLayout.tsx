import { ReactNode } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { useLocale } from "@/contexts/LocaleContext";

const LANGS = ["pt", "en", "es", "de", "fr", "it"] as const;

export function VendasLayout({ children, footer }: { children: ReactNode; footer?: ReactNode }) {
  const { siteLanguage, setLanguage } = useLocale();
  return (
    <div className="min-h-screen bg-muted/40">
      <Helmet>
        <title>Passeios no Rio de Janeiro | Tocorime Rio</title>
        <meta name="description" content="Escolha seu passeio privado no Rio de Janeiro: city tour, trilhas e passeios de um dia com guias bilíngues." />
        <meta name="robots" content="noindex, follow" />
      </Helmet>
      <div className="mx-auto flex min-h-screen max-w-[480px] flex-col bg-background shadow-sm">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur">
          <Link to="/vendas" className="font-serif text-lg font-bold text-primary">Tocorime Rio</Link>
          <label className="sr-only" htmlFor="vendas-lang">Idioma</label>
          <select id="vendas-lang" value={siteLanguage} onChange={(e) => setLanguage(e.target.value as any)}
            className="h-10 rounded-lg border border-input bg-background px-2 text-sm font-semibold uppercase focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            {LANGS.map((l) => <option key={l} value={l}>{l.toUpperCase()}</option>)}
          </select>
        </header>
        <main className="flex-1">{children}</main>
        {footer}
      </div>
    </div>
  );
}
