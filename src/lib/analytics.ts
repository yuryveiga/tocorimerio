/**
 * GA4 / Google Ads event tracking.
 *
 * gtag itself is bootstrapped in index.html (G-R4PH55B7S7 + AW-…), loaded
 * deferred after first paint. This module only pushes events, so it adds no
 * blocking JavaScript.
 *
 * Rules:
 * - every event is de-duplicated per page view (or per key) so a re-render or
 *   a second click never sends the same event twice;
 * - `purchase` is only sent from the confirmation page once payment is
 *   confirmed, keyed by the Stripe session/sale id;
 * - Google Ads click ids (gclid / gbraid / wbraid) and utm_* parameters are
 *   captured on the first page load and kept in sessionStorage, so attribution
 *   survives client-side navigation while canonical URLs stay clean.
 */

type Params = Record<string, unknown>;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const sent = new Set<string>();

const gtag = (...args: unknown[]) => {
  if (typeof window === "undefined") return;
  // Fall back to dataLayer directly: gtag() may not exist yet if the deferred
  // script hasn't landed, but the stub array is created in index.html.
  if (typeof window.gtag === "function") {
    window.gtag(...args);
    return;
  }
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(args);
};

/** Send a GA4 event once per key (defaults to the event name + path). */
export function track(event: string, params: Params = {}, dedupeKey?: string) {
  if (typeof window === "undefined") return;
  const key = dedupeKey ?? `${event}:${window.location.pathname}`;
  if (sent.has(key)) return;
  sent.add(key);
  gtag("event", event, { ...params, ...getAttribution() });
}

/** Send an event that legitimately repeats (e.g. two different CTAs). */
export function trackAlways(event: string, params: Params = {}) {
  gtag("event", event, { ...params, ...getAttribution() });
}

/* ------------------------------------------------------------------ */
/* Ads / campaign attribution                                          */
/* ------------------------------------------------------------------ */

const ATTRIBUTION_KEYS = [
  "gclid",
  "gbraid",
  "wbraid",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
] as const;

const STORAGE_KEY = "tocorime_attribution";

let cachedAttribution: Params | null = null;

/** Capture click ids / utm params from the current URL (call once at startup). */
export function captureAttribution() {
  if (typeof window === "undefined") return;
  try {
    const url = new URLSearchParams(window.location.search);
    const found: Params = {};
    for (const k of ATTRIBUTION_KEYS) {
      const v = url.get(k);
      if (v) found[k] = v;
    }
    if (Object.keys(found).length === 0) return;
    const stored = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "{}");
    const merged = { ...stored, ...found };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    cachedAttribution = merged;
  } catch {
    /* private mode / blocked storage: tracking degrades, app keeps working */
  }
}

export function getAttribution(): Params {
  if (cachedAttribution) return cachedAttribution;
  if (typeof window === "undefined") return {};
  try {
    cachedAttribution = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    cachedAttribution = {};
  }
  return cachedAttribution || {};
}

/**
 * One global listener for WhatsApp clicks, so every wa.me link on the site
 * reports `click_whatsapp` exactly once per click without touching each
 * component.
 */
export function initWhatsappTracking() {
  if (typeof window === "undefined") return;
  document.addEventListener(
    "click",
    (e) => {
      const target = e.target as HTMLElement | null;
      const link = target?.closest?.("a[href*='wa.me'], a[href*='api.whatsapp.com']") as HTMLAnchorElement | null;
      if (!link) return;
      trackAlways("click_whatsapp", {
        page_path: window.location.pathname,
        link_url: link.href.split("?")[0],
      });
    },
    { capture: true, passive: true }
  );
}

/** Fire once per confirmed payment (Stripe session / sale id as the key). */
export function trackPurchaseOnce(id: string, params: Params) {
  if (typeof window === "undefined" || !id) return;
  const key = `purchase:${id}`;
  try {
    if (localStorage.getItem(key)) return;
    localStorage.setItem(key, "1");
  } catch {
    if (sent.has(key)) return;
    sent.add(key);
  }
  gtag("event", "purchase", { transaction_id: id, ...params, ...getAttribution() });
}
