import { describe, it, expect } from "vitest";
import { csvCelula, despesaVencida, limiteAlertaDespesas, totaisRelatorio, type DespesaOperacional } from "./finOperacionais";

const d = (p: Partial<DespesaOperacional> = {}): DespesaOperacional => ({ id: "1", descricao: "Transporte", valor: 100, vencimento: "2026-11-26", data_pagamento: null, ...p });
describe("despesas operacionais", () => {
  it("alerta antes de 7 dias, excluindo exatamente 7 dias e incluindo vencidas", () => {
    const limite = limiteAlertaDespesas("2026-11-26");
    expect(limite).toBe("2026-12-03");
    expect("2026-12-02" < limite).toBe(true);
    expect("2026-12-03" < limite).toBe(false);
    expect("2026-11-25" < limite).toBe(true);
  });
  it("desconta despesas fixas e não recorrentes mesmo sem vendas", () => {
    const t = totaisRelatorio([], 200, [d(), d({ valor: 50, data_pagamento: "2026-11-25" })]);
    expect(t.naoRecorrentes).toBe(150); expect(t.fixas).toBe(200); expect(t.liquido).toBe(-350);
  });
  it("avisa no dia de vencimento sem antecipar o alerta", () => {
    expect(despesaVencida(d(), "2026-11-26")).toBe(true);
    expect(despesaVencida(d(), "2026-11-25")).toBe(false);
  });
  it("não alerta despesas pagas", () => expect(despesaVencida(d({ data_pagamento: "2026-11-26" }), "2026-11-26")).toBe(false));
  it("preserva o acerto de comissão do guia sem despesas da empresa", () => expect(totaisRelatorio([], 200, [d()], true).liquido).toBe(0));
  it("exporta nomes sem permitir fórmulas ou quebrar colunas", () => {
    expect(csvCelula("=1+1")).toBe('"\'=1+1"'); expect(csvCelula('Táxi; "Rio"')).toBe('"Táxi; ""Rio"""');
  });
});