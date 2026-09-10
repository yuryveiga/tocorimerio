import MatchLandingPage from "@/components/MatchLandingPage";
import { useLocale } from "@/contexts/LocaleContext";

// Vídeos do canal @maracanatalks
const youtubeVideos = [
  { id: "zXv4wE2-iSQ", title: "Flamengo vs Vasco Matchday Experience 🇧🇷⚽" },
  { id: "-h8fKbucMO8", title: "This is Brazilian Football! 🇧🇷⚽" },
  { id: "3OYS_tp4Eog", title: "Inside Maracanã Stadium! 🇧🇷🔥" },
  { id: "dACXIZKx7xs", title: "Unbelievable Atmosphere at Maracanã" },
  { id: "-jRfvnBfytM", title: "Maracanã | Emoção Pura!" },
];

export default function FlamengoIndependienteDelValleLibertadores() {
  const { t } = useLocale();
  return (
    <MatchLandingPage
      matchSlug="flamengo-vs-independiente-del-valle-2026-09-17"
      pagePath="/Flamengo-x-Independiente-del-Valle-libertadores-maracana-tickets"
      pageTitle={t("flamengo_idv_title")}
      pageDescription={t("flamengo_idv_desc")}
      accentClass="from-red-800 via-red-900 to-black"
      heroBackground="https://lncimg.lance.com.br/cdn-cgi/image/width=1600,quality=80,fit=cover,format=webp/uploads/2016/10/19/5807e137e598d.jpeg"
      youtubeVideos={youtubeVideos}
    />
  );
}
