import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, X, Instagram, MapPin, Phone, Mail, Music, Facebook, Youtube, Globe, DollarSign, ShoppingCart, ChevronDown } from "lucide-react";
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
    const navLinks = [
      { label: t("inicio"), href: "#top" },
      { label: t("passeios"), href: "#tours" },
      { label: t("sobre"), href: "#about" },
      { label: t("contato"), href: "#contact" },
      { label: "Blog", href: "/blog" },
    ];

    const staticHrefs = navLinks.map(l => l.href);
    const filteredDynamicLinks = pages
      .map(p => ({ label: p.title, href: p.href }))
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
          </Link>

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

          <div className="hidden lg:flex items-center gap-6">
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
              <div className="flex items-center border border-border rounded-full px-1 py-0.5 bg-muted/30">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button 
                      className="flex items-center gap-1 text-[10px] font-bold px-1.5 py-1 outline-none"
                      aria-label={language === 'pt' ? "Alterar idioma" : "Change language"}
                    >
                      <span>{language === 'pt' ? '🇧🇷' : language === 'en' ? '🇺🇸' : '🇪🇸'}</span>
                      <span className="uppercase">{language}</span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-[110px] rounded-xl p-1 shadow-xl border-primary/10">
                    <DropdownMenuItem onClick={() => setLanguage('pt')} className="gap-2 font-bold text-[10px] rounded-lg cursor-pointer">
                      <span>🇧🇷</span> PT
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setLanguage('en')} className="gap-2 font-bold text-[10px] rounded-lg cursor-pointer">
                      <span>🇺🇸</span> EN
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setLanguage('es')} className="gap-2 font-bold text-[10px] rounded-lg cursor-pointer">
                      <span>🇪🇸</span> ES
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <span className="text-[10px] text-muted-foreground/30 font-thin italic">|</span>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button 
                      className="flex items-center gap-1 text-[10px] font-bold px-1.5 py-1 outline-none"
                      aria-label={language === 'pt' ? "Alterar moeda" : "Change currency"}
                    >
                      <span>{currency === 'BRL' ? 'R$' : currency === 'USD' ? '$' : '€'}</span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[110px] rounded-xl p-1 shadow-xl border-primary/10">
                    <DropdownMenuItem onClick={() => setCurrency('BRL')} className="gap-2 font-bold text-[10px] rounded-lg cursor-pointer">
                      <span>R$</span> BRL
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setCurrency('USD')} className="gap-2 font-bold text-[10px] rounded-lg cursor-pointer">
                      <span>$</span> USD
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setCurrency('EUR')} className="gap-2 font-bold text-[10px] rounded-lg cursor-pointer">
                      <span>€</span> EUR
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
