import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { createClient } from "@supabase/supabase-js";
import { useQuery } from "@tanstack/react-query";
import { Calendar, MapPin, Ticket, ArrowRight, Check, Clock, Users, Star, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useMatches } from "@/hooks/useMatches";
import { getCanonicalUrl, generateSportsEventSchema, generateBreadcrumbsSchema } from "@/utils/seo";
import { getMatchDateInRio, getMatchHour } from "@/lib/dateUtils";
import { format } from "date-fns";
import { ptBR, enUS, es as esLocale } from "date-fns/locale";
import { useLocale } from "@/contexts/LocaleContext";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Play } from "lucide-react";
import { useSiteData } from "@/hooks/useSiteData";
import { TourItem, TourCardProps } from "@/components/TourItem";

const MARACANA_URL = "https://mwxbskzggzznxvkwgrnz.supabase.co";
const MARACANA_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13eGJza3pnZ3p6bnh2a3dncm56Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzNjE5OTUsImV4cCI6MjA4ODkzNzk5NX0.EFfaaN79uifOMgFdIZlQ5C8c-HQH-YodNGWf0MEcf9o";
const maracana = createClient(MARACANA_URL, MARACANA_KEY);

interface Pkg {
  id: string;
  price_brl: number;
  total_stock: number;
  sold_count: number;
  package_type: {
    slug: string;
    name_pt: string;
    name_en?: string;
    name_es?: string;
    description_pt: string;
    description_en?: string;
    description_es?: string;
    badge_pt: string | null;
    highlight_color: string | null;
    display_order: number;
    includes_transfer: boolean;
    includes_parking_access: boolean;
    includes_food: boolean;
    includes_chopp: boolean;
    requires_biometrics: boolean | null;
  } | null;
}

function usePackages(matchId: string | undefined) {
  return useQuery({
    queryKey: ["match-packages-landing", matchId],
    enabled: !!matchId,
    queryFn: async (): Promise<Pkg[]> => {
      const { data, error } = await maracana
        .from("match_packages")
        .select(`id, price_brl, total_stock, sold_count, is_active,
                 package_type:package_types(slug, name_pt, name_en, name_es, description_pt, description_en, description_es, badge_pt, badge_en, badge_es, highlight_color, display_order, includes_transfer, includes_parking_access, includes_food, includes_chopp, requires_biometrics)`)
        .eq("match_id", matchId)
        .eq("is_active", true);
      if (error) throw error;
      const list = (data || []) as any[];
      list.sort((a, b) => (a.package_type?.display_order ?? 99) - (b.package_type?.display_order ?? 99));
      return list as Pkg[];
    },
    staleTime: 1000 * 60 * 2,
  });
}

