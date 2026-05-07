import { useQuery } from '@tanstack/react-query';
import { createClient } from '@supabase/supabase-js';

// Esse é o cliente do projeto original "Maracanã Matchday"
// Isso permite que a Tocorime puxe os jogos diretamente de lá
const MARACANA_PROJECT_URL = "https://mwxbskzggzznxvkwgrnz.supabase.co";
const MARACANA_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13eGJza3pnZ3p6bnh2a3dncm56Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzNjE5OTUsImV4cCI6MjA4ODkzNzk5NX0.EFfaaN79uifOMgFdIZlQ5C8c-HQH-YodNGWf0MEcf9o";

const maracanaSupabase = createClient(MARACANA_PROJECT_URL, MARACANA_ANON_KEY);

export interface Match {
  id: string;
  home_team: string;
  away_team: string;
  match_date: string;
  venue: string;
  price: number;
  available_spots: number;
  sold_count: number;
  status: string;
  stadium?: string;
  slug?: string;
  high_demand?: boolean;
  custom_options_json?: { title: string; price: number }[];
  price_premium?: number;
  included_json?: { text: string }[];
  not_included_json?: { text: string }[];
  bring_json?: { text: string }[];
  dont_bring_json?: { text: string }[];
  attention_json?: { text: string }[];
  not_suitable_json?: { text: string }[];
  home_team_logo?: string;
  away_team_logo?: string;
  competition?: string;
  match_date_iso?: string;
  description_pt?: string;
  description_en?: string;
  min_price?: number;
  packages_count?: number;
  total_stock?: number;
  total_sold?: number;
}

export function useMatches() {
  return useQuery({
    queryKey: ['maracana-matches-sync'],
    queryFn: async () => {
      // 1) Buscar todos os jogos do parceiro
      const { data: matchesData, error: matchesError } = await maracanaSupabase
        .from('matches')
        .select('*')
        .eq('hidden', false)
        .order('match_date', { ascending: true });

      if (matchesError) {
        console.error("Erro ao sincronizar jogos do parceiro:", matchesError.message);
        return [];
      }

      const matches = (matchesData || []) as Match[];
      if (matches.length === 0) return [];

      // 2) Buscar todos os pacotes ativos para calcular preço mínimo real e estoque
      const matchIds = matches.map(m => m.id);
      const { data: packagesData } = await maracanaSupabase
        .from('match_packages')
        .select('match_id, price_brl, total_stock, sold_count, is_active')
        .in('match_id', matchIds)
        .eq('is_active', true);

      // Agrupar pacotes por match_id
      const pkgsByMatch: Record<string, { price_brl: number; total_stock: number; sold_count: number }[]> = {};
      (packagesData || []).forEach((p: any) => {
        if (!p.price_brl || p.price_brl <= 0) return;
        if (!pkgsByMatch[p.match_id]) pkgsByMatch[p.match_id] = [];
        pkgsByMatch[p.match_id].push({
          price_brl: Number(p.price_brl),
          total_stock: Number(p.total_stock) || 0,
          sold_count: Number(p.sold_count) || 0,
        });
      });

      // 3) Mesclar — sobrescrever preço do match com o menor pacote ativo
      return matches.map(m => {
        const pkgs = pkgsByMatch[m.id] || [];
        const min_price = pkgs.length > 0 ? Math.min(...pkgs.map(p => p.price_brl)) : m.price;
        const total_stock = pkgs.reduce((s, p) => s + p.total_stock, 0);
        const total_sold = pkgs.reduce((s, p) => s + p.sold_count, 0);
        return {
          ...m,
          min_price,
          packages_count: pkgs.length,
          total_stock,
          total_sold,
          // Preço exibido no calendário = menor pacote ativo
          price: min_price || m.price,
          available_spots: total_stock > 0 ? total_stock : m.available_spots,
          sold_count: total_sold > 0 ? total_sold : m.sold_count,
        };
      });
    },
    // Atualizar a cada 2 minutos para manter sincronização próxima do tempo real
    refetchInterval: 1000 * 60 * 2,
    refetchOnWindowFocus: true,
    staleTime: 1000 * 60, // 1 min
  });
}
