import { useState, useEffect } from "react";
import { X, Trophy } from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteData";

const DISMISS_KEY = "copa_banner_dismissed_at";
const HIDE_FOR_MS = 24 * 60 * 60 * 1000; // 24 h

const TICKER_ITEMS = [
  "🏆 Copa do Mundo 2026",
  "⚽ Vai Brasil!",
  "🇧🇷 Reserve sua experiência no Maracanã",
  "🌟 Passeios exclusivos para a Copa",
  "🏟️ Sinta a emoção do futebol ao vivo",
  "🎉 Junho & Julho de 2026",
];

export function CopaDoMundoBanner() {
  const { data: settings } = useSiteSettings();
  const isCopaMode = settings?.["world_cup_mode"] === "true";

  const [visible, setVisible] = useState(false);

  // Only show after mount (avoids SSR/hydration mismatch)
  useEffect(() => {
    if (!isCopaMode) { setVisible(false); return; }
    try {
      const dismissed = localStorage.getItem(DISMISS_KEY);
      if (dismissed && Date.now() - Number(dismissed) <= HIDE_FOR_MS) {
        setVisible(false);
        return;
      }
    } catch { /* ok */ }
    setVisible(true);
  }, [isCopaMode]);

  const dismiss = () => {
    try { localStorage.setItem(DISMISS_KEY, String(Date.now())); } catch { /* ok */ }
    setVisible(false);
  };

  if (!visible) return null;

  // Duplicate items for seamless infinite loop
  const tickerContent = [...TICKER_ITEMS, ...TICKER_ITEMS];

  return (
    <div
      className="relative z-[70] overflow-hidden"
      role="banner"
      aria-label="Copa do Mundo 2026"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-green-700 via-yellow-400 via-50% to-green-700" />
      <div className="absolute inset-0 bg-gradient-to-b from-white/15 to-transparent" />

      {/* Floating soccer balls */}
      <span className="copa-float-ball absolute left-[5%]  top-0 bottom-0 flex items-center text-2xl opacity-30">⚽</span>
      <span className="copa-float-ball absolute left-[20%] top-0 bottom-0 flex items-center text-xl  opacity-20">⚽</span>
      <span className="copa-float-ball absolute right-[18%] top-0 bottom-0 flex items-center text-2xl opacity-25">⚽</span>
      <span className="copa-float-ball absolute right-[6%]  top-0 bottom-0 flex items-center text-xl  opacity-30">⚽</span>

      {/* Spinning stars */}
      <span className="copa-star absolute left-[40%] top-1 text-base opacity-50">⭐</span>
      <span className="copa-star absolute right-[35%] bottom-1 text-sm opacity-40">⭐</span>

      {/* Scrolling ticker */}
      <div className="relative z-10 py-2 overflow-hidden">
        <div className="copa-ticker-track">
          {tickerContent.map((item, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-2 px-8 text-[13px] font-black uppercase tracking-widest text-green-950 whitespace-nowrap"
            >
              {item}
              <Trophy className="w-3.5 h-3.5 text-green-900/60 shrink-0" />
            </span>
          ))}
        </div>
      </div>

      {/* Dismiss button */}
      <button
        id="copa-banner-dismiss"
        onClick={dismiss}
        aria-label="Fechar banner Copa do Mundo"
        className="absolute right-2 top-1/2 -translate-y-1/2 z-20 p-1.5 rounded-full hover:bg-black/15 transition-colors"
      >
        <X className="w-3.5 h-3.5 text-green-950" />
      </button>
    </div>
  );
}
