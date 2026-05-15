import { Instagram, MapPin, Mail, Phone, Facebook, Youtube, Music } from "lucide-react";
import { Link } from "react-router-dom";
import { useSiteData } from "@/hooks/useSiteData";
import { useLocale } from "@/contexts/LocaleContext";
import { OptimizedImage } from "./OptimizedImage";
import { PaymentLogos } from "./PaymentLogos";

const iconMap: Record<string, React.ElementType> = {
  Instagram, MapPin, Phone, Mail, Music, Facebook, Youtube,
};

export function Footer() {
  const { pages, socialMedia, images, siteSettings, tours } = useSiteData();
  const { t, language } = useLocale();



  const aboutDescKey = language === 'pt' ? 'about_desc' : `about_desc_${language}`;
  const footerDesc = siteSettings[aboutDescKey] || siteSettings['about_desc'] || t("footer_desc");

  const scrollTo = (href: string) => {
    if (href.startsWith("#")) {
      const id = href.replace("#", "");
      if (id === "top") { window.scrollTo({ top: 0, behavior: "smooth" }); return; }
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const getPageLabel = (page: Record<string, unknown>) => {
    if (language === 'pt') return String(page.title || "");
    return String(page[`title_${language}`] || page.title || "");
  };

  const navLinks = pages.length > 0
    ? pages.map((p) => ({ label: getPageLabel(p), href: p.href }))
    : [
        { label: t("inicio"), href: "#top" },
        { label: t("passeios"), href: "#tours" },
        { label: t("sobre"), href: "#about" },
        { label: t("contato"), href: "#contact" },
      ];

  const activeSocials = socialMedia.length > 0
    ? socialMedia
      .filter(s => s.platform.toLowerCase() !== 'email')
      .map((s) => ({ platform: s.platform, url: s.url, icon: iconMap[s.icon_name] || MapPin }))
    : [];

  // Get email and phone from social media
  const emailSocial = socialMedia.find(s => s.platform.toLowerCase() === 'email');
  const whatsappSocial = socialMedia.find(s => s.platform.toLowerCase().includes('whatsapp'));
  const phoneSocial = socialMedia.find(s => s.platform.toLowerCase().includes('whatsapp') || s.platform.toLowerCase().includes('phone'));
  
  const contactEmail = emailSocial?.url || "";
  const contactPhone = phoneSocial?.url || whatsappSocial?.url || "";
  
  const cleanPhone = contactPhone.replace(/[^\d+]/g, "");
  const waLink = contactPhone
    ? (whatsappSocial || contactPhone.startsWith('http')
        ? buildWhatsappLink(contactPhone, language)
        : `tel:${cleanPhone}`)
    : '';

  const logoUrl = images["logo"] || "https://ogzasprtfgimjqrtcseg.supabase.co/storage/v1/object/public/site-images//images__1_-removebg-preview.png";

  return (
    <footer className="bg-[hsl(145,30%,12%)] text-[hsl(140,10%,96%)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              {logoUrl ? (
                <OptimizedImage 
                  src={logoUrl} 
                  alt="Tocorime Rio - Passeios Privados no Rio de Janeiro" 
                  width={100}
                  containerClassName="h-10 w-10 overflow-hidden"
                  className="rounded-full h-full w-full object-cover" 
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-[hsl(145,40%,40%)] flex items-center justify-center">
                  <span className="font-bold text-lg font-sans">P</span>
                </div>
              )}
            </div>
            <p className="text-[hsl(140,10%,96%)]/80 text-sm leading-relaxed font-sans whitespace-pre-wrap">
              {footerDesc}
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4 font-sans">{t("links_rapidos")}</h3>
            <ul className="space-y-3 font-sans">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link 
                    to={link.href}
                    onClick={(e) => {
                      if (link.href.startsWith("#") && window.location.pathname === "/") {
                        e.preventDefault();
                        scrollTo(link.href);
                      }
                    }}
                    className="text-[hsl(140,10%,96%)]/80 hover:text-[hsl(145,40%,40%)] transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li className="pt-2">
                <Link 
                  to="/sitemap"
                  className="text-[hsl(140,10%,96%)]/80 hover:text-[hsl(145,40%,40%)] transition-colors text-sm"
                >
                  {t("sitemap") || "Mapa do Site"}
                </Link>
              </li>
              <li className="pt-1">
                <Link 
                  to="/admin"
                  className="opacity-0 hover:opacity-100 transition-opacity text-[hsl(140,10%,96%)]/20 text-[10px] font-black uppercase tracking-widest cursor-default hover:cursor-pointer"
                >
                  ADMIN
                </Link>
              </li>
            </ul>
          </div>

          <div className="flex flex-col">
            <h3 className="font-semibold text-lg mb-4 font-sans">{t("contato")}</h3>
            <ul className="space-y-3 font-sans mb-6">
              {contactEmail && (
                <li className="flex items-center gap-2 text-[hsl(140,10%,96%)]/80 text-sm">
                  <Mail className="w-4 h-4 text-[hsl(145,40%,40%)]" />
                  <a href={`mailto:${contactEmail}`} className="hover:text-[hsl(145,40%,40%)] transition-colors">{contactEmail}</a>
                </li>
              )}
              {contactPhone && (
                <li className="flex items-center gap-2 text-[hsl(140,10%,96%)]/80 text-sm">
                  <Phone className="w-4 h-4 text-[hsl(145,40%,40%)]" />
                  <a href={waLink} target="_blank" rel="noopener noreferrer" className="hover:text-[hsl(145,40%,40%)] transition-colors">
                    {contactPhone.replace(/https?:\/\/(wa\.me\/)?/, '')}
                  </a>
                </li>
              )}
              {!contactEmail && !contactPhone && (
                <li className="flex items-center gap-2 text-[hsl(140,10%,96%)]/80 text-sm">
                  <MapPin className="w-4 h-4 text-[hsl(145,40%,40%)] mt-0.5" />
                  <span>Rio de Janeiro, Brasil</span>
                </li>
              )}
            </ul>
            
            <div className="flex items-center gap-2 mt-auto">
              <img
                src="https://ogzasprtfgimjqrtcseg.supabase.co/storage/v1/render/image/public/site-images/redes/tripadvisor_dark_bg.png?width=150&quality=80&resize=contain"
                alt="TripAdvisor"
                className="w-24 h-auto opacity-80 hover:opacity-100 hover:scale-110 transition-all duration-300 cursor-pointer object-contain"
              />
              <img
                src="https://ogzasprtfgimjqrtcseg.supabase.co/storage/v1/render/image/public/site-images/redes/airbnb_dark_bg.png?width=150&quality=80&resize=contain"
                alt="Airbnb"
                className="w-24 h-auto opacity-80 hover:opacity-100 hover:scale-110 transition-all duration-300 cursor-pointer object-contain"
              />
              <img
                src="https://ogzasprtfgimjqrtcseg.supabase.co/storage/v1/render/image/public/site-images/redes/google_reviews_dark_bg.png?width=150&quality=80&resize=contain"
                alt="Google Reviews"
                className="w-24 h-auto opacity-80 hover:opacity-100 hover:scale-110 transition-all duration-300 cursor-pointer object-contain"
              />
            </div>
          </div>

          <div className="flex flex-col">
            <h3 className="font-semibold text-lg mb-4 font-sans">{t("siga_nos")}</h3>
            <div className="flex items-center gap-4 mb-6">
              {activeSocials.map((s) => (
                <a key={s.platform} href={s.url} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-[hsl(145,20%,20%)] flex items-center justify-center hover:bg-[hsl(145,40%,40%)] transition-colors" aria-label={s.platform}>
                  <s.icon className="w-5 h-5" />
                </a>
              ))}
            </div>

            <div className="flex items-center gap-2 mt-auto">
              <img
                src="https://ogzasprtfgimjqrtcseg.supabase.co/storage/v1/render/image/public/site-images/redes/viator_dark_bg.png?width=150&quality=80&resize=contain"
                alt="Viator"
                className="w-24 h-auto opacity-80 hover:opacity-100 hover:scale-110 transition-all duration-300 cursor-pointer object-contain"
              />
              <img
                src="https://ogzasprtfgimjqrtcseg.supabase.co/storage/v1/render/image/public/site-images/redes/homefans_dark_bg.png?width=150&quality=80&resize=contain"
                alt="Homefans"
                className="w-24 h-auto opacity-80 hover:opacity-100 hover:scale-110 transition-all duration-300 cursor-pointer object-contain"
              />
              <img
                src="https://ogzasprtfgimjqrtcseg.supabase.co/storage/v1/render/image/public/site-images/redes/turismo_responsavel_dark.png?width=150&quality=80&resize=contain"
                alt="Turismo Responsável"
                className="w-24 h-auto opacity-80 hover:opacity-100 hover:scale-110 transition-all duration-300 cursor-pointer object-contain"
              />
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-[hsl(145,15%,22%)]">

          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex flex-col gap-2 md:w-1/3">
              <p className="text-[hsl(140,10%,96%)]/60 text-sm font-sans">&copy; 2026 Tocorime Rio. {t("direitos")}</p>
              <p className="text-[hsl(140,10%,96%)]/60 text-xs font-sans opacity-70 tracking-tight">{t("turismo_sustentavel")}</p>
            </div>

            <div className="flex justify-center items-center gap-6 md:w-1/3">
              <a 
                href="https://visitrio.com.br/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:scale-105 transition-transform"
                aria-label="Visit Rio (abre em nova aba)"
              >
                <img 
                  src="https://ogzasprtfgimjqrtcseg.supabase.co/storage/v1/object/public/site-images//Captura_de_tela_2026-04-26_092353-removebg-preview.png" 
                  alt="Visit Rio" 
                  className="h-8 w-auto brightness-0 invert opacity-80 hover:opacity-100 transition-opacity object-contain"
                />
              </a>
              <a 
                href="https://ogzasprtfgimjqrtcseg.supabase.co/storage/v1/object/public/site-images/redes/CADASTUR%20TOCORIME.jpeg"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:scale-105 transition-transform border-l border-white/10 pl-6"
                aria-label="Ver certificado Cadastur (abre em nova aba)"
              >
                <img 
                  src="https://logodownload.org/wp-content/uploads/2018/02/cadastur-logo-1.png" 
                  alt="Cadastur" 
                  className="h-10 w-auto brightness-0 invert opacity-80 hover:opacity-100 transition-opacity"
                />
              </a>
            </div>
            
            <div className="flex flex-col items-center md:items-end gap-3 md:w-1/3">
              <p className="text-[hsl(140,10%,96%)]/40 text-[9px] font-black uppercase tracking-[0.2em]">{language === 'pt' ? 'Pagamento Seguro' : 'Secure Checkout'}</p>
              <PaymentLogos variant="dark" className="opacity-80" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
