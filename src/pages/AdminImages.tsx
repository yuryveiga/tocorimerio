import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { fetchLovable, insertLovable, updateLovable, deleteLovable, uploadLovableFile, LovableSiteImage } from "@/integrations/lovable/client";
import { Trash2, Upload, Image as ImageIcon, Loader2, Sparkles } from "lucide-react";
import { DeleteConfirmDialog } from "@/components/admin/DeleteConfirmDialog";
import { supabase } from "@/integrations/supabase/client";


const PRESET_KEYS = [
  { key: "logo", label: "Logo do Site" },
  { key: "hero_bg", label: "Fundo do Hero Principal" },
  { key: "hero_bg_2", label: "Fundo do Hero (Opção 2)" },
  { key: "hero_bg_3", label: "Fundo do Hero (Opção 3)" },
  { key: "about_1", label: "Sobre a Eco-Wanderlust - Imagem 1" },
  { key: "about_2", label: "Sobre a Eco-Wanderlust - Imagem 2" },
  { key: "about_3", label: "Sobre a Eco-Wanderlust - Imagem 3" },
  { key: "about_4", label: "Sobre a Eco-Wanderlust - Imagem 4" },
  { key: "maracana_hero", label: "Imagem de Fundo - Maracanã" },
];

const AdminImages = () => {
  const [images, setImages] = useState<LovableSiteImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [recompressing, setRecompressing] = useState(false);
  const [recompressProgress, setRecompressProgress] = useState<{
    processed: number;
    total: number;
    savedBytes: number;
  } | null>(null);

  
  const { toast } = useToast();

  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
    setIsLoading(true);
    const data = await fetchLovable<LovableSiteImage>("site_images");
    setImages(data);
    setIsLoading(false);
  };

  const handleUpload = async (key: string, label: string, file: File) => {
    setUploadingKey(key);
    try {
      const publicUrl = await uploadLovableFile(file);
      if (!publicUrl) throw new Error("Falha no upload");

      const existingImage = images.find(img => img.key === key);
      
      const dataToSave = {
        key,
        label,
        image_url: publicUrl
      };

      if (existingImage && existingImage.id) {
        await updateLovable("site_images", existingImage.id, dataToSave);
      } else {
        await insertLovable("site_images", dataToSave as LovableSiteImage);
      }

      toast({ title: "Imagem atualizada no site!" });
      await loadImages();
    } catch (e) {
      toast({ title: "Erro", description: "Não foi possível enviar a imagem.", variant: "destructive" });
    } finally {
      setUploadingKey(null);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteLovable("site_images", id);
    toast({ title: "Imagem removida" });
    setItemToDelete(null);
    await loadImages();
  };

  const handleRecompress = async () => {
    if (recompressing) return;
    setRecompressing(true);
    setRecompressProgress({ processed: 0, total: 0, savedBytes: 0 });
    let offset = 0;
    let savedBytes = 0;
    let total = 0;
    try {
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { data, error } = await supabase.functions.invoke("recompress-bucket", {
          body: { offset, limit: 6 },
        });
        if (error) throw error;
        if (!data) throw new Error("Resposta vazia");
        total = data.total ?? 0;
        for (const r of data.results ?? []) {
          if (r.status === "recompressed" && typeof r.savings === "number") {
            savedBytes += r.savings;
          }
        }
        offset = data.nextOffset ?? offset + (data.processed ?? 0);
        setRecompressProgress({ processed: offset, total, savedBytes });
        if (data.done) break;
      }
      toast({
        title: "Recompressão concluída",
        description: `${offset} imagens processadas. ${(savedBytes / 1024 / 1024).toFixed(2)} MB economizados.`,
      });
    } catch (e) {
      toast({
        title: "Erro na recompressão",
        description: (e as Error).message,
        variant: "destructive",
      });
    } finally {
      setRecompressing(false);
    }
  };


  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold text-foreground">Imagens Estruturais do Site</h1>
        <p className="text-muted-foreground font-sans text-sm mt-1">
          Edite as fotos principais usadas na estrutura do site (Logo, Banners, Fundo, etc).
        </p>
      </div>

      <div className="rounded-xl border bg-card p-4 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div>
          <h2 className="font-semibold font-sans text-sm">Otimizar todas as imagens do bucket</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Recomprime cada arquivo em WebP (q=72, máx 1920px) e mantém backup em <code>originals/</code>.
            Executa em lotes de 6 arquivos.
          </p>
          {recompressProgress && (
            <p className="text-xs text-muted-foreground mt-1">
              Progresso: {recompressProgress.processed}/{recompressProgress.total} · Economia: {(recompressProgress.savedBytes / 1024 / 1024).toFixed(2)} MB
            </p>
          )}
        </div>
        <Button onClick={handleRecompress} disabled={recompressing} className="font-sans">
          {recompressing ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processando...</>
          ) : (
            <><Sparkles className="w-4 h-4 mr-2" /> Recomprimir bucket</>
          )}
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground font-sans flex items-center justify-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin" /> Carregando layout...
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {PRESET_KEYS.map((preset) => {
            const existingImage = images.find((i) => i.key === preset.key);
            
            return (
              <ImageCard 
                key={preset.key} 
                preset={preset} 
                img={existingImage} 
                isUploading={uploadingKey === preset.key}
                onUpload={(file) => handleUpload(preset.key, preset.label, file)}
                onDelete={() => existingImage?.id && setItemToDelete(existingImage.id)}
              />
            );
          })}
        </div>
      )}

      <DeleteConfirmDialog 
        open={!!itemToDelete} 
        onOpenChange={(open) => !open && setItemToDelete(null)} 
        onConfirm={() => itemToDelete && handleDelete(itemToDelete)}
        title="Remover Imagem Estrutural"
        description="Tem certeza que deseja remover esta imagem? Isso pode impactar o design visual do site até que uma nova imagem seja definida."
      />
    </div>
  );
};

