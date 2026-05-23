import { useEffect, useState } from "react";
import { X, Flame, ShieldCheck, Star } from "lucide-react";
import { useLocale } from "@/contexts/LocaleContext";

const STORAGE_KEY = "urgency_bar_dismissed_at";
const HIDE_FOR_MS = 24 * 60 * 60 * 1000; // 24h

export function UrgencyBar() {
  const { t } = useLocale();
  // Start visible to avoid CLS — hide synchronously if dismissed.
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    try {
      const dismissed = localStorage.getItem(STORAGE_KEY);
      if (dismissed && Date.now() - Number(dismissed) <= HIDE_FOR_MS) {
        setVisible(false);
      }
    } catch {
      // keep visible
    }
  }, []);

  const dismiss = () => {
    try {
      localStorage.setItem(STORAGE_KEY, String(Date.now()));
    } catch (e) {
      // Silently fail if localStorage is disabled
      console.warn("Could not save urgency bar dismissal state", e);
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="relative z-[60] bg-accent text-accent-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1.5 flex items-center justify-center gap-x-4 gap-y-1 flex-wrap text-[11px] sm:text-xs font-semibold tracking-tight">
        <span className="inline-flex items-center gap-1.5">
          <Flame className="w-3.5 h-3.5" aria-hidden />
          {t("urgency_bar")}
        </span>
        <span className="hidden sm:inline opacity-60">·</span>
        <span className="hidden sm:inline-flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5" aria-hidden />
          {t("urgency_free_cancel")}
        </span>
        <span className="hidden md:inline opacity-60">·</span>
        <span className="hidden md:inline-flex items-center gap-1.5">
          <Star className="w-3.5 h-3.5 fill-current" aria-hidden />
          {t("urgency_rated")}
        </span>
      </div>
      <button
        onClick={dismiss}
        aria-label="Fechar"
        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-black/10 transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}