import { createRoot, hydrateRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import { BrowserRouter } from "react-router-dom";
import App from "./App.tsx";
import "./index.css";

// SEO: normalize legacy URLs that contain the non-breaking hyphen (U+2011, %E2%80%91)
// coming from old sitemap/GSC entries. Replace with normal hyphen and 301-equivalent redirect.
(() => {
  try {
    const { pathname, search, hash } = window.location;
    const decoded = decodeURIComponent(pathname);
    if (decoded.includes("\u2011")) {
      const fixed = decoded.replace(/\u2011/g, "-");
      window.location.replace(fixed + search + hash);
    }
  } catch {}
})();

// SEO: redirect legacy blog slugs to their new shortened versions
(() => {
  try {
    const LEGACY_SLUGS: Record<string, string> = {
      "tours-in-lapa-rios-historic-heart-by-day-samba-capital-by-night": "tours-in-lapa",
      "tours-in-santa-teresa-rios-bohemian-hilltop-village": "pontos-turisticos-em-santa-teresa",
      "tours-in-ipanema-rios-effortlessly-chic-beach-neighborhood": "tours-in-ipanema",
      "tours-in-copacabana-the-iconic-rio-beach-without-tourist-traps": "tours-in-copacabana",
      "sunset-in-rio-de-janeiro-a-practical-guide-to-the-best-viewpoints-in-the-city": "sunset-in-rio-de-janeiro-guide",
      "sunset-in-rio-de-janeiro-the-golden-hour-youll-never-forget": "sunset-rio-de-janeiro-golden-hour-experience",
      // Duplicados unificados (o artigo antigo passa a apontar para a versão mantida)
      "tours-in-santa-teresa": "pontos-turisticos-em-santa-teresa",
      "o-que-fazer-no-rj-com-chuva": "things-to-do-in-rio-de-janeiro-when-it-rains",
      "melhor-feijoada-rio-de-janeiro": "best-feijoada-rio-de-janeiro-tourists",
    };

    const { pathname, search, hash } = window.location;
    const match = decodeURIComponent(pathname).match(/^\/blog\/([^/]+)\/?$/);
    if (match && LEGACY_SLUGS[match[1]]) {
      window.location.replace(`/blog/${LEGACY_SLUGS[match[1]]}${search}${hash}`);
    }
  } catch {}
})();

const rootElement = document.getElementById("root")!;

createRoot(rootElement).render(
  <HelmetProvider>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </HelmetProvider>
);

