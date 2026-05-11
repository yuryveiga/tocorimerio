import { useState, useEffect, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { 
  Clock, Users, MapPin, Calendar, Check, ChevronLeft, 
  ArrowRight, ShieldCheck, Bus, Ticket, Camera, Info,
  Smartphone, CreditCard, ChevronDown, ChevronUp, Plus, Minus,
  X, Ban, AlertTriangle, Backpack, HeartHandshake, Activity
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@supabase/supabase-js";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useLocale } from "@/contexts/LocaleContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useSiteData } from "@/hooks/useSiteData";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";
import { ptBR, enUS, es } from "date-fns/locale";
import { getMatchDateInRio, getMatchHour } from "@/lib/dateUtils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase as localSupabase } from "@/integrations/supabase/client";
import { OptimizedImage } from "@/components/OptimizedImage";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { getCanonicalUrl, cleanMatchSlug } from "@/utils/seo";
import { LovableMatch } from "@/types";
import { WhyChooseUs } from "@/components/WhyChooseUs";
import { PaymentLogos } from "@/components/PaymentLogos";
import { YouMayAlsoLike } from "@/components/YouMayAlsoLike";

// Partner Project Config
const MARACANA_PROJECT_URL = "https://mwxbskzggzznxvkwgrnz.supabase.co";
const MARACANA_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13eGJza3pnZ3p6bnh2a3dncm56Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzNjE5OTUsImV4cCI6MjA4ODkzNzk5NX0.EFfaaN79uifOMgFdIZlQ5C8c-HQH-YodNGWf0MEcf9o";
const partnerSupabase = createClient(MARACANA_PROJECT_URL, MARACANA_ANON_KEY);

export default function MatchDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { language, t, formatPrice, currency } = useLocale();
  const { rates } = useCurrency();
  const { siteSettings, images, maracanaGallery } = useSiteData();
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({ name: "", whatsapp: "", email: "" });
  const [quantity, setQuantity] = useState(1);
  const [selectedSectorIdx, setSelectedSectorIdx] = useState(0);

  const { data: match, isLoading } = useQuery({
    queryKey: ["partner-match", id],
    queryFn: async () => {
      if (!id) return null;
      
      // Auto-redirect if slug is dirty
      const cleanId = cleanMatchSlug(id);
      if (cleanId !== id) {
        console.log(`Dirty slug detected: ${id} -> ${cleanId}. Redirecting...`);
        navigate(`/match/${cleanId}`, { replace: true });
        return null;
      }

      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
      let query = partnerSupabase.from("matches").select("*");
      
      if (isUuid) {
        query = query.eq("id", id);
      } else {
        query = query.eq("slug", id);
      }
      
      const { data, error } = await query.single();
      
      if (data) {
        console.log("Dados recebidos do dono do calendário:", data);
      }

      if (error) {
         // Fallback mock for demo if not found in real DB
         if (id === "flamengo-x-bahia" || id === "flamengo-vs-bahia" || id === "flamengo-x-vasco" || id.includes("flamengo-vs-vasco")) {
            const isVasco = id.includes("vasco");
            return {
               id: isVasco ? "mock-match-vasco" : "mock-match-1",
               home_team: "Flamengo",
               away_team: isVasco ? "Vasco" : "Bahia",
               match_date: new Date(Date.now() + 86400000 * (isVasco ? 5 : 2)).toISOString(),
               venue: "Maracanã",
               stadium: "Estádio Jornalista Mário Filho",
               price: 350,
               available_spots: 15,
               sold_count: 5,
               status: "available",
               slug: id,
               high_demand: true,
               custom_options_json: [
                  { title: "Leste Inferior", price: 570 },
                  { title: "Oeste Superior", price: 650 },
                  { title: "Oeste Inferior", price: 700 },
                  { title: "Maracanã Club", price: 900 },
                  { title: "Maracanã Mais", price: 1300 }
               ]
            };
         }
         throw error;
      };
      return data as LovableMatch;
    },
    enabled: !!id,
  });

  const processedSectors = useMemo(() => {
    if (!match) return [];
    
    // Priority 1: custom_options_json (standard pattern)
    if (match.custom_options_json && match.custom_options_json.length > 0) {
      return match.custom_options_json;
    }
    
    // Priority 2: price_premium fallback (standard vs premium)
    if (match.price_premium && match.price_premium > 0) {
      return [
        { title: language === 'pt' ? "Setor Padrão" : "Standard Sector", price: match.price },
        { title: language === 'pt' ? "Setor Premium / VIP" : "Premium / VIP Sector", price: match.price_premium }
      ];
    }
    
    return [
      { title: language === 'pt' ? "Setor Padrão" : "Standard Sector", price: match.price }
    ];
  }, [match, language]);

  // Fetch all available sectors/packages from partner DB (match_packages + package_types)
  const { data: partnerPackages } = useQuery({
    queryKey: ["partner-packages", match?.id],
    queryFn: async () => {
      if (!match?.id) return [];
      const { data, error } = await partnerSupabase
        .from("match_packages")
        .select("id, price_brl, price_usd, price_eur, price_gbp, total_stock, sold_count, is_active, is_on_request, package_type:package_type_id (id, slug, display_order, name_pt, name_en, name_es, description_pt, description_en, description_es, badge_pt, badge_en, badge_es, highlight_color, includes_transfer, includes_food, includes_drinks, includes_parking_access)")
        .eq("match_id", match.id);
      if (error) {
        console.warn("Could not fetch partner packages:", error);
        return [];
      }
      return (data || [])
        .filter((p: any) =>
          p.is_active &&
          (p.price_brl ?? 0) > 0 &&
          ((p.total_stock ?? 0) - (p.sold_count ?? 0)) > 0
        )
        .sort((a: any, b: any) => (a.package_type?.display_order ?? 99) - (b.package_type?.display_order ?? 99));
    },
    enabled: !!match?.id,
  });

  // Final sector list — prefer live partner packages when available
  const finalSectors = useMemo(() => {
    if (partnerPackages && partnerPackages.length > 0) {
      return partnerPackages.map((p: any) => {
        const pt = p.package_type;
        const title = language === 'en' ? (pt?.name_en || pt?.name_pt) : language === 'es' ? (pt?.name_es || pt?.name_pt) : pt?.name_pt;
        const description = language === 'en' ? pt?.description_en : language === 'es' ? pt?.description_es : pt?.description_pt;
        const badge = language === 'en' ? pt?.badge_en : language === 'es' ? pt?.badge_es : pt?.badge_pt;
        const remaining = Math.max(0, (p.total_stock || 0) - (p.sold_count || 0));
        return {
          title: title || "Setor",
          price: Number(p.price_brl) || 0,
          description,
          badge,
          highlight_color: pt?.highlight_color,
          remaining,
          includes_transfer: pt?.includes_transfer,
          includes_food: pt?.includes_food,
          includes_drinks: pt?.includes_drinks,
          includes_parking_access: pt?.includes_parking_access,
        };
      });
    }
    return processedSectors;
  }, [partnerPackages, processedSectors, language]);

  const handleCheckout = async () => {
    if (!customerInfo.name || !customerInfo.whatsapp || !customerInfo.email) {
      toast.error(language === 'pt' ? "Preencha todos os campos" : "Please fill all fields");
      return;
    }

    setIsProcessing(true);
    const currentCurrency = currency.toLowerCase();
    const rate = rates[currency] || 1;
    
    // Get correct price from selected sector or base price
    const basePrice = finalSectors && finalSectors[selectedSectorIdx] 
      ? finalSectors[selectedSectorIdx].price 
      : match.price;
      
    const sectorName = finalSectors && finalSectors[selectedSectorIdx]
      ? finalSectors[selectedSectorIdx].title
      : "Standard";

    const unitPrice = Math.round((basePrice * rate) * 100) / 100;
    const itemTotal = unitPrice * quantity;
    const itemFee = Math.round((itemTotal * 0.05) * 100) / 100;
    const totalWithFee = Math.round((itemTotal + itemFee) * 100) / 100;

    try {
      // 1. Create sale record in TOCORIME database first
      const { data: saleData, error: saleError } = await localSupabase.from("sales").insert({
        tour_id: match.id,
        tour_title: `${match.home_team} x ${match.away_team} - ${sectorName} - Maracanã Experience`,
        tour_slug: match.slug,
        customer_name: customerInfo.name,
        customer_email: customerInfo.email,
        customer_phone: customerInfo.whatsapp,
        quantity: quantity,
        total_price: totalWithFee,
        selected_date: format(new Date(match.match_date), "yyyy-MM-dd"),
        selected_period: "match_time",
        is_paid: false,
        currency: currency, // Savando a moeda (BRL, USD, EUR)
        provider: "matchday" // Track that this is a partner sale
      }).select("id").single();

      if (saleError) throw saleError;

      // 2. Call checkout function with PARTNER flavor
      const response = await fetch(
        "https://ogzasprtfgimjqrtcseg.supabase.co/functions/v1/create-checkout",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            items: [{
              title: `${match.home_team} x ${match.away_team} - ${sectorName} - Maracanã Experience`,
              price: unitPrice,
              price_brl: basePrice,
              quantity: quantity,
              date: format(new Date(match.match_date), "yyyy-MM-dd"),
              period: "match_time"
            }],
            sale_ids: [saleData.id],
            customer: customerInfo,
            currency: currentCurrency
          }),
        }
      );
      
      const sessionData = await response.json();
      if (sessionData.url) {
        window.location.href = sessionData.url;
      } else {
        throw new Error(sessionData.error || "Payment error");
      }
    } catch (error: unknown) {
      console.error(error);
      toast.error(language === 'pt' ? "Erro ao processar pagamento" : "Error processing payment");
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://elfsightcdn.com/platform.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  if (isLoading) return <div className="min-h-screen flex items-center justify-center animate-pulse bg-muted" />;
  if (!match) return <div className="min-h-screen flex flex-col items-center justify-center"><h1 className="text-2xl font-bold">Jogo não encontrado</h1><Link to="/maracanacalendar"><Button className="mt-4">Voltar ao Calendário</Button></Link></div>;

  const dateLocale = language === 'en' ? enUS : language === 'es' ? es : ptBR;
  const matchDateRio = getMatchDateInRio(match.match_date);

  const siteTitle = siteSettings?.site_title?.split('|')[0].trim() || "Eco-Wanderlust";

  const jsonLd = match ? {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": `${match.home_team} x ${match.away_team} | Maracanã Matchday Experience`,
    "description": `Assista ao vivo ${match.home_team} x ${match.away_team} no Maracanã com transporte e guia incluso.`,
    "image": images['maracana_hero'] || "https://ogzasprtfgimjqrtcseg.supabase.co/storage/v1/object/public/site-images//WhatsApp Image 2026-04-14 at 15.41.21.jpeg",
    "sku": match.slug || match.id,
    "brand": {
      "@type": "Brand",
      "name": siteTitle
    },
    "offers": {
      "@type": "Offer",
      "price": match.price,
      "priceCurrency": "BRL",
      "availability": "https://schema.org/InStock",
      "url": window.location.href,
      "hasMerchantReturnPolicy": {
        "@type": "MerchantReturnPolicy",
        "applicableCountry": "BR",
        "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnPeriod",
        "merchantReturnDays": 3,
        "returnMethod": "https://schema.org/ReturnByMail",
        "returnFees": "https://schema.org/FreeReturn"
      },
      "shippingDetails": {
        "@type": "OfferShippingDetails",
        "shippingRate": {
          "@type": "MonetaryAmount",
          "value": 0,
          "currency": "BRL"
        },
        "shippingDestination": {
          "@type": "DefinedRegion",
          "addressCountry": "BR"
        },
        "deliveryTime": {
          "@type": "ShippingDeliveryTime",
          "handlingTime": {
            "@type": "QuantitativeValue",
            "minValue": 0,
            "maxValue": 1,
            "unitCode": "DAY"
          },
          "transitTime": {
            "@type": "QuantitativeValue",
            "minValue": 0,
            "maxValue": 1,
            "unitCode": "DAY"
          }
        }
      }
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "86"
    }
  } : null;

  const itinerary = [
    {
      icon: <Bus className="h-5 w-5" />,
      title: t('busca_hotel'),
      description: t('busca_hotel_desc'),
    },
    {
      icon: <Ticket className="h-5 w-5" />,
      title: t('entrada_expressa'),
      description: t('entrada_expressa_desc'),
    },
    {
      icon: <Camera className="h-5 w-5" />,
      title: t('experiencia_imersiva'),
      description: t('experiencia_imersiva_desc'),
    },
  ];

  const translatedTitle = `${match.home_team} x ${match.away_team}`;

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{translatedTitle} | Maracanã Matchday Experience</title>
        <meta name="description" content={`Assista ao vivo ${match.home_team} x ${match.away_team} no Maracanã com transporte e guia incluso.`} />
        <meta property="og:title" content={`${translatedTitle} | ${siteTitle}`} />
        <meta property="og:url" content={getCanonicalUrl(`/match/${cleanMatchSlug(match.slug || match.id)}`)} />
        <link rel="canonical" href={getCanonicalUrl(`/match/${cleanMatchSlug(match.slug || match.id)}`)} />
        {jsonLd && <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>}
      </Helmet>
      
      <Header />
      
      <main className="pt-24 pb-20">
        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
           <div className="relative w-full aspect-video rounded-[3rem] overflow-hidden shadow-2xl border border-white/10">
              <OptimizedImage 
                src={images['maracana_hero'] || "https://ogzasprtfgimjqrtcseg.supabase.co/storage/v1/object/public/site-images//WhatsApp Image 2026-04-14 at 15.41.21.jpeg"} 
                alt="Maracanã Stadium" 
                containerClassName="w-full h-full"
                fit="cover"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
              
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
                 <div className="bg-primary/90 text-white text-[10px] font-black px-4 py-1 rounded-full uppercase tracking-[0.3em] mb-6 animate-bounce">
                    {t('experiencia_oficial')}
                 </div>
                 <h1 className="text-4xl md:text-7xl font-serif font-black text-white mb-4 tracking-tighter sm:flex items-center gap-6">
                    <span>{match.home_team}</span>
                    <span className="text-primary italic">X</span>
                    <span>{match.away_team}</span>
                 </h1>
                 <p className="text-white/80 text-lg md:text-xl font-medium max-w-2xl">
                    {format(matchDateRio, "PPPP", { locale: dateLocale })} • {getMatchHour(match.match_date)}
                 </p>
                 <div className="mt-8 flex items-center gap-4 text-white/60 text-sm font-bold uppercase tracking-widest">
                    <MapPin className="h-5 w-5 text-primary" />
                    {match.venue || "Maracanã Stadium"}
                 </div>
              </div>
           </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-16">
                 <section className="space-y-6">
                    <h2 className="text-3xl font-serif font-black flex items-center gap-4">
                       <div className="w-2 h-10 bg-primary rounded-full" />
                       {t('sobre_evento')}
                    </h2>
                    <div className="text-lg text-muted-foreground leading-relaxed font-medium whitespace-pre-wrap">
                       {language === 'pt' ? (match.description_pt || t('matchday_fallback')) : 
                        language === 'en' ? (match.description_en || t('matchday_fallback')) : 
                        (match.description_es || match.description_pt || t('matchday_fallback'))}
                    </div>
                 </section>

                 <section className="space-y-6">
                    <h2 className="text-3xl font-serif font-black flex items-center gap-4">
                       <div className="w-2 h-10 bg-primary rounded-full" />
                       {t('o_que_incluso')}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                       <div className="p-6 rounded-3xl bg-secondary/30 border border-border/50 flex flex-col items-center text-center group hover:bg-primary/5 transition-colors">
                          <Bus className="h-10 w-10 text-primary mb-4 group-hover:scale-110 transition-transform" />
                          <h3 className="font-bold text-lg mb-2">{t('feat_transporte')}</h3>
                          <p className="text-sm text-muted-foreground">{t('transporte_desc')}</p>
                       </div>
                       <div className="p-6 rounded-3xl bg-secondary/30 border border-border/50 flex flex-col items-center text-center group hover:bg-primary/5 transition-colors">
                          <Ticket className="h-10 w-10 text-primary mb-4 group-hover:scale-110 transition-transform" />
                          <h3 className="font-bold text-lg mb-2">{t('ingresso')}</h3>
                          <p className="text-sm text-muted-foreground">{t('ingresso_setor')}</p>
                       </div>
                       <div className="p-6 rounded-3xl bg-secondary/30 border border-border/50 flex flex-col items-center text-center group hover:bg-primary/5 transition-colors">
                          <Users className="h-10 w-10 text-primary mb-4 group-hover:scale-110 transition-transform" />
                          <h3 className="font-bold text-lg mb-4">{t('guias_espec')}</h3>
                          <p className="text-sm text-muted-foreground">{t('guia_desc')}</p>
                       </div>
                    </div>
                 </section>



                 <section className="space-y-10">
                    <h2 className="text-3xl font-serif font-black flex items-center gap-4">
                       <div className="w-2 h-10 bg-primary rounded-full" />
                       {t('itinerario_jogo')}
                    </h2>
                    <div className="relative pl-8 space-y-12">
                       <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-gradient-to-b from-primary to-transparent" />
                       {itinerary.map((step, i) => (
                          <div key={i} className="relative">
                             <div className="absolute -left-[29px] top-1 w-5 h-5 rounded-full bg-primary border-4 border-background ring-2 ring-primary/20 shadow-lg" />
                             <div>
                                <h4 className="font-bold text-xl mb-2 whitespace-pre-wrap">{step.title}</h4>
                                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{step.description}</p>
                             </div>
                          </div>
                       ))}
                    </div>
                 </section>
              </div>

              {/* Sidebar / Checkout */}
              <div className="lg:col-span-1">
                 <div className="sticky top-28 space-y-6">
                    <div className="bg-card rounded-[2.5rem] border border-primary/20 p-8 shadow-2xl overflow-hidden relative group">
                       <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16 blur-2xl" />
                       
                       <div className="relative">
                          <div className="flex justify-between items-start mb-8">
                             <div>
                                <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest block mb-2">{t('valor_por_pessoa')}</span>
                                                                 <span className="text-5xl font-black text-primary">
                                   {formatPrice(finalSectors && finalSectors[selectedSectorIdx] ? finalSectors[selectedSectorIdx].price : match.price)}
                                 </span>
                             </div>
                             {match.high_demand && (
                                <div className="bg-orange-500 text-white text-[8px] font-black px-2 py-1 rounded-full animate-pulse shadow-lg">
                                   {t('alta_demanda')}
                                </div>
                             )}
                          </div>

                          <div className="space-y-6">
                             <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{t('quantas_pessoas')}</label>
                                 <div className="flex items-center justify-between p-3 bg-muted/50 rounded-2xl border">
                                    <Button variant="ghost" size="icon" onClick={() => setQuantity(q => Math.max(1, q-1))}><Minus className="h-4 w-4" /></Button>
                                    <span className="font-black text-xl">{quantity}</span>
                                    <Button variant="ghost" size="icon" onClick={() => setQuantity(q => Math.min(q+1, Math.max(1, (match.available_spots || 20) - (match.sold_count || 0))))}><Plus className="h-4 w-4" /></Button>
                                 </div>
                              </div>

                              {finalSectors.length > 0 && (
                                <div className="space-y-3">
                                  <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{t('escolha_setor')}</label>
                                  <RadioGroup 
                                    value={selectedSectorIdx.toString()} 
                                    onValueChange={(val) => setSelectedSectorIdx(parseInt(val))}
                                    className="grid grid-cols-1 gap-2"
                                  >
                                    {finalSectors.map((sector: any, idx: number) => {
                                      const isLow = sector.remaining !== undefined && sector.remaining > 0 && sector.remaining <= 3;
                                      return (
                                        <div key={idx} className="relative">
                                          <RadioGroupItem
                                            value={idx.toString()}
                                            id={`sector-${idx}`}
                                            className="peer sr-only"
                                          />
                                          <Label
                                            htmlFor={`sector-${idx}`}
                                            className="flex flex-col gap-2 p-4 bg-muted/30 rounded-2xl border-2 border-transparent peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all hover:bg-muted/50"
                                          >
                                            <div className="flex items-start justify-between gap-3">
                                              <div className="flex flex-col flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                  <span className="font-bold text-sm">{sector.title}</span>
                                                  {sector.badge && (
                                                    <span 
                                                      className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded text-white tracking-wider"
                                                      style={{ backgroundColor: sector.highlight_color || 'hsl(var(--primary))' }}
                                                    >
                                                      {sector.badge}
                                                    </span>
                                                  )}
                                                </div>
                                                {isLow && (
                                                  <span className="text-[10px] font-bold text-orange-600 mt-0.5">
                                                    {language === 'pt' ? `Restam ${sector.remaining}` : language === 'es' ? `Quedan ${sector.remaining}` : `${sector.remaining} left`}
                                                  </span>
                                                )}
                                              </div>
                                              <span className="font-black text-primary whitespace-nowrap">
                                                {formatPrice(sector.price)}
                                              </span>
                                            </div>
                                            {sector.description && idx === selectedSectorIdx && (
                                              <p className="text-[11px] text-muted-foreground leading-snug font-medium">
                                                {sector.description}
                                              </p>
                                            )}
                                          </Label>
                                        </div>
                                      );
                                    })}
                                  </RadioGroup>
                                </div>
                              )}

                              <div className="pt-6 border-t border-dashed border-border space-y-2">
                                 <div className="flex items-center justify-between text-muted-foreground">
                                    <span className="text-[10px] font-black uppercase tracking-widest">{t('subtotal')}</span>
                                    <span className="text-lg font-bold">{formatPrice((finalSectors && finalSectors[selectedSectorIdx] ? finalSectors[selectedSectorIdx].price : match.price) * quantity)}</span>
                                 </div>
                                 <div className="flex items-center justify-between text-muted-foreground">
                                    <span className="text-[10px] font-black uppercase tracking-widest">{t('taxas')} (5%)</span>
                                    <span className="text-lg font-bold">{formatPrice(((finalSectors && finalSectors[selectedSectorIdx] ? finalSectors[selectedSectorIdx].price : match.price) * quantity) * 0.05)}</span>
                                 </div>
                                 <div className="flex items-center justify-between pt-2">
                                    <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{t('total')}</span>
                                    <span className="text-2xl font-black text-foreground">{formatPrice(((finalSectors && finalSectors[selectedSectorIdx] ? finalSectors[selectedSectorIdx].price : match.price) * quantity) * 1.05)}</span>
                                 </div>
                              </div>

                             <Button 
                                onClick={() => setIsBookingModalOpen(true)}
                                size="lg" 
                                className="w-full h-18 rounded-2xl font-black text-lg gap-4 shadow-xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all bg-primary hover:bg-primary/90"
                             >
                                <Ticket className="h-6 w-6" />
                                {t('reservar_agora')}
                                <ArrowRight className="h-5 w-5" />
                             </Button>
                          </div>

                           <div className="mt-8 flex items-center gap-3 p-4 bg-muted/20 rounded-2xl border border-dashed text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">
                              <ShieldCheck className="h-6 w-6 text-green-600 shrink-0" />
                              {t('venda_segura_sep')}
                           </div>
                           
                           <div className="mt-6 pt-6 border-t border-primary/10">
                             <PaymentLogos variant="light" className="scale-90 origin-center" />
                             
                             <div className="mt-6 flex items-center gap-3 p-4 bg-green-50 rounded-2xl border border-green-100 transition-colors">
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
                    </div>

                    <div className="p-6 bg-secondary/20 rounded-2xl border flex items-center gap-4 group">
                       <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <ShieldCheck className="h-8 w-8 text-primary group-hover:scale-110 transition-transform" />
                       </div>
                       <div className="text-xs">
                          <p className="font-bold text-foreground">{t('politica_cancelamento')}</p>
                          <p className="text-muted-foreground">{t('politica_cancelamento_desc')}</p>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </main>
      
      {/* Informative Boxes Section */}
      <section className="py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* INCLUDES */}
            {match?.included_json && (
              <div className="bg-card p-8 rounded-[2.5rem] border shadow-sm hover:shadow-md transition-all">
                <div className="w-14 h-14 rounded-2xl bg-green-100 flex items-center justify-center mb-6">
                  <Check className="h-7 w-7 text-green-600" />
                </div>
                <h3 className="text-xl font-black mb-4 uppercase tracking-tight">{language === 'pt' ? 'O que inclui' : 'What includes'}</h3>
                <ul className="space-y-3">
                  {match.included_json.map((item, i) => (
                    <li key={i} className="flex gap-3 text-sm font-medium text-muted-foreground leading-relaxed">
                      <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                      {item.text}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* NOT INCLUDED */}
            {match?.not_included_json && (
              <div className="bg-card p-8 rounded-[2.5rem] border shadow-sm hover:shadow-md transition-all">
                <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center mb-6">
                  <X className="h-7 w-7 text-red-600" />
                </div>
                <h3 className="text-xl font-black mb-4 uppercase tracking-tight">{language === 'pt' ? 'Não inclui' : 'Not included'}</h3>
                <ul className="space-y-3">
                  {match.not_included_json.map((item, i) => (
                    <li key={i} className="flex gap-3 text-sm font-medium text-muted-foreground leading-relaxed">
                      <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                      {item.text}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* BRING */}
            {match?.bring_json && (
              <div className="bg-card p-8 rounded-[2.5rem] border shadow-sm hover:shadow-md transition-all">
                <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center mb-6">
                  <Backpack className="h-7 w-7 text-blue-600" />
                </div>
                <h3 className="text-xl font-black mb-4 uppercase tracking-tight">{language === 'pt' ? 'O que levar' : 'What to bring'}</h3>
                <ul className="space-y-3">
                  {match.bring_json.map((item, i) => (
                    <li key={i} className="flex gap-3 text-sm font-medium text-muted-foreground leading-relaxed">
                      <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                      {item.text}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* DON'T BRING */}
            {match?.dont_bring_json && (
              <div className="bg-card p-8 rounded-[2.5rem] border shadow-sm hover:shadow-md transition-all">
                <div className="w-14 h-14 rounded-2xl bg-orange-100 flex items-center justify-center mb-6">
                  <Ban className="h-7 w-7 text-orange-600" />
                </div>
                <h3 className="text-xl font-black mb-4 uppercase tracking-tight">{language === 'pt' ? 'O que NÃO levar' : "DON'T bring"}</h3>
                <ul className="space-y-3">
                  {match.dont_bring_json.map((item, i) => (
                    <li key={i} className="flex gap-3 text-sm font-medium text-muted-foreground leading-relaxed">
                      <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0" />
                      {item.text}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* ATTENTION */}
            {match?.attention_json && (
              <div className="bg-card p-8 rounded-[2.5rem] border shadow-sm hover:shadow-md transition-all">
                <div className="w-14 h-14 rounded-2xl bg-yellow-100 flex items-center justify-center mb-6">
                  <AlertTriangle className="h-7 w-7 text-yellow-600" />
                </div>
                <h3 className="text-xl font-black mb-4 uppercase tracking-tight">{language === 'pt' ? 'Atenção' : 'Attention'}</h3>
                <ul className="space-y-3">
                  {match.attention_json.map((item, i) => (
                    <li key={i} className="flex gap-3 text-sm font-medium text-muted-foreground leading-relaxed">
                      <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-yellow-500 shrink-0" />
                      {item.text}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* NOT SUITABLE FOR */}
            {match?.not_suitable_json && (
              <div className="bg-card p-8 rounded-[2.5rem] border shadow-sm hover:shadow-md transition-all">
                <div className="w-14 h-14 rounded-2xl bg-purple-100 flex items-center justify-center mb-6">
                  <Activity className="h-7 w-7 text-purple-600" />
                </div>
                <h3 className="text-xl font-black mb-4 uppercase tracking-tight">{language === 'pt' ? 'Não indicado para' : 'Not suitable for'}</h3>
                <ul className="space-y-3">
                  {match.not_suitable_json.map((item, i) => (
                    <li key={i} className="flex gap-3 text-sm font-medium text-muted-foreground leading-relaxed">
                      <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0" />
                      {item.text}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </section>

      <YouMayAlsoLike />

      <WhyChooseUs />

      {/* TripAdvisor Reviews Carousel */}
      <section className="py-24 bg-muted/30 border-t border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-serif font-black text-foreground mb-4">
              {language === 'pt' ? 'O que dizem nossos viajantes' : language === 'es' ? 'Lo que dicen nuestros viajeros' : 'What our travelers say'}
            </h2>
          </div>
          
          <div className="min-h-[300px]">
            <div className="elfsight-app-bbfeb008-113f-47f2-bfa9-91793656db8e" data-elfsight-app-lazy></div>
          </div>
        </div>
      </section>

      {/* Maracana Gallery Carousel */}
      {maracanaGallery && maracanaGallery.length > 0 && (
         <section className="py-24 bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
               <div className="text-center mb-12">
                  <h2 className="text-3xl md:text-5xl font-serif font-black text-foreground mb-4">
                     {language === 'pt' ? 'Galeria de Fotos' : language === 'es' ? 'Galería de Fotos' : 'Photo Gallery'}
                  </h2>
               </div>
               <Carousel opts={{ loop: true, align: "start" }} className="w-full">
                  <CarouselContent className="-ml-4">
                     {maracanaGallery.map((img, i) => (
                        <CarouselItem key={i} className="pl-4 basis-1/2 md:basis-1/3 lg:basis-1/4">
                           <div className="aspect-[4/3] rounded-3xl overflow-hidden border shadow-sm group">
                              <OptimizedImage 
                                 src={img.url} 
                                 alt={`Maracanã ${i + 1}`} 
                                 width={600}
                                 containerClassName="w-full h-full"
                                 fit="cover"
                                 className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
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
         </section>
      )}

      <Footer />

      {/* Booking Modal */}
      <Dialog open={isBookingModalOpen} onOpenChange={setIsBookingModalOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-[2rem] p-8">
          <DialogHeader className="space-y-4">
            <DialogTitle className="text-3xl font-serif font-black text-foreground">{t('dados_reserva')}</DialogTitle>
            <DialogDescription className="text-muted-foreground font-medium">
               {t('dados_reserva_desc')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-8">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t('nome_completo')}</Label>
              <Input id="name" placeholder={t('seu_nome')} value={customerInfo.name} onChange={e => setCustomerInfo({...customerInfo, name: e.target.value})} className="h-12 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="whatsapp" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t('wa_ddd')}</Label>
              <Input id="whatsapp" placeholder="Ex: 21999999999" value={customerInfo.whatsapp} onChange={e => setCustomerInfo({...customerInfo, whatsapp: e.target.value})} className="h-12 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t('email')}</Label>
              <Input id="email" type="email" placeholder={t('seu_email')} value={customerInfo.email} onChange={e => setCustomerInfo({...customerInfo, email: e.target.value})} className="h-12 rounded-xl" />
            </div>
          </div>
          <DialogFooter>
            <Button 
               className="w-full h-16 rounded-2xl font-black text-lg gap-2 shadow-xl shadow-primary/20 transition-all hover:scale-105" 
               onClick={handleCheckout}
               disabled={isProcessing}
            >
               {isProcessing ? t('processando') : t('ir_pagamento')}
               {!isProcessing && <CreditCard className="ml-2 h-5 w-5" />}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
