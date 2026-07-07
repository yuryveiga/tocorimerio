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

const rootElement = document.getElementById("root")!;

createRoot(rootElement).render(
  <HelmetProvider>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </HelmetProvider>
);

