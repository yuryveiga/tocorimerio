import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, TrendingDown, Users } from "lucide-react";
import { PricingTier } from "@/types";

interface TieredPricingEditorProps {
  value: PricingTier[];
  onChange: (tiers: PricingTier[]) => void;
}

function formatBRL(value: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

export function TieredPricingEditor({ value, onChange }: TieredPricingEditorProps) {
  const tiers = value || [];

  const addTier = () => {
    const lastTier = tiers[tiers.length - 1];
    const newMin = lastTier ? (lastTier.max_people != null ? lastTier.max_people + 1 : (lastTier.min_people + 1)) : 1;
    onChange([
      ...tiers,
      { min_people: newMin, max_people: null, price_per_person: 0 },
    ]);
  };

  const updateTier = (index: number, field: keyof PricingTier, raw: string) => {
    const updated = tiers.map((tier, i) => {
      if (i !== index) return tier;
      if (field === "max_people") {
        const trimmed = raw.trim();
        return { ...tier, max_people: trimmed === "" || trimmed === "∞" ? null : Number(trimmed) };
      }
      return { ...tier, [field]: raw === "" ? 0 : Number(raw) };
    });
    onChange(updated);
  };

  const removeTier = (index: number) => {
    onChange(tiers.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingDown className="w-4 h-4 text-primary" />
          <span className="text-xs font-black uppercase tracking-widest text-primary">
            Faixas de Preço por Pessoas
          </span>
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={addTier}
          className="h-8 text-xs font-bold gap-1"
        >
          <Plus className="w-3 h-3" /> Adicionar Faixa
        </Button>
      </div>

      {tiers.length === 0 && (
        <div className="text-center py-8 text-muted-foreground text-sm border-2 border-dashed rounded-2xl">
          <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
          Nenhuma faixa definida. Clique em "Adicionar Faixa".
        </div>
      )}

      {/* Column headers */}
      {tiers.length > 0 && (
        <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-3 px-1">
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Mín. pessoas</span>
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Máx. pessoas</span>
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">R$/pessoa</span>
          <span />
        </div>
      )}

      {/* Tier rows */}
      <div className="space-y-2">
        {tiers.map((tier, index) => (
          <div
            key={index}
            className="grid grid-cols-[1fr_1fr_1fr_auto] gap-3 items-center bg-muted/20 px-4 py-3 rounded-2xl border border-border/50"
          >
            <Input
              type="number"
              min={1}
              value={tier.min_people || ""}
              onChange={(e) => updateTier(index, "min_people", e.target.value)}
              placeholder="1"
              className="h-10 text-center font-bold"
            />
            <Input
              type="text"
              value={tier.max_people == null ? "" : String(tier.max_people)}
              onChange={(e) => updateTier(index, "max_people", e.target.value)}
              placeholder="∞ (ilimitado)"
              className="h-10 text-center font-bold"
            />
            <Input
              type="number"
              min={0}
              value={tier.price_per_person || ""}
              onChange={(e) => updateTier(index, "price_per_person", e.target.value)}
              placeholder="0"
              className="h-10 text-center font-bold"
            />
            <Button
              type="button"
              size="icon"
              variant="ghost"
              onClick={() => removeTier(index)}
              className="h-10 w-10 text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>

      {/* Preview */}
      {tiers.length > 0 && (
        <div className="bg-primary/5 border border-primary/15 rounded-2xl p-4 space-y-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-primary">Preview da tabela</span>
          <div className="space-y-1">
            {tiers.map((tier, index) => {
              const min = tier.min_people;
              const max = tier.max_people;
              const label =
                max == null
                  ? `${min}+ pessoas`
                  : min === max
                  ? `${min} pessoa${min > 1 ? "s" : ""}`
                  : `${min}–${max} pessoas`;
              return (
                <div key={index} className="flex justify-between text-sm">
                  <span className="font-medium text-muted-foreground">{label}</span>
                  <span className="font-black text-primary">
                    {tier.price_per_person > 0 ? `${formatBRL(tier.price_per_person)}/pessoa` : "—"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
