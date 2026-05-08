import { useState, useEffect } from "react";
import { useParams, Navigate } from "react-router-dom";
import { fetchLovable, LovablePage } from "@/integrations/lovable/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { OptimizedImage } from "@/components/OptimizedImage";
import { Helmet } from "react-helmet-async";
import { getCanonicalUrl, getHreflangLinks } from "@/utils/seo";
import DOMPurify from "dompurify";

const GenericPage = () => {
  const { slug } = useParams();
  const [page, setPage] = useState<LovablePage | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPage = async () => {
      setIsLoading(true);
      const pages = await fetchLovable<LovablePage>("pages");
      const found = pages.find((p) => p.href === `/${slug}`);
      
      setPage(found || null);
      setIsLoading(false);
    };
    loadPage();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!page || (!page.content && page.is_visible === false)) {
    return <Navigate to="/404" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col pt-20">
      <Helmet>
        <title>{page.title} | Tocorime Rio</title>
        <meta name="description" content={page.content?.replace(/<[^>]*>/g, "").substring(0, 160) || page.title} />
        <link rel="canonical" href={getCanonicalUrl(`/${slug}`)} />
        {getHreflangLinks(`/${slug}`).map((l) => (
          <link key={l.hreflang} rel="alternate" hrefLang={l.hreflang} href={l.href} />
        ))}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={getCanonicalUrl(`/${slug}`)} />
        <meta property="og:title" content={`${page.title} | Tocorime Rio`} />
        <meta property="og:description" content={page.content?.replace(/<[^>]*>/g, "").substring(0, 160) || page.title} />
        <meta property="og:site_name" content="Tocorime Rio" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>
      <Header />
      
      <main className="flex-1 bg-background pb-16">
        {/* Cover Section (Matches Blog Style) */}
        <div className="w-full h-[35vh] md:h-[50vh] relative bg-primary/10 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/60 z-10" />
          <OptimizedImage 
            src="/placeholder.svg" 
            alt="Fundo" 
            width={1600}
            containerClassName="w-full h-full"
            className="w-full h-full object-cover"
            loading="eager"
            fetchPriority="high"
          />
          <div className="absolute inset-x-0 bottom-0 flex items-end justify-center pb-24 z-20">
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold text-white text-center drop-shadow-lg px-4">
              {page.title}
            </h1>
          </div>
        </div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-30">
          <div className="bg-card rounded-3xl shadow-2xl p-8 sm:p-12 border border-border/50">
            <div 
              className="prose prose-lg dark:prose-invert max-w-none font-sans leading-relaxed ql-viewer"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(page.content || "") || "<p className='text-center text-muted-foreground font-sans'>Página em construção.</p>" }}
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default GenericPage;
