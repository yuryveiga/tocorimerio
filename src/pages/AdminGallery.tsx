import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Images, ImagePlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { uploadLovableFile } from "@/integrations/lovable/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DeleteConfirmDialog } from "@/components/admin/DeleteConfirmDialog";
import { OptimizedImage } from "@/components/OptimizedImage";


const CATEGORIES = [
  { value: "todas", label: "Todas as categorias" },
  { value: "maracana", label: "Maracanã" },
  { value: "nilton_santos", label: "Nilton Santos" },
  { value: "praia", label: "Praia" },
  { value: "trilha", label: "Trilha" },
  { value: "city_tour", label: "City Tour" },
  { value: "barco", label: "Barco" },
];

export type SiteImage = {
  id: string;
  key: string;
  image_url: string;
  label: string;
};

const AdminGallery = () => {
  const [images, setImages] = useState<SiteImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [itemToDelete, setItemToDelete] = useState<SiteImage | null>(null);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);

  
  // Form Upload state
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [uploadCategory, setUploadCategory] = useState("todas");
  const [uploadLabel, setUploadLabel] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter state
  const [filterCategory, setFilterCategory] = useState("todas");

  const { toast } = useToast();

  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('site_images')
      .select('*')
      .like('key', 'gallery%')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setImages(data);
    }
    setIsLoading(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const fileArray = Array.from(files);
      setSelectedFiles(fileArray);
      
      const urls = fileArray.map(file => URL.createObjectURL(file));
      // Cleanup old preview URLs
      previewUrls.forEach(url => URL.revokeObjectURL(url));
      setPreviewUrls(urls);
    }
  };

  const clearForm = () => {
    setSelectedFiles([]);
    previewUrls.forEach(url => URL.revokeObjectURL(url));
    setPreviewUrls([]);
    setUploadLabel("");
    setUploadCategory("todas");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      toast({ title: "Aviso", description: "Selecione ao menos uma imagem primeiro.", variant: "destructive" });
      return;
    }

    setIsUploading(true);
    let successCount = 0;

    try {
      for (const selectedFile of selectedFiles) {
        const publicUrl = await uploadLovableFile(selectedFile);
        if (!publicUrl) continue;

        const key = `gallery__${uploadCategory}__${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        
        const { error: insertError } = await supabase
          .from('site_images')
          .insert({
            key,
            image_url: publicUrl,
            label: selectedFiles.length > 1 ? `${uploadLabel || 'Galeria'} (${successCount + 1})` : uploadLabel
          });

        if (insertError) throw insertError;
        successCount++;
      }

      if (successCount > 0) {
        toast({ title: `${successCount} foto(s) salva(s) com sucesso!` });
        clearForm();
        await loadImages();
      } else {
        throw new Error("Nenhuma imagem foi salva corretamente.");
      }
    } catch (error: unknown) {
      console.error(error);
      const message = error instanceof Error ? error.message : "Ocorreu um erro no upload da imagem.";
      toast({ title: "Erro", description: message, variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredImages.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredImages.map(img => img.id)));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return;
    setIsBulkDeleteOpen(true);
  };

  const confirmDeleteSelected = async () => {
    setIsBulkDeleteOpen(false);
    const idsToDelete = Array.from(selectedIds);

    
    for (const img of images.filter(i => selectedIds.has(i.id))) {
      try {
        if (img.image_url.includes('site-images')) {
          const fileName = img.image_url.substring(img.image_url.lastIndexOf('/') + 1);
          await supabase.storage.from('site-images').remove([fileName]);
        }
      } catch(e) {
        console.warn("Could not delete from storage:", e);
      }
    }

    const { error } = await supabase.from('site_images').delete().in('id', idsToDelete);
    if (!error) {
      toast({ title: `${idsToDelete.length} foto(s) removida(s)` });
      setSelectedIds(new Set());
      await loadImages();
    }
  };

  const handleDelete = async (img: SiteImage) => {
    try {
      if (img.image_url.includes('site-images')) {
        const fileName = img.image_url.substring(img.image_url.lastIndexOf('/') + 1);
        await supabase.storage.from('site-images').remove([fileName]);
      }
    } catch(e) {
      console.warn("Could not delete from storage:", e);
    }

    const { error } = await supabase.from('site_images').delete().eq('id', img.id);
    if (!error) {
      toast({ title: "Foto removida" });
      setItemToDelete(null);
      await loadImages();
    }
  };

  const handleChangeCategory = async (img: SiteImage, newCategory: string) => {
    const parts = img.key.split('__');
    let newKey = img.key;
    if (parts.length >= 3 && parts[0] === 'gallery') {
      newKey = `gallery__${newCategory}__${parts[2]}`;
    } else {
      newKey = `gallery__${newCategory}__${Date.now()}`;
    }

    const { error } = await supabase
      .from('site_images')
      .update({ key: newKey })
      .eq('id', img.id);

    if (!error) {
      toast({ title: "Categoria atualizada!" });
      setImages(prev => prev.map(item => item.id === img.id ? { ...item, key: newKey } : item));
    } else {
      toast({ title: "Erro", description: "Não foi possível atualizar a categoria.", variant: "destructive" });
    }
  };

  const handleChangeCategoryBulk = async (newCategory: string) => {
    if (selectedIds.size === 0) return;
    
    const updates: { id: string, key: string }[] = [];
    const updatedImages = images.map(img => {
      if (selectedIds.has(img.id)) {
        const parts = img.key.split('__');
        let newKey = img.key;
        if (parts.length >= 3 && parts[0] === 'gallery') {
          newKey = `gallery__${newCategory}__${parts[2]}`;
        } else {
          newKey = `gallery__${newCategory}__${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        }
        updates.push({ id: img.id, key: newKey });
        return { ...img, key: newKey };
      }
      return img;
    });

    try {
      for (const update of updates) {
         await supabase.from('site_images').update({ key: update.key }).eq('id', update.id);
      }
      toast({ title: `${updates.length} fotos atualizadas para ${CATEGORIES.find(c => c.value === newCategory)?.label}!` });
      setImages(updatedImages);
      setSelectedIds(new Set());
    } catch (err) {
      toast({ title: "Erro", description: "Falha ao atualizar categorias em lote.", variant: "destructive" });
    }
  };

  const getCategoryFromKey = (key: string) => {
    const parts = key.split('__');
    if (parts.length >= 3 && parts[0] === 'gallery') {
      return parts[1];
    }
    return "todas";
  };

  const filteredImages = images.filter((img) => 
    filterCategory === "todas" ? true : getCategoryFromKey(img.key) === filterCategory
  );

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-3xl font-bold text-foreground">Galeria de Fotos</h1>

      <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 mb-4 text-foreground font-semibold">
          <ImagePlus className="w-5 h-5 text-primary" />
          <h2>Adicionar Fotos</h2>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <Input 
            value={uploadLabel} 
            onChange={(e) => setUploadLabel(e.target.value)} 
            placeholder="Legenda compartilhada (opcional)" 
            className="flex-1 bg-background"
          />
          <div className="w-full md:w-64">
            <Select value={uploadCategory} onValueChange={setUploadCategory}>
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1 w-full flex items-center gap-2 border bg-background rounded-lg overflow-hidden relative cursor-pointer" onClick={() => fileInputRef.current?.click()}>
             <input 
              ref={fileInputRef} 
              type="file" 
              accept="image/*" 
              multiple
              onChange={handleFileChange} 
              className="absolute inset-0 opacity-0 cursor-pointer hidden" 
            />
             <div className="bg-muted px-4 py-2 border-r text-sm whitespace-nowrap cursor-pointer hover:bg-muted/80">Escolher arquivos</div>
             <div className="text-sm text-muted-foreground truncate ml-2">
                 {selectedFiles.length > 0 ? `${selectedFiles.length} arquivo(s) selecionado(s)` : "Nenhum arquivo escolhido"}
             </div>
          </div>
          {previewUrls.length > 0 && (
            <div className="flex gap-1 overflow-hidden max-w-[120px]">
               {previewUrls.slice(0, 3).map((url, i) => (
                  <OptimizedImage 
                    key={i} 
                    src={url} 
                    alt="Preview" 
                    width={100}
                    containerClassName="h-10 w-10 overflow-hidden"
                    className="h-full w-full object-cover rounded" 
                  />
               ))}
               {previewUrls.length > 3 && <div className="h-10 w-10 bg-muted rounded flex items-center justify-center text-xs font-semibold">+{previewUrls.length - 3}</div>}
            </div>
          )}
          <Button onClick={handleUpload} disabled={isUploading || selectedFiles.length === 0} className="w-full md:w-auto">
            {isUploading ? "Enviando..." : "Adicionar Fotos"}
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <span className="text-sm font-medium">Filtrar por categoria:</span>
        <div className="w-48">
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="bg-card">
              <SelectValue placeholder="Todas as categorias" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map(cat => (
                <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Carregando fotos...</div>
      ) : images.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">Nenhuma foto encontrada na galeria.</div>
      ) : filteredImages.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">Nenhuma foto para esta categoria.</div>
      ) : (
        <>
          {selectedIds.size > 0 && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-primary/5 border border-primary/20 rounded-xl px-4 py-3 gap-4 mb-4">
              <span className="text-sm font-bold text-primary">{selectedIds.size} foto(s) selecionada(s)</span>
              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                <div className="flex items-center gap-2 flex-1 sm:flex-none">
                  <span className="text-xs font-semibold whitespace-nowrap">Mover para:</span>
                  <Select onValueChange={(val) => { if (val) handleChangeCategoryBulk(val); }}>
                    <SelectTrigger className="h-8 text-xs bg-background w-32">
                      <SelectValue placeholder="Categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.filter(c => c.value !== "todas").map(c => (
                        <SelectItem key={c.value} value={c.value} className="text-xs">{c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="h-4 w-px bg-border hidden sm:block"></div>
                <Button variant="outline" size="sm" onClick={() => setSelectedIds(new Set())}>Cancelar</Button>
                <Button variant="destructive" size="sm" onClick={handleDeleteSelected}>
                  <Trash2 className="w-4 h-4 mr-1" /> Excluir
                </Button>
              </div>
            </div>
          )}
          <div className="flex items-center justify-between mb-4">
            <Button variant="outline" size="sm" onClick={toggleSelectAll}>
              {selectedIds.size === filteredImages.length ? "Desmarcar Todos" : "Selecionar Todos"}
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredImages.map((img) => {
              const cat = getCategoryFromKey(img.key);
              const isSelected = selectedIds.has(img.id);
              
              return (
                <div key={img.id} className={`bg-card rounded-xl border overflow-hidden flex flex-col group cursor-pointer transition-all ${isSelected ? 'ring-2 ring-primary' : ''}`} onClick={() => toggleSelect(img.id)}>
                <div className="relative aspect-[4/3] overflow-hidden">
                  {img.image_url ? (
                    <OptimizedImage 
                      src={img.image_url} 
                      alt={img.label} 
                      width={300}
                      containerClassName="w-full h-full"
                      className="w-full h-full object-cover transition-transform group-hover:scale-105" 
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <Images className="w-12 h-12 text-muted-foreground/30" />
                    </div>
                  )}
                  {img.label && (
                    <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/60 to-transparent p-2 text-white text-xs truncate">
                      {img.label}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button variant="destructive" size="icon" onClick={(e) => { e.stopPropagation(); setItemToDelete(img); }}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="p-2 border-t bg-muted/30">
                  <Select value={cat} onValueChange={(val) => handleChangeCategory(img, val)}>
                    <SelectTrigger className="h-8 text-xs border-0 bg-transparent shadow-none focus:ring-0">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(c => (
                        <SelectItem key={c.value} value={c.value} className="text-xs">{c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              );
            })}
          </div>
        </>
      )}
      <DeleteConfirmDialog 
        open={!!itemToDelete} 
        onOpenChange={(open) => !open && setItemToDelete(null)} 
        onConfirm={() => itemToDelete && handleDelete(itemToDelete)}
        title="Excluir Foto"
        description="Tem certeza que deseja remover esta foto permanentemente? Ela deixará de ser exibida na galeria pública."
      />

      <DeleteConfirmDialog 
        open={isBulkDeleteOpen} 
        onOpenChange={setIsBulkDeleteOpen} 
        onConfirm={confirmDeleteSelected}
        title={`Excluir ${selectedIds.size} Fotos`}
        description={`Tem certeza que deseja excluir permanentemente as ${selectedIds.size} fotos selecionadas? Esta ação não pode ser desfeita.`}
      />
    </div>
  );
};

export default AdminGallery;
