import { useLocale } from "@/contexts/LocaleContext";
import { useMatches } from "@/hooks/useMatches";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Locale } from "date-fns";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, addMonths, subMonths } from "date-fns";
import { ptBR, enUS, es } from "date-fns/locale";
import { getMatchDateInRio, isMatchOnDay, getDisplaySpots } from "@/lib/dateUtils";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, ArrowRight, Bus, Ticket, UserCheck, Clock, Camera, Users, ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useSiteData } from "@/hooks/useSiteData";
import { getCanonicalUrl, getHreflangLinks, generateBreadcrumbsSchema, cleanMatchSlug, generateSportsEventSchema, generateFAQSchema } from "@/utils/seo";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const localeMap: Record<string, Locale> = { pt: ptBR, en: enUS, es };

const weekDaysByLang: Record<string, string[]> = {
  pt: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
  en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  es: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
};

const MaracanaCalendar = () => {
  const { language, t, formatPrice } = useLocale();
  const { data: matches, isLoading } = useMatches();
  const { socialMedia } = useSiteData();
  const locale = localeMap[language] || enUS;
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    const available = matches?.filter(m => m.status === 'available' && getMatchDateInRio(m.match_date) >= new Date());
    if (available && available.length > 0) {
      setCurrentMonth(startOfMonth(getMatchDateInRio(available[0].match_date)));
    }
  }, [matches]);

  const availableMatches = useMemo(() => {
    const now = new Date();
    return matches?.filter(m =>
      m.status === 'available' &&
      getMatchDateInRio(m.match_date) >= now &&
      !!m.home_team?.trim() &&
      !!m.away_team?.trim()
    ) || [];
  }, [matches]);

  // Real remaining spots from the database only — never a fabricated number
  const realSpotsLeft = (m: { available_spots?: number | null; sold_count?: number | null }) =>
    (Number(m.available_spots) || 0) - (Number(m.sold_count) || 0);


  const calendarDays = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start, end });
    const startPadding = getDay(start);
    return { days, startPadding };
  }, [currentMonth]);

  const getMatchesForDay = (day: Date) => 
    availableMatches.filter(m => isMatchOnDay(m.match_date, day));

  const weekDays = weekDaysByLang[language] || weekDaysByLang.en;

  // ---- SEO: eventos + destaque por clube (Flamengo / Fluminense) ----
  const seo = useMemo(() => {
    const upcoming = availableMatches.slice(0, 30);

    const hasTeam = (name: string) =>
      upcoming.some(m =>
        `${m.home_team} ${m.away_team}`.toLowerCase().includes(name)
      );
    const flaMatches = upcoming.filter(m => `${m.home_team} ${m.away_team}`.toLowerCase().includes('flamengo'));
    const fluMatches = upcoming.filter(m => `${m.home_team} ${m.away_team}`.toLowerCase().includes('fluminense'));

    const clubBits: string[] = [];
    if (hasTeam('flamengo')) clubBits.push('Flamengo');
    if (hasTeam('fluminense')) clubBits.push('Fluminense');

    const baseTitle = language === 'pt'
      ? 'Ingressos Maracanã 2026: Calendário de Jogos, Preços e Tour'
      : language === 'es'
        ? 'Entradas Maracanã 2026: Calendario de Partidos, Precios y Tour'
        : 'Maracanã Tickets 2026: Match Calendar, Prices & Guided Tour';

    // Reforço de clube no título quando há jogos de Fla/Flu na lista
    const title = clubBits.length
      ? (language === 'pt'
          ? `Ingressos Maracanã 2026: Jogos do ${clubBits.join(' e ')}, Preços e Tour`
          : language === 'es'
            ? `Entradas Maracanã 2026: Partidos de ${clubBits.join(' y ')}, Precios y Tour`
            : `Maracanã Tickets 2026: ${clubBits.join(' & ')} Fixtures, Prices & Tour`)
      : baseTitle;

    const description = language === 'pt'
      ? `Ingressos para o Maracanã${clubBits.length ? ` (${clubBits.join(' e ')})` : ''} com calendário atualizado de jogos, preços e setores. Ingresso oficial, transporte do hotel e guia bilíngue incluídos.`
      : language === 'es'
        ? `Entradas para Maracanã${clubBits.length ? ` (${clubBits.join(' y ')})` : ''} con calendario actualizado, precios y sectores. Entrada oficial, transporte del hotel y guía bilingüe incluidos.`
        : `Maracanã tickets${clubBits.length ? ` for ${clubBits.join(' & ')}` : ''} with the updated fixture calendar, prices and seating sectors. Official ticket, hotel transport and bilingual guide included.`;

    const keywords = [
      'maracana tickets', 'maracanã tickets', 'maracana stadium tickets', 'buy maracana tickets',
      'how much are maracana tickets', 'maracana ticket prices', 'maracana match calendar',
      'ingresso Maracanã', 'ingressos Maracanã preço', 'entradas Maracanã',
      'Maracanã', 'Calendário de Jogos', 'Tour Maracanã',
      'Flamengo', 'Fluminense', 'Futebol no Rio de Janeiro', 'Passeio Turístico Rio de Janeiro',
      ...(flaMatches.length ? ['jogo do Flamengo no Maracanã', 'ingresso Flamengo', 'Flamengo tickets Maracanã'] : []),
      ...(fluMatches.length ? ['jogo do Fluminense no Maracanã', 'ingresso Fluminense', 'Fluminense tickets Maracanã'] : []),

    ].join(', ');

    const events = upcoming.map((m, i) => {
      const start = getMatchDateInRio(m.match_date);
      const url = getCanonicalUrl(`/match/${cleanMatchSlug(m.slug || '') || m.id}`);
      const spots = getDisplaySpots(m.id, m.available_spots, m.sold_count);
      const name = `${m.home_team} x ${m.away_team} — ${m.stadium || m.venue || 'Maracanã'}`;
      return {
        "@type": "ListItem",
        position: i + 1,
        item: {
          ...generateSportsEventSchema({
            name,
            description: language === 'pt'
              ? `${name}: ${m.competition}. Tour com ingresso oficial, transporte e guia bilíngue.`
              : `${name}: ${m.competition}. Tour with official ticket, transport and bilingual guide.`,
            startDate: start.toISOString(),
            imageUrl: (m as any).image_url || undefined,
            url,
            homeTeam: m.home_team,
            awayTeam: m.away_team,
            venueName: m.stadium || m.venue || 'Maracanã',
            offerUrl: url,
            offerPrice: Number(m.price) || 0,
            offerCurrency: 'BRL',
          }),
          offers: {
            "@type": "Offer",
            url,
            price: Number(m.price) || 0,
            priceCurrency: 'BRL',
            availability: spots > 0 ? 'https://schema.org/InStock' : 'https://schema.org/SoldOut',
            validFrom: new Date().toISOString(),
            inventoryLevel: { "@type": "QuantitativeValue", value: spots },
          },
        },
      };
    });

    const itemList = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: title,
      itemListElement: events,
    };

    const next = upcoming[0];
    const nextDate = next ? getMatchDateInRio(next.match_date) : null;
    const nextLabel = nextDate ? format(nextDate, language === 'pt' ? "dd 'de' MMMM 'de' yyyy, HH:mm" : "MMMM d, yyyy, HH:mm", { locale }) : null;
    const nextName = next ? `${next.home_team} x ${next.away_team}` : null;

    const cheapest = availableMatches.length
      ? Math.min(...availableMatches.map(m => Number(m.price) || Infinity))
      : null;
    const priceLabel = cheapest && Number.isFinite(cheapest) ? formatPrice(cheapest) : null;

    const faqs: { q: string; a: string }[] = language === 'pt'

      ? [
          {
            q: 'Quando é o próximo jogo no Maracanã?',
            a: next
              ? `O próximo jogo no Maracanã é ${nextName} (${next.competition || 'futebol'}) em ${nextLabel} (horário de Brasília). Confira o calendário completo nesta página, atualizado diariamente.`
              : 'O calendário desta página é atualizado diariamente com os próximos jogos confirmados no Maracanã. Assim que a próxima partida for divulgada, ela aparece aqui com data, horário e ingressos.',
          },
          { q: 'Como comprar ingresso para o jogo no Maracanã?', a: 'Basta escolher a partida no calendário acima e reservar online. O tour inclui o ingresso oficial nas Cadeiras Cativas (Setor Oeste), transporte ida e volta do seu hotel e guia bilíngue.' },
          { q: 'Quanto custa o ingresso para o Maracanã?', a: priceLabel
              ? `Nossos pacotes para jogos no Maracanã começam em ${priceLabel} por pessoa, já com ingresso oficial, transporte ida e volta do hotel e guia bilíngue. O preço varia conforme o campeonato e a procura da partida — clássicos e jogos de Libertadores custam mais.`
              : 'O preço varia conforme o campeonato e a procura da partida. Cada jogo no calendário acima mostra o valor por pessoa, já incluindo ingresso oficial, transporte e guia bilíngue.' },
          { q: 'Qual é o melhor setor do Maracanã para turistas?', a: 'As Cadeiras Cativas do Setor Oeste (inferior) são as mais indicadas: visão central do campo, cobertura parcial, acesso mais tranquilo e distância segura das torcidas organizadas. É o setor que usamos nos nossos tours.' },
          { q: 'Dá para comprar ingresso do Maracanã na bilheteria no dia do jogo?', a: 'Nem sempre. Muitos jogos exigem cadastro biométrico, CPF ou sócio-torcedor e esgotam antes do dia da partida. Comprando com o tour, resolvemos toda a parte burocrática e garantimos a entrada.' },
          { q: 'Turista estrangeiro precisa de CPF para entrar no Maracanã?', a: 'Em vários jogos sim — o sistema de venda exige documento brasileiro ou cadastro prévio. Nós fazemos essa emissão para você e entregamos o ingresso já em seu nome no dia.' },
          { q: 'Quando joga o Flamengo no Maracanã?', a: 'Os jogos do Flamengo no Maracanã aparecem destacados no calendário acima assim que são confirmados pela CBF/Conmebol. Como são partidas de alta procura, recomendamos reservar com antecedência.' },
          { q: 'Quando joga o Fluminense no Maracanã?', a: 'As partidas do Fluminense no Maracanã também são listadas no calendário desta página, com data, campeonato e disponibilidade de vagas em tempo real.' },
          { q: 'O tour inclui transporte do hotel até o Maracanã?', a: 'Sim. Buscamos você no lobby do seu hotel na Zona Sul em van executiva, levamos ao estádio e fazemos o retorno seguro após o apito final.' },
          { q: 'É seguro ir ao Maracanã como turista?', a: 'Sim, indo acompanhado. Nossos guias trilíngues acompanham o grupo do embarque ao retorno, orientando sobre setores, torcidas e comportamento no estádio.' },
        ]

      : language === 'es'
        ? [
            {
              q: '¿Cuándo es el próximo partido en Maracanã?',
              a: next
                ? `El próximo partido en Maracanã es ${nextName} (${next.competition || 'fútbol'}) el ${nextLabel} (hora de Brasilia). Consulta el calendario completo en esta página.`
                : 'El calendario de esta página se actualiza a diario con los próximos partidos confirmados en Maracanã.',
            },
            { q: '¿Cómo comprar entradas para el partido en Maracanã?', a: 'Elige el partido en el calendario y reserva online. El tour incluye entrada oficial (Sector Oeste), transporte desde tu hotel y guía bilingüe.' },
            { q: '¿Cuánto cuestan las entradas para Maracanã?', a: priceLabel
                ? `Nuestros paquetes para partidos en Maracanã empiezan en ${priceLabel} por persona, con entrada oficial, transporte desde el hotel y guía bilingüe. El precio varía según el campeonato: clásicos y Libertadores cuestan más.`
                : 'El precio varía según el campeonato y la demanda. Cada partido del calendario muestra el valor por persona, con entrada oficial, transporte y guía bilingüe.' },
            { q: '¿Cuál es el mejor sector de Maracanã para turistas?', a: 'Las Sillas Reservadas del Sector Oeste (inferior): vista central del campo, cobertura parcial, acceso tranquilo y distancia segura de las hinchadas organizadas. Es el sector que usamos en nuestros tours.' },
            { q: '¿Puedo comprar la entrada en la taquilla el día del partido?', a: 'No siempre. Muchos partidos exigen registro biométrico o CPF brasileño y se agotan antes. Con el tour resolvemos todo el trámite y garantizamos tu entrada.' },
            { q: '¿Un turista extranjero necesita CPF para entrar a Maracanã?', a: 'En varios partidos sí: el sistema de venta exige documento brasileño o registro previo. Nosotros gestionamos la emisión y te entregamos la entrada a tu nombre.' },
            { q: '¿Cuándo juega Flamengo en Maracanã?', a: 'Los partidos de Flamengo aparecen destacados en el calendario apenas se confirman. Son de alta demanda: reserva con antelación.' },
            { q: '¿Cuándo juega Fluminense en Maracanã?', a: 'Los partidos de Fluminense también se listan aquí, con fecha, campeonato y disponibilidad en tiempo real.' },
            { q: '¿El tour incluye transporte desde el hotel?', a: 'Sí. Te recogemos en el lobby de tu hotel en la Zona Sur y regresamos tras el pitido final.' },
            { q: '¿Es seguro ir a Maracanã como turista?', a: 'Sí, acompañado. Nuestros guías trilingües están con el grupo durante toda la experiencia.' },
          ]
        : [
            {
              q: 'When is the next game at Maracanã?',
              a: next
                ? `The next game at Maracanã is ${nextName} (${next.competition || 'football'}) on ${nextLabel} (Rio de Janeiro time). See the full, daily-updated fixture list on this page.`
                : 'This page lists every confirmed upcoming match at Maracanã and is updated daily. As soon as the next fixture is announced it appears here with date, kick-off time and tickets.',
            },
            { q: 'How do I buy tickets for a match at Maracanã?', a: 'Pick a match in the calendar above and book online. Your Maracanã ticket comes as part of a guided matchday package: an official seat in the Reserved Seats (West Sector), round-trip hotel transport and a bilingual guide — no Brazilian ID, no queues, no resale risk.' },
            { q: 'How much are Maracanã tickets?', a: priceLabel
                ? `Our Maracanã matchday packages start at ${priceLabel} per person, including the official ticket, round-trip hotel transport and a bilingual guide. Prices vary by competition and demand — derbies (Fla-Flu, Flamengo x Vasco) and Copa Libertadores nights cost more than league games.`
                : 'Prices vary by competition and demand. Each fixture in the calendar above shows the price per person, already including the official ticket, hotel transport and a bilingual guide.' },
            { q: 'What is the best sector at Maracanã for tourists?', a: 'The Reserved Seats in the lower West Sector (Cadeiras Cativas Oeste) are the best choice: a central view of the pitch, partial roof cover, calmer access gates and a safe distance from the organised supporter ends. That is the sector we use on every tour.' },
            { q: 'Can I buy Maracanã tickets at the box office on matchday?', a: 'Often not. Many matches require biometric registration, a Brazilian CPF number or club membership, and popular fixtures sell out days in advance. Booking the tour removes all of that paperwork and guarantees entry.' },
            { q: 'Do foreign tourists need a CPF to enter Maracanã?', a: 'For several matches, yes — the official ticketing system requires a Brazilian document or prior registration. We handle the issuing process and hand you the ticket in your name on the day.' },
            { q: 'When does Flamengo play at Maracanã?', a: 'Flamengo fixtures are highlighted in the calendar above as soon as they are confirmed. These matches sell out fast, so book early.' },
            { q: 'When does Fluminense play at Maracanã?', a: 'Fluminense home matches are also listed on this page with date, competition and live spot availability.' },
            { q: 'Does the tour include transport from my hotel to Maracanã?', a: 'Yes. We pick you up at your South Zone hotel lobby in an executive van and bring you back safely after the final whistle.' },
            { q: 'Is it safe to go to Maracanã as a tourist?', a: 'Yes, when accompanied. Our trilingual guides stay with the group from pickup to drop-off and explain sectors, fan culture and stadium etiquette.' },

          ];

    const faqSchema = {
      "@context": "https://schema.org",
      ...generateFAQSchema(faqs),
    };

    return { title, description, keywords, itemList, faqs, faqSchema };
  }, [availableMatches, language, formatPrice, locale]);

  const itinerary = [
    {
      icon: <Bus className="h-5 w-5" />,
      title: language === 'pt' ? 'Busca no Hotel' : language === 'es' ? 'Recogida en el Hotel' : 'Hotel Pickup',
      description: language === 'pt' ? 'Van executiva com paradas nos hotéis da Zona Sul. Nosso guia te busca no lobby.' : language === 'es' ? 'Van ejecutiva con paradas en hoteles de la Zona Sur. Nuestro guía te recoge en el lobby.' : 'Executive van with stops at South Zone hotels. Our guide picks you up at the lobby.',
    },
    {
      icon: <Users className="h-5 w-5" />,
      title: language === 'pt' ? 'Chegada ao Estádio' : language === 'es' ? 'Llegada al Estadio' : 'Stadium Arrival',
      description: language === 'pt' ? 'Desembarque no estacionamento do estádio ou o mais próximo possível. Imersão na atmosfera pré-jogo.' : language === 'es' ? 'Descenso en el estacionamiento del estadio o lo más cerca posible. Inmersión en la atmósfera previa al partido.' : 'Drop-off at the stadium parking lot or as close as possible. Pre-match atmosphere immersion.',
    },
    {
      icon: <Ticket className="h-5 w-5" />,
      title: language === 'pt' ? 'Entrada no Estádio' : language === 'es' ? 'Entrada al Estadio' : 'Stadium Entry',
      description: language === 'pt' ? 'Acesso com ingresso oficial nas Cadeiras Cativas (Setor Oeste), uma das melhores áreas do Maracanã.' : language === 'es' ? 'Acceso con entrada oficial en las Sillas Reservadas (Sector Oeste), una de las mejores áreas del Maracanã.' : 'Entry with official ticket in the Reserved Seats (West Sector), one of the best areas in Maracanã.',
    },
    {
      icon: <Camera className="h-5 w-5" />,
      title: language === 'pt' ? 'Experiência no Jogo' : language === 'es' ? 'Experiencia del Partido' : 'Match Experience',
      description: language === 'pt' ? 'Assista ao jogo com guia trilíngue que explica curiosidades, tradições e a cultura do futebol carioca.' : language === 'es' ? 'Vea el partido con un guía trilingüe que explica curiosidades, tradiciones y la cultura del fútbol carioca.' : 'Watch the match with a trilingual guide who explains curiosities, traditions, and Carioca football culture.',
    },
    {
      icon: <Bus className="h-5 w-5" />,
      title: language === 'pt' ? 'Retorno ao Hotel' : language === 'es' ? 'Regreso al Hotel' : 'Return to Hotel',
      description: language === 'pt' ? 'Após o apito final, retorno seguro e confortável ao seu hotel.' : language === 'es' ? 'Después del pitido final, regreso seguro y cómodo a su hotel.' : 'After the final whistle, safe and comfortable return to your hotel.',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{seo.title}</title>
        <meta name="description" content={seo.description} />
        <meta name="keywords" content={seo.keywords} />
        <link rel="canonical" href={getCanonicalUrl("/maracana-calendario")} />
        {getHreflangLinks("/maracana-calendario").map((l) => (
          <link key={l.hreflang} rel="alternate" hrefLang={l.hreflang} href={l.href} />
        ))}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={getCanonicalUrl("/maracana-calendario")} />
        <meta property="og:title" content={seo.title} />
        <meta property="og:description" content={seo.description} />
        <meta property="og:site_name" content="Tocorime Rio" />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">
          {JSON.stringify(generateBreadcrumbsSchema([
            { name: language === 'pt' ? 'Início' : 'Home', url: getCanonicalUrl("/") },
            { name: language === 'pt' ? 'Calendário Maracanã' : 'Maracanã Calendar', url: getCanonicalUrl("/maracana-calendario") },
          ]))}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(seo.itemList)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(seo.faqSchema)}
        </script>
      </Helmet>
      
      <Header />
      
      <div className="pt-24 pb-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl sm:text-5xl font-bold mb-3 font-sans tracking-tight">
            {language === 'pt' ? 'INGRESSOS PARA O MARACANÃ E CALENDÁRIO DE JOGOS' : language === 'es' ? 'ENTRADAS PARA MARACANÃ Y CALENDARIO DE PARTIDOS' : 'MARACANÃ TICKETS & MATCH CALENDAR'}
          </h1>
          <p className="text-muted-foreground mb-4 max-w-3xl leading-relaxed">
            {language === 'pt'
              ? 'Todos os próximos jogos confirmados no Maracanã, com data, campeonato, preço por pessoa e vagas em tempo real. Cada reserva inclui o ingresso oficial nas Cadeiras Cativas do Setor Oeste, transporte ida e volta do seu hotel na Zona Sul e guia trilíngue — sem fila, sem CPF e sem risco de revenda.'
              : language === 'es'
                ? 'Todos los próximos partidos confirmados en Maracanã, con fecha, campeonato, precio por persona y plazas en tiempo real. Cada reserva incluye la entrada oficial en las Sillas Reservadas del Sector Oeste, transporte ida y vuelta desde tu hotel en la Zona Sur y guía trilingüe — sin colas, sin CPF y sin riesgo de reventa.'
                : 'Every confirmed upcoming fixture at Maracanã, with date, competition, price per person and live availability. Each booking includes an official Maracanã ticket in the Reserved Seats (lower West Sector), round-trip transport from your South Zone hotel and a trilingual guide — no queues, no Brazilian CPF and no resale risk.'}
          </p>
          {(() => {
            const cheapest = availableMatches.length ? Math.min(...availableMatches.map(m => Number(m.price) || Infinity)) : null;
            if (!cheapest || !Number.isFinite(cheapest)) return null;
            return (
              <p className="text-sm font-semibold text-primary mb-8">
                {language === 'pt' ? `Ingressos com tour a partir de ${formatPrice(cheapest)} por pessoa` : language === 'es' ? `Entradas con tour desde ${formatPrice(cheapest)} por persona` : `Maracanã tickets with guided tour from ${formatPrice(cheapest)} per person`}
              </p>
            );
          })()}

        </motion.div>

        {/* Full-width Calendar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-10"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <CalendarDays className="h-6 w-6 text-primary" />
              <span className="capitalize">{format(currentMonth, 'MMMM yyyy', { locale })}</span>
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentMonth(prev => subMonths(prev, 1))}
                className="p-2 rounded-lg hover:bg-secondary/50 transition-colors text-muted-foreground hover:text-foreground border border-border/50"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => setCurrentMonth(prev => addMonths(prev, 1))}
                className="p-2 rounded-lg hover:bg-secondary/50 transition-colors text-muted-foreground hover:text-foreground border border-border/50"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-px bg-border/40 rounded-xl overflow-hidden shadow-2xl border border-border/50">
            {weekDays.map(day => (
              <div key={day} className="bg-secondary/30 py-3 text-center text-xs font-bold text-muted-foreground uppercase tracking-widest">
                {day}
              </div>
            ))}
            {Array.from({ length: calendarDays.startPadding }).map((_, i) => (
              <div key={`pad-${i}`} className="bg-card/20 min-h-[100px] md:min-h-[120px]" />
            ))}
            {calendarDays.days.map(day => {
              const dayMatches = getMatchesForDay(day);
              const hasMatches = dayMatches.length > 0;
              const isToday = isSameDay(day, new Date());

              return (
                <div
                  key={day.toISOString()}
                  className={`bg-card min-h-[100px] md:min-h-[120px] p-2 transition-all relative group ${
                    hasMatches ? 'bg-primary/5 hover:bg-primary/10' : 'hover:bg-secondary/10'
                  } ${isToday ? 'ring-2 ring-inset ring-primary/40' : ''}`}
                >
                  <span className={`text-sm font-bold absolute top-2 right-2 ${
                    isToday ? 'bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-xs' : 'text-foreground/40'
                  }`}>
                    {format(day, 'd')}
                  </span>
                  
                  <div className="mt-6 space-y-2">
                    {dayMatches.map(match => {
                      const displaySpots = getDisplaySpots(match.id, match.available_spots, match.sold_count);
                      const isUrgent = displaySpots <= 5 && displaySpots > 0;
                      const matchDateRio = getMatchDateInRio(match.match_date);
                      const hoursUntilMatch = (matchDateRio.getTime() - new Date().getTime()) / (1000 * 60 * 60);
                      const isLastChance = hoursUntilMatch <= 48 && hoursUntilMatch > 0;
                      
                        return (
                          <Link 
                            key={match.id} 
                            to={`/match/${match.slug || match.id}`}
                            className={`block p-2 rounded-lg text-xs leading-tight border transition-all shadow-sm hover:scale-[1.02] active:scale-95 ${match.high_demand ? 'bg-orange-500/10 border-orange-500/30' : 'bg-primary/10 border-primary/30'}`}
                          >
                          {isLastChance && (
                            <span className="block text-[8px] font-black text-destructive uppercase animate-pulse mb-1">
                              LAST CHANCE
                            </span>
                          )}
                          <div className="font-bold text-foreground truncate mb-1">
                            {match.home_team} x {match.away_team}
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="text-primary font-bold">
                              {formatPrice(match.price)}
                            </span>
                            <span className={`font-medium flex items-center gap-1 ${isUrgent ? 'text-destructive animate-pulse' : 'text-muted-foreground'}`}>
                              <Users className="h-3 w-3" />
                              {displaySpots} {language === 'pt' ? 'vagas' : 'left'}
                            </span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Itinerary */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
              <Clock className="h-6 w-6 text-primary" />
              {language === 'pt' ? 'ITINERÁRIO DO TOUR' : 'TOUR ITINERARY'}
            </h2>

            <div className="relative">
              <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-gradient-to-b from-primary/40 to-transparent" />
              <div className="space-y-8">
                {itinerary.map((step, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="flex gap-6 relative"
                  >
                    <div className="w-12 h-12 rounded-full bg-background border-2 border-primary flex items-center justify-center text-primary shrink-0 z-10 shadow-lg">
                      {step.icon}
                    </div>
                    <div className="pt-2">
                      <h3 className="font-bold text-lg text-foreground">
                        {step.title}
                      </h3>
                      <p className="text-muted-foreground mt-1 leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <Card className="mt-12 p-6 bg-primary/5 border-primary/20 backdrop-blur-sm">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <UserCheck className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-bold text-base text-foreground">
                    {language === 'pt' ? 'Duração total: 6 a 7 horas' : 'Total duration: 6 to 7 hours'}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                    {language === 'pt' 
                      ? 'Isso inclui o encontro pré-jogo, a imersão com os torcedores, a partida em si e o retorno após o apito final.' 
                      : 'This includes the pre-match meeting, fan immersion, the match itself, and return after the final whistle.'}
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* FAQ / Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
              <MapPin className="h-6 w-6 text-primary" />
              {language === 'pt' ? 'INFORMAÇÕES IMPORTANTES' : 'IMPORTANT INFO'}
            </h2>

            <div className="space-y-6">
              <div className="p-5 rounded-xl border border-border/50 bg-card/50">
                <h4 className="font-bold mb-2 flex items-center gap-2">
                   <Ticket className="h-4 w-4 text-primary" />
                   {language === 'pt' ? 'Ingressos Oficiais' : 'Official Tickets'}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {language === 'pt' 
                    ? 'Nossos ingressos são garantidos e para os melhores setores do estádio (Oeste/Leste inferior).' 
                    : 'Our tickets are guaranteed and for the best stadium sectors (West/Lower East).'}
                </p>
              </div>
              
              <div className="p-5 rounded-xl border border-border/50 bg-card/50">
                <h4 className="font-bold mb-2 flex items-center gap-2">
                   <Users className="h-4 w-4 text-primary" />
                   {language === 'pt' ? 'Guias Especialistas' : 'Expert Guides'}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {language === 'pt' 
                    ? 'Acompanhamento total por guias bilingues que conhecem cada detalhe da cultura do futebol carioca.' 
                    : 'Full support by bilingual guides who know every detail of Carioca football culture.'}
                </p>
              </div>

              <div className="mt-8">
                <p className="text-sm font-medium mb-4 text-muted-foreground uppercase tracking-widest">
                  {language === 'pt' ? 'Dúvidas? Fale conosco' : 'Questions? Talk to us'}
                </p>
                {(() => {
                  const whatsapp = socialMedia.find(s => s.platform.toLowerCase().includes('whatsapp'));
                  const contactUrl = whatsapp?.url || "https://wa.me/5521995624596";
                  const cleanNumber = contactUrl.replace(/[^\d+]/g, "");
                  const waLink = contactUrl.startsWith('http') 
                    ? contactUrl 
                    : `https://wa.me/${cleanNumber.replace('+', '')}`;
                  
                  return (
                    <a 
                      href={waLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-3 bg-[#25D366] hover:bg-[#20ba59] text-white px-8 py-4 rounded-full font-bold transition-all shadow-lg hover:scale-105"
                    >
                      <ArrowRight className="h-5 w-5" />
                      WHATSAPP DIRECT
                    </a>
                  );
                })()}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Guia de ingressos: conteúdo de suporte para "maracana tickets" */}
      <section className="py-16 border-t border-border/50 bg-secondary/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 tracking-tight">
              {language === 'pt' ? 'GUIA DE INGRESSOS DO MARACANÃ' : language === 'es' ? 'GUÍA DE ENTRADAS DE MARACANÃ' : 'MARACANÃ TICKETS GUIDE'}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {language === 'pt'
                ? 'Comprar ingresso para o Maracanã como turista não é tão simples quanto parece: a maioria dos jogos exige cadastro biométrico, CPF brasileiro ou sócio-torcedor, e os clássicos esgotam com dias de antecedência. Por isso trabalhamos com pacotes matchday: você reserva uma vaga, nós emitimos o ingresso oficial no seu nome e cuidamos de toda a logística.'
                : language === 'es'
                  ? 'Comprar entradas para Maracanã como turista no es tan simple: la mayoría de los partidos exige registro biométrico, CPF brasileño o membresía del club, y los clásicos se agotan con días de antelación. Por eso trabajamos con paquetes matchday: reservas una plaza, nosotros emitimos la entrada oficial a tu nombre y gestionamos toda la logística.'
                  : 'Buying Maracanã tickets as a visitor is rarely straightforward: most matches require biometric registration, a Brazilian CPF number or club membership, and big derbies sell out days in advance. That is why we sell matchday packages instead — you reserve a spot, we issue the official ticket in your name and handle every logistical step.'}
            </p>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4">
              {language === 'pt' ? 'Setores do Maracanã e o que esperar de cada um' : language === 'es' ? 'Sectores de Maracanã y qué esperar' : 'Maracanã sectors and what to expect'}
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                {
                  t: language === 'pt' ? 'Cadeiras Cativas Oeste (nosso setor)' : language === 'es' ? 'Sillas Reservadas Oeste (nuestro sector)' : 'Reserved Seats West (our sector)',
                  d: language === 'pt' ? 'Visão central do campo, cobertura parcial, acesso tranquilo e distância segura das torcidas organizadas. Melhor custo-benefício para turistas.' : language === 'es' ? 'Vista central del campo, cobertura parcial, acceso tranquilo y distancia segura de las hinchadas. La mejor relación calidad-precio para turistas.' : 'Central view of the pitch, partial roof cover, calm access gates and a safe distance from the organised supporter ends. Best value for visitors.',
                },
                {
                  t: language === 'pt' ? 'Setor Leste inferior' : language === 'es' ? 'Sector Este inferior' : 'Lower East Sector',
                  d: language === 'pt' ? 'Boa visão e mais barato, porém sem cobertura e sol forte em jogos diurnos.' : language === 'es' ? 'Buena vista y más barato, pero sin cobertura y con mucho sol en partidos diurnos.' : 'Good view and cheaper, but uncovered and exposed to strong sun in afternoon kick-offs.',
                },
                {
                  t: language === 'pt' ? 'Setor Norte e Sul (torcidas)' : language === 'es' ? 'Sector Norte y Sur (hinchadas)' : 'North & South Sectors (fan ends)',
                  d: language === 'pt' ? 'Atrás dos gols, onde ficam as torcidas organizadas. Atmosfera intensa, mas não recomendado para quem vai pela primeira vez.' : language === 'es' ? 'Detrás de los arcos, donde están las hinchadas organizadas. Ambiente intenso, no recomendado para la primera visita.' : 'Behind the goals, home of the organised supporter groups. Electric atmosphere, but not recommended for a first visit.',
                },
                {
                  t: language === 'pt' ? 'Camarotes e Maracanã Mais' : language === 'es' ? 'Palcos y Maracanã Mais' : 'Boxes & Maracanã Mais',
                  d: language === 'pt' ? 'Ingressos premium com serviço, bem mais caros e geralmente vendidos por temporada.' : language === 'es' ? 'Entradas premium con servicio, mucho más caras y normalmente vendidas por temporada.' : 'Premium hospitality tickets, far more expensive and usually sold on a season basis.',
                },
              ].map((s, i) => (
                <div key={i} className="p-5 rounded-xl border border-border/50 bg-card/50">
                  <h4 className="font-bold mb-2">{s.t}</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">{s.d}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4">
              {language === 'pt' ? 'Como funciona a reserva, passo a passo' : language === 'es' ? 'Cómo funciona la reserva, paso a paso' : 'How booking works, step by step'}
            </h3>
            <ol className="list-decimal pl-5 space-y-2 text-muted-foreground leading-relaxed">
              <li>{language === 'pt' ? 'Escolha o jogo no calendário acima (data, campeonato e preço por pessoa).' : language === 'es' ? 'Elige el partido en el calendario (fecha, campeonato y precio por persona).' : 'Pick your fixture in the calendar above (date, competition and price per person).'}</li>
              <li>{language === 'pt' ? 'Reserve online e informe seu hotel — o pagamento é seguro via Stripe.' : language === 'es' ? 'Reserva online e indica tu hotel — el pago es seguro vía Stripe.' : 'Book online and tell us your hotel — payment is secured through Stripe.'}</li>
              <li>{language === 'pt' ? 'Emitimos o ingresso oficial no seu nome e confirmamos o horário da busca.' : language === 'es' ? 'Emitimos la entrada oficial a tu nombre y confirmamos la hora de recogida.' : 'We issue the official ticket in your name and confirm your pickup time.'}</li>
              <li>{language === 'pt' ? 'No dia do jogo: van executiva, entrada com o guia e retorno seguro ao hotel.' : language === 'es' ? 'El día del partido: van ejecutiva, entrada con el guía y regreso seguro al hotel.' : 'On matchday: executive van, guided entry to the stadium and a safe ride back to your hotel.'}</li>
            </ol>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4">
              {language === 'pt' ? 'Continue explorando o Rio' : language === 'es' ? 'Sigue explorando Río' : 'Keep exploring Rio'}
            </h3>
            <ul className="grid gap-3 sm:grid-cols-2 text-primary">
              <li><Link className="hover:underline font-medium" to="/passeios">{language === 'pt' ? 'Todos os passeios privativos no Rio' : language === 'es' ? 'Todos los tours privados en Río' : 'All private tours in Rio de Janeiro'}</Link></li>
              <li><Link className="hover:underline font-medium" to="/things-to-do-in-rio-de-janeiro">{language === 'pt' ? 'O que fazer no Rio de Janeiro' : language === 'es' ? 'Qué hacer en Río de Janeiro' : 'Things to do in Rio de Janeiro'}</Link></li>
              <li><Link className="hover:underline font-medium" to="/blog">{language === 'pt' ? 'Blog: guias locais do Rio' : language === 'es' ? 'Blog: guías locales de Río' : 'Blog: local Rio travel guides'}</Link></li>
              <li><Link className="hover:underline font-medium" to="/contact">{language === 'pt' ? 'Falar com um guia local' : language === 'es' ? 'Hablar con un guía local' : 'Talk to a local guide'}</Link></li>
            </ul>
          </div>
        </div>
      </section>


      <section className="py-16 border-t border-border/50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold mb-3 tracking-tight">
            {language === 'pt' ? 'PERGUNTAS FREQUENTES' : language === 'es' ? 'PREGUNTAS FRECUENTES' : 'FREQUENTLY ASKED QUESTIONS'}
          </h2>
          <p className="text-muted-foreground mb-8">
            {language === 'pt'
              ? 'Tudo sobre os próximos jogos no Maracanã, ingressos e como funciona o tour.'
              : language === 'es'
                ? 'Todo sobre los próximos partidos en Maracanã, entradas y cómo funciona el tour.'
                : 'Everything about upcoming games at Maracanã, tickets and how the tour works.'}
          </p>
          <Accordion type="single" collapsible className="w-full">
            {seo.faqs.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`}>
                <AccordionTrigger className="text-left text-base font-semibold">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default MaracanaCalendar;