import { useState, useEffect, useMemo, useCallback, useRef, lazy, Suspense } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Clock, Users, MapPin, Calendar, Check, ChevronDown, ChevronUp, ArrowLeft, ArrowRight, X, Star, Shield, ShieldCheck, Utensils, Activity, Sun, Sunrise, Moon, Plus, Minus, Gauge, Youtube, Cloud, Droplets, Wind, ShoppingCart, Facebook, MessageCircle, Link2, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { LovableTour } from "@/integrations/lovable/client";
import { useSiteData } from "@/hooks/useSiteData";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { TourItem, TourCardProps } from "@/components/TourItem";

import { useLocale } from "@/contexts/LocaleContext";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import { WhyChooseUs } from "@/components/WhyChooseUs";
import { getOptimizedImage } from "@/utils/imageOptimization";
import { OptimizedImage } from "@/components/OptimizedImage";
import { getTourMinPrice } from "@/utils/pricing";
import { UrgencyBadges } from "@/components/UrgencyBadges";
import { PaymentLogos } from "@/components/PaymentLogos";
import { SocialProof } from "@/components/SocialProof";
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious 
} from "@/components/ui/carousel";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Maximize2, Calendar as CalendarIcon } from "lucide-react";
import { Calendar as CalendarUI } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, parseISO, isPast, isToday } from "date-fns";
import { ptBR, enUS, es as esLocale } from "date-fns/locale";
import { getCanonicalUrl, BASE_URL, generateTouristAttractionSchema, generateTourPackageSchema, generateFAQSchema, generateOptimizedMetaDescription, getHreflangLinks, generateBreadcrumbsSchema } from "@/utils/seo";
import { slugify } from "@/utils/slugify";


import { WeatherSection } from "@/components/WeatherSection";
import { YouMayAlsoLike } from "@/components/YouMayAlsoLike";

const getYouTubeEmbedUrl = (url: string) => {
  if (!url) return "";
  
  // Extract video ID from various YouTube URL formats
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
  const match = url.match(regExp);
  
  const videoId = (match && match[2].length === 11) ? match[2] : null;
  
  if (videoId) {
    return `https://www.youtube.com/embed/${videoId}`;
  }
  
  return url;
};

