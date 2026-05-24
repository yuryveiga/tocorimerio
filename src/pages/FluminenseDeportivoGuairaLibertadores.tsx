import MatchLandingPage from "@/components/MatchLandingPage";
import { useLocale } from "@/contexts/LocaleContext";

export default function FluminenseDeportivoGuairaLibertadores() {
  const { t } = useLocale();
  return (
    <MatchLandingPage
      matchSlug="fluminense-vs-deportivo-la-guaira-2026-05-27"
      pagePath="/fluminense-x-deportivo-guaira-libertadores"
      pageTitle={t("fluminense_guaira_title")}
      pageDescription={t("fluminense_guaira_desc")}
      accentClass="from-emerald-700 via-emerald-800 to-red-900"
    />
  );
}
