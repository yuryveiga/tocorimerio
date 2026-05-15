import { useEffect, useState, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { useLocale } from "@/contexts/LocaleContext";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@supabase/supabase-js";
import { useCurrency } from "@/contexts/CurrencyContext";
import { getCanonicalUrl, getHreflangLinks, generateSportsEventSchema, generateBreadcrumbsSchema } from "@/utils/seo";
import { LovableMatch } from "@/types";
import { buildWhatsappLink } from "@/lib/whatsappMessage";

// Partner Project Config
const MARACANA_PROJECT_URL = "https://mwxbskzggzznxvkwgrnz.supabase.co";
const MARACANA_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13eGJza3pnZ3p6bnh2a3dncm56Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzNjE5OTUsImV4cCI6MjA4ODkzNzk5NX0.EFfaaN79uifOMgFdIZlQ5C8c-HQH-YodNGWf0MEcf9o";
const partnerSupabase = createClient(MARACANA_PROJECT_URL, MARACANA_ANON_KEY);

const TARGET_DATE = new Date('2026-05-31T18:30:00-03:00');
const PAGE_PATH = "/brasil-x-panama-maio-maracana";

const BrasilPanamaMaracana = () => {
  const { t, language, setLanguage, currency, setCurrency, formatPrice } = useLocale();
  const { rates } = useCurrency();
  const [timeLeft, setTimeLeft] = useState({
    days: "—",
    hours: "—",
    minutes: "—",
    seconds: "—",
    isLive: false
  });

  const MATCH_SLUG = "brasil-vs-panam-2026-05-31";

  const { data: match } = useQuery({
    queryKey: ["partner-match", MATCH_SLUG],
    queryFn: async () => {
      const { data, error } = await partnerSupabase
        .from("matches")
        .select("*")
        .eq("slug", MATCH_SLUG)
        .single();
      
      if (error) throw error;
      return data as LovableMatch;
    }
  });

  const { data: partnerPackages } = useQuery({
    queryKey: ["partner-packages", match?.id],
    queryFn: async () => {
      if (!match?.id) return [];
      const { data, error } = await partnerSupabase
        .from("match_packages")
        .select("id, price_brl, price_usd, price_eur, price_gbp, total_stock, sold_count, is_active, is_on_request, package_type:package_type_id (id, slug, display_order, name_pt, name_en, name_es, description_pt, description_en, description_es, badge_pt, badge_en, badge_es, highlight_color, includes_transfer, includes_food, includes_drinks, includes_parking_access)")
        .eq("match_id", match.id);
      
      if (error) return [];
      return (data || [])
        .filter((p: any) => p.is_active && (p.price_brl ?? 0) > 0)
        .sort((a: any, b: any) => (a.package_type?.display_order ?? 99) - (b.package_type?.display_order ?? 99));
    },
    enabled: !!match?.id,
  });


  const finalSectors = useMemo(() => {
    if (!partnerPackages || partnerPackages.length === 0) return [];
    
    return partnerPackages.map((p: any) => {
      const pt = p.package_type;
      const title = language === 'en' ? (pt?.name_en || pt?.name_pt) : language === 'es' ? (pt?.name_es || pt?.name_pt) : pt?.name_pt;
      const description = language === 'en' ? pt?.description_en : language === 'es' ? pt?.description_es : pt?.description_pt;
      const remaining = Math.max(0, (p.total_stock || 0) - (p.sold_count || 0));
      
      return {
        id: pt?.slug || String(p.id),
        name: title || "Setor",
        price: Number(p.price_brl) || 0,
        description,
        remaining,
        is_on_request: p.is_on_request,
        premium: pt?.slug?.includes('premium') || pt?.slug?.includes('club') || pt?.slug?.includes('mais'),
        perks: [] as string[]
      };
    });
  }, [partnerPackages, language]);

  const renderBoldText = (text: string) => {
    if (!text) return "";
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} style={{ color: 'var(--yellow)', fontWeight: '700' }}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const diff = TARGET_DATE.getTime() - now.getTime();
      
      if (diff <= 0) {
        setTimeLeft(prev => ({ ...prev, isLive: true }));
        return;
      }

      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);

      const pad = (n: number) => String(n).padStart(2, '0');

      setTimeLeft({
        days: pad(d),
        hours: pad(h),
        minutes: pad(m),
        seconds: pad(s),
        isLive: false
      });
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const revealEls = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          observer.unobserve(e.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    
    revealEls.forEach(el => observer.observe(el));

    const handleScroll = () => {
      const nav = document.getElementById('nav-bp');
      if (nav) {
        if (window.scrollY > 80) {
          nav.style.top = '0';
        } else {
          nav.style.top = '38px';
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const sectors = [
    { id: 'leste-inferior', nameKey: 'bp_sector_leste_inf', descKey: 'bp_sector_leste_inf_desc', premium: true, perks: ['bp_perk_padrão', 'bp_perk_vista'] },
    { id: 'oeste-inferior', nameKey: 'bp_sector_oeste_inf', descKey: 'bp_sector_oeste_inf_desc', premium: false, perks: ['bp_perk_padrão', 'bp_perk_vista'] },
    { id: 'leste-superior', nameKey: 'bp_sector_leste_sup', descKey: 'bp_sector_leste_sup_desc', premium: false, perks: ['bp_perk_vista', 'bp_perk_best_value'] },
    { id: 'norte', nameKey: 'bp_sector_norte_sul', descKey: 'bp_sector_norte_sul_desc', premium: false, perks: ['bp_perk_best_value'] },
  ];

  return (
    <div className="brasil-panama-page">
      <Helmet>
        <title>{t('bp_title')}</title>
        <meta name="description" content={t('bp_desc')} />
        <link rel="canonical" href={getCanonicalUrl(PAGE_PATH)} />
        {getHreflangLinks(PAGE_PATH).map((l) => (
          <link key={l.hreflang} rel="alternate" hrefLang={l.hreflang} href={l.href} />
        ))}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={getCanonicalUrl(PAGE_PATH)} />
        <meta property="og:title" content={t('bp_title')} />
        <meta property="og:description" content={t('bp_desc')} />
        <meta property="og:site_name" content="Tocorime Rio" />
        <meta name="twitter:card" content="summary_large_image" />

        <script type="application/ld+json">
          {JSON.stringify(generateSportsEventSchema({
            name: "Brasil vs Panamá — Amigável Internacional 2026",
            description: "Partida amistosa entre Brasil e Panamá no Estádio do Maracanã, Rio de Janeiro.",
            startDate: TARGET_DATE.toISOString(),
            url: getCanonicalUrl(PAGE_PATH),
            homeTeam: "Brasil",
            awayTeam: "Panamá",
            venueName: "Estádio do Maracanã",
            offerUrl: `https://tocorimerio.com/match/${MATCH_SLUG}`,
          }))}
        </script>

        <script type="application/ld+json">
          {JSON.stringify(generateBreadcrumbsSchema([
            { name: t("inicio"), url: getCanonicalUrl("/") },
            { name: "Maracanã Matchday", url: getCanonicalUrl("/passeio/maracana-matchday") },
            { name: "Brasil vs Panamá", url: getCanonicalUrl(PAGE_PATH) },
          ]))}
        </script>

        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,700;0,900;1,700&display=swap" rel="stylesheet" />
      </Helmet>

      <style dangerouslySetInnerHTML={{ __html: `
        .brasil-panama-page {
          --teal:        #2A9D8F;
          --teal-dark:   #1e7a6e;
          --teal-glow:   rgba(42,157,143,0.18);
          --yellow:      #F4C430;
          --yellow-soft: #f9d96a;
          --green-br:    #009C3B;
          --blue-br:     #003087;
          --white:       #FFFFFF;
          --off-white:   #F7F5F0;
          --ink:         #0E0E0F;
          --ink-2:       #17181a;
          --ink-3:       #222326;
          --ink-4:       #2e3035;
          --muted:       #8a8d96;
          --muted-2:     #5a5d66;
          --border:      rgba(255,255,255,0.07);
          --border-2:    rgba(255,255,255,0.12);
          --radius:      12px;
          --radius-sm:   8px;
          --yellow:      #FFD700;
          --teal:        #2A9D8F;
          
          background: var(--ink);
          color: var(--white);
          font-family: 'Sora', system-ui, sans-serif;
          font-size: 16px;
          line-height: 1.6;
          overflow-x: hidden;
        }

        .brasil-panama-page * { margin: 0; padding: 0; box-sizing: border-box; }
        .brasil-panama-page img { display: block; max-width: 100%; }
        .brasil-panama-page a { color: inherit; text-decoration: none; }

        /* TICKER */
        .brasil-panama-page .ticker-wrap {
          background: var(--yellow);
          overflow: hidden;
          white-space: nowrap;
          height: 38px;
          display: flex;
          align-items: center;
          position: relative;
          z-index: 201;
        }
        .brasil-panama-page .ticker-track {
          display: inline-flex;
          animation: ticker-bp 28s linear infinite;
        }
        @keyframes ticker-bp {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .brasil-panama-page .ticker-item {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          padding: 0 32px;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: .12em;
          text-transform: uppercase;
          color: var(--ink);
        }
        .brasil-panama-page .ticker-dot { width: 4px; height: 4px; background: var(--ink); border-radius: 50%; opacity: .4; flex-shrink: 0; }

        /* NAV */
        .brasil-panama-page nav {
          position: fixed; top: 38px; left: 0; right: 0; z-index: 200;
          padding: 14px 32px;
          display: flex; align-items: center; justify-content: space-between;
          background: rgba(14,14,15,.88);
          backdrop-filter: blur(20px) saturate(1.4);
          border-bottom: 1px solid var(--border);
          transition: top .3s;
        }
        .brasil-panama-page .nav-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          height: 32px;
        }
        .brasil-panama-page .nav-logo img {
          height: 100%;
          width: auto;
          object-fit: contain;
        }
        .brasil-panama-page .nav-logo span {
          color: var(--white);
          font-weight: 800;
          font-size: 16px;
          letter-spacing: -0.01em;
        }
        .brasil-panama-page .nav-right { display: flex; align-items: center; gap: 16px; }
        .brasil-panama-page .nav-lang-btn {
          background: rgba(255,255,255,0.05);
          border: 1px solid var(--border);
          color: var(--muted);
          font-size: 11px;
          font-weight: 700;
          padding: 6px 12px;
          border-radius: 100px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          text-transform: uppercase;
        }
        .brasil-panama-page .nav-lang-btn:hover { border-color: var(--teal); color: var(--white); }
        .brasil-panama-page .nav-link {
          font-size: 13px;
          font-weight: 500;
          color: var(--muted);
          transition: color .2s;
        }
        .brasil-panama-page .nav-link:hover { color: var(--white); }
        .brasil-panama-page .nav-btn {
          background: var(--teal);
          color: var(--white);
          font-size: 13px;
          font-weight: 700;
          padding: 9px 20px;
          border-radius: 100px;
          transition: background .2s, transform .15s;
        }
        .brasil-panama-page .nav-btn:hover { background: var(--teal-dark); transform: translateY(-1px); }

        /* HERO */
        .brasil-panama-page .hero {
          min-height: 100vh;
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
          padding: 140px 24px 80px;
          overflow: hidden;
        }

        .brasil-panama-page .hero-bg {
          position: absolute; inset: 0; z-index: 0;
        }
        .brasil-panama-page .hero-bg img {
          position: absolute; inset: 0;
          width: 100%; height: 100%;
          object-fit: cover;
          opacity: 0.6;
        }
        .brasil-panama-page .hero-bg-grad {
          position: absolute; inset: 0;
          background:
            radial-gradient(ellipse 90% 70% at 50% -10%, rgba(0,155,59,0.3) 0%, transparent 60%),
            radial-gradient(ellipse 60% 50% at 15% 80%,  rgba(42,157,143,0.2) 0%, transparent 60%),
            radial-gradient(ellipse 50% 50% at 85% 70%,  rgba(0,48,135,0.2) 0%, transparent 60%),
            linear-gradient(to bottom, rgba(14,14,15,0.2) 0%, var(--ink) 100%);
          z-index: 1;
        }
        .brasil-panama-page .hero-bg-grid {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.025) 1px, transparent 1px);
          background-size: 60px 60px;
          mask-image: radial-gradient(ellipse 80% 70% at 50% 50%, black 0%, transparent 75%);
          z-index: 1;
        }
        .brasil-panama-page .hero-bg-arc {
          position: absolute;
          bottom: -1px; left: -5%; right: -5%;
          height: 220px;
          border-radius: 50% 50% 0 0 / 100% 100% 0 0;
          background: linear-gradient(to top, var(--ink-2), transparent);
          z-index: 2;
        }

        .brasil-panama-page .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
          z-index: 1;
        }
        .brasil-panama-page .orb-1 { width: 500px; height: 500px; top: -180px; left: -100px; background: rgba(0,155,59,.12); animation: float-bp 8s ease infinite; }
        .brasil-panama-page .orb-2 { width: 400px; height: 400px; top: 60px; right: -120px; background: rgba(42,157,143,.1); animation: float-bp 10s ease 2s infinite; }
        .brasil-panama-page .orb-3 { width: 350px; height: 350px; bottom: 50px; left: 30%; background: rgba(244,196,48,.06); animation: float-bp 12s ease 1s infinite; }

        @keyframes float-bp {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-6px); }
        }

        .brasil-panama-page .hero-inner {
          position: relative; z-index: 3;
          max-width: 900px;
          animation: fadeUp-bp .9s cubic-bezier(.16,1,.3,1) both;
        }
        @keyframes fadeUp-bp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .brasil-panama-page .comp-pill {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.12);
          padding: 6px 14px 6px 10px;
          border-radius: 100px;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--muted);
          margin-bottom: 36px;
        }
        .brasil-panama-page .comp-dot {
          position: relative;
          width: 8px; height: 8px;
          border-radius: 50%;
          background: var(--green-br);
          flex-shrink: 0;
        }
        .brasil-panama-page .comp-dot::before {
          content: '';
          position: absolute; inset: -3px;
          border-radius: 50%;
          background: var(--green-br);
          animation: pulse-ring-bp 1.8s ease-out infinite;
        }
        @keyframes pulse-ring-bp {
          0%   { transform: scale(1); opacity: 0.6; }
          70%  { transform: scale(1.8); opacity: 0; }
          100% { transform: scale(1.8); opacity: 0; }
        }

        .brasil-panama-page .teams-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: clamp(16px, 4vw, 60px);
          margin-bottom: 24px;
        }
        .brasil-panama-page .team {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          width: 180px;
        }
        .brasil-panama-page .team-crest {
          width: clamp(80px, 15vw, 140px);
          height: clamp(80px, 15vw, 140px);
          object-fit: contain;
          filter: drop-shadow(0 8px 24px rgba(0,0,0,0.5));
        }
        .brasil-panama-page .team-name {
          font-family: 'Playfair Display', serif;
          font-size: clamp(24px, 5.5vw, 52px);
          font-weight: 900;
          letter-spacing: -0.02em;
          line-height: 1;
        }
        .brasil-panama-page .team-name.brazil { color: var(--yellow); }
        .brasil-panama-page .team-name.panama { color: var(--white); opacity: 0.75; }
        .brasil-panama-page .team-country {
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--muted);
        }
        .brasil-panama-page .vs-center {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          flex-shrink: 0;
        }
        .brasil-panama-page .vs-line { width: 1px; height: 44px; background: linear-gradient(to bottom, transparent, var(--border-2), transparent); }
        .brasil-panama-page .vs-label {
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--teal);
        }

        .brasil-panama-page .hero-headline {
          font-size: clamp(14px, 2.5vw, 18px);
          font-weight: 400;
          color: var(--muted);
          margin-bottom: 36px;
          line-height: 1.5;
        }
        .brasil-panama-page .hero-headline strong { color: var(--yellow); font-weight: 700; }

        .brasil-panama-page .meta-chips {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 10px;
          margin-bottom: 44px;
        }
        .brasil-panama-page .chip {
          display: inline-flex; align-items: center; gap: 7px;
          background: var(--ink-3);
          border: 1px solid var(--border-2);
          padding: 8px 16px;
          border-radius: 100px;
          font-size: 13px;
          font-weight: 500;
          color: var(--white);
        }
        .brasil-panama-page .chip-icon { font-size: 14px; }

        .brasil-panama-page .countdown-wrap {
          display: flex;
          justify-content: center;
          gap: 6px;
          margin-bottom: 48px;
        }
        .brasil-panama-page .cd-unit {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          background: var(--ink-3);
          border: 1px solid var(--border-2);
          border-radius: var(--radius-sm);
          padding: 14px 20px 10px;
          min-width: 72px;
        }
        .brasil-panama-page .cd-num {
          font-family: 'Playfair Display', serif;
          font-size: clamp(28px, 5vw, 42px);
          font-weight: 900;
          line-height: 1;
          color: var(--yellow);
          font-variant-numeric: tabular-nums;
        }
        .brasil-panama-page .cd-label {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--muted);
        }
        .brasil-panama-page .cd-colon {
          font-family: 'Playfair Display', serif;
          font-size: 36px;
          font-weight: 900;
          color: var(--muted-2);
          align-self: flex-start;
          padding-top: 14px;
          line-height: 1;
        }

        .brasil-panama-page .hero-ctas {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 12px;
        }
        .brasil-panama-page .btn-main {
          display: inline-flex; align-items: center; gap: 8px;
          background: linear-gradient(135deg, var(--teal) 0%, var(--teal-dark) 100%);
          color: var(--white);
          font-size: 15px;
          font-weight: 700;
          padding: 16px 34px;
          border-radius: 100px;
          border: none; cursor: pointer;
          box-shadow: 0 4px 24px rgba(42,157,143,0.35);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .brasil-panama-page .btn-main:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(42,157,143,0.45);
        }
        .brasil-panama-page .btn-ghost {
          display: inline-flex; align-items: center; gap: 8px;
          background: transparent;
          color: var(--muted);
          font-size: 15px;
          font-weight: 600;
          padding: 16px 28px;
          border-radius: 100px;
          border: 1px solid var(--border-2);
          cursor: pointer;
          transition: color 0.2s, border-color 0.2s;
        }
        .brasil-panama-page .btn-ghost:hover { color: var(--white); border-color: var(--border-2); }

        .brasil-panama-page .hero-scroll {
          position: absolute; bottom: 32px; left: 50%; transform: translateX(-50%);
          z-index: 4;
          display: flex; flex-direction: column; align-items: center; gap: 8px;
          color: var(--muted);
          animation: float-bp 2.5s ease infinite;
        }
        .brasil-panama-page .hero-scroll span { font-size: 10px; font-weight: 600; letter-spacing: 0.16em; text-transform: uppercase; }
        .brasil-panama-page .scroll-caret {
          width: 20px; height: 20px;
          border-right: 2px solid currentColor;
          border-bottom: 2px solid currentColor;
          transform: rotate(45deg);
          opacity: 0.5;
        }

        .brasil-panama-page .trust-bar {
          background: var(--ink-2);
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
          padding: 22px 24px;
        }
        .brasil-panama-page .trust-inner {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          align-items: center;
          gap: 32px;
        }
        .brasil-panama-page .trust-item {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 13px;
          color: var(--muted);
        }
        .brasil-panama-page .trust-item strong { color: var(--white); font-weight: 700; }
        .brasil-panama-page .trust-icon { font-size: 18px; }
        .brasil-panama-page .trust-div { width: 1px; height: 24px; background: var(--border); }

        .brasil-panama-page .section { padding: 96px 24px; }
        .brasil-panama-page .section-alt { background: var(--ink-2); }
        .brasil-panama-page .eyebrow {
          display: inline-flex; align-items: center; gap: 8px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--teal);
          margin-bottom: 14px;
          justify-content: center;
        }
        .brasil-panama-page .eyebrow::before {
          content: '';
          display: block;
          width: 24px; height: 2px;
          background: var(--teal);
          border-radius: 2px;
        }
        .brasil-panama-page .section-h {
          font-family: 'Playfair Display', serif;
          font-size: clamp(28px, 4.5vw, 46px);
          font-weight: 900;
          line-height: 1.12;
          letter-spacing: -0.02em;
          margin-bottom: 18px;
          text-align: inherit;
        }
        .brasil-panama-page .section-sub {
          font-size: 16px;
          color: var(--muted);
          max-width: 540px;
          line-height: 1.7;
          margin-left: auto;
          margin-right: auto;
          text-align: inherit;
        }

        .brasil-panama-page .video-section {
          background: var(--ink);
          padding-bottom: 0;
        }
        .brasil-panama-page .video-container {
          max-width: 1000px;
          margin: 0 auto;
          aspect-ratio: 16 / 9;
          background: var(--ink-2);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          overflow: hidden;
          box-shadow: 0 24px 60px rgba(0,0,0,0.5);
        }
        .brasil-panama-page .video-container iframe {
          width: 100%; height: 100%;
          border: none;
        }

        .brasil-panama-page .sectors-section { background: var(--ink); }
        .brasil-panama-page .sectors-header { max-width: 640px; margin: 0 auto 52px; text-align: center; display: flex; flex-direction: column; align-items: center; }
        .brasil-panama-page .section-header-center { text-align: center; margin-bottom: 52px; display: flex; flex-direction: column; align-items: center; }

        /* SECTOR CARDS NEW DESIGN */
        .brasil-panama-page .sectors-grid {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 32px;
          max-width: 1200px;
          margin: 0 auto;
          width: 100%;
        }
        .brasil-panama-page .sector-card {
          flex: 1 1 360px;
          max-width: 450px;
          background: var(--ink-2);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 32px;
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 24px;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .brasil-panama-page .sector-card:hover {
          background: var(--ink-3);
          transform: translateY(-8px);
          border-color: var(--teal);
          box-shadow: 0 20px 40px rgba(0,0,0,0.4);
        }
        .brasil-panama-page .sector-card.premium {
          border: 1px solid rgba(42,157,143,0.3);
          background: linear-gradient(135deg, rgba(42,157,143,0.05) 0%, var(--ink-2) 100%);
        }
        .brasil-panama-page .sector-header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .brasil-panama-page .sector-badge {
          background: var(--ink-4);
          border: 1px solid var(--border-2);
          color: var(--muted);
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 4px 12px;
          border-radius: 100px;
        }
        .brasil-panama-page .sector-card.premium .sector-badge {
          background: rgba(42,157,143,0.1);
          border-color: var(--teal);
          color: var(--teal);
        }
        .brasil-panama-page .sector-urgency {
          font-size: 11px;
          font-weight: 700;
          color: #ff4d4f;
        }
        .brasil-panama-page .sector-top {
          display: flex;
          gap: 20px;
          align-items: center;
        }
        .brasil-panama-page .sector-icon-wrap {
          width: 52px;
          height: 52px;
          background: var(--ink-3);
          border: 1px solid var(--border-2);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
        }
        .brasil-panama-page .sector-name-wrap {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .brasil-panama-page .sector-name {
          font-size: 20px;
          font-weight: 800;
          color: var(--white);
        }
        .brasil-panama-page .sector-location {
          font-size: 13px;
          color: var(--muted);
        }
        .brasil-panama-page .sector-price-section {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .brasil-panama-page .sector-price {
          font-family: 'Playfair Display', serif;
          font-size: 40px;
          font-weight: 900;
          color: var(--yellow);
          line-height: 1;
        }
        .brasil-panama-page .sector-price-sub {
          font-size: 12px;
          color: var(--muted-2);
          font-weight: 500;
        }
        .brasil-panama-page .sector-features {
          display: flex;
          flex-direction: column;
          gap: 12px;
          flex: 1;
        }
        .brasil-panama-page .feature-item {
          display: flex;
          gap: 12px;
          align-items: flex-start;
          font-size: 14px;
          color: var(--muted);
          line-height: 1.4;
        }
        .brasil-panama-page .feature-item .check {
          color: var(--teal);
          font-weight: 800;
          flex-shrink: 0;
        }
        .brasil-panama-page .sector-cta-new {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          background: var(--teal);
          color: var(--white);
          border-radius: var(--radius-sm);
          font-size: 14px;
          font-weight: 800;
          transition: all 0.2s;
          text-decoration: none;
          border: none;
          width: 100%;
          cursor: pointer;
        }
        .brasil-panama-page .sector-cta-new:hover {
          background: var(--teal-dark);
          transform: scale(1.02);
        }
        .brasil-panama-page .sector-divider {
          height: 1px;
          background: var(--border);
          margin: 8px 0;
        }

        .brasil-panama-page .addon-note {
          margin: 20px auto 0;
          padding: 18px 22px;
          background: rgba(42,157,143,0.08);
          border: 1px solid rgba(42,157,143,0.2);
          border-radius: var(--radius-sm);
          font-size: 13px;
          color: var(--muted);
          line-height: 1.6;
          max-width: 960px;
        }
        .brasil-panama-page .addon-note strong { color: var(--teal); }

        .brasil-panama-page .included-layout {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 80px;
          align-items: center;
          max-width: 1040px;
          margin: 0 auto;
        }
        @media (max-width: 760px) { .brasil-panama-page .included-layout { grid-template-columns: 1fr; gap: 48px; } }

        .brasil-panama-page .included-sticky { position: sticky; top: 120px; }
        .brasil-panama-page .giant-check {
          font-size: 80px;
          line-height: 1;
          margin-bottom: 20px;
        }

        .brasil-panama-page .includes-list { display: flex; flex-direction: column; gap: 0; }
        .brasil-panama-page .include-row {
          display: flex;
          gap: 20px;
          align-items: flex-start;
          padding: 24px 0;
          border-bottom: 1px solid var(--border);
        }
        .brasil-panama-page .include-row:last-child { border-bottom: none; }
        .brasil-panama-page .inc-icon-wrap {
          width: 44px; height: 44px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          background: var(--ink-3);
          border: 1px solid var(--border-2);
          border-radius: var(--radius-sm);
          font-size: 20px;
        }
        .brasil-panama-page .inc-title {
          font-size: 15px;
          font-weight: 700;
          color: var(--white);
          margin-bottom: 4px;
        }
        .brasil-panama-page .inc-desc {
          font-size: 13px;
          color: var(--muted);
          line-height: 1.6;
        }

        .brasil-panama-page .info-strip {
          background: var(--ink-3);
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
          padding: 36px 24px;
        }
        .brasil-panama-page .info-strip-inner {
          max-width: 960px; margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 32px;
        }
        .brasil-panama-page .info-col { display: flex; flex-direction: column; gap: 4px; }
        .brasil-panama-page .info-col-label {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--muted);
        }
        .brasil-panama-page .info-col-val {
          font-size: 17px;
          font-weight: 700;
          color: var(--white);
        }
        .brasil-panama-page .info-col-sub {
          font-size: 12px;
          color: var(--muted);
        }

        .brasil-panama-page .reviews-header {
          text-align: center;
          margin-bottom: 52px;
        }
        .brasil-panama-page .rating-hero {
          display: inline-flex;
          align-items: center;
          gap: 20px;
          background: var(--ink-3);
          border: 1px solid var(--border-2);
          border-radius: var(--radius);
          padding: 20px 32px;
          margin-bottom: 44px;
        }
        .brasil-panama-page .rating-big {
          font-family: 'Playfair Display', serif;
          font-size: 52px;
          font-weight: 900;
          color: var(--yellow);
          line-height: 1;
        }
        .brasil-panama-page .rating-right { text-align: left; }
        .brasil-panama-page .stars-row { color: var(--yellow); font-size: 18px; letter-spacing: 2px; }
        .brasil-panama-page .rating-count { font-size: 13px; color: var(--muted); margin-top: 2px; }
        .brasil-panama-page .reviews-grid {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 32px;
          max-width: 1200px;
          margin: 0 auto;
          width: 100%;
        }
        .brasil-panama-page .review-card {
          flex: 1 1 320px;
          max-width: 400px;
          background: var(--ink-2);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 28px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .brasil-panama-page .review-stars { color: var(--yellow); font-size: 13px; letter-spacing: 2px; }
        .brasil-panama-page .review-text {
          font-size: 14px;
          color: var(--muted);
          line-height: 1.7;
          font-style: italic;
          flex: 1;
        }
        .brasil-panama-page .review-author { display: flex; flex-direction: column; gap: 2px; }
        .brasil-panama-page .review-name { font-size: 14px; font-weight: 700; color: var(--white); }
        .brasil-panama-page .review-meta { font-size: 12px; color: var(--muted-2); }

        .brasil-panama-page .steps-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 2px;
          background: var(--border);
          border-radius: var(--radius);
          overflow: hidden;
          max-width: 1200px;
          margin: 52px auto 0;
          justify-content: center;
        }
        .brasil-panama-page .step-card {
          background: var(--ink-2);
          padding: 32px 24px;
          position: relative;
          transition: background 0.25s;
        }
        .brasil-panama-page .step-card:hover { background: var(--ink-3); }
        .brasil-panama-page .step-num {
          font-family: 'Playfair Display', serif;
          font-size: 56px;
          font-weight: 900;
          color: rgba(42,157,143,0.12);
          line-height: 1;
          position: absolute;
          top: 16px; right: 16px;
        }
        .brasil-panama-page .step-icon { font-size: 28px; margin-bottom: 16px; }
        .brasil-panama-page .step-title {
          font-size: 14px;
          font-weight: 700;
          color: var(--white);
          margin-bottom: 8px;
        }
        .brasil-panama-page .step-desc { font-size: 13px; color: var(--muted); line-height: 1.65; }

        .brasil-panama-page .final-cta {
          background:
            radial-gradient(ellipse 100% 80% at 50% 110%, rgba(0,155,59,0.2) 0%, transparent 55%),
            radial-gradient(ellipse 60% 50% at 80% 20%, rgba(42,157,143,0.12) 0%, transparent 50%),
            var(--ink);
          padding: 120px 24px;
          text-align: center;
        }
        .brasil-panama-page .final-cta .section-h { font-size: clamp(36px, 6vw, 64px); margin-bottom: 12px; }
        .brasil-panama-page .final-cta-sub { font-size: 17px; color: var(--muted); margin-bottom: 40px; max-width: 500px; margin-left: auto; margin-right: auto; }
        .brasil-panama-page .final-note { font-size: 12px; color: var(--muted-2); margin-top: 20px; }

        .brasil-panama-page footer {
          background: var(--ink-2);
          border-top: 1px solid var(--border);
          padding: 36px 32px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 20px;
        }
        .brasil-panama-page footer .nav-logo { height: 28px; }
        .brasil-panama-page .footer-links {
          display: flex; gap: 24px; flex-wrap: wrap;
        }
        .brasil-panama-page .footer-links a {
          font-size: 12px;
          font-weight: 500;
          color: var(--muted-2);
          transition: color 0.2s;
        }
        .brasil-panama-page .footer-links a:hover { color: var(--teal); }
        .brasil-panama-page .footer-copy { font-size: 12px; color: var(--muted-2); }

        .brasil-panama-page .reveal {
          opacity: 0;
          transform: translateY(32px);
          transition: opacity 0.65s cubic-bezier(0.16,1,0.3,1), transform 0.65s cubic-bezier(0.16,1,0.3,1);
        }
        .brasil-panama-page .reveal.in { opacity: 1; transform: translateY(0); }
        .brasil-panama-page .reveal-d1 { transition-delay: 0.08s; }
        .brasil-panama-page .reveal-d2 { transition-delay: 0.16s; }
        .brasil-panama-page .reveal-d3 { transition-delay: 0.24s; }
        .brasil-panama-page .reveal-d4 { transition-delay: 0.32s; }
        .brasil-panama-page .reveal-d5 { transition-delay: 0.40s; }



        @media (max-width: 640px) {
          .brasil-panama-page nav { top: 38px; padding: 12px 16px; }
          .brasil-panama-page .nav-link { display: none; }
          .brasil-panama-page .hero { padding: 120px 16px 80px; }
          .brasil-panama-page .teams-row { gap: 12px; }
          .brasil-panama-page .team { width: 120px; }
          .brasil-panama-page .team-crest { width: 80px; height: 80px; }
          .brasil-panama-page .countdown-wrap { gap: 3px; }
          .brasil-panama-page .cd-unit { min-width: 58px; padding: 10px 12px 8px; }
          .brasil-panama-page .cd-colon { font-size: 26px; padding-top: 10px; }
          .brasil-panama-page .section { padding: 64px 16px; }
          .brasil-panama-page .sectors-grid { grid-template-columns: 1fr; }
          .brasil-panama-page .steps-grid { grid-template-columns: 1fr 1fr; }
          .brasil-panama-page .trust-div { display: none; }
        }
      `}} />

      {/* TICKER */}
      <div className="ticker-wrap" aria-hidden="true">
        <div className="ticker-track">
          <span className="ticker-item"><span className="ticker-dot"></span>{t('bp_ticker_1')}</span>
          <span className="ticker-item"><span className="ticker-dot"></span>{t('bp_ticker_2')}</span>
          <span className="ticker-item"><span className="ticker-dot"></span>{t('bp_ticker_1')}</span>
          <span className="ticker-item"><span className="ticker-dot"></span>{t('bp_ticker_3')}</span>
          <span className="ticker-item"><span className="ticker-dot"></span>{t('bp_ticker_1')}</span>
          <span className="ticker-item"><span className="ticker-dot"></span>{t('bp_ticker_2')}</span>
          <span className="ticker-item"><span className="ticker-dot"></span>{t('bp_ticker_1')}</span>
          <span className="ticker-item"><span className="ticker-dot"></span>{t('bp_ticker_3')}</span>
        </div>
      </div>

      {/* NAV */}
      <nav id="nav-bp">
        <a href="/" className="nav-logo">
          <img src="https://ogzasprtfgimjqrtcseg.supabase.co/storage/v1/render/image/public/site-images/1776136512230_pbsqj7cxjr.webp?quality=70&width=800&format=avif&resize=contain&v=1778307264662" alt="TocorimeRio" />
          <span>TocorimeRio</span>
        </a>
        <div className="nav-right">
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="nav-lang-btn" onClick={() => setLanguage(language === 'pt' ? 'en' : language === 'en' ? 'es' : 'pt')}>
              🌐 {language}
            </button>
            <button className="nav-lang-btn" onClick={() => setCurrency(currency === 'BRL' ? 'USD' : currency === 'USD' ? 'EUR' : 'BRL')}>
              {currency === 'BRL' ? 'R$' : currency === 'USD' ? '$' : '€'} {currency}
            </button>
          </div>
          <a href={`https://tocorimerio.com/match/${MATCH_SLUG}`} target="_blank" rel="noopener" className="nav-btn">
            {t('bp_inc_cta')}
          </a>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-bg">
          <img src="https://i0.wp.com/www.portaleducadora.com/wp-content/uploads/2023/10/estadio-do-maracana-na-copa-das-americas-2019.jpeg" alt="Maracanã" />
          <div className="hero-bg-grad"></div>
          <div className="hero-bg-grid"></div>
          <div className="hero-bg-arc"></div>
        </div>
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>

        <div className="hero-inner">
          <div className="comp-pill">
            <span className="comp-dot" aria-hidden="true"></span>
            {t('bp_pill')}
          </div>

          <div className="teams-row">
            <div className="team">
              <img className="team-crest" src="https://ruacloirelfsbejduefa.supabase.co/storage/v1/object/public/crests/e996b731-bddd-4da8-972d-0080b80186ea/casa.png" alt="Brasil" />
              <div className="team-name brazil">{t('bp_brazil')}</div>
              <div className="team-country">{t('bp_brazil_sub')}</div>
            </div>

            <div className="vs-center">
              <div className="vs-line"></div>
              <div className="vs-label">VS</div>
              <div className="vs-line"></div>
            </div>

            <div className="team">
              <img className="team-crest" src="https://ruacloirelfsbejduefa.supabase.co/storage/v1/object/public/crests/e996b731-bddd-4da8-972d-0080b80186ea/visitante.png" alt="Panamá" />
              <div className="team-name panama">{t('bp_panama')}</div>
              <div className="team-country">{t('bp_panama_sub')}</div>
            </div>
          </div>

          <p className="hero-headline reveal">
            {renderBoldText(t('bp_hero_headline'))}
          </p>

          <div className="meta-chips">
            <div className="chip"><span className="chip-icon">📅</span> {t('bp_meta_date')}</div>
            <div className="chip"><span className="chip-icon">⏰</span> {t('bp_meta_time')}</div>
            <div className="chip"><span className="chip-icon">🏟️</span> {t('bp_meta_venue')}</div>
            <div className="chip"><span className="chip-icon">🌍</span> {t('bp_meta_gates')}</div>
          </div>

          <div className="countdown-wrap" id="countdown-bp" aria-label="Contagem regressiva">
            {timeLeft.isLive ? (
              <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--yellow)', letterSpacing: '.08em' }}>{t('bp_live')}</div>
            ) : (
              <>
                <div className="cd-unit"><div className="cd-num">{timeLeft.days}</div><div className="cd-label">{t('bp_days')}</div></div>
                <div className="cd-colon" aria-hidden="true">:</div>
                <div className="cd-unit"><div className="cd-num">{timeLeft.hours}</div><div className="cd-label">{t('bp_hours')}</div></div>
                <div className="cd-colon" aria-hidden="true">:</div>
                <div className="cd-unit"><div className="cd-num">{timeLeft.minutes}</div><div className="cd-label">{t('bp_mins')}</div></div>
                <div className="cd-colon" aria-hidden="true">:</div>
                <div className="cd-unit"><div className="cd-num">{timeLeft.seconds}</div><div className="cd-label">{t('bp_secs')}</div></div>
              </>
            )}
          </div>

          <div className="hero-ctas">
            <a className="btn-main" href="#sectors">
              <span>🎟️</span> {t('bp_view_sectors')}
            </a>
            <a className="btn-ghost" href="#included">
              <span>🛡️</span> {t('bp_whats_included_cta')}
            </a>
          </div>
        </div>

        <div className="hero-scroll" aria-hidden="true">
          <span>Scroll</span>
          <div className="scroll-caret"></div>
        </div>
      </section>

      {/* TRUST BAR */}
      <div className="trust-bar">
        <div className="trust-inner">
          <div className="trust-item">
            <span className="trust-icon">✅</span>
            <span>{renderBoldText(t('bp_trust_transfer'))}</span>
          </div>
          <div className="trust-div"></div>
          <div className="trust-item">
            <span className="trust-icon">🌟</span>
            <span>{t('bp_trust_guide')}</span>
          </div>
          <div className="trust-div"></div>
          <div className="trust-item">
            <span className="trust-icon">🎫</span>
            <span>{t('bp_trust_official')}</span>
          </div>
        </div>
      </div>

      {/* VIDEO SECTION */}
      <section className="section video-section reveal" style={{ paddingBottom: '96px' }}>
        <div className="sectors-header" style={{ margin: '0 auto 40px', textAlign: 'center' }}>
          <span className="eyebrow">Experience</span>
          <h2 className="section-h">{t('bp_video_title')}</h2>
        </div>
        <div className="video-container">
          <iframe 
            src="https://www.youtube.com/embed/cCyYRbMyBpk" 
            title="TocorimeRio Experience"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowFullScreen
          ></iframe>
        </div>
      </section>

      {/* INFO STRIP */}
      <section className="info-strip reveal">
        <div className="info-strip-inner">
          <div className="info-col">
            <span className="info-col-label">{t('bp_log_bio_label')}</span>
            <span className="info-col-val" style={{ color: 'var(--yellow)' }}>{t('bp_log_bio_val')}</span>
            <span className="info-col-sub">{t('bp_log_bio_sub')}</span>
          </div>
          <div className="info-col">
            <span className="info-col-label">{t('bp_log_sale_label')}</span>
            <span className="info-col-val">{t('bp_log_sale_val')}</span>
            <span className="info-col-sub">{t('bp_log_sale_sub')}</span>
          </div>
          <div className="info-col">
            <span className="info-col-label">{t('bp_log_docs_label')}</span>
            <span className="info-col-val">{t('bp_log_docs_val')}</span>
            <span className="info-col-sub">{t('bp_log_docs_sub')}</span>
          </div>
          <div className="info-col">
            <span className="info-col-label">{t('bp_log_transfer_label')}</span>
            <span className="info-col-val" style={{ color: 'var(--teal)' }}>{t('bp_log_transfer_val')}</span>
            <span className="info-col-sub">{t('bp_log_transfer_sub')}</span>
          </div>
        </div>
      </section>

      {/* SECTORS */}
      <section className="section sectors-section" id="sectors">
        <div className="container">
          <div className="sectors-header reveal">
            <div className="eyebrow">{t('bp_sectors_eyebrow')}</div>
            <h2 className="section-h">{t('bp_sectors_title')}</h2>
            <p className="section-sub">{t('bp_sectors_desc')}</p>
          </div>

          <div className="sectors-grid">
            {finalSectors.length > 0 ? (
              finalSectors.map((sector: any, idx: number) => {
                const isSoldOut = sector.remaining <= 0 && !sector.is_on_request;
                const matchUrl = `https://tocorimerio.com/match/${MATCH_SLUG}`;
                
                // Determine category badge
                let badge = "";
                if (sector.id?.includes('mais')) badge = "VIP & Hospitality";
                else if (sector.id?.includes('camarote')) badge = "Executive";
                else if (sector.id?.includes('inferior')) badge = "Premium View";
                else badge = "Popular";

                return (
                  <div 
                    key={idx} 
                    className={`sector-card reveal ${sector.premium ? 'premium' : ''}`} 
                    style={{ transitionDelay: `${idx * 0.1}s` }}
                  >
                    <div className="sector-header-row">
                      <div className="sector-badge">{badge}</div>
                      {sector.remaining > 0 && sector.remaining <= 5 && (
                        <div className="sector-urgency">
                          {language === 'pt' ? `Apenas ${sector.remaining} restam` : `Only ${sector.remaining} left`}
                        </div>
                      )}
                    </div>

                    <div className="sector-top">
                      <div className="sector-icon-wrap">
                        {sector.id?.includes('mais') ? '👑' : sector.id?.includes('camarote') ? '🥂' : '⚽'}
                      </div>
                      <div className="sector-name-wrap">
                        <span className="sector-name">{sector.name}</span>
                        <span className="sector-location">{sector.description}</span>
                      </div>
                    </div>

                    <div className="sector-price-section">
                      <div className="sector-price">
                        {sector.is_on_request ? (
                          <span style={{ fontSize: '1.8rem' }}>{language === 'pt' ? 'Sob Consulta' : 'Upon Request'}</span>
                        ) : (
                          formatPrice(sector.price)
                        )}
                      </div>
                      <div className="sector-price-sub">{language === 'pt' ? 'por pessoa' : 'per person'}</div>
                    </div>

                    <div className="sector-divider"></div>

                    <div className="sector-features">
                      <div className="feature-item">
                        <span className="check">✓</span>
                        <span>{t('bp_inc_item1_title')}</span>
                      </div>
                      <div className="feature-item">
                        <span className="check">✓</span>
                        <span>{t('bp_inc_item2_title')}</span>
                      </div>
                      <div className="feature-item">
                        <span className="check">✓</span>
                        <span>{t('bp_inc_item4_title')}</span>
                      </div>
                      {sector.premium && (
                        <div className="feature-item">
                          <span className="check">✓</span>
                          <span>{t('bp_perk_padrão')}</span>
                        </div>
                      )}
                    </div>

                    <a 
                      href={matchUrl} 
                      className="sector-cta-new"
                      style={isSoldOut ? { opacity: 0.6, cursor: 'not-allowed', background: 'var(--ink-3)', color: 'var(--muted)' } : {}}
                    >
                      {isSoldOut ? t('bp_status_indisponivel') : (language === 'pt' ? 'Selecionar →' : 'Select →')}
                    </a>
                  </div>
                );
              })
            ) : (
              sectors.map((sector, idx) => {
                let badge = "";
                if (sector.id?.includes('mais')) badge = "VIP & Hospitality";
                else if (sector.id?.includes('camarote')) badge = "Executive";
                else if (sector.id?.includes('inferior')) badge = "Premium View";
                else badge = "Popular";

                return (
                  <div 
                    key={idx} 
                    className={`sector-card reveal ${sector.premium ? 'premium' : ''}`} 
                    style={{ transitionDelay: `${idx * 0.1}s` }}
                  >
                    <div className="sector-header-row">
                      <div className="sector-badge">{badge}</div>
                    </div>

                    <div className="sector-top">
                      <div className="sector-icon-wrap">
                        {sector.id?.includes('mais') ? '👑' : sector.id?.includes('camarote') ? '🥂' : '⚽'}
                      </div>
                      <div className="sector-name-wrap">
                        <span className="sector-name">{t(sector.nameKey)}</span>
                        <span className="sector-location">{t(sector.descKey)}</span>
                      </div>
                    </div>

                    <div className="sector-price-section">
                      <div className="sector-price" style={{ fontSize: '1.8rem', color: 'var(--muted)' }}>
                        {t('bp_status_indisponivel')}
                      </div>
                    </div>

                    <div className="sector-divider"></div>

                    <div className="sector-features">
                      {sector.perks.map((perk, pIdx) => (
                        <div key={pIdx} className="feature-item">
                          <span className="check">✓</span>
                          <span>{t(perk)}</span>
                        </div>
                      ))}
                    </div>

                    <button disabled className="sector-cta-new" style={{ opacity: 0.6, cursor: 'not-allowed', background: 'var(--ink-3)', color: 'var(--muted)' }}>
                      {t('bp_status_indisponivel')}
                    </button>
                  </div>
                );
              })
            )}
          </div>

          <div className="addon-note">
            {renderBoldText(t('bp_addon_note'))}
          </div>
        </div>
      </section>

      {/* WHAT'S INCLUDED */}
      <section className="section section-alt" id="included">
        <div className="container">
          <div className="section-header-center reveal">
            <div className="eyebrow">{t('bp_nav_included')}</div>
            <h2 className="section-h">{t('bp_inc_title')}</h2>
            <p className="section-sub">{t('bp_inc_desc')}</p>
          </div>

          <div className="included-layout" style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
            <div className="includes-list" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '32px', width: '100%' }}>
              <div className="include-row reveal" style={{ flex: '1 1 300px', maxWidth: '400px' }}>
                <div className="inc-icon-wrap">🎟️</div>
                <div className="inc-body">
                  <div className="inc-title">{t('bp_inc_item1_title')}</div>
                  <div className="inc-desc">{t('bp_inc_item1_desc')}</div>
                </div>
              </div>
              <div className="include-row reveal reveal-d1">
                <div className="inc-icon-wrap">🚐</div>
                <div className="inc-body">
                  <div className="inc-title">{t('bp_inc_item2_title')}</div>
                  <div className="inc-desc">{t('bp_inc_item2_desc')}</div>
                </div>
              </div>
              <div className="include-row reveal reveal-d2">
                <div className="inc-icon-wrap">🍺</div>
                <div className="inc-body">
                  <div className="inc-title">{t('bp_step3_title')}</div>
                  <div className="inc-desc">{renderBoldText(t('bp_step3_desc'))}</div>
                </div>
              </div>
              <div className="include-row reveal reveal-d3">
                <div className="inc-icon-wrap">🛡️</div>
                <div className="inc-body">
                  <div className="inc-title">{t('bp_inc_item5_title')}</div>
                  <div className="inc-desc">{t('bp_inc_item5_desc')}</div>
                </div>
              </div>
              <div className="include-row reveal reveal-d4">
                <div className="inc-icon-wrap">📱</div>
                <div className="inc-body">
                  <div className="inc-title">{t('bp_inc_item6_title')}</div>
                  <div className="inc-desc">{t('bp_inc_item6_desc')}</div>
                </div>
              </div>
            </div>
            
            <div style={{ textAlign: 'center', marginTop: '48px' }} className="reveal">
              <a href={`https://tocorimerio.com/match/${MATCH_SLUG}`} target="_blank" rel="noopener" className="btn-main" style={{ display: 'inline-flex' }}>
                <span>🎟️</span> {t('bp_inc_cta')}
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="how">
        <div className="container">
          <div className="section-header-center reveal">
            <div className="eyebrow">{t('bp_how_eyebrow')}</div>
            <h2 className="section-h">{t('bp_how_title')}</h2>
            <p className="section-sub">{t('bp_how_desc')}</p>
          </div>

          <div className="steps-grid reveal reveal-d1" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
            <div className="step-card">
              <div className="step-num">01</div>
              <div className="step-icon">📋</div>
              <div className="step-title">{t('bp_step1_title')}</div>
              <div className="step-desc">{t('bp_step1_desc')}</div>
            </div>
            <div className="step-card">
              <div className="step-num">02</div>
              <div className="step-icon">📍</div>
              <div className="step-title">{t('bp_step2_title')}</div>
              <div className="step-desc">{t('bp_step2_desc')}</div>
            </div>
            <div className="step-card">
              <div className="step-num">03</div>
              <div className="step-icon">🍺</div>
              <div className="step-title">{t('bp_step3_title')}</div>
              <div className="step-desc">{renderBoldText(t('bp_step3_desc'))}</div>
            </div>
            <div className="step-card">
              <div className="step-num">04</div>
              <div className="step-icon">⚽</div>
              <div className="step-title">{t('bp_step4_title')}</div>
              <div className="step-desc">{t('bp_step4_desc')}</div>
            </div>
            <div className="step-card">
              <div className="step-num">05</div>
              <div className="step-icon">🏠</div>
              <div className="step-title">{t('bp_step5_title')}</div>
              <div className="step-desc">{t('bp_step5_desc')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <section className="section section-alt" id="reviews">
        <div className="container">
          <div className="section-header-center reveal">
            <div className="eyebrow">{t('bp_reviews_eyebrow')}</div>
            <h2 className="section-h">{t('bp_reviews_title')}</h2>
            <div className="rating-hero">
              <div className="rating-big">5.0</div>
              <div className="rating-right">
                <div className="stars-row">★★★★★</div>
                <div className="rating-count">{t('bp_reviews_count')}</div>
              </div>
            </div>
          </div>

          <div className="reviews-grid">
            <div className="review-card reveal">
              <div className="review-stars">★★★★★</div>
              <p className="review-text">"The experience was beyond anything I expected. The guide was incredible — he explained every chant, every player. Walking into Maracanã with 70,000 fans is something I'll never forget."</p>
              <div className="review-author">
                <div className="review-name">James H.</div>
                <div className="review-meta">🇬🇧 United Kingdom · Brasil vs Argentina, 2025</div>
              </div>
            </div>
            <div className="review-card reveal reveal-d1">
              <div className="review-stars">★★★★★</div>
              <p className="review-text">"I was traveling solo and nervous about safety. TocorimeRio made everything seamless — pickup, the bar meetup with other travelers, the seats. Best night of my trip to Rio by far."</p>
              <div className="review-author">
                <div className="review-name">Sofia M.</div>
                <div className="review-meta">🇩🇪 Germany · Flamengo vs Fluminense, 2025</div>
              </div>
            </div>
            <div className="review-card reveal reveal-d2">
              <div className="review-stars">★★★★★</div>
              <p className="review-text">"Booked the Leste Inferior seats — perfect view. The service was flawless from start to finish. I've been to games in 20 countries and this ranked top 3 experiences of my life."</p>
              <div className="review-author">
                <div className="review-name">Daniel K.</div>
                <div className="review-meta">🇺🇸 United States · Fluminense vs Bolívar, 2026</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="final-cta" id="book">
        <div className="reveal" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div className="eyebrow" style={{ justifyContent: 'center' }}>{t('bp_final_vagas')}</div>
          <h2 className="section-h" style={{ textAlign: 'center' }}>{renderBoldText(t('bp_final_title'))}</h2>
          <p className="final-cta-sub" style={{ textAlign: 'center' }}>{renderBoldText(t('bp_final_desc'))}</p>
          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a className="btn-main" href="#sectors" style={{ fontSize: '17px', padding: '18px 42px' }}>
              <span>🎟️</span> {t('bp_view_sectors')}
            </a>
            <a className="btn-ghost" href="https://wa.me/5521970702523" target="_blank" rel="noopener" style={{ fontSize: '17px', padding: '18px 32px' }}>
              <span>💬</span> {t('bp_final_wa')}
            </a>
          </div>
          <p className="final-note">{t('bp_final_note')}</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: '60px 24px', borderTop: '1px solid var(--border)', textAlign: 'center', background: 'var(--ink-2)' }}>
        <a href="/" className="nav-logo" style={{ justifyContent: 'center', marginBottom: '24px' }}>
          <img src="https://ogzasprtfgimjqrtcseg.supabase.co/storage/v1/render/image/public/site-images/1776136512230_pbsqj7cxjr.webp?quality=70&width=800&format=avif&resize=contain&v=1778307264662" alt="TocorimeRio" style={{ height: '40px' }} />
          <span style={{ fontSize: '20px' }}>TocorimeRio</span>
        </a>
        <p style={{ fontSize: '13px', color: 'var(--muted)', maxWidth: '500px', margin: '0 auto 32px' }}>
          Oferecemos experiências autênticas e seguras para viajantes internacionais no Rio de Janeiro.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
          <a href={buildWhatsappLink("5521970702523", language)} target="_blank" rel="noopener" className="btn-main">
            WhatsApp Support
          </a>
        </div>
        <div className="footer-copy" style={{ marginTop: '40px', fontSize: '11px', color: 'var(--muted-2)' }}>
          © 2026 TocorimeRio.com · Rio de Janeiro, Brasil
        </div>
      </footer>
    </div>
  );
};

export default BrasilPanamaMaracana;
