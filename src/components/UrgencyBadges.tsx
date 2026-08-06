import { useEffect, useState } from "react";
import { Eye, TrendingUp, ShoppingBag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLocale } from "@/contexts/LocaleContext";
import { useSiteData } from "@/hooks/useSiteData";

interface Props {
  tourId: string;
  tourSlug?: string;
}

interface RecentSale {
  customer_name: string;
  created_at: string;
}

const STRINGS = {
  pt: {
    viewing: (n: number) => `${n} ${n === 1 ? "pessoa está vendo" : "pessoas estão vendo"} este passeio agora`,
    bookedWeek: (n: number) => `Reservado ${n} ${n === 1 ? "vez" : "vezes"} nos últimos 7 dias`,
    recentBooking: (name: string, when: string) => `${name} reservou ${when}`,
    minutesAgo: (n: number) => n <= 1 ? "agora há pouco" : `há ${n} min`,
    hoursAgo: (n: number) => n === 1 ? "há 1 hora" : `há ${n} horas`,
  },
  en: {
    viewing: (n: number) => `${n} ${n === 1 ? "person is viewing" : "people are viewing"} this tour right now`,
    bookedWeek: (n: number) => `Booked ${n} ${n === 1 ? "time" : "times"} in the last 7 days`,
    recentBooking: (name: string, when: string) => `${name} booked ${when}`,
    minutesAgo: (n: number) => n <= 1 ? "just now" : `${n} min ago`,
    hoursAgo: (n: number) => n === 1 ? "1 hour ago" : `${n} hours ago`,
  },
  es: {
    viewing: (n: number) => `${n} ${n === 1 ? "persona está viendo" : "personas están viendo"} este tour ahora`,
    bookedWeek: (n: number) => `Reservado ${n} ${n === 1 ? "vez" : "veces"} en los últimos 7 días`,
    recentBooking: (name: string, when: string) => `${name} reservó ${when}`,
    minutesAgo: (n: number) => n <= 1 ? "ahora mismo" : `hace ${n} min`,
    hoursAgo: (n: number) => n === 1 ? "hace 1 hora" : `hace ${n} horas`,
  },
} as const;

function getFirstName(full: string) {
  return (full || "").trim().split(/\s+/)[0] || "";
}

function timeAgo(iso: string, lang: "pt" | "en" | "es") {
  const s = STRINGS[lang];
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 60) return s.minutesAgo(mins);
  const hrs = Math.floor(mins / 60);
  return s.hoursAgo(hrs);
}

export function UrgencyBadges({ tourId, tourSlug }: Props) {
  const { language } = useLocale();
  const { siteSettings } = useSiteData();
  const hideUrgency = siteSettings?.['hide_urgency'] === 'true';
  const lang = (["pt", "en", "es"].includes(language) ? language : "pt") as "pt" | "en" | "es";
  const s = STRINGS[lang];

  if (hideUrgency) return null;

  const [viewing, setViewing] = useState<number>(0);
  const [weekBookings, setWeekBookings] = useState<number>(0);
  const [recentSales, setRecentSales] = useState<RecentSale[]>([]);
  const [currentSaleIdx, setCurrentSaleIdx] = useState(0);

  // #2 — visitantes ativos (últimos 5 min) na URL deste passeio
  useEffect(() => {
    let cancelled = false;
    const fetchViewers = async () => {
      const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      const slugMatch = tourSlug || tourId;
      const { data } = await supabase
        .from("site_visits")
        .select("session_id, created_at, page_url")
        .gte("created_at", fiveMinAgo)
        .ilike("page_url", `%${slugMatch}%`);
      if (cancelled) return;
      const unique = new Set((data || []).map((v: Record<string, unknown>) => v.session_id).filter(Boolean));
      // Conta o próprio visitante atual; mínimo 1
      setViewing(Math.max(1, unique.size));
    };
    fetchViewers();
    const interval = setInterval(fetchViewers, 30_000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [tourId, tourSlug]);

  // #6 — reservas das últimas 7 dias para este passeio
  useEffect(() => {
    let cancelled = false;
    const fetchWeek = async () => {
      const { data: count } = await supabase.rpc("count_recent_bookings", { _tour_id: tourId, _days: 7 });
      if (!cancelled) setWeekBookings((count as number) || 0);
    };
    fetchWeek();
    return () => { cancelled = true; };
  }, [tourId]);

  // #3 — vendas recentes (últimas 48h) para o toast rotativo
  useEffect(() => {
    let cancelled = false;
    const fetchRecent = async () => {
      const { data } = await supabase.rpc("recent_sales_public", { _tour_id: tourId, _hours: 48 });
      if (!cancelled) setRecentSales((data as RecentSale[]) || []);
    };
    fetchRecent();
    return () => { cancelled = true; };
  }, [tourId]);

  // Rotaciona qual venda é mostrada
  useEffect(() => {
    if (recentSales.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSaleIdx((i) => (i + 1) % recentSales.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [recentSales.length]);

  const currentSale = recentSales[currentSaleIdx];

  return (
    <div className="flex flex-wrap gap-2 mt-4" aria-live="polite">
      {/* #2 Vendo agora */}
      {viewing > 0 && (
        <span className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-full text-[11px] font-bold">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <Eye className="w-3.5 h-3.5" />
          {s.viewing(viewing)}
        </span>
      )}

      {/* #6 Reservado X vezes na semana — só mostra se >= 3 */}
      {weekBookings >= 3 && (
        <span className="inline-flex items-center gap-2 bg-orange-50 text-orange-700 border border-orange-200 px-3 py-1.5 rounded-full text-[11px] font-bold">
          <TrendingUp className="w-3.5 h-3.5" />
          {s.bookedWeek(weekBookings)}
        </span>
      )}

      {/* #3 Última reserva — rotativo */}
      {currentSale && (
        <span
          key={currentSaleIdx}
          className="inline-flex items-center gap-2 bg-primary/5 text-foreground border border-primary/20 px-3 py-1.5 rounded-full text-[11px] font-bold animate-fade-in-up"
        >
          <ShoppingBag className="w-3.5 h-3.5 text-primary" />
          {s.recentBooking(getFirstName(currentSale.customer_name), timeAgo(currentSale.created_at, lang))}
        </span>
      )}
    </div>
  );
}