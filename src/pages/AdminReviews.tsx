import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ExternalLink, RefreshCw, Save } from "lucide-react";
import { FunctionsHttpError } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { DEFAULT_REVIEW_SETTINGS, GOOGLE_REVIEWS_URL, REVIEW_SOURCES, selectCarouselReviews, type ReviewSettings } from "../../supabase/functions/_shared/reviewSettings";
import { TRIPADVISOR_URL, type TripadvisorReview } from "../../supabase/functions/_shared/tripadvisorReviews";
import { AIRBNB_URL, VIATOR_URL } from "../../supabase/functions/_shared/partnerReviews";

const sources = {
  tripadvisor: { label: "Tripadvisor", url: TRIPADVISOR_URL, max: 16 },
  airbnb: { label: "Airbnb", url: AIRBNB_URL, max: 5 },
  viator: { label: "Viator", url: VIATOR_URL, max: 5 },
  google: { label: "Google", url: GOOGLE_REVIEWS_URL, max: 5 },
};
interface ReviewData {
  settings: ReviewSettings;
  snapshot: { reviews: TripadvisorReview[]; synced_at: string } | null;
  status: { last_attempt_at: string; last_success_at: string | null; last_error: string | null } | null;
}
async function invoke<T>(name: string, body: object): Promise<T> {
  const { data, error } = await supabase.functions.invoke(name, { body });
  if (error) {
    if (error instanceof FunctionsHttpError) {
      const details = await error.context.json().catch(() => null);
      throw new Error(details?.error ?? "Não foi possível concluir a solicitação.");
    }
    throw error;
  }
  return data as T;
}
const formatDate = (value?: string | null) => value ? new Date(value).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" }) : "Ainda não realizada";

