import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Helmet } from "react-helmet-async";
import { getCanonicalUrl, getHreflangLinks } from "@/utils/seo";
import { useLocale } from "@/contexts/LocaleContext";
import { OPEN_COOKIE_SETTINGS } from "@/components/CookieConsent";

type Lang = "pt" | "en" | "es";
type Section = { h: string; p: string[] };
type Doc = { title: string; description: string; h1: string; updated: string; intro: string; sections: Section[]; settings: string };

const LOVABLE_PRIVACY = "https://lovable.dev/privacy";

const DOCS: Record<Lang, Doc> = {
  pt: {
    title: "Política de Privacidade | Tocorime Rio",
    description: "Como a Tocorime Rio coleta, usa e protege seus dados ao visitar o site e reservar passeios e jogos no Rio de Janeiro.",
    h1: "Política de Privacidade",
    updated: "Última atualização: 25 de novembro de 2026",
    intro: "Esta política explica quais dados a Tocorime Rio (tocorimerio.com) coleta quando você visita o site ou faz uma reserva, para que os usamos e quais escolhas você tem. Dúvidas: tocorimeriotours@gmail.com.",
    sections: [
      { h: "Dados que você nos informa", p: ["Ao reservar um passeio ou jogo, ou ao usar o formulário de contato, coletamos nome, e-mail, WhatsApp, número de pessoas, datas e a mensagem que você escrever. Usamos esses dados para confirmar e organizar a reserva, enviar e-mails de confirmação e falar com você sobre o serviço. Depois de um passeio, podemos pedir uma avaliação por e-mail."] },
      { h: "Pagamentos", p: ["Os pagamentos são feitos pela Stripe. Os dados do cartão são digitados na página da Stripe e não passam pelo nosso site nem ficam conosco. Recebemos apenas a confirmação do pagamento e o valor."] },
      { h: "Contagem de visitas sem cookies", p: [
        "O site usa a análise de visitantes da Lovable, nossa plataforma de hospedagem. Ela não usa cookies, não guarda nada no seu dispositivo, não guarda endereços IP e não identifica visitantes. A Lovable coleta esses dados para nós. A [política de privacidade da Lovable](" + LOVABLE_PRIVACY + ") explica como ela os trata.",
        "Ela registra as páginas visitadas, de onde o visitante veio, país, navegador, sistema operacional, tipo de dispositivo, tempo na página, velocidade de carregamento e erros, além de cliques. Os dados detalhados ficam guardados por 90 dias e os resumos diários por um ano.",
        "Cliques só são registrados depois que você aceita a análise, se você estiver na União Europeia, no Reino Unido, na Suíça ou no Canadá, ou se não for possível saber seu país. Para os demais visitantes, são registrados a menos que você recuse. Nunca são registrados se o seu navegador enviar o sinal Global Privacy Control, mesmo que você aceite. Páginas visitadas, tempo na página, velocidade e erros são registrados para todos, sem cookies e sem identificar ninguém. Sua escolha fica salva no navegador por até 12 meses.",
        "Também temos um contador próprio de visitas: ele guarda a página, de onde você veio, o navegador e um código temporário da visita (apagado quando você fecha a aba). Para saber o país, o endereço IP é consultado no serviço ipapi.co, mas não é guardado.",
      ] },
      { h: "Cookies de análise e anúncios (com sua permissão)", p: [
        "Com a sua permissão de análise, usamos o Google Analytics (Google) para medir o uso do site e o Microsoft Clarity (Microsoft), que grava de forma anônima como as pessoas navegam nas páginas. Com a permissão de anúncios, usamos o Google Ads para saber quais reservas vieram dos nossos anúncios. Essas ferramentas podem usar cookies e enviam dados ao Google ou à Microsoft.",
        "Na Europa, no Reino Unido, na Suíça e no Canadá elas ficam bloqueadas até você aceitar. Você pode mudar sua escolha a qualquer momento em Configurar cookies, no rodapé.",
      ] },
      { h: "Dados guardados no seu navegador", p: ["O site guarda no seu navegador o carrinho de reservas, o idioma escolhido e suas escolhas de cookies. Esses dados ficam só no seu dispositivo."] },
      { h: "Com quem compartilhamos", p: ["Compartilhamos dados apenas com quem nos ajuda a prestar o serviço: Stripe (pagamentos), Resend (envio de e-mails), Lovable (hospedagem e banco de dados), Google e Microsoft (análise e anúncios, com sua permissão) e parceiros que fornecem ingressos para jogos, quando necessário para a sua reserva. Não vendemos seus dados."] },
      { h: "Por quanto tempo guardamos", p: ["Guardamos os dados das reservas pelo tempo necessário para prestar o serviço e cumprir obrigações legais e fiscais."] },
      { h: "Seus direitos", p: ["Você pode pedir acesso, correção ou exclusão dos seus dados, ou retirar uma permissão, escrevendo para tocorimeriotours@gmail.com. Você também pode reclamar à autoridade de proteção de dados do seu país (no Brasil, a ANPD)."] },
    ],
    settings: "Configurar cookies",
  },
  en: {
    title: "Privacy Policy | Tocorime Rio",
    description: "How Tocorime Rio collects, uses and protects your data when you visit the site and book tours and games in Rio de Janeiro.",
    h1: "Privacy Policy",
    updated: "Last updated: November 25, 2026",
    intro: "This policy explains what data Tocorime Rio (tocorimerio.com) collects when you visit the site or make a booking, what we use it for and what choices you have. Questions: tocorimeriotours@gmail.com.",
    sections: [
      { h: "Data you give us", p: ["When you book a tour or game, or use the contact form, we collect your name, email, WhatsApp number, number of people, dates and any message you write. We use this to confirm and organise your booking, send confirmation emails and talk to you about the service. After a tour we may email you to ask for a review."] },
      { h: "Payments", p: ["Payments are handled by Stripe. Card details are entered on Stripe's page; they never pass through our site and we never hold them. We only receive the payment confirmation and amount."] },
      { h: "Visit counting without cookies", p: [
        "The site uses visitor analytics from Lovable, our hosting platform. It uses no cookies, stores nothing on your device, doesn't keep IP addresses and doesn't identify visitors. Lovable collects this data for us. [Lovable's privacy policy](" + LOVABLE_PRIVACY + ") explains how it handles it.",
        "It records the pages visited, where visitors came from, their country, browser, operating system and device type, how long they stay, how fast pages load, and errors, plus clicks. Detailed data is kept for 90 days and daily summaries for a year.",
        "Clicks are recorded only after you accept analytics if you are in the EU/EEA, the UK, Switzerland or Canada, or if your country can't be determined. For everyone else, they are recorded unless you reject. They are never recorded if your browser sends Global Privacy Control, even after you accept. Page visits, time on page, page speed and errors are recorded for every visitor, without cookies and without identifying anyone. Your choice is saved in your browser for up to 12 months.",
        "We also run our own visit counter: it stores the page, where you came from, your browser and a temporary visit code (deleted when you close the tab). To find your country, your IP address is looked up with the ipapi.co service but is not stored.",
      ] },
      { h: "Analytics and advertising cookies (with your permission)", p: [
        "With your analytics permission, we use Google Analytics (Google) to measure site use and Microsoft Clarity (Microsoft), which anonymously records how people move through pages. With your advertising permission, we use Google Ads to learn which bookings came from our ads. These tools may set cookies and send data to Google or Microsoft.",
        "In Europe, the UK, Switzerland and Canada they stay blocked until you accept. You can change your choice at any time under Cookie settings in the footer.",
      ] },
      { h: "Data stored in your browser", p: ["The site stores your booking cart, chosen language and cookie choices in your browser. This data stays on your device."] },
      { h: "Who we share data with", p: ["We share data only with those who help us provide the service: Stripe (payments), Resend (email delivery), Lovable (hosting and database), Google and Microsoft (analytics and ads, with your permission) and partners who supply match tickets, when needed for your booking. We do not sell your data."] },
      { h: "How long we keep it", p: ["We keep booking data for as long as needed to provide the service and meet legal and tax obligations."] },
      { h: "Your rights", p: ["You can ask to access, correct or delete your data, or withdraw a permission, by writing to tocorimeriotours@gmail.com. You can also complain to the data protection authority in your country."] },
    ],
    settings: "Cookie settings",
  },
  es: {
    title: "Política de Privacidad | Tocorime Rio",
    description: "Cómo Tocorime Rio recopila, usa y protege tus datos cuando visitas el sitio y reservas tours y partidos en Río de Janeiro.",
    h1: "Política de Privacidad",
    updated: "Última actualización: 25 de noviembre de 2026",
    intro: "Esta política explica qué datos recopila Tocorime Rio (tocorimerio.com) cuando visitas el sitio o haces una reserva, para qué los usamos y qué opciones tienes. Dudas: tocorimeriotours@gmail.com.",
    sections: [
      { h: "Datos que nos das", p: ["Al reservar un tour o partido, o usar el formulario de contacto, recopilamos nombre, email, WhatsApp, número de personas, fechas y el mensaje que escribas. Los usamos para confirmar y organizar la reserva, enviar emails de confirmación y hablar contigo sobre el servicio. Después de un tour podemos pedirte una reseña por email."] },
      { h: "Pagos", p: ["Los pagos se hacen con Stripe. Los datos de la tarjeta se escriben en la página de Stripe; no pasan por nuestro sitio ni los guardamos. Solo recibimos la confirmación del pago y el importe."] },
      { h: "Conteo de visitas sin cookies", p: [
        "El sitio usa la analítica de visitantes de Lovable, nuestra plataforma de alojamiento. No usa cookies, no guarda nada en tu dispositivo, no guarda direcciones IP y no identifica a los visitantes. Lovable recopila estos datos por nosotros. La [política de privacidad de Lovable](" + LOVABLE_PRIVACY + ") explica cómo los trata.",
        "Registra las páginas visitadas, de dónde vino el visitante, país, navegador, sistema operativo, tipo de dispositivo, tiempo en la página, velocidad de carga y errores, además de clics. Los datos detallados se guardan 90 días y los resúmenes diarios un año.",
        "Los clics solo se registran después de que aceptes la analítica si estás en la UE/EEE, el Reino Unido, Suiza o Canadá, o si no se puede saber tu país. Para los demás, se registran salvo que los rechaces. Nunca se registran si tu navegador envía Global Privacy Control, aunque aceptes. Las páginas visitadas, el tiempo en la página, la velocidad y los errores se registran para todos, sin cookies y sin identificar a nadie. Tu elección se guarda en el navegador hasta 12 meses.",
        "También tenemos un contador propio de visitas: guarda la página, de dónde vienes, tu navegador y un código temporal de la visita (se borra al cerrar la pestaña). Para saber tu país, tu dirección IP se consulta en el servicio ipapi.co, pero no se guarda.",
      ] },
      { h: "Cookies de análisis y publicidad (con tu permiso)", p: [
        "Con tu permiso de análisis, usamos Google Analytics (Google) para medir el uso del sitio y Microsoft Clarity (Microsoft), que registra de forma anónima cómo se navega por las páginas. Con tu permiso de publicidad, usamos Google Ads para saber qué reservas vinieron de nuestros anuncios. Estas herramientas pueden usar cookies y envían datos a Google o Microsoft.",
        "En Europa, el Reino Unido, Suiza y Canadá quedan bloqueadas hasta que aceptes. Puedes cambiar tu elección en cualquier momento en Configurar cookies, en el pie de página.",
      ] },
      { h: "Datos guardados en tu navegador", p: ["El sitio guarda en tu navegador el carrito de reservas, el idioma elegido y tus opciones de cookies. Estos datos quedan solo en tu dispositivo."] },
      { h: "Con quién compartimos", p: ["Compartimos datos solo con quienes nos ayudan a prestar el servicio: Stripe (pagos), Resend (envío de emails), Lovable (alojamiento y base de datos), Google y Microsoft (análisis y anuncios, con tu permiso) y socios que proveen entradas para partidos, cuando es necesario para tu reserva. No vendemos tus datos."] },
      { h: "Cuánto tiempo los guardamos", p: ["Guardamos los datos de las reservas el tiempo necesario para prestar el servicio y cumplir obligaciones legales y fiscales."] },
      { h: "Tus derechos", p: ["Puedes pedir acceso, corrección o eliminación de tus datos, o retirar un permiso, escribiendo a tocorimeriotours@gmail.com. También puedes reclamar ante la autoridad de protección de datos de tu país."] },
    ],
    settings: "Configurar cookies",
  },
};

