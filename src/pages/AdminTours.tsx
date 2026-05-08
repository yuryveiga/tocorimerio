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
            <AlertDialogTitle>Traduzir todos os passeios?</AlertDialogTitle>
            <AlertDialogDescription>
              Isso levará alguns minutos e usará créditos da API. Todos os campos em Inglês e Espanhol serão sobrescritos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
               toast({ title: "Funcionalidade em desenvolvimento", description: "Use a tradução individual por enquanto." });
               setIsTranslateAllConfirmOpen(false);
            }}>Confirmar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminTours;
