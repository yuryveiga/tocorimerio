export const TRIPADVISOR_URL = "https://www.tripadvisor.com.br/Attraction_Review-g303506-d25363992-Reviews-Tocorime_Rio_Tours-Rio_de_Janeiro_State_of_Rio_de_Janeiro.html";
// The Portuguese page alone shows only 10 reviews; the same listing in English
// adds the remaining ones so the import keeps 16.
export const TRIPADVISOR_PAGE_URLS = [
  TRIPADVISOR_URL,
  "https://www.tripadvisor.com/Attraction_Review-g303506-d25363992-Reviews-Tocorime_Rio_Tours-Rio_de_Janeiro_State_of_Rio_de_Janeiro.html",
];
export const TRIPADVISOR_WEEKLY_CRON = "0 9 * * 1";
export const MAX_STORED_REVIEWS = 16;

export interface TripadvisorReview {
  id: string;
  author: string;
  avatar_url: string | null;
  title: string;
  text: string;
  rating: number;
  date_label: string;
  published_at: string | null;
  url: string;
  /** Missing means Tripadvisor. */
  source?: "tripadvisor" | "airbnb" | "viator" | "google";
}

// Both the Portuguese (www.tripadvisor.com.br) and English (www.tripadvisor.com)
// versions of the same fixed listing are accepted as sources.
const HOST = "www\\.tripadvisor\\.com(?:\\.br)?";

function plainText(value: string): string {
  return value.replace(/!\[[^\]]*\]\([^\n]*\)/g, "")
    .replace(/\[([^\]]+)\]\([^\n]*?\)/g, "$1")
    .replace(/<[^>]*>/g, "").replace(/\\/g, "").trim();
}

function reviewUrl(value: string): string | null {
  try {
    const input = new URL(value);
    if (input.protocol !== "https:" || !/^www\.tripadvisor\.com(\.br)?$/.test(input.hostname)) return null;
    let path = input.pathname;
    if (path === "/ClientLink") {
      const encoded = input.searchParams.get("value");
      if (!encoded) return null;
      path = atob(encoded).match(/\/ShowUserReviews-[A-Za-z0-9_-]+\.html/)?.[0] ?? "";
    }
    return /^\/ShowUserReviews-g303506-d\d+-r\d+-[A-Za-z0-9_-]+\.html$/.test(path)
      ? `https://${input.hostname}${path}` : null;
  } catch { return null; }
}

const PT_MONTHS = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
const EN_MONTHS = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];

function validIso(year: string, month: number, day: string): string | null {
  const iso = `${year}-${String(month + 1).padStart(2, "0")}-${day.padStart(2, "0")}`;
  const date = new Date(`${iso}T12:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().startsWith(iso) ? iso : null;
}

function publishedDate(label: string): string | null {
  const pt = label.match(/(?:Feita|Escrita) em (\d{1,2}) de (\S+) de (\d{4})/i);
  if (pt) {
    const month = PT_MONTHS.indexOf(pt[2].toLowerCase());
    return month < 0 ? null : validIso(pt[3], month, pt[1]);
  }
  const en = label.match(/Written (\S+) (\d{1,2}), (\d{4})/i);
  if (en) {
    const month = EN_MONTHS.indexOf(en[1].toLowerCase());
    return month < 0 ? null : validIso(en[3], month, en[2]);
  }
  return null;
}

// Reviewer avatars come only from Tripadvisor's own image CDN, linked to the
// reviewer's profile. The generic "default-avatar" placeholder is treated as
// no photo so the card falls back to the author's initial.
function avatarUrl(prefix: string): string | null {
  const matches = [...prefix.matchAll(new RegExp(`\\[!\\[\\]\\((https:\\/\\/dynamic-media-cdn\\.tripadvisor\\.com\\/[^)\\s]+)\\)\\]\\(https:\\/\\/${HOST}\\/Profile\\/[^\\n]+\\)`, "g"))];
  const candidate = matches.at(-1)?.[1];
  if (!candidate || candidate.includes("default-avatar")) return null;
  try {
    const input = new URL(candidate);
    return input.protocol === "https:" && input.hostname === "dynamic-media-cdn.tripadvisor.com" ? candidate : null;
  } catch { return null; }
}

// Parse only complete review blocks from this fixed business page. No AI,
// invented ratings, management replies or HTML rendering.
export function parseTripadvisorReviews(markdown: string): TripadvisorReview[] {
  const result = new Map<string, TripadvisorReview>();
  for (const block of markdown.split(/\n\s*\* \* \*\s*\n/)) {
    const title = new RegExp(`### \\[([^\\n]+?)\\]\\((https:\\/\\/${HOST}\\/[^\\n]+?)\\)`).exec(block);
    if (!title || title.index === undefined) continue;
    const prefix = block.slice(0, title.index);
    const authors = [...prefix.matchAll(new RegExp(`^\\[([^!\\n][^\\]\\n]*)\\]\\(https:\\/\\/${HOST}\\/Profile\\/[^\\n]+\\)$`, "gm"))];
    const author = authors.at(-1)?.[1];
    const ratings = [...prefix.matchAll(/([1-5]) (?:de 5 c[ií]rculos|of 5 bubbles)/g)];
    const rating = Number(ratings.at(-1)?.[1]);
    const url = reviewUrl(title[2]);
    if (!author || !url || !Number.isInteger(rating) || rating < 1 || rating > 5) continue;
    const suffix = block.slice(title.index + title[0].length).trim();
    const paragraphs = suffix.split(/\n\s*\n/);
    const dateLabel = plainText(paragraphs.shift() ?? "");
    if (!/\b\d{4}\b/.test(dateLabel)) continue;
    const content: string[] = [];
    for (const paragraph of paragraphs) {
      if (/^(Leia mais|Read more|!\[|\[Avaliação de:|Review of:|Traduzido|Translated|Mostrar original|Show original|Feita em|Escrita em|Written|Veja todas|See all|This review)/.test(paragraph.trim())) break;
      content.push(plainText(paragraph));
    }
    const text = content.join("\n\n").trim();
    const id = url.match(/-r(\d+)-/)?.[1];
    if (!id || text.length < 10 || text.length > 12000 || author.length > 200) continue;
    const publication = suffix.match(/(?:Feita|Escrita) em \d{1,2} de \S+ de \d{4}|Written \S+ \d{1,2}, \d{4}/i)?.[0] ?? "";
    result.set(id, { id, author: plainText(author), avatar_url: avatarUrl(prefix), title: plainText(title[1]), text, rating, date_label: dateLabel, published_at: publishedDate(publication), url });
  }
  if (!result.size) throw new Error("Tripadvisor: nenhuma avaliação completa encontrada; mantendo a última importação.");
  return [...result.values()].sort((a, b) => (b.published_at ?? "").localeCompare(a.published_at ?? "")).slice(0, MAX_STORED_REVIEWS);
}
