import type { Match } from "@/hooks/useMatches";

// URLs públicas do bucket site-images (fallbacks; admin pode trocar via site_images)
export const NFL_MATCH_IMAGE =
  "https://ogzasprtfgimjqrtcseg.supabase.co/storage/v1/object/public/site-images/nfl-hero.jpg";
export const NILTON_SANTOS_MATCH_IMAGE =
  "https://ogzasprtfgimjqrtcseg.supabase.co/storage/v1/object/public/site-images/nilton-santos-hero.jpg";
export const SAO_JANUARIO_MATCH_IMAGE =
  "https://ogzasprtfgimjqrtcseg.supabase.co/storage/v1/object/public/site-images/sao-januario-hero.jpg";

const norm = (s?: string) =>
  (s || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

export function isNflMatch(match: Partial<Match>): boolean {
  return norm(match.competition).includes("nfl");
}

export type MatchVenueKey = "maracana" | "nilton_santos" | "sao_januario";

export function getMatchVenueKey(match: Partial<Match>): MatchVenueKey {
  const s = norm(match.stadium || match.venue);
  if (s.includes("nilton santos") || s.includes("engenhao")) return "nilton_santos";
  if (s.includes("sao januario")) return "sao_januario";
  return "maracana";
}

/**
 * Imagem do card do jogo (home, calendário, etc.).
 * NFL e jogos fora do Maracanã ganham foto própria; o restante mantém a lógica atual.
 */
export function getMatchCardImage(match: Partial<Match>): string | null {
  if (isNflMatch(match)) return NFL_MATCH_IMAGE;
  const venue = getMatchVenueKey(match);
  if (venue === "nilton_santos") return NILTON_SANTOS_MATCH_IMAGE;
  if (venue === "sao_januario") return SAO_JANUARIO_MATCH_IMAGE;
  return null; // Maracanã: mantém imagem existente (fla/flu capa ou genérica)
}

/**
 * Imagem do hero da página do jogo. Permite override via site_images
 * (nfl_hero, nilton_santos_hero, sao_januario_hero); fallback para o bucket.
 */
export function getMatchHeroImage(
  match: Partial<Match>,
  images: Record<string, string>,
  maracanaFallback: string
): string {
  if (isNflMatch(match)) return images["nfl_hero"] || NFL_MATCH_IMAGE;
  const venue = getMatchVenueKey(match);
  if (venue === "nilton_santos")
    return images["nilton_santos_hero"] || NILTON_SANTOS_MATCH_IMAGE;
  if (venue === "sao_januario")
    return images["sao_januario_hero"] || SAO_JANUARIO_MATCH_IMAGE;
  return images["maracana_hero"] || maracanaFallback;
}

export function getMatchHeroAlt(match: Partial<Match>): string {
  if (isNflMatch(match)) return "NFL game in Rio de Janeiro";
  const venue = getMatchVenueKey(match);
  if (venue === "nilton_santos") return "Estádio Nilton Santos (Engenhão)";
  if (venue === "sao_januario") return "Estádio São Januário";
  return "Maracanã Stadium";
}

export function getMatchCardDescription(
  match: Partial<Match>,
  rawLanguage: string
): string {
  const language: "pt" | "en" | "es" =
    rawLanguage === "pt" || rawLanguage === "es" ? rawLanguage : "en";
  const venue = getMatchVenueKey(match);

  if (language === "pt") {
    if (venue === "nilton_santos")
      return "Experiência completa no Estádio Nilton Santos (Engenhão). Inclui guia, transfer e ingresso oficial.";
    if (venue === "sao_januario")
      return "Experiência completa no Estádio São Januário. Inclui guia, transfer e ingresso oficial.";
    return "Experiência completa no Maracanã. Inclui guia, transfer e ingresso oficial.";
  }

  if (language === "es") {
    if (venue === "nilton_santos")
      return "Experiencia completa en el Estádio Nilton Santos (Engenhão). Incluye guía, traslado y entrada oficial.";
    if (venue === "sao_januario")
      return "Experiencia completa en el Estádio São Januário. Incluye guía, traslado y entrada oficial.";
    return "Experiencia completa en el Maracanã. Incluye guía, traslado y entrada oficial.";
  }

  if (venue === "nilton_santos")
    return "Complete experience at Nilton Santos Stadium (Engenhão). Includes guide, transfer, and official ticket.";
  if (venue === "sao_januario")
    return "Complete experience at São Januário Stadium. Includes guide, transfer, and official ticket.";
  return "Complete Maracanã experience. Includes guide, transfer, and official ticket.";
}
