import { useSiteData } from "@/hooks/useSiteData";
import { useLocale } from "@/contexts/LocaleContext";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ChevronRight, Map, Globe, Newspaper, Ticket, Info, Home } from "lucide-react";

const Sitemap = () => {
  const { tours, blogPosts, pages } = useSiteData();
  const { t, language } = useLocale();

  const getLabel = (item: any, field: string = 'title') => {
    if (language === 'pt') return item[field] || "";
    return item[`${field}_${language}`] || item[field] || "";
  };

  const sections = [
    {
      title: t("inicio") || "Início",
      icon: <Home className="w-5 h-5 text-primary" />,
      links: [
        { label: t("inicio") || "Home", href: "/" },
        { label: t("passeios") || "Passeios", href: "/passeio" },
        { label: t("blog") || "Blog", href: "/blog" },
        { label: t("carrinho") || "Carrinho", href: "/carrinho" },
        { label: t("maracana-calendario") || "Calendário Maracanã", href: "/maracana-calendario" },
      ]
    },
    {
      title: t("categories") || "Categorias",
      icon: <Globe className="w-5 h-5 text-primary" />,
      links: Array.from(new Set(tours.map(t => t.category))).filter(Boolean).map(cat => ({
        label: cat,
        href: `/passeios/${cat}`
      }))
    },
    {
      title: t("tours") || "Experiências",
      icon: <Map className="w-5 h-5 text-primary" />,
      links: tours.map(tour => ({
        label: getLabel(tour),
        href: `/passeio/${tour.id}`
      }))
    },
    {
      title: t("blog") || "Blog & Notícias",
      icon: <Newspaper className="w-5 h-5 text-primary" />,
      links: blogPosts.map(post => ({
        label: getLabel(post),
        href: `/blog/${post.slug}`
      }))
    },
    {
      title: t("legal") || "Informações",
      icon: <Info className="w-5 h-5 text-primary" />,
      links: pages.map(page => ({
        label: getLabel(page),
        href: `/${page.slug}`
      }))
    }
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <Helmet>
        <title>{t("sitemap") || "Mapa do Site"} | Maracanã Match Day</title>
        <meta name="description" content="Navegue por todas as páginas, experiências e artigos do Maracanã Match Day." />
      </Helmet>

      <div className="bg-primary/5 py-16 mb-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            {t("sitemap") || "Mapa do Site"}
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Explore todo o nosso conteúdo de forma organizada e rápida.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {sections.map((section, idx) => (
            <div key={idx} className="space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-primary/20">
                {section.icon}
                <h2 className="text-xl font-bold text-foreground uppercase tracking-wider">
                  {section.title}
                </h2>
              </div>
              <ul className="space-y-3">
                {section.links.map((link, lIdx) => (
                  <li key={lIdx}>
                    <Link 
                      to={link.href}
                      className="group flex items-center text-muted-foreground hover:text-primary transition-colors duration-200"
                    >
                      <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -ml-5 group-hover:ml-0 transition-all duration-200 mr-2" />
                      <span className="text-base font-medium">{link.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sitemap;