export default function AdminReviews() {
  const [data, setData] = useState<ReviewData>();
  const [settings, setSettings] = useState<ReviewSettings>(structuredClone(DEFAULT_REVIEW_SETTINGS));
  const [busy, setBusy] = useState<"load" | "save" | "sync" | null>("load");
  const [error, setError] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const load = async () => {
    const result = await invoke<ReviewData>("admin-review-settings", { action: "load" });
    setData(result);
    setSettings(result.settings);
    setError("");
  };
  useEffect(() => {
    load().catch(err => setError(err instanceof Error ? err.message : "Erro ao carregar Reviews.")).finally(() => setBusy(null));
  }, []);
  const run = async (action: "load" | "save" | "sync") => {
    setBusy(action);
    try {
      if (action === "save") {
        const result = await invoke<ReviewData>("admin-review-settings", { action: "save", settings });
        setData(result);
        setSettings(result.settings);
        await queryClient.invalidateQueries({ queryKey: ["siteSettings"] });
        toast({ title: "Configurações de Reviews salvas" });
      } else {
        if (action === "sync") {
          await invoke("sync-tripadvisor-reviews", {});
          await queryClient.invalidateQueries({ queryKey: ["tripadvisor-review-snapshot"] });
          toast({ title: "Avaliações atualizadas", description: "Tripadvisor, Airbnb e Viator. Google continua pendente de conexão." });
        }
        await load();
      }
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível concluir a solicitação.");
    } finally { setBusy(null); }
  };
  const reviews = data?.snapshot?.reviews ?? [];
  const visible = selectCarouselReviews(reviews, settings);

  return <div className="space-y-8">
    <div className="flex flex-wrap items-center justify-between gap-4">
      <h1 className="font-serif text-3xl font-bold text-foreground">Reviews</h1>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" disabled={!!busy || !data} onClick={() => void run("sync")}><RefreshCw className={`mr-2 h-4 w-4 ${busy === "sync" ? "animate-spin" : ""}`} />{busy === "sync" ? "Atualizando…" : "Atualizar avaliações"}</Button>
        <Button disabled={!!busy || !data} onClick={() => void run("save")}><Save className="mr-2 h-4 w-4" />{busy === "save" ? "Salvando…" : "Salvar"}</Button>
      </div>
    </div>
    {error && <div role="alert" className="border border-destructive/30 rounded-lg p-4 text-destructive flex flex-wrap items-center gap-3">{error}<Button variant="outline" disabled={!!busy} onClick={() => void run("load")}>Tentar novamente</Button></div>}
    {busy === "load" && <p className="text-muted-foreground" role="status">Carregando avaliações…</p>}
    {data && <>
      <dl className="grid gap-4 sm:grid-cols-3 border-y border-border py-5">
        <div><dt className="text-sm text-muted-foreground">No carrossel</dt><dd className="text-2xl font-semibold">{visible.length}</dd></div>
        <div><dt className="text-sm text-muted-foreground">Última atualização</dt><dd className="mt-1">{formatDate(data.status?.last_success_at ?? data.snapshot?.synced_at)}</dd></div>
        <div><dt className="text-sm text-muted-foreground">Atualização automática</dt><dd className="mt-1">Semanal · segunda-feira, 6h (Brasília)</dd></div>
      </dl>
      {data.status?.last_error && <p role="alert" className="text-destructive text-sm break-words">Última tentativa: {data.status.last_error}</p>}
      <div className="divide-y divide-border">
        {REVIEW_SOURCES.map(source => {
          const item = sources[source];
          const pending = source === "google";
          const count = reviews.filter(review => (review.source ?? "tripadvisor") === source).length;
          return <section key={source} className="py-6 flex flex-wrap items-center justify-between gap-5">
            <div className="min-w-0 flex-1 basis-64">
              <h2 className="text-lg font-semibold">{item.label}</h2>
              <p className="text-sm text-muted-foreground mt-1">{pending ? "Pendente de conexão · nenhuma avaliação importada" : `${count} avaliações carregadas`}</p>
              {pending && <p className="text-sm text-muted-foreground mt-2 max-w-xl">Filtro: somente 5 estrelas. O acesso público do Google retorna até 5 avaliações por relevância, sem garantir as mais recentes.</p>}
              <Button asChild variant="link" className="px-0 h-auto mt-2"><a href={item.url} target="_blank" rel="noopener noreferrer">Abrir perfil<ExternalLink className="ml-2 h-3 w-3" /></a></Button>
            </div>
            <div className="flex flex-wrap items-center gap-6">
              <div className="space-y-2"><Label htmlFor={`limit-${source}`}>Quantidade</Label><Input id={`limit-${source}`} className="w-20" type="number" min={1} max={item.max} value={settings[source].limit} disabled={!!busy || pending} onChange={event => { const limit = Number(event.target.value); if (Number.isInteger(limit) && limit >= 1 && limit <= item.max) setSettings(current => ({ ...current, [source]: { ...current[source], limit } })); }} /></div>
              <div className="flex items-center gap-3"><Label htmlFor={`enabled-${source}`}>Exibir</Label><Switch id={`enabled-${source}`} disabled={!!busy || pending} checked={settings[source].enabled && !pending} onCheckedChange={enabled => setSettings(current => ({ ...current, [source]: { ...current[source], enabled } }))} /></div>
            </div>
          </section>;
        })}
      </div>
      <section className="border-t border-border pt-6">
        <h2 className="font-serif text-xl font-semibold mb-4">Avaliações no carrossel</h2>
        {visible.length === 0 ? <p className="text-muted-foreground">Nenhuma avaliação selecionada.</p> : <div className="divide-y divide-border">{visible.map(review => <article key={review.id} className="py-4"><div className="flex flex-wrap justify-between gap-2"><h3 className="font-semibold">{review.author}</h3><span className="text-sm text-muted-foreground">{sources[review.source ?? "tripadvisor"].label} · {review.date_label}{review.rating > 0 ? ` · ${review.rating}/5` : ""}</span></div><p className="text-sm text-muted-foreground mt-2 line-clamp-2 whitespace-pre-line">{review.text}</p></article>)}</div>}
      </section>
    </>}
  </div>;
}