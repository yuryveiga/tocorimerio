
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

const schedule = (cb: () => void) => {
  if (typeof (window as any).requestIdleCallback === "function") {
    (window as any).requestIdleCallback(cb, { timeout: 3000 });
  } else {
    setTimeout(cb, 1500);
  }
};

export const useAnalytics = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.pathname.startsWith("/admin")) {
      return;
    }

    const trackVisit = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) return;

        let sessionId = sessionStorage.getItem("site_session_id");
        if (!sessionId) {
          sessionId = crypto.randomUUID();
          sessionStorage.setItem("site_session_id", sessionId);
        }

        const payload = {
          page_url: window.location.href,
          referrer: document.referrer || null,
          user_agent: navigator.userAgent,
          session_id: sessionId,
        };

        // Fire-and-forget with keepalive — never blocks page work,
        // survives page unload, and stays off the critical path.
        const url = `${SUPABASE_URL}/functions/v1/track-visit`;
        const body = JSON.stringify(payload);
        const blob = new Blob([body], { type: "application/json" });

        // Try sendBeacon first (cheapest, browser handles it in background).
        if (typeof navigator.sendBeacon === "function" && navigator.sendBeacon(url, blob)) {
          return;
        }
        // Fallback: fetch with keepalive, no await.
        void fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: SUPABASE_ANON,
            Authorization: `Bearer ${SUPABASE_ANON}`,
          },
          body,
          keepalive: true,
        }).catch(() => {});
      } catch (error) {
        // Silent: analytics must never affect UX
      }
    };

    // Defer until the browser is idle so it never competes with LCP/hydration.
    schedule(() => { void trackVisit(); });
  }, [location.pathname, location.search]);
};
