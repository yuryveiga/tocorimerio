import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { useSiteData } from "@/hooks/useSiteData";
import { useCurrency } from "@/contexts/CurrencyContext";
import { buildWhatsappLink } from "@/lib/whatsappMessage";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
    document.body.style.background = "#fff";
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

  return (
    <>
      <Helmet>
        <html lang="en" />
        <title>Private Hourly Guide in Rio de Janeiro | Tocorime Rio</title>
        <meta name="description" content="Hire a licensed, bilingual private guide in Rio de Janeiro by the hour. Custom itineraries, total flexibility, 4h minimum." />
        <link rel="canonical" href="https://tocorimerio.com/your-private-guide-in-rio" />
        <meta property="og:title" content="Private Hourly Guide in Rio de Janeiro | Tocorime Rio" />
        <meta property="og:description" content="A licensed, bilingual local guide at your full disposal — no fixed itineraries, no rush, no tourist traps." />
        <meta property="og:url" content="https://tocorimerio.com/your-private-guide-in-rio" />
        <meta property="og:image" content="https://tocorimerio.com/og-image.jpg" />
      </Helmet>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Inter:wght@300;400;500;600&display=swap');
        .pg-root{--orange:#C8633F;--dark:#14241F;--green:#2A6B4A;--cream:#F4EFE6;--paper:#FBF8F2;--ink:#1A1A1A;--muted:#6e6e6e;--rule:#1A1A1A;font-family:'Inter',sans-serif;color:var(--ink);line-height:1.65;background:var(--paper);-webkit-font-smoothing:antialiased;}
        .pg-root *{box-sizing:border-box}
        .pg-serif{font-family:'Playfair Display',Georgia,serif}
        .pg-topbar{border-bottom:1px solid rgba(20,36,31,.15);text-align:center;font-size:.7rem;padding:9px 20px;letter-spacing:.25em;text-transform:uppercase;color:var(--dark);background:var(--paper)}
        .pg-header{display:flex;justify-content:space-between;align-items:center;padding:22px 7%;border-bottom:1px solid rgba(20,36,31,.12)}
        .pg-logo{display:flex;align-items:center;gap:12px;font-family:'Playfair Display',serif;font-size:1.35rem;color:var(--dark);text-decoration:none;letter-spacing:.02em}
        .pg-logo img{height:54px;width:auto;display:block}
        .pg-nav{display:flex;align-items:center;gap:34px}
        .pg-nav a{text-decoration:none;color:var(--dark);font-size:.78rem;text-transform:uppercase;letter-spacing:.2em}
        .pg-book-btn{border:1px solid var(--dark);padding:11px 22px !important;border-radius:0 !important;transition:all .2s}
        .pg-book-btn:hover{background:var(--dark);color:var(--paper) !important}
        /* HERO – ultra-wide editorial cover */
        .pg-hero{position:relative;min-height:88vh;display:flex;align-items:flex-end;color:#fff;background:linear-gradient(180deg,rgba(20,36,31,.15) 0%,rgba(20,36,31,.15) 45%,rgba(20,36,31,.78) 100%),url('https://images.unsplash.com/photo-1483729558449-99ef09a8c325?q=80&w=2000&auto=format&fit=crop') center/cover no-repeat}
        .pg-hero-inner{width:100%;padding:0 7% 70px;display:grid;grid-template-columns:1fr auto;gap:40px;align-items:end}
        .pg-hero-meta{font-size:.7rem;letter-spacing:.3em;text-transform:uppercase;opacity:.85;margin-bottom:24px;display:flex;align-items:center;gap:14px}
        .pg-hero-meta::before{content:'';width:50px;height:1px;background:#fff}
        .pg-hero h1{font-family:'Playfair Display',serif;font-weight:400;font-size:clamp(2.6rem,6vw,5.6rem);line-height:1.02;letter-spacing:-.015em;max-width:14ch;margin:0 0 8px}
        .pg-hero h1 em{font-style:italic;color:#E8B567}
        .pg-hero-tag{font-size:.78rem;letter-spacing:.25em;text-transform:uppercase;text-align:right;max-width:280px;line-height:1.7;opacity:.9}
        .pg-hero-tag strong{display:block;font-family:'Playfair Display',serif;font-style:italic;font-size:1.3rem;text-transform:none;letter-spacing:0;margin-bottom:6px;color:#E8B567;font-weight:400}
        .pg-scroll-cue{position:absolute;left:7%;bottom:30px;font-size:.65rem;letter-spacing:.3em;text-transform:uppercase;opacity:.7}
        /* Marquee strip */
        .pg-strip{display:flex;justify-content:space-between;align-items:center;padding:22px 7%;border-bottom:1px solid rgba(20,36,31,.12);font-size:.7rem;letter-spacing:.22em;text-transform:uppercase;color:var(--muted);flex-wrap:wrap;gap:20px}
        .pg-strip span{white-space:nowrap}
        /* Editorial section grid */
        .pg-section{padding:130px 7%;max-width:1380px;margin:0 auto;position:relative}
        .pg-eyebrow{display:flex;align-items:center;gap:18px;font-size:.7rem;letter-spacing:.3em;text-transform:uppercase;color:var(--orange);margin-bottom:32px}
        .pg-eyebrow .pg-chap{font-family:'Playfair Display',serif;font-style:italic;font-size:1.4rem;letter-spacing:0;text-transform:none;color:var(--dark);font-weight:400}
        .pg-h2{font-family:'Playfair Display',serif;font-weight:400;font-size:clamp(2rem,4vw,3.4rem);line-height:1.1;letter-spacing:-.01em;color:var(--dark);margin:0 0 28px;max-width:18ch}
        .pg-h2 em{font-style:italic;color:var(--green)}
        .pg-lead{font-size:1.05rem;color:#3a3a3a;max-width:54ch;line-height:1.7}
        /* Two-column intro */
        .pg-intro-grid{display:grid;grid-template-columns:5fr 4fr;gap:80px;align-items:start}
        .pg-intro-grid .pg-lead{font-size:1.15rem;border-left:1px solid rgba(20,36,31,.18);padding-left:30px}
        /* Features – editorial three-up with rules */
        .pg-features{display:grid;grid-template-columns:repeat(3,1fr);gap:0;margin-top:80px;border-top:1px solid rgba(20,36,31,.18)}
        .pg-feature{padding:48px 36px 10px;border-right:1px solid rgba(20,36,31,.18);position:relative}
        .pg-feature:last-child{border-right:0}
        .pg-feature .pg-num{font-family:'Playfair Display',serif;font-style:italic;font-size:1rem;color:var(--orange);margin-bottom:20px;display:block;letter-spacing:.05em}
        .pg-feature h3{font-family:'Playfair Display',serif;font-weight:400;font-size:1.55rem;line-height:1.2;color:var(--dark);margin:0 0 14px}
        .pg-feature p{color:#555;font-size:.95rem;line-height:1.7}
        /* Included – asymmetric */
        .pg-included-wrap{display:grid;grid-template-columns:1fr 1fr;gap:80px;margin-top:60px}
        .pg-card h3{font-family:'Playfair Display',serif;font-weight:400;font-size:1.5rem;color:var(--dark);margin:0 0 22px;padding-bottom:18px;border-bottom:1px solid rgba(20,36,31,.18);display:flex;align-items:baseline;justify-content:space-between}
        .pg-card h3 small{font-family:'Inter',sans-serif;font-size:.65rem;letter-spacing:.3em;text-transform:uppercase;color:var(--muted)}
        .pg-card ul{list-style:none;padding:0;margin:0}
        .pg-card li{padding:14px 0;padding-left:32px;position:relative;color:#2a2a2a;font-size:.97rem;border-bottom:1px solid rgba(20,36,31,.08);line-height:1.5}
        .pg-card.yes li::before{content:'+';position:absolute;left:0;top:13px;color:var(--green);font-size:1.2rem;font-weight:300}
        .pg-card.no li::before{content:'—';position:absolute;left:0;top:13px;color:var(--orange);font-size:.9rem}
        /* Process: numbered chapters */
        .pg-steps{display:grid;grid-template-columns:repeat(4,1fr);gap:0;margin-top:60px;border-top:1px solid rgba(20,36,31,.18)}
        .pg-step{padding:46px 28px 10px;border-right:1px solid rgba(20,36,31,.18);position:relative}
        .pg-step:last-child{border-right:0}
        .pg-step .pg-num{font-family:'Playfair Display',serif;font-size:3.5rem;font-weight:400;color:var(--green);line-height:1;margin-bottom:18px;display:block}
        .pg-step h3{font-family:'Playfair Display',serif;font-weight:400;font-size:1.25rem;color:var(--dark);margin:0 0 10px;line-height:1.25}
        .pg-step p{color:#555;font-size:.92rem;line-height:1.65}
        /* Price – grand statement */
        .pg-price-section{background:var(--dark);color:#F4EFE6;padding:120px 7%;margin-top:30px;position:relative;overflow:hidden}
        .pg-price-inner{max-width:1380px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:80px;align-items:center}
        .pg-price-section .pg-eyebrow{color:#E8B567;margin-bottom:24px}
        .pg-price-section .pg-eyebrow .pg-chap{color:#F4EFE6}
        .pg-price-section .pg-h2{color:#F4EFE6}
        .pg-price-section p{color:#bcc7c3;max-width:46ch;line-height:1.75}
        .pg-price-display{text-align:right;border-left:1px solid rgba(244,239,230,.2);padding-left:60px}
        .pg-price-display .pg-pre{font-size:.7rem;letter-spacing:.3em;text-transform:uppercase;color:#8fa39c;margin-bottom:12px}
        .pg-price-display .pg-amt{font-family:'Playfair Display',serif;font-size:clamp(5rem,12vw,9rem);line-height:.95;color:#E8B567;letter-spacing:-.04em;font-weight:400}
        .pg-price-display .pg-amt sup{font-size:.35em;vertical-align:top;margin-right:8px;color:#E8B567}
        .pg-price-display .pg-unit{font-family:'Playfair Display',serif;font-style:italic;font-size:1.3rem;color:#F4EFE6;margin-top:16px}
        .pg-price-display .pg-sub{font-size:.7rem;letter-spacing:.25em;text-transform:uppercase;color:#8fa39c;margin-top:14px}
        /* Contact – cover envelope */
        .pg-final{background:var(--cream);padding:130px 7%}
        .pg-final-head{max-width:1380px;margin:0 auto 80px;text-align:center}
        .pg-final-head .pg-eyebrow{justify-content:center}
        .pg-final-head h2{font-family:'Playfair Display',serif;font-weight:400;font-size:clamp(2.2rem,5vw,4rem);line-height:1.05;color:var(--dark);margin:0 auto;max-width:18ch;letter-spacing:-.015em}
        .pg-final-head h2 em{font-style:italic;color:var(--orange)}
        .pg-final-head .pg-sub{margin-top:24px;color:#555;max-width:50ch;margin-left:auto;margin-right:auto;font-size:1.05rem}
        .pg-contact-grid{display:grid;grid-template-columns:1fr 1.3fr;gap:60px;max-width:1380px;margin:0 auto;align-items:stretch}
        .pg-wa-card{background:var(--dark);color:#F4EFE6;padding:50px 44px;display:flex;flex-direction:column;justify-content:space-between;gap:30px}
        .pg-wa-card .pg-eyebrow{color:#E8B567}
        .pg-wa-card h3{font-family:'Playfair Display',serif;font-weight:400;font-size:2rem;line-height:1.15;margin:0 0 16px;color:#F4EFE6}
        .pg-wa-card h3 em{font-style:italic;color:#E8B567}
        .pg-wa-card p{color:#bcc7c3;font-size:.95rem;line-height:1.7}
        .pg-wa-btn{background:#E8B567;color:var(--dark) !important;padding:18px 32px;text-decoration:none;font-size:.78rem;letter-spacing:.25em;text-transform:uppercase;font-weight:500;display:inline-flex;align-items:center;justify-content:space-between;border:0;transition:all .2s}
        .pg-wa-btn:hover{background:#fff}
        .pg-wa-btn span:last-child{font-family:'Playfair Display',serif;font-style:italic;font-size:1.1rem;letter-spacing:0;text-transform:none;font-weight:400}
        .pg-form{background:var(--paper);padding:50px 44px;display:flex;flex-direction:column;gap:22px;border:1px solid rgba(20,36,31,.12)}
        .pg-form .pg-form-head{margin-bottom:8px}
        .pg-form .pg-form-head h3{font-family:'Playfair Display',serif;font-weight:400;font-size:1.7rem;color:var(--dark);margin:0 0 6px}
        .pg-form .pg-form-head p{font-size:.88rem;color:var(--muted)}
        .pg-form label{font-size:.65rem;color:var(--dark);font-weight:500;letter-spacing:.22em;text-transform:uppercase;display:block;margin-bottom:8px}
        .pg-form input,.pg-form textarea{width:100%;padding:12px 0;border:0;border-bottom:1px solid rgba(20,36,31,.25);border-radius:0;font-family:'Inter',sans-serif;font-size:1rem;background:transparent;color:var(--dark);transition:border-color .2s}
        .pg-form input:focus,.pg-form textarea:focus{outline:0;border-bottom-color:var(--dark)}
        .pg-form textarea{resize:vertical;min-height:90px}
        .pg-form button{background:var(--dark);color:var(--paper);padding:18px;border:0;font-size:.78rem;letter-spacing:.25em;text-transform:uppercase;font-weight:500;cursor:pointer;margin-top:10px;transition:background .2s}
        .pg-form button:hover{background:var(--green)}
        .pg-form button:disabled{opacity:.6;cursor:not-allowed}
        /* Footer editorial */
        .pg-footer{background:var(--dark);color:#8fa39c;padding:70px 7% 40px;font-size:.78rem;letter-spacing:.05em;border-top:1px solid rgba(244,239,230,.08)}
        .pg-footer-grid{max-width:1380px;margin:0 auto;display:flex;justify-content:space-between;align-items:baseline;flex-wrap:wrap;gap:30px;padding-bottom:30px;border-bottom:1px solid rgba(244,239,230,.1)}
        .pg-footer .pg-brand{color:#F4EFE6;font-family:'Playfair Display',serif;font-style:italic;font-size:1.6rem;font-weight:400}
        .pg-footer-copy{max-width:1380px;margin:30px auto 0;text-align:center;font-size:.7rem;letter-spacing:.2em;text-transform:uppercase;opacity:.7}
        /* Responsive */
        @media(max-width:900px){
          .pg-nav a:not(.pg-book-btn){display:none}
          .pg-hero-inner{grid-template-columns:1fr;padding-bottom:50px}
          .pg-hero-tag{text-align:left;max-width:none}
          .pg-intro-grid,.pg-included-wrap,.pg-price-inner,.pg-contact-grid{grid-template-columns:1fr;gap:40px}
          .pg-features{grid-template-columns:1fr}
          .pg-feature,.pg-step{border-right:0;border-bottom:1px solid rgba(20,36,31,.18)}
          .pg-steps{grid-template-columns:1fr 1fr}
          .pg-section{padding:80px 7%}
          .pg-price-section{padding:80px 7%}
          .pg-price-display{text-align:left;border-left:0;border-top:1px solid rgba(244,239,230,.2);padding:40px 0 0}
          .pg-final{padding:80px 7%}
          .pg-wa-card,.pg-form{padding:36px 28px}
        }
        @media(max-width:600px){.pg-steps{grid-template-columns:1fr}}
      `}</style>

      <div className="pg-root">
        <div className="pg-topbar">An Editorial Travel Journal · Volume I · Rio de Janeiro</div>

        <header className="pg-header">
          <Link to="/" className="pg-logo"><img src="/logo.png" alt="Tocorime Rio" /> <span>Tocorime Rio</span></Link>
          <nav className="pg-nav">
            <Link to="/">Home</Link>
            <Link to="/our-tours">Tours</Link>
            <a href="#contact">Contact</a>
            <a className="pg-book-btn" href={waLink} target="_blank" rel="noopener noreferrer">Book Now</a>
          </nav>
        </header>

        <section className="pg-hero">
          <div className="pg-hero-inner">
            <div>
              <div className="pg-hero-meta">Chapter 01 · Private Experiences</div>
              <h1>Your Private Guide <em>in Rio</em>, hour by hour.</h1>
            </div>
            <div className="pg-hero-tag">
              <strong>Issue Nº 01</strong>
              A licensed, bilingual local at your full disposal — no fixed itineraries, no rush, no tourist traps.
            </div>
          </div>
          <div className="pg-scroll-cue">↓ Begin the story</div>
        </section>

        <div className="pg-strip">
          <span>★ 5.0 TripAdvisor</span>
          <span>Cadastur Certified</span>
          <span>Bilingual Local Guides</span>
          <span>Secure Payment</span>
          <span>2,000+ Travelers</span>
        </div>

        <section className="pg-section">
          <div className="pg-eyebrow"><span className="pg-chap">01</span> The Premise</div>
          <div className="pg-intro-grid">
            <h2 className="pg-h2">Rio, <em>entirely</em><br/>on your terms.</h2>
            <p className="pg-lead">Whether you want to dig into local culture, see the iconic landmarks, find the best restaurants, or simply have a trusted local handling logistics — you set the pace, we handle the way.</p>
          </div>

          <div className="pg-features">
            <div className="pg-feature">
              <span className="pg-num">i.</span>
              <h3>Total Flexibility</h3>
              <p>Hire for as many hours as you need, minimum four. Morning, afternoon, evening, or a full day exploring the city.</p>
            </div>
            <div className="pg-feature">
              <span className="pg-num">ii.</span>
              <h3>Fully Customized Route</h3>
              <p>We help you plan a smart, efficient itinerary — or simply accompany you through your own plans with real local insight.</p>
            </div>
            <div className="pg-feature">
              <span className="pg-num">iii.</span>
              <h3>Stress-Free Logistics</h3>
              <p>No language barriers, no wrong turns, no overpriced tourist traps — just a trusted local making sure your day runs smoothly.</p>
            </div>
          </div>
        </section>

        <section className="pg-section">
          <div className="pg-eyebrow"><span className="pg-chap">02</span> The Particulars</div>
          <h2 className="pg-h2">What is, and isn't, <em>included</em>.</h2>

          <div className="pg-included-wrap">
            <div className="pg-card yes">
              <h3>Included <small>What you'll receive</small></h3>
              <ul>
                <li>Exclusive accompaniment by a licensed, certified guide</li>
                <li>Personalized itinerary planning before your tour</li>
                <li>Your choice of language — English, Portuguese or Spanish</li>
                <li>Local recommendations and insider tips along the way</li>
              </ul>
            </div>
            <div className="pg-card no">
              <h3>Not Included <small>Plan accordingly</small></h3>
              <ul>
                <li>Tickets to attractions (Christ the Redeemer, cable car, etc.)</li>
                <li>Transportation, unless a private car add-on is booked</li>
                <li>Meals for guest and guide during the tour</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="pg-section" id="how">
          <div className="pg-eyebrow"><span className="pg-chap">03</span> The Process</div>
          <h2 className="pg-h2">From inquiry to <em>arrival</em>, in four steps.</h2>

          <div className="pg-steps">
            <div className="pg-step"><span className="pg-num">01</span><h3>Choose Your Hours</h3><p>Pick your date and select how many hours you'd like — 4h, 6h, 8h or a custom block.</p></div>
            <div className="pg-step"><span className="pg-num">02</span><h3>Share Your Interests</h3><p>Tell us your preferred language and what you'd love to experience in Rio.</p></div>
            <div className="pg-step"><span className="pg-num">03</span><h3>Receive Your Quote</h3><p>We confirm availability and send your personalized quote within hours.</p></div>
            <div className="pg-step"><span className="pg-num">04</span><h3>Meet Your Guide</h3><p>Your guide arrives ready to show you Rio exactly the way you want it.</p></div>
          </div>
        </section>

        <section className="pg-price-section">
          <div className="pg-price-inner">
            <div>
              <div className="pg-eyebrow"><span className="pg-chap">04</span> The Investment</div>
              <h2 className="pg-h2">Hourly rates,<br/><em>boundless</em> days.</h2>
              <p>Private, exclusive, and tailored entirely to you — the perfect way to make the most of your time in Rio. Four-hour minimum, no hidden fees.</p>
            </div>
            <div className="pg-price-display">
              <div className="pg-pre">Starting from</div>
              <div className="pg-amt"><sup>$</sup>{ratesLoading ? "…" : usdPrice.toFixed(0)}</div>
              <div className="pg-unit">per hour</div>
              <div className="pg-sub">≈ R${HOURLY_BRL} · 4 hour minimum</div>
            </div>
          </div>
        </section>

        <section className="pg-final" id="contact">
          <div className="pg-final-head">
            <div className="pg-eyebrow"><span className="pg-chap">05</span> Begin the Conversation</div>
            <h2>Ready to discover Rio <em>your way?</em></h2>
            <p className="pg-sub">Message us on WhatsApp, or send a note below — we'll craft your custom hourly guide experience, tailored exclusively for you.</p>
          </div>

          <div className="pg-contact-grid">
            <div className="pg-wa-card">
              <div>
                <div className="pg-eyebrow" style={{marginBottom:18}}>Quickest reply</div>
                <h3>A direct line to your <em>concierge</em>.</h3>
                <p>Chat with us on WhatsApp and receive a personalized quote within hours, from a real person on the ground in Rio.</p>
              </div>
              {contactPhone ? (
                <a className="pg-wa-btn" href={waLink} target="_blank" rel="noopener noreferrer">
                  <span>Request on WhatsApp</span>
                  <span>→</span>
                </a>
              ) : (
                <p>WhatsApp coming soon.</p>
              )}
            </div>

            <form className="pg-form" onSubmit={handleSubmit}>
              <div className="pg-form-head">
                <h3>Or send a note.</h3>
                <p>We typically reply within a few hours.</p>
              </div>
              <div>
                <label htmlFor="pg-name">Name</label>
                <input id="pg-name" name="name" required placeholder="Your full name" maxLength={100} />
              </div>
              <div>
                <label htmlFor="pg-email">Email</label>
                <input id="pg-email" name="email" type="email" required placeholder="you@email.com" maxLength={255} />
              </div>
              <div>
                <label htmlFor="pg-phone">WhatsApp / Phone (optional)</label>
                <input id="pg-phone" name="phone" placeholder="+1 555 123 4567" maxLength={40} />
              </div>
              <div>
                <label htmlFor="pg-msg">Your message</label>
                <textarea id="pg-msg" name="message" required rows={4} placeholder="Tell us your dates, how many hours, and what you'd love to do in Rio." maxLength={1000} />
              </div>
              <button type="submit" disabled={submitting}>{submitting ? "Sending…" : "Send Request →"}</button>
            </form>
          </div>
        </section>

        <footer className="pg-footer">
          <div className="pg-footer-grid">
            <div className="pg-brand" style={{display:'flex',alignItems:'center',gap:14}}>
              <img src="/logo.png" alt="Tocorime Rio" style={{height:42,width:'auto',filter:'brightness(0) invert(1)',opacity:.95}} />
              Tocorime Rio
            </div>
            <div style={{letterSpacing:'.25em',textTransform:'uppercase',fontSize:'.7rem'}}>Private &amp; Custom · Rio de Janeiro</div>
          </div>
          <div className="pg-footer-copy">© {new Date().getFullYear()} Tocorime Rio · All rights reserved</div>
        </footer>
      </div>
    </>
  );
}