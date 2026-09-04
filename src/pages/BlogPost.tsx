import { useState, useEffect } from "react";
import { useParams, Navigate, Link } from "react-router-dom";
import DOMPurify from "dompurify";

import { LovableBlogPost } from "@/integrations/lovable/client";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Calendar, ArrowLeft, MessageCircle, Facebook, Link2, ArrowRight, Compass } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { ptBR, enUS, es } from "date-fns/locale";
import { useLocale } from "@/contexts/LocaleContext";
import { Helmet } from "react-helmet-async";
import { useSiteData } from "@/hooks/useSiteData";
import { TourItem, TourCardProps } from "@/components/TourItem";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import "react-quill-new/dist/quill.snow.css";
import { OptimizedImage } from "@/components/OptimizedImage";
import { getCanonicalUrl, generateOptimizedMetaDescription, getHreflangLinks, generateArticleSchema, generateBreadcrumbsSchema, getOgImage } from "@/utils/seo";
import { BlogPostRating } from "@/components/BlogPostRating";
import { EmailCaptureCTA } from "@/components/EmailCaptureCTA";

const InlineCTA = () => {
  const { t, language } = useLocale();
  return (
    <div className="my-12 p-8 sm:p-12 rounded-[2rem] bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 flex flex-col md:flex-row items-center justify-between gap-8 overflow-hidden relative group shadow-inner">
      <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full -mr-20 -mt-20 transition-transform group-hover:scale-150 duration-700" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-accent/5 rounded-full -ml-12 -mb-12 transition-transform group-hover:scale-150 duration-1000" />
      
      <div className="relative z-10 text-left flex-1">
        <div className="flex items-center gap-2 mb-4">
          <Compass className="w-5 h-5 text-accent animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-accent">
            {language === 'pt' ? 'Experiência Exclusiva' : 'Exclusive Experience'}
          </span>
        </div>
        <h4 className="font-serif text-2xl sm:text-3xl font-bold mb-3 text-foreground leading-tight">
            {language === 'pt' ? 'Planejando sua visita ao Rio?' : 'Planning your visit to Rio?'}
        </h4>
        <p className="text-muted-foreground text-base font-sans max-w-md leading-relaxed">
            {language === 'pt' ? 'Transforme sua leitura em realidade. Reserve um tour privativo com quem entende a alma carioca.' : 'Turn your reading into reality. Book a private tour with those who understand the soul of Rio.'}
        </p>
      </div>

      <Link to="/#tours" className="relative z-10 shrink-0 w-full md:w-auto">
        <Button className="w-full md:w-auto rounded-full px-10 h-16 font-black text-sm uppercase tracking-widest shadow-2xl shadow-accent/30 bg-accent text-accent-foreground hover:bg-accent/90 hover:scale-105 active:scale-95 transition-all flex items-center gap-3">
            {t("explorar_passeios")}
            <ArrowRight className="w-5 h-5" />
        </Button>
      </Link>
    </div>
  );
};

// Social sharing overrides (Open Graph / Twitter Card) for specific posts
const SOCIAL_SEO: Record<string, { title: string; description: string; imageAlt: string; keywords: string }> = {
  "sunset-in-rio-de-janeiro-guide": {
    title: "Sunset in Rio de Janeiro: A Practical Guide to the City's Best Viewpoints",
    description:
      "When and where to watch the sunset in Rio de Janeiro — the best viewpoints, seasonal sunset times, and practical tips for Arpoador, Sugarloaf Mountain, and more.",
    imageAlt: "Sunset over Rio de Janeiro seen from Arpoador rock",
    keywords:
      "sunset in Rio de Janeiro, best sunset spots Rio, Arpoador sunset, Sugarloaf Mountain sunset, Mirante Dona Marta, pôr do sol no Rio de Janeiro",
  },
  "sunset-rio-de-janeiro-golden-hour-experience": {
    title: "Sunset in Rio de Janeiro: The Golden Hour You'll Never Forget",
    description:
      "Discover why cariocas stop everything to watch the sky over Rio de Janeiro turn gold — and where to stand for the sunset of your trip.",
    imageAlt: "Golden hour light over Rio de Janeiro's beaches and mountains",
    keywords:
      "sunset in Rio de Janeiro, Rio sunset experience, Arpoador sunset, golden hour Rio de Janeiro, pôr do sol no Rio de Janeiro, private Rio tours",
  },
};

