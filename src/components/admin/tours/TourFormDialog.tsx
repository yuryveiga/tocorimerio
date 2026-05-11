import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, Loader2, ExternalLink, Youtube, MapPin, List, Info, Star, HelpCircle, Sunrise, Moon } from "lucide-react";
import { useTourForm } from "@/hooks/admin/useTourForm";
import { LovableTour, LovableSiteImage, fetchLovable } from "@/integrations/lovable/client";
import { TourJsonList } from "./TourJsonList";
import { TourGalleryTab } from "./TourGalleryTab";


interface TourFormDialogProps {
  editing: Partial<LovableTour> | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  siteSettings: Record<string, string>;
  getPedraDaGaveaDefaults: () => any;
}

export function TourFormDialog({ 
  editing, 
  isOpen, 
  onClose, 
  onSuccess, 
  siteSettings,
  getPedraDaGaveaDefaults
}: TourFormDialogProps) {
  const { 
    form, 
    onSubmit, 
    handleAutoTranslate, 
    handleFileUpload, 
    isUploading, 
    isTranslating 
  } = useTourForm(editing, onSuccess);

  const [activeInfoLang, setActiveInfoLang] = useState<'pt' | 'en' | 'es'>('pt');
  const [galleryImages, setGalleryImages] = useState<LovableSiteImage[]>([]);

  useEffect(() => {
    if (isOpen) {
      fetchLovable<LovableSiteImage>("site_images").then(imgs => {
        setGalleryImages(imgs.filter(i => i.key?.startsWith('gallery')));
      });
    }
  }, [isOpen]);

  if (!editing) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-6xl h-[95vh] flex flex-col p-0 overflow-hidden border-none shadow-2xl font-sans" onPointerDownOutside={(e) => e.preventDefault()}>
        <form onSubmit={onSubmit} className="flex-1 flex flex-col h-full overflow-hidden">
          <Tabs defaultValue="content" className="flex-1 flex flex-col h-full overflow-hidden">
            <DialogHeader className="p-6 pb-0 border-b bg-muted/20 shrink-0">
              <DialogTitle className="font-serif text-2xl mb-4">
                {editing.id ? "Ajustar Detalhes do Passeio" : "Criar Experiência Premium"}
              </DialogTitle>
              <TabsList className="w-full justify-start gap-4 bg-transparent border-none p-0 mb-[-1px] overflow-x-auto">
                <TabsTrigger value="content" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-6 py-3 font-bold">Conteúdo Base</TabsTrigger>
                <TabsTrigger value="info" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-6 py-3 font-bold">Informações</TabsTrigger>
                <TabsTrigger value="gallery" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-6 py-3 font-bold">Imagens</TabsTrigger>
                <TabsTrigger value="settings" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-6 py-3 font-bold">Configurações</TabsTrigger>
              </TabsList>
            </DialogHeader>

            <div className="flex-1 overflow-hidden flex flex-col">
              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                
                {/* CONTENT TAB */}
                <TabsContent value="content" className="m-0 space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-xs uppercase font-bold text-muted-foreground">Título (PT)</Label>
                          <Input {...form.register("title")} className="h-12 font-serif text-lg" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs uppercase font-bold text-muted-foreground">Categoria</Label>
                          <div className="flex gap-4 flex-wrap">
                            {['CITY TOUR', 'TRILHA'].map(cat => (
                              <label key={cat} className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="radio"
                                  value={cat}
                                  {...form.register("category")}
                                  className="w-5 h-5 text-primary"
                                />
                                <span className="font-bold">{cat}</span>
                              </label>
                            ))}
                            {siteSettings['home_category_3'] && (
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="radio"
                                  value={siteSettings['home_category_3']}
                                  {...form.register("category")}
                                  className="w-5 h-5 text-primary"
                                />
                                <span className="font-bold">{siteSettings['home_category_3']}</span>
                              </label>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-3 bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-blue-600 flex items-center gap-2">
                          <ExternalLink className="w-4 h-4" /> Link Externo
                        </Label>
                        <Input {...form.register("external_url")} placeholder="https://..." className="h-12 border-blue-200 bg-white" />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs uppercase font-bold text-muted-foreground">Resumo (PT)</Label>
                        <textarea 
                          {...form.register("short_description")}
                          className="w-full min-h-[150px] rounded-xl border p-4 text-sm font-sans focus:ring-primary" 
                        />
                      </div>

                      <div className="space-y-2 bg-red-50/50 p-4 rounded-2xl border border-red-100">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-[#E76F51] flex items-center gap-2">
                          <Youtube className="w-4 h-4" /> YouTube
                        </Label>
                        <Input {...form.register("youtube_video_url")} placeholder="https://..." className="h-10 border-red-200" />
                      </div>
                    </div>

                      <div className="bg-muted/30 p-6 rounded-3xl border border-border/50 h-fit space-y-6">
                        <div>
                          <Label className="font-black text-xs uppercase tracking-widest text-blue-600 block mb-4">Ações Rápidas</Label>
                          <Button 
                            type="button"
                            onClick={handleAutoTranslate} 
                            disabled={isTranslating} 
                            variant="outline" 
                            className="w-full h-12 justify-center px-6 rounded-2xl font-bold"
                          >
                            {isTranslating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                            Traduzir para EN e ES
                          </Button>
                        </div>
                      </div>
                  </div>
                </TabsContent>

                {/* INFO TAB */}
                <TabsContent value="info" className="m-0 space-y-10 pb-10">
                  <div className="flex gap-2 mb-4">
                    {(['pt', 'en', 'es'] as const).map(lang => (
                      <Button 
                        key={lang}
                        type="button" 
                        size="sm" 
                        variant={activeInfoLang === lang ? 'default' : 'outline'} 
                        onClick={() => setActiveInfoLang(lang)} 
                        className="text-[10px] h-7 px-3"
                      >
                        {lang.toUpperCase()}
                      </Button>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 gap-6 bg-muted/20 p-6 rounded-3xl border">
                    <Label className="font-black text-xs uppercase tracking-widest text-primary flex items-center gap-2">
                      <MapPin className="w-4 h-4" /> Ponto de Encontro
                    </Label>
                    <Input 
                      {...form.register(activeInfoLang === 'pt' ? "meeting_point_address" : `meeting_point_address_${activeInfoLang}` as any)}
                      placeholder="Endereço..." 
                      className="h-12"
                    />
                  </div>

                  <TourJsonList 
                    form={form} 
                    name="itinerary_json" 
                    title="Itinerário" 
                    activeLang={activeInfoLang} 
                    icon={<List className="w-4 h-4" />}
                    fields={[{ name: 'time', label: 'Hora' }, { name: 'description', label: 'Descrição' }]}
                  />

                  <TourJsonList 
                    form={form} 
                    name="included_json" 
                    title="O que está incluído?" 
                    activeLang={activeInfoLang} 
                    icon={<Info className="w-4 h-4" />}
                    fields={[{ name: 'text', label: 'Item' }]}
                  />

                  <TourJsonList 
                    form={form} 
                    name="highlights_json" 
                    title="Highlights" 
                    activeLang={activeInfoLang} 
                    icon={<Star className="w-4 h-4" />}
                    fields={[{ name: 'text', label: 'Destaque' }]}
                  />

                  <TourJsonList 
                    form={form} 
                    name="faq_json" 
                    title="FAQ" 
                    activeLang={activeInfoLang} 
                    icon={<HelpCircle className="w-4 h-4" />}
                    fields={[{ name: 'q', label: 'Pergunta' }, { name: 'a', label: 'Resposta', type: 'textarea' }]}
                    onImportDefaults={() => {
                      const defaults = getPedraDaGaveaDefaults();
                      form.setValue("faq_json", defaults.faq_json);
                      form.setValue("faq_json_en", defaults.faq_json_en);
                      form.setValue("faq_json_es", defaults.faq_json_es);
                    }}
                    importLabel="Importar Pedra Gávea"
                  />
                </TabsContent>

                {/* GALLERY TAB */}
                <TabsContent value="gallery" className="m-0 space-y-12">
                  <div className="space-y-4">
                    <h3 className="font-black text-xs uppercase tracking-widest text-primary bg-primary/5 p-4 rounded-xl inline-block">Galeria 1: Mosaico do Topo (5 Fotos)</h3>
                    <TourGalleryTab 
                      form={form} 
                      handleFileUpload={handleFileUpload} 
                      isUploading={isUploading} 
                      galleryImages={galleryImages} 
                      fieldName="images_json"
                      title="Fotos do Mosaico (Topo)"
                    />
                  </div>

                  <div className="pt-12 border-t space-y-4">
                    <h3 className="font-black text-xs uppercase tracking-widest text-blue-600 bg-blue-50 p-4 rounded-xl inline-block">Galeria 2: Carrossel do Rodapé</h3>
                    <TourGalleryTab 
                      form={form} 
                      handleFileUpload={handleFileUpload} 
                      isUploading={isUploading} 
                      galleryImages={galleryImages} 
                      fieldName="carousel_images_json"
                      title="Fotos do Carrossel (Rodapé)"
                    />
                  </div>
                </TabsContent>

                {/* SETTINGS TAB */}
                <TabsContent value="settings" className="m-0 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase text-muted-foreground">Preço Base (R$)</Label>
                      <Input type="number" {...form.register("price", { valueAsNumber: true })} className="h-12" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase text-muted-foreground">Duração</Label>
                      <Input {...form.register("duration")} placeholder="Ex: 4 horas" className="h-12" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase text-muted-foreground">Grupo Máx</Label>
                      <Input type="number" {...form.register("max_group_size", { valueAsNumber: true })} className="h-12" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase text-muted-foreground">Dificuldade</Label>
                      <select 
                        {...form.register("difficulty")}
                        className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="Leve">Leve</option>
                        <option value="Moderada">Moderada</option>
                        <option value="Pesada">Pesada</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-6 items-center bg-muted/20 p-6 rounded-2xl border">
                    <div className="flex items-center gap-2">
                      <input type="checkbox" {...form.register("is_active")} id="is_active" className="w-5 h-5" />
                      <Label htmlFor="is_active" className="font-bold">Passeio Ativo</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" {...form.register("is_featured")} id="is_featured" className="w-5 h-5" />
                      <Label htmlFor="is_featured" className="font-bold">Destaque na Home</Label>
                    </div>
                  </div>

                  {/* Specific Boteco Tour Fields */}
                  {form.watch("title")?.toLowerCase().includes('boteco') && (
                    <div className="space-y-6 pt-6 border-t">
                      <h3 className="font-black text-xs uppercase tracking-widest text-primary">Configuração do Boteco Tour</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-2">
                            <Sunrise className="w-4 h-4 text-orange-500" /> Bares da Tijuca
                          </Label>
                          <textarea 
                            {...form.register("bares_diurnos")}
                            placeholder="Lista de bares para o tour na Tijuca..."
                            className="w-full min-h-[100px] rounded-xl border p-4 text-sm font-sans focus:ring-primary" 
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-2">
                            <Moon className="w-4 h-4 text-indigo-500" /> Bares de Copacabana
                          </Label>
                          <textarea 
                            {...form.register("bares_noturnos")}
                            placeholder="Lista de bares para o tour em Copacabana..."
                            className="w-full min-h-[100px] rounded-xl border p-4 text-sm font-sans focus:ring-primary" 
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </TabsContent>
              </div>
            </div>

            <div className="p-6 border-t bg-muted/10 shrink-0 flex justify-end gap-3">
              <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
              <Button type="submit" disabled={isTranslating || isUploading} className="px-8 h-12 font-bold text-lg">
                {isTranslating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Salvar Passeio
              </Button>
            </div>
          </Tabs>
        </form>
      </DialogContent>
    </Dialog>
  );
}
