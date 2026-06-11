import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { fetchLovable, LovableSiteSetting } from "@/integrations/lovable/client";
import { Plus, Sparkles, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { useAdminTours } from "@/hooks/admin/useAdminTours";
import { TourCard } from "@/components/admin/tours/TourCard";
import { TourFormDialog } from "@/components/admin/tours/TourFormDialog";
import { DeleteConfirmDialog } from "@/components/admin/DeleteConfirmDialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { useInView } from "react-intersection-observer";
import { translateText } from "@/utils/translate";
import { supabase } from "@/integrations/supabase/client";

const AdminTours = () => {
  const { 
    tours, 
    allTours,
    isLoading, 
    categoryFilter, 
    setCategoryFilter, 
    activeFilter, 
    setActiveFilter, 
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    totalCount,
    loadTours, 
    handleDelete 
  } = useAdminTours();

  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const [editing, setEditing] = useState<any | null>(null);
  const [siteSettings, setSiteSettings] = useState<Record<string, string>>({});
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [isTranslateAllConfirmOpen, setIsTranslateAllConfirmOpen] = useState(false);
  const [isTranslatingAll, setIsTranslatingAll] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchLovable<LovableSiteSetting>("site_settings").then(data => {
      const map: Record<string, string> = {};
      data.forEach(s => { map[s.key] = s.value; });
      setSiteSettings(map);
    });
  }, []);

  const getPedraDaGaveaDefaults = () => {
    const pedra = allTours.find(t => t.title.toLowerCase().includes("pedra da gávea"));
    if (pedra) {
      return {
        faq_json: pedra.faq_json || [],
        faq_json_en: pedra.faq_json_en || [],
        faq_json_es: pedra.faq_json_es || []
      };
    }
    return { faq_json: [], faq_json_en: [], faq_json_es: [] };
  };

  const handleTranslateAll = async () => {
    setIsTranslatingAll(true);
    setIsTranslateAllConfirmOpen(false);

    try {
      // Busca TODOS os passeios (sem filtro de paginação)
      const { data: allToursRaw, error } = await supabase
        .from("tours")
        .select("id, title, short_description, category, difficulty, meeting_point_address, itinerary_json, included_json, highlights_json, faq_json, title_zh_cn")
        .order("sort_order");

      if (error) throw error;

      // Filtra apenas os que ainda NÃO têm tradução chinesa
      const pending = (allToursRaw || []).filter((t: any) => !t.title_zh_cn);

      if (pending.length === 0) {
        toast({ title: "Tudo já traduzido!", description: "Todos os passeios já têm tradução em chinês." });
        setIsTranslatingAll(false);
        return;
      }

      toast({
        title: `Traduzindo ${pending.length} passeio(s)...`,
        description: "Isso pode levar alguns minutos. Não feche a página.",
      });

      const translateJsonArray = async (arr: any[], fields: string[], lang: string) => {
        if (!arr || !Array.isArray(arr)) return arr;
        return Promise.all(arr.map(async (item: any) => {
          const newItem = { ...item };
          for (const field of fields) {
            if (item[field]) newItem[field] = await translateText(item[field], lang);
          }
          return newItem;
        }));
      };

      let done = 0;
      // Processa 2 passeios por vez para não sobrecarregar a API
      for (let i = 0; i < pending.length; i += 2) {
        const batch = pending.slice(i, i + 2);
        await Promise.all(batch.map(async (tour: any) => {
          try {
            const [titleCN, titleTW, descCN, descTW, catCN, catTW, difCN, difTW, addrCN, addrTW] = await Promise.all([
              translateText(tour.title || "", "zh"),
              translateText(tour.title || "", "zh-TW"),
              translateText(tour.short_description || "", "zh"),
              translateText(tour.short_description || "", "zh-TW"),
              translateText(tour.category || "", "zh"),
              translateText(tour.category || "", "zh-TW"),
              translateText(tour.difficulty || "", "zh"),
              translateText(tour.difficulty || "", "zh-TW"),
              translateText(tour.meeting_point_address || "", "zh"),
              translateText(tour.meeting_point_address || "", "zh-TW"),
            ]);

            const [itiCN, itiTW, incCN, incTW, hlCN, hlTW, faqCN, faqTW] = await Promise.all([
              translateJsonArray(tour.itinerary_json || [], ['time', 'description'], "zh"),
              translateJsonArray(tour.itinerary_json || [], ['time', 'description'], "zh-TW"),
              translateJsonArray(tour.included_json || [], ['text'], "zh"),
              translateJsonArray(tour.included_json || [], ['text'], "zh-TW"),
              translateJsonArray(tour.highlights_json || [], ['text'], "zh"),
              translateJsonArray(tour.highlights_json || [], ['text'], "zh-TW"),
              translateJsonArray(tour.faq_json || [], ['q', 'a'], "zh"),
              translateJsonArray(tour.faq_json || [], ['q', 'a'], "zh-TW"),
            ]);

            await supabase.from("tours").update({
              title_zh_cn: titleCN,
              title_zh_tw: titleTW,
              short_description_zh_cn: descCN,
              short_description_zh_tw: descTW,
              category_zh_cn: catCN,
              category_zh_tw: catTW,
              difficulty_zh_cn: difCN,
              difficulty_zh_tw: difTW,
              meeting_point_address_zh_cn: addrCN,
              meeting_point_address_zh_tw: addrTW,
              itinerary_json_zh_cn: itiCN,
              itinerary_json_zh_tw: itiTW,
              included_json_zh_cn: incCN,
              included_json_zh_tw: incTW,
              highlights_json_zh_cn: hlCN,
              highlights_json_zh_tw: hlTW,
              faq_json_zh_cn: faqCN,
              faq_json_zh_tw: faqTW,
            }).eq("id", tour.id);

            done++;
            toast({
              title: `✅ ${done}/${pending.length} traduzidos`,
              description: tour.title,
            });
          } catch (err) {
            console.error(`Erro ao traduzir passeio ${tour.title}:`, err);
          }
        }));
      }

      toast({
        title: "Tradução concluída!",
        description: `${done} passeio(s) traduzidos para Chinês Simplificado e Tradicional.`,
      });
      loadTours();
    } catch (err) {
      toast({ title: "Erro", description: "Falha ao buscar passeios.", variant: "destructive" });
    } finally {
      setIsTranslatingAll(false);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden font-sans">
      <div className="flex items-center justify-between mb-6 shrink-0">
        <h1 className="font-serif text-3xl font-bold text-foreground">Gerenciar Passeios</h1>
        <div className="flex gap-3">
          <Button onClick={() => setEditing({})} className="font-sans">
            <Plus className="w-4 h-4 mr-2" />Novo Passeio
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setIsTranslateAllConfirmOpen(true)}
            disabled={isTranslatingAll}
          >
            {isTranslatingAll ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
            Traduzir Todos
          </Button>
        </div>
      </div>

      <div className="flex gap-2 mb-6 shrink-0 flex-wrap">
        <Button variant={categoryFilter === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setCategoryFilter('all')} className="rounded-full">Todos</Button>
        <Button variant={categoryFilter === 'CITY TOUR' ? 'default' : 'outline'} size="sm" onClick={() => setCategoryFilter('CITY TOUR')} className="rounded-full">City Tour</Button>
        <Button variant={categoryFilter === 'TRILHA' ? 'default' : 'outline'} size="sm" onClick={() => setCategoryFilter('TRILHA')} className="rounded-full">Trilha</Button>
        {siteSettings['home_category_3'] && (
          <Button variant={categoryFilter === siteSettings['home_category_3'] ? 'default' : 'outline'} size="sm" onClick={() => setCategoryFilter(siteSettings['home_category_3'])} className="rounded-full">
            {siteSettings['home_category_3_label'] || siteSettings['home_category_3']}
          </Button>
        )}
      </div>

      <div className="flex gap-2 mb-6 shrink-0 flex-wrap border-t pt-4">
        <span className="text-xs font-black uppercase tracking-widest text-muted-foreground self-center mr-2">Status:</span>
        <Button variant={activeFilter === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setActiveFilter('all')} className="rounded-full">Todos</Button>
        <Button variant={activeFilter === 'active' ? 'default' : 'outline'} size="sm" onClick={() => setActiveFilter('active')} className="rounded-full text-green-600 border-green-200">Ativos</Button>
        <Button variant={activeFilter === 'inactive' ? 'default' : 'outline'} size="sm" onClick={() => setActiveFilter('inactive')} className="rounded-full text-red-600 border-red-200">Inativos</Button>
      </div>

      <div className="flex-1 overflow-auto pr-2 pb-8">
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="space-y-4">
                <Skeleton className="h-48 w-full rounded-2xl" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {tours.map((tour) => (
                <TourCard 
                  key={tour.id} 
                  tour={tour as any} 
                  onEdit={setEditing} 
                  onDelete={setItemToDelete} 
                />
              ))}
            </div>

            <div ref={ref} className="h-20 flex items-center justify-center mt-8">
              {isFetchingNextPage && (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Carregando mais...</span>
                </div>
              )}
              {!hasNextPage && tours.length > 0 && (
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-50">Fim dos resultados</span>
              )}
            </div>
          </>
        )}
      </div>

      <TourFormDialog 
        editing={editing}
        isOpen={!!editing}
        onClose={() => setEditing(null)}
        onSuccess={() => {
          setEditing(null);
          loadTours();
        }}
        siteSettings={siteSettings}
        getPedraDaGaveaDefaults={getPedraDaGaveaDefaults}
      />

      <DeleteConfirmDialog 
        open={!!itemToDelete}
        onOpenChange={(open) => !open && setItemToDelete(null)}
        onConfirm={() => itemToDelete && handleDelete(itemToDelete)}
      />

      <AlertDialog open={isTranslateAllConfirmOpen} onOpenChange={setIsTranslateAllConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Traduzir passeios para Chinês?</AlertDialogTitle>
            <AlertDialogDescription>
              Serão traduzidos automaticamente para <strong>Chinês Simplificado (zh-CN)</strong> e <strong>Chinês Tradicional (zh-TW)</strong> apenas os passeios que ainda <strong>não possuem tradução</strong>. Os já traduzidos serão ignorados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleTranslateAll}>Confirmar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminTours;