const BlogPost = () => {
  const { slug } = useParams();
  const [post, setPost] = useState<LovableBlogPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { t, language } = useLocale();
  const { siteSettings, tours } = useSiteData();

  const dateLocale = language === 'en' ? enUS : language === 'es' ? es : ptBR;
  const siteTitle = siteSettings?.site_title?.split('|')[0].trim() || "Tocorime Rio";
  const fallbackImage = `${getCanonicalUrl("")}/og-image.jpg`;

  useEffect(() => {
    window.scrollTo(0, 0);
    const loadPost = async () => {
      setIsLoading(true);
      // Busca apenas o post pelo slug — evita baixar TODOS os posts com conteúdo completo.
      const { data } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("slug", slug!)
        .eq("is_published", true)
        .maybeSingle();
      setPost((data as unknown as LovableBlogPost) || null);
      setIsLoading(false);
    };
    loadPost();
  }, [slug]);

  const shareOnWhatsApp = () => {
    const text = encodeURIComponent(`${title}\n\n${window.location.href}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const shareOnFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank');
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success(language === 'pt' ? 'Link copiado!' : language === 'es' ? '¡Enlace copiado!' : 'Link copied!');
  };

  // Mapeia zh-CN → zh_cn, zh-TW → zh_tw para bater com nomes de coluna SQL
  const langToCol = (lang: string) => lang.replace('-', '_').toLowerCase();

  const getTranslated = (field: keyof LovableBlogPost): string => {
    if (!post) return "";
    if (language === 'pt') return String(post[field] || "");
    const translatedField = `${String(field)}_${langToCol(language)}` as keyof LovableBlogPost;
    const translated = (post as unknown as Record<string, string>)[translatedField];
    return String(translated || post[field] || "");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!post) {
    return <Navigate to="/404" replace />;
  }

  const title = getTranslated('title');
  const rawContent = getTranslated('content');
  const excerpt = getTranslated('excerpt');
  // Imagem Open Graph 1200x630 gerada automaticamente (com fallback para a imagem padrão do site)
  const ogImage = getOgImage(post.image_url || fallbackImage);

  // SEO overrides (title/description escritos manualmente para CTR no Google).
  // Só usados em inglês, que é o idioma indexado das páginas do blog.
  const metaTitleOverride = language === 'en'
    ? ((post as unknown as { meta_title_en?: string }).meta_title_en || '').trim()
    : '';
  const metaDescOverride = language === 'en'
    ? ((post as unknown as { meta_description?: string }).meta_description || '').trim()
    : '';

  // Fix line breaks for hyphenated words and non-breaking spaces
  // 1. Replace non-breaking spaces (nbsp) with normal spaces to allow correct wrapping
  // 2. Remove soft hyphens that cause incorrect syllable splitting
  // 3. Protect compound words (mata-mata) with non-breaking hyphens
  const content = (() => {
    const raw = String(rawContent || "")
      .replace(/\u00A0/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/\u00AD/g, '')
      .replace(/&shy;/g, '')
      .replace(/&#173;/g, '');

    // Protect compound words (mata-mata) with non-breaking hyphens,
    // but ONLY in text nodes — never inside HTML tag attributes (e.g. src="...").
    return raw
      .split(/(<[^>]*>)/)  // split preserving tags
      .map(part => {
        if (part.startsWith('<')) return part; // leave HTML tags untouched
        return part.replace(/([a-zA-ZáàâãéèêíïóôõöúçÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇ])(-)([a-zA-ZáàâãéèêíïóôõöúçÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇ])/g, '$1&#8209;$3');
      })
      .join('');
  })();

  const contentWithSplit = (() => {
    if (!content) return { part1: "", part2: "" };
    const paragraphs = content.split('</p>');
    if (paragraphs.length < 5) return { part1: content, part2: "" };
    
    // Split at roughly 1/3 of the text
    const splitIndex = 2; 
    const part1 = paragraphs.slice(0, splitIndex).join('</p>') + '</p>';
    const part2 = paragraphs.slice(splitIndex).join('</p>');
    return { part1, part2 };
  })();

  const blogHeroStyle = siteSettings?.blog_hero_style || "hero";

  return (
    <div className="min-h-screen flex flex-col font-sans bg-background">
      <style>{`
        .blog-content-area {
          font-family: 'Open Sans', sans-serif !important;
          color: #555555 !important;
          line-height: 1.6 !important;
          font-size: 1.05rem !important;
          text-align: justify !important;
          hyphens: none !important;
          -webkit-hyphens: none !important;
          -ms-hyphens: none !important;
          word-break: normal !important;
          line-break: strict !important;
          overflow-wrap: break-word !important;
          }
        .blog-content-area * {
          margin-top: 0 !important;
          margin-inline: 0 !important;
          hyphens: none !important;
          -webkit-hyphens: none !important;
          -ms-hyphens: none !important;
          word-break: normal !important;
          overflow-wrap: break-word !important;
        }
        .blog-content-area p {
          margin-bottom: 1.2rem !important;
          line-height: 1.7 !important;
          text-align: justify !important;
          word-break: normal !important;
          line-break: strict !important;
          overflow-wrap: break-word !important;
          hyphens: none !important;
          -webkit-hyphens: none !important;
          -ms-hyphens: none !important;
        }
        /* Handle spacing for manual line breaks without forcing them to be blocks */
        .blog-content-area br {
          margin-bottom: 0 !important;
        }
        /* Specific fix for empty paragraphs used as spacers by some editors */
        .blog-content-area p:empty,
        .blog-content-area p:has(br:only-child) {
          min-height: 1.2rem;
          margin-bottom: 0.8rem !important;
        }
        .blog-content-area h1, 
        .blog-content-area h2, 
        .blog-content-area h3 {
          font-family: 'Montserrat', sans-serif !important;
          font-weight: 700 !important;
          color: #333333 !important;
          margin-top: 1rem !important;
          margin-bottom: 0.3rem !important;
          line-height: 1.2 !important;
          text-align: left !important;
        }
        .blog-content-area h1 { font-size: 2rem !important; }
        .blog-content-area h2 { font-size: 1.6rem !important; }
        .blog-content-area h3 { font-size: 1.3rem !important; }
        
        .blog-content-area ul, 
        .blog-content-area ol {
          margin-bottom: 1.5rem !important;
          margin-top: 0.5rem !important;
          padding-left: 2rem !important;
          display: block !important;
        }
        .blog-content-area ul {
          list-style-type: disc !important;
        }
        .blog-content-area ol {
          list-style-type: decimal !important;
        }
        .blog-content-area li {
          margin-bottom: 0.5rem !important;
          line-height: 1.6 !important;
          display: list-item !important;
          list-style: inherit !important;
        }
        .blog-content-area img {
          border-radius: 0.5rem;
          margin: 1rem 0 !important;
          max-width: 100%;
          display: block;
        }
        .blog-content-area blockquote {
          border-left: 3px solid #008967;
          padding-left: 1rem;
          font-style: italic;
          margin: 1rem 0 !important;
          opacity: 0.9;
        }
        /* Override Quill default padding */
        .ql-editor.blog-content-area {
          padding: 0 !important;
        }
      `}</style>
      <Helmet>
        {post.slug.includes('rocinha') ? (
          <>
            <title>Rocinha Favela Tour Rio: Safe, Fun & Eye-Opening Guide</title>
            <meta name="description" content="Is a Rocinha favela tour safe? Discover Rio's most authentic cultural experience with local expert guides. Private tours, real community access, no tourist traps." />
            <meta name="keywords" content="Rocinha favela tour, Rio de Janeiro favela tour, safe favela tour Rio, guided tour Rocinha, favela tour for tourists, community tour Rio de Janeiro, responsible favela tourism, things to do in Rio de Janeiro, Rio de Janeiro private tours, Tocorime Rio" />
            <meta name="robots" content="index, follow" />
            <link rel="canonical" href="https://tocorimerio.com/blog/rocinha-favela-tour-rio-de-janeiro" />

            {/* Open Graph (Facebook, WhatsApp, LinkedIn) */}
            <meta property="og:type" content="article" />
            <meta property="og:title" content="Rocinha Favela Tour Rio: Safe, Fun & Eye-Opening Guide" />
            <meta property="og:description" content="Is a Rocinha favela tour safe? Discover Rio's most authentic cultural experience with local expert guides. Private tours, real community access, no tourist traps." />
            <meta property="og:url" content="https://tocorimerio.com/blog/rocinha-favela-tour-rio-de-janeiro" />
            <meta property="og:image" content={ogImage} />
            <meta property="og:image:secure_url" content={ogImage} />
            <meta property="og:image:width" content="1200" />
            <meta property="og:image:height" content="630" />
            <meta property="og:image:alt" content="Guided favela tour in Rocinha, Rio de Janeiro with local expert" />
            <meta property="og:locale" content="en_US" />
            <meta property="og:site_name" content="Tocorime Rio" />
            <meta property="article:published_time" content="2026-06-09" />
            <meta property="article:author" content="Tocorime Rio" />

            {/* Twitter Card */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content="Rocinha Favela Tour Rio: Safe, Fun & Eye-Opening Guide" />
            <meta name="twitter:description" content="Is a Rocinha favela tour safe? Discover Rio's most authentic cultural experience with local expert guides. Private tours, real community access, no tourist traps." />
            <meta name="twitter:image" content={ogImage} />

            <script type="application/ld+json">
              {`
              {
                "@context": "https://schema.org",
                "@type": "BlogPosting",
                "headline": "Rocinha Favela Tour Rio: Safe, Fun & Eye-Opening Guide",
                "description": "Is a Rocinha favela tour safe? Discover Rio's most authentic cultural experience with local expert guides. Private tours, real community access, no tourist traps.",
                "image": "https://tocorimerio.com/images/blog/rocinha-favela-tour-cover.jpg",
                "author": {
                  "@type": "Organization",
                  "name": "Tocorime Rio",
                  "url": "https://tocorimerio.com"
                },
                "publisher": {
                  "@type": "Organization",
                  "name": "Tocorime Rio",
                  "logo": {
                    "@type": "ImageObject",
                    "url": "https://tocorimerio.com/logo.png"
                  }
                },
                "datePublished": "2026-06-09",
                "mainEntityOfPage": {
                  "@type": "WebPage",
                  "@id": "https://tocorimerio.com/blog/rocinha-favela-tour-rio-de-janeiro"
                }
              }
              `}
            </script>
          </>
        ) : post.slug === 'visit-rio-de-janeiro' ? (
          <>
            <title>Why Visit Rio de Janeiro? 10 Reasons to Fall in Love With the City</title>
            <meta name="description" content="Discover 10 compelling reasons to visit Rio de Janeiro, from iconic Christ the Redeemer and stunning beaches to vibrant culture and thrilling football. Plan your unforgettable trip to the Marvelous City with local insights." />
            <meta name="keywords" content="Visit Rio de Janeiro, things to do Rio, Rio travel guide, Christ the Redeemer, Copacabana, Ipanema, Tijuca Forest, Rio culture, Rio football, safe travel Rio, Tocorime Rio" />
            <meta name="robots" content="index, follow" />
            <link rel="canonical" href="https://tocorimerio.com/blog/visit-rio-de-janeiro" />

            {/* Open Graph (Facebook, WhatsApp, LinkedIn) */}
            <meta property="og:type" content="article" />
            <meta property="og:title" content="Why Visit Rio de Janeiro? 10 Reasons to Fall in Love With the City" />
            <meta property="og:description" content="Discover 10 compelling reasons to visit Rio de Janeiro, from iconic Christ the Redeemer and stunning beaches to vibrant culture and thrilling football. Plan your unforgettable trip to the Marvelous City with local insights." />
            <meta property="og:url" content="https://tocorimerio.com/blog/visit-rio-de-janeiro" />
            <meta property="og:image" content={ogImage} />
            <meta property="og:image:secure_url" content={ogImage} />
            <meta property="og:image:width" content="1200" />
            <meta property="og:image:height" content="630" />
            <meta property="og:image:alt" content="Rio de Janeiro iconic landmarks and beaches" />
            <meta property="og:locale" content="en_US" />
            <meta property="og:site_name" content="Tocorime Rio" />
            {post.created_at && <meta property="article:published_time" content={post.created_at} />}
            {post.updated_at && <meta property="article:modified_time" content={post.updated_at} />}
            <meta property="article:author" content="Tocorime Rio" />
            <meta property="article:tag" content="Rio de Janeiro" />
            <meta property="article:tag" content="Brazil Travel" />
            <meta property="article:tag" content="Things to Do in Rio de Janeiro" />
            <meta property="article:tag" content="Christ the Redeemer" />
            <meta property="article:tag" content="Copacabana Beach" />
            <meta property="article:tag" content="Ipanema" />
            <meta property="article:tag" content="Sugarloaf Mountain" />
            <meta property="article:tag" content="Carnival" />
            <meta property="article:tag" content="Maracanã Stadium" />
            <meta property="article:tag" content="Private Tours Rio de Janeiro" />

            {/* Twitter Card */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content="Why Visit Rio de Janeiro? 10 Reasons to Fall in Love With the City" />
            <meta name="twitter:description" content="Discover 10 compelling reasons to visit Rio de Janeiro, from iconic Christ the Redeemer and stunning beaches to vibrant culture and thrilling football. Plan your unforgettable trip to the Marvelous City with local insights." />
            <meta name="twitter:image" content={ogImage} />

            <script type="application/ld+json">
              {JSON.stringify({
                "@context": "https://schema.org",
                "@type": "BlogPosting",
                "headline": "Why Visit Rio de Janeiro? 10 Reasons to Fall in Love With the City",
                "description": "Discover 10 compelling reasons to visit Rio de Janeiro, from iconic Christ the Redeemer and stunning beaches to vibrant culture and thrilling football. Plan your unforgettable trip to the Marvelous City with local insights.",
                "image": ogImage,
                "keywords": "Visit Rio de Janeiro, things to do Rio, Rio travel guide, Christ the Redeemer, Copacabana, Ipanema, Tijuca Forest, Rio culture, Rio football, safe travel Rio, Tocorime Rio",
                "author": {
                  "@type": "Organization",
                  "name": "Tocorime Rio",
                  "url": "https://tocorimerio.com"
                },
                "publisher": {
                  "@type": "Organization",
                  "name": "Tocorime Rio",
                  "logo": {
                    "@type": "ImageObject",
                    "url": "https://tocorimerio.com/logo.png"
                  }
                },
                "datePublished": post.created_at,
                "dateModified": post.updated_at || post.created_at,
                "mainEntityOfPage": {
                  "@type": "WebPage",
                  "@id": "https://tocorimerio.com/blog/visit-rio-de-janeiro"
                }
              })}
            </script>

            {getHreflangLinks(`/blog/visit-rio-de-janeiro`).map((l) => (
              <link key={l.hreflang} rel="alternate" hrefLang={l.hreflang} href={l.href} />
            ))}
          </>
        ) : post.slug === 'visit-sugar-loaf-rio' ? (
          <>
            <title>Visit Sugarloaf Mountain Rio: Ultimate Guide & Private Tours</title>
            <meta name="description" content="Discover the ultimate guide to visiting Sugarloaf Mountain in Rio de Janeiro. Learn about the cable car, best times for breathtaking views, and insider tips. Book a private tour with Tocorime Rio for an unforgettable experience." />
            <meta name="keywords" content="Rio de Janeiro, Sugarloaf Mountain, Pão de Açúcar, cable car, tourist guide Rio, private tours Rio, things to do Rio, best views Rio, travel guide Rio, Tocorime Rio" />
            <meta name="robots" content="index, follow" />
            <link rel="canonical" href="https://tocorimerio.com/blog/visit-sugar-loaf-rio" />

            <meta property="og:type" content="article" />
            <meta property="og:title" content="Visit Sugarloaf Mountain Rio: Ultimate Guide & Private Tours" />
            <meta property="og:description" content="Discover the ultimate guide to visiting Sugarloaf Mountain in Rio de Janeiro. Learn about the cable car, best times for breathtaking views, and insider tips. Book a private tour with Tocorime Rio for an unforgettable experience." />
            <meta property="og:url" content="https://tocorimerio.com/blog/visit-sugar-loaf-rio" />
            <meta property="og:image" content={ogImage} />
            <meta property="og:image:secure_url" content={ogImage} />
            <meta property="og:image:width" content="1200" />
            <meta property="og:image:height" content="630" />
            <meta property="og:image:alt" content={post.featured_image_alt || title} />
            <meta property="og:locale" content="en_US" />
            <meta property="og:site_name" content="Tocorime Rio" />

            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content="Visit Sugarloaf Mountain Rio: Ultimate Guide & Private Tours" />
            <meta name="twitter:description" content="Discover the ultimate guide to visiting Sugarloaf Mountain in Rio de Janeiro. Learn about the cable car, best times for breathtaking views, and insider tips. Book a private tour with Tocorime Rio for an unforgettable experience." />
            <meta name="twitter:image" content={ogImage} />
            {getHreflangLinks(`/blog/visit-sugar-loaf-rio`).map((l) => (
              <link key={l.hreflang} rel="alternate" hrefLang={l.hreflang} href={l.href} />
            ))}
          </>
        ) : post.slug === 'how-to-hire-a-safe-tour-guide-in-rio-de-janeiro-without-getting-scammed' ? (
          <>
            <title>How to Hire a Safe Tour Guide in Rio de Janeiro Without Getting Scammed</title>
            <meta name="description" content="Learn how to hire a safe and professional tour guide in Rio de Janeiro and avoid scams. Get tips on verifying credentials, checking reviews, and choosing private tours for a secure and enjoyable trip with Tocorime Rio." />
            <meta name="keywords" content="Rio de Janeiro tour guide, safe tour guide Rio, avoid scams Rio, private tours Rio, professional guide Rio, travel safety Rio, Tocorime Rio, how to hire a guide Rio" />
            <meta name="robots" content="index, follow" />
            <link rel="canonical" href="https://tocorimerio.com/blog/how-to-hire-a-safe-tour-guide-in-rio-de-janeiro-without-getting-scammed" />

            <meta property="og:type" content="article" />
            <meta property="og:title" content="How to Hire a Safe Tour Guide in Rio de Janeiro Without Getting Scammed" />
            <meta property="og:description" content="Learn how to hire a safe and professional tour guide in Rio de Janeiro and avoid scams. Get tips on verifying credentials, checking reviews, and choosing private tours for a secure and enjoyable trip with Tocorime Rio." />
            <meta property="og:url" content="https://tocorimerio.com/blog/how-to-hire-a-safe-tour-guide-in-rio-de-janeiro-without-getting-scammed" />
            <meta property="og:image" content={ogImage} />
            <meta property="og:image:secure_url" content={ogImage} />
            <meta property="og:image:width" content="1200" />
            <meta property="og:image:height" content="630" />
            <meta property="og:image:alt" content={post.featured_image_alt || title} />
            <meta property="og:locale" content="en_US" />
            <meta property="og:site_name" content="Tocorime Rio" />

            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content="How to Hire a Safe Tour Guide in Rio de Janeiro Without Getting Scammed" />
            <meta name="twitter:description" content="Learn how to hire a safe and professional tour guide in Rio de Janeiro and avoid scams. Get tips on verifying credentials, checking reviews, and choosing private tours for a secure and enjoyable trip with Tocorime Rio." />
            <meta name="twitter:image" content={ogImage} />
            {getHreflangLinks(`/blog/how-to-hire-a-safe-tour-guide-in-rio-de-janeiro-without-getting-scammed`).map((l) => (
              <link key={l.hreflang} rel="alternate" hrefLang={l.hreflang} href={l.href} />
            ))}
          </>
        ) : post.slug === 'how-to-get-tickets-for-maracana-the-comp' ? (
          <>
            <title>How to Get Tickets for Maracanã Stadium: The Complete Guide</title>
            <meta name="description" content="Experience the thrill of Maracanã Stadium! This guide helps you get tickets for live football matches in Rio, navigate safely, and enjoy the electric atmosphere. Find out how Tocorime Rio can assist with your Maracanã experience." />
            <meta name="keywords" content="Maracanã Stadium, Maracanã tickets, football Rio, soccer Rio, Flamengo, Fluminense, Rio derby, live match Rio, Maracanã tour, Tocorime Rio" />
            <meta name="robots" content="index, follow" />
            <link rel="canonical" href="https://tocorimerio.com/blog/how-to-get-tickets-for-maracana-the-comp" />

            <meta property="og:type" content="article" />
            <meta property="og:title" content="How to Get Tickets for Maracanã Stadium: The Complete Guide" />
            <meta property="og:description" content="Experience the thrill of Maracanã Stadium! This guide helps you get tickets for live football matches in Rio, navigate safely, and enjoy the electric atmosphere. Find out how Tocorime Rio can assist with your Maracanã experience." />
            <meta property="og:url" content="https://tocorimerio.com/blog/how-to-get-tickets-for-maracana-the-comp" />
            <meta property="og:image" content={ogImage} />
            <meta property="og:image:secure_url" content={ogImage} />
            <meta property="og:image:width" content="1200" />
            <meta property="og:image:height" content="630" />
            <meta property="og:image:alt" content={post.featured_image_alt || title} />
            <meta property="og:locale" content="en_US" />
            <meta property="og:site_name" content="Tocorime Rio" />

            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content="How to Get Tickets for Maracanã Stadium: The Complete Guide" />
            <meta name="twitter:description" content="Experience the thrill of Maracanã Stadium! This guide helps you get tickets for live football matches in Rio, navigate safely, and enjoy the electric atmosphere. Find out how Tocorime Rio can assist with your Maracanã experience." />
            <meta name="twitter:image" content={ogImage} />
            {getHreflangLinks(`/blog/how-to-get-tickets-for-maracana-the-comp`).map((l) => (
              <link key={l.hreflang} rel="alternate" hrefLang={l.hreflang} href={l.href} />
            ))}
          </>
        ) : SOCIAL_SEO[post.slug] ? (
          <>
            <title>{SOCIAL_SEO[post.slug].title}</title>
            <meta name="description" content={SOCIAL_SEO[post.slug].description} />
            <meta name="keywords" content={SOCIAL_SEO[post.slug].keywords} />
            <meta name="robots" content="index, follow" />
            <link rel="canonical" href={getCanonicalUrl(`/blog/${post.slug}`)} />
            {getHreflangLinks(`/blog/${post.slug}`).map((l) => (
              <link key={l.hreflang} rel="alternate" hrefLang={l.hreflang} href={l.href} />
            ))}

            {/* Open Graph (Facebook, WhatsApp, LinkedIn) */}
            <meta property="og:type" content="article" />
            <meta property="og:site_name" content="Tocorime Rio" />
            <meta property="og:url" content={getCanonicalUrl(`/blog/${post.slug}`)} />
            <meta property="og:title" content={SOCIAL_SEO[post.slug].title} />
            <meta property="og:description" content={SOCIAL_SEO[post.slug].description} />
            <meta property="og:image" content={ogImage} />
            <meta property="og:image:secure_url" content={ogImage} />
            <meta property="og:image:width" content="1200" />
            <meta property="og:image:height" content="630" />
            <meta property="og:image:alt" content={post.featured_image_alt || SOCIAL_SEO[post.slug].imageAlt} />
            <meta property="og:locale" content={language === 'pt' ? 'pt_BR' : language === 'es' ? 'es_ES' : 'en_US'} />
            {post.created_at && <meta property="article:published_time" content={post.created_at} />}
            {post.updated_at && <meta property="article:modified_time" content={post.updated_at} />}
            <meta property="article:author" content="Tocorime Rio" />

            {/* Twitter Card */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:site" content="@tocorimerio" />
            <meta name="twitter:title" content={SOCIAL_SEO[post.slug].title} />
            <meta name="twitter:description" content={SOCIAL_SEO[post.slug].description} />
            <meta name="twitter:image" content={ogImage} />
            <meta name="twitter:image:alt" content={post.featured_image_alt || SOCIAL_SEO[post.slug].imageAlt} />

            <script type="application/ld+json">
              {JSON.stringify(generateArticleSchema({
                title: SOCIAL_SEO[post.slug].title,
                description: SOCIAL_SEO[post.slug].description,
                imageUrl: ogImage,
                url: getCanonicalUrl(`/blog/${post.slug}`),
                datePublished: post.created_at,
                dateModified: post.updated_at || post.created_at,
                keywords: SOCIAL_SEO[post.slug].keywords,
                inLanguage: language === 'pt' ? 'pt-BR' : language === 'es' ? 'es-ES' : 'en-US',
                wordCount: String(content || "").replace(/<[^>]*>/g, " ").trim().split(/\s+/).filter(Boolean).length || undefined,
                articleSection: "Rio de Janeiro Travel Guide",
              }))}
            </script>
            <script type="application/ld+json">
              {JSON.stringify(generateBreadcrumbsSchema([
                { name: t("inicio"), url: getCanonicalUrl("/") },
                { name: "Blog", url: getCanonicalUrl("/blog") },
                { name: SOCIAL_SEO[post.slug].title, url: getCanonicalUrl(`/blog/${post.slug}`) }
              ]))}
            </script>
          </>
        ) : (
          <>
            <title>{metaTitleOverride || `${title} | ${siteTitle}`}</title>
            <meta name="description" content={metaDescOverride || generateOptimizedMetaDescription(excerpt || content || title, title, language)} />
            <meta name="robots" content="index, follow" />
            {(() => {
              const kw = post as unknown as { meta_keywords?: string; meta_keywords_pt?: string; meta_keywords_es?: string };
              const localized = language === "pt" ? kw.meta_keywords_pt : language === "es" ? kw.meta_keywords_es : undefined;
              const value = localized || kw.meta_keywords;
              return value ? <meta name="keywords" content={value} /> : null;
            })()}

            {/* Canonical must appear before OG to make the signal unambiguous for crawlers */}
            <link rel="canonical" href={getCanonicalUrl(`/blog/${post.slug}`)} />
            {getHreflangLinks(`/blog/${post.slug}`).map((l) => (
              <link key={l.hreflang} rel="alternate" hrefLang={l.hreflang} href={l.href} />
            ))}

            {/* Open Graph / Facebook */}
            <meta property="og:type" content="article" />
            <meta property="og:url" content={getCanonicalUrl(`/blog/${post.slug}`)} />
            <meta property="og:title" content={metaTitleOverride || `${title} | ${siteTitle}`} />
            <meta property="og:description" content={metaDescOverride || generateOptimizedMetaDescription(excerpt || content || title, title, language)} />
            <meta property="og:image" content={ogImage} />
            <meta property="og:image:secure_url" content={ogImage} />
            <meta property="og:image:width" content="1200" />
            <meta property="og:image:height" content="630" />
            <meta property="og:image:alt" content={post.featured_image_alt || title} />
            <meta property="og:site_name" content="Tocorime Rio" />
            <meta property="og:locale" content={language === 'pt' ? 'pt_BR' : language === 'es' ? 'es_ES' : 'en_US'} />
            {post.created_at && <meta property="article:published_time" content={post.created_at} />}
            {post.updated_at && <meta property="article:modified_time" content={post.updated_at} />}

            <script type="application/ld+json">
              {JSON.stringify(generateArticleSchema({
                title,
                description: excerpt || title,
                imageUrl: ogImage,
                url: getCanonicalUrl(`/blog/${post.slug}`),
                datePublished: post.created_at,
                dateModified: post.updated_at || post.created_at,
                keywords: post.meta_keywords || (Array.isArray(post.tags) ? post.tags.join(", ") : undefined),
                inLanguage: language === 'pt' ? 'pt-BR' : language === 'es' ? 'es-ES' : 'en-US',
                wordCount: String(content || "").replace(/<[^>]*>/g, " ").trim().split(/\s+/).filter(Boolean).length || undefined,
                articleSection: "Rio de Janeiro Travel Guide",
              }))}
            </script>

            <script type="application/ld+json">
              {JSON.stringify(generateBreadcrumbsSchema([
                { name: t("inicio"), url: getCanonicalUrl("/") },
                { name: "Blog", url: getCanonicalUrl("/blog") },
                { name: title, url: getCanonicalUrl(`/blog/${post.slug}`) }
              ]))}
            </script>

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={metaTitleOverride || `${title} | ${siteTitle}`} />
            <meta name="twitter:description" content={metaDescOverride || excerpt || title} />
            <meta name="twitter:image" content={ogImage} />
          </>
        )}

        {post.slug === "best-feijoada-rio-de-janeiro-tourists" && (
          <script type="application/ld+json">
            {JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: [
                {
                  q: "Qual é a melhor feijoada do Rio de Janeiro?",
                  a: "As melhores feijoadas do Rio estão nos botequins tradicionais que cozinham o feijão no mesmo dia, geralmente às quartas-feiras e aos sábados, na Lapa, Santa Teresa, Glória e Centro.",
                },
                {
                  q: "Qual dia da semana tem feijoada no Rio de Janeiro?",
                  a: "Sábado é o dia clássico da feijoada no Rio, e muitos botequins também servem às quartas-feiras.",
                },
                {
                  q: "Quanto custa uma feijoada no Rio de Janeiro?",
                  a: "Uma porção individual costuma custar entre R$ 60 e R$ 120, e as porções para duas pessoas ficam entre R$ 110 e R$ 200.",
                },
                {
                  q: "O que acompanha a feijoada?",
                  a: "Arroz branco, couve refogada, farofa, laranja em rodelas e molho de pimenta, com chopp gelado ou caipirinha para beber.",
                },
                {
                  q: "Existe feijoada vegetariana no Rio?",
                  a: "Sim. Vários restaurantes de Botafogo e Santa Teresa servem feijoada vegetariana, geralmente aos sábados.",
                },
              ].map((f) => ({
                "@type": "Question",
                name: f.q,
                acceptedAnswer: { "@type": "Answer", text: f.a },
              })),
            })}
          </script>
        )}

        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@700;800&family=Open+Sans:wght@400;600&display=swap" rel="stylesheet" />
      </Helmet>
      
      <Header />
      
      <main className="flex-1" data-blog-post>
        {blogHeroStyle === "hero" ? (
          <>
            {/* HERO SECTION FOR BLOG POST - NEW STYLE */}
            <section className="relative h-[75vh] sm:h-[85vh] flex items-center justify-center overflow-hidden bg-black">
              <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-[length:20000ms] hover:scale-110"
                style={{ backgroundImage: `url('${post.image_url || fallbackImage}')` }}
              />
              <div className="absolute inset-0 bg-black/50" />
              <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent z-[5]" />
              
              <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center animate-fade-in-up">
                <Link to="/blog" className="inline-flex items-center text-white/80 hover:text-white font-sans mb-3 transition-colors">
                  <ArrowLeft className="w-5 h-5 mr-2" /> {t("voltar_blog")}
                </Link>
                
                <div className="flex items-center justify-center gap-2 text-sm text-white/80 mb-3 font-sans uppercase tracking-[0.2em]">
                  <Calendar className="w-4 h-4 text-primary" />
                  {post.created_at ? format(new Date(post.created_at), language === 'en' ? "MMMM dd, yyyy" : "dd 'de' MMMM 'de' yyyy", { locale: dateLocale }) : t("publicado_recentemente")}
                </div>
                
                <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl font-extrabold text-white mb-0 leading-tight drop-shadow-2xl">
                  {title}
                </h1>
              </div>
            </section>

            {/* CONTENT SECTION */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-48 relative z-20 mb-20">
              <div className="bg-card rounded-3xl shadow-2xl p-8 sm:p-16 border border-border/50">
                <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-8">
                  <Link to="/" className="hover:text-primary transition-colors">{t("inicio")}</Link>
                  <span aria-hidden>/</span>
                  <Link to="/blog" className="hover:text-primary transition-colors">Blog</Link>
                  <span aria-hidden>/</span>
                  <span className="text-foreground/70 truncate max-w-[60%]">{title}</span>
                </nav>
                <div 
                  className="max-w-none ql-editor blog-content-area"
                  style={{ padding: 0 }}
                  lang={language}
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(contentWithSplit.part1 || "", {
                    ADD_ATTR: ['src', 'width', 'height', 'style', 'class', 'target', 'rel'],
                    ADD_TAGS: ['img'],
                    ALLOW_DATA_ATTR: false,
                    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp|data):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
                  }) }}
                />

                {contentWithSplit.part2 && (
                  <>
                    <InlineCTA />
                    <div 
                      className="max-w-none ql-editor blog-content-area"
                      style={{ padding: 0 }}
                      lang={language}
                      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(contentWithSplit.part2 || "", {
                        ADD_ATTR: ['src', 'width', 'height', 'style', 'class', 'target', 'rel'],
                        ADD_TAGS: ['img'],
                        ALLOW_DATA_ATTR: false,
                        ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp|data):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
                      }) }}
                    />
                  </>
                )}

                {post?.id && <BlogPostRating postId={post.id} />}

                {/* AUTHOR BOX */}
                <div className="mt-16 p-8 bg-muted/30 border border-border/50 rounded-2xl flex flex-col md:flex-row items-center md:items-start gap-8 group">
                  <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden shrink-0 border-4 border-background shadow-md">
                    <img 
                      src="/__l5e/assets-v1/ff11c649-d82d-46b6-b474-e88118fed024/marius-guide.jpg" 
                      alt="Marius Dobbin" 
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h4 className="font-black text-[10px] uppercase tracking-[0.25em] text-accent mb-1">
                      {language === 'pt' ? 'Autor e Especialista Local' : 'Author & Local Expert'}
                    </h4>
                    <p className="font-serif text-2xl font-bold mb-3 text-foreground">
                      Marius Dobbin
                    </p>
                    <p className="text-base text-muted-foreground leading-relaxed mb-4">
                      {language === 'pt' ? 'Carioca de alma e coração, transformei minha paixão profunda pelo Rio no propósito da minha vida. Desenho cada experiência com atenção aos detalhes para garantir que você viva a cidade de forma autêntica e segura.' : 'Born and raised in Rio, I turned a lifelong passion for my hometown into my life\'s work. I craft every journey with attention to detail to ensure you experience Rio authentically and safely.'}
                    </p>
                    <Link to="/your-private-guide-in-rio" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-accent hover:gap-3 transition-all">
                      {language === 'pt' ? 'Conheça minha história' : 'Discover my story'}
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>

                <EmailCaptureCTA sourceSlug={post?.slug} />

                {/* BLOG CTA BLOCK */}
                <div className="mt-16 p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 text-center animate-fade-in shadow-inner relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-700" />
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary/5 rounded-full -ml-12 -mb-12 transition-transform group-hover:scale-150 duration-700" />
                  
                  <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
                    <div className="text-left flex-1">
                      <h3 className="font-serif text-2xl sm:text-3xl font-bold mb-4">
                        {language === 'pt' ? 'Gostou dessa dica?' : 
                         language === 'es' ? '¿Te gustó este consejo?' : 
                         'Did you like this tip?'}
                      </h3>
                      <p className="text-muted-foreground text-lg mb-0 font-sans max-w-xl">
                        {language === 'pt' ? 'Viva a emoção de descobrir o Rio de Janeiro com nossos guias especialistas e exclusivos.' : 
                         language === 'es' ? 'Vive la emoción de descubrir Río de Janeiro con nuestros guías expertos y exclusivos.' : 
                         'Experience the thrill of discovering Rio de Janeiro with our expert and exclusive guides.'}
                      </p>
                    </div>

                    <div className="flex flex-col items-center gap-4 shrink-0">
                      <Link to="/#tours">
                        <Button size="lg" className="rounded-full px-12 font-bold h-16 text-base uppercase tracking-wider shadow-2xl shadow-primary/30 hover:scale-105 transition-all duration-300">
                          {language === 'pt' ? 'Reservar Agora' : 
                           language === 'es' ? 'Reservar Ahora' : 
                           'Book Now'}
                        </Button>
                      </Link>

                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mr-2 opacity-60">
                          {language === 'pt' ? 'Compartilhar:' : language === 'es' ? 'Compartir:' : 'Share:'}
                        </span>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="rounded-full w-10 h-10 border-green-500/20 hover:bg-green-500 hover:text-white transition-all shadow-sm"
                          onClick={shareOnWhatsApp}
                          title="WhatsApp"
                          aria-label={language === 'pt' ? 'Compartilhar no WhatsApp' : language === 'es' ? 'Compartir en WhatsApp' : 'Share on WhatsApp'}
                        >
                          <MessageCircle className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="rounded-full w-10 h-10 border-blue-600/20 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                          onClick={shareOnFacebook}
                          title="Facebook"
                          aria-label={language === 'pt' ? 'Compartilhar no Facebook' : language === 'es' ? 'Compartir en Facebook' : 'Share on Facebook'}
                        >
                          <Facebook className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="rounded-full w-10 h-10 border-primary/20 hover:bg-primary hover:text-white transition-all shadow-sm"
                          onClick={copyToClipboard}
                          title={language === 'pt' ? 'Copiar Link' : 'Copy Link'}
                          aria-label={language === 'pt' ? 'Copiar link do post' : language === 'es' ? 'Copiar enlace' : 'Copy post link'}
                        >
                          <Link2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-32 relative z-10 mb-20">
            <div className="bg-card rounded-2xl shadow-xl p-8 sm:p-12 border border-border/50">
              <Link to="/blog" className="inline-flex items-center text-primary font-medium font-sans mb-6 hover:underline">
                <ArrowLeft className="w-4 h-4 mr-2" /> {t("voltar_blog")}
              </Link>
   
                <div className="w-full aspect-video relative rounded-xl overflow-hidden mb-10 shadow-lg border border-border/50 bg-muted">
                    <OptimizedImage
                      src={post.image_url || fallbackImage}
                      alt={title}
                      width={1200}
                      containerClassName="w-full h-full"
                      fit="cover"
                      className="w-full h-full transition-transform duration-[length:2000ms] group-hover:scale-105"
                      loading="eager"
                      fetchPriority="high"
                    />
                </div>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4 font-sans">
                <Calendar className="w-4 h-4" />
                {post.created_at ? format(new Date(post.created_at), language === 'en' ? "MMMM dd, yyyy" : "dd 'de' MMMM 'de' yyyy", { locale: dateLocale }) : t("publicado_recentemente")}
              </div>
              
              <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-10 leading-tight">
                {title}
              </h1>
              
              <div 
                className="max-w-none ql-editor blog-content-area"
                style={{ padding: 0 }}
                lang={language}
                dangerouslySetInnerHTML={{ __html: contentWithSplit.part1 || "" }}
              />

              {contentWithSplit.part2 && (
                <>
                  <InlineCTA />
                  <div 
                    className="max-w-none ql-editor blog-content-area"
                    style={{ padding: 0 }}
                    lang={language}
                    dangerouslySetInnerHTML={{ __html: contentWithSplit.part2 || "" }}
                  />
                </>
              )}

              {post?.id && <BlogPostRating postId={post.id} />}

              {/* AUTHOR BOX */}
              <div className="mt-16 p-8 bg-muted/30 border border-border/50 rounded-2xl flex flex-col md:flex-row items-center md:items-start gap-8 group">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden shrink-0 border-4 border-background shadow-md">
                  <img 
                    src="/__l5e/assets-v1/ff11c649-d82d-46b6-b474-e88118fed024/marius-guide.jpg" 
                    alt="Marius Dobbin" 
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h4 className="font-black text-[10px] uppercase tracking-[0.25em] text-accent mb-1">
                    {language === 'pt' ? 'Autor e Especialista Local' : 'Author & Local Expert'}
                  </h4>
                  <p className="font-serif text-2xl font-bold mb-3 text-foreground">
                    Marius Dobbin
                  </p>
                  <p className="text-base text-muted-foreground leading-relaxed mb-4">
                    {language === 'pt' ? 'Carioca de alma e coração, transformei minha paixão profunda pelo Rio no propósito da minha vida. Desenho cada experiência com atenção aos detalhes para garantir que você viva a cidade de forma autêntica e segura.' : 'Born and raised in Rio, I turned a lifelong passion for my hometown into my life\'s work. I craft every journey with attention to detail to ensure you experience Rio authentically and safely.'}
                  </p>
                  <Link to="/your-private-guide-in-rio" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-accent hover:gap-3 transition-all">
                    {language === 'pt' ? 'Conheça minha história' : 'Discover my story'}
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>

              <EmailCaptureCTA sourceSlug={post?.slug} />

              {/* BLOG CTA BLOCK */}
              <div className="mt-16 p-8 sm:p-12 rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 text-center animate-fade-in shadow-inner relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-700" />
                
                <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
                  <div className="text-left flex-1">
                    <h3 className="font-serif text-2xl sm:text-3xl font-bold mb-4">
                      {language === 'pt' ? 'Gostou dessa dica?' : 
                       language === 'es' ? '¿Te gustó este consejo?' : 
                       'Did you like this tip?'}
                    </h3>
                    <p className="text-muted-foreground text-lg mb-0 font-sans max-w-xl">
                      {language === 'pt' ? 'Viva a emoção de descobrir o Rio de Janeiro com nossos guias especialistas e exclusivos.' : 
                       language === 'es' ? 'Vive la emoción de descobrir Río de Janeiro con nossos guías expertos e exclusivos.' : 
                       'Experience the thrill of discovering Rio de Janeiro with our expert and exclusive guides.'}
                    </p>
                  </div>

                  <div className="flex flex-col items-center gap-4 shrink-0">
                    <Link to="/#tours">
                      <Button size="lg" className="rounded-full px-12 font-bold h-16 text-base uppercase tracking-wider shadow-2xl shadow-primary/30 hover:scale-105 transition-all duration-300">
                        {language === 'pt' ? 'Reservar Agora' : 
                         language === 'es' ? 'Reservar Ahora' : 
                         'Book Now'}
                      </Button>
                    </Link>

                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mr-2 opacity-60">
                        {language === 'pt' ? 'Compartilhar:' : language === 'es' ? 'Compartir:' : 'Share:'}
                      </span>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="rounded-full w-10 h-10 border-green-500/20 hover:bg-green-500 hover:text-white transition-all shadow-sm"
                        onClick={shareOnWhatsApp}
                        title="WhatsApp"
                        aria-label={language === 'pt' ? 'Compartilhar no WhatsApp' : language === 'es' ? 'Compartir en WhatsApp' : 'Share on WhatsApp'}
                      >
                        <MessageCircle className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="rounded-full w-10 h-10 border-blue-600/20 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                        onClick={shareOnFacebook}
                        title="Facebook"
                        aria-label={language === 'pt' ? 'Compartilhar no Facebook' : language === 'es' ? 'Compartir en Facebook' : 'Share on Facebook'}
                      >
                        <Facebook className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="rounded-full w-10 h-10 border-primary/20 hover:bg-primary hover:text-white transition-all shadow-sm"
                        onClick={copyToClipboard}
                        title={language === 'pt' ? 'Copiar Link' : 'Copy Link'}
                        aria-label={language === 'pt' ? 'Copiar link do post' : language === 'es' ? 'Copiar enlace' : 'Copy post link'}
                      >
                        <Link2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* RECOMMENDED TOURS SHOWCASE */}
        <section className="py-20 lg:py-24 bg-muted/30 border-t border-border/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-foreground mb-4">
                {language === 'pt' ? 'Que tal viver essa experiência no Rio de Janeiro?' : 
                 language === 'es' ? '¿Qué tal viver esta experiência en Río?' : 
                 'How about living this experience in Rio?'}
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto font-sans">
                {language === 'pt' ? 'Confira nossos passeios mais bem avaliados e reserve sua próxima aventura.' : 
                 language === 'es' ? 'Echa un vistazo a nuestros tours melhor valorados e reserva tu próxima aventura.' : 
                 'Check out our top-rated tours and book your next adventure.'}
              </p>
            </div>
            
            <div className="px-4 md:px-12">
              <Carousel
                opts={{
                  align: "start",
                  loop: true,
                }}
                className="w-full"
              >
                <CarouselContent className="-ml-4">
                  {(() => {
                    // Stop words: generic location/travel words that exist in ALL Rio tours
                    // and would create false positives
                    const STOP_WORDS = new Set([
                      'rio', 'janeiro', 'brazil', 'brasil', 'best', 'tour', 'tours',
                      'guide', 'visit', 'travel', 'trip', 'experience', 'private',
                      'with', 'from', 'that', 'this', 'your', 'have', 'will', 'about',
                      'more', 'most', 'also', 'know', 'what', 'into', 'only', 'many',
                      'city', 'time', 'area', 'view', 'make', 'here', 'like',
                      'para', 'como', 'mais', 'para', 'pelo', 'pela', 'numa', 'pelo',
                      'shops', 'shop', 'cafe', 'bars', 'bars',
                    ]);

                    const postKeywords = (title + " " + excerpt + " " + content).toLowerCase();

                    // Extract meaningful keywords from the post slug (e.g. "best-coffee-shops" → ["coffee"])
                    const slugKeywords = (post.slug || "")
                      .split('-')
                      .filter(w => w.length > 4 && !STOP_WORDS.has(w));

                    // Extract meaningful words from the post title
                    const postTitleWords = title
                      .toLowerCase()
                      .split(/[\s\-]+/)
                      .filter(w => w.length > 4 && !STOP_WORDS.has(w));

                    // Combined meaningful keywords from slug + title (deduped)
                    const baseKeywords = [...new Set([...slugKeywords, ...postTitleWords])];

                    // Multilingual synonym map: post terms (any language) → equivalents
                    // in PT/EN/ES so we can cross-match tours regardless of the language
                    // the post or tour is written in. Extend as new content categories appear.
                    const SYNONYMS: Record<string, string[]> = {
                      coffee: ['coffee', 'café', 'cafe', 'degustação', 'degustacao'],
                      café: ['coffee', 'café', 'cafe', 'degustação', 'degustacao'],
                      cafe: ['coffee', 'café', 'cafe', 'degustação', 'degustacao'],
                      beach: ['beach', 'praia', 'praias', 'playa'],
                      praia: ['beach', 'praia', 'praias', 'playa'],
                      praias: ['beach', 'praia', 'praias', 'playa'],
                      hike: ['hike', 'hiking', 'trilha', 'trilhas', 'trekking', 'senderismo'],
                      hiking: ['hike', 'hiking', 'trilha', 'trilhas', 'trekking', 'senderismo'],
                      trilha: ['hike', 'hiking', 'trilha', 'trilhas', 'trekking'],
                      trilhas: ['hike', 'hiking', 'trilha', 'trilhas', 'trekking'],
                      waterfall: ['waterfall', 'cachoeira', 'cachoeiras', 'cascada'],
                      cachoeira: ['waterfall', 'cachoeira', 'cachoeiras'],
                      cachoeiras: ['waterfall', 'cachoeira', 'cachoeiras'],
                      favela: ['favela', 'rocinha', 'community'],
                      rocinha: ['favela', 'rocinha'],
                      football: ['football', 'soccer', 'futebol', 'maracanã', 'maracana', 'matchday'],
                      soccer: ['football', 'soccer', 'futebol', 'maracanã', 'maracana', 'matchday'],
                      futebol: ['football', 'soccer', 'futebol', 'maracanã', 'maracana', 'matchday'],
                      maracana: ['football', 'soccer', 'futebol', 'maracanã', 'maracana', 'matchday'],
                      stadium: ['stadium', 'estádio', 'estadio', 'maracanã', 'maracana'],
                      sailing: ['sailing', 'veleiro', 'barco', 'boat', 'sunset', 'guanabara', 'cagarras'],
                      boat: ['sailing', 'veleiro', 'barco', 'boat', 'sunset', 'guanabara'],
                      sunset: ['sunset', 'sailing', 'pôr do sol', 'atardecer'],
                      diving: ['diving', 'scuba', 'mergulho', 'buceo', 'arraial'],
                      scuba: ['diving', 'scuba', 'mergulho', 'arraial'],
                      mergulho: ['diving', 'scuba', 'mergulho', 'arraial'],
                      climbing: ['climbing', 'escalada', 'escalar', 'rocha'],
                      escalada: ['climbing', 'escalada', 'rocha'],
                      history: ['history', 'historic', 'história', 'historia', 'historico', 'histórico', 'colonial', 'imperial', 'centro'],
                      historic: ['history', 'historic', 'história', 'historia', 'historico', 'histórico', 'colonial'],
                      história: ['history', 'historic', 'história', 'historia', 'historico', 'histórico', 'colonial'],
                      historia: ['history', 'historic', 'história', 'historia', 'historico', 'histórico', 'colonial'],
                      culture: ['culture', 'cultural', 'cultura'],
                      cultura: ['culture', 'cultural', 'cultura'],
                      christ: ['christ', 'cristo', 'redentor', 'corcovado'],
                      cristo: ['christ', 'cristo', 'redentor', 'corcovado'],
                      corcovado: ['christ', 'cristo', 'redentor', 'corcovado'],
                      sugarloaf: ['sugarloaf', 'pão de açúcar', 'pao de acucar', 'urca'],
                      niteroi: ['niterói', 'niteroi'],
                      niterói: ['niterói', 'niteroi'],
                      transfer: ['transfer', 'transfers', 'aeroporto', 'airport'],
                      airport: ['transfer', 'transfers', 'aeroporto', 'airport'],
                    };

                    // Expand keywords with all known synonyms
                    const meaningfulKeywords = [...new Set(
                      baseKeywords.flatMap(w => SYNONYMS[w] ? [w, ...SYNONYMS[w]] : [w])
                    )];

                    const scoredTours = tours
                      .filter(t => t.is_active !== false)
                      .map(tour => {
                        let score = 0;
                        const tourTitle = (tour.title || "").toLowerCase();
                        const tourSlug = (tour.slug || "").toLowerCase();
                        const tourDesc = (tour.short_description || "").toLowerCase();

                        // Exact tour slug match anywhere in post content (strongest signal)
                        if (postKeywords.includes(tourSlug)) score += 100;

                        // Full tour title found in post content
                        if (postKeywords.includes(tourTitle)) score += 50;

                        // Meaningful post keywords vs tour title (high value, topic-specific match)
                        meaningfulKeywords.forEach(word => {
                          if (tourTitle.includes(word)) score += 20;
                          if (tourDesc.includes(word)) score += 8;
                          if (tourSlug.includes(word)) score += 15;
                        });

                        // Tour title words (non-stop) found in post content
                        tourTitle.split(' ')
                          .filter(w => w.length > 4 && !STOP_WORDS.has(w))
                          .forEach(word => {
                            if (postKeywords.includes(word)) score += 10;
                          });

                        // Tour description words (non-stop) found in post content
                        tourDesc.split(' ')
                          .filter(w => w.length > 5 && !STOP_WORDS.has(w))
                          .forEach(word => {
                            if (postKeywords.includes(word)) score += 3;
                          });

                        return { tour, score };
                      })
                      .sort((a, b) => b.score - a.score || (b.tour.is_featured ? 1 : 0) - (a.tour.is_featured ? 1 : 0));

                    // Only tours with a meaningful relevance score
                    const relevantTours = scoredTours.filter(item => item.score >= 15);

                    // Fallback: if fewer than 3 relevant tours found, pad with featured tours
                    const relevantIds = new Set(relevantTours.map(item => item.tour.id));
                    const fallbackFeatured = scoredTours
                      .filter(item => item.tour.is_featured && !relevantIds.has(item.tour.id))
                      .map(item => item.tour);

                    const finalTours = relevantTours.length >= 3
                      ? relevantTours.map(item => item.tour)
                      : [...relevantTours.map(item => item.tour), ...fallbackFeatured];

                    return finalTours.map((tour) => (
                      <CarouselItem key={tour.id} className="pl-4 basis-full sm:basis-1/2 lg:basis-1/4">
                        <div className="p-1" data-tour-card>
                          <TourItem tour={tour} />
                        </div>
                      </CarouselItem>
                    ));
                  })()}
                </CarouselContent>
                <div className="hidden md:block">
                  <CarouselPrevious className="-left-12 lg:-left-16 w-12 h-12 bg-white/80 hover:bg-white shadow-lg border-primary/20" />
                  <CarouselNext className="-right-12 lg:-right-16 w-12 h-12 bg-white/80 hover:bg-white shadow-lg border-primary/20" />
                </div>
              </Carousel>
            </div>
            
            <div className="mt-12 text-center">
                <Link to="/#tours">
                  <Button size="lg" className="rounded-full px-10 font-bold h-14 text-sm uppercase tracking-widest shadow-xl shadow-primary/20">
                    TOURS
                  </Button>
                </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default BlogPost;
