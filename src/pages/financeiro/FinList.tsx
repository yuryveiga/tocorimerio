import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription } from "@/components/ui/alert-dialog";
import { ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { MODOS_PAGAMENTO, fmtBRL, fmtData, liquidoVenda, mesRange, pendente, totais, type FinVenda } from "@/lib/financeiro";
import { useVendas } from "./useFin";
import { FinCards } from "./FinCards";

export default function FinList() {
  const d = new Date(); const [ym, setYm] = useState({ y: d.getFullYear(), m: d.getMonth() + 1 });
  const { ini, fim } = mesRange(ym.y, ym.m);
  const { data = [], isLoading, error } = useVendas(ini, fim);
  const [q, setQ] = useState(""); const [guia, setGuia] = useState(""); const [tour, setTour] = useState(""); const [pg, setPg] = useState("");
  const [sel, setSel] = useState<FinVenda | null>(null); const [del, setDel] = useState(false); const [sync, setSync] = useState(false);
  const qc = useQueryClient(); const nav = useNavigate();
  const shift = (n: number) => { const t = new Date(ym.y, ym.m - 1 + n, 1); setYm({ y: t.getFullYear(), m: t.getMonth() + 1 }); };
  const uniq = (k: keyof FinVenda) => [...new Set(data.map(v => v[k] as string).filter(Boolean))].sort();
  const lista = useMemo(() => data.filter(v => {
    const s = q.toLowerCase();
    return (!s || [v.nome_pax, v.contato, v.hotel, v.tour, v.guia_responsavel].some(x => (x || "").toLowerCase().includes(s)))
      && (!guia || v.guia_responsavel === guia) && (!tour || v.tour === tour) && (!pg || v.modo_pagamento === pg);
  }), [data, q, guia, tour, pg]);

  async function sincronizar() {
    setSync(true);
    const { data: n, error } = await supabase.rpc("fin_sync_site_sales");
    setSync(false);
    if (error) return toast.error("Falha ao sincronizar: " + error.message);
    qc.invalidateQueries({ queryKey: ["fin-vendas"] }); toast.success(`${n} vendas de passeios do site verificadas.`);
  }
  async function excluir() {
    if (!sel) return;
    if (sel.google_event_id) {
      const { data, error } = await supabase.functions.invoke("sync-calendar", { body: { finSaleId: sel.id, remove: true } });
      if (error || (data as { error?: string } | null)?.error) return toast.error("Não foi possível remover o evento da Google Agenda. Tente novamente.");
    }
    const { error } = await supabase.from("fin_vendas").delete().eq("id", sel.id);
    if (error) return toast.error("Não foi possível excluir.");
    toast.success("Venda excluída."); setDel(false); setSel(null); qc.invalidateQueries({ queryKey: ["fin-vendas"] });
  }
  const sel_ = "h-11 rounded-md border border-input bg-background px-2 text-sm";
  const mesNome = new Date(ym.y, ym.m - 1, 1).toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">Consultar vendas</h1>
        <Button variant="outline" size="sm" onClick={sincronizar} disabled={sync}><RefreshCw className={`w-4 h-4 mr-1 ${sync ? "animate-spin" : ""}`} />Sincronizar agora</Button>
      </div>
      <div className="flex items-center justify-center gap-2">
        <Button variant="ghost" size="icon" aria-label="Mês anterior" onClick={() => shift(-1)}><ChevronLeft /></Button>
        <input type="month" value={`${ym.y}-${String(ym.m).padStart(2, "0")}`} onChange={e => { const [y, m] = e.target.value.split("-").map(Number); if (y) setYm({ y, m }); }} className={sel_} aria-label={mesNome} />
        <Button variant="ghost" size="icon" aria-label="Próximo mês" onClick={() => shift(1)}><ChevronRight /></Button>
      </div>
      <FinCards t={totais(lista)} />
      <div className="grid gap-2 sm:grid-cols-4">
        <Input placeholder="Buscar pax, contato, hotel, tour ou guia" value={q} onChange={e => setQ(e.target.value)} className="h-11 sm:col-span-4" />
        <select className={sel_} value={guia} onChange={e => setGuia(e.target.value)}><option value="">Todos os guias</option>{uniq("guia_responsavel").map(x => <option key={x}>{x}</option>)}</select>
        <select className={sel_} value={tour} onChange={e => setTour(e.target.value)}><option value="">Todos os tours</option>{uniq("tour").map(x => <option key={x}>{x}</option>)}</select>
        <select className={sel_} value={pg} onChange={e => setPg(e.target.value)}><option value="">Todos os pagamentos</option>{MODOS_PAGAMENTO.map(x => <option key={x}>{x}</option>)}</select>
      </div>
      {error && <p className="text-destructive">Erro ao carregar vendas.</p>}
      {isLoading ? <p className="text-muted-foreground">Carregando...</p> : lista.length === 0 ? <p className="text-muted-foreground text-center py-8">Nenhuma venda neste mês. <Link className="text-primary underline" to="/financeiro/cadastrar">Cadastrar venda</Link></p> : (
        <ul className="divide-y divide-border rounded-xl border border-border bg-card">
          {lista.map(v => (
            <li key={v.id}><button onClick={() => setSel(v)} className="w-full text-left p-4 hover:bg-muted flex justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium truncate">{v.nome_pax} <Badge variant={v.origem === "site" ? "default" : "secondary"} className="ml-1">{v.origem}</Badge>{pendente(v) && <Badge variant="destructive" className="ml-1">pendente</Badge>}</p>
                <p className="text-xs text-muted-foreground truncate">{fmtData(v.data)} · {v.tour} · {v.guia_responsavel || "sem guia"}</p>
              </div>
              <div className="text-right shrink-0"><p className="text-sm">{fmtBRL(v.valor_cobrado)}</p><p className="text-xs font-semibold text-primary">{fmtBRL(liquidoVenda(v))}</p></div>
            </button></li>
          ))}
        </ul>
      )}
      <Dialog open={!!sel} onOpenChange={o => !o && setSel(null)}>
        <DialogContent className="max-h-[90vh] overflow-auto">
          {sel && <>
            <DialogHeader><DialogTitle>{sel.nome_pax}</DialogTitle></DialogHeader>
            {pendente(sel) && <p className="text-sm text-destructive">Venda do site pendente de preenchimento (guia, comissão ou hotel).</p>}
            <dl className="grid grid-cols-2 gap-2 text-sm">
              {([["Data", fmtData(sel.data)], ["Data do passeio", fmtData(sel.data_tour || sel.data)], ["Quantidade", `${sel.quantidade || 1} pax`], ["Contato/WhatsApp", sel.contato || "—"], ["Hotel", sel.hotel || "—"], ["Tour", sel.tour], ["Guia", sel.guia_responsavel || "—"], ["Valor", fmtBRL(sel.valor)], ["Valor cobrado", fmtBRL(sel.valor_cobrado)],
                ["Comissão", sel.comissao === null ? "—" : fmtBRL(sel.comissao)], ["Despesas", fmtBRL(sel.despesas)], ["Pagamento", sel.modo_pagamento], ["Origem", sel.origem], ["Líquido", fmtBRL(liquidoVenda(sel))]] as const)
                .map(([k, v]) => <div key={k}><dt className="text-muted-foreground text-xs">{k}</dt><dd className="font-medium">{v}</dd></div>)}
            </dl>
            {sel.observacoes && <p className="text-sm whitespace-pre-wrap">{sel.observacoes}</p>}
            <div className="flex gap-2"><Button className="flex-1 h-12" onClick={() => nav(`/financeiro/editar/${sel.id}`)}>EDITAR</Button>
              <Button className="flex-1 h-12" variant="destructive" onClick={() => setDel(true)}>EXCLUIR</Button></div>
          </>}
        </DialogContent>
      </Dialog>
      <AlertDialog open={del} onOpenChange={setDel}>
        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Excluir esta venda?</AlertDialogTitle><AlertDialogDescription>Essa ação não pode ser desfeita.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={excluir}>Excluir</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
