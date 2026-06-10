import { useEffect } from "react";

/**
 * Coleta métricas de performance no client e expõe em `window.__perfMetrics`.
 *
 * Captura:
 *  - TTFB           (Navigation Timing)
 *  - FCP            (paint entries)
 *  - LCP            (largest-contentful-paint, último valor antes do unload/hide)
 *  - CLS            (layout-shift sem input recente, soma das sessões)
 *  - fontSwaps      (qtd. de fontes que terminaram de carregar *depois* do FCP
 *                    — proxy para "trocas de fonte" visíveis ao usuário)
 *  - navType        ('navigate' | 'reload' | 'back_forward' | 'spa')
 *  - route          (pathname no momento da medição)
 *
 * Em cada navegação SPA (evento `lov:locationchange`, emitido pelo script
 * de preloads no index.html) reinicia LCP/CLS/fontSwaps para medir o
 * impacto do preload por rota. TTFB/FCP permanecem do carregamento inicial.
 *
 * Logs no console com `[perf]` para fácil filtro. Também dispara o evento
 * `lov:perfmetrics` (detail = snapshot) caso queira plugar num backend.
 */

type Metrics = {
  route: string;
  navType: string;
  ttfb?: number;
  fcp?: number;
  lcp?: number;
  cls: number;
  fontSwaps: number;
  fontsLoadedAfterFCP: string[];
};

declare global {
  interface Window {
    __perfMetrics?: Metrics;
  }
}

const isBrowser = () => typeof window !== "undefined" && typeof PerformanceObserver !== "undefined";

function readTTFB(): number | undefined {
  try {
    const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
    if (!nav) return undefined;
    return Math.max(0, nav.responseStart - nav.startTime);
  } catch {
    return undefined;
  }
}

function readNavType(): string {
  try {
    const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
    return nav?.type ?? "navigate";
  } catch {
    return "navigate";
  }
}

function readFCP(): number | undefined {
  try {
    const fcp = performance.getEntriesByName("first-contentful-paint")[0];
    return fcp?.startTime;
  } catch {
    return undefined;
  }
}

export function usePerfMetrics() {
  useEffect(() => {
    if (!isBrowser()) return;

    const state: Metrics = {
      route: window.location.pathname,
      navType: readNavType(),
      ttfb: readTTFB(),
      fcp: readFCP(),
      lcp: undefined,
      cls: 0,
      fontSwaps: 0,
      fontsLoadedAfterFCP: [],
    };
    window.__perfMetrics = state;

    const log = (reason: string) => {
      try {
        // eslint-disable-next-line no-console
        console.info("[perf]", reason, {
          route: state.route,
          navType: state.navType,
          ttfb: state.ttfb != null ? Math.round(state.ttfb) : undefined,
          fcp: state.fcp != null ? Math.round(state.fcp) : undefined,
          lcp: state.lcp != null ? Math.round(state.lcp) : undefined,
          cls: Number(state.cls.toFixed(4)),
          fontSwaps: state.fontSwaps,
          fonts: state.fontsLoadedAfterFCP,
        });
        window.dispatchEvent(new CustomEvent("lov:perfmetrics", { detail: { ...state, reason } }));
      } catch {
        /* noop */
      }
    };

    const observers: PerformanceObserver[] = [];
    const safeObserve = (type: string, cb: (list: PerformanceObserverEntryList) => void) => {
      try {
        const po = new PerformanceObserver(cb);
        po.observe({ type, buffered: true } as PerformanceObserverInit);
        observers.push(po);
      } catch {
        /* type not supported */
      }
    };

    // LCP — keep latest value (largest-contentful-paint reports incrementally).
    safeObserve("largest-contentful-paint", (list) => {
      const entries = list.getEntries();
      const last = entries[entries.length - 1] as any;
      if (last) state.lcp = last.renderTime || last.loadTime || last.startTime;
    });

    // CLS — sum of layout-shift entries without recent input (session-based simplificado).
    safeObserve("layout-shift", (list) => {
      for (const entry of list.getEntries() as any[]) {
        if (!entry.hadRecentInput) state.cls += entry.value || 0;
      }
    });

    // FCP fallback (se ainda não havia sido medido).
    safeObserve("paint", () => {
      if (state.fcp == null) state.fcp = readFCP();
    });

    // Font swaps: conta fontes que terminam de carregar APÓS o FCP.
    // Cada uma dessas é uma troca visível de fallback → fonte real.
    const onFontLoad = (event: Event) => {
      const fcp = state.fcp ?? readFCP();
      const now = performance.now();
      const detail = (event as any).fontfaces as FontFace[] | undefined;
      if (fcp != null && now > fcp) {
        const list = detail ?? [];
        for (const f of list) {
          state.fontSwaps += 1;
          state.fontsLoadedAfterFCP.push(`${f.family} ${f.weight}`);
        }
      }
    };
    try {
      (document as any).fonts?.addEventListener?.("loadingdone", onFontLoad);
    } catch {
      /* noop */
    }

    const finalize = () => log("final");
    // Visibility change é o gatilho recomendado p/ enviar métricas.
    const onVisibility = () => {
      if (document.visibilityState === "hidden") finalize();
    };
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", finalize);

    // Log inicial após o load (snapshot rápido).
    const initialTimer = window.setTimeout(() => log("initial"), 4000);

    // SPA navigation: reset LCP/CLS/fontSwaps para medir a nova rota.
    const onLocationChange = () => {
      log("pre-spa");
      state.route = window.location.pathname;
      state.navType = "spa";
      state.lcp = undefined;
      state.cls = 0;
      state.fontSwaps = 0;
      state.fontsLoadedAfterFCP = [];
    };
    window.addEventListener("lov:locationchange", onLocationChange);
    window.addEventListener("popstate", onLocationChange);

    return () => {
      observers.forEach((o) => { try { o.disconnect(); } catch { /* noop */ } });
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", finalize);
      window.removeEventListener("lov:locationchange", onLocationChange);
      window.removeEventListener("popstate", onLocationChange);
      try { (document as any).fonts?.removeEventListener?.("loadingdone", onFontLoad); } catch { /* noop */ }
      window.clearTimeout(initialTimer);
    };
  }, []);
}