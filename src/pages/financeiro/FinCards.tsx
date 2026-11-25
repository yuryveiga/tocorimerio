import { fmtBRL, totais } from "@/lib/financeiro";
export function FinCards({ t, compact }: { t: ReturnType<typeof totais>; compact?: boolean }) {
  const items = compact ? [["Bruto", t.bruto]] : [["Bruto", t.bruto], ["Comissões", t.comissoes], ["Despesas", t.despesas]];
  return (
    <div className={`grid gap-3 ${compact ? "grid-cols-2" : "grid-cols-2 md:grid-cols-5"}`}>
      {items.map(([l, v]) => (
        <div key={l as string} className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">{l}</p><p className="text-lg font-semibold">{fmtBRL(v as number)}</p>
        </div>
      ))}
      <div className="rounded-xl bg-primary text-primary-foreground p-4">
        <p className="text-xs opacity-80">Líquido</p><p className="text-xl font-bold">{fmtBRL(t.liquido)}</p>
      </div>
      {!compact && <div className="rounded-xl border border-border bg-card p-4"><p className="text-xs text-muted-foreground">Nº de vendas</p><p className="text-lg font-semibold">{t.n}</p></div>}
    </div>
  );
}
