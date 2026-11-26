export interface FinVenda {
  id: string; data: string; hotel: string | null; nome_pax: string; quantidade: number; contato: string | null; tour: string;
  valor: number; valor_cobrado: number; guia_responsavel: string | null; vendedor?: string | null; comissao: number | null;
  despesas: number; modo_pagamento: string; origem: "site" | "manual"; id_externo: string | null;
  observacoes: string | null; campos_editados: string[];
}
export const MODOS_PAGAMENTO = ["Pix", "Dinheiro", "Cartão de crédito", "Cartão de débito", "Stripe", "Outro"];
export const PIX_A_PARTIR = "a partir de 18/01";

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
export const fmtBRL = (v: number | null | undefined) => brl.format(Number(v || 0));
export const fmtData = (iso: string) => { const [y, m, d] = iso.slice(0, 10).split("-"); return `${d}/${m}/${y}`; };
export const valorComTaxaCartao = (valor: number, comTaxa: boolean) => Math.round(valor * (comTaxa ? 1.05 : 1) * 100) / 100;

export const liquidoVenda = (v: Pick<FinVenda, "valor_cobrado" | "comissao" | "despesas">) =>
  Math.round((Number(v.valor_cobrado || 0) - Number(v.comissao || 0) - Number(v.despesas || 0)) * 100) / 100;

export function totais(vendas: FinVenda[]) {
  const r = { bruto: 0, comissoes: 0, despesas: 0, liquido: 0, n: vendas.length };
  for (const v of vendas) {
    r.bruto += Number(v.valor_cobrado || 0); r.comissoes += Number(v.comissao || 0);
    r.despesas += Number(v.despesas || 0); r.liquido += liquidoVenda(v);
  }
  for (const k of ["bruto", "comissoes", "despesas", "liquido"] as const) r[k] = Math.round(r[k] * 100) / 100;
  return r;
}

export const pendente = (v: FinVenda) => v.origem === "site" && (!v.guia_responsavel || v.comissao === null || !v.hotel);

export function agrupar(vendas: FinVenda[], chave: (v: FinVenda) => string) {
  const m = new Map<string, FinVenda[]>();
  for (const v of vendas) { const k = chave(v) || "—"; m.set(k, [...(m.get(k) || []), v]); }
  return [...m.entries()].map(([k, vs]) => ({ chave: k, ...totais(vs) })).sort((a, b) => b.bruto - a.bruto);
}

export function mesRange(ano: number, mes: number) {
  const ini = `${ano}-${String(mes).padStart(2, "0")}-01`;
  const last = new Date(ano, mes, 0).getDate();
  return { ini, fim: `${ano}-${String(mes).padStart(2, "0")}-${last}` };
}

const safe = (s: unknown) => { const t = String(s ?? ""); const x = /^[=+\-@\t\r]/.test(t) ? `'${t}` : t; return `"${x.replace(/"/g, '""')}"`; };
export function toCSV(vendas: FinVenda[]) {
  const head = ["Data", "Pax", "Hotel", "Tour", "Guia", "Pagamento", "Origem", "Valor cobrado", "Comissão", "Despesas", "Líquido"];
  const rows = vendas.map(v => [fmtData(v.data), v.nome_pax, v.hotel, v.tour, v.guia_responsavel, v.modo_pagamento, v.origem,
    Number(v.valor_cobrado).toFixed(2), Number(v.comissao || 0).toFixed(2), Number(v.despesas).toFixed(2), liquidoVenda(v).toFixed(2)]);
  return [head, ...rows].map(r => r.map(safe).join(";")).join("\n");
}
