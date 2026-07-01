import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AboutSection } from "@/components/AboutSection";
import { Helmet } from "react-helmet-async";
import { getCanonicalUrl, getHreflangLinks } from "@/utils/seo";
import { useLocale } from "@/contexts/LocaleContext";

const AboutUs = () => {
  const { language } = useLocale();

  const title =
    language === "pt"
      ? "Sobre Nós | Tocorime Rio – Passeios Privativos no Rio de Janeiro"
      : language === "es"
      ? "Sobre Nosotros | Tocorime Rio – Tours Privados en Río de Janeiro"
      : "About Us | Tocorime Rio – Private Tours in Rio de Janeiro";

  const description =
    language === "pt"
      ? "Conheça a Tocorime Rio — guias locais especializados em passeios privativos exclusivos pelo Rio de Janeiro com segurança, autenticidade e atenção aos detalhes."
      : language === "es"
      ? "Conoce a Tocorime Rio — guías locales especializados en tours privados exclusivos por Río de Janeiro con seguridad, autenticidad y atención al detalle."
      : "Meet Tocorime Rio — local guides specialized in exclusive private tours around Rio de Janeiro with safety, authenticity and attention to detail.";

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
      </main>

      <Footer />
    </div>
  );
};

export default AboutUs;
