import { tl } from "@/lib/tl";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ContactSection } from "@/components/ContactSection";
import { Helmet } from "react-helmet-async";
import { getCanonicalUrl, getHreflangLinks } from "@/utils/seo";
import { useLocale } from "@/contexts/LocaleContext";

const Contact = () => {
  const { language } = useLocale();

  const title =tl(language, { pt: "Contato | Tocorime Rio – Passeios Privativos no Rio de Janeiro", es: "Contacto | Tocorime Rio – Tours Privados en Río de Janeiro", en: "Contact | Tocorime Rio – Private Tours in Rio de Janeiro", de: "Kontakt | Tocorime Rio – Private Touren in Rio de Janeiro", fr: "Contact | Tocorime Rio – Visites privées à Rio de Janeiro", it: "Contatti | Tocorime Rio – Tour Privati a Rio de Janeiro" });

  const description =tl(language, { pt: "Entre em contato conosco para reservar seu passeio privativo ou tirar dúvidas. Estamos disponíveis 7 dias por semana via e-mail e WhatsApp 24h.", es: "Contáctanos para reservar tu tour privado o hacer preguntas. Estamos disponibles 7 días a la semana por correo electrónico y WhatsApp 24h.", en: "Get in touch to book your private tour or ask questions. We are available 7 days a week via email and WhatsApp 24h.", de: "Kontaktieren Sie uns, um Ihre private Tour zu buchen oder Fragen zu stellen. Wir sind an 7 Tagen in der Woche per E-Mail und WhatsApp rund um die Uhr erreichbar.", fr: "Contactez-nous pour réserver votre visite privée ou poser vos questions. Nous sommes disponibles 7j/7 par e-mail et 24h/24 sur WhatsApp.", it: "Contattaci per prenotare il tuo tour privato o per qualsiasi domanda. Siamo disponibili 7 giorni su 7 via e-mail e WhatsApp 24 ore su 24." });

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
