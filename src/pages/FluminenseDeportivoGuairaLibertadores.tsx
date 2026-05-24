import MatchLandingPage from "@/components/MatchLandingPage";
import { useLocale } from "@/contexts/LocaleContext";

const youtubeVideos = [
  { id: "-jRfvnBfytM", title: "Fluminense no Maracanã | Emoção Pura!" },
  { id: "dACXIZKx7xs", title: "Unbelievable Atmosphere at Maracanã" },
];

export default function FluminenseDeportivoGuairaLibertadores() {
  const { t } = useLocale();
  return (
    <MatchLandingPage
      matchSlug="fluminense-vs-deportivo-la-guaira-2026-05-27"
      pagePath="/fluminense-x-deportivo-guaira-libertadores"
      pageTitle={t("fluminense_guaira_title")}
      pageDescription={t("fluminense_guaira_desc")}
      accentClass="from-emerald-700 via-emerald-800 to-red-900"
      heroBackground="https://lncimg.lance.com.br/cdn-cgi/image/width=1600,quality=80,fit=cover,format=webp/uploads/2016/10/19/5807e137e598d.jpeg"
      youtubeVideos={youtubeVideos}
    />
  );
}
