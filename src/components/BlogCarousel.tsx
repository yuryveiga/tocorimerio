import { useState, useEffect, useRef } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fetchLovable, LovableBlogPost } from "@/integrations/lovable/client";
import { Link } from "react-router-dom";
import { useLocale } from "@/contexts/LocaleContext";
import { useSiteData } from "@/hooks/useSiteData";
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious 
} from "@/components/ui/carousel";
import { OptimizedImage } from "./OptimizedImage";

export function BlogCarousel() {
  const [posts, setPosts] = useState<LovableBlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { t, language } = useLocale();
  const { images } = useSiteData();
  const fallbackImage = images.hero_bg || "/placeholder.svg";
  const sectionRef = useRef<HTMLElement>(null);
  const fetchedRef = useRef(false);

  // ── Defer fetch until section enters viewport (keeps 364KB off the critical path)
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !fetchedRef.current) {
          fetchedRef.current = true;
          fetchLovable<LovableBlogPost>("blog_posts").then((data) => {
            setPosts(data.filter(p => p.is_published));
            setIsLoading(false);
          }).catch(() => setIsLoading(false));
          observer.disconnect();
        }
      },
      { rootMargin: "300px" } // start fetching 300px before section is visible
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const getTranslated = (post: LovableBlogPost, field: 'title' | 'content'): string => {
    if (language === 'pt') return post[field] as string;
    const key = `${field}_${language}` as keyof LovableBlogPost;
    const val = post[key];
    if (typeof val === 'string') return val;
    return post[field] as string;
  };

  if (isLoading || posts.length === 0) return <section ref={sectionRef} className="bg-[#FF8A5B] py-16 md:py-24" />;

  return (
    <section ref={sectionRef} className="bg-[#FF8A5B] py-16 md:py-24 overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* Left Side: Content */}
          <div className="w-full lg:w-1/3 text-white z-10">
            <h2 className="font-serif text-4xl sm:text-5xl font-bold mb-6 leading-tight">
              {t("inspirado_explorar")}
            </h2>
            <div className="w-full h-0.5 bg-white/30 mb-8 max-w-[280px]" />
            <p className="text-lg sm:text-xl font-sans lg:leading-relaxed text-white/90 mb-10">
              {t("blog_desc")}
            </p>
          </div>

          {/* Right Side: Carousel */}
          <div className="w-full lg:w-2/3">
            <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
              className="w-full"
            >
              <CarouselContent className="-ml-6">
                {posts.map((post) => {
                  const title = getTranslated(post, 'title');
                  const content = getTranslated(post, 'content');
                  
                  return (
                    <CarouselItem key={post.id} className="pl-6 basis-full md:basis-1/2">
                      <div className="bg-card rounded-2xl overflow-hidden shadow-2xl h-[480px] flex flex-col group border-none">
                        <div className="h-2/5 overflow-hidden bg-muted">
                          <OptimizedImage
                            src={post.image_url || fallbackImage}
                            alt={title}
                            width={600}
                            containerClassName="w-full h-full"
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            loading="lazy"
                          />
                        </div>
                        <div className="h-3/5 bg-[#008967] p-8 flex flex-col justify-between items-start">
                          <div className="w-full">
                            <h3 className="font-serif text-xl font-bold text-white mb-4 line-clamp-2 leading-snug">
                              {title}
                            </h3>
                            <p className="text-white/80 font-sans text-sm line-clamp-4 leading-relaxed">
                            {content ? content.replace(/<[^>]*>/g, ' ').substring(0, 150) + "..." : title}
                            </p>
                          </div>
                          
                          <Link 
                            to={`/blog/${post.slug}`} 
                            className="mt-4 focus:outline-none focus:ring-2 focus:ring-white rounded-full translate-y-0 active:scale-95 transition-transform"
                            aria-label={`${t("explore_conosco")}: ${title}`}
                          >
                            <div className="inline-flex items-center justify-center rounded-full text-sm font-black transition-colors bg-[#FF8A5B] hover:bg-[#ff7a45] text-white px-8 h-12 font-sans flex items-center gap-2 shadow-lg">
                              {t("explore_conosco")}
                              <ArrowRight className="w-4 h-4" />
                            </div>
                          </Link>
                        </div>
                      </div>
                    </CarouselItem>
                  );
                })}
              </CarouselContent>
              <div className="flex items-center gap-4 mt-8 lg:absolute lg:-left-[50%] lg:bottom-0">
                <CarouselPrevious className="static translate-y-0 w-12 h-12 border-none bg-white text-[#FF8A5B] hover:bg-white/90 hover:text-[#FF8A5B] shadow-xl" />
                <CarouselNext className="static translate-y-0 w-12 h-12 border-none bg-white text-[#FF8A5B] hover:bg-white/90 hover:text-[#FF8A5B] shadow-xl" />
              </div>
            </Carousel>
          </div>
        </div>
      </div>
    </section>
  );
}
