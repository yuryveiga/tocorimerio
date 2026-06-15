import { useState, useEffect, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { useSiteData } from "@/hooks/useSiteData";
import { useCurrency } from "@/contexts/CurrencyContext";
import { buildWhatsappLink } from "@/lib/whatsappMessage";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { motion, useScroll, useTransform } from "framer-motion";
import { Check, Minus, ArrowRight, MessageCircle } from "lucide-react";

const HOURLY_BRL = 200;

const NoiseOverlay = () => (
  <div 
    className="pointer-events-none fixed inset-0 z-50 h-full w-full opacity-[0.035] mix-blend-overlay"
    style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
    }}
  />
);

const RevealText = ({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) => (
  <div className={`overflow-hidden inline-block ${className}`}>
    <motion.div
      initial={{ y: "110%", opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  </div>
);

const FadeUp = ({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
    className={className}
  >
    {children}
  </motion.div>
);

export default function PrivateGuideRio() {
  const { socialMedia } = useSiteData();
  const { convertBRL, loading: ratesLoading } = useCurrency();
  const { toast } = useToast();

  const emailSocial = socialMedia.find((s) => s.platform.toLowerCase() === "email");
  const whatsappSocial = socialMedia.find((s) => s.platform.toLowerCase().includes("whatsapp"));
  const contactEmail = emailSocial?.url || "";
  const contactPhone = whatsappSocial?.url || "";
  const waLink = contactPhone
    ? buildWhatsappLink(contactPhone, "en") +
      "&text=" + encodeURIComponent("Hi! I'd like to book a private hourly guide in Rio de Janeiro. Could you send me a quote?")
    : "#";

  const usdPrice = convertBRL(HOURLY_BRL, "USD");
  const usdDisplay = ratesLoading ? "…" : `$${usdPrice.toFixed(0)}`;

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    document.body.style.background = "#FBF8F2";
    return () => { document.body.style.background = ""; };
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!contactEmail) {
      toast({ title: "Error", description: "Contact email is not configured.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    const fd = new FormData(e.currentTarget);
    try {
      const { error } = await supabase.functions.invoke("send-contact-email", {
        body: {
          to: contactEmail,
          senderName: fd.get("name") as string,
          senderEmail: fd.get("email") as string,
          senderPhone: (fd.get("phone") as string) || "",
          tourInterest: "Private Hourly Guide in Rio",
          message: fd.get("message") as string,
        },
      });
      if (error) throw error;
      toast({ title: "Message sent!", description: "We'll get back to you shortly." });
      (e.target as HTMLFormElement).reset();
    } catch (err) {
      console.error(err);
      toast({ title: "Could not send", description: "Please try again or use WhatsApp.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Private Hourly Guide in Rio de Janeiro",
    "description": "A licensed, bilingual local guide at your full disposal in Rio de Janeiro. No fixed itineraries, no rush.",
    "provider": {
      "@type": "LocalBusiness",
      "name": "Tocorime Rio",
      "image": "https://tocorimerio.com/logo.png"
    },
    "areaServed": {
      "@type": "City",
      "name": "Rio de Janeiro"
    },
    "offers": {
      "@type": "Offer",
      "priceCurrency": "BRL",
      "price": HOURLY_BRL,
      "priceValidUntil": new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
      "availability": "https://schema.org/InStock"
    }
  };

  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  const yParallax = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  const opacityParallax = useTransform(scrollYProgress, [0, 1], [1, 0.1]);

  const imgRef1 = useRef(null);
  const { scrollYProgress: scrollYImg1 } = useScroll({ target: imgRef1, offset: ["start end", "end start"] });
  const yImg1 = useTransform(scrollYImg1, [0, 1], ["-15%", "15%"]);

  return (
    <div className="font-sans text-[#1A1A1A] bg-[#FBF8F2] min-h-screen selection:bg-[#C8633F] selection:text-white relative">
      <NoiseOverlay />
      <Helmet>
        <html lang="en" />
        <title>Private Hourly Guide in Rio de Janeiro | Tocorime Rio</title>
        <meta name="description" content="Hire a licensed, bilingual private guide in Rio de Janeiro by the hour. Custom itineraries, total flexibility, 4h minimum." />
        <link rel="canonical" href="https://tocorimerio.com/your-private-guide-in-rio" />
        <meta property="og:title" content="Private Hourly Guide in Rio de Janeiro | Tocorime Rio" />
        <meta property="og:description" content="A licensed, bilingual local guide at your full disposal — no fixed itineraries, no rush, no tourist traps." />
        <meta property="og:url" content="https://tocorimerio.com/your-private-guide-in-rio" />
        <meta property="og:image" content="https://tocorimerio.com/og-image.jpg" />
        <script type="application/ld+json">{JSON.stringify(schemaData)}</script>
        {/* Google tag (gtag.js) */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=AW-18075082892"></script>
        <script>
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'AW-18075082892');
          `}
        </script>
      </Helmet>

      {/* Topbar */}
      <div className="relative z-50 border-b border-[#14241F]/10 text-center text-[0.65rem] py-2 px-5 tracking-widest uppercase text-[#14241F] bg-[#FBF8F2]">
        An Editorial Travel Journal · Volume I · Rio de Janeiro
      </div>

      {/* Header */}
      <header className="relative z-50 flex justify-between items-center px-6 lg:px-12 py-5 border-b border-[#14241F]/10 bg-[#FBF8F2]/90 backdrop-blur-md">
        <Link to="/" className="flex items-center gap-3 font-serif text-xl lg:text-2xl text-[#14241F] tracking-wide">
          <img src="/logo.png" alt="Tocorime Rio" className="h-10 lg:h-12 w-auto object-contain" />
          <span>Tocorime Rio</span>
        </Link>
        <nav className="hidden md:flex items-center gap-10">
          <Link to="/" className="text-[#14241F] text-[0.65rem] font-medium uppercase tracking-[0.2em] hover:text-[#C8633F] transition-colors">Home</Link>
          <Link to="/experiences" className="text-[#14241F] text-[0.65rem] font-medium uppercase tracking-[0.2em] hover:text-[#C8633F] transition-colors">Tours</Link>
          <a href="#contact" className="text-[#14241F] text-[0.65rem] font-medium uppercase tracking-[0.2em] hover:text-[#C8633F] transition-colors">Contact</a>
          <a 
            href={waLink} 
            target="_blank" 
            rel="noopener noreferrer"
            className="group relative overflow-hidden border border-[#14241F] px-6 py-3 text-[0.65rem] uppercase tracking-[0.2em] text-[#14241F] font-medium"
          >
            <span className="absolute inset-0 w-full h-full bg-[#14241F] -translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[0.19,1,0.22,1]"></span>
            <span className="relative z-10 group-hover:text-[#FBF8F2] transition-colors duration-500">Book Now</span>
          </a>
        </nav>
      </header>

      {/* HERO */}
      <section ref={heroRef} className="relative min-h-[90vh] flex items-end text-white overflow-hidden bg-[#14241F]">
        <motion.div 
          style={{ 
            y: yParallax,
            opacity: opacityParallax,
            backgroundImage: "url('https://imgmd.net/images/v1/guia/1698673/rio-de-janeiro-4-c.jpg')" 
          }} 
          className="absolute inset-0 bg-cover bg-center origin-bottom z-0 scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#14241F]/40 to-[#14241F] z-10 pointer-events-none" />

        <div className="w-full px-6 lg:px-12 pb-24 grid grid-cols-1 lg:grid-cols-12 gap-10 items-end relative z-20 max-w-[1800px] mx-auto">
          <div className="lg:col-span-8">
            <FadeUp delay={0.1}>
              <div className="text-[0.65rem] tracking-[0.35em] uppercase opacity-90 mb-8 flex items-center gap-4">
                <div className="w-16 h-px bg-white"></div>
                Chapter 01 · Private Experiences
              </div>
            </FadeUp>
            
            <h1 className="font-serif font-normal text-5xl sm:text-6xl md:text-7xl lg:text-[6rem] leading-[1.02] tracking-tight mb-12">
              <div className="overflow-hidden"><RevealText delay={0.2}>Your Private Guide</RevealText></div>
              <div className="overflow-hidden"><RevealText delay={0.3}><em className="text-[#E8B567] italic pr-4">in Rio</em>, hour by hour.</RevealText></div>
            </h1>
            
            <FadeUp delay={0.5} className="flex flex-col sm:flex-row gap-4 mt-8">
              <a href={waLink} target="_blank" rel="noopener noreferrer" className="group relative overflow-hidden bg-[#E8B567] text-[#14241F] px-8 py-5 text-[0.65rem] font-medium uppercase tracking-[0.2em] flex items-center justify-center gap-3">
                <span className="absolute inset-0 w-full h-full bg-white -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-[0.19,1,0.22,1]"></span>
                <span className="relative flex items-center gap-3 z-10"><MessageCircle size={16} /> Chat on WhatsApp</span>
              </a>
              <a href="#contact" className="group relative overflow-hidden border border-white/30 backdrop-blur-md bg-white/5 text-white px-8 py-5 text-[0.65rem] font-medium uppercase tracking-[0.2em] flex items-center justify-center">
                <span className="absolute inset-0 w-full h-full bg-white -translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[0.19,1,0.22,1]"></span>
                <span className="relative z-10 group-hover:text-[#14241F] transition-colors duration-500">Request a Quote</span>
              </a>
            </FadeUp>
          </div>
          
          <FadeUp delay={0.6} className="lg:col-span-4 text-left lg:text-right flex lg:justify-end">
            <div className="text-[0.7rem] tracking-[0.25em] uppercase leading-relaxed opacity-90 max-w-xs">
              <strong className="block font-serif italic text-2xl normal-case tracking-normal mb-3 text-[#E8B567] font-normal">Issue Nº 01</strong>
              A licensed, bilingual local at your full disposal — no fixed itineraries, no rush, no tourist traps.
            </div>
          </FadeUp>
        </div>
      </section>

      {/* Marquee Strip */}
      <div className="flex justify-between items-center px-6 lg:px-12 py-6 border-b border-[#14241F]/10 text-[0.65rem] font-medium tracking-[0.25em] uppercase text-[#6e6e6e] flex-wrap gap-6 bg-[#FBF8F2]">
        <span className="whitespace-nowrap flex items-center gap-2"><Check size={14} className="text-[#2A6B4A]"/> 5.0 TripAdvisor</span>
        <span className="whitespace-nowrap flex items-center gap-2"><Check size={14} className="text-[#2A6B4A]"/> Cadastur Certified</span>
        <span className="whitespace-nowrap flex items-center gap-2"><Check size={14} className="text-[#2A6B4A]"/> Bilingual Locals</span>
        <span className="whitespace-nowrap flex items-center gap-2"><Check size={14} className="text-[#2A6B4A]"/> Secure Payment</span>
      </div>

      {/* Sticky Layout: The Premise */}
      <section className="py-32 lg:py-48 px-6 lg:px-12 max-w-[1800px] mx-auto">
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-32 relative">
          
          {/* Sticky Left Sidebar */}
          <div className="lg:w-[40%] relative">
            <div className="lg:sticky lg:top-32">
              <FadeUp>
                <div className="flex items-center gap-4 text-[0.65rem] tracking-[0.3em] uppercase text-[#C8633F] mb-8">
                  <span className="font-serif italic text-3xl tracking-normal text-[#14241F] normal-case">01</span> The Premise
                </div>
                <h2 className="font-serif text-5xl lg:text-6xl leading-[1.05] tracking-tight text-[#14241F]">
                  Rio, <em className="text-[#2A6B4A] italic">entirely</em><br/> on your terms.
                </h2>
              </FadeUp>
            </div>
          </div>

          {/* Scrolling Content Right */}
          <div className="lg:w-[60%] flex flex-col gap-24 pt-4 lg:pt-16">
            <FadeUp>
              <p className="text-2xl lg:text-[1.7rem] text-[#3a3a3a] leading-[1.6] font-light">
                Whether you want to dig into local culture, see the iconic landmarks, find the best restaurants, or simply have a trusted local handling logistics — you set the pace, we handle the way.
              </p>
            </FadeUp>

            {/* Editorial Image injected */}
            <div className="w-full h-[70vh] overflow-hidden bg-[#E8E4D9] relative" ref={imgRef1}>
              <motion.img 
                style={{ y: yImg1, scale: 1.15 }}
                src="https://images.unsplash.com/photo-1590077428593-a55bb07c4665?q=80&w=1600&auto=format&fit=crop" 
                alt="Copacabana details"
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-16">
              {[
                { num: 'i.', title: 'Total Flexibility', desc: 'Hire for as many hours as you need, minimum four. Morning, afternoon, evening, or a full day exploring the city.' },
                { num: 'ii.', title: 'Fully Customized', desc: 'We help you plan a smart, efficient itinerary — or simply accompany you through your own plans with real local insight.' },
                { num: 'iii.', title: 'Stress-Free', desc: 'No language barriers, no wrong turns, no overpriced tourist traps — just a trusted local making sure your day runs smoothly.' }
              ].map((feature, idx) => (
                <FadeUp key={idx} delay={idx * 0.1} className={`${idx === 2 ? 'sm:col-span-2 sm:w-[45%]' : ''}`}>
                  <span className="font-serif italic text-xl text-[#C8633F] mb-6 block">{feature.num}</span>
                  <h3 className="font-serif text-3xl text-[#14241F] mb-4">{feature.title}</h3>
                  <p className="text-[#555] leading-relaxed text-base">{feature.desc}</p>
                </FadeUp>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* The Particulars (Included/Not Included) - Asymmetric */}
      <section className="py-32 lg:py-48 px-6 lg:px-12 bg-white relative">
        <div className="max-w-[1800px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-20">
            <div className="lg:col-span-5">
              <FadeUp>
                <div className="flex items-center gap-4 text-[0.65rem] tracking-[0.3em] uppercase text-[#C8633F] mb-8">
                  <span className="font-serif italic text-3xl tracking-normal text-[#14241F] normal-case">02</span> The Particulars
                </div>
                <h2 className="font-serif text-5xl lg:text-6xl leading-[1.05] tracking-tight text-[#14241F] mb-12">
                  What is, and isn't,<br/> <em className="text-[#2A6B4A] italic">included</em>.
                </h2>
                <p className="text-xl text-[#6e6e6e] font-light leading-relaxed max-w-md">
                  Transparency is the foundation of luxury. We believe in clear expectations from the moment you book.
                </p>
              </FadeUp>
            </div>

            <div className="lg:col-span-7 flex flex-col gap-12 lg:pt-32">
              <FadeUp delay={0.2} className="bg-[#FBF8F2] p-10 lg:p-16 border border-[#14241F]/5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#2A6B4A]/5 rounded-bl-full -mr-10 -mt-10 transition-transform duration-700 group-hover:scale-150"></div>
                <h3 className="font-serif text-3xl text-[#14241F] mb-10 pb-6 border-b border-[#14241F]/10 flex flex-col sm:flex-row sm:justify-between sm:items-baseline gap-4 relative z-10">
                  Included 
                  <span className="font-sans text-[0.65rem] font-medium tracking-[0.3em] uppercase text-[#6e6e6e]">What you'll receive</span>
                </h3>
                <ul className="space-y-6 relative z-10">
                  {[
                    "Exclusive accompaniment by a licensed, certified guide",
                    "Personalized itinerary planning before your tour",
                    "Your choice of language — English, Portuguese or Spanish",
                    "Local recommendations and insider tips along the way"
                  ].map((item, i) => (
                    <li key={i} className="flex gap-5 text-base lg:text-lg text-[#2a2a2a] leading-relaxed">
                      <Check className="text-[#2A6B4A] shrink-0 mt-1" size={20} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </FadeUp>

              <FadeUp delay={0.3} className="bg-white p-10 lg:p-16 border border-[#14241F]/10 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#C8633F]/5 rounded-bl-full -mr-10 -mt-10 transition-transform duration-700 group-hover:scale-150"></div>
                <h3 className="font-serif text-3xl text-[#14241F] mb-10 pb-6 border-b border-[#14241F]/10 flex flex-col sm:flex-row sm:justify-between sm:items-baseline gap-4 relative z-10">
                  Not Included 
                  <span className="font-sans text-[0.65rem] font-medium tracking-[0.3em] uppercase text-[#6e6e6e]">Plan accordingly</span>
                </h3>
                <ul className="space-y-6 relative z-10">
                  {[
                    "Tickets to attractions (Christ the Redeemer, cable car, etc.)",
                    "Transportation, unless a private car add-on is booked",
                    "Meals for guest and guide during the tour"
                  ].map((item, i) => (
                    <li key={i} className="flex gap-5 text-base lg:text-lg text-[#2a2a2a] leading-relaxed">
                      <Minus className="text-[#C8633F] shrink-0 mt-1" size={20} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </FadeUp>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing / Packages Redesign */}
      <section className="bg-[#14241F] text-[#F4EFE6] py-32 lg:py-48 px-6 lg:px-12 relative overflow-hidden">
        {/* Subtle background abstract shape */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#E8B567] rounded-full blur-[150px] opacity-10 pointer-events-none"></div>

        <div className="max-w-[1800px] mx-auto relative z-10 grid grid-cols-1 xl:grid-cols-12 gap-20">
          <div className="xl:col-span-4">
            <FadeUp>
              <div className="flex items-center gap-4 text-[0.65rem] tracking-[0.3em] uppercase text-[#E8B567] mb-8">
                <span className="font-serif italic text-3xl tracking-normal text-[#F4EFE6] normal-case">03</span> The Investment
              </div>
              <h2 className="font-serif text-5xl lg:text-6xl leading-[1.05] tracking-tight mb-8">
                Hourly rates,<br/> <em className="italic text-[#E8B567]">boundless</em> days.
              </h2>
              <p className="text-[#bcc7c3] text-xl font-light leading-relaxed mb-12">
                Private, exclusive, and tailored entirely to you. Choose a classic block of hours or request a custom duration. No hidden fees.
              </p>
              
              <div className="pt-8 border-t border-white/10 hidden xl:block">
                <div className="text-[0.65rem] tracking-[0.2em] uppercase text-[#8fa39c] mb-2">Base Rate</div>
                <div className="text-3xl font-serif text-[#F4EFE6] mb-1">${usdDisplay} <span className="text-lg italic text-[#8fa39c]">/ hr</span></div>
                <div className="text-xs uppercase tracking-widest text-[#8fa39c]">≈ R${HOURLY_BRL}</div>
              </div>
            </FadeUp>
          </div>

          <div className="xl:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {/* Half Day Package */}
            <FadeUp delay={0.2} className="group bg-white/5 backdrop-blur-sm border border-white/10 p-10 lg:p-16 hover:bg-white/10 transition-colors duration-500 relative overflow-hidden flex flex-col">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              <div className="text-[0.65rem] font-medium tracking-[0.3em] uppercase text-[#E8B567] mb-6 relative z-10">Most Popular</div>
              <h3 className="font-serif text-4xl mb-6 text-white relative z-10">Half-Day Experience</h3>
              <p className="text-[#bcc7c3] text-lg leading-relaxed mb-12 flex-grow relative z-10">Perfect for covering 1-2 major landmarks or a deep dive into a specific neighborhood at a relaxed pace.</p>
              
              <div className="flex items-baseline gap-2 mb-4 relative z-10">
                <span className="text-white text-2xl font-serif border-b border-white/20 pb-1">4 hours minimum</span>
              </div>
              
              <div className="pt-8 relative z-10">
                <div className="text-[#8fa39c] text-xs font-medium uppercase tracking-[0.2em] mb-2">Total Estimated</div>
                <div className="font-serif text-5xl text-[#E8B567]">
                  <sup className="text-2xl top-[-0.5em] mr-1">$</sup>{ratesLoading ? "…" : (usdPrice * 4).toFixed(0)}
                </div>
              </div>
            </FadeUp>

            {/* Full Day Package */}
            <FadeUp delay={0.3} className="group bg-white/5 backdrop-blur-sm border border-white/10 p-10 lg:p-16 hover:bg-white/10 transition-colors duration-500 relative overflow-hidden flex flex-col">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              <div className="text-[0.65rem] font-medium tracking-[0.3em] uppercase text-[#8fa39c] mb-6 relative z-10">Comprehensive</div>
              <h3 className="font-serif text-4xl mb-6 text-white relative z-10">Full-Day Experience</h3>
              <p className="text-[#bcc7c3] text-lg leading-relaxed mb-12 flex-grow relative z-10">The ultimate Rio immersion. See the iconic sights, enjoy a local lunch, and uncover hidden gems without feeling rushed.</p>
              
              <div className="flex items-baseline gap-2 mb-4 relative z-10">
                <span className="text-white text-2xl font-serif border-b border-white/20 pb-1">8 hours recommended</span>
              </div>
              
              <div className="pt-8 relative z-10">
                <div className="text-[#8fa39c] text-xs font-medium uppercase tracking-[0.2em] mb-2">Total Estimated</div>
                <div className="font-serif text-5xl text-[#E8B567]">
                  <sup className="text-2xl top-[-0.5em] mr-1">$</sup>{ratesLoading ? "…" : (usdPrice * 8).toFixed(0)}
                </div>
              </div>
            </FadeUp>
          </div>
          
          <div className="xl:hidden text-center mt-8 text-[#8fa39c] text-sm tracking-wide">
            Base rate: <strong>${usdDisplay} (R${HOURLY_BRL}) per hour</strong>.
          </div>
        </div>
      </section>

      {/* The Process - Oversized typography design */}
      <section className="py-32 lg:py-48 px-6 lg:px-12 max-w-[1800px] mx-auto border-b border-[#14241F]/10" id="how">
        <FadeUp>
          <div className="flex items-center gap-4 text-[0.65rem] tracking-[0.3em] uppercase text-[#C8633F] mb-8">
            <span className="font-serif italic text-3xl tracking-normal text-[#14241F] normal-case">04</span> The Process
          </div>
          <h2 className="font-serif text-5xl lg:text-7xl leading-[1.05] tracking-tight text-[#14241F] mb-24 max-w-4xl">
            From inquiry to <em className="text-[#C8633F] italic">arrival</em>, in four flawless steps.
          </h2>
        </FadeUp>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-12 gap-y-24">
          {[
            { num: '01', title: 'Choose Your Hours', desc: 'Pick your date and select how many hours you’d like — 4h, 8h or a custom block.' },
            { num: '02', title: 'Share Your Interests', desc: 'Tell us your preferred language and what you’d love to experience in Rio.' },
            { num: '03', title: 'Receive Your Quote', desc: 'We confirm availability and send your personalized quote within hours.' },
            { num: '04', title: 'Meet Your Guide', desc: 'Your guide arrives ready to show you Rio exactly the way you want it.' }
          ].map((step, idx) => (
            <FadeUp 
              key={idx}
              delay={idx * 0.15}
              className="relative pt-12"
            >
              {/* Giant background numeral */}
              <div className="absolute top-0 left-0 text-[10rem] lg:text-[14rem] font-serif leading-none text-[#14241F]/[0.03] -mt-16 -ml-4 z-0 pointer-events-none select-none">
                {step.num}
              </div>
              <div className="relative z-10 border-t border-[#14241F]/20 pt-8">
                <h3 className="font-serif text-3xl text-[#14241F] mb-4">{step.title}</h3>
                <p className="text-[#555] text-lg leading-relaxed font-light">{step.desc}</p>
              </div>
            </FadeUp>
          ))}
        </div>
      </section>

      {/* Contact */}
      <section className="py-32 lg:py-48 px-6 lg:px-12 bg-white" id="contact">
        <div className="max-w-[1800px] mx-auto text-center mb-24">
          <FadeUp>
            <div className="flex items-center justify-center gap-4 text-[0.65rem] tracking-[0.3em] uppercase text-[#C8633F] mb-8">
              <span className="font-serif italic text-3xl tracking-normal text-[#14241F] normal-case">05</span> Begin the Conversation
            </div>
            <h2 className="font-serif text-5xl lg:text-[5.5rem] leading-[1.05] tracking-tight text-[#14241F] max-w-4xl mx-auto mb-8">
              Ready to discover Rio <em className="italic text-[#C8633F]">your way?</em>
            </h2>
            <p className="text-xl lg:text-2xl font-light text-[#555] max-w-3xl mx-auto">
              Message us on WhatsApp, or send a note below — we'll craft your custom hourly guide experience, tailored exclusively for you.
            </p>
          </FadeUp>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 max-w-[1500px] mx-auto items-stretch">
          <FadeUp delay={0.1} className="lg:col-span-5 bg-[#14241F] text-[#F4EFE6] p-12 lg:p-20 flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#E8B567]/5 rounded-full blur-[80px] group-hover:bg-[#E8B567]/10 transition-colors duration-1000"></div>
            <div className="relative z-10">
              <div className="text-[0.65rem] font-medium tracking-[0.3em] uppercase text-[#E8B567] mb-8">Quickest reply</div>
              <h3 className="font-serif text-4xl lg:text-5xl leading-[1.1] mb-8 text-white">
                A direct line to your <em className="italic text-[#E8B567]">concierge</em>.
              </h3>
              <p className="text-[#bcc7c3] text-lg font-light leading-relaxed mb-16">
                Chat with us on WhatsApp and receive a personalized quote within hours, from a real person on the ground in Rio.
              </p>
            </div>
            {contactPhone ? (
              <a href={waLink} target="_blank" rel="noopener noreferrer" className="relative z-10 group/btn overflow-hidden bg-[#E8B567] text-[#14241F] px-10 py-6 text-[0.65rem] tracking-[0.3em] uppercase font-bold flex justify-between items-center transition-colors">
                <span className="absolute inset-0 w-full h-full bg-white -translate-x-full group-hover/btn:translate-x-0 transition-transform duration-500 ease-[0.19,1,0.22,1]"></span>
                <span className="relative z-10">Request on WhatsApp</span>
                <ArrowRight size={20} className="relative z-10 transition-transform duration-500 group-hover/btn:translate-x-2" />
              </a>
            ) : (
              <p className="text-[#8fa39c] relative z-10">WhatsApp coming soon.</p>
            )}
          </FadeUp>

          <FadeUp delay={0.2} className="lg:col-span-7 bg-[#FBF8F2] p-12 lg:p-20 border border-[#14241F]/10">
            <form onSubmit={handleSubmit} className="flex flex-col gap-10">
              <div className="mb-4">
                <h3 className="font-serif text-4xl text-[#14241F] mb-4">Or send a note.</h3>
                <p className="text-[#6e6e6e] text-lg font-light">We typically reply within a few hours.</p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                <div className="relative">
                  <input id="pg-name" name="name" required placeholder=" " maxLength={100} className="peer w-full py-4 bg-transparent border-b border-[#14241F]/20 focus:border-[#14241F] outline-none transition-colors rounded-none text-lg" />
                  <label htmlFor="pg-name" className="absolute left-0 top-4 text-[0.65rem] font-medium tracking-[0.22em] uppercase text-[#6e6e6e] transition-all peer-focus:-top-4 peer-focus:text-[#14241F] peer-focus:text-[0.6rem] peer-[:not(:placeholder-shown)]:-top-4 peer-[:not(:placeholder-shown)]:[0.6rem]">Name</label>
                </div>
                <div className="relative">
                  <input id="pg-email" name="email" type="email" required placeholder=" " maxLength={255} className="peer w-full py-4 bg-transparent border-b border-[#14241F]/20 focus:border-[#14241F] outline-none transition-colors rounded-none text-lg" />
                  <label htmlFor="pg-email" className="absolute left-0 top-4 text-[0.65rem] font-medium tracking-[0.22em] uppercase text-[#6e6e6e] transition-all peer-focus:-top-4 peer-focus:text-[#14241F] peer-focus:text-[0.6rem] peer-[:not(:placeholder-shown)]:-top-4 peer-[:not(:placeholder-shown)]:[0.6rem]">Email</label>
                </div>
              </div>

              <div className="relative">
                <input id="pg-phone" name="phone" placeholder=" " maxLength={40} className="peer w-full py-4 bg-transparent border-b border-[#14241F]/20 focus:border-[#14241F] outline-none transition-colors rounded-none text-lg" />
                <label htmlFor="pg-phone" className="absolute left-0 top-4 text-[0.65rem] font-medium tracking-[0.22em] uppercase text-[#6e6e6e] transition-all peer-focus:-top-4 peer-focus:text-[#14241F] peer-focus:text-[0.6rem] peer-[:not(:placeholder-shown)]:-top-4 peer-[:not(:placeholder-shown)]:[0.6rem]">WhatsApp / Phone (optional)</label>
              </div>

              <div className="relative mt-4">
                <textarea id="pg-msg" name="message" required rows={4} placeholder=" " maxLength={1000} className="peer w-full py-4 bg-transparent border-b border-[#14241F]/20 focus:border-[#14241F] outline-none transition-colors resize-y min-h-[120px] rounded-none text-lg" />
                <label htmlFor="pg-msg" className="absolute left-0 top-4 text-[0.65rem] font-medium tracking-[0.22em] uppercase text-[#6e6e6e] transition-all peer-focus:-top-6 peer-focus:text-[#14241F] peer-focus:text-[0.6rem] peer-[:not(:placeholder-shown)]:-top-6 peer-[:not(:placeholder-shown)]:[0.6rem]">Your message</label>
              </div>

              <button type="submit" disabled={submitting} className="group relative overflow-hidden mt-6 bg-[#14241F] text-[#FBF8F2] py-6 px-10 text-[0.65rem] tracking-[0.3em] uppercase font-bold disabled:opacity-50 flex items-center justify-center gap-4 self-start">
                <span className="absolute inset-0 w-full h-full bg-[#2A6B4A] -translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[0.19,1,0.22,1]"></span>
                <span className="relative z-10 flex items-center gap-4">
                  {submitting ? "Sending…" : "Send Request"} { !submitting && <ArrowRight size={18} className="transition-transform duration-500 group-hover:translate-x-2" /> }
                </span>
              </button>
            </form>
          </FadeUp>
        </div>
      </section>

      {/* Footer Editorial */}
      <footer className="bg-[#14241F] text-[#8fa39c] py-20 px-6 lg:px-12 text-sm tracking-wide">
        <div className="max-w-[1800px] mx-auto flex flex-col md:flex-row justify-between items-center gap-10 pb-12 border-b border-white/10">
          <div className="flex items-center gap-5 text-[#F4EFE6] font-serif italic text-3xl">
            <img src="/logo.png" alt="Tocorime Rio" className="h-12 w-auto brightness-0 invert opacity-90" />
            Tocorime Rio
          </div>
          <div className="text-[0.65rem] font-medium tracking-[0.3em] uppercase text-center md:text-right">
            Private &amp; Custom · Rio de Janeiro
          </div>
        </div>
        <div className="max-w-[1800px] mx-auto text-center mt-10 text-[0.65rem] font-medium tracking-[0.25em] uppercase opacity-70">
          © {new Date().getFullYear()} Tocorime Rio · All rights reserved
        </div>
      </footer>
    </div>
  );
}