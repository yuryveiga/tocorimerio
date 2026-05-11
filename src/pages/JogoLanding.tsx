import { useParams, Link, Navigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Calendar, MapPin, Ticket, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useMatches } from "@/hooks/useMatches";
import { getCanonicalUrl, generateSportsEventSchema, generateBreadcrumbSchema, cleanMatchSlug } from "@/utils/seo";
import { slugify } from "@/utils/slugify";
import { getMatchDateInRio, getMatchHour } from "@/lib/dateUtils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function JogoLanding() {
  const { id } = useParams<{ id: string }>();
  const { data: matches, isLoading } = useMatches();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const match = matches?.find((m) => m.slug === id || m.id === id);

  if (!match) {
    return <Navigate to="/maracana-calendario" replace />;
  }

  const dateRio = getMatchDateInRio(match.match_date);
  const formattedDate = format(dateRio, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  const hour = getMatchHour(match.match_date);
  const title = `${match.home_team} x ${match.away_team} no Maracanã - ${format(dateRio, "dd/MM/yyyy")} | Tocorime Rio`;
  const description = `Ingresso + transfer + guia bilíngue para ${match.home_team} x ${match.away_team} em ${formattedDate} às ${hour} no ${match.stadium || "Maracanã"}. Reserve agora! ✓`;
  const cleanSlug = slugify(match.slug || `${match.home_team}-vs-${match.away_team}`) || match.id;
  const canonical = getCanonicalUrl(`/jogo/${cleanSlug}`);
  const matchUrl = `/match/${cleanMatchSlug(match.slug || match.id)}`;
  const minPrice = match.min_price || match.price || 0;

  const schema = generateSportsEventSchema({
    name: `${match.home_team} x ${match.away_team}`,
    description,
    startDate: match.match_date,
    imageUrl: match.home_team_logo || match.away_team_logo,
    url: canonical,
    homeTeam: match.home_team,
    awayTeam: match.away_team,
    venueName: match.stadium || "Estádio do Maracanã",
    offerUrl: `${getCanonicalUrl(matchUrl)}`,
    offerPrice: minPrice,
    offerCurrency: "BRL",
  });

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Início", path: "/" },
    { name: "Maracanã", path: "/maracana-calendario" },
    { name: `${match.home_team} x ${match.away_team}`, path: `/jogo/${cleanSlug}` },
  ]);

  const included = (match.included_json || []).map((i: any) => i.text).filter(Boolean);

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={canonical} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonical} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        {match.home_team_logo && <meta property="og:image" content={match.home_team_logo} />}
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">{JSON.stringify(schema)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
      </Helmet>

      <Header />

      <main className="pt-24 pb-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero */}
          <header className="text-center mb-10">
            <p className="text-sm uppercase tracking-widest text-primary font-semibold mb-3">
              {match.competition || "Jogo no Maracanã"}
            </p>
            <h1 className="font-serif text-3xl sm:text-5xl font-bold text-foreground mb-6">
              {match.home_team} <span className="text-primary">x</span> {match.away_team}
            </h1>

            <div className="flex flex-wrap items-center justify-center gap-6 text-muted-foreground mb-8">
              <span className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                {formattedDate} • {hour}
              </span>
              <span className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                {match.stadium || "Maracanã"}, Rio de Janeiro
              </span>
            </div>

            {match.home_team_logo && match.away_team_logo && (
              <div className="flex items-center justify-center gap-8 my-8">
                <img src={match.home_team_logo} alt={match.home_team} className="w-24 h-24 sm:w-32 sm:h-32 object-contain" loading="lazy" />
                <span className="text-3xl font-bold text-muted-foreground">VS</span>
                <img src={match.away_team_logo} alt={match.away_team} className="w-24 h-24 sm:w-32 sm:h-32 object-contain" loading="lazy" />
              </div>
            )}

            <div className="bg-card border border-border rounded-2xl p-6 max-w-md mx-auto mb-6">
              <p className="text-sm text-muted-foreground mb-1">A partir de</p>
              <p className="text-4xl font-bold text-primary mb-4">
                R$ {Number(minPrice).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
              <Button asChild size="lg" className="w-full text-base">
                <Link to={matchUrl}>
                  Ver disponibilidade e comprar
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
            </div>
          </header>

          {/* Description */}
          {match.description_pt && (
            <section className="prose prose-lg max-w-3xl mx-auto mb-12 text-foreground">
              <h2 className="font-serif text-2xl font-bold mb-4">Sobre o jogo</h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {match.description_pt}
              </p>
            </section>
          )}

          {/* Included */}
          {included.length > 0 && (
            <section className="max-w-3xl mx-auto mb-12">
              <h2 className="font-serif text-2xl font-bold mb-6 text-center">O que está incluso</h2>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {included.map((item: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-3 bg-muted/40 rounded-xl p-4">
                    <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Final CTA */}
          <section className="text-center bg-primary/5 border border-primary/20 rounded-3xl p-10 max-w-3xl mx-auto">
            <Ticket className="w-12 h-12 text-primary mx-auto mb-4" />
            <h2 className="font-serif text-3xl font-bold mb-3">
              Garanta sua experiência inesquecível
            </h2>
            <p className="text-muted-foreground mb-6">
              Vagas limitadas para {match.home_team} x {match.away_team}. Reserve com antecedência.
            </p>
            <Button asChild size="lg">
              <Link to={matchUrl}>
                Ver pacotes e reservar
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