import { OptimizedImage } from "@/components/OptimizedImage";

// Subcomponent para gerenciar o input invisível localmente sem encher a tela de Refs
const ImageCard = ({ 
  preset, 
  img, 
  isUploading, 
  onUpload, 
  onDelete 
}: { 
  preset: typeof PRESET_KEYS[0], 
  img: LovableSiteImage | undefined, 
  isUploading: boolean, 
  onUpload: (file: File) => void,
  onDelete: () => void 
}) => {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(file);
    }
    // reset input
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="bg-card rounded-xl border overflow-hidden shadow-sm flex flex-col">
      <div className="p-4 border-b bg-muted/20">
        <h3 className="font-semibold font-sans">{preset.label}</h3>
        <p className="text-xs text-muted-foreground">Chave: {preset.key}</p>
      </div>
      <div className="relative aspect-video overflow-hidden bg-muted/30">
        {isUploading ? (
           <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm z-10">
             <Loader2 className="w-8 h-8 text-primary animate-spin mb-2" />
             <p className="text-xs font-medium">Enviando...</p>
           </div>
        ) : img?.image_url ? (
          <OptimizedImage 
            src={img.image_url} 
            alt={preset.label} 
            width={400}
            containerClassName="w-full h-full"
            className="w-full h-full object-cover" 
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
            <ImageIcon className="w-10 h-10 mb-2 opacity-20" />
            <span className="text-xs font-medium opacity-50">Nenhuma imagem definida</span>
          </div>
        )}
      </div>
      <div className="p-4 flex gap-2">
        <input 
          ref={fileRef}
          type="file" 
          accept="image/*" 
          onChange={handleFile} 
          className="hidden" 
        />
        <Button 
          variant={img?.image_url ? "outline" : "default"} 
          className="flex-1 font-sans text-xs" 
          onClick={() => fileRef.current?.click()}
          disabled={isUploading}
        >
          <Upload className="w-3 h-3 mr-2" />
          {img?.image_url ? "Alterar Imagem" : "Adicionar Imagem"}
        </Button>

        {img?.image_url && (
          <Button variant="ghost" size="icon" onClick={onDelete} title="Remover" className="text-destructive hover:text-destructive hover:bg-destructive/10">
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default AdminImages;
