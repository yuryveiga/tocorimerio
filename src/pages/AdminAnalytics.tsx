import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  Cell,
  PieChart,
  Pie,
  Legend,
} from "recharts";
import { Loader2, Users, Eye, Globe, MousePointer2, Link2, Repeat } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Visit = {
  id: string;
  page_url: string;
  referrer: string | null;
  user_agent: string | null;
  session_id: string | null;
  country: string | null;
  created_at: string;
};

type RangeKey = "7" | "30" | "90" | "all";

const RANGE_DAYS: Record<RangeKey, number | null> = {
  "7": 7,
  "30": 30,
  "90": 90,
  all: null,
};

const COLORS = ["hsl(var(--primary))", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#ec4899"];

const cleanPath = (rawUrl: string): string | null => {
  try {
    const url = new URL(rawUrl);
    const path = url.pathname === "/" ? "/" : url.pathname.replace(/\/$/, "");
    return path;
  } catch {
    return rawUrl?.startsWith("/") ? rawUrl : null;
  }
};

const cleanReferrer = (ref: string | null): string => {
  if (!ref) return "Direto";
  try {
    return new URL(ref).hostname.replace(/^www\./, "");
  } catch {
    return "Direto";
  }
};

const getCountryName = (code: string): string => {
  if (!code || code === "Desconhecido" || code.length > 2) return code;
  try {
    return new Intl.DisplayNames(['pt-BR'], { type: 'region' }).of(code.toUpperCase()) || code;
  } catch {
    return code;
  }
};

const AdminAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [allVisits, setAllVisits] = useState<Visit[]>([]);
  const [range, setRange] = useState<RangeKey>("30");

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("site_visits")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10000);

      if (error) {
        console.error("Error fetching analytics:", error);
      } else {
        setAllVisits((data as Visit[]) || []);
      }
      setLoading(false);
    };
    fetchAnalytics();
  }, []);

  const stats = useMemo(() => {
    // Filter out admin pages and apply date range
    const days = RANGE_DAYS[range];
    const cutoff = days ? Date.now() - days * 24 * 60 * 60 * 1000 : 0;

    const visits = allVisits.filter((v) => {
      const path = cleanPath(v.page_url);
      if (!path) return false;
      if (path.startsWith("/admin")) return false;
      if (cutoff && new Date(v.created_at).getTime() < cutoff) return false;
      return true;
    });

    const totalVisits = visits.length;
    const sessions = new Set(visits.map((v) => v.session_id).filter(Boolean));
    const uniqueVisitors = sessions.size;

    // Pages per session (avg)
    const sessionPageCount: Record<string, number> = {};
    visits.forEach((v) => {
      if (!v.session_id) return;
      sessionPageCount[v.session_id] = (sessionPageCount[v.session_id] || 0) + 1;
    });
    const avgPagesPerSession =
      uniqueVisitors > 0
        ? (Object.values(sessionPageCount).reduce((a, b) => a + b, 0) / uniqueVisitors).toFixed(1)
        : "0";

    // Top pages
    const pagesMap: Record<string, number> = {};
    visits.forEach((v) => {
      const path = cleanPath(v.page_url);
      if (!path) return;
      pagesMap[path] = (pagesMap[path] || 0) + 1;
    });
    const topPages = Object.entries(pagesMap)
      .map(([name, visits]) => ({ name, visits }))
      .sort((a, b) => b.visits - a.visits)
      .slice(0, 10);

    // Visits by day (within range, default 30)
    const numDays = days ?? 30;
    const daysMap: Record<string, number> = {};
    const now = new Date();
    for (let i = numDays - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      daysMap[d.toISOString().split("T")[0]] = 0;
    }
    visits.forEach((v) => {
      const dayStr = v.created_at.split("T")[0];
      if (daysMap[dayStr] !== undefined) daysMap[dayStr]++;
    });
    const visitsByDay = Object.entries(daysMap).map(([date, count]) => ({
      date: new Date(date).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
      count,
    }));

    // Countries
    const countryMap: Record<string, number> = {};
    visits.forEach((v) => {
      const c = v.country || "Desconhecido";
      const name = getCountryName(c);
      countryMap[name] = (countryMap[name] || 0) + 1;
    });
    const visitsByCountry = Object.entries(countryMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8); // Aumentado para 8 países para melhor visualização

    // Referrers
    const refMap: Record<string, number> = {};
    visits.forEach((v) => {
      const r = cleanReferrer(v.referrer);
      refMap[r] = (refMap[r] || 0) + 1;
    });
    const topReferrers = Object.entries(refMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);

    return {
      totalVisits,
      uniqueVisitors,
      avgPagesPerSession,
      topPages,
      visitsByDay,
      visitsByCountry,
      topReferrers,
    };
  }, [allVisits, range]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-serif text-foreground">Análise de Visitas</h1>
          <p className="text-muted-foreground mt-2">
            Visitas em páginas públicas (rotas <code>/admin</code> são ignoradas).
          </p>
        </div>
        <Tabs value={range} onValueChange={(v) => setRange(v as RangeKey)}>
          <TabsList>
            <TabsTrigger value="7">7d</TabsTrigger>
            <TabsTrigger value="30">30d</TabsTrigger>
            <TabsTrigger value="90">90d</TabsTrigger>
            <TabsTrigger value="all">Tudo</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total de Visitas</CardTitle>
            <Eye className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalVisits.toLocaleString("pt-BR")}</div>
            <p className="text-xs text-muted-foreground">Pageviews no período</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Visitantes Únicos</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.uniqueVisitors.toLocaleString("pt-BR")}</div>
            <p className="text-xs text-muted-foreground">Sessões distintas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Páginas / Sessão</CardTitle>
            <Repeat className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgPagesPerSession}</div>
            <p className="text-xs text-muted-foreground">Engajamento médio</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Top Origem</CardTitle>
            <Globe className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold truncate">
              {stats.visitsByCountry[0]?.name || "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">País com mais tráfego</p>
          </CardContent>
        </Card>
      </div>

      {/* Traffic Over Time - full width */}
      <Card>
        <CardHeader>
          <CardTitle>Visitas ao longo do tempo</CardTitle>
          <CardDescription>Volume diário de pageviews</CardDescription>
        </CardHeader>
        <CardContent className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stats.visitsByDay}>
              <defs>
                <linearGradient id="visitsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 8,
                }}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fill="url(#visitsGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Pages */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MousePointer2 className="w-4 h-4" /> Páginas Mais Visitadas
            </CardTitle>
            <CardDescription>Top 10 URLs públicas</CardDescription>
          </CardHeader>
          <CardContent className="h-[340px]">
            {stats.topPages.length === 0 ? (
              <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                Sem dados no período.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.topPages} layout="vertical" margin={{ left: 16, right: 16 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
                  <YAxis dataKey="name" type="category" width={140} tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: 8,
                    }}
                  />
                  <Bar dataKey="visits" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Referrers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link2 className="w-4 h-4" /> Origem do Tráfego
            </CardTitle>
            <CardDescription>De onde vêm seus visitantes</CardDescription>
          </CardHeader>
          <CardContent className="h-[340px]">
            {stats.topReferrers.length === 0 ? (
              <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                Sem dados no período.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.topReferrers} layout="vertical" margin={{ left: 16, right: 16 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
                  <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: 8,
                    }}
                  />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]}>
                    {stats.topReferrers.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Countries */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-4 h-4" /> Distribuição por País
            </CardTitle>
            <CardDescription>Principais origens internacionais</CardDescription>
          </CardHeader>
          <CardContent className="h-[340px]">
            {stats.visitsByCountry.length === 0 ? (
              <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                Sem dados no período.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.visitsByCountry}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`}
                    outerRadius={110}
                    dataKey="value"
                  >
                    {stats.visitsByCountry.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: 8,
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminAnalytics;
