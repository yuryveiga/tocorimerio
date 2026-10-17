import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowRight, Calendar, Check, Clock, MapPin, Ticket } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useMatches, type Match } from "@/hooks/useMatches";
import { useLocale } from "@/contexts/LocaleContext";
import { getMatchDateInRio, getMatchHour } from "@/lib/dateUtils";
import { format } from "date-fns";
import { ptBR, enUS, es } from "date-fns/locale";
import { generateBreadcrumbsSchema, generateFAQSchema, getCanonicalUrl } from "@/utils/seo";
import { vascoBocaCopy, buildVascoBocaEvent, VASCO_BOCA_SLUG, VASCO_BOCA_CANONICAL, VASCO_BOCA_BUY_URL } from "@/lib/vascoBocaLanding";

type MatchServices = Match & { includes_ticket?: boolean; includes_transfer?: boolean; includes_guide?: boolean };

export default function VascoBocaMaracana() {
  const { language, formatPrice } = useLocale();
  const lang = language === "pt" || language === "es" ? language : "en";
  const copy = vascoBocaCopy[lang];
  const { data: matches, isLoading } = useMatches();
  const match: MatchServices | undefined = matches?.find(m => m.slug === VASCO_BOCA_SLUG);
  const stadium = match?.stadium || match?.venue;
  const date = match ? format(getMatchDateInRio(match.match_date), lang === "en" ? "MMMM d, yyyy" : "dd/MM/yyyy", { locale: lang === "pt" ? ptBR : lang === "es" ? es : enUS }) : "";
  const hour = match ? getMatchHour(match.match_date) : "";
  const price = match?.min_price ?? match?.price;
  const included = match?.included_json?.map(item => item.text).filter(Boolean) || [];
  if (!included.length && match) {
    if (match.includes_ticket) included.push(copy.ticket);
    if (match.includes_transfer) included.push(copy.transfer);
    if (match.includes_guide) included.push(copy.guide);
  }
  const faqs = [
    { q: copy.faqBuy, a: copy.faqBuyAnswer },
    ...(match ? [{ q: copy.faqWhen, a: `${date} • ${hour} (Rio de Janeiro). ${stadium}. ${match.competition || ""}` }] : []),
    { q: copy.faqServices, a: copy.faqServicesAnswer },
  ];
  const breadcrumbs = generateBreadcrumbsSchema([
    { name: copy.home, url: getCanonicalUrl("/") },
    { name: copy.calendar, url: getCanonicalUrl("/maracana-calendario") },
    { name: "Vasco x Boca Juniors", url: VASCO_BOCA_CANONICAL },
  ]);
  const buyButton = <Button asChild size="lg" className="h-auto min-h-12 whitespace-normal text-center"><a href={VASCO_BOCA_BUY_URL}>{copy.buy}<ArrowRight className="ml-2 h-5 w-5 shrink-0" /></a></Button>;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Helmet>
        <title>{copy.title}</title>
        <meta name="description" content={copy.description} />
        <meta name="robots" content="index,follow,max-image-preview:large" />
        <link rel="canonical" href={VASCO_BOCA_CANONICAL} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={VASCO_BOCA_CANONICAL} />
        <meta property="og:title" content={copy.title} />
        <meta property="og:description" content={copy.description} />
        <meta property="og:locale" content={lang === "pt" ? "pt_BR" : lang === "es" ? "es_ES" : "en_US"} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={copy.title} />
        <meta name="twitter:description" content={copy.description} />
        <script type="application/ld+json">{JSON.stringify(breadcrumbs)}</script>
        <script type="application/ld+json">{JSON.stringify({ "@context": "https://schema.org", ...generateFAQSchema(faqs) })}</script>
        {match && <script type="application/ld+json">{JSON.stringify(buildVascoBocaEvent(match, copy.description, getCanonicalUrl("/maracana-hero.webp")))}</script>}
      </Helmet>
      <Header />
      <main lang={lang}>
        <section className="relative isolate flex min-h-[620px] flex-col justify-end overflow-hidden bg-sidebar text-sidebar-foreground px-4 pb-12 pt-28 sm:px-8">
          <img src="/maracana-hero.webp" alt="Maracanã, Rio de Janeiro" fetchPriority="high" className="absolute inset-0 -z-20 h-full w-full object-cover" />
          <div className="absolute inset-0 -z-10 bg-sidebar/75" />
          <div className="mx-auto w-full max-w-6xl">
            <nav aria-label={copy.calendar} className="mb-10 text-sm"><Link to="/maracana-calendario" className="underline underline-offset-4">{copy.calendar}</Link><span className="mx-3">/</span>Vasco x Boca</nav>
            {match?.competition && <p className="mb-4 text-sm font-semibold uppercase">{match.competition}</p>}
            <div className="mb-5 flex items-center gap-5">
              {match?.home_team_logo && <img src={match.home_team_logo} alt={match.home_team} className="h-16 w-16 object-contain sm:h-20 sm:w-20" />}
              {match?.away_team_logo && <img src={match.away_team_logo} alt={match.away_team} className="h-16 w-16 object-contain sm:h-20 sm:w-20" />}
            </div>
            <h1 className="mb-5 max-w-4xl font-serif text-4xl font-bold leading-tight tracking-normal sm:text-6xl">Vasco <span className="text-sidebar-foreground/70">x</span> Boca Juniors</h1>
            <p className="mb-6 max-w-2xl text-base leading-relaxed text-sidebar-foreground/90">{copy.intro}</p>
            <div className="mb-7 flex flex-wrap gap-x-6 gap-y-3 text-sm">
              {match && <><span className="flex items-center gap-2"><Calendar className="h-4 w-4" />{date}</span><span className="flex items-center gap-2"><Clock className="h-4 w-4" />{hour} · Rio</span><span className="flex items-center gap-2"><MapPin className="h-4 w-4" />{stadium}</span></>}
            </div>
            {buyButton}
          </div>
        </section>
        <section className="border-b border-border px-4 py-10 sm:px-8" data-vasco-boca-details={match ? "ready" : "pending"}>
          <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-[2fr_1fr]">
            <div><h2 className="mb-5 font-serif text-2xl font-bold tracking-normal">{copy.details}</h2>
              {match ? <dl className="grid gap-5 sm:grid-cols-3">{[[copy.date, `${date} · ${hour}`], [copy.venue, stadium], [copy.competition, match.competition]].map(([label, value]) => value && <div key={label}><dt className="mb-1 text-sm text-muted-foreground">{label}</dt><dd className="font-semibold">{value}</dd></div>)}</dl> : <p role="status" className="text-muted-foreground">{isLoading ? copy.loading : copy.unavailable}</p>}
            </div>
            <div className="md:border-l md:border-border md:pl-8">
              {price && price > 0 ? <><p className="text-sm text-muted-foreground">{copy.from}</p><p className="my-1 text-3xl font-semibold">{formatPrice(price)}</p><p className="mb-4 text-sm text-muted-foreground">{copy.perPerson}</p></> : <p className="mb-4 text-muted-foreground">{copy.unavailable}</p>}
              {buyButton}
            </div>
          </div>
        </section>
        <section className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-8 md:grid-cols-2">
          <div><h2 className="mb-5 font-serif text-3xl font-bold tracking-normal">{copy.about}</h2><p className="leading-relaxed text-muted-foreground">{copy.aboutText}</p></div>
          {included.length > 0 && <div><h2 className="mb-5 font-serif text-2xl font-bold tracking-normal">{copy.included}</h2><ul className="space-y-4">{included.map((item, i) => <li key={i} className="flex items-start gap-3"><Check className="mt-1 h-5 w-5 shrink-0 text-primary" /><span>{item}</span></li>)}</ul></div>}
          <div className="md:col-span-2"><h2 className="mb-4 font-serif text-2xl font-bold tracking-normal">{copy.planning}</h2><p className="max-w-4xl leading-relaxed text-muted-foreground">{copy.planningText}</p></div>
        </section>
        <section className="bg-muted/40 px-4 py-14 sm:px-8"><div className="mx-auto max-w-4xl"><h2 className="mb-6 font-serif text-3xl font-bold tracking-normal">{copy.faq}</h2><Accordion type="single" collapsible>{faqs.map((faq, i) => <AccordionItem value={String(i)} key={faq.q}><AccordionTrigger className="text-left">{faq.q}</AccordionTrigger><AccordionContent className="leading-relaxed text-muted-foreground">{faq.a}</AccordionContent></AccordionItem>)}</Accordion></div></section>
        <section className="px-4 py-14 text-center sm:px-8"><Ticket className="mx-auto mb-4 h-8 w-8 text-primary" /><h2 className="mb-6 font-serif text-3xl font-bold tracking-normal">{copy.final}</h2>{buyButton}<div className="mt-8 flex flex-wrap justify-center gap-6 text-sm"><Link to="/maracana-calendario" className="text-primary underline underline-offset-4">{copy.calendar}</Link><Link to="/football-experiences-in-rio-de-janeiro" className="text-primary underline underline-offset-4">{copy.football}</Link></div></section>
      </main>
      <Footer />
    </div>
  );
}