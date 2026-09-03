import MatchLandingPage from "@/components/MatchLandingPage";
import { useLocale } from "@/contexts/LocaleContext";

// Vídeos do canal @maracanatalks
const youtubeVideos = [
  { id: "3OYS_tp4Eog", title: "Fluminense vs São Paulo: Inside Maracanã Stadium! 🇧🇷🔥" },
  { id: "-h8fKbucMO8", title: "This is Brazilian Football! 🇧🇷⚽" },
  { id: "zXv4wE2-iSQ", title: "Flamengo vs Vasco Matchday Experience 🇧🇷⚽" },
  { id: "-jRfvnBfytM", title: "Fluminense no Maracanã | Emoção Pura!" },
  { id: "dACXIZKx7xs", title: "Unbelievable Atmosphere at Maracanã" },
];

export default function FluminensePlatenseLibertadores() {
  const { t } = useLocale();
  return (
    <MatchLandingPage
      matchSlug="fluminense-vs-club-altetico-platense-2026-09-08"
      pagePath="/Fluminense-x-patense-libertadores-maracana-tickets"
      pageTitle={t("fluminense_platense_title")}
      pageDescription={t("fluminense_platense_desc")}
      accentClass="from-emerald-800 via-emerald-900 to-red-900"
      heroBackground="https://lncimg.lance.com.br/cdn-cgi/image/width=1600,quality=80,fit=cover,format=webp/uploads/2016/10/19/5807e137e598d.jpeg"
      youtubeVideos={youtubeVideos}
    />
  );
}
