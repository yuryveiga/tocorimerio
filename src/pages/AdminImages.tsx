import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { fetchLovable, insertLovable, updateLovable, deleteLovable, uploadLovableFile, LovableSiteImage } from "@/integrations/lovable/client";
import { Trash2, Upload, Image as ImageIcon, Loader2, Sparkles } from "lucide-react";
import { DeleteConfirmDialog } from "@/components/admin/DeleteConfirmDialog";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";


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
  { key: "nfl_hero", label: "Imagem de Fundo - Jogos NFL" },
  { key: "nilton_santos_hero", label: "Imagem de Fundo - Estádio Nilton Santos" },
  { key: "sao_januario_hero", label: "Imagem de Fundo - Estádio São Januário" },
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
    recompressed: number;
    cacheOnly: number;
    failed: number;
    currentBatch: string[];
  } | null>(null);
  type FileResult = {
    name: string;
    status: string;
    srcSize?: number;
    outSize?: number;
    savings?: number;
    savingsPct?: number;
    resized?: boolean;
    error?: string;
  };
  const [recompressLog, setRecompressLog] = useState<FileResult[]>([]);

  
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
    setRecompressProgress({
      processed: 0,
      total: 0,
      savedBytes: 0,
      recompressed: 0,
      cacheOnly: 0,
      failed: 0,
      currentBatch: [],
    });
    setRecompressLog([]);

    const BUCKET = "site-images";
    const BACKUP_PREFIX = "originals/";
    const QUALITY = 0.72;
    const MAX_DIMENSION = 1920;
    const MIN_SAVINGS_BYTES = 5 * 1024;
    const MIN_SAVINGS_PCT = 5;
    const isImage = (n: string) => /\.(jpe?g|png|webp)$/i.test(n);

    let savedBytes = 0;
    let recompressed = 0;
    let cacheOnly = 0;
    let failed = 0;
    let processed = 0;

    try {
      // 1. List all files in bucket root.
      const { data: files, error: listErr } = await supabase.storage
        .from(BUCKET)
        .list("", { limit: 1000, sortBy: { column: "name", order: "asc" } });
      if (listErr) throw listErr;

      const candidates = (files ?? []).filter(
        (f) =>
          f.name &&
          !f.name.endsWith("/") &&
          !f.name.startsWith(BACKUP_PREFIX) &&
          isImage(f.name),
      );

      // Load backup index once.
      const { data: backups } = await supabase.storage
        .from(BUCKET)
        .list(BACKUP_PREFIX, { limit: 1000 });
      const backupSet = new Set((backups ?? []).map((b) => b.name));

      const total = candidates.length;
      setRecompressProgress({
        processed: 0,
        total,
        savedBytes: 0,
        recompressed: 0,
        cacheOnly: 0,
        failed: 0,
        currentBatch: [],
      });

      for (const file of candidates) {
        const name = file.name;
        setRecompressProgress((p) => (p ? { ...p, currentBatch: [name] } : p));
        let result: FileResult = { name, status: "fail", error: "unknown" };

        try {
          // Download via public URL (bucket is public).
          const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(name);
          const res = await fetch(pub.publicUrl, { cache: "no-store" });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const srcBlob = await res.blob();
          const srcSize = srcBlob.size;
          const srcType = srcBlob.type || "application/octet-stream";

          // Backup if not present.
          if (!backupSet.has(name)) {
            const { error: bkErr } = await supabase.storage
              .from(BUCKET)
              .upload(BACKUP_PREFIX + name, srcBlob, {
                cacheControl: "31536000",
                upsert: false,
                contentType: srcType,
              });
            if (bkErr && !/exists|Duplicate/i.test(bkErr.message)) {
              throw new Error(`backup: ${bkErr.message}`);
            }
            backupSet.add(name);
          }

          // Decode + resize via canvas.
          const bitmap = await createImageBitmap(srcBlob);
          const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
          const w = Math.max(1, Math.round(bitmap.width * scale));
          const h = Math.max(1, Math.round(bitmap.height * scale));
          const wasResized = scale < 1;

          const canvas = document.createElement("canvas");
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext("2d");
          if (!ctx) throw new Error("canvas 2d indisponível");
          ctx.drawImage(bitmap, 0, 0, w, h);
          bitmap.close?.();

          const outBlob: Blob | null = await new Promise((resolve) =>
            canvas.toBlob(resolve, "image/webp", QUALITY),
          );
          if (!outBlob) throw new Error("encode WebP falhou");

          const outSize = outBlob.size;
          const savings = srcSize - outSize;
          const savingsPct = (savings / srcSize) * 100;

          if (!wasResized && (savings < MIN_SAVINGS_BYTES || savingsPct < MIN_SAVINGS_PCT)) {
            // Just refresh cache header.
            const { error: upErr } = await supabase.storage
              .from(BUCKET)
              .update(name, srcBlob, {
                cacheControl: "31536000",
                upsert: true,
                contentType: srcType,
              });
            if (upErr) throw new Error(`cache-refresh: ${upErr.message}`);
            cacheOnly++;
            result = { name, status: "cache-only", srcSize };
          } else {
            const { error: upErr } = await supabase.storage
              .from(BUCKET)
              .update(name, outBlob, {
                cacheControl: "31536000",
                upsert: true,
                contentType: "image/webp",
              });
            if (upErr) throw new Error(`upload: ${upErr.message}`);
            recompressed++;
            savedBytes += savings;
            result = {
              name,
              status: "recompressed",
              srcSize,
              outSize,
              savings,
              savingsPct: Math.round(savingsPct * 10) / 10,
              resized: wasResized,
            };
          }
        } catch (e) {
          failed++;
          result = { name, status: "fail", error: (e as Error).message };
        }

        processed++;
        setRecompressLog((prev) => [result, ...prev].slice(0, 50));
        setRecompressProgress({
          processed,
          total,
          savedBytes,
          recompressed,
          cacheOnly,
          failed,
          currentBatch: [name],
        });

        // Yield to keep the UI responsive.
        await new Promise((r) => setTimeout(r, 0));
      }

      toast({
        title: "Recompressão concluída",
        description: `${processed} imagens processadas. ${(savedBytes / 1024 / 1024).toFixed(2)} MB economizados.`,
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

      <div className="rounded-xl border bg-card p-4 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
          <div>
            <h2 className="font-semibold font-sans text-sm">Otimizar todas as imagens do bucket</h2>
            <p className="text-xs text-muted-foreground mt-1">
              Recomprime cada arquivo em WebP (q=72, máx 1920px) e mantém backup em <code>originals/</code>.
              Executa em lotes de 6 arquivos.
            </p>
          </div>
          <Button onClick={handleRecompress} disabled={recompressing} className="font-sans">
            {recompressing ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processando...</>
            ) : (
              <><Sparkles className="w-4 h-4 mr-2" /> Recomprimir bucket</>
            )}
          </Button>
        </div>

        {recompressProgress && (
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs font-sans mb-1">
                <span className="font-medium">
                  {recompressProgress.processed} / {recompressProgress.total || "?"} arquivos
                </span>
                <span className="text-muted-foreground">
                  {recompressProgress.total
                    ? Math.round((recompressProgress.processed / recompressProgress.total) * 100)
                    : 0}
                  %
                </span>
              </div>
              <Progress
                value={
                  recompressProgress.total
                    ? (recompressProgress.processed / recompressProgress.total) * 100
                    : 0
                }
                className="h-2"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-sans">
              <div className="rounded-md bg-muted/40 p-2">
                <div className="text-muted-foreground">Recomprimidas</div>
                <div className="font-semibold text-base">{recompressProgress.recompressed}</div>
              </div>
              <div className="rounded-md bg-muted/40 p-2">
                <div className="text-muted-foreground">Só cache</div>
                <div className="font-semibold text-base">{recompressProgress.cacheOnly}</div>
              </div>
              <div className="rounded-md bg-muted/40 p-2">
                <div className="text-muted-foreground">Falhas</div>
                <div className="font-semibold text-base">{recompressProgress.failed}</div>
              </div>
              <div className="rounded-md bg-muted/40 p-2">
                <div className="text-muted-foreground">Economia</div>
                <div className="font-semibold text-base">
                  {(recompressProgress.savedBytes / 1024 / 1024).toFixed(2)} MB
                </div>
              </div>
            </div>

            {recompressing && recompressProgress.currentBatch.length > 0 && (
              <p className="text-xs text-muted-foreground font-sans truncate">
                Processando: {recompressProgress.currentBatch.join(", ")}
              </p>
            )}

            {recompressLog.length > 0 && (
              <div className="border rounded-md max-h-56 overflow-auto">
                <ul className="divide-y text-xs font-sans">
                  {recompressLog.map((r, i) => (
                    <li key={i} className="flex items-center justify-between gap-2 px-3 py-1.5">
                      <span className="truncate flex-1" title={r.name}>
                        {r.status === "recompressed" && "✅ "}
                        {r.status === "cache-only" && "🪵 "}
                        {r.status?.startsWith("fail") && "❌ "}
                        {r.name}
                      </span>
                      <span className="text-muted-foreground whitespace-nowrap">
                        {r.status === "recompressed" &&
                          `${((r.srcSize ?? 0) / 1024).toFixed(0)}→${((r.outSize ?? 0) / 1024).toFixed(0)} KB (-${r.savingsPct}%)`}
                        {r.status === "cache-only" && "cache atualizado"}
                        {r.status?.startsWith("fail") && (r.error || r.status)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
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