export function PasseioDetalhe() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { tours, isLoading: isGlobalLoading, siteSettings, socialMedia } = useSiteData();
  const { data: tour, isLoading: isTourLoading } = useQuery({
    queryKey: ["tour", id],
    queryFn: async () => {
      if (!id) return null;
      
      // Check if id is a valid UUID to avoid database type errors
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
      
      let query = supabase.from("tours").select("*");
      
      if (isUuid) {
        query = query.or(`id.eq.${id},slug.eq.${id}`);
      } else {
        query = query.eq("slug", id);
      }
      
      const { data, error } = await query.single();
      if (error) throw error;
      return data as unknown as LovableTour;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const isLoading = isGlobalLoading || isTourLoading;
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [isPrivate, setIsPrivate] = useState(false);
  const { t, language, formatPrice } = useLocale();
  const { addToCart } = useCart();
  const [selectedPeriod, setSelectedPeriod] = useState('morning');
  const [selectedLocation, setSelectedLocation] = useState('tijuca');
  const [selectedDate, setSelectedDate] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [weather, setWeather] = useState<{ temp: number; condition: string; humidity: number; wind: number } | null>(null);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [selectedOptionIdx, setSelectedOptionIdx] = useState(0);
  const [imageDimensions, setImageDimensions] = useState<{ [key: string]: { width: number, height: number } }>({});

  const siteTitle = siteSettings?.site_title?.split('|')[0].trim() || "Eco-Wanderlust";
  const hidePrices = siteSettings?.['hide_prices'] === 'true';

  // TripAdvisor data
  const tripAdvisorSocial = socialMedia.find(s => 
    s.platform.toLowerCase().includes('tripadvisor') && s.is_active !== false
  );
  const tripAdvisorUrl = tripAdvisorSocial?.url || "https://www.tripadvisor.com.br/";

  const getTranslated = useCallback((field: string) => {
    if (!tour) return "";
    if (language === 'pt') return (tour as Record<string, unknown>)[field];
    const translatedField = `${field}_${language}`;
    return (tour as Record<string, unknown>)[translatedField] || (tour as Record<string, unknown>)[field];
  }, [language, tour]);

  const translatedTitle = useMemo(() => getTranslated('title') as string, [getTranslated]);
  const translatedShortDesc = useMemo(() => getTranslated('short_description') as string, [getTranslated]);
  
  const translatedCategory = useMemo(() => {
    const rawCat = tour?.category;
    if (rawCat === 'TRILHA') return t('trilhas');
    if (rawCat === 'CITY TOUR') return t('city_tours');
    return getTranslated('category') as string;
  }, [tour, t, getTranslated]);

  const translatedDifficulty = useMemo(() => getTranslated('difficulty') as string, [getTranslated]);
  const translatedItinerary = useMemo(() => getTranslated(`itinerary_json${language !== 'pt' ? `_${language}` : ""}`) as { time: string; description: string }[] || tour?.itinerary_json, [getTranslated, language, tour?.itinerary_json]);
  
  const displayedItinerary = useMemo(() => {
    if (!translatedItinerary) return [];
    const items = translatedItinerary as { time: string; description: string }[];
    
    // Para o Boteco Tour, se for Diurno, subtraímos 6 horas do itinerário Noturno (que é o padrão no banco)
    if (translatedTitle?.toLowerCase().includes('boteco') && selectedPeriod === 'morning') {
      return items.map(item => {
        const timeMatch = item.time.match(/(\d{1,2}):(\d{2})/);
        if (timeMatch) {
          let hours = parseInt(timeMatch[1]);
          let minutes = timeMatch[2];
          let newHours = hours - 6;
          if (newHours < 0) newHours += 24;
          return { 
            ...item, 
            time: `${String(newHours).padStart(2, '0')}:${minutes}` 
          };
        }
        return item;
      });
    }
    return items;
  }, [translatedItinerary, selectedPeriod, translatedTitle]);
  const translatedIncluded = useMemo(() => {
    const items = getTranslated(`included_json${language !== 'pt' ? `_${language}` : ""}`) || tour?.included_json;
    
    // Se for o passeio do Maracanã e não tiver itens, injeta os solicitados como fallback
    if (tour?.title?.includes('Maracanã MatchDay') && (!items || (Array.isArray(items) && items.length === 0))) {
      if (language === 'pt') return [{ text: "Transfer" }, { text: "Ingressos" }, { text: "Guia Bilíngue" }];
      if (language === 'es') return [{ text: "Traslado" }, { text: "Entradas" }, { text: "Guía Bilingüe" }];
      return [{ text: "Transfer" }, { text: "Tickets" }, { text: "Bilingual Guide" }];
    }
    
    return items;
  }, [getTranslated, language, tour?.included_json, tour?.title]);
  const translatedFaq = useMemo(() => getTranslated(`faq_json${language !== 'pt' ? `_${language}` : ""}`) || tour?.faq_json, [getTranslated, language, tour?.faq_json]);
  const translatedHighlights = useMemo(() => getTranslated(`highlights_json${language !== 'pt' ? `_${language}` : ""}`) || tour?.highlights_json, [getTranslated, language, tour?.highlights_json]);

  const translateDuration = (duration: string) => {
    if (language === 'pt' || !duration) return duration;
    return duration
      .replace(/horas/gi, t("horas"))
      .replace(/hora/gi, t("hora"))
      .replace(/minutos/gi, t("minutos"))
      .replace(/minuto/gi, t("minuto"));
  };

  const highlights = (translatedHighlights as { icon: string; text: string }[]) || [];
  const faqItems = (translatedFaq as { q: string; a: string }[]) || [];
  const cleanSlug = tour?.slug ? slugify(tour.slug) : tour?.id;
  const canonicalUrl = getCanonicalUrl(`/passeio/${cleanSlug || tour?.id}`);

  // Auto-redirect from accented/legacy slug to clean ASCII slug
  useEffect(() => {
    if (tour?.slug && id && id !== cleanSlug && id === tour.slug) {
      navigate(`/passeio/${cleanSlug}`, { replace: true });
    }
  }, [tour, id, cleanSlug, navigate]);

  const jsonLd = tour ? {
    "@context": "https://schema.org",
    "@graph": [
      generateTouristAttractionSchema(translatedTitle, translatedShortDesc, tour.image_url),
      generateTourPackageSchema(
        translatedTitle,
        translatedShortDesc,
        tour.image_url,
        canonicalUrl,
        getTourMinPrice(tour)
      ),
      ...(faqItems && faqItems.length > 0 ? [generateFAQSchema(faqItems)] : [])
    ]
  } : null;


  const breadcrumbsLd = generateBreadcrumbsSchema([
    { name: t("inicio"), url: getCanonicalUrl("/") },
    { name: t("passeios"), url: getCanonicalUrl("/#tours") },
    { name: translatedTitle, url: canonicalUrl }
  ]);

  const reviewsRef = useRef<HTMLDivElement>(null);
 
  useEffect(() => {
    window.scrollTo(0, 0);
    const handleScroll = () => {
      setShowStickyBar(window.scrollY > 600);
    };
    window.addEventListener('scroll', handleScroll);
 
    // Lazy load TripAdvisor script
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        const script = document.createElement("script");
        script.src = "https://elfsightcdn.com/platform.js";
        script.async = true;
        document.body.appendChild(script);
        observer.disconnect();
      }
    }, { rootMargin: '200px' });
 
    if (reviewsRef.current) {
      observer.observe(reviewsRef.current);
    }
 
    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
      const existingScript = document.querySelector('script[src="https://elfsightcdn.com/platform.js"]');
      if (existingScript) {
        document.body.removeChild(existingScript);
      }
    };
  }, []);

  useEffect(() => {
    if (tour) {
      if (tour.allows_private && !tour.allows_open) {
        setIsPrivate(true);
      } else {
        setIsPrivate(false);
      }
    }
  }, [tour]);

  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxSource, setLightboxSource] = useState<'hero' | 'gallery'>('hero');

  const images = useMemo(() => {
    let imgs = tour?.images_json as string[] || [];
    if (imgs.length === 0 && tour?.image_url) imgs = [tour.image_url];
    return imgs.filter(url => url && typeof url === 'string');
  }, [tour]);
  const currentUnitPrice = useMemo(() => {
    if (!tour) return 0;
    
    // Improved robust parsing for all price fields
    const p1 = Number(tour.price_1_person) || 0;
    const p2 = Number(tour.price_2_people) || 0;
    const p36 = Number(tour.price_3_6_people) || 0;
    const p719 = Number(tour.price_7_19_people) || 0;
    const baseP = Number(tour.price) || 0;

    let basePrice = 0;
    if (tour.pricing_model === 'dynamic') {
      if (quantity === 1) basePrice = p1;
      else if (quantity === 2) basePrice = p2;
      else if (quantity >= 3 && quantity <= 6) basePrice = p36;
      else if (quantity >= 7) basePrice = p719;
      else basePrice = baseP;
    } else if (tour.pricing_model === 'group') {
      basePrice = baseP / (quantity || 1);
    } else if (tour.pricing_model === 'custom') {
      basePrice = 0;
    } else {
      basePrice = baseP;
    }

    // Add custom option price if active
    const options = tour.custom_options_json as Record<string, unknown>[] | undefined;
    if (tour.use_custom_options && options && options[selectedOptionIdx]) {
      const option = options[selectedOptionIdx];
      basePrice += (Number(option.price) || 0);
    }
    
    return basePrice;
  }, [tour, quantity, selectedOptionIdx]);

  const relatedTours = useMemo(() => {
    if (!tours.length || !tour) return [];
    return [...tours]
      .filter(t => t.id !== tour.id && t.is_active !== false)
      .sort(() => 0.5 - Math.random())
      .slice(0, 10);
  }, [tours, tour?.id]);


  useEffect(() => {
    const fetchWeather = async () => {
      if (!selectedDate) {
        setWeather(null);
        return;
      }

      // Validate date against available days
      const dateObj = new Date(selectedDate);
      const dayOfWeek = (dateObj.getUTCDay()).toString(); // Matches '0'-'6'
      if (tour?.available_days && tour.available_days.length > 0 && !tour.available_days.includes(dayOfWeek)) {
        toast.error("Este passeio não está disponível neste dia da semana.");
        setSelectedDate("");
        return;
      }

      try {
        const today = new Date();
        const daysAhead = Math.ceil((dateObj.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        if (daysAhead < 0 || daysAhead > 16) {
          setWeather(null);
          return;
        }
        const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=-22.9068&longitude=-43.1729&daily=temperature_2m_max,temperature_2m_min,weathercode&forecast_days=16`);
        if (response.ok) {
          const data = await response.json();
          const dayIndex = Math.min(daysAhead, 15);
          if (data.daily && data.daily.temperature_2m_max[dayIndex] !== undefined) {
            const conditions: Record<number, string> = { 0: 'Ensolarado', 1: 'Parcialmente nublado', 2: 'Nublado', 3: 'Nublado', 45: 'Neblina', 51: 'Chuva leve', 61: 'Chuva', 80: 'Temporal', 95: 'Tempestade' };
            setWeather({
              temp: Math.round((data.daily.temperature_2m_max[dayIndex] + data.daily.temperature_2m_min[dayIndex]) / 2),
              condition: conditions[data.daily.weathercode[dayIndex]] || 'Parcialmente nublado',
              humidity: 70,
              wind: 12,
            });
          }
        }
      } catch (error) { console.error("Weather fetch error:", error); }
    };
    fetchWeather();
  }, [selectedDate, tour]);
  
  const handleBooking = () => {
    if (!tour) return;
    if (!selectedDate) {
      toast.error(t("selecione_data"));
      return;
    }

    addToCart({
      id: tour.id,
      slug: tour.slug,
      title: translatedTitle,
      price: currentUnitPrice,
      image_url: getOptimizedImage(tour.image_url || "", 800),
      date: selectedDate,
      period: `${selectedLocation === 'tijuca' ? 'Tijuca' : 'Copacabana'} - ${selectedPeriod === 'morning' ? 'Diurno' : 'Noturno'}`,
      isPrivate: isPrivate,
      quantity: quantity,
      pricing_model: tour.pricing_model,
      price_1_person: tour.price_1_person,
      price_2_people: tour.price_2_people,
      price_3_6_people: tour.price_3_6_people,
      price_7_19_people: tour.price_7_19_people,
      group_price: tour.pricing_model === 'group' ? tour.price : undefined,
      max_group_size: tour.max_group_size,
      selected_option: tour.use_custom_options && (tour.custom_options_json as Record<string, unknown>[])?.[selectedOptionIdx] ? {
        title: String((tour.custom_options_json as Record<string, unknown>[])[selectedOptionIdx].title),
        extra_price: Number((tour.custom_options_json as Record<string, unknown>[])[selectedOptionIdx].price)
      } : undefined
    });

    toast.success(t("passeio_adicionado"));
    navigate("/carrinho");
  };

  const shareOnWhatsApp = () => {
    const text = encodeURIComponent(`${translatedTitle} - ${translatedShortDesc}\n\n${window.location.href}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const shareOnFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank');
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success(language === 'pt' ? 'Link copiado!' : language === 'es' ? '¡Enlace copiado!' : 'Link copied!');
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center animate-pulse bg-muted" />;

  if (!tour) return <div className="min-h-screen flex flex-col items-center justify-center"><h1 className="text-2xl font-bold">{t("nao_encontrado")}</h1><Link to="/"><Button className="mt-4">{t("voltar_home")}</Button></Link></div>;


  const openLightbox = (index: number, source: 'hero' | 'gallery' = 'hero') => {
    setLightboxIndex(index);
    setLightboxSource(source);
    setIsLightboxOpen(true);
  };

  return (
    <main className="min-h-screen bg-background font-sans overflow-x-hidden" data-tour-detail>
      <Helmet>
        <title>{translatedTitle} | {siteTitle}</title>
        <meta name="description" content={generateOptimizedMetaDescription(translatedShortDesc, translatedTitle, language)} />

        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={getCanonicalUrl(`/passeio/${tour?.slug || tour?.id}`)} />
        <meta property="og:title" content={`${translatedTitle} | ${siteTitle}`} />
        <meta property="og:description" content={generateOptimizedMetaDescription(translatedShortDesc, translatedTitle, language)} />
        <meta property="og:image" content={tour.image_url} />
        <meta property="og:site_name" content="Tocorime Rio" />
        <meta property="og:locale" content={language === 'pt' ? 'pt_BR' : language === 'es' ? 'es_ES' : 'en_US'} />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${translatedTitle} | ${siteTitle}`} />
        <meta name="twitter:description" content={generateOptimizedMetaDescription(translatedShortDesc, translatedTitle, language)} />
        <meta name="twitter:image" content={tour.image_url} />

        <link rel="canonical" href={canonicalUrl} />
        {getHreflangLinks(`/passeio/${tour?.slug || tour?.id}`).map((l) => (
          <link key={l.hreflang} rel="alternate" hrefLang={l.hreflang} href={l.href} />
        ))}
        {jsonLd && <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>}
        <script type="application/ld+json">{JSON.stringify(breadcrumbsLd)}</script>
      </Helmet>
      
      <Header />

      {/* Breadcrumbs & Title Section */}
      <section className="pt-24 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav aria-label={t("breadcrumbs") || "Navegação secundária"} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-6">
          <Link to="/" className="hover:text-primary transition-colors">{t("inicio")}</Link>
          <span className="opacity-30">/</span>
          <Link to="/#tours" className="hover:text-primary transition-colors">{t("passeios")}</Link>
          <span className="opacity-30">/</span>
          <span className="text-foreground">{translatedTitle}</span>
        </nav>
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
               <span className="text-primary font-black uppercase tracking-[0.2em] text-[10px] px-3 py-1 bg-primary/10 rounded-full border border-primary/20">{translatedCategory}</span>
               <span className="text-accent font-black uppercase tracking-[0.2em] text-[10px] px-3 py-1 bg-accent/10 rounded-full border border-accent/20">Private & Exclusive</span>
               {tour.is_featured && <span className="bg-amber-100 text-amber-700 font-black text-[10px] px-3 py-1 rounded-full border border-amber-200 uppercase tracking-widest">{t("destaque")}</span>}
               <SocialProof light={false} />
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-black text-foreground leading-[1.1] tracking-tight">
               {translatedTitle}
            </h1>
            <UrgencyBadges tourId={tour.id} tourSlug={tour.slug} />
          </div>
          {!hidePrices ? (
            <div className="flex items-center gap-6 bg-card border border-primary/10 px-8 py-6 rounded-[2rem] shadow-xl h-fit ring-4 ring-primary/5">
              <div className="text-right">
                <span className="text-muted-foreground text-[10px] font-black uppercase tracking-widest block mb-1 opacity-70">
                  {tour.pricing_model === 'group' ? t("valor_grupo") || "Valor por Grupo" : t("a_partir_de")}
                </span>
                <span className="text-4xl font-black text-primary">
                  {formatPrice(getTourMinPrice(tour))}
                </span>
                <span className="text-[10px] font-black uppercase text-muted-foreground block text-right mt-1 opacity-60 tracking-tighter shrink-0">
                  {tour.pricing_model === 'group' ? t("ate") || "até" : t("por_pessoa")} {tour.pricing_model === 'group' ? `${tour.max_group_size} ${t("pessoas")}` : ""}
                </span>
              </div>
            </div>
          ) : (() => {
            const wa = socialMedia.find((s) => s.platform?.toLowerCase().includes('whatsapp') && s.is_active !== false);
            if (!wa) return null;
            const cleanNumber = wa.url.replace(/[^\d+]/g, "").replace('+', '');
            const titleI18n = String((tour as Record<string, any>)[`title_${language}`] || tour.title || "");
            const msg = language === 'pt'
              ? `Olá! Gostaria de montar um passeio personalizado: ${titleI18n}`
              : language === 'es'
                ? `¡Hola! Me gustaría diseñar un tour personalizado: ${titleI18n}`
                : `Hello! I'd love to design a personalised tour: ${titleI18n}`;
            const href = wa.url.startsWith('http')
              ? `${wa.url}${wa.url.includes('?') ? '&' : '?'}text=${encodeURIComponent(msg)}`
              : `https://wa.me/${cleanNumber}?text=${encodeURIComponent(msg)}`;
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#25D366]/10 border border-[#25D366]/30 hover:bg-[#25D366]/20 text-[#25D366] font-bold text-sm transition-all shrink-0 h-fit"
              >
                <MessageSquare className="w-4 h-4" />
                {language === 'pt' ? 'Solicitar Orçamento' : language === 'es' ? 'Solicitar Presupuesto' : 'Request a Quote'}
              </a>
            );
          })()}

        </div>
      </section>

      {/* Mosaic Gallery Section */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mb-12">
        <div className="relative group overflow-hidden rounded-[2rem] shadow-xl bg-muted/20 border">
          <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-2 h-[350px] md:h-[400px] lg:h-[450px]">
            {/* Main Image */}
            <div 
              className="md:col-span-2 md:row-span-2 relative overflow-hidden cursor-pointer group/item"
              onClick={() => openLightbox(0)}
            >
              <OptimizedImage 
                src={images[0] || "/placeholder.svg"} 
                alt={translatedTitle} 
                width={1200}
                containerClassName="w-full h-full"
                fit="cover"
                className="w-full h-full object-cover transition-transform duration-[length:1500ms] ease-out group-hover/item:scale-110" 
                fetchPriority="high"
              />
              <div className="absolute inset-0 bg-black/0 group-hover/item:bg-black/20 transition-all duration-500" />
            </div>

            {/* Sub-images Grid */}
            {images.slice(1, 5).map((img, idx) => (
              <div 
                key={idx}
                className="hidden md:block relative overflow-hidden cursor-pointer group/item"
                onClick={() => openLightbox(idx + 1)}
              >
                <OptimizedImage 
                  src={img} 
                  alt={`${translatedTitle} ${idx + 1}`} 
                  width={800}
                  containerClassName="w-full h-full"
                  fit="cover"
                  className="w-full h-full object-cover transition-transform duration-[length:1500ms] ease-out group-hover/item:scale-125" 
                />
                <div className="absolute inset-0 bg-black/0 group-hover/item:bg-black/20 transition-all duration-500" />
              </div>
            ))}

            {/* Empty Slots */}
            {images.length < 5 && Array.from({ length: 5 - images.length }).map((_, i) => (
              <div key={`empty-${i}`} className="hidden md:block bg-muted/20 animate-pulse border border-white/10" />
            ))}
          </div>

          <Button 
            variant="secondary" 
            className="absolute bottom-10 right-10 gap-3 bg-white/90 backdrop-blur-2xl hover:bg-white text-black font-black text-[11px] uppercase tracking-widest px-8 h-14 rounded-2xl shadow-2xl transition-all hover:scale-105 ring-1 ring-black/5 active:scale-95"
            onClick={() => openLightbox(0)}
          >
            <Maximize2 className="w-5 h-5 text-primary" />
            {t("ver_galeria_completa")}
          </Button>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 pb-24">
          <div className="lg:col-span-2 space-y-16">
             {/* Ultra-Premium Stats Bar */}
             <div className="bg-card rounded-[2.5rem] border border-primary/10 shadow-xl overflow-hidden ring-1 ring-primary/5">
                <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-primary/10">
                  {/* Duration */}
                  <div className="px-8 py-10 flex flex-col items-center text-center group hover:bg-primary/5 transition-colors">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-5 shadow-inner group-hover:scale-110 transition-transform">
                      <Clock className="w-8 h-8 text-primary" />
                    </div>
                    <span className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em] mb-2">{t("duracao")}</span>
                    <span className="text-xl font-black text-foreground">{translateDuration(tour.duration)}</span>
                  </div>

                  {/* Max People */}
                  <div className="px-8 py-10 flex flex-col items-center text-center group hover:bg-primary/5 transition-colors">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-5 shadow-inner group-hover:scale-110 transition-transform">
                      <Users className="w-8 h-8 text-primary" />
                    </div>
                    <span className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em] mb-2">{t("capacidade")}</span>
                    <span className="text-xl font-black text-foreground">{tour.max_group_size} {t("pessoas")}</span>
                  </div>

                  {/* Difficulty */}
                  {translatedDifficulty && (
                    <div className="px-8 py-10 flex flex-col items-center text-center group hover:bg-[#E76F51]/5 transition-colors">
                      <div className="w-16 h-16 rounded-2xl bg-[#E76F51]/10 flex items-center justify-center mb-5 shadow-inner group-hover:scale-110 transition-transform">
                        <Gauge className="w-8 h-8 text-[#E76F51]" />
                      </div>
                      <span className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em] mb-2">{t("nivel")}</span>
                      <span className="text-xl font-black text-foreground uppercase">{translatedDifficulty}</span>
                    </div>
                  )}
                </div>
             </div>

             <div className="space-y-8 prose prose-slate max-w-none">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  <h2 className="text-4xl font-serif font-black flex items-center gap-4 text-foreground">
                    <div className="w-2 h-10 bg-primary rounded-full" />
                    {t("sobre_o_passeio")}
                  </h2>
                  
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest opacity-60 mr-1">
                      {language === 'pt' ? 'Compartilhar:' : language === 'es' ? 'Compartir:' : 'Share:'}
                    </span>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="rounded-full w-10 h-10 border-green-500/20 hover:bg-green-500 hover:text-white transition-all shadow-sm"
                      onClick={shareOnWhatsApp}
                      title="WhatsApp"
                    >
                      <MessageCircle className="w-5 h-5" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="rounded-full w-10 h-10 border-blue-600/20 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                      onClick={shareOnFacebook}
                      title="Facebook"
                    >
                      <Facebook className="w-5 h-5" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="rounded-full w-10 h-10 border-primary/20 hover:bg-primary hover:text-white transition-all shadow-sm"
                      onClick={copyToClipboard}
                      title={language === 'pt' ? 'Copiar Link' : 'Copy Link'}
                    >
                      <Link2 className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
                <p className="text-xl text-muted-foreground leading-relaxed font-sans first-letter:text-5xl first-letter:font-black first-letter:text-primary first-letter:float-left first-letter:mr-3 first-letter:mt-1 whitespace-pre-wrap">{translatedShortDesc}</p>
              </div>

               {/* What's Included */}
               {translatedIncluded && (Array.isArray(translatedIncluded) ? translatedIncluded.length > 0 : !!translatedIncluded) && (
                 <div className="space-y-8">
                   <h2 className="text-3xl font-serif font-black flex items-center gap-4 text-foreground">
                     <div className="w-2 h-10 bg-primary rounded-full" />
                     {t("o_que_inclui")}
                   </h2>
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     {(Array.isArray(translatedIncluded) ? translatedIncluded : [translatedIncluded]).map((item: any, i: number) => {
                       const text = typeof item === 'string' ? item : item.text || item.title || "";
                       if (!text) return null;
                       return (
                        <div key={i} className="flex items-start gap-4 p-6 bg-card rounded-[2rem] border border-primary/10 shadow-lg group hover:shadow-xl hover:border-primary/30 transition-all duration-300">
                          <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                            <Check className="w-6 h-6 text-primary" />
                          </div>
                          <div className="space-y-1">
                            <span className="text-sm font-black text-foreground/90 leading-tight block">{text}</span>
                            <span className="text-[10px] font-bold text-primary uppercase tracking-widest">{t("inclui")}</span>
                          </div>
                        </div>
                       );
                     })}
                   </div>
                 </div>
               )}

               {/* Custom Options Selection */}
               {tour.use_custom_options && tour.custom_options_json && (tour.custom_options_json as Record<string, unknown>[]).length > 0 && (
                 <div className="space-y-8">
                   <h2 className="text-3xl font-serif font-black flex items-center gap-4 text-foreground">
                     <div className="w-2 h-10 bg-primary rounded-full" />
                     {t("opcoes_reserva")}
                   </h2>
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     {(tour.custom_options_json as Record<string, unknown>[]).map((option, idx) => (
                       <div 
                         key={idx}
                         onClick={() => setSelectedOptionIdx(idx)}
                         className={`relative p-8 rounded-[2.5rem] border-2 transition-all cursor-pointer group flex flex-col justify-between h-full ${
                           selectedOptionIdx === idx 
                             ? "border-primary bg-primary/5 shadow-xl scale-[1.02] ring-4 ring-primary/5" 
                             : "border-border bg-card hover:border-primary/30 hover:bg-muted/30"
                         }`}
                       >
                         {selectedOptionIdx === idx && (
                           <div className="absolute top-6 right-6 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white shadow-lg">
                             <Check className="w-5 h-5 font-bold" />
                           </div>
                         )}

                         <div className="space-y-4">
                           <div className="space-y-1">
                             <h3 className={`text-xl font-black transition-colors ${selectedOptionIdx === idx ? 'text-primary' : 'text-foreground'}`}>
                               {String(option.title || "")}
                             </h3>
                             {Number(option.price || 0) > 0 && (
                               <p className="text-primary font-black text-sm">
                                 +{formatPrice(Number(option.price))} / {t("pessoa")}
                               </p>
                             )}
                           </div>

                           <div className="space-y-4 pt-4 border-t border-primary/10">
                             {/* Positives */}
                             {(option.positive_notices as string[] | undefined || []).length > 0 && (
                               <div className="space-y-2">
                                 <ul className="space-y-2">
                                   {(option.positive_notices as string[] | undefined || []).map((n, i) => (
                                     <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                                       <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                                       <span>{n}</span>
                                     </li>
                                   ))}
                                 </ul>
                               </div>
                             )}

                             {/* Negatives */}
                             {(option.negative_notices as string[] | undefined || []).length > 0 && (
                               <div className="space-y-2">
                                 <ul className="space-y-2">
                                   {(option.negative_notices as string[] | undefined || []).map((n, i) => (
                                     <li key={i} className="flex items-start gap-2 text-sm text-foreground/60 italic">
                                       <X className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                                       <span>{n}</span>
                                     </li>
                                   ))}
                                 </ul>
                               </div>
                             )}
                           </div>
                         </div>
                       </div>
                     ))}
                   </div>
                 </div>
               )}

               {/* Boteco Tour Specific Options */}
               {translatedTitle?.toLowerCase().includes('boteco') && (
                 <div className="bg-card rounded-[2.5rem] border border-primary/10 p-10 space-y-8 shadow-xl ring-1 ring-primary/5">
                   <h2 className="text-3xl font-serif font-black flex items-center gap-4 text-foreground">
                     <div className="w-2 h-10 bg-primary rounded-full" />
                     {language === 'pt' ? 'Escolha sua Experiência' : language === 'es' ? 'Elige tu Experiencia' : 'Choose your Experience'}
                   </h2>
                   <div className="space-y-4">
                     <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground">{language === 'pt' ? '1. Escolha o Bairro' : '1. Choose Neighborhood'}</h3>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                       <button 
                         onClick={() => setSelectedLocation('tijuca')}
                         className={`group relative p-6 rounded-[1.5rem] border-2 transition-all flex flex-col items-center text-center gap-2 ${
                           selectedLocation === 'tijuca' 
                             ? "border-primary bg-primary/5 shadow-lg ring-2 ring-primary/5" 
                             : "border-border bg-card hover:border-primary/20 hover:bg-muted/30"
                         }`}
                       >
                         <span className={`block text-lg font-black uppercase tracking-widest ${selectedLocation === 'tijuca' ? "text-primary" : "text-foreground"}`}>
                           Tijuca
                         </span>
                         {selectedLocation === 'tijuca' && (
                           <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary flex items-center justify-center text-white shadow-lg">
                             <Check className="w-3 h-3" />
                           </div>
                         )}
                       </button>
                       
                       <button 
                         onClick={() => setSelectedLocation('copacabana')}
                         className={`group relative p-6 rounded-[1.5rem] border-2 transition-all flex flex-col items-center text-center gap-2 ${
                           selectedLocation === 'copacabana' 
                             ? "border-primary bg-primary/5 shadow-lg ring-2 ring-primary/5" 
                             : "border-border bg-card hover:border-primary/20 hover:bg-muted/30"
                         }`}
                       >
                         <span className={`block text-lg font-black uppercase tracking-widest ${selectedLocation === 'copacabana' ? "text-primary" : "text-foreground"}`}>
                           Copacabana
                         </span>
                         {selectedLocation === 'copacabana' && (
                           <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary flex items-center justify-center text-white shadow-lg">
                             <Check className="w-3 h-3" />
                           </div>
                         )}
                       </button>
                     </div>
                   </div>

                   <div className="space-y-4">
                     <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground">{language === 'pt' ? '2. Escolha o Horário' : '2. Choose Time'}</h3>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                       <button 
                         onClick={() => setSelectedPeriod('morning')}
                         className={`group relative p-6 rounded-[1.5rem] border-2 transition-all flex flex-col items-center text-center gap-2 ${
                           selectedPeriod === 'morning' 
                             ? "border-primary bg-primary/5 shadow-lg ring-2 ring-primary/5" 
                             : "border-border bg-card hover:border-primary/20 hover:bg-muted/30"
                         }`}
                       >
                         <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                           selectedPeriod === 'morning' ? "bg-primary text-white scale-110" : "bg-primary/10 text-primary"
                         }`}>
                           <Sunrise className="w-6 h-6" />
                         </div>
                         <span className={`block text-sm font-black uppercase tracking-widest ${selectedPeriod === 'morning' ? "text-primary" : "text-foreground"}`}>
                           {language === 'pt' ? 'Diurno' : 'Daytime'}
                         </span>
                       </button>
                       
                       <button 
                         onClick={() => setSelectedPeriod('night')}
                         className={`group relative p-6 rounded-[1.5rem] border-2 transition-all flex flex-col items-center text-center gap-2 ${
                           selectedPeriod === 'night' 
                             ? "border-primary bg-primary/5 shadow-lg ring-2 ring-primary/5" 
                             : "border-border bg-card hover:border-primary/20 hover:bg-muted/30"
                         }`}
                       >
                         <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                           selectedPeriod === 'night' ? "bg-primary text-white scale-110" : "bg-primary/10 text-primary"
                         }`}>
                           <Moon className="w-6 h-6" />
                         </div>
                         <span className={`block text-sm font-black uppercase tracking-widest ${selectedPeriod === 'night' ? "text-primary" : "text-foreground"}`}>
                           {language === 'pt' ? 'Noturno' : 'Nighttime'}
                         </span>
                       </button>
                     </div>
                   </div>

                   {/* Displaying selected bars */}
                   {((selectedLocation === 'tijuca' ? (tour as any).bares_diurnos : (tour as any).bares_noturnos) as string) && (
                     <div className="pt-8 border-t border-primary/10 animate-in fade-in slide-in-from-top-4 duration-500">
                       <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary mb-4 flex items-center gap-3">
                         <Utensils className="w-4 h-4" />
                         {language === 'pt' ? `Roteiro Sugerido: Bares de ${selectedLocation === 'tijuca' ? 'Tijuca' : 'Copacabana'}` : `Suggested Route: ${selectedLocation === 'tijuca' ? 'Tijuca' : 'Copacabana'} Bars`}
                       </h3>
                       <div className="bg-muted/30 rounded-3xl p-6 border border-primary/5">
                         <p className="text-foreground/80 text-sm leading-relaxed whitespace-pre-line font-medium">
                           {selectedLocation === 'tijuca' ? (tour as any).bares_diurnos : (tour as any).bares_noturnos}
                         </p>
                       </div>
                     </div>
                   )}
                 </div>
               )}

               {/* Highlights */}
               {highlights.length > 0 && (
                 <div className="bg-card rounded-2xl border p-8 space-y-6">
                   <h2 className="text-2xl font-serif font-bold flex items-center gap-3"><Star className="text-primary fill-primary" /> {t("destaques")}</h2>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {highlights.map((h, i) => (
                       <div key={i} className="flex items-center gap-3 p-4 bg-muted/30 rounded-xl">
                         <Check className="text-primary w-5 h-5" />
                         <span className="text-sm font-medium">{h.text}</span>
                       </div>
                     ))}
                   </div>
                 </div>
               )}

               {/* Itinerary */}
               {displayedItinerary && (displayedItinerary as { time: string; description: string }[]).length > 0 && (
                 <div className="bg-card rounded-2xl border p-8 space-y-8">
                   <h2 className="text-2xl font-serif font-bold text-[#2A9D8F]">{t("itinerario_detalhes")}</h2>
                   <div className="relative space-y-8">
                     <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-dashed border-l-2 border-primary/20" />
                     {(displayedItinerary as { time: string; description: string }[]).map((step, i) => (
                       <div key={i} className="relative pl-10">
                         <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-primary flex items-center justify-center text-[10px] text-primary-foreground font-bold shadow-lg ring-4 ring-background">{i + 1}</div>
                         <h3 className="font-bold text-lg mb-1">{step.time}</h3>
                         <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
                       </div>
                     ))}
                   </div>
                 </div>
               )}

               {/* FAQ Section */}
               {faqItems.length > 0 && (
                 <div className="bg-card rounded-2xl border p-8 space-y-6">
                   <h2 className="text-2xl font-serif font-bold flex items-center gap-3"><ChevronDown className="text-primary" /> {t("faq_titulo") || "Para seu conhecimento (FAQ)"}</h2>
                   <div className="space-y-3">
                     {faqItems.map((item: { q: string; a: string }, i: number) => (
                       <div key={i} className="border rounded-xl overflow-hidden">
                         <button
                           className="w-full text-left p-5 flex items-center justify-between font-bold text-sm hover:bg-muted/30 transition-colors"
                           onClick={() => setOpenFaq(openFaq === i ? null : i)}
                         >
                           <span>{item.q}</span>
                           {openFaq === i ? <ChevronUp className="w-5 h-5 text-primary shrink-0" /> : <ChevronDown className="w-5 h-5 text-muted-foreground shrink-0" />}
                         </button>
                         {openFaq === i && (
                           <div className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed border-t pt-4">{item.a}</div>
                         )}
                       </div>
                     ))}
                   </div>
                 </div>
               )}

               {/* Tour Photo Gallery Carousel - uses carousel_images_json */}
               {(() => {
                 const carouselImgs = tour.carousel_images_json as string[] || [];
                 if (carouselImgs.length === 0) return null;
                 return (
                   <div className="space-y-6">
                     <h2 className="text-2xl font-serif font-bold flex items-center gap-3">
                       <div className="w-2 h-8 bg-primary rounded-full" />
                       {t("galeria_fotos") || "Galeria de Fotos"}
                     </h2>
                     <Carousel opts={{ loop: true, align: "start" }} className="w-full">
                       <CarouselContent className="-ml-4">
                         {carouselImgs.map((img: string, i: number) => (
                           <CarouselItem key={i} className="pl-4 basis-1/2 md:basis-1/3 lg:basis-1/3">
                             <div 
                               className="aspect-[4/3] rounded-2xl overflow-hidden cursor-pointer group/gal border shadow-sm"
                               onClick={() => openLightbox(i, 'gallery')}
                             >
                               <OptimizedImage 
                                 src={img} 
                                 alt={`${translatedTitle} ${i + 1}`} 
                                 width={600}
                                 containerClassName="w-full h-full"
                                 fit="cover"
                                 className="w-full h-full object-cover group-hover/gal:scale-110 transition-transform duration-700" 
                                 loading="lazy"
                               />
                             </div>
                           </CarouselItem>
                         ))}
                       </CarouselContent>
                       <CarouselPrevious className="-left-4 bg-card shadow-lg" />
                       <CarouselNext className="-right-4 bg-card shadow-lg" />
                     </Carousel>
                   </div>
                 );
               })()}

               {/* YouTube Video */}
               {tour.youtube_video_url && (
                 <div className="space-y-6">
                   <h2 className="text-2xl font-serif font-bold flex items-center gap-3">
                     <div className="w-2 h-8 bg-primary rounded-full" />
                     {t("video") || "Vídeo"}
                   </h2>
                   <div className="aspect-video rounded-2xl overflow-hidden border shadow-lg">
                     <iframe 
                       src={getYouTubeEmbedUrl(tour.youtube_video_url)} 
                       title={translatedTitle}
                       className="w-full h-full"
                       allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                       allowFullScreen
                     />
                   </div>
                 </div>
               )}
            </div>

            {/* Booking Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-28 space-y-6">
                {/* Share Buttons */}
                 <div className="bg-card rounded-[2.5rem] border border-primary/20 p-8 shadow-2xl relative overflow-hidden group">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150" />
                    <div className="space-y-4">
                      {!hidePrices ? (
                        <>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label htmlFor="quantity-input" className="text-[10px] font-black uppercase text-muted-foreground tracking-widest cursor-pointer">{t("quantas_pessoas")}</Label>
                          {tour.pricing_model !== 'group' && (
                            <span className="text-[10px] font-bold text-primary">{formatPrice(currentUnitPrice)} / {t("pessoa")}</span>
                          )}
                        </div>
                        <div className="flex items-center justify-between p-1.5 bg-muted/30 rounded-xl border border-primary/5">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8" 
                            onClick={() => setQuantity(q => Math.max(1, q-1))}
                            aria-label={language === 'pt' ? "Diminuir quantidade" : "Decrease quantity"}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span id="quantity-input" className="font-black text-lg" aria-live="polite">{quantity}</span>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className={`h-8 w-8 ${quantity >= (tour.max_group_size || 10) ? 'opacity-20' : ''}`}
                            onClick={() => setQuantity(q => Math.min(tour.max_group_size || 10, q+1))}
                            disabled={quantity >= (tour.max_group_size || 10)}
                            aria-label={language === 'pt' ? "Aumentar quantidade" : "Increase quantity"}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="date-trigger" className="text-[10px] font-black uppercase text-muted-foreground tracking-widest cursor-pointer">{t("data_viagem")}</Label>
                         <Popover>
                           <PopoverTrigger asChild>
                             <Button
                               id="date-trigger"
                               variant="outline"
                               className={`w-full h-11 rounded-xl border bg-background font-bold text-xs justify-start gap-2 px-3 shadow-none hover:bg-muted/30 transition-colors ${!selectedDate && "text-muted-foreground"}`}
                               aria-label={selectedDate ? `${t("data_viagem")}: ${format(parseISO(selectedDate), "dd/MM/yy")}` : t("selecione_data")}
                             >
                               <CalendarIcon className="w-4 h-4 text-primary" />
                               {selectedDate ? format(parseISO(selectedDate), "dd/MM/yy", { locale: language === 'pt' ? ptBR : language === 'es' ? esLocale : enUS }) : t("selecione_data")}
                             </Button>
                           </PopoverTrigger>
                           <PopoverContent className="w-auto p-0 rounded-3xl overflow-hidden shadow-2xl border-primary/10" align="start">
                             <CalendarUI
                               mode="single"
                               selected={selectedDate ? parseISO(selectedDate) : undefined}
                               onSelect={(date) => {
                                 if (date) {
                                   setSelectedDate(format(date, "yyyy-MM-dd"));
                                 }
                               }}
                               disabled={(date) => {
                                 // Disable past dates
                                 if (isPast(date) && !isToday(date)) return true;
                                 
                                 // Disable days not in available_days (if configured)
                                 if (tour?.available_days && tour.available_days.length > 0) {
                                   const dayOfWeek = date.getDay().toString();
                                   return !tour.available_days.includes(dayOfWeek);
                                 }
                                 return false;
                               }}
                               initialFocus
                               className="font-sans"
                             />
                           </PopoverContent>
                         </Popover>
                     </div>

                     {weather && (
                       <div className="p-3 bg-primary/5 rounded-xl border border-primary/10 flex items-center justify-between">
                         <div className="flex items-center gap-2">
                           <Sun className="w-6 h-6 text-amber-500" />
                           <div>
                             <span className="text-sm font-black block">{weather.temp}°C</span>
                             <span className="text-[9px] text-muted-foreground uppercase">{weather.condition}</span>
                           </div>
                         </div>
                         <div className="text-[9px] text-right text-muted-foreground leading-tight">
                           <span>HUM: {weather.humidity}%</span><br/>
                           <span>WIND: {weather.wind}km/h</span>
                         </div>
                       </div>
                     )}

                     <div className="pt-2">
                       <Button onClick={handleBooking} size="lg" className="w-full h-14 rounded-xl font-black text-sm uppercase tracking-widest gap-2 shadow-xl shadow-primary/10 hover:bg-accent hover:shadow-accent/20 active:scale-95 transition-all">
                         <ShoppingCart className="w-5 h-5" /> {t("reservar_agora")}
                       </Button>
                        {(() => {
                          const wa = socialMedia.find((s) => s.platform?.toLowerCase().includes('whatsapp') && s.is_active !== false);
                          if (!wa) return null;
                          const cleanNumber = wa.url.replace(/[^\d+]/g, "").replace('+', '');
                          const titleI18n = String((tour as Record<string, any>)[`title_${language}`] || tour.title || "");
                          const msg = t("wa_message").replace("{tour}", titleI18n);
                          const href = wa.url.startsWith('http')
                            ? `${wa.url}${wa.url.includes('?') ? '&' : '?'}text=${encodeURIComponent(msg)}`
                            : `https://wa.me/${cleanNumber}?text=${encodeURIComponent(msg)}`;
                          return (
                            <a
                              href={href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-3 flex items-center justify-center gap-2 w-full h-12 rounded-xl font-bold text-sm uppercase tracking-wider bg-[#25D366] hover:bg-[#1ebe5a] text-white shadow-lg shadow-[#25D366]/20 active:scale-95 transition-all"
                            >
                              <MessageSquare className="w-4 h-4" /> {t("wa_book")}
                            </a>
                          );
                        })()}
                         <div className="flex items-center justify-between mt-3 px-1">
                            <span className="text-[9px] font-black uppercase text-muted-foreground tracking-widest opacity-60">{t("valor_total")}</span>
                            <span className="text-base font-black text-primary">{formatPrice(currentUnitPrice * quantity)}</span>
                       </div>
                         </div>
                        </>
                      ) : (
                        <div className="pt-2 space-y-5">
                          {/* Icon + heading */}
                          <div className="flex flex-col items-center gap-2 text-center">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                              <MessageSquare className="w-6 h-6 text-primary" />
                            </div>
                            <p className="text-base font-black text-foreground">
                              {language === 'pt'
                                ? 'Experiência Exclusiva & Personalizada'
                                : language === 'es'
                                  ? 'Experiencia Exclusiva & Personalizada'
                                  : 'Exclusive & Personalised Experience'}
                            </p>
                          </div>

                          {/* Body copy */}
                          <p className="text-sm text-muted-foreground font-sans text-center leading-relaxed">
                            {language === 'pt'
                              ? 'Este passeio é feito sob medida para você. Os valores são personalizados de acordo com o grupo, data e preferências — fale com nosso guia pelo WhatsApp e monte a experiência perfeita.'
                              : language === 'es'
                                ? 'Este tour está hecho a tu medida. Los precios se adaptan según el grupo, la fecha y tus preferencias — habla con nuestro guía por WhatsApp y diseña la experiencia perfecta.'
                                : 'This tour is tailored just for you. Pricing adapts to your group size, date and preferences — chat with our guide on WhatsApp and design your perfect experience.'}
                          </p>

                          {/* Bullet perks */}
                          <ul className="space-y-2 text-xs text-muted-foreground">
                            {(language === 'pt'
                              ? ['Roteiro adaptado ao seu grupo', 'Horário e ritmo no seu estilo', 'Atendimento rápido, sem burocracia']
                              : language === 'es'
                                ? ['Itinerario adaptado a tu grupo', 'Horario y ritmo a tu estilo', 'Atención rápida y sin burocracia']
                                : ['Itinerary tailored to your group', 'Schedule and pace on your terms', 'Fast response, no hassle']
                            ).map((item, i) => (
                              <li key={i} className="flex items-center gap-2">
                                <Check className="w-4 h-4 text-primary shrink-0" />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>

                          {/* WhatsApp CTA */}
                          {(() => {
                              const wa = socialMedia.find((s) => s.platform?.toLowerCase().includes('whatsapp') && s.is_active !== false);
                              if (!wa) return null;
                              const cleanNumber = wa.url.replace(/[^\d+]/g, "").replace('+', '');
                              const titleI18n = String((tour as Record<string, any>)[`title_${language}`] || tour.title || "");
                              const msg = language === 'pt'
                                ? `Olá! Gostaria de montar um passeio personalizado: ${titleI18n}`
                                : language === 'es'
                                  ? `¡Hola! Me gustaría diseñar un tour personalizado: ${titleI18n}`
                                  : `Hello! I'd love to design a personalised tour: ${titleI18n}`;
                              const href = wa.url.startsWith('http')
                                ? `${wa.url}${wa.url.includes('?') ? '&' : '?'}text=${encodeURIComponent(msg)}`
                                : `https://wa.me/${cleanNumber}?text=${encodeURIComponent(msg)}`;
                              return (
                                <a
                                  href={href}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center justify-center gap-3 w-full h-16 rounded-2xl font-black text-sm uppercase tracking-widest bg-[#25D366] hover:bg-[#1ebe5a] text-white shadow-xl shadow-[#25D366]/30 active:scale-95 transition-all"
                                >
                                  <MessageSquare className="w-6 h-6" />
                                  {language === 'pt' ? 'MONTAR MEU PASSEIO' : language === 'es' ? 'DISEÑAR MI TOUR' : 'BUILD MY TOUR'}
                                </a>
                              );
                            })()}
                        </div>
                      )}
                    </div>

                    <div className="mt-6 pt-6 border-t border-primary/10">
                      <p className="text-[9px] font-black uppercase text-muted-foreground tracking-[0.2em] mb-4 text-center">{t("pagamento_seguro")}</p>
                      <PaymentLogos variant="light" className="scale-90 origin-center" />
                      
                      <div className="mt-6 flex items-center gap-3 p-4 bg-green-50 rounded-2xl border border-green-100 group hover:bg-green-100 transition-colors">
                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm">
                          <ShieldCheck className="w-6 h-6 text-green-600" />
                        </div>
                        <div className="text-[10px]">
                          <p className="font-black text-green-900 uppercase tracking-tighter">{language === 'pt' ? 'Garantia de Satisfação' : 'Satisfaction Guaranteed'}</p>
                          <p className="text-green-700/70 font-medium">{language === 'pt' ? 'Sua felicidade é nossa prioridade' : 'Your happiness is our priority'}</p>
                        </div>
                      </div>
                    </div>
                 </div>

                 {/* TripAdvisor Badge Link */}
                 <a href={tripAdvisorUrl} target="_blank" rel="noopener noreferrer" className="block p-6 bg-emerald-50 border border-emerald-100 rounded-2xl text-center group hover:bg-emerald-100 transition-colors">
                    <div className="flex items-center justify-center gap-2 mb-2">
                       <Star className="w-4 h-4 fill-emerald-600 text-emerald-600" />
                       <Star className="w-4 h-4 fill-emerald-600 text-emerald-600" />
                       <Star className="w-4 h-4 fill-emerald-600 text-emerald-600" />
                       <Star className="w-4 h-4 fill-emerald-600 text-emerald-600" />
                       <Star className="w-4 h-4 fill-emerald-600 text-emerald-600" />
                    </div>
                    <span className="text-xs font-black text-emerald-800 uppercase tracking-widest group-hover:underline">{t("excelente_tripadvisor")}</span>
                 </a>
              </div>
            </div>
          </div>
        </div>

      {/* Sticky Mobile Bar */}
      <div className={`fixed bottom-0 left-0 right-0 z-50 p-4 bg-background/80 backdrop-blur-xl border-t transform transition-transform duration-500 md:hidden ${showStickyBar ? "translate-y-0" : "translate-y-full"}`}>
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col">
            {!hidePrices ? (
              <>
                <span className="text-[10px] font-bold text-muted-foreground uppercase">{t("a_partir_de")}</span>
                <div className="flex items-baseline gap-1">
                   <div className="font-black text-xl text-primary">
                     {formatPrice(getTourMinPrice(tour))}
                   </div>
                   <span className="text-[9px] font-black text-muted-foreground uppercase opacity-70">/ {t("pessoa")}</span>
                </div>
              </>
            ) : (
              <span className="text-sm font-black text-primary uppercase leading-none">{language === 'pt' ? 'Sob Consulta' : 'Upon Request'}</span>
            )}
          </div>
          {(() => {
            const wa = socialMedia.find((s) => s.platform?.toLowerCase().includes('whatsapp') && s.is_active !== false);
            if (!wa) return null;
            const cleanNumber = wa.url.replace(/[^\d+]/g, "").replace('+', '');
            const titleI18n = String((tour as Record<string, any>)[`title_${language}`] || tour.title || "");
            const msg = hidePrices 
              ? (language === 'pt' ? `Olá! Gostaria de um orçamento para o passeio: ${titleI18n}` : `Hello! I would like a quote for the tour: ${titleI18n}`)
              : t("wa_message").replace("{tour}", titleI18n);
            const href = wa.url.startsWith('http')
              ? `${wa.url}${wa.url.includes('?') ? '&' : '?'}text=${encodeURIComponent(msg)}`
              : `https://wa.me/${cleanNumber}?text=${encodeURIComponent(msg)}`;
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex-1 h-14 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 text-white shadow-lg ${hidePrices ? 'bg-[#25D366]' : 'bg-primary'}`}
              >
                {hidePrices ? <MessageSquare className="w-5 h-5" /> : <ShoppingCart className="w-5 h-5" />}
                {hidePrices 
                  ? (language === 'pt' ? 'ORÇAMENTO' : 'QUOTE') 
                  : t("reservar_agora")}
              </a>
            );
          })()}
        </div>
      </div>

      <Suspense fallback={<div className="h-20" />}>
        <WeatherSection />
      </Suspense>
      <WhyChooseUs />

      {/* TripAdvisor Reviews Carousel */}
      <section className="py-24 bg-muted/30 border-t border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-serif font-black text-foreground mb-4">
              {language === 'pt' ? 'O que dizem nossos viajantes' : language === 'es' ? 'Lo que dicen nuestros viajeros' : 'What our travelers say'}
            </h2>
            <div className="flex items-center justify-center gap-2 mb-6">
              <div className="flex items-center gap-1">
                {[1,2,3,4,5].map(i => <Star key={i} className="w-5 h-5 fill-emerald-500 text-emerald-500" />)}
              </div>
              <span className="font-bold text-emerald-700">Excellent 5.0</span>
            </div>
          </div>
          
          <div className="min-h-[300px]" ref={reviewsRef}>
            <div className="elfsight-app-bbfeb008-113f-47f2-bfa9-91793656db8e" data-elfsight-app-lazy></div>
          </div>
        </div>
      </section>
      
      {/* Você também pode gostar - Related Tours Carousel */}
      <section className="py-24 border-t border-border/50 bg-background overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div className="space-y-4">
              <span className="text-primary font-black text-xs uppercase tracking-[0.3em]">{language === 'pt' ? 'Explore Mais' : language === 'es' ? 'Explorar Más' : 'Explore More'}</span>
              <h2 className="text-3xl md:text-5xl font-serif font-black text-foreground">
                {language === 'pt' ? 'Você também pode gostar' : language === 'es' ? 'También te pode gustar' : 'You might also like'}
              </h2>
            </div>
            <div className="hidden md:flex gap-2">
              {/* Desktop navigation will be handled by Carousel buttons, but we can add a 'See All' if needed */}
            </div>
          </div>
          
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full relative group"
          >
            <CarouselContent className="-ml-4 pb-8">
              {relatedTours.map((item) => (
                <CarouselItem key={item.id} className="pl-4 basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                  <div className="h-full transition-transform hover:scale-[1.02] duration-300" data-tour-card>
                    <TourItem tour={item as any} />
                  </div>
                </CarouselItem>
              ))}

            </CarouselContent>

            
            <div className="absolute -top-20 right-12 flex gap-2">
              <CarouselPrevious className="static translate-y-0 h-12 w-12 border-2 hover:bg-primary hover:text-white transition-all shadow-xl" />
              <CarouselNext className="static translate-y-0 h-12 w-12 border-2 hover:bg-primary hover:text-white transition-all shadow-xl" />
            </div>
          </Carousel>
        </div>
      </section>


      <Footer />

      {/* Lightbox Overlay */}
      {isLightboxOpen && (
        <div 
          className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center p-0 backdrop-blur-sm"
          onKeyDown={(e) => {
            if (e.key === "Escape") setIsLightboxOpen(false);
              if (e.key === "ArrowLeft") {
                const list = lightboxSource === 'gallery' ? (tour.carousel_images_json as string[] || []) : images;
              setLightboxIndex((prev) => (prev > 0 ? prev - 1 : list.length - 1));
            }
              if (e.key === "ArrowRight") {
                const list = lightboxSource === 'gallery' ? (tour.carousel_images_json as string[] || []) : images;
              setLightboxIndex((prev) => (prev < list.length - 1 ? prev + 1 : 0));
            }
          }}
          tabIndex={0}
        >
          {/* Close Button */}
          <button
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-6 right-6 w-12 h-12 bg-black/50 hover:bg-black/80 rounded-full flex items-center justify-center transition-all z-[120] border border-white/10 text-white"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Navigation Buttons */}
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-4 md:px-10 z-[115] pointer-events-none">
            <button
              onClick={() => {
                const list = lightboxSource === 'gallery' ? (tour.carousel_images_json as string[] || []) : images;
                setLightboxIndex((prev) => (prev > 0 ? prev - 1 : list.length - 1));
              }}
              className="w-12 h-12 md:w-16 md:h-16 bg-black/50 hover:bg-black/80 rounded-full flex items-center justify-center transition-all pointer-events-auto border border-white/10 text-white group"
            >
              <ArrowLeft className="w-6 h-6 md:w-8 md:h-8 group-hover:-translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => {
                const list = lightboxSource === 'gallery' ? (tour.carousel_images_json as string[] || []) : images;
                setLightboxIndex((prev) => (prev < list.length - 1 ? prev + 1 : 0));
              }}
              className="w-12 h-12 md:w-16 md:h-16 bg-black/50 hover:bg-black/80 rounded-full flex items-center justify-center transition-all pointer-events-auto border border-white/10 text-white group"
            >
              <ArrowRight className="w-6 h-6 md:w-8 md:h-8 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Image Container - Absolute Center */}
          <div className="w-full h-full p-4 md:p-12 flex items-center justify-center">
            {(() => {
              const list = lightboxSource === 'gallery' ? (tour.carousel_images_json as string[] || []) : images;
              const img = list[lightboxIndex];
              const dims = imageDimensions[img];
              const isLandscape = dims ? dims.width > dims.height : false;
              const isGallerySource = lightboxSource === 'gallery';
              const shouldLimitHeight = isGallerySource && isLandscape;

              return (
                <div key={img} className="relative w-full h-full flex items-center justify-center animate-in fade-in zoom-in-95 duration-500">
                  <OptimizedImage 
                    src={img} 
                    alt={`${translatedTitle} view ${lightboxIndex + 1}`} 
                    width={4000}
                    height={shouldLimitHeight ? 600 : undefined}
                    quality={100}
                    containerClassName={cn(
                      "w-full h-full flex items-center justify-center",
                      shouldLimitHeight && "max-h-[600px] h-[600px]"
                    )}
                    className={cn(
                      "max-w-full cursor-auto",
                      shouldLimitHeight ? "max-h-[600px] h-auto lg:h-[600px]" : "max-h-full h-auto w-auto"
                    )}
                    fit="contain"
                    fill={false}
                    fetchPriority="high"
                    onDimensions={(w, h) => {
                      setImageDimensions(prev => ({
                        ...prev,
                        [img]: { width: w, height: h }
                      }));
                    }}
                  />
                  
                  {/* Counter */}
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[120]">
                    <span className="bg-black/50 text-white font-sans text-xs md:text-sm px-4 py-2 rounded-full border border-white/10 shadow-2xl backdrop-blur-md">
                      {lightboxIndex + 1} / {list.length}
                    </span>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </main>
  );
}

export default PasseioDetalhe;

