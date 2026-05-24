import MatchLandingPage from "@/components/MatchLandingPage";
import { useLocale } from "@/contexts/LocaleContext";

export default function FlamengoCoritibaMaracana() {
  const { t } = useLocale();
  return (
    <MatchLandingPage
      matchSlug="flamengo-vs-coritiba-2026-05-30"
      pagePath="/flamengo-x-coritiba-maracana"
      pageTitle={t("flamengo_coritiba_title")}
      pageDescription={t("flamengo_coritiba_desc")}
      accentClass="from-red-700 via-red-900 to-black"
    />
  );
}
