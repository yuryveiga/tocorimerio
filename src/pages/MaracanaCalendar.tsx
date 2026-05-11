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
import { getCanonicalUrl, getHreflangLinks, generateBreadcrumbsSchema, cleanMatchSlug } from "@/utils/seo";

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
    return matches?.filter(m => m.status === 'available' && getMatchDateInRio(m.match_date) >= now) || [];
  }, [matches]);

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
        <title>Calendário de Jogos no Rio de Janeiro | Tocorime Rio</title>
        <meta name="description" content="Veja o calendário completo de partidas de futebol no Rio de Janeiro. Planeje sua visita ao Maracanã com datas, horários e disponibilidade." />
        <link rel="canonical" href={getCanonicalUrl("/maracana-calendario")} />
        {getHreflangLinks("/maracana-calendario").map((l) => (
          <link key={l.hreflang} rel="alternate" hrefLang={l.hreflang} href={l.href} />
        ))}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={getCanonicalUrl("/maracana-calendario")} />
        <meta property="og:title" content="Calendário de Jogos no Maracanã | Tocorime Rio" />
        <meta property="og:description" content="Calendário completo de partidas no Maracanã. Planeje sua visita com datas, horários e pacotes." />
        <meta property="og:site_name" content="Tocorime Rio" />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">
          {JSON.stringify(generateBreadcrumbsSchema([
            { name: language === 'pt' ? 'Início' : 'Home', url: getCanonicalUrl("/") },
            { name: language === 'pt' ? 'Calendário Maracanã' : 'Maracanã Calendar', url: getCanonicalUrl("/maracana-calendario") },
          ]))}
        </script>
      </Helmet>
      
      <Header />
      
      <div className="pt-24 pb-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl sm:text-5xl font-bold mb-2 font-sans tracking-tight">
            {language === 'pt' ? 'CALENDÁRIO DE JOGOS NO MARACANÃ' : language === 'es' ? 'CALENDARIO DE PARTIDOS EN MARACANÃ' : 'MATCH CALENDAR AT MARACANÃ'}
          </h1>
          <p className="text-muted-foreground mb-8">
            {language === 'pt' ? 'Confira os próximos jogos e nosso itinerário' : language === 'es' ? 'Consulta los próximos partidos y nuestro itinerario' : 'Check upcoming matches and our itinerary'}
          </p>
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
                            to={`/match/${cleanMatchSlug(match.slug || match.id)}`}
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
      
      <Footer />
    </div>
  );
};

export default MaracanaCalendar;