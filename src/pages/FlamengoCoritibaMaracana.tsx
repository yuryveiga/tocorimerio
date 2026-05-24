import MatchLandingPage from "@/components/MatchLandingPage";
import { useLocale } from "@/contexts/LocaleContext";

// Vídeos do canal @maracanatalks - atualizados em 2026-05-24
const youtubeVideos = [
  { id: "3OYS_tp4Eog", title: "Fluminense vs São Paulo: Inside Maracanã Stadium! 🇧🇷🔥" },
  { id: "-h8fKbucMO8", title: "This is Brazilian Football! 🇧🇷⚽" },
  { id: "zXv4wE2-iSQ", title: "Flamengo vs Vasco Matchday Experience 🇧🇷⚽" },
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
      heroBackground="/maracana-fans.jpg"
      youtubeVideos={youtubeVideos}
    />
  );
}
