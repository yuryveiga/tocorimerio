import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { fetchLovable, LovableBlogPost } from "@/integrations/lovable/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ArrowRight, Calendar } from "lucide-react";
import { format } from "date-fns";
import { ptBR, enUS, es } from "date-fns/locale";
import { useLocale } from "@/contexts/LocaleContext";
import { useSiteData } from "@/hooks/useSiteData";
import { Helmet } from "react-helmet-async";
import { OptimizedImage } from "@/components/OptimizedImage";
import { getCanonicalUrl, getHreflangLinks } from "@/utils/seo";

const Blog = () => {
  const [posts, setPosts] = useState<LovableBlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { t, language } = useLocale();
  const { images } = useSiteData();
  const fallbackImage = images.hero_bg || "/placeholder.svg";

  const dateLocale = language === 'en' ? enUS : language === 'es' ? es : ptBR;

  const loadPosts = async () => {
    setIsLoading(true);
    const data = await fetchLovable<LovableBlogPost>("blog_posts");
    
    const published = data
      .filter(p => p.is_published)
      .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
      
    setPosts(published);
    setIsLoading(false);
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const getTranslated = (obj: LovableBlogPost, field: keyof LovableBlogPost) => {
    if (!obj) return "";
    if (language === 'pt') return (obj as Record<string, unknown>)[field] as string;
    return ((obj as Record<string, unknown>)[`${field}_${language}`] || obj[field]) as string;
  };

  return (
    <div className="min-h-screen flex flex-col pt-20">
      <Helmet>
        <title>Blog - Tocorime Rio | Dicas de Passeios no Rio de Janeiro</title>
        <meta name="description" content="Dicas, roteiros e guias sobre passeios no Rio de Janeiro. Descubra trilhas, praias, gastronomia e experiências únicas com a Tocorime Rio." />
        <link rel="canonical" href={getCanonicalUrl("/blog")} />
        {getHreflangLinks("/blog").map((l) => (
          <link key={l.hreflang} rel="alternate" hrefLang={l.hreflang} href={l.href} />
        ))}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={getCanonicalUrl("/blog")} />
        <meta property="og:title" content="Blog - Tocorime Rio | Dicas de Passeios no Rio de Janeiro" />
        <meta property="og:description" content="Dicas, roteiros e guias sobre passeios no Rio de Janeiro. Descubra trilhas, praias, gastronomia e experiências únicas." />
        <meta property="og:site_name" content="Tocorime Rio" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Blog - Tocorime Rio" />
        <meta name="twitter:description" content="Dicas, roteiros e guias sobre passeios no Rio de Janeiro." />
      </Helmet>
      <Header />
      
      <main className="flex-1 bg-muted/30 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="font-serif text-4xl sm:text-5xl font-bold text-foreground mb-4">
              {t("nosso_blog")}
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto font-sans">
              {t("blog_home_desc")}
            </p>
          </div>
          
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground font-sans">
              {t("nenhum_post")}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
                <Link 
                  key={post.id} 
                  to={post.slug}
                  className="bg-card border rounded-2xl overflow-hidden hover:shadow-lg transition-all group flex flex-col"
                >
                  <div className="aspect-video relative overflow-hidden bg-muted">
                    <OptimizedImage
                      src={post.image_url || fallbackImage}
                      alt={getTranslated(post, 'title')}
                      width={600}
                      containerClassName="w-full h-full"
                      fit="cover"
                      className="w-full h-full group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  </div>
                  
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3 font-sans">
                      <Calendar className="w-3 h-3" />
                      {post.created_at ? format(new Date(post.created_at), language === 'en' ? "MMMM dd, yyyy" : "dd 'de' MMMM, yyyy", { locale: dateLocale }) : t("publicado_recentemente")}
                    </div>
                    
                    <h3 className="font-serif text-xl font-bold text-foreground mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                      {getTranslated(post, 'title')}
                    </h3>
                    
                    <div className="mt-auto pt-4 flex items-center text-primary font-medium text-sm font-sans gap-1 group-hover:gap-2 transition-all">
                      {t("ler_mais")} <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Blog;
