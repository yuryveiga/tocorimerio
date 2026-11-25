// Edite aqui os textos, fotos e o WhatsApp da página /vendas.
// image: deixe vazio ("") para usar a foto do primeiro passeio da categoria.
type Txt = { pt: string; en: string; es: string; de: string; fr: string; it: string };

export interface VendasCategory {
  slug: string;        // endereço em /vendas/<slug>
  categoria: string;   // categoria dos passeios no painel
  sitePath: string;    // página completa no site
  name: Txt;
  description: Txt;
  image: string;
  photoFrom?: string; // usa a foto do passeio cujo endereço contém este texto
}

export const VENDAS_WHATSAPP = "5521970702523";
export const VENDAS_SITE_URL = "https://tocorimerio.com";

export const VENDAS_CATEGORIES: VendasCategory[] = [
  {
    slug: "city-tour", categoria: "city-tour", sitePath: "/city-tour", image: "", photoFrom: "cristo",
    name: { pt: "City Tour", en: "City Tour", es: "City Tour", de: "Stadttour", fr: "Visite de la ville", it: "Tour della città" },
    description: {
      pt: "Os cartões-postais do Rio com guia local.", en: "Rio's iconic landmarks with a local guide.",
      es: "Las postales de Río con guía local.", de: "Rios Wahrzeichen mit lokalem Guide.",
      fr: "Les lieux iconiques de Rio avec un guide local.", it: "Le cartoline di Rio con una guida locale.",
    },
  },
  {
    slug: "trilha", categoria: "trilha", sitePath: "/hiking", image: "", photoFrom: "pedra-da-gavea",
    name: { pt: "Trilha", en: "Hiking", es: "Senderismo", de: "Wandern", fr: "Randonnée", it: "Trekking" },
    description: {
      pt: "Vistas incríveis e natureza, para todos os níveis.", en: "Amazing views and nature for every level.",
      es: "Vistas increíbles y naturaleza para todos los niveles.", de: "Traumhafte Aussichten für jedes Niveau.",
      fr: "Des vues incroyables pour tous les niveaux.", it: "Viste incredibili per tutti i livelli.",
    },
  },
  {
    slug: "um-dia", categoria: "um-dia", sitePath: "/one-day", image: "",
    name: { pt: "Um Dia", en: "One Day", es: "Un Día", de: "Ein Tag", fr: "Une journée", it: "Un giorno" },
    description: {
      pt: "Um dia completo explorando o melhor do Rio.", en: "A full day exploring the best of Rio.",
      es: "Un día completo explorando lo mejor de Río.", de: "Ein ganzer Tag mit dem Besten von Rio.",
      fr: "Une journée complète au meilleur de Rio.", it: "Una giornata intera nel meglio di Rio.",
    },
  },
];
