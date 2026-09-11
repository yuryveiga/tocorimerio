import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLocale } from "@/contexts/LocaleContext";

type PostLite = {
  id: string;
  title: string;
  slug: string;
  meta_keywords?: string | null;
  tags?: string[] | null;
  excerpt?: string | null;
  title_en?: string | null;
  title_es?: string | null;
  title_zh_cn?: string | null;
  title_zh_tw?: string | null;
  excerpt_en?: string | null;
  excerpt_es?: string | null;
};

const STOP_WORDS = new Set([
  "tour", "tours", "rio", "janeiro", "para", "with", "from", "that", "this", "your",
  "have", "will", "about", "more", "most", "also", "know", "what", "into", "only",
  "many", "time", "area", "make", "here", "like", "como", "mais", "pelo", "pela",
  "passeio", "experience", "private", "privado", "guide", "guia",
]);

const SYNONYMS: Record<string, string[]> = {
  coffee: ["coffee", "café", "cafe", "degustação"],
  café: ["coffee", "café", "cafe", "degustação"],
  beach: ["beach", "praia", "praias", "playa"],
  praia: ["beach", "praia", "praias", "playa"],
  praias: ["beach", "praia", "praias", "playa"],
  hike: ["hike", "hiking", "trilha", "trilhas", "trekking"],
  trilha: ["hike", "hiking", "trilha", "trilhas", "trekking"],
  trilhas: ["hike", "hiking", "trilha", "trilhas", "trekking"],
  waterfall: ["waterfall", "cachoeira", "cachoeiras"],
  cachoeira: ["waterfall", "cachoeira", "cachoeiras"],
  favela: ["favela", "rocinha", "community", "comunidade"],
  rocinha: ["favela", "rocinha"],
  futebol: ["football", "soccer", "futebol", "maracanã", "maracana", "matchday"],
  football: ["football", "soccer", "futebol", "maracanã", "maracana", "matchday"],
  maracana: ["football", "soccer", "futebol", "maracanã", "maracana", "stadium"],
  maracanã: ["football", "soccer", "futebol", "maracanã", "maracana", "stadium"],
  veleiro: ["sailing", "veleiro", "barco", "boat", "sunset", "guanabara"],
  barco: ["sailing", "veleiro", "barco", "boat", "guanabara", "cagarras"],
  boat: ["sailing", "veleiro", "barco", "boat", "guanabara"],
  mergulho: ["diving", "scuba", "mergulho", "arraial"],
  diving: ["diving", "scuba", "mergulho", "arraial"],
  escalada: ["climbing", "escalada", "rocha"],
  climbing: ["climbing", "escalada", "rocha"],
  centro: ["historic", "história", "historia", "colonial", "imperial", "centro", "downtown"],
  historico: ["historic", "história", "historia", "colonial", "centro"],
  histórico: ["historic", "história", "historia", "colonial", "centro"],
  historic: ["historic", "história", "historia", "colonial", "centro"],
  cultura: ["culture", "cultural", "cultura"],
  cristo: ["christ", "cristo", "redentor", "corcovado"],
  corcovado: ["christ", "cristo", "redentor", "corcovado"],
  urca: ["sugarloaf", "pão de açúcar", "pao de acucar", "urca"],
  niteroi: ["niterói", "niteroi"],
  niterói: ["niterói", "niteroi"],
  transfer: ["transfer", "transfers", "aeroporto", "airport"],
  rooftop: ["rooftop", "rooftops", "vista", "views", "sunset"],
  gastronomia: ["food", "gastronomia", "culinária", "restaurant", "botequim"],
  food: ["food", "gastronomia", "culinária", "restaurant", "botequim"],
};

export const RelatedBlogPosts = ({
  tourTitle,
  tourSlug,
  tourDescription,
  tourKeywords,
}: {
  tourTitle: string;
  tourSlug?: string;
  tourDescription?: string;
  tourKeywords?: string | null;
}) => {
  const { language } = useLocale();

  const { data: posts } = useQuery({
    queryKey: ["blogPostsLite"],
    queryFn: async () => {
      const { data } = await supabase
        .from("blog_posts")
        .select("id,title,slug,meta_keywords,tags,excerpt,title_en,title_es,title_zh_cn,title_zh_tw,excerpt_en,excerpt_es")
        .eq("is_published", true)
        .order("created_at", { ascending: false });
      return (data || []) as unknown as PostLite[];
    },
    staleTime: 1000 * 60 * 10,
  });

  const related = useMemo(() => {
    if (!posts?.length) return [];

    const base = [
      ...(tourTitle || "").toLowerCase().split(/[\s\-,]+/),
      ...(tourSlug || "").toLowerCase().split("-"),
      ...(tourKeywords || "").toLowerCase().split(/[,;]+/).map((k) => k.trim()),
    ].filter((w) => w.length > 3 && !STOP_WORDS.has(w));

    const keywords = [...new Set(base.flatMap((w) => (SYNONYMS[w] ? [w, ...SYNONYMS[w]] : [w])))];
    const desc = (tourDescription || "").toLowerCase();

    const scored = posts.map((post) => {
      const haystack = [
        post.title, post.title_en, post.title_es, post.title_zh_cn, post.title_zh_tw,
        post.slug, post.excerpt, post.excerpt_en, post.excerpt_es,
        post.meta_keywords, (post.tags || []).join(" "),
      ].filter(Boolean).join(" ").toLowerCase();

      let score = 0;
      keywords.forEach((w) => {
        if (!w) return;
        if ((post.title || "").toLowerCase().includes(w)) score += 12;
        if ((post.slug || "").toLowerCase().includes(w)) score += 10;
        if ((post.meta_keywords || "").toLowerCase().includes(w)) score += 8;
        else if (haystack.includes(w)) score += 4;
        if (desc.includes(w)) score += 1;
      });
      return { post, score };
    });

    const relevant = scored.filter((s) => s.score >= 8).sort((a, b) => b.score - a.score);
    const ids = new Set(relevant.map((s) => s.post.id));
    const filler = scored.filter((s) => !ids.has(s.post.id)).sort((a, b) => b.score - a.score);

    return [...relevant, ...filler].slice(0, 10).map((s) => s.post);
  }, [posts, tourTitle, tourSlug, tourDescription, tourKeywords]);

  if (!related.length) return null;

  const heading =
    language === "pt" ? "Guias relacionados"
    : language === "es" ? "Guías relacionadas"
    : "Related Guides";


  const localizedTitle = (p: PostLite) =>
    (language === "en" ? p.title_en : language === "es" ? p.title_es : language === "zh-CN" ? p.title_zh_cn : language === "zh-TW" ? p.title_zh_tw : p.title) || p.title;

  return (
    <div className="mt-6 p-6 bg-muted/30 border border-border/50 rounded-2xl">
      <h4 className="font-black text-[10px] uppercase tracking-widest text-accent mb-4">{heading}</h4>
      <ul className="space-y-3">
        {related.map((post) => (
          <li key={post.id}>
            <Link
              to={`/blog/${post.slug}`}
              className="group flex items-start gap-2 text-sm text-foreground/90 hover:text-accent transition-colors leading-snug"
            >
              <ArrowRight className="w-3.5 h-3.5 mt-1 shrink-0 text-accent/60 group-hover:translate-x-0.5 transition-transform" />
              <span className="line-clamp-2">{localizedTitle(post)}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RelatedBlogPosts;
