export const TRIPADVISOR_URL = "https://www.tripadvisor.com.br/Attraction_Review-g303506-d25363992-Reviews-Tocorime_Rio_Tours-Rio_de_Janeiro_State_of_Rio_de_Janeiro.html";
export const TRIPADVISOR_WEEKLY_CRON = "0 9 * * 1";

export interface TripadvisorReview {
  id: string;
  author: string;
  title: string;
  text: string;
  rating: number;
  date_label: string;
  published_at: string | null;
  url: string;
}

function plainText(value: string): string {
  return value.replace(/!\[[^\]]*\]\([^\n]*\)/g, "")
    .replace(/\[([^\]]+)\]\([^\n]*?\)/g, "$1")
    .replace(/<[^>]*>/g, "").replace(/\\/g, "").trim();
}

function reviewUrl(value: string): string | null {
  try {
    const input = new URL(value);
    if (input.protocol !== "https:" || input.hostname !== "www.tripadvisor.com.br") return null;
    let path = input.pathname;
    if (path === "/ClientLink") {
      const encoded = input.searchParams.get("value");
      if (!encoded) return null;
      path = atob(encoded).match(/\/ShowUserReviews-[A-Za-z0-9_-]+\.html/)?.[0] ?? "";
    }
    return /^\/ShowUserReviews-g303506-d\d+-r\d+-[A-Za-z0-9_-]+\.html$/.test(path)
      ? `https://www.tripadvisor.com.br${path}` : null;
  } catch { return null; }
}

function publishedDate(label: string): string | null {
  const months = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
  const match = label.match(/(?:Feita|Escrita) em (\d{1,2}) de (\S+) de (\d{4})/i);
  if (!match) return null;
  const month = months.indexOf(match[2].toLowerCase());
  if (month < 0) return null;
  const iso = `${match[3]}-${String(month + 1).padStart(2, "0")}-${match[1].padStart(2, "0")}`;
  const date = new Date(`${iso}T12:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().startsWith(iso) ? iso : null;
}

// Parse only complete review blocks from this fixed business page. No AI,
// invented ratings, management replies, remote avatars or HTML rendering.
export function parseTripadvisorReviews(markdown: string): TripadvisorReview[] {
  const result = new Map<string, TripadvisorReview>();
  for (const block of markdown.split(/\n\s*\* \* \*\s*\n/)) {
    const title = /### \[([^\n]+?)\]\((https:\/\/www\.tripadvisor\.com\.br\/[^\n]+?)\)/.exec(block);
    if (!title || title.index === undefined) continue;
    const prefix = block.slice(0, title.index);
    const authors = [...prefix.matchAll(/^\[([^!\n][^\]\n]*)\]\(https:\/\/www\.tripadvisor\.com\.br\/Profile\/[^\n]+\)$/gm)];
    const author = authors.at(-1)?.[1];
    const ratings = [...prefix.matchAll(/([1-5]) de 5 c[ií]rculos/g)];
    const rating = Number(ratings.at(-1)?.[1]);
    const url = reviewUrl(title[2]);
    if (!author || !url || !Number.isInteger(rating) || rating < 1 || rating > 5) continue;
    const suffix = block.slice(title.index + title[0].length).trim();
    const paragraphs = suffix.split(/\n\s*\n/);
    const dateLabel = plainText(paragraphs.shift() ?? "");
    if (!/\b\d{4}\b/.test(dateLabel)) continue;
    const content: string[] = [];
    for (const paragraph of paragraphs) {
      if (/^(Leia mais|Read more|!\[|\[Avaliação de:|Traduzido|Mostrar original|Feita em|Escrita em|Veja todas)/.test(paragraph.trim())) break;
      content.push(plainText(paragraph));
    }
    const text = content.join("\n\n").trim();
    const id = url.match(/-r(\d+)-/)?.[1];
    if (!id || text.length < 10 || text.length > 12000 || author.length > 200) continue;
    const publication = suffix.match(/(?:Feita|Escrita) em \d{1,2} de \S+ de \d{4}/i)?.[0] ?? "";
    result.set(id, { id, author: plainText(author), title: plainText(title[1]), text, rating, date_label: dateLabel, published_at: publishedDate(publication), url });
  }
  if (!result.size) throw new Error("Tripadvisor: nenhuma avaliação completa encontrada; mantendo a última importação.");
  return [...result.values()].sort((a, b) => (b.published_at ?? "").localeCompare(a.published_at ?? "")).slice(0, 30);
}