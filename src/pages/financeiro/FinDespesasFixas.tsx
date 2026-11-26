import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Copy, Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { fmtBRL } from "@/lib/financeiro";
import { hojeRio, vencimentoMes } from "@/lib/finOperacionais";

type Linha = { id: string; mes: string; descricao: string; valor: number; vencimento: string | null; data_pagamento: string | null };
type Edicao = { descricao: string; valor: string; vencimento: string; pago: boolean; data_pagamento: string };
const mesAnterior = (m: string) => { const [y, mm] = m.split("-").map(Number); const d = new Date(y, mm - 2, 1); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`; };

export function FinDespesasFixas({ mesInicial }: { mesInicial: string }) {
  const [mes, setMes] = useState(mesInicial);
  const qc = useQueryClient();
  const key = ["fin_despesas_fixas", mes];
  const { data = [] } = useQuery({ queryKey: key, queryFn: async () => {
    const { data, error } = await supabase.from("fin_despesas_fixas").select("*").eq("mes", mes).order("created_at");
    if (error) throw error; return data as Linha[];
  } });
  const [edits, setEdits] = useState<Record<string, Edicao>>({});
  useEffect(() => setEdits({}), [mes, data]);
  const refresh = () => qc.invalidateQueries({ queryKey: ["fin_despesas_fixas"] });
  const total = data.reduce((s, l) => s + Number(l.valor || 0), 0);

  async function adicionar() {
    const { error } = await supabase.from("fin_despesas_fixas").insert({ mes, descricao: "Nova despesa", valor: 0 });
    if (error) return toast.error(error.message); refresh();
  }
  async function salvar(l: Linha) {
    const e = edits[l.id]; if (!e) return;
    const valor = Number(String(e.valor).replace(",", "."));
    if (!e.descricao.trim() || isNaN(valor)) return toast.error("Preencha descrição e valor válidos");
    if (!e.vencimento || (e.pago && !e.data_pagamento)) return toast.error("Preencha o vencimento e a data de pagamento");
    const { error } = await supabase.from("fin_despesas_fixas").update({ descricao: e.descricao.trim(), valor, vencimento: e.vencimento, data_pagamento: e.pago ? e.data_pagamento : null }).eq("id", l.id);
    if (error) return toast.error(error.message); toast.success("Salvo"); refresh();
  }
  async function remover(id: string) {
    if (!confirm("Remover esta despesa?")) return;
    const { error } = await supabase.from("fin_despesas_fixas").delete().eq("id", id);
    if (error) return toast.error(error.message); refresh();
  }
  async function importar() {
    const ant = mesAnterior(mes);
    const { data: prev, error } = await supabase.from("fin_despesas_fixas").select("descricao,valor,vencimento").eq("mes", ant);
    if (error) return toast.error(error.message);
    if (!prev?.length) return toast.info("Nenhuma despesa no mês anterior");
    const { error: e2 } = await supabase.from("fin_despesas_fixas").insert(prev.map(p => ({ ...p, mes, vencimento: vencimentoMes(p.vencimento, mes), data_pagamento: null })));
    if (e2) return toast.error(e2.message); toast.success(`${prev.length} despesas importadas`); refresh();
  }

  return (
    <div className="rounded-xl border border-border p-4 space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-end gap-3 justify-between">
        <div><h2 className="text-lg font-bold">Despesas fixas do mês</h2>
          <Label>Mês</Label><Input type="month" value={mes} onChange={e => e.target.value && setMes(e.target.value)} className="h-11 w-48" /></div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" onClick={importar}><Copy className="w-4 h-4 mr-2" />Importar do mês anterior</Button>
          <Button onClick={adicionar}><Plus className="w-4 h-4 mr-2" />Adicionar</Button>
        </div>
      </div>
      {data.length === 0 ? <p className="text-sm text-muted-foreground">Nenhuma despesa fixa neste mês.</p> : (
        <div className="space-y-2">
          {data.map(l => {
            const e = edits[l.id] ?? { descricao: l.descricao, valor: String(l.valor), vencimento: l.vencimento || "", pago: Boolean(l.data_pagamento), data_pagamento: l.data_pagamento || "" };
            const mudou = !!edits[l.id];
            const set = (p: Partial<typeof e>) => setEdits(s => ({ ...s, [l.id]: { ...e, ...p } }));
            return (
              <div key={l.id} className="border-b border-border py-3 space-y-2">
                <div className="grid gap-2 sm:grid-cols-3">
                <div><Label>Descrição</Label><Input aria-label="Descrição" value={e.descricao} onChange={ev => set({ descricao: ev.target.value })} /></div>
                <div><Label>Valor (R$)</Label><Input aria-label="Valor" inputMode="decimal" value={e.valor} onChange={ev => set({ valor: ev.target.value })} /></div>
                <div><Label>Vencimento</Label><Input aria-label="Vencimento da despesa fixa" type="date" value={e.vencimento} onChange={ev => set({ vencimento: ev.target.value })} /></div>
                </div>
                <div className="flex flex-wrap gap-3 items-center">
                <div className="flex gap-2 items-center"><Checkbox id={`fixa-paga-${l.id}`} checked={e.pago} onCheckedChange={v => set({ pago: v === true, data_pagamento: v === true ? e.data_pagamento || hojeRio() : "" })} /><Label htmlFor={`fixa-paga-${l.id}`}>Já foi pago</Label></div>
                {e.pago && <div><Label>Data de pagamento</Label><Input aria-label="Data de pagamento da despesa fixa" type="date" value={e.data_pagamento} onChange={ev => set({ data_pagamento: ev.target.value })} /></div>}
                <Button size="icon" variant={mudou ? "default" : "ghost"} disabled={!mudou} onClick={() => salvar(l)} aria-label="Salvar"><Save className="w-4 h-4" /></Button>
                <Button size="icon" variant="ghost" onClick={() => remover(l.id)} aria-label="Remover"><Trash2 className="w-4 h-4 text-destructive" /></Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <div className="text-right font-semibold">Total: {fmtBRL(total)}</div>
    </div>
  );
}
