import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { useSiteData } from "@/hooks/useSiteData";
import { useCurrency } from "@/contexts/CurrencyContext";
import { buildWhatsappLink } from "@/lib/whatsappMessage";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Check, Minus, ArrowRight, MessageCircle } from "lucide-react";

const HOURLY_BRL = 200;

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

  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <div className="font-sans text-[#1A1A1A] bg-[#FBF8F2] min-h-screen selection:bg-[#C8633F] selection:text-white">
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
      <div className="border-b border-[#14241F]/10 text-center text-[0.7rem] py-2 px-5 tracking-widest uppercase text-[#14241F] bg-[#FBF8F2]">
        An Editorial Travel Journal · Volume I · Rio de Janeiro
      </div>

      {/* Header */}
      <header className="flex justify-between items-center px-6 lg:px-[7%] py-5 border-b border-[#14241F]/10">
        <Link to="/" className="flex items-center gap-3 font-serif text-xl lg:text-2xl text-[#14241F] tracking-wide">
          <img src="/logo.png" alt="Tocorime Rio" className="h-10 lg:h-12 w-auto object-contain" />
          <span>Tocorime Rio</span>
        </Link>
        <nav className="hidden md:flex items-center gap-8">
          <Link to="/" className="text-[#14241F] text-xs uppercase tracking-[0.2em] hover:text-[#C8633F] transition-colors">Home</Link>
          <Link to="/experiences" className="text-[#14241F] text-xs uppercase tracking-[0.2em] hover:text-[#C8633F] transition-colors">Tours</Link>
          <a href="#contact" className="text-[#14241F] text-xs uppercase tracking-[0.2em] hover:text-[#C8633F] transition-colors">Contact</a>
          <a 
            href={waLink} 
            target="_blank" 
            rel="noopener noreferrer"
            className="border border-[#14241F] px-5 py-2.5 text-xs uppercase tracking-[0.2em] text-[#14241F] hover:bg-[#14241F] hover:text-[#FBF8F2] transition-all"
          >
            Book Now
          </a>
        </nav>
      </header>

      {/* HERO */}
      <section className="relative min-h-[85vh] flex items-end text-white bg-cover bg-center" style={{backgroundImage: "linear-gradient(180deg, rgba(20,36,31,0.2) 0%, rgba(20,36,31,0.4) 50%, rgba(20,36,31,0.85) 100%), url('https://imgmd.net/images/v1/guia/1698673/rio-de-janeiro-4-c.jpg')"}}>
        <div className="w-full px-6 lg:px-[7%] pb-20 grid grid-cols-1 lg:grid-cols-12 gap-10 items-end">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-8"
          >
            <div className="text-[0.7rem] tracking-[0.3em] uppercase opacity-90 mb-6 flex items-center gap-4">
              <div className="w-12 h-px bg-white"></div>
              Chapter 01 · Private Experiences
            </div>
            <h1 className="font-serif font-normal text-5xl md:text-6xl lg:text-7xl leading-[1.05] tracking-tight mb-8">
              Your Private Guide <em className="text-[#E8B567] italic">in Rio</em>,<br className="hidden md:block" /> hour by hour.
            </h1>
            
            {/* New Hero CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <a href={waLink} target="_blank" rel="noopener noreferrer" className="bg-[#E8B567] text-[#14241F] px-8 py-4 text-xs font-semibold uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-white transition-colors">
                <MessageCircle size={16} /> Chat on WhatsApp
              </a>
              <a href="#contact" className="border border-white/40 backdrop-blur-sm bg-white/10 text-white px-8 py-4 text-xs font-semibold uppercase tracking-widest flex items-center justify-center hover:bg-white/20 transition-colors">
                Request a Quote
              </a>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-4 text-left lg:text-right"
          >
            <div className="text-[0.78rem] tracking-[0.25em] uppercase leading-relaxed opacity-90 max-w-sm lg:ml-auto">
              <strong className="block font-serif italic text-xl normal-case tracking-normal mb-2 text-[#E8B567] font-normal">Issue Nº 01</strong>
              A licensed, bilingual local at your full disposal — no fixed itineraries, no rush, no tourist traps.
            </div>
          </motion.div>
        </div>
      </section>

      {/* Marquee Strip */}
      <div className="flex justify-between items-center px-6 lg:px-[7%] py-6 border-b border-[#14241F]/10 text-[0.7rem] tracking-[0.22em] uppercase text-[#6e6e6e] flex-wrap gap-5">
        <span className="whitespace-nowrap flex items-center gap-2"><Check size={14} className="text-[#2A6B4A]"/> 5.0 TripAdvisor</span>
        <span className="whitespace-nowrap flex items-center gap-2"><Check size={14} className="text-[#2A6B4A]"/> Cadastur Certified</span>
        <span className="whitespace-nowrap flex items-center gap-2"><Check size={14} className="text-[#2A6B4A]"/> Bilingual Locals</span>
        <span className="whitespace-nowrap flex items-center gap-2"><Check size={14} className="text-[#2A6B4A]"/> Secure Payment</span>
      </div>

      {/* The Premise */}
      <section className="py-24 lg:py-32 px-6 lg:px-[7%] max-w-[1380px] mx-auto">
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}>
          <div className="flex items-center gap-4 text-[0.7rem] tracking-[0.3em] uppercase text-[#C8633F] mb-8">
            <span className="font-serif italic text-2xl tracking-normal text-[#14241F] normal-case">01</span> The Premise
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start">
            <h2 className="lg:col-span-7 font-serif text-4xl lg:text-5xl leading-[1.1] tracking-tight text-[#14241F]">
              Rio, <em className="text-[#2A6B4A] italic">entirely</em><br/>on your terms.
            </h2>
            <div className="lg:col-span-5 lg:border-l border-[#14241F]/20 lg:pl-8">
              <p className="text-lg text-[#3a3a3a] leading-relaxed">
                Whether you want to dig into local culture, see the iconic landmarks, find the best restaurants, or simply have a trusted local handling logistics — you set the pace, we handle the way.
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-0 mt-20 md:border-t border-[#14241F]/20 md:pt-12">
          {[
            { num: 'i.', title: 'Total Flexibility', desc: 'Hire for as many hours as you need, minimum four. Morning, afternoon, evening, or a full day exploring the city.' },
            { num: 'ii.', title: 'Fully Customized', desc: 'We help you plan a smart, efficient itinerary — or simply accompany you through your own plans with real local insight.' },
            { num: 'iii.', title: 'Stress-Free', desc: 'No language barriers, no wrong turns, no overpriced tourist traps — just a trusted local making sure your day runs smoothly.' }
          ].map((feature, idx) => (
            <motion.div 
              key={idx}
              variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }}
              className={`md:px-8 first:md:pl-0 last:md:pr-0 ${idx !== 2 ? 'md:border-r border-[#14241F]/20' : ''}`}
            >
              <span className="font-serif italic text-base text-[#C8633F] mb-5 block">{feature.num}</span>
              <h3 className="font-serif text-2xl text-[#14241F] mb-3">{feature.title}</h3>
              <p className="text-[#555] leading-relaxed text-sm lg:text-base">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* The Particulars (Included/Not Included) */}
      <section className="py-24 lg:py-32 px-6 lg:px-[7%] bg-white">
        <div className="max-w-[1380px] mx-auto">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <div className="flex items-center gap-4 text-[0.7rem] tracking-[0.3em] uppercase text-[#C8633F] mb-8">
              <span className="font-serif italic text-2xl tracking-normal text-[#14241F] normal-case">02</span> The Particulars
            </div>
            <h2 className="font-serif text-4xl lg:text-5xl leading-[1.1] tracking-tight text-[#14241F] mb-16">
              What is, and isn't, <em className="text-[#2A6B4A] italic">included</em>.
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="bg-[#FBF8F2] p-8 lg:p-12 border border-[#14241F]/5">
              <h3 className="font-serif text-2xl text-[#14241F] mb-8 pb-4 border-b border-[#14241F]/10 flex justify-between items-baseline">
                Included <span className="font-sans text-[0.65rem] tracking-[0.3em] uppercase text-[#6e6e6e]">What you'll receive</span>
              </h3>
              <ul className="space-y-4">
                {[
                  "Exclusive accompaniment by a licensed, certified guide",
                  "Personalized itinerary planning before your tour",
                  "Your choice of language — English, Portuguese or Spanish",
                  "Local recommendations and insider tips along the way"
                ].map((item, i) => (
                  <li key={i} className="flex gap-4 text-[0.95rem] text-[#2a2a2a] leading-relaxed pb-4 border-b border-[#14241F]/5 last:border-0">
                    <Check className="text-[#2A6B4A] shrink-0 mt-1" size={18} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="bg-white p-8 lg:p-12 border border-[#14241F]/10">
              <h3 className="font-serif text-2xl text-[#14241F] mb-8 pb-4 border-b border-[#14241F]/10 flex justify-between items-baseline">
                Not Included <span className="font-sans text-[0.65rem] tracking-[0.3em] uppercase text-[#6e6e6e]">Plan accordingly</span>
              </h3>
              <ul className="space-y-4">
                {[
                  "Tickets to attractions (Christ the Redeemer, cable car, etc.)",
                  "Transportation, unless a private car add-on is booked",
                  "Meals for guest and guide during the tour"
                ].map((item, i) => (
                  <li key={i} className="flex gap-4 text-[0.95rem] text-[#2a2a2a] leading-relaxed pb-4 border-b border-[#14241F]/5 last:border-0">
                    <Minus className="text-[#C8633F] shrink-0 mt-1" size={18} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pricing / Packages Redesign */}
      <section className="bg-[#14241F] text-[#F4EFE6] py-24 lg:py-32 px-6 lg:px-[7%] relative overflow-hidden">
        <div className="max-w-[1380px] mx-auto relative z-10">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center max-w-3xl mx-auto mb-20">
            <div className="flex items-center justify-center gap-4 text-[0.7rem] tracking-[0.3em] uppercase text-[#E8B567] mb-6">
              <span className="font-serif italic text-2xl tracking-normal text-[#F4EFE6] normal-case">03</span> The Investment
            </div>
            <h2 className="font-serif text-4xl lg:text-5xl leading-[1.1] tracking-tight mb-6">
              Hourly rates, <em className="italic text-[#E8B567]">boundless</em> days.
            </h2>
            <p className="text-[#bcc7c3] text-lg">
              Private, exclusive, and tailored entirely to you. Choose a classic block of hours or request a custom duration. No hidden fees.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {/* Half Day Package */}
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="bg-white/5 border border-white/10 p-10 lg:p-14 hover:bg-white/10 transition-colors">
              <div className="text-[0.7rem] tracking-[0.3em] uppercase text-[#8fa39c] mb-4">Most Popular</div>
              <h3 className="font-serif text-3xl mb-6 text-white">Half-Day Experience</h3>
              <p className="text-[#bcc7c3] mb-8 min-h-[60px]">Perfect for covering 1-2 major landmarks or a deep dive into a specific neighborhood at a relaxed pace.</p>
              
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-[#E8B567] text-2xl font-serif">4 hours</span>
              </div>
              
              <div className="pt-6 border-t border-white/10 mt-6">
                <div className="text-[#8fa39c] text-sm mb-1">Total Estimated</div>
                <div className="font-serif text-4xl text-[#E8B567]">
                  <sup className="text-xl top-[-0.5em] mr-1">$</sup>{ratesLoading ? "…" : (usdPrice * 4).toFixed(0)}
                </div>
                <div className="text-[#8fa39c] text-xs mt-2 uppercase tracking-widest">≈ R${HOURLY_BRL * 4}</div>
              </div>
            </motion.div>

            {/* Full Day Package */}
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, delay: 0.1 }} className="bg-white/5 border border-white/10 p-10 lg:p-14 hover:bg-white/10 transition-colors">
              <div className="text-[0.7rem] tracking-[0.3em] uppercase text-[#8fa39c] mb-4">Comprehensive</div>
              <h3 className="font-serif text-3xl mb-6 text-white">Full-Day Experience</h3>
              <p className="text-[#bcc7c3] mb-8 min-h-[60px]">The ultimate Rio immersion. See the iconic sights, enjoy a local lunch, and uncover hidden gems without feeling rushed.</p>
              
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-[#E8B567] text-2xl font-serif">8 hours</span>
              </div>
              
              <div className="pt-6 border-t border-white/10 mt-6">
                <div className="text-[#8fa39c] text-sm mb-1">Total Estimated</div>
                <div className="font-serif text-4xl text-[#E8B567]">
                  <sup className="text-xl top-[-0.5em] mr-1">$</sup>{ratesLoading ? "…" : (usdPrice * 8).toFixed(0)}
                </div>
                <div className="text-[#8fa39c] text-xs mt-2 uppercase tracking-widest">≈ R${HOURLY_BRL * 8}</div>
              </div>
            </motion.div>
          </div>
          
          <div className="text-center mt-12 text-[#8fa39c] text-sm">
            Need a different duration? The base rate is <strong>${usdDisplay} (R${HOURLY_BRL}) per hour</strong>.
          </div>
        </div>
      </section>

      {/* The Process */}
      <section className="py-24 lg:py-32 px-6 lg:px-[7%] max-w-[1380px] mx-auto border-b border-[#14241F]/10" id="how">
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <div className="flex items-center gap-4 text-[0.7rem] tracking-[0.3em] uppercase text-[#C8633F] mb-8">
            <span className="font-serif italic text-2xl tracking-normal text-[#14241F] normal-case">04</span> The Process
          </div>
          <h2 className="font-serif text-4xl lg:text-5xl leading-[1.1] tracking-tight text-[#14241F] mb-16">
            From inquiry to <em className="text-[#C8633F] italic">arrival</em>,<br/> in four steps.
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {[
            { num: '01', title: 'Choose Your Hours', desc: 'Pick your date and select how many hours you’d like — 4h, 8h or a custom block.' },
            { num: '02', title: 'Share Your Interests', desc: 'Tell us your preferred language and what you’d love to experience in Rio.' },
            { num: '03', title: 'Receive Your Quote', desc: 'We confirm availability and send your personalized quote within hours.' },
            { num: '04', title: 'Meet Your Guide', desc: 'Your guide arrives ready to show you Rio exactly the way you want it.' }
          ].map((step, idx) => (
            <motion.div 
              key={idx}
              variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, delay: idx * 0.1 }}
              className={`lg:pr-8 ${idx !== 3 ? 'lg:border-r border-[#14241F]/10' : ''}`}
            >
              <span className="font-serif text-5xl text-[#2A6B4A] mb-6 block leading-none">{step.num}</span>
              <h3 className="font-serif text-xl text-[#14241F] mb-3">{step.title}</h3>
              <p className="text-[#555] text-sm leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Contact */}
      <section className="py-24 lg:py-32 px-6 lg:px-[7%] bg-white" id="contact">
        <div className="max-w-[1380px] mx-auto text-center mb-20">
          <div className="flex items-center justify-center gap-4 text-[0.7rem] tracking-[0.3em] uppercase text-[#C8633F] mb-6">
            <span className="font-serif italic text-2xl tracking-normal text-[#14241F] normal-case">05</span> Begin the Conversation
          </div>
          <h2 className="font-serif text-4xl lg:text-5xl leading-[1.1] tracking-tight text-[#14241F] max-w-2xl mx-auto mb-6">
            Ready to discover Rio <em className="italic text-[#C8633F]">your way?</em>
          </h2>
          <p className="text-lg text-[#555] max-w-2xl mx-auto">
            Message us on WhatsApp, or send a note below — we'll craft your custom hourly guide experience, tailored exclusively for you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 max-w-[1380px] mx-auto items-stretch">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="lg:col-span-5 bg-[#14241F] text-[#F4EFE6] p-10 lg:p-14 flex flex-col justify-between">
            <div>
              <div className="text-[0.7rem] tracking-[0.3em] uppercase text-[#E8B567] mb-6">Quickest reply</div>
              <h3 className="font-serif text-3xl lg:text-4xl leading-[1.15] mb-6 text-white">
                A direct line to your <em className="italic text-[#E8B567]">concierge</em>.
              </h3>
              <p className="text-[#bcc7c3] leading-relaxed mb-10">
                Chat with us on WhatsApp and receive a personalized quote within hours, from a real person on the ground in Rio.
              </p>
            </div>
            {contactPhone ? (
              <a href={waLink} target="_blank" rel="noopener noreferrer" className="bg-[#E8B567] text-[#14241F] px-8 py-5 text-xs tracking-widest uppercase font-medium flex justify-between items-center hover:bg-white transition-colors">
                <span>Request on WhatsApp</span>
                <ArrowRight size={18} />
              </a>
            ) : (
              <p className="text-[#8fa39c]">WhatsApp coming soon.</p>
            )}
          </motion.div>

          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, delay: 0.1 }} className="lg:col-span-7 bg-[#FBF8F2] p-10 lg:p-14 border border-[#14241F]/10">
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <div className="mb-2">
                <h3 className="font-serif text-3xl text-[#14241F] mb-2">Or send a note.</h3>
                <p className="text-[#6e6e6e] text-sm">We typically reply within a few hours.</p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="pg-name" className="block text-[0.65rem] font-medium tracking-[0.22em] uppercase text-[#14241F] mb-2">Name</label>
                  <input id="pg-name" name="name" required placeholder="Your full name" maxLength={100} className="w-full py-3 bg-transparent border-b border-[#14241F]/20 focus:border-[#14241F] outline-none transition-colors rounded-none" />
                </div>
                <div>
                  <label htmlFor="pg-email" className="block text-[0.65rem] font-medium tracking-[0.22em] uppercase text-[#14241F] mb-2">Email</label>
                  <input id="pg-email" name="email" type="email" required placeholder="you@email.com" maxLength={255} className="w-full py-3 bg-transparent border-b border-[#14241F]/20 focus:border-[#14241F] outline-none transition-colors rounded-none" />
                </div>
              </div>

              <div>
                <label htmlFor="pg-phone" className="block text-[0.65rem] font-medium tracking-[0.22em] uppercase text-[#14241F] mb-2">WhatsApp / Phone (optional)</label>
                <input id="pg-phone" name="phone" placeholder="+1 555 123 4567" maxLength={40} className="w-full py-3 bg-transparent border-b border-[#14241F]/20 focus:border-[#14241F] outline-none transition-colors rounded-none" />
              </div>

              <div>
                <label htmlFor="pg-msg" className="block text-[0.65rem] font-medium tracking-[0.22em] uppercase text-[#14241F] mb-2">Your message</label>
                <textarea id="pg-msg" name="message" required rows={4} placeholder="Tell us your dates, how many hours, and what you'd love to do in Rio." maxLength={1000} className="w-full py-3 bg-transparent border-b border-[#14241F]/20 focus:border-[#14241F] outline-none transition-colors resize-y min-h-[100px] rounded-none" />
              </div>

              <button type="submit" disabled={submitting} className="mt-4 bg-[#14241F] text-[#FBF8F2] py-5 px-8 text-xs tracking-[0.25em] uppercase font-medium hover:bg-[#2A6B4A] transition-colors disabled:opacity-50 flex items-center justify-center gap-3">
                {submitting ? "Sending…" : "Send Request"} { !submitting && <ArrowRight size={16} /> }
              </button>
            </form>
          </motion.div>
        </div>
      </section>

      {/* Footer Editorial */}
      <footer className="bg-[#14241F] text-[#8fa39c] py-16 px-6 lg:px-[7%] text-sm tracking-wide">
        <div className="max-w-[1380px] mx-auto flex flex-col md:flex-row justify-between items-center gap-8 pb-10 border-b border-white/10">
          <div className="flex items-center gap-4 text-[#F4EFE6] font-serif italic text-2xl">
            <img src="/logo.png" alt="Tocorime Rio" className="h-10 w-auto brightness-0 invert opacity-90" />
            Tocorime Rio
          </div>
          <div className="text-[0.7rem] tracking-[0.25em] uppercase text-center md:text-right">
            Private &amp; Custom · Rio de Janeiro
          </div>
        </div>
        <div className="max-w-[1380px] mx-auto text-center mt-8 text-[0.7rem] tracking-[0.2em] uppercase opacity-70">
          © {new Date().getFullYear()} Tocorime Rio · All rights reserved
        </div>
      </footer>
    </div>
  );
}