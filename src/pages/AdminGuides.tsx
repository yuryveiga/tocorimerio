import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { uploadLovableFile } from "@/integrations/lovable/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Upload } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DeleteConfirmDialog } from "@/components/admin/DeleteConfirmDialog";
import type { Guide } from "@/components/GuidesSection";

const empty: Partial<Guide> = {
  name: "",
  role: "",
  role_en: "",
  role_es: "",
  bio: "",
  bio_en: "",
  bio_es: "",
  photo_url: "",
  languages: [],
  sort_order: 0,
  is_active: true,
};

const AdminGuides = () => {
  const [guides, setGuides] = useState<Guide[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<Guide> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const { toast } = useToast();

  const load = async () => {
    const { data } = await supabase.from("guides").select("*").order("sort_order", { ascending: true });
    setGuides((data as Guide[]) || []);
    setIsLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleUpload = async (file: File) => {
    setUploading(true);
    const url = await uploadLovableFile(file);
    setUploading(false);
    if (url) setEditing((prev) => ({ ...(prev || {}), photo_url: url }));
  };

  const handleSave = async () => {
    if (!editing?.name) {
      toast({ title: "Erro", description: "O nome é obrigatório", variant: "destructive" });
      return;
    }
    const payload = {
      name: editing.name,
      role: editing.role || null,
      role_en: editing.role_en || null,
      role_es: editing.role_es || null,
      bio: editing.bio || null,
      bio_en: editing.bio_en || null,
      bio_es: editing.bio_es || null,
      photo_url: editing.photo_url || null,
      languages: editing.languages || [],
      sort_order: editing.sort_order ?? 0,
      is_active: editing.is_active ?? true,
    };

    const { error } = isNew
      ? await supabase.from("guides").insert(payload)
      : await supabase.from("guides").update(payload).eq("id", editing.id!);

    if (error) {
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: isNew ? "Guia criado!" : "Guia atualizado!" });
    setEditing(null);
    load();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("guides").delete().eq("id", id);
    if (error) {
      toast({ title: "Erro ao excluir", description: error.message, variant: "destructive" });
    } else {
      setGuides(guides.filter((g) => g.id !== id));
      toast({ title: "Guia removido" });
    }
    setItemToDelete(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">Guias</h1>
          <p className="text-muted-foreground font-sans text-sm mt-1">
            Cadastre os guias exibidos na página Sobre Nós
          </p>
        </div>
        <Button
          onClick={() => {
            setEditing({ ...empty, sort_order: guides.length });
            setIsNew(true);
          }}
          className="font-sans"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Guia
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground font-sans">Carregando...</div>
      ) : guides.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground font-sans">Nenhum guia cadastrado.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {guides.map((guide) => (
            <div key={guide.id} className="bg-card rounded-xl border border-border/50 p-4 flex gap-4">
              <div className="w-20 h-24 rounded-lg overflow-hidden bg-muted shrink-0">
                {guide.photo_url && (
                  <img src={guide.photo_url} alt={guide.name} className="w-full h-full object-cover" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground font-sans truncate">{guide.name}</h3>
                <p className="text-xs text-muted-foreground font-sans truncate">{guide.role}</p>
                <p className="text-xs text-muted-foreground font-sans line-clamp-2 mt-1">{guide.bio}</p>
                <div className="flex items-center gap-2 mt-3">
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-sans ${
                      guide.is_active ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {guide.is_active ? "Ativo" : "Inativo"}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7 ml-auto"
                    onClick={() => {
                      setEditing({ ...guide });
                      setIsNew(false);
                    }}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setItemToDelete(guide.id)}>
                    <Trash2 className="w-3.5 h-3.5 text-destructive" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif">{isNew ? "Novo Guia" : "Editar Guia"}</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-24 h-28 rounded-lg overflow-hidden bg-muted shrink-0">
                  {editing.photo_url && (
                    <img src={editing.photo_url} alt="" className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="space-y-2 flex-1">
                  <Label className="font-sans">Foto</Label>
                  <Input
                    type="file"
                    accept="image/*"
                    disabled={uploading}
                    onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
                  />
                  {uploading && (
                    <p className="text-xs text-muted-foreground font-sans flex items-center gap-1">
                      <Upload className="w-3 h-3" /> Enviando...
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="font-sans">Nome</Label>
                <Input value={editing.name ?? ""} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label className="font-sans">Função (PT)</Label>
                  <Input value={editing.role ?? ""} onChange={(e) => setEditing({ ...editing, role: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label className="font-sans">Função (EN)</Label>
                  <Input
                    value={editing.role_en ?? ""}
                    onChange={(e) => setEditing({ ...editing, role_en: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-sans">Função (ES)</Label>
                  <Input
                    value={editing.role_es ?? ""}
                    onChange={(e) => setEditing({ ...editing, role_es: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="font-sans">Bio (PT)</Label>
                <Textarea rows={3} value={editing.bio ?? ""} onChange={(e) => setEditing({ ...editing, bio: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label className="font-sans">Bio (EN)</Label>
                <Textarea rows={3} value={editing.bio_en ?? ""} onChange={(e) => setEditing({ ...editing, bio_en: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label className="font-sans">Bio (ES)</Label>
                <Textarea rows={3} value={editing.bio_es ?? ""} onChange={(e) => setEditing({ ...editing, bio_es: e.target.value })} />
              </div>

              <div className="grid grid-cols-3 gap-3 items-end">
                <div className="space-y-2 col-span-1">
                  <Label className="font-sans">Idiomas (separados por vírgula)</Label>
                  <Input
                    value={(editing.languages || []).join(", ")}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        languages: e.target.value
                          .split(",")
                          .map((s) => s.trim())
                          .filter(Boolean),
                      })
                    }
                    placeholder="EN, PT, ES"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-sans">Ordem</Label>
                  <Input
                    type="number"
                    value={editing.sort_order ?? 0}
                    onChange={(e) => setEditing({ ...editing, sort_order: Number(e.target.value) })}
                  />
                </div>
                <div className="flex items-center gap-2 pb-2">
                  <Switch
                    checked={editing.is_active ?? true}
                    onCheckedChange={(v) => setEditing({ ...editing, is_active: v })}
                  />
                  <Label className="font-sans">Ativo</Label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setEditing(null)} className="font-sans">
                  Cancelar
                </Button>
                <Button onClick={handleSave} className="font-sans">
                  Salvar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        open={!!itemToDelete}
        onOpenChange={(open) => !open && setItemToDelete(null)}
        onConfirm={() => itemToDelete && handleDelete(itemToDelete)}
        title="Excluir Guia"
        description="Tem certeza que deseja remover este guia? Ele deixará de aparecer no site."
      />
    </div>
  );
};

export default AdminGuides;
