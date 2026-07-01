import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ContactSection } from "@/components/ContactSection";
import { Helmet } from "react-helmet-async";
import { getCanonicalUrl, getHreflangLinks } from "@/utils/seo";
import { useLocale } from "@/contexts/LocaleContext";

const Contact = () => {
  const { language } = useLocale();

  const title =
    language === "pt"
      ? "Contato | Tocorime Rio – Passeios Privativos no Rio de Janeiro"
      : language === "es"
      ? "Contacto | Tocorime Rio – Tours Privados en Río de Janeiro"
      : "Contact | Tocorime Rio – Private Tours in Rio de Janeiro";

  const description =
    language === "pt"
      ? "Entre em contato conosco para reservar seu passeio privativo ou tirar dúvidas. Estamos disponíveis 7 dias por semana via e-mail e WhatsApp 24h."
      : language === "es"
      ? "Contáctanos para reservar tu tour privado o hacer preguntas. Estamos disponibles 7 días a la semana por correo electrónico y WhatsApp 24h."
      : "Get in touch to book your private tour or ask questions. We are available 7 days a week via email and WhatsApp 24h.";

  return (
    <div className="min-h-screen flex flex-col pt-20">
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={getCanonicalUrl("/contact")} />
        {getHreflangLinks("/contact").map((l) => (
          <link key={l.hreflang} rel="alternate" hrefLang={l.hreflang} href={l.href} />
        ))}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={getCanonicalUrl("/contact")} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:site_name" content="Tocorime Rio" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
      </Helmet>

      <Header />

      <main className="flex-1">
        <ContactSection />
      </main>

      <Footer />
    </div>
  );
};

export default Contact;
