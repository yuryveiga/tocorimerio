import { useState, useEffect, lazy, Suspense, useMemo, useCallback, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { fetchLovable, insertLovable, updateLovable, deleteLovable, uploadLovableFile, LovableBlogPost, LovableSiteImage } from "@/integrations/lovable/client";
import { Plus, Pencil, Trash2, Image as ImageIcon, Upload, Type, Sparkles, Loader2, Star, FolderOpen } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DeleteConfirmDialog } from "@/components/admin/DeleteConfirmDialog";
import { OptimizedImage } from "@/components/OptimizedImage";
import { BlogSEOAudit } from "@/components/admin/blog/BlogSEOAudit";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { translateText, translateHtml } from "@/utils/translate";
import { slugify } from "@/utils/slugify";
import ReactQuill, { Quill } from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
// @ts-ignore
import ImageResize from "quill-image-resize-module-react";
Quill.register("modules/imageResize", ImageResize as unknown);

const AdminBlog = () => {
  const [searchParams] = useSearchParams();
  const [posts, setPosts] = useState<LovableBlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<LovableBlogPost> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isTranslatingAll, setIsTranslatingAll] = useState(false);
  const [galleryImages, setGalleryImages] = useState<LovableSiteImage[]>([]);
  const [isGalleryUploading, setIsGalleryUploading] = useState(false);
  const [pickerMode, setPickerMode] = useState<'cover' | 'editor'>('editor');
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [galleryItemToDelete, setGalleryItemToDelete] = useState<string | null>(null);
  const [isTranslateAllConfirmOpen, setIsTranslateAllConfirmOpen] = useState(false);
  const { toast } = useToast();


  const loadPosts = useCallback(async () => {
    console.log("loadPosts called");
    setIsLoading(true);
    const data = await fetchLovable<LovableBlogPost>("blog_posts");
    setPosts(data.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()));
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  useEffect(() => {
    const postId = searchParams.get('post');
    if (postId && posts.length > 0) {
      const post = posts.find(p => p.id === postId);
      if (post) {
        setEditing(post);
        setIsNew(false);
      }
    }
  }, [searchParams, posts]);

  const loadGalleryImages = async () => {
    const imgs = await fetchLovable<LovableSiteImage>("site_images");
    setGalleryImages(imgs.filter(i => i.key?.startsWith('gallery')));
  };

  useEffect(() => {
    if (editing) {
      loadGalleryImages();
    }
  }, [editing]);

  const handleSave = async () => {
    if (!editing?.title || !editing?.slug) {
      toast({ title: "Erro", description: "Título e slug são obrigatórios", variant: "destructive" });
      return;
    }

    try {
      if (isNew) {
        await insertLovable("blog_posts", { ...editing, is_published: editing.is_published ?? false });
        toast({ title: "Post criado!" });
      } else if (editing.id) {
        await updateLovable("blog_posts", editing.id, editing);
        toast({ title: "Post atualizado!" });
      }

      const data = await fetchLovable<LovableBlogPost>("blog_posts");
      setPosts(data.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()));
      setEditing(null);
    } catch {
      toast({ title: "Erro", description: "Erro ao salvar", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    await deleteLovable("blog_posts", id);
    setPosts(posts.filter((p) => p.id !== id));
    toast({ title: "Post removido" });
    setItemToDelete(null);
  };


  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editing) return;
    
    setIsUploading(true);
    try {
      const url = await uploadLovableFile(file);
      if (url) {
        setEditing({ ...editing, image_url: url });
        toast({ title: "Imagem carregada com sucesso!" });
      }
    } catch {
      toast({ title: "Erro", description: "Falha ao enviar imagem.", variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsGalleryUploading(true);
    try {
      const url = await uploadLovableFile(file);
      if (url) {
        // Create the image record in the site_images table so it appears in the gallery
        const newImg = await insertLovable<LovableSiteImage>("site_images", {
          image_url: url,
          key: `gallery_${Date.now()}`,
          label: file.name
        });
        
        // Update local state to show the new image immediately
        if (newImg) {
          setGalleryImages(prev => [newImg, ...prev]);
          toast({ title: "Imagem adicionada à galeria!" });
        }
      }
    } catch (err) {
      toast({ title: "Erro", description: "Falha ao enviar para galeria.", variant: "destructive" });
    } finally {
      setIsGalleryUploading(false);
    }
  };

  const autoTranslate = async () => {
    if (!editing) return;
    if (!editing.title && !editing.content) {
      toast({ title: "Atenção", description: "Escreva algo em Português primeiro." });
      return;
    }

    setIsTranslating(true);
    toast({ title: "Mágica em andamento...", description: "Traduzindo para Inglês e Espanhol..." });

    try {
      const [titleEn, titleEs, contentEn, contentEs, excerptEn, excerptEs] = await Promise.all([
        translateText(editing.title || "", "en"),
        translateText(editing.title || "", "es"),
        translateHtml(editing.content || "", "en"),
        translateHtml(editing.content || "", "es"),
        translateText(editing.excerpt || "", "en"),
        translateText(editing.excerpt || "", "es")
      ]);

      setEditing(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          title_en: titleEn,
          title_es: titleEs,
          content_en: contentEn,
          content_es: contentEs,
          excerpt_en: excerptEn,
          excerpt_es: excerptEs
        } as Partial<LovableBlogPost>;
      });
      
      toast({ title: "Sucesso!", description: "Tradução para Inglês e Espanhol concluída." });
    } catch (err) {
      toast({ title: "Erro na tradução", description: "Tente novamente daqui a pouco.", variant: "destructive" });
    } finally {
      setIsTranslating(false);
    }
  };

  const translateToPt = async () => {
    if (!editing) return;
    if (!editing.title_en && !editing.content_en) {
      toast({ title: "Atenção", description: "Escreva algo em Inglês primeiro." });
      return;
    }

    setIsTranslating(true);
    toast({ title: "Traduzindo...", description: "Traduzindo de Inglês para Português..." });

    try {
      const [titlePt, contentPt, excerptPt] = await Promise.all([
        translateText(editing.title_en || "", "pt", "en"),
        translateHtml(editing.content_en || "", "pt", "en"),
        translateText(editing.excerpt_en || "", "pt", "en")
      ]);

      setEditing(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          title: titlePt,
          content: contentPt,
          excerpt: excerptPt
        } as Partial<LovableBlogPost>;
      });
      
      toast({ title: "Sucesso!", description: "Tradução para Português concluída." });
    } catch (err) {
      toast({ title: "Erro na tradução", description: "Tente novamente.", variant: "destructive" });
    } finally {
      setIsTranslating(false);
    }
  };

  const [showGalleryPicker, setShowGalleryPicker] = useState(false);
  const quillRef = useRef<any>(null);

  const imageHandler = useCallback(() => {
    const choice = true; // Forcing gallery for consistency/UI
    setPickerMode('editor');
    setShowGalleryPicker(true);
  }, [toast]);


  const insertImageFromGallery = (url: string) => {
    if (pickerMode === 'cover' && editing) {
      setEditing({ ...editing, image_url: url });
      setShowGalleryPicker(false);
      toast({ title: "Capa atualizada!" });
      return;
    }

    const quill = quillRef.current?.getEditor();
    if (quill) {
      const range = quill.getSelection(true);
      quill.insertEmbed(range.index, 'image', url);
    }
    setShowGalleryPicker(false);
    toast({ title: "Imagem inserida no post!" });
  };

  const deleteGalleryImage = async (id: string) => {
    try {
      const img = galleryImages.find(i => i.id === id);
      const isCurrentCover = img && editing?.image_url === img.image_url;
      
      await deleteLovable("site_images", id);
      
      if (isCurrentCover && editing) {
        setEditing({ ...editing, image_url: "" });
      }
      
      setGalleryImages(prev => prev.filter(i => i.id !== id));
      toast({ title: "Imagem removida da galeria!" });
      setGalleryItemToDelete(null);
    } catch (err) {
      toast({ title: "Erro ao excluir", description: "Tente novamente.", variant: "destructive" });
    }
  };

  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ header: [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        [{ 'align': [] }],
        ['link', 'image', 'video'],
        ['clean'],
      ],
      handlers: { image: imageHandler }
    },
    imageResize: {
      parrentElement: "body",
      modules: ["Resize", "DisplaySize", "Toolbar"], // Toolbar provides alignment options for images
    }
  }), [imageHandler]);

  const formats = [
    "header", "bold", "italic", "underline", "strike",
    "list", "bullet", "align", "link", "image", "video"
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden font-sans">
      <style>{`
        .editor-container {
          height: 450px !important;
          display: flex !important;
          flex-direction: column !important;
          border-radius: 12px !important;
          border: 1px solid #eee !important;
          overflow: hidden !important;
        }
        .editor-container .ql-toolbar {
          shrink-0: true !important;
          border-top: none !important;
          border-left: none !important;
          border-right: none !important;
          border-bottom: 1px solid #eee !important;
          background: #fdfdfd !important;
        }
        .editor-container .ql-container {
          flex: 1 !important;
          overflow: hidden !important; /* The container doesn't scroll, the editor does */
          border: none !important;
          background: white !important;
        }
        .editor-container .ql-editor {
          height: 100% !important;
          overflow-y: auto !important;
          line-height: 1.6 !important;
          padding: 20px !important;
        }
        .ql-image-resize-module {
          z-index: 100 !important;
        }
        /* Fix for the stretching problem specifically */
        .quill.editor-container {
           height: 450px !important;
           min-height: 450px !important;
           max-height: 450px !important;
        }
      `}</style>
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">Blog Premium</h1>
          <p className="text-muted-foreground font-sans text-sm mt-1">Crie conteúdo rico com imagens alinháveis e traduções automáticas.</p>
        </div>
        <Button onClick={() => { setEditing({ title: "", slug: "", content: "", is_published: true }); setIsNew(true); }} className="font-sans h-12 px-8 rounded-xl shadow-lg">
          <Plus className="w-4 h-4 mr-2" />Novo Post
        </Button>
        <Button 
          variant="outline" 
          onClick={() => setIsTranslateAllConfirmOpen(true)}
          disabled={isTranslatingAll}
          className="font-sans h-12 px-6 rounded-xl"
        >

          {isTranslatingAll ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
          Traduzir Todos
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto pb-12 pr-1">
        {isLoading ? (
          <div className="col-span-full text-center py-24 text-muted-foreground animate-pulse font-sans">Carregando Biblioteca de Posts...</div>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="bg-card rounded-2xl border border-border/50 overflow-hidden shadow-sm flex flex-col group hover:shadow-xl transition-all duration-300">
              <div className="relative h-44 bg-muted">
                {post.image_url ? (
                  <OptimizedImage 
                    src={post.image_url} 
                    alt={post.title} 
                    width={400}
                    containerClassName="w-full h-full"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground"><ImageIcon className="w-10 opacity-20" /></div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4 gap-2">
                   <Button size="sm" variant="secondary" className="flex-1 font-bold h-9 bg-white/90" onClick={() => { setEditing({ ...post }); setIsNew(false); }}><Pencil className="w-4 h-4 mr-2" />Editar</Button>
                   <Button size="icon" variant="destructive" className="h-9 w-9" onClick={() => setItemToDelete(post.id)}><Trash2 className="w-4 h-4" /></Button>
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest self-start mb-3 ${post.is_published ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>{post.is_published ? "PUBLICADO" : "RASCUNHO"}</span>
                <h3 className="font-serif font-bold text-xl leading-tight mb-2 line-clamp-2">{post.title}</h3>
                <p className="text-[10px] text-muted-foreground font-sans mt-auto py-2 border-t font-mono">/{post.slug}</p>
              </div>
            </div>
          ))
        )}
      </div>

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="max-w-[1400px] w-[95vw] min-h-[85vh] h-[95vh] flex flex-col p-0 overflow-hidden border-none shadow-2xl" onPointerDownOutside={(e) => e.preventDefault()}>
          {editing && (
            <Tabs defaultValue="content" className="flex-1 flex flex-col overflow-hidden">
              <DialogHeader className="p-6 pb-0 border-b bg-muted/10 shrink-0">
                <DialogTitle className="font-serif text-2xl flex items-center gap-3 mb-4">
                  <Type className="w-7 h-7 text-primary" />
                  {isNew ? "Nova Publicação" : "Ajustar Conteúdo"}
                </DialogTitle>
                <TabsList className="h-12 bg-transparent border-b w-full justify-start gap-4">
                  <TabsTrigger value="content" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-2 font-bold">Conteúdo</TabsTrigger>
                  <TabsTrigger value="seo" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-2 font-bold">SEO</TabsTrigger>
                  <TabsTrigger value="gallery" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-2 font-bold">Galeria</TabsTrigger>
                </TabsList>
              </DialogHeader>
              
              <div className="px-6 py-3 border-b bg-muted/5 flex justify-end gap-3">
                <Button variant="outline" onClick={() => setEditing(null)}>Cancelar</Button>
                <Button onClick={handleSave}>{isNew ? "Criar Post" : "Salvar Alterações"}</Button>
              </div>
              
              <TabsContent value="content" className="m-0 flex-1 overflow-hidden">
                <div className="flex-1 flex gap-8 overflow-hidden p-8 bg-muted/[0.02]">
                    {/* Left Sidebar for Metadata */}
                    <div className="w-80 flex flex-col gap-6 shrink-0 overflow-y-auto pr-4 scrollbar-thin">
                       <div className="space-y-3">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-primary">Imagem de Capa</Label>
                          <div className="aspect-video rounded-2xl bg-muted border-2 border-dashed border-border/50 overflow-hidden relative group">
                             {editing.image_url ? (
                                <OptimizedImage 
                                  src={editing.image_url} 
                                  alt="Destaque" 
                                  width={400}
                                  containerClassName="w-full h-full"
                                  className="w-full h-full object-cover" 
                                />
                             ) : (
                                <div className="flex flex-col items-center justify-center h-full gap-2 p-6 text-center text-muted-foreground">
                                   <Upload className="w-6 h-6 opacity-30" />
                                   <span className="text-[9px] font-bold">Upload ou escolha da galeria</span>
                                </div>
                             )}
                             <div className="absolute inset-0 flex gap-2 justify-center items-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button size="sm" variant="secondary" className="h-8 bg-white" onClick={() => document.getElementById('blog-capa-upload')?.click()}>
                                  <Upload className="w-3 h-3 mr-1" />Upload
                                </Button>
                                <Button size="sm" variant="secondary" className="h-8 bg-white" onClick={() => { setPickerMode('cover'); setShowGalleryPicker(true); }}>
                                  <FolderOpen className="w-3 h-3 mr-1" />Galeria
                                </Button>
                             </div>
                             <Input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="blog-capa-upload" />
                          </div>
                       </div>

                       <div className="space-y-3">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-primary">URL amigável (SLUG)</Label>
                          <Input value={editing.slug ?? ""} onChange={(e) => setEditing({ ...editing, slug: slugify(e.target.value) })} className="font-mono text-xs h-12 rounded-xl bg-muted/20 border-none shadow-inner" placeholder="ex: explorando-rio" />
                       </div>

                        <div className="mt-4 p-5 rounded-2xl bg-primary/5 border border-primary/10 space-y-3">
                           <h4 className="font-serif font-bold text-primary text-sm">Tradução Automática</h4>
                           <Button onClick={() => autoTranslate()} disabled={isTranslating} variant="outline" size="sm" className="w-full h-9 font-bold bg-white text-xs">{isTranslating ? <Loader2 className="animate-spin w-3 mr-2" /> : <Sparkles className="w-3 mr-2" />}PT -&gt; EN/ES</Button>
                           <Button onClick={() => translateToPt()} disabled={isTranslating} variant="outline" size="sm" className="w-full h-9 font-bold bg-white text-xs">{isTranslating ? <Loader2 className="animate-spin w-3 mr-2" /> : <Sparkles className="w-3 mr-2 text-blue-600" />}EN -&gt; PT</Button>
                        </div>
                    </div>

                    {/* Editor Area */}
                    <div className="flex-1 flex flex-col gap-6 overflow-hidden min-h-0">
                       <Tabs defaultValue="pt" className="flex-1 flex flex-col overflow-hidden">
                         <div className="flex items-center justify-between mb-2">
                           <TabsList className="bg-muted/50 p-1 rounded-xl h-10">
                              <TabsTrigger value="pt" className="text-xs font-bold rounded-lg px-4">Português</TabsTrigger>
                              <TabsTrigger value="en" className="text-xs font-bold rounded-lg px-4">English</TabsTrigger>
                              <TabsTrigger value="es" className="text-xs font-bold rounded-lg px-4">Español</TabsTrigger>
                           </TabsList>
                           
                           <div className="p-1 rounded-xl bg-primary/5 border border-primary/10 flex items-center gap-2">
                              <span className="text-[10px] font-bold text-primary px-3 uppercase tracking-wider">Mágica</span>
                              <Button onClick={() => autoTranslate()} disabled={isTranslating} variant="outline" size="sm" className="h-8 font-bold bg-white text-[10px] rounded-lg border-primary/20 hover:bg-primary/10 transition-all">
                                {isTranslating ? <Loader2 className="animate-spin w-3 h-3 mr-2" /> : <Sparkles className="w-3 h-3 mr-2 text-primary" />}
                                PT -&gt; EN/ES
                              </Button>
                              <Button onClick={() => translateToPt()} disabled={isTranslating} variant="outline" size="sm" className="h-8 font-bold bg-white text-[10px] rounded-lg border-primary/20 hover:bg-primary/10 transition-all">
                                {isTranslating ? <Loader2 className="animate-spin w-3 h-3 mr-2" /> : <Sparkles className="w-3 h-3 mr-2 text-blue-600" />}
                                EN -&gt; PT
                              </Button>
                           </div>
                         </div>

                         <TabsContent value="pt" className="flex-1 flex flex-col gap-6 overflow-hidden mt-0 data-[state=inactive]:hidden">
                            <div className="space-y-2 shrink-0">
                               <Label className="text-[10px] font-black uppercase tracking-widest text-primary">Título (PT)</Label>
                               <Input value={editing.title ?? ""} onChange={(e) => setEditing(prev => prev ? { ...prev, title: e.target.value } : prev)} className="h-14 text-xl font-serif font-bold border-none bg-white shadow-sm px-6 rounded-2xl" placeholder="Título impactante em português..." />
                            </div>
                            <div className="flex-1 flex flex-col overflow-hidden rounded-2xl shadow-sm border bg-white min-h-0">
                               <ReactQuill ref={quillRef} theme="snow" value={editing.content || ""} onChange={(val) => setEditing(prev => prev ? { ...prev, content: val } : prev)} className="editor-container h-full" modules={modules} formats={formats} placeholder="Conte sua história em português..." />
                            </div>
                         </TabsContent>

                         <TabsContent value="en" className="flex-1 flex flex-col gap-6 overflow-hidden mt-0 data-[state=inactive]:hidden">
                            <div className="space-y-2 shrink-0">
                               <Label className="text-[10px] font-black uppercase tracking-widest text-blue-600">Title (EN)</Label>
                               <Input value={editing.title_en ?? ""} onChange={(e) => setEditing(prev => prev ? { ...prev, title_en: e.target.value } : prev)} className="h-14 text-xl font-serif font-bold border-none bg-white shadow-sm px-6 rounded-2xl" placeholder="Impactful title in English..." />
                            </div>
                            <div className="flex-1 flex flex-col overflow-hidden rounded-2xl shadow-sm border bg-white min-h-0">
                               <ReactQuill theme="snow" value={editing.content_en || ""} onChange={(val) => setEditing(prev => prev ? { ...prev, content_en: val } : prev)} className="editor-container h-full" modules={modules} formats={formats} placeholder="Tell your story in English..." />
                            </div>
                         </TabsContent>

                         <TabsContent value="es" className="flex-1 flex flex-col gap-6 overflow-hidden mt-0 data-[state=inactive]:hidden">
                            <div className="space-y-2 shrink-0">
                               <Label className="text-[10px] font-black uppercase tracking-widest text-red-600">Título (ES)</Label>
                               <Input value={editing.title_es ?? ""} onChange={(e) => setEditing({ ...editing, title_es: e.target.value })} className="h-14 text-xl font-serif font-bold border-none bg-white shadow-sm px-6 rounded-2xl" placeholder="Título impactante en español..." />
                            </div>
                            <div className="flex-1 flex flex-col overflow-hidden rounded-2xl shadow-sm border bg-white min-h-0">
                               <ReactQuill theme="snow" value={editing.content_es || ""} onChange={(val) => setEditing({ ...editing, content_es: val })} className="editor-container h-full" modules={modules} formats={formats} placeholder="Cuenta tu historia en español..." />
                            </div>
                         </TabsContent>
                       </Tabs>
                    </div>
                 </div>
               </TabsContent>

               <TabsContent value="seo" className="m-0 flex-1 overflow-hidden">
                 <BlogSEOAudit 
                   post={editing} 
                   onUpdate={(updates) => setEditing(prev => prev ? { ...prev, ...updates } : prev)} 
                 />
               </TabsContent>


               <TabsContent value="gallery" className="m-0 flex-1 overflow-y-auto p-8">
                 <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-lg">Selecionar Imagem de Capa</h3>
                        <p className="text-sm text-muted-foreground">Escolha uma imagem da galeria do site</p>
                      </div>
                    </div>
                    
                    {galleryImages.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">Nenhuma imagem na galeria</div>
                    ) : (
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                        {galleryImages.map((img) => (
                          <div
                            key={img.id}
                            className={`group relative aspect-square rounded-xl overflow-hidden border-4 transition-all ${editing.image_url === img.image_url ? "border-primary ring-4 ring-primary/20 shadow-lg" : "border-transparent"}`}
                          >
                            <OptimizedImage 
                               src={img.image_url} 
                               alt={img.label || ""} 
                               width={200}
                               containerClassName="w-full h-full"
                               className="w-full h-full object-cover" 
                            />
                            
                            {/* Icons Overlay */}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                               <div className="flex justify-between items-start w-full gap-1">
                                  <Button 
                                    size="icon" 
                                    variant={editing.image_url === img.image_url ? "default" : "secondary"} 
                                    className={`h-7 w-7 rounded-full shadow-lg ${editing.image_url === img.image_url ? "bg-amber-500 hover:bg-amber-600" : "bg-white/90"}`} 
                                    onClick={() => setEditing({ ...editing, image_url: img.image_url })}
                                    title="Definir como Capa"
                                  >
                                    <Star className={`w-3.5 h-3.5 ${editing.image_url === img.image_url ? "fill-white" : "text-amber-500"}`} />
                                  </Button>
                                  <Button 
                                    size="icon" 
                                    variant="destructive" 
                                    className="h-7 w-7 rounded-full shadow-lg" 
                                    onClick={(e) => { e.stopPropagation(); setGalleryItemToDelete(img.id); }}
                                    title="Excluir Imagem"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </Button>
                               </div>
                            </div>

                            {editing.image_url === img.image_url && (
                              <div className="absolute top-2 left-2 bg-primary text-white text-[8px] font-black px-1.5 py-0.5 rounded-full shadow-lg flex items-center gap-1">
                                <Star className="w-2 h-2 fill-white" /> CAPA
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                 </div>
               </TabsContent>
             </Tabs>
            )}
        </DialogContent>

        {/* Gallery Picker Modal */}
        <Dialog open={showGalleryPicker} onOpenChange={setShowGalleryPicker}>
          <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col p-0 overflow-hidden border-none shadow-2xl">
            <DialogHeader className="p-6 border-b bg-muted/10">
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle className="font-serif text-2xl">Galeria de Mídia</DialogTitle>
                  <p className="text-muted-foreground text-sm font-sans">Escolha uma imagem existente ou envie uma nova para o servidor.</p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={() => document.getElementById('gallery-modal-upload')?.click()}
                    disabled={isGalleryUploading}
                    className="font-bold py-6 px-6 rounded-xl shadow-lg"
                  >
                    {isGalleryUploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                    Fazer Upload
                  </Button>
                  <Input type="file" accept="image/*" onChange={handleGalleryUpload} className="hidden" id="gallery-modal-upload" />
                </div>
              </div>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto p-6 bg-muted/[0.02]">
              {galleryImages.length === 0 && !isGalleryUploading ? (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                  <ImageIcon className="w-16 h-16 opacity-10 mb-4" />
                  <p className="font-sans font-medium text-lg">Sua galeria está vazia</p>
                  <p className="text-sm opacity-60">Comece enviando sua primeira imagem!</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                  {isGalleryUploading && (
                    <div className="aspect-square rounded-2xl bg-primary/5 border-2 border-dashed border-primary/30 flex flex-col items-center justify-center animate-pulse">
                      <Loader2 className="w-8 h-8 text-primary animate-spin mb-2" />
                      <span className="text-[10px] font-black uppercase text-primary tracking-widest">Enviando...</span>
                    </div>
                  )}
                  {galleryImages.map((img) => (
                    <div
                      key={img.id}
                      className="group relative aspect-square rounded-2xl overflow-hidden shadow-sm border border-border/40 hover:border-primary/50 transition-all hover:shadow-xl group"
                    >
                      <OptimizedImage 
                        src={img.image_url} 
                        alt={img.label || ""} 
                        width={300}
                        containerClassName="w-full h-full"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                      />
                      
                      {/* Interaction Overlay */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-center items-center gap-3 p-4">
                          <Button 
                            size="sm" 
                            className="bg-white text-primary hover:bg-white/90 font-bold px-6 h-10 w-full rounded-xl" 
                            onClick={() => insertImageFromGallery(img.image_url)}
                          >
                            {pickerMode === 'cover' ? 'Definir Capa' : 'Inserir no Texto'}
                          </Button>
                          <Button 
                            size="icon" 
                            variant="destructive" 
                            className="h-10 w-10 rounded-xl shadow-lg absolute top-3 right-3" 
                            onClick={(e) => { e.stopPropagation(); setGalleryItemToDelete(img.id); }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                      </div>

                      <div className="absolute bottom-0 inset-x-0 p-2 bg-black/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300">
                        <p className="text-[9px] text-white font-bold truncate text-center uppercase tracking-widest">{img.label || 'Sem nome'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
        
        <DeleteConfirmDialog 
          open={!!galleryItemToDelete} 
          onOpenChange={(open) => !open && setGalleryItemToDelete(null)} 
          onConfirm={() => galleryItemToDelete && deleteGalleryImage(galleryItemToDelete)}
          title="Excluir da Galeria"
          description="Tem certeza que deseja excluir esta imagem? Ela será removida de toda a galeria do site e de quaisquer outros posts onde estiver sendo usada."
        />
      </Dialog>
      <DeleteConfirmDialog 
        open={!!itemToDelete} 
        onOpenChange={(open) => !open && setItemToDelete(null)} 
        onConfirm={() => itemToDelete && handleDelete(itemToDelete)}
        title="Excluir Post"
        description="Tem certeza que deseja excluir esta publicação? Todo o conteúdo textual e traduzido será removido permanentemente."
      />

      <AlertDialog open={isTranslateAllConfirmOpen} onOpenChange={setIsTranslateAllConfirmOpen}>
        <AlertDialogContent className="font-sans">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-serif text-2xl">Tradução em Massa (Blog)</AlertDialogTitle>
            <AlertDialogDescription>
              Deseja traduzir TODOS os posts para inglês e espanhol? Isso pode levar algum tempo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0 mt-4">
            <AlertDialogCancel className="rounded-xl">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-primary rounded-xl"
              onClick={async () => {
                setIsTranslateAllConfirmOpen(false);
                setIsTranslatingAll(true);
                let translated = 0;
                for (const post of posts) {
                  try {
                    const [titleEn, titleEs, excerptEn, excerptEs, contentEn, contentEs] = await Promise.all([
                      translateText(post.title || "", "en"),
                      translateText(post.title || "", "es"),
                      translateText(post.excerpt || "", "en"),
                      translateText(post.excerpt || "", "es"),
                      translateHtml(post.content || "", "en"),
                      translateHtml(post.content || "", "es"),
                    ]);
                    await updateLovable("blog_posts", post.id, {
                      title_en: titleEn,
                      title_es: titleEs,
                      excerpt_en: excerptEn,
                      excerpt_es: excerptEs,
                      content_en: contentEn,
                      content_es: contentEs,
                    });
                    translated++;
                    await new Promise(r => setTimeout(r, 300));
                  } catch (e) {
                    console.error("Error translating post:", post.id, e);
                  }
                }
                setIsTranslatingAll(false);
                toast({ title: `${translated} posts traduzidos!` });
                loadPosts();
              }}
            >
              Iniciar Tradução
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminBlog;
