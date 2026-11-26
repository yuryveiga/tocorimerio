import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Pencil, Trash2, Save, X } from "lucide-react";
import { toast } from "sonner";
import { fmtBRL, fmtData, mesRange } from "@/lib/financeiro";
import { despesaVencida, hojeRio, type DespesaOperacional } from "@/lib/finOperacionais";

const vazio = () => ({ descricao: "", valor: "", vencimento: hojeRio(), data_pagamento: "" });
export default function FinOperacionais() {
  const [mes, setMes] = useState(hojeRio().slice(0, 7));
  const [form, setForm] = useState(vazio);
  const [id, setId] = useState<string | null>(null);
  const [pago, setPago] = useState(false);
  const [saving, setSaving] = useState(false);
  const qc = useQueryClient();
  const [ano, numeroMes] = mes.split("-").map(Number); const range = mesRange(ano, numeroMes);
  const { data = [], isLoading, error } = useQuery({ queryKey: ["fin_operacionais", mes], queryFn: async () => {
    const { data, error } = await supabase.from("fin_despesas_operacionais").select("id,descricao,valor,vencimento,data_pagamento").gte("vencimento", range.ini).lte("vencimento", range.fim).order("vencimento");
    if (error) throw error; return data as DespesaOperacional[];
  } });
  const reset = () => { setForm(vazio()); setId(null); setPago(false); };
  async function salvar(e: React.FormEvent) {
    e.preventDefault(); const valor = Number(form.valor.replace(",", "."));
    if (!form.descricao.trim() || !form.valor || !Number.isFinite(valor) || valor < 0 || !form.vencimento || (pago && !form.data_pagamento)) return toast.error("Preencha nome, valor e datas válidas");
    setSaving(true);
    const payload = { descricao: form.descricao.trim(), valor, vencimento: form.vencimento, data_pagamento: pago ? form.data_pagamento : null };
    const { error } = id ? await supabase.from("fin_despesas_operacionais").update(payload).eq("id", id) : await supabase.from("fin_despesas_operacionais").insert(payload);
    setSaving(false); if (error) return toast.error(error.message);
    setMes(form.vencimento.slice(0, 7)); reset(); await qc.invalidateQueries({ queryKey: ["fin_operacionais"] }); toast.success("Despesa salva");
  }
  async function remover(id: string) {
    if (!confirm("Remover esta despesa?")) return;
    const { error } = await supabase.from("fin_despesas_operacionais").delete().eq("id", id);
    if (error) return toast.error(error.message);
    if (id === formId) reset(); await qc.invalidateQueries({ queryKey: ["fin_operacionais"] });
  }
  const formId = id;
  return <div className="space-y-6">
    <h1 className="text-2xl font-bold">Despesas Operacionais</h1>
    <form onSubmit={salvar} className="space-y-3">
      <h2 className="font-semibold">{id ? "Editar despesa" : "Cadastrar despesa"}</h2>
      <div className="grid gap-3 sm:grid-cols-3">
        <div><Label htmlFor="op-nome">Nome da despesa</Label><Input id="op-nome" required value={form.descricao} onChange={e => setForm({ ...form, descricao: e.target.value })} /></div>
        <div><Label htmlFor="op-valor">Valor (R$)</Label><Input id="op-valor" required inputMode="decimal" value={form.valor} onChange={e => setForm({ ...form, valor: e.target.value })} /></div>
        <div><Label htmlFor="op-vencimento">Vencimento</Label><Input id="op-vencimento" required type="date" value={form.vencimento} onChange={e => setForm({ ...form, vencimento: e.target.value })} /></div>
      </div>
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex gap-2 items-center"><Checkbox id="op-pago" checked={pago} onCheckedChange={v => { setPago(v === true); if (v === true && !form.data_pagamento) setForm({ ...form, data_pagamento: hojeRio() }); }} /><Label htmlFor="op-pago">Já foi pago</Label></div>
        {pago && <div><Label htmlFor="op-pagamento">Data de pagamento</Label><Input id="op-pagamento" required type="date" value={form.data_pagamento} onChange={e => setForm({ ...form, data_pagamento: e.target.value })} /></div>}
        <Button disabled={saving} type="submit"><Save className="w-4 h-4 mr-2" />{saving ? "Salvando..." : "Salvar despesa"}</Button>
        {id && <Button type="button" variant="outline" onClick={reset}><X className="w-4 h-4 mr-2" />Cancelar</Button>}
      </div>
    </form>
    <div><Label htmlFor="op-mes">Mês de vencimento</Label><Input id="op-mes" className="w-48" type="month" value={mes} onChange={e => e.target.value && setMes(e.target.value)} /></div>
    {error ? <p role="alert" className="text-destructive">Não foi possível carregar as despesas.</p> : isLoading ? <p>Carregando...</p> : !data.length ? <p className="text-muted-foreground">Nenhuma despesa neste mês.</p> : <ul className="divide-y divide-border">
      {data.map(d => <li key={d.id} className="py-4 flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0 flex-1"><p className="font-semibold break-words">{d.descricao} · {fmtBRL(d.valor)}</p><p className="text-sm text-muted-foreground">Vencimento: {fmtData(d.vencimento)}{d.data_pagamento ? ` · Pago em ${fmtData(d.data_pagamento)}` : " · Não pago"}</p>{despesaVencida(d, hojeRio()) && <p className="text-destructive text-sm font-semibold">{d.vencimento === hojeRio() ? "Vence hoje" : "Vencida"}</p>}</div>
        <div className="flex gap-1"><Button size="icon" variant="ghost" aria-label={`Editar ${d.descricao}`} title="Editar" onClick={() => { setId(d.id); setPago(Boolean(d.data_pagamento)); setForm({ descricao: d.descricao, valor: String(d.valor), vencimento: d.vencimento, data_pagamento: d.data_pagamento || "" }); }}><Pencil className="w-4 h-4" /></Button><Button size="icon" variant="ghost" aria-label={`Remover ${d.descricao}`} title="Remover" onClick={() => remover(d.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button></div>
      </li>)}
    </ul>}
    <p className="font-semibold text-right">Total do mês: {fmtBRL(data.reduce((s, d) => s + Number(d.valor), 0))}</p>
  </div>;
}