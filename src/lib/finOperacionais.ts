import { totais, type FinVenda } from "./financeiro";

export type DespesaOperacional = { id: string; descricao: string; valor: number; vencimento: string; data_pagamento: string | null };
export const hojeRio = () => new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
export const despesaVencida = (d: DespesaOperacional, hoje: string) => !d.data_pagamento && d.vencimento <= hoje;
export function totaisRelatorio(vendas: FinVenda[], fixas: number, operacionais: DespesaOperacional[], guia = false) {
  const base = totais(vendas);
  const naoRecorrentes = Math.round(operacionais.reduce((s, d) => s + Number(d.valor), 0) * 100) / 100;
  return { ...base, fixas: guia ? 0 : fixas, naoRecorrentes: guia ? 0 : naoRecorrentes, liquido: Math.round((base.liquido - (guia ? 0 : fixas + naoRecorrentes)) * 100) / 100 };
}
export const csvCelula = (valor: unknown) => {
  const s = String(valor ?? "");
  return `"${(/^[=+\-@\t\r]/.test(s) ? "'" + s : s).replace(/"/g, '""')}"`;
};