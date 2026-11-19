import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Languages, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

type LogEntry = {
  type: "section" | "progress" | "done" | "error";
  section?: string;
  name?: string;
  total?: number;
  item?: string;
  ok?: boolean;
  error?: string;
};

export function BulkTranslateCard() {
  const [running, setRunning] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [scope, setScope] = useState({ tours: true, reviews: true, blog: true, force: false });
  const { toast } = useToast();

  const run = async () => {
    if (!confirm(
      scope.force
        ? "Isso vai SOBRESCREVER todas as traduções existentes. Continuar?"
        : "Isso vai traduzir apenas itens sem tradução. Continuar?"
    )) return;

    setRunning(true);
    setLogs([]);
    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/bulk-translate`;
      const { data: { session } } = await supabase.auth.getSession();
      const resp = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token ?? ""}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify(scope),
      });

      if (!resp.ok || !resp.body) {
        throw new Error(`HTTP ${resp.status}`);
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        let idx: number;
        while ((idx = buf.indexOf("\n")) !== -1) {
          const line = buf.slice(0, idx).trim();
          buf = buf.slice(idx + 1);
          if (!line) continue;
          try {
            const entry = JSON.parse(line) as LogEntry;
            setLogs((prev) => [...prev, entry]);
          } catch { /* ignore partial */ }
        }
      }
      toast({ title: "Tradução em massa concluída!" });
    } catch (e) {
      toast({ title: "Erro ao traduzir", description: String(e), variant: "destructive" });
    } finally {
      setRunning(false);
    }
  };

  const successCount = logs.filter((l) => l.type === "progress" && l.ok).length;
  const errorCount = logs.filter((l) => l.type === "progress" && !l.ok).length;

  return (
    <div className="bg-card border rounded-3xl p-8 shadow-sm space-y-6 md:col-span-2">
      <div className="flex items-center gap-3 mb-2">
        <Languages className="w-7 h-7 text-primary" />
        <h2 className="text-2xl font-bold font-serif">Tradução em Massa (IA)</h2>
      </div>
      <p className="text-sm text-muted-foreground">
        Re-traduz <strong>tours, reviews e blog posts</strong> do português para inglês e espanhol usando IA de alta qualidade.
        Preserva nomes próprios (Pão de Açúcar, Cristo Redentor, Tocorime Rio…) e evita palavras coladas.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/30 rounded-2xl">
        <div className="flex items-center gap-2">
          <Switch checked={scope.tours} onCheckedChange={(v) => setScope({ ...scope, tours: v })} disabled={running} />
          <Label className="text-sm">Tours</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={scope.reviews} onCheckedChange={(v) => setScope({ ...scope, reviews: v })} disabled={running} />
          <Label className="text-sm">Reviews</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={scope.blog} onCheckedChange={(v) => setScope({ ...scope, blog: v })} disabled={running} />
          <Label className="text-sm">Blog</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={scope.force} onCheckedChange={(v) => setScope({ ...scope, force: v })} disabled={running} />
          <Label className="text-sm text-destructive">Sobrescrever tudo</Label>
        </div>
      </div>

      <Button
        onClick={run}
        disabled={running || (!scope.tours && !scope.reviews && !scope.blog)}
        className="w-full h-12 rounded-xl font-bold"
      >
        {running ? (
          <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Traduzindo...</>
        ) : (
          <><Languages className="w-4 h-4 mr-2" /> Iniciar Tradução em Massa</>
        )}
      </Button>

      {logs.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1 text-green-600">
              <CheckCircle2 className="w-4 h-4" /> {successCount} OK
            </span>
            {errorCount > 0 && (
              <span className="flex items-center gap-1 text-destructive">
                <XCircle className="w-4 h-4" /> {errorCount} erros
              </span>
            )}
          </div>
          <div className="max-h-64 overflow-y-auto bg-muted/40 rounded-xl p-3 space-y-1 text-xs font-mono">
            {logs.map((l, i) => {
              if (l.type === "section") {
                return <div key={i} className="font-bold text-primary mt-2">━ {l.name?.toUpperCase()} ({l.total} itens) ━</div>;
              }
              if (l.type === "progress") {
                return (
                  <div key={i} className={l.ok ? "text-foreground" : "text-destructive"}>
                    {l.ok ? "✓" : "✗"} [{l.section}] {l.item}
                    {l.error && <span className="ml-2 opacity-70">— {l.error}</span>}
                  </div>
                );
              }
              if (l.type === "done") return <div key={i} className="font-bold text-green-600 mt-2">✓ Concluído</div>;
              if (l.type === "error") return <div key={i} className="text-destructive">✗ {l.error}</div>;
              return null;
            })}
          </div>
        </div>
      )}
    </div>
  );
}
