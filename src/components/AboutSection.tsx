import { Bus, Shield, Heart, Users } from "lucide-react";
import { useLocale } from "@/contexts/LocaleContext";
import { useSiteData } from "@/hooks/useSiteData";
import { OptimizedImage } from "./OptimizedImage";

const DEFAULT_IMAGES = [
  'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?q=80&w=800', // Rio Aerial
  'https://ogzasprtfgimjqrtcseg.supabase.co/storage/v1/render/image/public/site-images/1776156723884_o0fq7cpn2n.webp?quality=70&width=800&format=avif&resize=contain&v=1778909407943',
  'https://ogzasprtfgimjqrtcseg.supabase.co/storage/v1/render/image/public/site-images/1776156617814_tf6xmvip0z9.webp?quality=70&width=800&format=avif&resize=contain&v=1778909407943',
  'https://ogzasprtfgimjqrtcseg.supabase.co/storage/v1/render/image/public/site-images/1776156762554_2bnx5enpd8d.webp?quality=70&width=800&format=avif&resize=contain&v=1778909407943',
];

export function AboutSection() {
  const { t, language } = useLocale();
  const { images, siteSettings } = useSiteData();

  const aboutImages = [
    images["about_1"] || DEFAULT_IMAGES[0],
    images["about_2"] || DEFAULT_IMAGES[1],
    images["about_3"] || DEFAULT_IMAGES[2],
    images["about_4"] || DEFAULT_IMAGES[3],
  ];

  const aboutLabelKey = language === 'pt' ? 'about_label' : `about_label_${language}`;
  const aboutTitleKey = language === 'pt' ? 'about_title' : `about_title_${language}`;
  const aboutDescKey = language === 'pt' ? 'about_desc' : `about_desc_${language}`;
  const aboutDesc2Key = language === 'pt' ? 'about_desc2' : `about_desc2_${language}`;

  const aboutLabel = siteSettings[aboutLabelKey] || siteSettings['about_label'] || t("sobre_passeiorio");
  const aboutTitle = siteSettings[aboutTitleKey] || siteSettings['about_title'] || t("porta_entrada");
  const aboutDesc = siteSettings[aboutDescKey] || siteSettings['about_desc'] || t("sobre_desc1");
  const aboutDesc2 = siteSettings[aboutDesc2Key] || siteSettings['about_desc2'];

  const features = [
    { icon: Bus, title: t("feat_transporte"), description: t("feat_transporte_desc") },
    { icon: Shield, title: t("feat_seguranca"), description: t("feat_seguranca_desc") },
    { icon: Heart, title: t("feat_experiencia"), description: t("feat_experiencia_desc") },
    { icon: Users, title: t("feat_grupos"), description: t("feat_grupos_desc") },
  ];

  return (
    <section id="about" className="py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="h-48 lg:h-64 rounded-2xl overflow-hidden relative">
                <OptimizedImage
                  src={aboutImages[0]}
                  alt="About 1"
                  containerClassName="w-full h-full"
                  className="w-full h-full object-cover"
                  fit="contain"
                />
              </div>
              <div className="h-32 lg:h-40 rounded-2xl overflow-hidden relative">
                <OptimizedImage
                  src={aboutImages[1]}
                  alt="About 2"
                  containerClassName="w-full h-full"
                  className="w-full h-full object-cover"
                  fit="contain"
                />
              </div>
            </div>
            <div className="space-y-4 pt-8">
              <div className="h-32 lg:h-40 rounded-2xl overflow-hidden relative">
                <OptimizedImage
                  src={aboutImages[2]}
                  alt="About 3"
                  containerClassName="w-full h-full"
                  className="w-full h-full object-cover"
                  fit="contain"
                />
              </div>
              <div className="h-48 lg:h-64 rounded-2xl overflow-hidden relative">
                <OptimizedImage
                  src={aboutImages[3]}
                  alt="About 4"
                  containerClassName="w-full h-full"
                  className="w-full h-full object-cover"
                  fit="contain"
                />
              </div>
            </div>
          </div>

          <div>
            <p className="text-primary font-medium mb-3 font-sans">{aboutLabel}</p>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6 text-balance">
              {aboutTitle}
            </h2>
            <div className="space-y-6">
              <p className="text-muted-foreground text-lg leading-relaxed font-sans whitespace-pre-wrap">
                {aboutDesc}
              </p>
              {aboutDesc2 && (
                <p className="text-muted-foreground text-lg leading-relaxed font-sans whitespace-pre-wrap">
                  {aboutDesc2}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-10">
              {features.map((feature) => (
                <div key={feature.title} className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1 font-sans">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground font-sans">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
