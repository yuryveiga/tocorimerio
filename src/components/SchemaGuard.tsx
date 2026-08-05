import { useEffect } from "react";

/**
 * Remove blocos JSON-LD injetados por widgets de terceiros (ex.: Elfsight/TripAdvisor)
 * fora do <head>. Esses blocos declaram um `Product` genérico usando o <title> da página
 * como nome/marca, sem `offers`, o que gera itens inválidos no Google Rich Results
 * ("Produto sem offers/review inválido"). Os nossos schemas, gerados via Helmet, ficam
 * sempre dentro do <head> e não são afetados.
 */
export const SchemaGuard = () => {
  useEffect(() => {
    const clean = () => {
      document.querySelectorAll<HTMLScriptElement>('script[type="application/ld+json"]').forEach((el) => {
        if (el.closest("head")) return; // nossos schemas
        try {
          const json = JSON.parse(el.textContent || "{}");
          const type = json["@type"];
          if (type === "Product" || type === "AggregateRating" || type === "Review") el.remove();
        } catch {
          /* ignora JSON inválido de terceiros */
        }
      });
    };

    clean();
    const observer = new MutationObserver(clean);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  return null;
};

export default SchemaGuard;