// Render "[text](url)" links inside a paragraph.
function renderText(text: string) {
  const parts = text.split(/(\[[^\]]+\]\([^)]+\))/g);
  return parts.map((part, i) => {
    const m = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    return m ? <a key={i} href={m[2]} target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-4">{m[1]}</a> : part;
  });
}

const PrivacyPolicy = () => {
  const { language } = useLocale();
  const d = DOCS[(language === "pt" || language === "es" ? language : "en") as Lang];
  const path = "/privacy-policy";

  return (
    <div className="min-h-screen flex flex-col pt-20">
      <Helmet>
        <title>{d.title}</title>
        <meta name="description" content={d.description} />
        <link rel="canonical" href={getCanonicalUrl(path)} />
        {getHreflangLinks(path).map((l) => (
          <link key={l.hreflang} rel="alternate" hrefLang={l.hreflang} href={l.href} />
        ))}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={d.title} />
        <meta property="og:description" content={d.description} />
      </Helmet>
      <Header />
      <main className="flex-1 bg-background">
        <article className="container mx-auto max-w-3xl px-4 py-12 md:py-16">
          <h1 className="font-serif text-3xl font-bold text-foreground md:text-4xl">{d.h1}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{d.updated}</p>
          <p className="mt-6 text-foreground/90 leading-relaxed">{d.intro}</p>
          {d.sections.map((s) => (
            <section key={s.h} className="mt-8">
              <h2 className="font-serif text-xl font-bold text-foreground">{s.h}</h2>
              {s.p.map((p, i) => (
                <p key={i} className="mt-3 text-foreground/90 leading-relaxed">{renderText(p)}</p>
              ))}
            </section>
          ))}
          <button type="button" onClick={() => window.dispatchEvent(new Event(OPEN_COOKIE_SETTINGS))} className="mt-10 text-sm font-semibold text-primary underline underline-offset-4">{d.settings}</button>
        </article>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
