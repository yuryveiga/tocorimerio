import MatchLandingPage from "@/components/MatchLandingPage";
import { useLocale } from "@/contexts/LocaleContext";
import fansImg from "@/assets/maracana-fans.jpg";

const youtubeVideos = [
  { id: "AeFVFfV1Ad0", title: "Maracanã Magic: Flamengo vs. Santos" },
  { id: "-jRfvnBfytM", title: "Fla x Flu 2026 | Pure Emotion at Maracanã!" },
  { id: "dACXIZKx7xs", title: "Unbelievable Atmosphere! Flamengo vs Madureira" },
];

export default function FlamengoCoritibaMaracana() {
  const { t } = useLocale();
  return (
    <MatchLandingPage
      matchSlug="flamengo-vs-coritiba-2026-05-30"
      pagePath="/flamengo-x-coritiba-maracana"
      pageTitle={t("flamengo_coritiba_title")}
      pageDescription={t("flamengo_coritiba_desc")}
      accentClass="from-red-700 via-red-900 to-black"
      heroBackground={fansImg}
      youtubeVideos={youtubeVideos}
    />
  );
}
