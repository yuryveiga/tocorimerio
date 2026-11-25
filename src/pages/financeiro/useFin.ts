import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { FinVenda } from "@/lib/financeiro";

export function useVendas(ini: string, fim: string) {
  return useQuery({
    queryKey: ["fin-vendas", ini, fim],
    queryFn: async () => {
      const { data, error } = await supabase.from("fin_vendas").select("*").gte("data", ini).lte("data", fim).order("data", { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as FinVenda[];
    },
  });
}
export function useSugestoes() {
  return useQuery({
    queryKey: ["fin-sugestoes"],
    queryFn: async () => {
      const [t, g] = await Promise.all([
        supabase.from("tours").select("title").order("title"),
        supabase.from("guides").select("name").order("name"),
      ]);
      return { tours: (t.data || []).map(x => x.title), guias: (g.data || []).map(x => x.name) };
    },
    staleTime: 600000,
  });
}
