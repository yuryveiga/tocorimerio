import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";

export interface CustomOption {
  title: string;
  price: number;
  positive_notices: string[];
  negative_notices: string[];
}

interface Props {
  enabled: boolean;
  onEnabledChange: (v: boolean) => void;
  value: CustomOption[];
  onChange: (v: CustomOption[]) => void;
}

const lines = (s: string) => s.split("\n").map((l) => l.trim()).filter(Boolean);

export function CustomOptionsEditor({ enabled, onEnabledChange, value, onChange }: Props) {
  const update = (i: number, patch: Partial<CustomOption>) =>
    onChange(value.map((o, idx) => (idx === i ? { ...o, ...patch } : o)));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <Label className="text-xs font-black uppercase tracking-widest text-primary">Opções (ex.: transfers)</Label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={enabled} onChange={(e) => onEnabledChange(e.target.checked)} className="w-5 h-5" />
          <span className="text-sm font-bold">Mostrar opções no passeio</span>
        </label>
      </div>
      <p className="text-xs text-muted-foreground">
        O cliente escolhe uma opção. O preço é fixo para até 4 pessoas. Acima de 4, o cliente vê um aviso para entrar em contato. Use 0 para uma opção sem custo extra.
      </p>

      {value.map((o, i) => (
        <div key={i} className="bg-background border rounded-xl p-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_160px_auto] gap-3 items-end">
            <div className="space-y-1">
              <Label className="text-xs">Nome da opção</Label>
              <Input value={o.title} placeholder="Ex.: Transfer saindo de Copacabana" onChange={(e) => update(i, { title: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Preço até 4 pessoas (R$)</Label>
              <Input type="number" min={0} step="0.01" value={o.price} onChange={(e) => update(i, { price: Math.max(0, Number(e.target.value) || 0) })} />
            </div>
            <Button type="button" variant="ghost" size="icon" aria-label="Remover opção" onClick={() => onChange(value.filter((_, idx) => idx !== i))}>
              <Trash2 className="w-4 h-4 text-destructive" />
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Inclui (uma por linha)</Label>
              <textarea className="w-full min-h-[70px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                defaultValue={(o.positive_notices || []).join("\n")}
                onBlur={(e) => update(i, { positive_notices: lines(e.target.value) })} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Não inclui (uma por linha)</Label>
              <textarea className="w-full min-h-[70px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                defaultValue={(o.negative_notices || []).join("\n")}
                onBlur={(e) => update(i, { negative_notices: lines(e.target.value) })} />
            </div>
          </div>
        </div>
      ))}

      <Button type="button" variant="outline" onClick={() => onChange([...value, { title: "", price: 0, positive_notices: [], negative_notices: [] }])}>
        <Plus className="w-4 h-4 mr-2" /> Adicionar opção
      </Button>
    </div>
  );
}
