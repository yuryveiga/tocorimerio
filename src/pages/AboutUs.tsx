import { tl } from "@/lib/tl";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AboutSection } from "@/components/AboutSection";
import { GuidesSection } from "@/components/GuidesSection";
import { Helmet } from "react-helmet-async";
import { getCanonicalUrl, getHreflangLinks } from "@/utils/seo";
import { useLocale } from "@/contexts/LocaleContext";

const AboutUs = () => {
  const { language } = useLocale();

  const title =tl(language, { pt: "Sobre Nós | Tocorime Rio – Passeios Privativos no Rio de Janeiro", es: "Sobre Nosotros | Tocorime Rio – Tours Privados en Río de Janeiro", en: "About Us | Tocorime Rio – Private Tours in Rio de Janeiro", de: "Über uns | Tocorime Rio – Private Touren in Rio de Janeiro", fr: "À propos de nous | Tocorime Rio – Visites privées à Rio de Janeiro", it: "Chi Siamo | Tocorime Rio – Tour Privati a Rio de Janeiro" });

  const description =tl(language, { pt: "Conheça a Tocorime Rio — guias locais especializados em passeios privativos exclusivos pelo Rio de Janeiro com segurança, autenticidade e atenção aos detalhes.", es: "Conoce a Tocorime Rio — guías locales especializados en tours privados exclusivos por Río de Janeiro con seguridad, autenticidad y atención al detalle.", en: "Meet Tocorime Rio — local guides specialized in exclusive private tours around Rio de Janeiro with safety, authenticity and attention to detail.", de: "Lernen Sie Tocorime Rio kennen – lokale Guides, die auf exklusive private Touren in Rio de Janeiro mit Sicherheit, Authentizität und Liebe zum Detail spezialisiert sind.", fr: "Faites connaissance avec Tocorime Rio — des guides locaux spécialisés dans les visites privées exclusives à Rio de Janeiro, alliant sécurité, authenticité et souci du détail.", it: "Scopri Tocorime Rio — guide locali specializzate in tour privati esclusivi a Rio de Janeiro all'insegna di sicurezza, autenticità e cura dei dettagli." });

  return (
    <div className="min-h-screen flex flex-col pt-20">
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={getCanonicalUrl("/about-us")} />
        {getHreflangLinks("/about-us").map((l) => (
          <link key={l.hreflang} rel="alternate" hrefLang={l.hreflang} href={l.href} />
        ))}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={getCanonicalUrl("/about-us")} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:site_name" content="Tocorime Rio" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
      </Helmet>

      <Header />

      <main className="flex-1">
        <AboutSection />
        <GuidesSection />
      </main>

      <Footer />
    </div>
  );
};

export default AboutUs;
