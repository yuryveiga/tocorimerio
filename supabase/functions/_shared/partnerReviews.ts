import type { TripadvisorReview } from "./tripadvisorReviews.ts";

// Fixed public listing pages (the hosting/admin Airbnb link needs a login, so
// the public page of the same experience is used). Five newest from each.
export const AIRBNB_URL = "https://www.airbnb.com.br/experiences/6860093";
export const VIATOR_URL = "https://www.viator.com/tours/Rio-de-Janeiro/Rio-de-Janeiro-Maracana-Matchday-Tour/d712-395600P3";
export const PARTNER_REVIEWS_PER_SITE = 5;

const PT_MONTHS = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
const EN_SHORT = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

function monthIso(year: string, month: number): string | null {
  return month < 0 ? null : `${year}-${String(month + 1).padStart(2, "0")}-01`;
}

function slug(value: string): string {
  return value.toLowerCase().normalize("NFD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);
}

// Individual ratings are not published on these pages, so rating stays 0
// (unknown) and the card hides its stars instead of inventing a score.
export function parseAirbnbReviews(markdown: string): TripadvisorReview[] {
  const pattern = /\[!\[([^\]\n]+)\]\((https:\/\/a0\.muscache\.com\/[^)\s]+)\)\]\(https:\/\/www\.airbnb\.com(?:\.br)?\/users\/profile\/(\d+)[^)\n]*\)\s*\n\n[^\n]+\n\n(?:[^\n,][^\n]*\n\n)?,\s+·\s+([^\n]+)\n\n([\s\S]*?)\n\n(?:Mostrar mais|Show more)/g;
  const reviews: TripadvisorReview[] = [];
  for (const m of markdown.matchAll(pattern)) {
    const dateLabel = m[4].trim();
    const d = dateLabel.match(/(\S+) de (\d{4})/);
    const text = m[5].trim();
    if (text.length < 10 || text.length > 12000) continue;
    reviews.push({ id: `airbnb-${m[3]}`, author: m[1].trim(), avatar_url: m[2], title: "", text, rating: 0, date_label: dateLabel, published_at: d ? monthIso(d[2], PT_MONTHS.indexOf(d[1].toLowerCase())) : null, url: AIRBNB_URL, source: "airbnb" });
  }
  if (!reviews.length) throw new Error("Airbnb: nenhuma avaliação encontrada");
  return reviews.slice(0, PARTNER_REVIEWS_PER_SITE);
}

export function parseViatorReviews(markdown: string): TripadvisorReview[] {
  const start = markdown.indexOf("## Reviews");
  if (start < 0) throw new Error("Viator: seção de avaliações não encontrada");
  const section = markdown.slice(start).split(/\n## (?!#)/)[0];
  const reviews: TripadvisorReview[] = [];
  for (const block of section.split(/\n### /).slice(1)) {
    const lines = block.split(/\n\s*\n/);
    const title = lines.shift()?.trim() ?? "";
    const meta = (lines.shift() ?? "").replace(/\\/g, "").match(/^(.+), ([A-Z][a-z]{2}) (\d{4})$/);
    if (!title || !meta) continue;
    const content: string[] = [];
    for (const p of lines) {
      if (/^(Read more|####|\[See )/.test(p.trim())) break;
      content.push(p.trim());
    }
    const text = content.join("\n\n").trim();
    if (text.length < 5 || text.length > 12000) continue;
    const author = meta[1].trim();
    reviews.push({ id: `viator-${slug(author)}-${meta[3]}-${meta[2].toLowerCase()}`, author, avatar_url: null, title, text, rating: 0, date_label: `${meta[2]} ${meta[3]}`, published_at: monthIso(meta[3], EN_SHORT.indexOf(meta[2].toLowerCase())), url: VIATOR_URL, source: "viator" });
  }
  if (!reviews.length) throw new Error("Viator: nenhuma avaliação encontrada");
  return reviews.slice(0, PARTNER_REVIEWS_PER_SITE);
}
