import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, TrendingUp, TrendingDown, Minus } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

type RangeKey = "7" | "30" | "90";

type DayRow = {
  date: string;
  ga4Sessions: number;
  ga4Users: number;
  nativeSessions: number;
  nativeUsers: number;
  diffPct: number | null; // (ga4 - native) / native * 100 on sessions
};

const toISODate = (d: Date) => d.toISOString().slice(0, 10);

const rangeToDates = (r: RangeKey): { start: string; end: string; days: number } => {
  const end = new Date();
  const start = new Date();
  const days = Number(r);
  start.setDate(end.getDate() - (days - 1));
  return { start: toISODate(start), end: toISODate(end), days };
};

export const GA4ComparisonPanel = () => {
  const [range, setRange] = useState<RangeKey>("30");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ga4Rows, setGa4Rows] = useState<Array<{ date: string; sessions: number; users: number }>>([]);
  const [nativeRows, setNativeRows] = useState<Array<{ date: string; sessions: number; users: number }>>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const { start, end } = rangeToDates(range);

        // 1) GA4 via edge function
        const ga4Promise = supabase.functions.invoke("ga4-report", {
          body: { startDate: start, endDate: end },
        });

        // 2) Native visits
        const startISO = new Date(start + "T00:00:00Z").toISOString();
        const endISO = new Date(end + "T23:59:59Z").toISOString();
        const nativePromise = supabase
          .from("site_visits")
          .select("created_at, session_id")
          .gte("created_at", startISO)
          .lte("created_at", endISO)
          .limit(50000);

        const [ga4Res, nativeRes] = await Promise.all([ga4Promise, nativePromise]);

        const ga4Data = (ga4Res.data as { rows?: Array<{ date: string; sessions: number; users: number }>; error?: string; details?: string }) || {};
        if (ga4Data?.error) {
          const details = ga4Data.details || "";
          let msg = ga4Data.error;
          if (/SERVICE_DISABLED|has not been used/i.test(details)) {
            msg = "A Google Analytics Data API está desativada no projeto Google Cloud da service account. Ative em: https://console.developers.google.com/apis/api/analyticsdata.googleapis.com/overview e aguarde 1-2 minutos.";
          } else if (/PERMISSION_DENIED|403/i.test(details)) {
            msg = "A service account não tem acesso à propriedade GA4 532232341. Adicione o e-mail como Leitor em GA4 Admin → Property access management.";
          } else if (details) {
            msg = `${msg} — ${details.slice(0, 400)}`;
          }
          throw new Error(msg);
        }
        if (ga4Res.error) throw new Error(ga4Res.error.message || "GA4 fetch failed");

        if (nativeRes.error) throw nativeRes.error;

        // Aggregate native per day: sessions = distinct session_id, users ~ distinct session_id (proxy)
        const bySession: Record<string, Set<string>> = {};
        for (const row of nativeRes.data || []) {
          const day = (row as any).created_at.slice(0, 10);
          const sid = (row as any).session_id;
          if (!sid) continue;
          if (!bySession[day]) bySession[day] = new Set();
          bySession[day].add(sid);
        }
        const native = Object.entries(bySession).map(([date, set]) => ({
          date,
          sessions: set.size,
          users: set.size,
        }));

        if (!cancelled) {
          setGa4Rows(ga4Data.rows || []);
          setNativeRows(native);
        }
      } catch (err: any) {
        console.error("GA4 comparison error:", err);
        if (!cancelled) setError(err.message || String(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [range]);

  const merged: DayRow[] = useMemo(() => {
    const { start, days } = rangeToDates(range);
    const startDate = new Date(start + "T00:00:00Z");
    const map = new Map<string, DayRow>();
    for (let i = 0; i < days; i++) {
      const d = new Date(startDate);
      d.setUTCDate(startDate.getUTCDate() + i);
      const key = toISODate(d);
      map.set(key, {
        date: key,
        ga4Sessions: 0,
        ga4Users: 0,
        nativeSessions: 0,
        nativeUsers: 0,
        diffPct: null,
      });
    }
    for (const r of ga4Rows) {
      const row = map.get(r.date);
      if (row) {
        row.ga4Sessions = r.sessions;
        row.ga4Users = r.users;
      }
    }
    for (const r of nativeRows) {
      const row = map.get(r.date);
      if (row) {
        row.nativeSessions = r.sessions;
        row.nativeUsers = r.users;
      }
    }
    for (const row of map.values()) {
      if (row.nativeSessions > 0) {
        row.diffPct = ((row.ga4Sessions - row.nativeSessions) / row.nativeSessions) * 100;
      } else if (row.ga4Sessions > 0) {
        row.diffPct = null; // undefined ratio
      } else {
        row.diffPct = 0;
      }
    }
    return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
  }, [ga4Rows, nativeRows, range]);

  const totals = useMemo(() => {
    const t = merged.reduce(
      (acc, r) => {
        acc.ga4Sessions += r.ga4Sessions;
        acc.ga4Users += r.ga4Users;
        acc.nativeSessions += r.nativeSessions;
        acc.nativeUsers += r.nativeUsers;
        return acc;
      },
      { ga4Sessions: 0, ga4Users: 0, nativeSessions: 0, nativeUsers: 0 },
    );
    const diffSessions = t.nativeSessions > 0
      ? ((t.ga4Sessions - t.nativeSessions) / t.nativeSessions) * 100
      : null;
    const diffUsers = t.nativeUsers > 0
      ? ((t.ga4Users - t.nativeUsers) / t.nativeUsers) * 100
      : null;
    return { ...t, diffSessions, diffUsers };
  }, [merged]);

  const formatPct = (v: number | null) => {
    if (v === null || Number.isNaN(v)) return "—";
    const sign = v > 0 ? "+" : "";
    return `${sign}${v.toFixed(1)}%`;
  };

  const diffColor = (v: number | null) => {
    if (v === null) return "text-muted-foreground";
    if (Math.abs(v) < 5) return "text-muted-foreground";
    return v > 0 ? "text-emerald-600" : "text-orange-600";
  };

  const DiffIcon = ({ v }: { v: number | null }) => {
    if (v === null || Math.abs(v) < 5) return <Minus className="w-3 h-3 inline" />;
    return v > 0 ? <TrendingUp className="w-3 h-3 inline" /> : <TrendingDown className="w-3 h-3 inline" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h3 className="text-lg font-semibold">GA4 vs. Eventos Nativos</h3>
          <p className="text-sm text-muted-foreground">
            Comparação diária de sessões e usuários entre o Google Analytics e o rastreamento próprio.
          </p>
        </div>
        <Tabs value={range} onValueChange={(v) => setRange(v as RangeKey)}>
          <TabsList>
            <TabsTrigger value="7">7d</TabsTrigger>
            <TabsTrigger value="30">30d</TabsTrigger>
            <TabsTrigger value="90">90d</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-destructive font-medium">Erro ao carregar GA4</p>
            <p className="text-xs text-muted-foreground mt-1 break-words">{error}</p>
            <p className="text-xs text-muted-foreground mt-2">
              Verifique: (1) a Google Analytics Data API está ativada no projeto Cloud da service account; (2) o e-mail da service account tem acesso de Leitor à propriedade GA4 <code>532232341</code>.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Sessões GA4</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totals.ga4Sessions.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">no período</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Sessões Nativas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totals.nativeSessions.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">session_id únicos</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Diferença Sessões</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${diffColor(totals.diffSessions)}`}>
                  <DiffIcon v={totals.diffSessions} /> {formatPct(totals.diffSessions)}
                </div>
                <p className="text-xs text-muted-foreground">GA4 vs nativo</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Diferença Usuários</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${diffColor(totals.diffUsers)}`}>
                  <DiffIcon v={totals.diffUsers} /> {formatPct(totals.diffUsers)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {totals.ga4Users.toLocaleString()} GA4 · {totals.nativeUsers.toLocaleString()} nativo
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Sessões por dia</CardTitle>
              <CardDescription>Linha azul: GA4 · Linha verde: eventos nativos</CardDescription>
            </CardHeader>
            <CardContent className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={merged}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: 8,
                    }}
                  />
                  <Legend />
                  <Line type="monotone" name="GA4" dataKey="ga4Sessions" stroke="#3b82f6" strokeWidth={2} dot={false} />
                  <Line type="monotone" name="Nativo" dataKey="nativeSessions" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Detalhamento diário</CardTitle>
              <CardDescription>Sessões, usuários e diferença percentual (GA4 sobre nativo)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="max-h-[420px] overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead className="text-right">GA4 Sessões</TableHead>
                      <TableHead className="text-right">Nativo Sessões</TableHead>
                      <TableHead className="text-right">Δ Sessões</TableHead>
                      <TableHead className="text-right">GA4 Users</TableHead>
                      <TableHead className="text-right">Nativo Users</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[...merged].reverse().map((r) => (
                      <TableRow key={r.date}>
                        <TableCell className="font-mono text-xs">{r.date}</TableCell>
                        <TableCell className="text-right">{r.ga4Sessions.toLocaleString()}</TableCell>
                        <TableCell className="text-right">{r.nativeSessions.toLocaleString()}</TableCell>
                        <TableCell className={`text-right font-medium ${diffColor(r.diffPct)}`}>
                          <DiffIcon v={r.diffPct} /> {formatPct(r.diffPct)}
                        </TableCell>
                        <TableCell className="text-right">{r.ga4Users.toLocaleString()}</TableCell>
                        <TableCell className="text-right">{r.nativeUsers.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <p className="text-xs text-muted-foreground">
            Observação: o rastreamento nativo conta um "usuário" como <code>session_id</code> único (aproximação), enquanto o GA4 usa <code>totalUsers</code> com deduplicação por cliente. Diferenças de 5% a 20% são esperadas.
          </p>
        </>
      )}
    </div>
  );
};