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
import { ptBR } from "date-fns/locale";

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
    description_pt: string;
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
                 package_type:package_types(slug, name_pt, description_pt, badge_pt, highlight_color, display_order, includes_transfer, includes_parking_access, includes_food, includes_chopp, requires_biometrics)`)
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
}

export default function MatchLandingPage({
  matchSlug,
  pagePath,
  pageTitle,
  pageDescription,
  heroBackground,
  accentClass = "from-primary to-primary/70",
}: Props) {
  const { data: matches, isLoading } = useMatches();
  const match = matches?.find((m) => m.slug === matchSlug);
  const { data: packages } = usePackages(match?.id);

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
  const formattedDate = format(dateRio, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR });
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
        className={`relative pt-28 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-br ${accentClass} text-white`}
        style={
          heroBackground
            ? {
                backgroundImage: `linear-gradient(rgba(0,0,0,0.65), rgba(0,0,0,0.78)), url('${heroBackground}')`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : undefined
        }
      >
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <p className="inline-block text-xs sm:text-sm font-semibold tracking-[0.2em] uppercase bg-white/15 backdrop-blur px-4 py-1.5 rounded-full mb-6">
            {match.competition || "Jogo no Maracanã"}
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

          <div className="inline-flex flex-col items-center bg-white/10 backdrop-blur border border-white/20 rounded-2xl px-8 py-6 mb-2">
            <p className="text-xs uppercase tracking-widest opacity-80 mb-1">A partir de</p>
            <p className="text-4xl sm:text-5xl font-bold mb-4">
              R$ {Number(minPrice).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
            <Button asChild size="lg" variant="secondary" className="text-base font-bold">
              <Link to={matchUrl}>
                Reservar agora <ArrowRight className="w-5 h-5 ml-2" />
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
            <span className="text-xs sm:text-sm font-medium">Pagamento seguro</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Star className="w-6 h-6 text-primary" />
            <span className="text-xs sm:text-sm font-medium">5★ TripAdvisor</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Users className="w-6 h-6 text-primary" />
            <span className="text-xs sm:text-sm font-medium">Guia bilíngue</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Ticket className="w-6 h-6 text-primary" />
            <span className="text-xs sm:text-sm font-medium">Ingresso garantido</span>
          </div>
        </div>
      </section>

      {/* SECTORS / PACKAGES */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs uppercase tracking-[0.25em] text-primary font-semibold mb-3">Setores e Pacotes</p>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold mb-3">Escolha sua experiência</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Setores disponíveis para {match.home_team} x {match.away_team}. Preços por pessoa em reais.
            </p>
          </div>

          {validPkgs.length === 0 ? (
            <div className="text-center text-muted-foreground py-10">
              Carregando setores disponíveis…
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {validPkgs.map((p) => {
                const pt = p.package_type!;
                const remaining = (p.total_stock || 0) - (p.sold_count || 0);
                const lowStock = remaining > 0 && remaining <= 5;
                return (
                  <div
                    key={p.id}
                    className="relative bg-card border border-border rounded-2xl p-6 flex flex-col hover:shadow-lg hover:-translate-y-1 transition-all"
                  >
                    {pt.badge_pt && (
                      <span
                        className="absolute -top-3 left-6 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full text-white"
                        style={{ background: pt.highlight_color || "hsl(var(--primary))" }}
                      >
                        {pt.badge_pt}
                      </span>
                    )}
                    <h3 className="font-serif text-xl font-bold mb-2 mt-2">{pt.name_pt}</h3>
                    <p className="text-sm text-muted-foreground mb-4 flex-1">{pt.description_pt}</p>

                    <ul className="space-y-1.5 mb-5 text-sm">
                      {pt.includes_transfer && (
                        <li className="flex items-start gap-2"><Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />Transfer ida e volta</li>
                      )}
                      <li className="flex items-start gap-2"><Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />Ingresso garantido</li>
                      {pt.includes_parking_access && (
                        <li className="flex items-start gap-2"><Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />Acesso pelo estacionamento</li>
                      )}
                      {pt.includes_food && (
                        <li className="flex items-start gap-2"><Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />Comidas inclusas</li>
                      )}
                      {pt.includes_chopp && (
                        <li className="flex items-start gap-2"><Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />Chopp Brahma liberado</li>
                      )}
                      {pt.requires_biometrics === false && (
                        <li className="flex items-start gap-2"><Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />Sem biometria</li>
                      )}
                    </ul>

                    <div className="border-t border-border pt-4 mt-auto">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Por pessoa</p>
                      <p className="text-3xl font-bold text-primary mb-3">
                        R$ {Number(p.price_brl).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </p>
                      {lowStock && (
                        <p className="text-xs text-destructive font-semibold mb-2">
                          Apenas {remaining} {remaining === 1 ? "vaga" : "vagas"} restantes
                        </p>
                      )}
                      <Button asChild className="w-full">
                        <Link to={matchUrl}>Reservar este setor</Link>
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-primary/5 border-t border-primary/20">
        <div className="max-w-3xl mx-auto text-center">
          <Ticket className="w-12 h-12 text-primary mx-auto mb-4" />
          <h2 className="font-serif text-3xl sm:text-4xl font-bold mb-3">
            Garanta sua experiência no Maracanã
          </h2>
          <p className="text-muted-foreground mb-6">
            Vagas limitadas para {match.home_team} x {match.away_team}. Reserve agora e viva a emoção do maior estádio do Brasil.
          </p>
          <Button asChild size="lg" className="text-base">
            <Link to={matchUrl}>
              Ver disponibilidade e reservar <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
