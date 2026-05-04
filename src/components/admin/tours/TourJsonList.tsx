import { useFieldArray, UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Plus, Trash } from "lucide-react";
import { TourFormValues } from "@/schemas/tour";

interface TourJsonListProps {
  form: UseFormReturn<TourFormValues>;
  name: keyof TourFormValues;
  title: string;
  activeLang: 'pt' | 'en' | 'es';
  fields: { name: string; label: string; placeholder?: string; type?: 'text' | 'textarea' }[];
  icon?: React.ReactNode;
  onImportDefaults?: () => void;
  importLabel?: string;
}

export function TourJsonList({ 
  form, 
  name, 
  title, 
  activeLang, 
  fields, 
  icon, 
  onImportDefaults, 
  importLabel 
}: TourJsonListProps) {
  const fieldName = activeLang === 'pt' ? name : `${String(name)}_${activeLang}`;
  const { fields: items, append, remove } = useFieldArray({
    control: form.control,
    name: fieldName as any,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b pb-2">
        <Label className="font-black text-xs uppercase tracking-widest text-primary flex items-center gap-2">
          {icon} {title} ({activeLang.toUpperCase()})
        </Label>
        <div className="flex items-center gap-4">
          {onImportDefaults && (
            <Button 
              size="sm" 
              variant="outline" 
              onClick={onImportDefaults}
              className="font-bold text-[10px] h-8 text-primary border-primary/20 hover:bg-primary/5"
            >
              ⚡ {importLabel}
            </Button>
          )}
          <Button 
            type="button"
            size="sm" 
            variant="ghost" 
            onClick={() => append({})} 
            className="font-bold text-xs h-8"
          >
            <Plus className="w-3 h-3 mr-1" /> Adicionar
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4">
        {items.map((item, index) => (
          <div key={item.id} className="bg-muted/10 p-4 rounded-2xl border flex gap-4 items-start">
            <div className="flex-1 grid grid-cols-1 gap-3">
              {fields.map((f) => (
                <div key={f.name} className="space-y-1">
                  {f.label && <Label className="text-[10px] uppercase font-bold text-muted-foreground">{f.label}</Label>}
                  {f.type === 'textarea' ? (
                    <textarea 
                      {...form.register(`${fieldName}.${index}.${f.name}` as any)}
                      placeholder={f.placeholder}
                      className="w-full text-sm bg-transparent border-none p-0 min-h-[60px] focus:ring-0"
                    />
                  ) : (
                    <Input 
                      {...form.register(`${fieldName}.${index}.${f.name}` as any)}
                      placeholder={f.placeholder}
                      className="h-10 bg-transparent border-none p-0 focus-visible:ring-0"
                    />
                  )}
                </div>
              ))}
            </div>
            <Button 
              type="button"
              size="icon" 
              variant="ghost" 
              className="text-red-500" 
              onClick={() => remove(index)}
            >
              <Trash className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
