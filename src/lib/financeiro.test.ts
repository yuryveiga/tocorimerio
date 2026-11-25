import { describe, it, expect } from "vitest";
import { liquidoVenda, totais, toCSV, type FinVenda } from "./financeiro";
import { isFootballReservation } from "./footballReservation";
const v = (p: Partial<FinVenda>) => ({ id: "1", data: "2026-11-02", hotel: null, nome_pax: "A", tour: "T", valor: 0, valor_cobrado: 0, guia_responsavel: null, comissao: null, despesas: 0, modo_pagamento: "Pix", origem: "manual", id_externo: null, observacoes: null, campos_editados: [], ...p } as FinVenda);
describe("financeiro", () => {
  it("líquido = cobrado − comissão − despesas", () => expect(liquidoVenda(v({ valor_cobrado: 500, comissao: 100, despesas: 50.5 }))).toBe(349.5));
  it("bruto do mês soma valor cobrado", () => {
    const t = totais([v({ valor_cobrado: 300, comissao: 50 }), v({ valor_cobrado: 200, despesas: 20 })]);
    expect(t.bruto).toBe(500); expect(t.liquido).toBe(430); expect(t.n).toBe(2);
  });
  it("futebol é ignorado na importação", () => expect(isFootballReservation({ provider: "matchday" })).toBe(true));
  it("CSV neutraliza fórmulas", () => expect(toCSV([v({ nome_pax: "=HACK" })])).toContain(`"'=HACK"`));
});
