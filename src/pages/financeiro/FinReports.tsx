import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, FileText } from "lucide-react";
import { agrupar, fmtBRL, fmtData, liquidoVenda, mesRange, toCSV, totais, type FinVenda } from "@/lib/financeiro";
import { useVendas } from "./useFin";
import { FinCards } from "./FinCards";

export default function FinReports() {
  const d = new Date(); const r = mesRange(d.getFullYear(), d.getMonth() + 1);
  const [ini, setIni] = useState(r.ini); const [fim, setFim] = useState(r.fim); const [guia, setGuia] = useState("");
  const { data = [], isLoading } = useVendas(ini, fim);
  const guias = [...new Set(data.map(v => v.guia_responsavel).filter(Boolean) as string[])].sort();
  const vendas = guia ? data.filter(v => v.guia_responsavel === guia) : data;
  const t = totais(vendas); const nome = `financeiro-${ini}_${fim}${guia ? "-" + guia : ""}`;
  const periodo = `${fmtData(ini)} a ${fmtData(fim)}`;

  function csv() {
    const blob = new Blob(["\ufeff" + toCSV(vendas)], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = nome + ".csv"; a.click();
  }
  async function pdf() {
    const [{ jsPDF }, { default: autoTable }] = await Promise.all([import("jspdf"), import("jspdf-autotable")]);
    const doc = new jsPDF({ orientation: "landscape" });
    doc.setFontSize(16); doc.text("Tocorime Rio — Relatório financeiro", 14, 15);
    doc.setFontSize(10); doc.text(`Período: ${periodo}${guia ? ` · Guia: ${guia}` : ""}`, 14, 22);
    autoTable(doc, { startY: 27, styles: { fontSize: 8 },
      head: [["Data", "Pax", "Hotel", "Tour", "Guia", "Cobrado", "Comissão", "Despesas", "Líquido"]],
      body: vendas.slice().reverse().map((v: FinVenda) => [fmtData(v.data), v.nome_pax, v.hotel || "", v.tour, v.guia_responsavel || "", fmtBRL(v.valor_cobrado), fmtBRL(v.comissao), fmtBRL(v.despesas), fmtBRL(liquidoVenda(v))]),
      foot: [["Totais", `${t.n} vendas`, "", "", "", fmtBRL(t.bruto), fmtBRL(t.comissoes), fmtBRL(t.despesas), fmtBRL(t.liquido)]] });
    const resumo = (titulo: string, k: (v: FinVenda) => string) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const y = (doc as any).lastAutoTable.finalY + 8;
      autoTable(doc, { startY: y, styles: { fontSize: 8 }, head: [[titulo, "Vendas", "Bruto", "Comissões", "Despesas", "Líquido"]],
        body: agrupar(vendas, k).map(g => [g.chave, g.n, fmtBRL(g.bruto), fmtBRL(g.comissoes), fmtBRL(g.despesas), fmtBRL(g.liquido)]) });
    };
    resumo("Por guia", v => v.guia_responsavel || "");
    resumo("Por modo de pagamento", v => v.modo_pagamento);
    doc.save(nome + ".pdf");
  }
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">Relatórios</h1>
      <div className="grid gap-3 sm:grid-cols-3">
        <div><Label>De</Label><Input type="date" value={ini} onChange={e => setIni(e.target.value)} className="h-12" /></div>
        <div><Label>Até</Label><Input type="date" value={fim} onChange={e => setFim(e.target.value)} className="h-12" /></div>
        <div><Label>Guia (acerto de comissões)</Label>
          <select value={guia} onChange={e => setGuia(e.target.value)} className="h-12 w-full rounded-md border border-input bg-background px-3"><option value="">Todos</option>{guias.map(g => <option key={g}>{g}</option>)}</select></div>
      </div>
      {isLoading ? <p className="text-muted-foreground">Carregando...</p> : <FinCards t={t} />}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button className="h-12" onClick={pdf} disabled={!vendas.length}><FileText className="w-4 h-4 mr-2" />Baixar PDF</Button>
        <Button className="h-12" variant="outline" onClick={csv} disabled={!vendas.length}><Download className="w-4 h-4 mr-2" />Exportar CSV</Button>
      </div>
      {guia && <div className="rounded-xl border border-border p-4 text-sm">Comissões a pagar para <strong>{guia}</strong>: <strong>{fmtBRL(t.comissoes)}</strong></div>}
    </div>
  );
}
