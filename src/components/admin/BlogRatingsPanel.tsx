import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, Loader2, Trash2, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Rating {
  id: string;
  post_id: string;
  stars: number;
  comment: string | null;
  visitor_key: string;
  created_at: string;
}

interface PostAgg {
  post_id: string;
  title: string;
  slug: string;
  count: number;
  avg: number;
  distribution: [number, number, number, number, number]; // 1..5 counts
}

const Stars = ({ value, size = 4 }: { value: number; size?: number }) => (
  <div className="flex">
    {[1, 2, 3, 4, 5].map((n) => (
      <Star
        key={n}
        className={`w-${size} h-${size} ${n <= Math.round(value) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"}`}
      />
    ))}
  </div>
);

export function BlogRatingsPanel() {
  const [loading, setLoading] = useState(true);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [posts, setPosts] = useState<Record<string, { title: string; slug: string }>>({});
  const [selectedPost, setSelectedPost] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const [rRes, pRes] = await Promise.all([
      supabase.from("blog_post_ratings").select("*").order("created_at", { ascending: false }).limit(2000),
      supabase.from("blog_posts").select("id,title,slug").limit(500),
    ]);
    setRatings((rRes.data as Rating[]) || []);
    const map: Record<string, { title: string; slug: string }> = {};
    (pRes.data || []).forEach((p: any) => { map[p.id] = { title: p.title, slug: p.slug }; });
    setPosts(map);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const aggregates: PostAgg[] = useMemo(() => {
    const byPost: Record<string, Rating[]> = {};
    ratings.forEach((r) => {
      (byPost[r.post_id] ||= []).push(r);
    });
    return Object.entries(byPost)
      .map(([post_id, arr]) => {
        const dist: [number, number, number, number, number] = [0, 0, 0, 0, 0];
        let sum = 0;
        arr.forEach((r) => { dist[r.stars - 1]++; sum += r.stars; });
        return {
          post_id,
          title: posts[post_id]?.title || "(post removido)",
          slug: posts[post_id]?.slug || "",
          count: arr.length,
          avg: sum / arr.length,
          distribution: dist,
        };
      })
      .sort((a, b) => b.count - a.count);
  }, [ratings, posts]);

  const totalRatings = ratings.length;
  const globalAvg = totalRatings ? ratings.reduce((s, r) => s + r.stars, 0) / totalRatings : 0;
  const withComments = ratings.filter((r) => r.comment && r.comment.trim().length > 0);

  const filteredComments = selectedPost
    ? withComments.filter((r) => r.post_id === selectedPost)
    : withComments;

  const deleteRating = async (id: string) => {
    if (!confirm("Excluir esta avaliação?")) return;
    const { error } = await supabase.from("blog_post_ratings").delete().eq("id", id);
    if (error) { toast.error("Erro ao excluir"); return; }
    setRatings((rs) => rs.filter((r) => r.id !== id));
    toast.success("Avaliação removida");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Total de Avaliações</CardTitle></CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalRatings}</div>
            <p className="text-xs text-muted-foreground">Em {aggregates.length} posts</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Média Geral</CardTitle></CardHeader>
          <CardContent>
            <div className="text-3xl font-bold flex items-center gap-2">
              {globalAvg.toFixed(1)}
              <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
            </div>
            <p className="text-xs text-muted-foreground">de 5 estrelas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Comentários</CardTitle></CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{withComments.length}</div>
            <p className="text-xs text-muted-foreground">Avaliações com texto</p>
          </CardContent>
        </Card>
      </div>

      {/* Per-post ranking */}
      <Card>
        <CardHeader>
          <CardTitle>Ranking dos posts</CardTitle>
          <CardDescription>Ordenados por número de avaliações. Clique para filtrar os comentários abaixo.</CardDescription>
        </CardHeader>
        <CardContent>
          {aggregates.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma avaliação recebida ainda.</p>
          ) : (
            <div className="space-y-3">
              {aggregates.map((a) => (
                <button
                  key={a.post_id}
                  onClick={() => setSelectedPost(selectedPost === a.post_id ? null : a.post_id)}
                  className={`w-full text-left p-4 rounded-lg border transition-colors ${
                    selectedPost === a.post_id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-muted/50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold truncate">{a.title}</div>
                      {a.slug && <div className="text-xs text-muted-foreground truncate">/blog/{a.slug}</div>}
                    </div>
                    <div className="text-right shrink-0">
                      <div className="flex items-center gap-2 justify-end">
                        <span className="font-bold text-lg">{a.avg.toFixed(1)}</span>
                        <Stars value={a.avg} />
                      </div>
                      <div className="text-xs text-muted-foreground">{a.count} avaliaç{a.count === 1 ? "ão" : "ões"}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-5 gap-1 mt-3">
                    {[5, 4, 3, 2, 1].map((star) => {
                      const c = a.distribution[star - 1];
                      const pct = a.count ? (c / a.count) * 100 : 0;
                      return (
                        <div key={star} className="flex flex-col items-center gap-1">
                          <div className="w-full h-2 bg-muted rounded overflow-hidden">
                            <div className="h-full bg-yellow-400" style={{ width: `${pct}%` }} />
                          </div>
                          <div className="text-[10px] text-muted-foreground">{star}★ · {c}</div>
                        </div>
                      );
                    })}
                  </div>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Comments */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <div>
              <CardTitle className="flex items-center gap-2"><MessageSquare className="w-4 h-4" /> Comentários</CardTitle>
              <CardDescription>
                {selectedPost
                  ? `Filtrado: ${posts[selectedPost]?.title || "post"}`
                  : "Todos os comentários deixados pelos leitores"}
              </CardDescription>
            </div>
            {selectedPost && (
              <Button variant="ghost" size="sm" onClick={() => setSelectedPost(null)}>Limpar filtro</Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {filteredComments.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum comentário {selectedPost ? "para este post" : "ainda"}.</p>
          ) : (
            <div className="space-y-4">
              {filteredComments.map((r) => (
                <div key={r.id} className="p-4 rounded-lg border border-border bg-muted/20">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-3">
                      <Stars value={r.stars} />
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(r.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                      </span>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => deleteRating(r.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                  <p className="text-sm text-foreground whitespace-pre-wrap">{r.comment}</p>
                  {!selectedPost && (
                    <div className="text-xs text-muted-foreground mt-2 truncate">
                      → {posts[r.post_id]?.title || "(post removido)"}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default BlogRatingsPanel;