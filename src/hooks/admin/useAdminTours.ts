import { useState, useEffect } from "react";
import { LovableTour } from "@/integrations/lovable/client";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function useAdminTours() {
  const [tours, setTours] = useState<LovableTour[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const { toast } = useToast();

  const [pageSize] = useState(12);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    loadTours();
  }, [currentPage]);

  const loadTours = async () => {
    setIsLoading(true);
    try {
      const from = (currentPage - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data, count, error } = await supabase
        .from('tours')
        .select('*', { count: 'exact' })
        .order('sort_order')
        .range(from, to);

      if (error) throw error;
      setTours(data || []);
      setTotalCount(count || 0);
    } catch (error) {
      toast({ title: "Erro", description: "Falha ao carregar passeios", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from('tours').delete().eq('id', id);
      if (error) throw error;
      setTours(prev => prev.filter((t) => t.id !== id));
      toast({ title: "Passeio removido" });
    } catch (error) {
      toast({ title: "Erro", description: "Falha ao remover passeio", variant: "destructive" });
    }
  };

  const filteredTours = tours
    .filter(tour => categoryFilter === 'all' || tour.category === categoryFilter)
    .filter(tour => {
      if (activeFilter === 'active') return tour.is_active;
      if (activeFilter === 'inactive') return !tour.is_active;
      return true;
    })
    .sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0));

  return {
    tours: filteredTours,
    allTours: tours,
    isLoading,
    categoryFilter,
    setCategoryFilter,
    activeFilter,
    setActiveFilter,
    currentPage,
    setCurrentPage,
    totalCount,
    pageSize,
    loadTours,
    handleDelete
  };
}