function useCountdown(target: Date) {
  const [t, setT] = useState({ d: "00", h: "00", m: "00", s: "00", live: false });
  useEffect(() => {
    const tick = () => {
      const diff = target.getTime() - Date.now();
      if (diff <= 0) return setT({ d: "00", h: "00", m: "00", s: "00", live: true });
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setT({ d: String(d).padStart(2, "0"), h: String(h).padStart(2, "0"), m: String(m).padStart(2, "0"), s: String(s).padStart(2, "0"), live: false });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);
  return t;
}

interface Props {
  matchSlug: string;
  pagePath: string;
  pageTitle: string;
  pageDescription: string;
  heroBackground?: string;
  accentClass?: string; // e.g. "from-green-600 to-green-800"
  youtubeVideos?: { id: string; title: string }[];
}

export default function MatchLandingPage({
  matchSlug,
  pagePath,
  pageTitle,
  pageDescription,
  heroBackground,
  accentClass = "from-primary to-primary/70",
  youtubeVideos,
}: Props) {
  const { t, language, formatPrice } = useLocale();
  const { data: matches, isLoading } = useMatches();
  const match = matches?.find((m) => m.slug === matchSlug);
  const { data: packages } = usePackages(match?.id);
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const { tours } = useSiteData();

  const randomTours = tours
    .filter((t: any) => !t.title?.includes("Maracanã MatchDay"))
    .sort(() => 0.5 - Math.random())
    .slice(0, 4);

  const galleryImages = [
    "/maracana-hero.webp",
    "/maracana-fans.jpg",
    "https://lncimg.lance.com.br/cdn-cgi/image/width=1600,quality=80,fit=cover,format=webp/uploads/2016/10/19/5807e137e598d.jpeg",
    "/maracana-hero.jpg"
  ];

  const target = match ? new Date(match.match_date) : new Date();
  const cd = useCountdown(target);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!match) return <Navigate to="/maracana-calendario" replace />;

  const dateRio = getMatchDateInRio(match.match_date);
  const formattedDate = format(
    dateRio, 
    language === 'en' ? "EEEE, MMMM do, yyyy" : language === 'es' ? "EEEE, d 'de' MMMM 'de' yyyy" : "EEEE, dd 'de' MMMM 'de' yyyy", 
    { locale: language === 'en' ? enUS : language === 'es' ? esLocale : ptBR }
  );
  const hour = getMatchHour(match.match_date);
  const matchUrl = `/match/${matchSlug}`;
  const canonical = getCanonicalUrl(pagePath);

  const validPkgs = (packages || []).filter((p) => p.price_brl > 0 && p.package_type);
  const minPrice = validPkgs.length > 0 ? Math.min(...validPkgs.map((p) => p.price_brl)) : match.price || 0;

  const schema = generateSportsEventSchema({
    name: `${match.home_team} x ${match.away_team}`,
    description: pageDescription,
    startDate: match.match_date,
    imageUrl: match.home_team_logo || match.away_team_logo,
    url: canonical,
    homeTeam: match.home_team,
    awayTeam: match.away_team,
    venueName: match.stadium || "Estádio do Maracanã",
    offerUrl: getCanonicalUrl(matchUrl),
    offerPrice: minPrice,
    offerCurrency: "BRL",
  });

  const breadcrumbSchema = generateBreadcrumbsSchema([
    { name: "Início", url: getCanonicalUrl("/") },
    { name: "Maracanã", url: getCanonicalUrl("/maracana-calendario") },
    { name: `${match.home_team} x ${match.away_team}`, url: canonical },
  ]);

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <link rel="canonical" href={canonical} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonical} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        {match.home_team_logo && <meta property="og:image" content={match.home_team_logo} />}
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">{JSON.stringify(schema)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
      </Helmet>

      <Header />

      {/* HERO */}
      <section
        className={`relative pt-32 pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-br ${accentClass} text-white min-h-[85vh] flex flex-col justify-center`}
      >
        {/* Background Image & Overlay */}
        <div 
          className="absolute inset-0 z-0 opacity-40 mix-blend-overlay"
          style={{
            backgroundImage: `url('${heroBackground || "/maracana-hero.webp"}')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-0 z-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        
        {/* Animated Orbs */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-50">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/30 blur-[100px] animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <p className="inline-block text-xs sm:text-sm font-bold tracking-[0.2em] uppercase bg-black/40 border border-white/10 backdrop-blur-md px-6 py-2 rounded-full mb-8 shadow-lg">
            {match.competition || t("mlp_jogo_maracana")}
          </p>

          <div className="flex items-center justify-center gap-4 sm:gap-10 mb-6">
            {match.home_team_logo && (
              <img src={match.home_team_logo} alt={match.home_team} className="w-20 h-20 sm:w-32 sm:h-32 object-contain drop-shadow-2xl" />
            )}
            <span className="font-serif text-2xl sm:text-4xl opacity-80">×</span>
            {match.away_team_logo && (
              <img src={match.away_team_logo} alt={match.away_team} className="w-20 h-20 sm:w-32 sm:h-32 object-contain drop-shadow-2xl" />
            )}
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
            {match.home_team} <span className="opacity-70">x</span> {match.away_team}
          </h1>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm sm:text-base text-white/90 mb-8">
            <span className="flex items-center gap-2"><Calendar className="w-4 h-4" />{formattedDate}</span>
            <span className="flex items-center gap-2"><Clock className="w-4 h-4" />{hour}</span>
            <span className="flex items-center gap-2"><MapPin className="w-4 h-4" />{match.stadium || "Maracanã"}, Rio</span>
          </div>

          {/* Countdown */}
          {!cd.live && (
            <div className="flex justify-center gap-2 sm:gap-3 mb-8">
              {[
                { v: cd.d, l: "Dias" },
                { v: cd.h, l: "Horas" },
                { v: cd.m, l: "Min" },
                { v: cd.s, l: "Seg" },
              ].map((b) => (
                <div key={b.l} className="bg-white/10 backdrop-blur border border-white/20 rounded-xl px-4 py-3 min-w-[68px]">
                  <div className="font-serif text-2xl sm:text-3xl font-bold tabular-nums">{b.v}</div>
                  <div className="text-[10px] sm:text-xs uppercase tracking-widest opacity-70">{b.l}</div>
                </div>
              ))}
            </div>
          )}

          <div className="inline-flex flex-col items-center bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 mb-2 shadow-2xl hover:scale-105 transition-transform duration-300">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70 mb-2">{t("mlp_a_partir_de")}</p>
            <p className="text-5xl sm:text-6xl font-black mb-6 text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70">
              {formatPrice(minPrice)}
            </p>
            <Button asChild size="lg" className="w-full text-lg font-bold h-14 rounded-full bg-white text-black hover:bg-white/90 shadow-[0_0_40px_rgba(255,255,255,0.3)]">
              <Link to={matchUrl}>
                {t("mlp_reservar_agora")} <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* TRUST STRIP */}
      <section className="bg-card border-y border-border py-6">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="flex flex-col items-center gap-1">
            <ShieldCheck className="w-6 h-6 text-primary" />
            <span className="text-xs sm:text-sm font-medium">{t("mlp_pagamento_seguro")}</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Star className="w-6 h-6 text-primary" />
            <span className="text-xs sm:text-sm font-medium">{t("mlp_5_star")}</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Users className="w-6 h-6 text-primary" />
            <span className="text-xs sm:text-sm font-medium">{t("mlp_guia_bilingue")}</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Ticket className="w-6 h-6 text-primary" />
            <span className="text-xs sm:text-sm font-medium">{t("mlp_ingresso_garantido")}</span>
          </div>
        </div>
      </section>

      {/* SECTORS / PACKAGES */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs uppercase tracking-[0.25em] text-primary font-semibold mb-3">{t("mlp_setores_pacotes")}</p>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold mb-3">{t("mlp_escolha_experiencia")}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t("mlp_setores_disponiveis").replace("{home}", match.home_team).replace("{away}", match.away_team)}
            </p>
          </div>

          {validPkgs.length === 0 ? (
            <div className="text-center text-muted-foreground py-10">
              {t("mlp_carregando_setores")}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {validPkgs.map((p) => {
                const pt = p.package_type!;
                const remaining = (p.total_stock || 0) - (p.sold_count || 0);
                const lowStock = remaining > 0 && remaining <= 5;
                const isPremium = pt.slug?.includes('premium') || pt.slug?.includes('club');
                
                const title = language === 'en' && pt.name_en ? pt.name_en : language === 'es' && pt.name_es ? pt.name_es : pt.name_pt;
                const description = language === 'en' && pt.description_en ? pt.description_en : language === 'es' && pt.description_es ? pt.description_es : pt.description_pt;

                return (
                  <div
                    key={p.id}
                    className={`relative bg-card rounded-3xl p-8 flex flex-col transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl ${
                      isPremium 
                        ? 'border-2 shadow-xl' 
                        : 'border border-border shadow-lg'
                    }`}
                    style={isPremium ? { borderColor: pt.highlight_color || 'hsl(var(--primary))' } : {}}
                  >
                    {isPremium && (
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-3xl pointer-events-none" />
                    )}
                    {pt.badge_pt && (
                      <span
                        className="absolute -top-4 right-8 text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full text-white shadow-lg"
                        style={{ background: pt.highlight_color || "hsl(var(--primary))" }}
                      >
                        {pt.badge_pt}
                      </span>
                    )}
                    <h3 className="font-serif text-2xl font-bold mb-3 mt-2">{title}</h3>
                    <p className="text-sm text-muted-foreground mb-6 flex-1">{description}</p>

                    <ul className="space-y-1.5 mb-5 text-sm">
                      {pt.includes_transfer && (
                        <li className="flex items-start gap-2"><Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />{t("mlp_transfer_ida_volta")}</li>
                      )}
                      <li className="flex items-start gap-2"><Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />{t("mlp_ingresso_garantido")}</li>
                      {pt.includes_parking_access && (
                        <li className="flex items-start gap-2"><Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />{t("mlp_acesso_estacionamento")}</li>
                      )}
                      {pt.includes_food && (
                        <li className="flex items-start gap-2"><Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />{t("mlp_comidas_inclusas")}</li>
                      )}
                      {pt.includes_chopp && (
                        <li className="flex items-start gap-2"><Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />{t("mlp_chopp_liberado")}</li>
                      )}
                      {pt.requires_biometrics === false && (
                        <li className="flex items-start gap-2"><Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />{t("mlp_sem_biometria")}</li>
                      )}
                    </ul>

                    <div className="pt-6 border-t border-border/50">
                      {lowStock && (
                        <p className="text-xs font-bold text-destructive mb-3 animate-pulse bg-destructive/10 inline-block px-2 py-1 rounded">
                          {t("mlp_restam_apenas").replace("{n}", remaining.toString())}
                        </p>
                      )}
                      <div className="flex items-end justify-between mb-6">
                        <div>
                          <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1">{t("mlp_valor_por_pessoa")}</p>
                          <p className="text-3xl font-black">{formatPrice(p.price_brl)}</p>
                        </div>
                      </div>
                      
                      <Button 
                        asChild 
                        className="w-full h-12 text-base font-bold rounded-xl shadow-lg transition-all hover:scale-[1.02]"
                        style={isPremium ? { background: pt.highlight_color || 'hsl(var(--primary))' } : {}}
                      >
                        <Link to={matchUrl}>
                          {t("mlp_selecionar")} <ArrowRight className="w-5 h-5 ml-2" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* YOUTUBE VIDEO GALLERY */}
      {youtubeVideos && youtubeVideos.length > 0 && (
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-black/40 border-t border-white/5">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-serif text-3xl sm:text-4xl font-bold mb-3">
                {t("mlp_videos_experiencia") || "Vídeos da Experiência"}
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {t("mlp_videos_desc") || "Sinta a emoção do Maracanã antes mesmo de chegar ao estádio."}
              </p>
            </div>

            <Carousel className="w-full">
              <CarouselContent>
                {youtubeVideos.map((v) => (
                  <CarouselItem key={v.id} className="basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
                    <div className="group block rounded-2xl overflow-hidden bg-card border border-border hover:border-primary/50 transition-all h-full shadow-lg">
                      <div className="relative aspect-[9/16] bg-black">
                        {activeVideo === v.id ? (
                          <iframe
                            src={`https://www.youtube.com/embed/${v.id}?autoplay=1&rel=0&modestbranding=1`}
                            title={v.title}
                            className="absolute inset-0 w-full h-full border-0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        ) : (
                          <button
                            type="button"
                            onClick={() => setActiveVideo(v.id)}
                            className="absolute inset-0 w-full h-full group"
                          >
                            <img
                              src={`https://img.youtube.com/vi/${v.id}/hqdefault.jpg`}
                              alt={v.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-100"
                              loading="lazy"
                            />
                            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                              <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                                <Play className="w-6 h-6 text-primary-foreground fill-current ml-1" />
                              </div>
                            </div>
                          </button>
                        )}
                      </div>
                      <div className="p-4 bg-card/80 backdrop-blur-sm border-t border-border">
                        <p className="font-semibold text-sm line-clamp-2" title={v.title}>
                          {v.title}
                        </p>
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <div className="hidden sm:block">
                <CarouselPrevious className="-left-4 sm:-left-12 bg-card hover:bg-primary hover:text-primary-foreground border-border" />
                <CarouselNext className="-right-4 sm:-right-12 bg-card hover:bg-primary hover:text-primary-foreground border-border" />
              </div>
            </Carousel>
          </div>
        </section>
      )}

      {/* GALLERY CAROUSEL */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold mb-3">
              {language === 'pt' ? 'Galeria de Fotos' : language === 'es' ? 'Galería de Fotos' : 'Photo Gallery'}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {language === 'pt' ? 'Veja a festa das torcidas no Maracanã.' : language === 'es' ? 'Mira la fiesta de la afición en el Maracaná.' : 'See the fan party at Maracanã.'}
            </p>
          </div>

          <Carousel className="w-full">
            <CarouselContent>
              {galleryImages.map((img, i) => (
                <CarouselItem key={i} className="basis-full sm:basis-1/2 md:basis-1/3">
                  <div className="rounded-2xl overflow-hidden shadow-lg h-[250px]">
                    <img src={img} alt="Maracana Gallery" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" loading="lazy" />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="hidden sm:block">
              <CarouselPrevious className="-left-4 sm:-left-12 bg-card hover:bg-primary hover:text-primary-foreground border-border" />
              <CarouselNext className="-right-4 sm:-right-12 bg-card hover:bg-primary hover:text-primary-foreground border-border" />
            </div>
          </Carousel>
        </div>
      </section>

      {/* YOU MAY ALSO LIKE */}
      {randomTours.length > 0 && (
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-background border-t border-border/50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="font-serif text-3xl sm:text-4xl font-bold mb-3">
                {language === 'pt' ? 'Você também pode gostar' : language === 'es' ? 'También te puede gustar' : 'You May Also Like'}
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {language === 'pt' ? 'Explore outros passeios imperdíveis no Rio de Janeiro.' : language === 'es' ? 'Explora otros tours imperdibles en Río de Janeiro.' : 'Explore other must-see tours in Rio de Janeiro.'}
              </p>
            </div>

            <Carousel className="w-full">
              <CarouselContent>
                {randomTours.map((tour) => (
                  <CarouselItem key={tour.id} className="basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
                    <TourItem tour={tour as TourCardProps} />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <div className="hidden sm:block">
                <CarouselPrevious className="-left-4 sm:-left-12 bg-card hover:bg-primary hover:text-primary-foreground border-border" />
                <CarouselNext className="-right-4 sm:-right-12 bg-card hover:bg-primary hover:text-primary-foreground border-border" />
              </div>
            </Carousel>
          </div>
        </section>
      )}

      {/* FINAL CTA */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-primary/5 border-t border-primary/20">
        <div className="max-w-3xl mx-auto text-center">
          <Ticket className="w-12 h-12 text-primary mx-auto mb-4" />
          <h2 className="font-serif text-3xl sm:text-4xl font-bold mb-3">
            {t("mlp_garanta_experiencia")}
          </h2>
          <p className="text-muted-foreground mb-6">
            {t("mlp_vagas_limitadas").replace("{home}", match.home_team).replace("{away}", match.away_team)}
          </p>
          <Button asChild size="lg" className="text-base">
            <Link to={matchUrl}>
              {t("mlp_ver_disponibilidade")} <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
