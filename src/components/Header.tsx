import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Menu from "lucide-react/dist/esm/icons/menu";
import X from "lucide-react/dist/esm/icons/x";
import Instagram from "lucide-react/dist/esm/icons/instagram";
import MapPin from "lucide-react/dist/esm/icons/map-pin";
import Phone from "lucide-react/dist/esm/icons/phone";
import Mail from "lucide-react/dist/esm/icons/mail";
import Music from "lucide-react/dist/esm/icons/music";
import Facebook from "lucide-react/dist/esm/icons/facebook";
import Youtube from "lucide-react/dist/esm/icons/youtube";
import Globe from "lucide-react/dist/esm/icons/globe";
import ShoppingCart from "lucide-react/dist/esm/icons/shopping-cart";
import ChevronDown from "lucide-react/dist/esm/icons/chevron-down";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSiteData } from "@/hooks/useSiteData";
import { useLocale } from "@/contexts/LocaleContext";
import { OptimizedImage } from "./OptimizedImage";
import { useCart } from "@/contexts/CartContext";
import { UrgencyBar } from "./UrgencyBar";

const iconMap: Record<string, React.ElementType> = {
  Instagram, MapPin, Phone, Mail, Music, Facebook, Youtube,
};

export function Header({ forceLanguage }: { forceLanguage?: 'pt' | 'en' | 'es' }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { pages, socialMedia, images, siteSettings } = useSiteData();
  const { language: contextLanguage, setLanguage, currency, setCurrency, t: contextT } = useLocale();
  const whatsappSocial = socialMedia.find(s => s.platform.toLowerCase().includes('whatsapp') || (s.icon_name && s.icon_name.toLowerCase().includes('phone')));
  const tripAdvisorSocial = socialMedia.find(s => s.platform.toLowerCase().includes('tripadvisor') && s.is_active !== false);
  
  const language = forceLanguage || contextLanguage;
  
  // Custom T function that respects forceLanguage
  const t = (key: string) => {
    // If we have a forced language, we need a way to get translations for it.
    // The current t function from context uses the context language.
    // However, for simplicity, we can just use contextT if no forceLanguage is provided.
    // If forceLanguage is provided, we'd need a more complex translation system.
    // For now, let's just use the contextT and rely on the fact that if forceLanguage is used,
    // the page itself should probably also set the context language on mount.
    return contextT(key);
  };
  const { items } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setMounted(true);
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrolled = window.scrollY > 20;
          setIsScrolled((prev) => {
            if (prev !== scrolled) return scrolled;
            return prev;
          });
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNav = (href: string) => {
    setIsMenuOpen(false);
    
    // Internal links (CMS pages or Blog)
    if (href.startsWith("/") || !href.startsWith("#")) {
       navigate(href);
       window.scrollTo({ top: 0, behavior: "smooth" });
       return;
    }

    // Anchor links
    if (href.startsWith("#")) {
      const id = href.replace("#", "");
      if (location.pathname !== "/") {
        navigate("/" + href);
      } else {
        if (id === "top") {
          window.scrollTo({ top: 0, behavior: "smooth" });
        } else {
          document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
        }
      }
    }
  };

  const allNavLinks = useMemo(() => {
    const hrefRemap: Record<string, string> = {
      "#about": "/about-us",
      "#contact": "/contact",
    };

    const navLinks = [
      { label: t("inicio"), href: "#top" },
      { label: t("passeios"), href: "#tours" },
      { label: t("sobre"), href: "/about-us" },
      { label: t("contato"), href: "/contact" },
      { label: "Blog", href: "/blog" },
    ];

    const staticHrefs = navLinks.map(l => l.href);
    const filteredDynamicLinks = pages
      .map(p => ({ label: p.title, href: hrefRemap[p.href] ?? p.href }))
      .filter(link => !staticHrefs.includes(link.href));

    return [...navLinks, ...filteredDynamicLinks];
  }, [pages, t]);

  const activeSocials = useMemo(() => {
    return socialMedia.filter(s => s.show_in_header !== false && s.platform.toLowerCase() !== 'email').length > 0
      ? socialMedia
          .filter(s => s.show_in_header !== false && s.platform.toLowerCase() !== 'email')
          .sort((a, b) => (a.sort_order ?? 999) - (b.sort_order ?? 999))
          .map((s) => ({ platform: s.platform, url: s.url, icon: iconMap[s.icon_name] || MapPin }))
      : [
          { platform: "instagram", url: "https://www.instagram.com/passeiorio/", icon: Instagram },
          { platform: "tripadvisor", url: "https://www.tripadvisor.com.br/", icon: MapPin },
        ];
  }, [socialMedia]);


  console.log("socialMedia:", socialMedia);

  const logoUrl = images["logo"] || "https://ogzasprtfgimjqrtcseg.supabase.co/storage/v1/object/public/site-images/images__1_-removebg-preview.png";

  const showCart = !siteSettings?.hide_prices || items.length > 0;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
      <div className="pointer-events-auto">
        <UrgencyBar />
      </div>
      <header className={`pointer-events-auto transition-all duration-300 ${isScrolled ? "bg-background/95 backdrop-blur-md shadow-md py-1" : "bg-background/80 backdrop-blur-sm py-2.5 border-b border-border/50"}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 md:h-26">
          <Link to="/" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="flex items-center gap-2 group">
            {logoUrl ? (
              <div className={`relative flex items-center justify-center ${isScrolled ? "h-11 w-11 md:h-12 md:w-12 mt-1" : "h-16 w-16 md:h-22 md:w-22"} transition-all duration-500 ease-in-out`}>
              <OptimizedImage 
                src={siteSettings?.logo_url || logoUrl} 
                alt="Tocorime Rio - Passeios Privados no Rio de Janeiro" 
                fit="contain"
                className="w-full h-full object-contain filter drop-shadow-sm transition-transform duration-500" 
              />
            </div>) : (
              <div className="w-16 h-16 md:h-22 md:w-22 bg-primary flex items-center justify-center group-hover:scale-105 transition-transform">
                <span className="text-primary-foreground font-bold text-2xl font-sans">P</span>
              </div>
            )}
            <span className={`font-serif font-bold tracking-tight transition-all duration-500 ${isScrolled ? "text-lg text-foreground" : "text-xl text-foreground"} hidden sm:block ml-1 group-hover:text-primary`}>Tocorime Rio</span>
          </Link>

          {/* TripAdvisor link (mobile only, next to the logo) */}
          {tripAdvisorSocial && (
            <a
              href={tripAdvisorSocial.url}
              target="_blank"
              rel="noopener noreferrer"
              className="lg:hidden flex items-center gap-1 shrink-0 ml-1 mr-auto h-7 px-2 rounded-full bg-[#00AA6C]/10 border border-[#00AA6C]/30 text-[#00754F]"
              aria-label="TripAdvisor"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor" aria-hidden="true">
                <circle cx="7.2" cy="12" r="2.1" />
                <circle cx="16.8" cy="12" r="2.1" />
                <path d="M12 5.4c-3.2 0-6 .9-8.1 2.2H0l1.9 2.1A5.9 5.9 0 0 0 7.2 19a5.8 5.8 0 0 0 4.8-2.5A5.8 5.8 0 0 0 16.8 19a5.9 5.9 0 0 0 5.3-9.3L24 7.6h-3.9C18 6.3 15.2 5.4 12 5.4Zm-4.8 11.7a5.1 5.1 0 1 1 0-10.2 5.1 5.1 0 0 1 0 10.2Zm9.6 0a5.1 5.1 0 1 1 0-10.2 5.1 5.1 0 0 1 0 10.2Z" />
              </svg>
              <span className="text-[10px] font-bold tracking-tight">Tripadvisor</span>
            </a>
          )}

          <nav className="hidden lg:flex items-center gap-6">
            {allNavLinks.map((link) => (
              <Link 
                key={link.label} 
                to={link.href}
                onClick={(e) => {
                  if (link.href.startsWith("#")) {
                    e.preventDefault();
                    handleNav(link.href);
                  } else {
                    setIsMenuOpen(false);
                  }
                }}
                className={`text-sm font-semibold font-sans transition-all hover:text-primary relative group ${location.pathname === link.href ? "text-primary" : "text-foreground/80"}`}
              >
                {link.label}
                <span className={`absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full ${location.pathname === link.href ? "w-full" : ""}`}></span>
              </Link>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-6 min-w-[260px] justify-end">
            {mounted && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button 
                    className="flex items-center gap-1.5 text-xs font-bold hover:text-primary transition-colors outline-none h-9 px-3 rounded-full border border-border/50 hover:bg-primary/5"
                    aria-label={language === 'pt' ? "Preferências" : "Preferences"}
                  >
                    <Globe className="w-4 h-4 opacity-70" />
                    <span className="uppercase">{language}</span>
                    <span className="text-muted-foreground/30 mx-0.5">|</span>
                    <span className="uppercase">{currency}</span>
                    <ChevronDown className="w-3 h-3 opacity-50" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[180px] rounded-2xl p-2 shadow-2xl border-primary/10">
                  <div className="px-2 py-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">{t("idioma") || "Idioma"}</div>
                  <DropdownMenuItem onClick={() => setLanguage('pt')} className="gap-2 font-bold text-xs rounded-lg cursor-pointer">
                    <span>🇧🇷</span> Português
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLanguage('en')} className="gap-2 font-bold text-xs rounded-lg cursor-pointer">
                    <span>🇺🇸</span> English
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLanguage('es')} className="gap-2 font-bold text-xs rounded-lg cursor-pointer">
                    <span>🇪🇸</span> Español
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLanguage('zh-CN')} className="gap-2 font-bold text-xs rounded-lg cursor-pointer">
                    <span>🇨🇳</span> 简体中文
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLanguage('zh-TW')} className="gap-2 font-bold text-xs rounded-lg cursor-pointer">
                    <span>🇹🇼</span> 繁體中文
                  </DropdownMenuItem>
                  
                  <div className="h-px bg-border/50 my-2" />
                  
                  <div className="px-2 py-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">{t("moeda") || "Moeda"}</div>
                  <DropdownMenuItem onClick={() => setCurrency('BRL')} className="gap-2 font-bold text-xs rounded-lg cursor-pointer">
                    <span className="w-4 text-center">R$</span> BRL
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setCurrency('USD')} className="gap-2 font-bold text-xs rounded-lg cursor-pointer">
                    <span className="w-4 text-center">$</span> USD
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setCurrency('EUR')} className="gap-2 font-bold text-xs rounded-lg cursor-pointer">
                    <span className="w-4 text-center">€</span> EUR
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setCurrency('CNY')} className="gap-2 font-bold text-xs rounded-lg cursor-pointer">
                    <span className="w-4 text-center">¥</span> CNY
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {showCart && (
              <Link to="/carrinho" className="relative group" aria-label={t("meu_carrinho")}>
                <div className="p-2 transition-transform active:scale-95 text-foreground/80 hover:text-primary">
                  <ShoppingCart className="w-6 h-6" />
                  {mounted && items.length > 0 && (
                    <span className="absolute top-0 right-0 bg-primary text-white text-[10px] font-black h-4 w-4 rounded-full flex items-center justify-center animate-bounce shadow-sm">
                      {items.length}
                    </span>
                  )}
                </div>
              </Link>
            )}

            {whatsappSocial && (() => {
              const waNumber = whatsappSocial.url.replace(/[^0-9]/g, '') || '5521970702523';
              const waLink = whatsappSocial.url.startsWith('http') ? whatsappSocial.url : `https://wa.me/${waNumber}`;
              return (
                <a 
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-2 font-bold px-4 h-10 rounded-full transition-all duration-300 text-[#25D366] bg-[#25D366]/10 hover:bg-[#25D366] hover:text-white border border-[#25D366]/20 hover:shadow-lg hover:shadow-[#25D366]/30 ${isScrolled ? "scale-95" : ""}`}
                  aria-label="WhatsApp"
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  <span className="text-xs tracking-wider">WHATSAPP</span>
                </a>
              );
            })()}

            <Button 
              onClick={() => handleNav("#tours")} 
              size="sm" 
              className={`font-bold px-6 h-10 rounded-full transition-all duration-500 ${isScrolled ? "shadow-[0_0_20px_rgba(231,111,81,0.4)] scale-105" : "shadow-lg shadow-primary/20"}`}
            >
              {t("reservar")}
            </Button>
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            {showCart && (
              <Link to="/carrinho" className="relative mr-2">
                 <div className="p-2 text-foreground/80">
                  <ShoppingCart className="w-6 h-6" />
                  {mounted && items.length > 0 && (
                    <span className="absolute top-0 right-0 bg-primary text-white text-[10px] font-black h-4 w-4 rounded-full flex items-center justify-center shadow-sm">
                      {items.length}
                    </span>
                  )}
                </div>
              </Link>
            )}
            {mounted && (
              <div className="flex items-center border border-border rounded-full px-1.5 py-1 bg-muted/30">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button 
                      className="flex items-center gap-1 text-[12px] font-bold px-2 py-1.5 outline-none"
                      aria-label={language === 'pt' ? "Alterar idioma" : "Change language"}
                    >
                      <span>{language === 'pt' ? '🇧🇷' : language === 'en' ? '🇺🇸' : language === 'es' ? '🇪🇸' : language === 'zh-CN' ? '🇨🇳' : '🇹🇼'}</span>
                      <span className="uppercase">{language === 'zh-CN' ? 'ZH' : language === 'zh-TW' ? '繁' : language}</span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-[110px] rounded-xl p-1 shadow-xl border-primary/10">
                    <DropdownMenuItem onClick={() => setLanguage('pt')} className="gap-2 font-bold text-[12px] rounded-lg cursor-pointer">
                      <span>🇧🇷</span> PT
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setLanguage('en')} className="gap-2 font-bold text-[12px] rounded-lg cursor-pointer">
                      <span>🇺🇸</span> EN
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setLanguage('es')} className="gap-2 font-bold text-[12px] rounded-lg cursor-pointer">
                      <span>🇪🇸</span> ES
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setLanguage('zh-CN')} className="gap-2 font-bold text-[12px] rounded-lg cursor-pointer">
                      <span>🇨🇳</span> 简体
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setLanguage('zh-TW')} className="gap-2 font-bold text-[12px] rounded-lg cursor-pointer">
                      <span>🇹🇼</span> 繁體
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <span className="text-[12px] text-muted-foreground/30 font-thin italic">|</span>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button 
                      className="flex items-center gap-1 text-[12px] font-bold px-2 py-1.5 outline-none"
                      aria-label={language === 'pt' ? "Alterar moeda" : "Change currency"}
                    >
                      <span>{currency === 'BRL' ? 'R$' : currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '¥'}</span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[110px] rounded-xl p-1 shadow-xl border-primary/10">
                    <DropdownMenuItem onClick={() => setCurrency('BRL')} className="gap-2 font-bold text-[12px] rounded-lg cursor-pointer">
                      <span>R$</span> BRL
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setCurrency('USD')} className="gap-2 font-bold text-[12px] rounded-lg cursor-pointer">
                      <span>$</span> USD
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setCurrency('EUR')} className="gap-2 font-bold text-[12px] rounded-lg cursor-pointer">
                      <span>€</span> EUR
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setCurrency('CNY')} className="gap-2 font-bold text-[12px] rounded-lg cursor-pointer">
                      <span>¥</span> CNY
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
            <button className="p-2 transition-transform active:scale-95" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle menu">
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <nav className="lg:hidden py-6 border-t border-border animate-fade-in">
            <div className="flex flex-col gap-4">
              {allNavLinks.map((link) => (
                <Link 
                  key={link.label} 
                  to={link.href}
                  onClick={(e) => {
                    if (link.href.startsWith("#")) {
                      e.preventDefault();
                      handleNav(link.href);
                    } else {
                      setIsMenuOpen(false);
                    }
                  }} 
                  className={`text-lg font-bold font-sans transition-colors py-2 text-left ${location.pathname === link.href ? "text-primary" : "text-foreground"}`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="flex items-center gap-6 pt-6 border-t border-border">
                {activeSocials.map((s) => (
                  <a key={s.platform} href={s.url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary" aria-label={s.platform}>
                    <s.icon className="w-6 h-6" />
                  </a>
                ))}
              </div>
              <Button onClick={() => handleNav("#tours")} className="mt-4 font-bold h-12 text-lg uppercase tracking-tight">{t("reservar")}</Button>
            </div>
          </nav>
        )}
      </div>
      </header>
    </div>
  );
}
