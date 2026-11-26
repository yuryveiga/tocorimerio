import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { MODOS_PAGAMENTO, PIX_A_PARTIR, fmtBRL, liquidoVenda, valorComTaxaCartao } from "@/lib/financeiro";
import { useSugestoes } from "./useFin";
import { FinStripeButton } from "./FinStripeButton";

const hoje = () => new Date().toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" });
const vazio = () => ({ data: hoje(), hotel: "", nome_pax: "", quantidade: "1", contato: "", tour: "", valor: "", valor_cobrado: "", guia_responsavel: "", vendedor: "", comissao: "", modo_pagamento: "Pix", observacoes: "" });
type Desp = { descricao: string; valor: string };
const num = (s: string) => { const n = Number(String(s).replace(/\./g, "").replace(",", ".")); return Number.isFinite(n) ? n : NaN; };
const numOpt = (s: string) => (String(s).trim() === "" ? null : num(s));

export default function FinForm() {
  const { id } = useParams(); const nav = useNavigate(); const qc = useQueryClient();
  const { data: sug } = useSugestoes();
  const [f, setF] = useState(vazio()); const [desp, setDesp] = useState<Desp[]>([]);
  const [taxaCartao, setTaxaCartao] = useState(false);
  const [comPct, setComPct] = useState(false);
  const [orig, setOrig] = useState<Record<string, unknown> | null>(null); const [saving, setSaving] = useState(false);

  useEffect(() => {
    setComPct(false);
    setTaxaCartao(false);
    if (!id) { setF(vazio()); setDesp([]); setOrig(null); return; }
    (async () => {
      const [{ data: v }, { data: d }] = await Promise.all([
        supabase.from("fin_vendas").select("*").eq("id", id).maybeSingle(),
        supabase.from("fin_despesas").select("*").eq("venda_id", id).order("created_at"),
      ]);
      if (!v) { toast.error("Venda não encontrada"); return; }
      setOrig(v);
      const s = (x: unknown) => (x === null || x === undefined ? "" : String(x).replace(".", ","));
      setF({ data: v.data, hotel: v.hotel || "", nome_pax: v.nome_pax, quantidade: String(v.quantidade || 1), contato: v.contato || "", tour: v.tour, valor: s(v.valor), valor_cobrado: s(v.valor_cobrado), guia_responsavel: v.guia_responsavel || "", vendedor: v.vendedor || "", comissao: s(v.comissao), modo_pagamento: v.modo_pagamento, observacoes: v.observacoes || "" });
      setDesp((d || []).map(x => ({ descricao: x.descricao, valor: s(x.valor) })));
    })();
  }, [id]);

  const totalDesp = desp.reduce((a, d) => a + (num(d.valor) || 0), 0);
  const set = (k: keyof ReturnType<typeof vazio>) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });
  const valorCobradoFinal = () => valorComTaxaCartao(num(f.valor_cobrado), taxaCartao);

  const comissaoRS = (): number | null => {
    const c = numOpt(f.comissao);
    if (c === null || Number.isNaN(c) || !comPct) return c;
    return Math.round((valorCobradoFinal() || 0) * c) / 100;
  };

  async function salvar(outra: boolean) {
    const valor = num(f.valor || "0"), cobrado = valorCobradoFinal(), comissao = comissaoRS();
    const quantidade = Number(f.quantidade);
    if (!f.nome_pax.trim() || !f.tour.trim()) return toast.error("Preencha o nome do pax e o tour.");
    if (!f.data) return toast.error("Informe a data.");
    if (!Number.isInteger(quantidade) || quantidade < 1) return toast.error("Informe uma quantidade de pax válida.");
    if ([valor, cobrado].some(Number.isNaN) || (comissao !== null && Number.isNaN(comissao)) || desp.some(d => Number.isNaN(num(d.valor || "0"))))
      return toast.error("Confira os valores numéricos.");
    const row = { data: f.data, hotel: f.hotel.trim() || null, nome_pax: f.nome_pax.trim(), quantidade, contato: f.contato.trim() || null, tour: f.tour.trim(), valor, valor_cobrado: cobrado,
      guia_responsavel: f.guia_responsavel.trim() || null, vendedor: f.vendedor.trim() || null, comissao, despesas: Math.round(totalDesp * 100) / 100,
      modo_pagamento: f.modo_pagamento, observacoes: f.observacoes.trim() || null };
    setSaving(true);
    try {
      let vid = id;
      if (id && orig) {
        const edited = new Set<string>((orig.campos_editados as string[]) || []);
        for (const [k, val] of Object.entries(row)) if (String(orig[k] ?? "") !== String(val ?? "")) edited.add(k);
        const { error } = await supabase.from("fin_vendas").update({ ...row, campos_editados: [...edited] }).eq("id", id);
        if (error) throw error;
        await supabase.from("fin_despesas").delete().eq("venda_id", id);
      } else {
        const { data, error } = await supabase.from("fin_vendas").insert({ ...row, origem: "manual" }).select("id").single();
        if (error) throw error; vid = data.id;
      }
      const ds = desp.filter(d => d.descricao.trim() || num(d.valor || "0")).map(d => ({ venda_id: vid!, descricao: d.descricao.trim(), valor: num(d.valor || "0") }));
      if (ds.length) { const { error } = await supabase.from("fin_despesas").insert(ds); if (error) throw error; }
      qc.invalidateQueries({ queryKey: ["fin-vendas"] });
      toast.success("Venda salva!");
      if (outra) { setF(vazio()); setDesp([]); setTaxaCartao(false); if (id) nav("/financeiro/cadastrar"); window.scrollTo(0, 0); }
      else nav("/financeiro/consultar");
    } catch (e) { toast.error("Não foi possível salvar: " + (e as Error).message); }
    finally { setSaving(false); }
  }

  const money = { inputMode: "decimal" as const, placeholder: "0,00" };
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">{id ? "Editar venda" : "Cadastrar venda"}</h1>
      <datalist id="fin-tours">{sug?.tours.map(t => <option key={t} value={t} />)}</datalist>
      <datalist id="fin-guias">{sug?.guias.map(t => <option key={t} value={t} />)}</datalist>
      <div className="grid gap-4 sm:grid-cols-2">
        <div><Label htmlFor="f-4917">Data</Label><Input id="f-4917" type="date" value={f.data} onChange={set("data")} className="h-12" /></div>
        <div><Label htmlFor="f-3758">Nome do pax *</Label><Input id="f-3758" value={f.nome_pax} onChange={set("nome_pax")} className="h-12" /></div>
        <div><Label htmlFor="f-quantidade">Número de pax (quantidade)</Label><Input id="f-quantidade" type="number" min="1" step="1" inputMode="numeric" value={f.quantidade} onChange={set("quantidade")} className="h-12" /></div>
        <div><Label htmlFor="f-contato">Contato/WhatsApp</Label><Input id="f-contato" type="tel" autoComplete="tel" placeholder="Ex.: +55 21 99999-9999" value={f.contato} onChange={set("contato")} className="h-12" /></div>
        <div><Label htmlFor="f-899">Hotel</Label><Input id="f-899" value={f.hotel} onChange={set("hotel")} className="h-12" /></div>
        <div><Label htmlFor="f-6396">Tour *</Label><Input id="f-6396" list="fin-tours" value={f.tour} onChange={set("tour")} className="h-12" /></div>
        <div><Label htmlFor="f-4282">Valor (tabela)</Label><Input id="f-4282" {...money} value={f.valor} onChange={set("valor")} className="h-12" /></div>
        <div>
          <div className="flex items-center justify-between gap-3">
            <Label htmlFor="f-9646">Valor cobrado</Label>
            <Label htmlFor="f-taxa-cartao" className="flex items-center gap-2 font-normal cursor-pointer">
              <input id="f-taxa-cartao" type="checkbox" checked={taxaCartao} onChange={e => setTaxaCartao(e.target.checked)} className="h-4 w-4 accent-primary" />
              + 5%
            </Label>
          </div>
          <Input id="f-9646" {...money} value={f.valor_cobrado} onChange={set("valor_cobrado")} className="h-12" />
          {taxaCartao && <p className="text-xs text-muted-foreground mt-1">Valor final com a taxa do cartão: <strong>{fmtBRL(valorCobradoFinal() || 0)}</strong></p>}
        </div>
        <div><Label htmlFor="f-888">Guia responsável</Label><Input id="f-888" list="fin-guias" value={f.guia_responsavel} onChange={set("guia_responsavel")} className="h-12" /></div>
        <div><Label htmlFor="f-vend">Quem vendeu (recebe a comissão)</Label><Input id="f-vend" value={f.vendedor} onChange={set("vendedor")} className="h-12" /></div>
        <div><div className="flex items-center justify-between"><Label htmlFor="f-2426">Comissão ({comPct ? "%" : "R$"})</Label>
          <div className="flex rounded-md border border-input text-xs overflow-hidden" role="group" aria-label="Tipo de comissão">
            <button type="button" onClick={() => setComPct(false)} className={`px-2 py-1 ${!comPct ? "bg-primary text-primary-foreground" : ""}`}>R$</button>
            <button type="button" onClick={() => setComPct(true)} className={`px-2 py-1 ${comPct ? "bg-primary text-primary-foreground" : ""}`}>%</button>
          </div></div>
          <Input id="f-2426" {...money} value={f.comissao} onChange={set("comissao")} className="h-12" />
          {comPct && f.comissao && <p className="text-xs text-muted-foreground mt-1">= {fmtBRL(comissaoRS() || 0)}</p>}</div>
        <div><Label>Modo de pagamento</Label>
          <select value={f.modo_pagamento} onChange={set("modo_pagamento")} className="h-12 w-full rounded-md border border-input bg-background px-3">
            {MODOS_PAGAMENTO.map(m => <option key={m}>{m}</option>)}
          </select>
          {f.modo_pagamento === "Pix" && <p className="text-xs text-muted-foreground mt-1">Pix {PIX_A_PARTIR}</p>}</div>
        <div className="flex flex-col gap-1 justify-end"><FinStripeButton modo={f.modo_pagamento} amount={valorCobradoFinal() || 0} tour={f.tour} pax={f.nome_pax}
          onLink={t => setF(prev => ({ ...prev, observacoes: [prev.observacoes, t].filter(Boolean).join("\n") }))} /></div>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between"><Label>Despesas · total {fmtBRL(totalDesp)}</Label>
          <Button type="button" variant="outline" size="sm" onClick={() => setDesp([...desp, { descricao: "", valor: "" }])}><Plus className="w-4 h-4 mr-1" />Despesa</Button></div>
        {desp.map((d, i) => (
          <div key={i} className="flex gap-2">
            <Input placeholder="Descrição" value={d.descricao} onChange={e => setDesp(desp.map((x, j) => j === i ? { ...x, descricao: e.target.value } : x))} className="h-12" />
            <Input {...money} value={d.valor} onChange={e => setDesp(desp.map((x, j) => j === i ? { ...x, valor: e.target.value } : x))} className="h-12 w-32" />
            <Button type="button" variant="ghost" size="icon" aria-label="Remover despesa" className="h-12" onClick={() => setDesp(desp.filter((_, j) => j !== i))}><Trash2 className="w-4 h-4" /></Button>
          </div>
        ))}
      </div>
      <div><Label>Observações</Label><Textarea value={f.observacoes} onChange={set("observacoes")} /></div>
      <p className="text-sm">Líquido desta venda: <strong>{fmtBRL(liquidoVenda({ valor_cobrado: valorCobradoFinal() || 0, comissao: comissaoRS() || 0, despesas: totalDesp }))}</strong></p>
      <div className="flex flex-col sm:flex-row gap-3">
        <Button className="h-12 text-base" disabled={saving} onClick={() => salvar(false)}>{saving ? "Salvando..." : "Salvar"}</Button>
        <Button className="h-12 text-base" variant="outline" disabled={saving} onClick={() => salvar(true)}>Salvar e cadastrar outra</Button>
      </div>
    </div>
  );
}
