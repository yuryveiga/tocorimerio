import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { getCanonicalUrl, generateSportsEventSchema, generateBreadcrumbsSchema, generateFAQSchema } from "@/utils/seo";

const TARGET_DATE = new Date('2026-08-11T19:00:00-03:00');
const BOOKING_URL = "https://tocorimerio.com/match/fluminense-vs-independiente-rivadavia-2026-08-11";
const WHATSAPP_URL = "https://wa.me/5521990090708";
const PAGE_PATH = "/fluminense-indenpediente-rivadavia-libertadores-maracana";

// ─── i18n ──────────────────────────────────────────────────────────────────────
type Lang = 'en' | 'pt' | 'es';
type Currency = 'USD' | 'BRL' | 'EUR';

const RATES: Record<Currency, number> = { USD: 1, BRL: 5.65, EUR: 0.93 };
const CURRENCY_SYMBOL: Record<Currency, string> = { USD: '$', BRL: 'R$', EUR: '€' };

function fmtPrice(usd: number, currency: Currency): string {
  const val = Math.round(usd * RATES[currency]);
  return `${CURRENCY_SYMBOL[currency]} ${val.toLocaleString('en-US')}`;
}

const T: Record<Lang, {
  badge: string;
  stage: string;
  date: string;
  kickoff: string;
  venue: string;
  headline: string;
  bookNow: string;
  seeIncluded: string;
  scroll: string;
  urgency: string;
  watchTitle: string;
  watchSub: string;
  sectorsLabel: string;
  sectorsTitle: string;
  sectorsSub: string;
  perPerson: string;
  available: string;
  onRequest: string;
  checkAvail: string;
  bookSector: string;
  includedLabel: string;
  includedTitle: string;
  includedSub: string;
  whyLabel: string;
  whyTitle: string;
  whyLead: string;
  iwantBtn: string;
  howLabel: string;
  howTitle: string;
  steps: { title: string; desc: string }[];
  reviewsLabel: string;
  reviewsTitle: string;
  reviews: { text: string; author: string; country: string }[];
  faqLabel: string;
  faqTitle: string;
  faqs: { q: string; a: string }[];
  ctaLabel: string;
  ctaTitle: string;
  ctaDate: string;
  from: string;
  secure: string;
  ctaNote: string;
  whatsappCta: string;
  included: { title: string; desc: string }[];
  sectorsData: { tier: string; name: string; usd: number; featured?: boolean; badge?: string; features: { text: string; strike?: boolean }[]; btn: string; btnClass: string }[];
}> = {
  en: {
    badge: "CONMEBOL Libertadores 2026 · Round of 16 · 1st Leg",
    stage: "Round of 16 · 1st Leg",
    date: "Tue, Aug 11 · 2026",
    kickoff: "19:00 BRT",
    venue: "Estádio do Maracanã",
    headline: "Live at Maracanã — The Cathedral of Football",
    bookNow: "Book Now",
    seeIncluded: "See What's Included",
    scroll: "Scroll",
    urgency: "🏆 COPA LIBERTADORES — Round of 16 · The biggest club competition in South America is here. 78,000 fans. One stadium. One night.",
    watchTitle: "Feel the Maracanã Atmosphere",
    watchSub: "Watch",
    sectorsLabel: "Choose Your Experience",
    sectorsTitle: "Sectors & Packages",
    sectorsSub: "Official Maracanã sectors. Every package includes the official ticket, round-trip transfer (Ipanema / Copacabana) and a trilingual guide.",
    perPerson: "per person",
    available: "Available",
    onRequest: "On Request",
    checkAvail: "Check Availability",
    bookSector: "Book",
    includedLabel: "The Tocorimerio Way",
    includedTitle: "Everything Handled.",
    includedSub: "We've been taking travellers to Brazilian football since the very beginning. You just show up — we do the rest.",
    whyLabel: "Why This Match Matters",
    whyTitle: "Fluminense in\nthe Libertadores",
    whyLead: "Fluminense — the 2023 Copa Libertadores champions — face Argentina's Independiente Rivadavia in the Round of 16 at the Maracanã. With 78,000 fans singing under the stadium lights, this is South American football at its most electric. Don't just watch it on TV.",
    iwantBtn: "I Want to Be There",
    howLabel: "Simple Process",
    howTitle: "How It Works",
    steps: [
      { title: "Book Online", desc: "Choose your sector and complete checkout in under 3 minutes. Instant confirmation email." },
      { title: "We Pick You Up", desc: "Your guide meets you at your hotel or designated Ipanema / Copacabana pickup point." },
      { title: "Pre-Match Vibes", desc: "Join the group for food, drinks and pre-match energy at a local favourite near the stadium." },
      { title: "The Beautiful Game", desc: "Experience Copa Libertadores football live inside the greatest stadium in South America." },
      { title: "Safe Return", desc: "We bring you back after the final whistle, relaxed and with memories to last a lifetime." },
    ],
    reviewsLabel: "What People Say",
    reviewsTitle: "Real Reviews",
    reviews: [
      { text: '"Absolutely unforgettable. The guide knew everything — the history, the chants, where to sit for the best view. Flu scored twice in injury time and I cried. 10/10 would do again."', author: "James H.", country: "United Kingdom" },
      { text: '"I was nervous about going alone as a solo traveller. The team made it so easy. I ended up befriending locals, shared beer and sang like I\'d been a Flu fan for years."', author: "Sofia M.", country: "Germany" },
      { text: '"The transfer was super comfortable and the guide was hilarious and knowledgeable. Seeing Maracanã at night lit up for a Libertadores match — there\'s nothing like it."', author: "Daniel K.", country: "United States" },
    ],
    faqLabel: "Common Questions",
    faqTitle: "FAQ",
    faqs: [
      { q: "Do I need a CPF or biometric to attend?", a: "Some sectors require Brazilian CPF and biometric facial registration. We fully assist foreign visitors with this process — just let us know when booking." },
      { q: "Is the transfer included?", a: "Yes. Every package includes round-trip transfer from your hotel or a designated point in Ipanema or Copacabana." },
      { q: "What language is the guide in?", a: "Your guide speaks English, Spanish and Portuguese (trilingual)." },
      { q: "What if the match is postponed?", a: "If the match is officially postponed, you receive a full refund or the option to rebook." },
      { q: "Is it safe to go to the stadium?", a: "With Tocorimerio, yes. We navigate the stadium zone, manage your entry and ensure you're always in a safe group." },
    ],
    ctaLabel: "Limited Availability",
    ctaTitle: "Don't Miss Aug 11",
    ctaDate: "August 11",
    from: "Packages from",
    secure: "Secure My Spot Now",
    ctaNote: "Instant confirmation · Secure payment · Free cancellation up to 72h before",
    whatsappCta: "Chat on WhatsApp",
    included: [
      { title: "Official Tickets", desc: "Guaranteed authentic tickets — no third-party resellers or scalper risk. Your seat is confirmed before you book." },
      { title: "Round-Trip Transfer", desc: "Comfortable, air-conditioned pickup from Ipanema or Copacabana. We navigate traffic so you don't have to." },
      { title: "Trilingual Guide", desc: "A passionate local football fan walks you through the rituals, chants, history and madness of Flu at the Maracanã. English · Spanish · Portuguese." },
      { title: "Pre-Match Meetup", desc: "Join your group at a local bar near the stadium. Cold chopp, street food, and genuine tricolor atmosphere." },
      { title: "Safety & Peace of Mind", desc: "We know the city. From the moment you're picked up to when you're dropped back, you're in safe hands." },
    ],
    sectorsData: [
      {
        tier: "Best Value",
        name: "Regular — West Upper",
        usd: 89,
        featured: true,
        badge: "Available",
        features: [
          { text: "Upper West Sector (unassigned seating)" },
          { text: "No biometric registration required" },
          { text: "Parking lot access (faster, safer entry)" },
          { text: "Round-trip transfer (Ipanema / Copa)" },
          { text: "Trilingual guide (EN / PT / ES)" },
          { text: "Support staff throughout the event" },
        ],
        btn: "Book West Upper",
        btnClass: "green",
      },
      {
        tier: "On Request",
        name: "Regular — West Lower",
        usd: 99,
        features: [
          { text: "Lower West Sector — seat right next to the pitch" },
          { text: "Biometric facial registration required (we assist)" },
          { text: "Round-trip transfer + trilingual guide" },
          { text: "Does not include parking lot access", strike: true },
        ],
        btn: "Check Availability",
        btnClass: "outline",
      },
      {
        tier: "All-Inclusive",
        name: "Regular + Maracanã Club",
        usd: 135,
        features: [
          { text: "Upper West Sector + Maracanã Club access" },
          { text: "Food: appetizers, hot dogs, hot dishes, desserts" },
          { text: "Open bar: water, Coca-Cola, mate & Brahma draft beer" },
          { text: "Parking access, transfer and trilingual guide" },
        ],
        btn: "Check Maracanã Club",
        btnClass: "outline",
      },
      {
        tier: "Premium",
        name: "Premium Maracanã Mais",
        usd: 249,
        features: [
          { text: "Premium pitch-side hospitality" },
          { text: "Assigned seat next to the field" },
          { text: "Biometric facial registration required (we assist)" },
          { text: "Food & drinks included (draft beer sold separately)" },
          { text: "Parking access, transfer and trilingual guide" },
        ],
        btn: "Check Premium",
        btnClass: "outline",
      },
    ],
  },
  pt: {
    badge: "CONMEBOL Libertadores 2026 · Oitavas de Final · Jogo 1",
    stage: "Oitavas · Jogo 1",
    date: "Ter, 11 Ago · 2026",
    kickoff: "19:00 BRT",
    venue: "Estádio do Maracanã",
    headline: "Ao Vivo no Maracanã — A Catedral do Futebol",
    bookNow: "Reservar",
    seeIncluded: "Ver o que está incluído",
    scroll: "Role",
    urgency: "🏆 COPA LIBERTADORES — Oitavas de Final · A maior competição de clubes da América do Sul. 78.000 torcedores. Um estádio. Uma noite.",
    watchTitle: "Sinta a Atmosfera do Maracanã",
    watchSub: "Assista",
    sectorsLabel: "Escolha sua Experiência",
    sectorsTitle: "Setores & Pacotes",
    sectorsSub: "Setores oficiais do Maracanã. Cada pacote inclui o ingresso oficial, transfer (Ipanema / Copacabana) e guia trilíngue.",
    perPerson: "por pessoa",
    available: "Disponível",
    onRequest: "Sob Consulta",
    checkAvail: "Verificar Disponibilidade",
    bookSector: "Reservar",
    includedLabel: "O Jeito Tocorimerio",
    includedTitle: "Tudo Resolvido.",
    includedSub: "Levamos viajantes ao futebol brasileiro desde o início. Você só aparece — nós cuidamos do resto.",
    whyLabel: "Por que este jogo importa",
    whyTitle: "Fluminense nas\nLibertadores",
    whyLead: "O Fluminense — campeão da Copa Libertadores 2023 — enfrenta o Independiente Rivadavia da Argentina nas Oitavas de Final no Maracanã. Com 78.000 torcedores cantando sob as luzes do estádio, este é o futebol sul-americano em seu estado mais elétrico. Não assista apenas pela TV.",
    iwantBtn: "Quero Estar Lá",
    howLabel: "Processo Simples",
    howTitle: "Como Funciona",
    steps: [
      { title: "Reserve Online", desc: "Escolha seu setor e finalize em menos de 3 minutos. Confirmação imediata por e-mail." },
      { title: "Buscamos Você", desc: "Seu guia te encontra no hotel ou ponto de embarque em Ipanema / Copacabana." },
      { title: "Pré-Jogo", desc: "Junte-se ao grupo para comida, bebida e energia pré-jogo num bar local perto do estádio." },
      { title: "O Jogo Bonito", desc: "Experimente a Copa Libertadores ao vivo no maior estádio da América do Sul." },
      { title: "Retorno Seguro", desc: "Te levamos de volta após o apito final, relaxado e com memórias eternas." },
    ],
    reviewsLabel: "O que dizem",
    reviewsTitle: "Avaliações Reais",
    reviews: [
      { text: '"Absolutamente inesquecível. O guia sabia tudo — história, cantos, onde sentar. O Flu marcou no acréscimo e eu chorei. Nota 10."', author: "James H.", country: "Reino Unido" },
      { text: '"Fui sozinho e estava nervoso. A equipe facilitou tudo. Acabei fazendo amigos locais, compartilhando cerveja e cantando como se fosse tricolor de coração."', author: "Sofia M.", country: "Alemanha" },
      { text: '"O transfer foi confortável e o guia foi incrível. Ver o Maracanã à noite iluminado para uma Libertadores — não existe nada igual."', author: "Daniel K.", country: "Estados Unidos" },
    ],
    faqLabel: "Dúvidas Frequentes",
    faqTitle: "FAQ",
    faqs: [
      { q: "Preciso de CPF ou biometria?", a: "Alguns setores exigem CPF brasileiro e cadastro de biometria facial. Auxiliamos visitantes estrangeiros em todo o processo — informe ao reservar." },
      { q: "O transfer está incluído?", a: "Sim. Todos os pacotes incluem transfer de ida e volta do seu hotel ou ponto em Ipanema / Copacabana." },
      { q: "Em qual idioma é a guia?", a: "O guia fala inglês, espanhol e português (trilíngue)." },
      { q: "E se o jogo for adiado?", a: "Em caso de adiamento oficial, você recebe reembolso integral ou opção de remarcação." },
      { q: "É seguro ir ao estádio?", a: "Com a Tocorimerio, sim. Gerenciamos sua entrada e mantemos o grupo sempre em segurança." },
    ],
    ctaLabel: "Disponibilidade Limitada",
    ctaTitle: "Não perca 11 de Agosto",
    ctaDate: "11 de Agosto",
    from: "Pacotes a partir de",
    secure: "Garantir Meu Lugar",
    ctaNote: "Confirmação imediata · Pagamento seguro · Cancelamento gratuito até 72h antes",
    whatsappCta: "Falar no WhatsApp",
    included: [
      { title: "Ingressos Oficiais", desc: "Ingressos autênticos garantidos — sem revendedores ou risco de fraude. Seu assento é confirmado antes de reservar." },
      { title: "Transfer Ida e Volta", desc: "Pickup confortável com ar-condicionado de Ipanema ou Copacabana. Navegamos o trânsito por você." },
      { title: "Guia Trilíngue", desc: "Um apaixonado torcedor local que te apresenta rituais, cantos e história do Flu no Maracanã. Inglês · Espanhol · Português." },
      { title: "Encontro Pré-Jogo", desc: "Junte-se ao grupo num bar local perto do estádio. Chopp gelado, comida de rua e atmosfera tricolor." },
      { title: "Segurança e Tranquilidade", desc: "Conhecemos a cidade. Do pickup ao retorno, você está em boas mãos." },
    ],
    sectorsData: [
      {
        tier: "Melhor Custo-Benefício",
        name: "Regular — Oeste Superior",
        usd: 89,
        featured: true,
        badge: "Disponível",
        features: [
          { text: "Setor Oeste Superior (assento livre)" },
          { text: "Sem necessidade de biometria" },
          { text: "Acesso pela área de estacionamento (entrada mais rápida e segura)" },
          { text: "Transfer (Ipanema / Copacabana)" },
          { text: "Guia trilíngue (EN / PT / ES)" },
          { text: "Suporte durante todo o evento" },
        ],
        btn: "Reservar Oeste Superior",
        btnClass: "green",
      },
      {
        tier: "Sob Consulta",
        name: "Regular — Oeste Inferior",
        usd: 99,
        features: [
          { text: "Setor Oeste Inferior — assento perto do gramado" },
          { text: "Biometria facial necessária (auxiliamos)" },
          { text: "Transfer + guia trilíngue" },
          { text: "Não inclui acesso pelo estacionamento", strike: true },
        ],
        btn: "Verificar Disponibilidade",
        btnClass: "outline",
      },
      {
        tier: "All-Inclusive",
        name: "Regular + Maracanã Club",
        usd: 135,
        features: [
          { text: "Oeste Superior + acesso ao Maracanã Club" },
          { text: "Comida: petiscos, cachorro-quente, pratos quentes, sobremesas" },
          { text: "Bar livre: água, Coca-Cola, mate e chopp Brahma" },
          { text: "Estacionamento, transfer e guia trilíngue" },
        ],
        btn: "Ver Maracanã Club",
        btnClass: "outline",
      },
      {
        tier: "Premium",
        name: "Premium Maracanã Mais",
        usd: 249,
        features: [
          { text: "Hospitalidade premium à beira do gramado" },
          { text: "Assento numerado ao lado do campo" },
          { text: "Biometria facial necessária (auxiliamos)" },
          { text: "Comida & bebida incluídas (chopp vendido separadamente)" },
          { text: "Estacionamento, transfer e guia trilíngue" },
        ],
        btn: "Ver Premium",
        btnClass: "outline",
      },
    ],
  },
  es: {
    badge: "CONMEBOL Libertadores 2026 · Octavos de Final · Partido 1",
    stage: "Octavos · Partido 1",
    date: "Mar, 11 Ago · 2026",
    kickoff: "19:00 BRT",
    venue: "Estadio Maracanã",
    headline: "En Vivo en el Maracanã — La Catedral del Fútbol",
    bookNow: "Reservar",
    seeIncluded: "Ver qué incluye",
    scroll: "Bajar",
    urgency: "🏆 COPA LIBERTADORES — Octavos de Final · La competición de clubes más grande de Sudamérica. 78.000 hinchas. Un estadio. Una noche.",
    watchTitle: "Siente la Atmósfera del Maracanã",
    watchSub: "Ver",
    sectorsLabel: "Elige tu Experiencia",
    sectorsTitle: "Sectores y Paquetes",
    sectorsSub: "Sectores oficiales del Maracanã. Cada paquete incluye la entrada oficial, traslado (Ipanema / Copacabana) y guía trilingüe.",
    perPerson: "por persona",
    available: "Disponible",
    onRequest: "A Consultar",
    checkAvail: "Consultar Disponibilidad",
    bookSector: "Reservar",
    includedLabel: "El Estilo Tocorimerio",
    includedTitle: "Todo Resuelto.",
    includedSub: "Llevamos viajeros al fútbol brasileño desde el principio. Tú solo apareces — nosotros hacemos el resto.",
    whyLabel: "Por qué importa este partido",
    whyTitle: "Fluminense en\nla Libertadores",
    whyLead: "Fluminense — campeón de la Copa Libertadores 2023 — enfrenta al Independiente Rivadavia de Argentina en los Octavos de Final en el Maracanã. Con 78.000 hinchas cantando bajo las luces del estadio, este es el fútbol sudamericano en su máxima expresión. No lo veas solo por televisión.",
    iwantBtn: "Quiero Estar Ahí",
    howLabel: "Proceso Simple",
    howTitle: "Cómo Funciona",
    steps: [
      { title: "Reserva Online", desc: "Elige tu sector y finaliza en menos de 3 minutos. Confirmación instantánea por email." },
      { title: "Te Buscamos", desc: "Tu guía te espera en el hotel o en el punto de recogida en Ipanema / Copacabana." },
      { title: "Pre-Partido", desc: "Únete al grupo para comida, bebida y energía pre-partido en un bar local cerca del estadio." },
      { title: "El Juego Bonito", desc: "Vive la Copa Libertadores en vivo en el estadio más grande de Sudamérica." },
      { title: "Regreso Seguro", desc: "Te llevamos de vuelta al final del partido, relajado y con recuerdos para siempre." },
    ],
    reviewsLabel: "Lo que dicen",
    reviewsTitle: "Reseñas Reales",
    reviews: [
      { text: '"Absolutamente inolvidable. El guía sabía todo — historia, cánticos, dónde sentarse. El Flu marcó en el descuento y lloré. 10/10 lo repetiría."', author: "James H.", country: "Reino Unido" },
      { text: '"Fui solo y estaba nervioso. El equipo lo hizo muy fácil. Terminé haciendo amigos locales, compartiendo cerveza y cantando como si fuera hincha de siempre."', author: "Sofia M.", country: "Alemania" },
      { text: '"El traslado fue muy cómodo y el guía fue increíble. Ver el Maracanã de noche iluminado para una Libertadores — no hay nada igual."', author: "Daniel K.", country: "Estados Unidos" },
    ],
    faqLabel: "Preguntas Frecuentes",
    faqTitle: "FAQ",
    faqs: [
      { q: "¿Necesito CPF o biometría?", a: "Algunos sectores requieren CPF brasileño y registro de biometría facial. Asistimos a los visitantes extranjeros en todo el proceso — infórmalo al reservar." },
      { q: "¿El traslado está incluido?", a: "Sí. Todos los paquetes incluyen traslado de ida y vuelta desde tu hotel o punto en Ipanema / Copacabana." },
      { q: "¿En qué idioma es el guía?", a: "El guía habla inglés, español y portugués (trilingüe)." },
      { q: "¿Y si el partido se pospone?", a: "Si el partido se pospone oficialmente, recibes reembolso completo o la opción de reprogramar." },
      { q: "¿Es seguro ir al estadio?", a: "Con Tocorimerio, sí. Gestionamos tu entrada y mantenemos al grupo siempre en seguridad." },
    ],
    ctaLabel: "Disponibilidad Limitada",
    ctaTitle: "No te pierdas el 11 de Agosto",
    ctaDate: "11 de Agosto",
    from: "Paquetes desde",
    secure: "Asegurar Mi Lugar",
    ctaNote: "Confirmación instantánea · Pago seguro · Cancelación gratuita hasta 72h antes",
    whatsappCta: "Chatear en WhatsApp",
    included: [
      { title: "Entradas Oficiales", desc: "Entradas auténticas garantizadas — sin revendedores ni riesgo de fraude. Tu asiento está confirmado antes de reservar." },
      { title: "Traslado de Ida y Vuelta", desc: "Recogida cómoda con aire acondicionado desde Ipanema o Copacabana. Manejamos el tráfico por ti." },
      { title: "Guía Trilingüe", desc: "Un apasionado hincha local que te presenta rituales, cánticos e historia del Flu en el Maracanã. Inglés · Español · Portugués." },
      { title: "Encuentro Pre-Partido", desc: "Únete al grupo en un bar local cerca del estadio. Cerveza fría, comida de la calle y ambiente tricolor." },
      { title: "Seguridad y Tranquilidad", desc: "Conocemos la ciudad. Desde la recogida hasta el regreso, estás en buenas manos." },
    ],
    sectorsData: [
      {
        tier: "Mejor Relación Calidad/Precio",
        name: "Regular — Oeste Superior",
        usd: 89,
        featured: true,
        badge: "Disponible",
        features: [
          { text: "Sector Oeste Superior (asiento libre)" },
          { text: "Sin necesidad de biometría" },
          { text: "Acceso por zona de estacionamiento (entrada más rápida y segura)" },
          { text: "Traslado (Ipanema / Copacabana)" },
          { text: "Guía trilingüe (EN / PT / ES)" },
          { text: "Personal de apoyo durante el evento" },
        ],
        btn: "Reservar Oeste Superior",
        btnClass: "green",
      },
      {
        tier: "A Consultar",
        name: "Regular — Oeste Inferior",
        usd: 99,
        features: [
          { text: "Sector Oeste Inferior — asiento junto al campo" },
          { text: "Biometría facial requerida (te asistimos)" },
          { text: "Traslado + guía trilingüe" },
          { text: "No incluye acceso por estacionamiento", strike: true },
        ],
        btn: "Consultar Disponibilidad",
        btnClass: "outline",
      },
      {
        tier: "Todo Incluido",
        name: "Regular + Maracanã Club",
        usd: 135,
        features: [
          { text: "Oeste Superior + acceso al Maracanã Club" },
          { text: "Comida: aperitivos, hot dogs, platos calientes, postres" },
          { text: "Barra libre: agua, Coca-Cola, mate y cerveza Brahma" },
          { text: "Estacionamiento, traslado y guía trilingüe" },
        ],
        btn: "Ver Maracanã Club",
        btnClass: "outline",
      },
      {
        tier: "Premium",
        name: "Premium Maracanã Mais",
        usd: 249,
        features: [
          { text: "Hospitalidad premium junto al campo" },
          { text: "Asiento numerado al lado del terreno" },
          { text: "Biometría facial requerida (te asistimos)" },
          { text: "Comida y bebida incluidas (cerveza vendida por separado)" },
          { text: "Estacionamiento, traslado y guía trilingüe" },
        ],
        btn: "Ver Premium",
        btnClass: "outline",
      },
    ],
  },
};

// ─── Component ─────────────────────────────────────────────────────────────────
const FluminenseIndependienteRivadaviaLibertadores = () => {
  const [lang, setLang] = useState<Lang>('en');
  const [currency, setCurrency] = useState<Currency>('USD');
  const [timeLeft, setTimeLeft] = useState({ days: "00", hours: "00", minutes: "00", seconds: "00", isLive: false });
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const t = T[lang];

  // Countdown
  useEffect(() => {
    const tick = () => {
      const diff = TARGET_DATE.getTime() - Date.now();
      if (diff <= 0) { setTimeLeft(p => ({ ...p, isLive: true })); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft({ days: String(d).padStart(2,'0'), hours: String(h).padStart(2,'0'), minutes: String(m).padStart(2,'0'), seconds: String(s).padStart(2,'0'), isLive: false });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // Scroll fade-in
  useEffect(() => {
    const els = document.querySelectorAll('.riv-fade');
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('riv-visible'); });
    }, { threshold: 0.1 });
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, [lang]);

  const canonical = getCanonicalUrl(PAGE_PATH);
  const OG_IMAGE = "https://lncimg.lance.com.br/cdn-cgi/image/width=1600,quality=80,fit=cover,format=webp/uploads/2016/10/19/5807e137e598d.jpeg";

  const SEO: Record<Lang, { title: string; description: string; ogTitle: string; keywords: string; locale: string; htmlLang: string }> = {
    pt: {
      title: "Fluminense x Independiente Rivadavia no Maracanã (11/08/2026) — Ingressos + Transfer",
      description: "Fluminense x Independiente Rivadavia pelas oitavas da Libertadores 2026, 11 de agosto no Maracanã. Pacote com ingresso oficial, transfer de Ipanema/Copacabana e guia trilíngue. Reserve online com confirmação imediata.",
      ogTitle: "Fluminense x Independiente Rivadavia — Libertadores 2026 no Maracanã",
      keywords: "ingressos Fluminense x Independiente Rivadavia, Fluminense Libertadores 2026, jogo no Maracanã 11 de agosto, comprar ingresso Maracanã, pacote jogo Maracanã com transfer, oitavas de final Libertadores 2026, Fluminense Maracanã ingressos, futebol no Rio de Janeiro",
      locale: "pt_BR",
      htmlLang: "pt-BR",
    },
    en: {
      title: "Fluminense vs Independiente Rivadavia Tickets — Maracanã, Aug 11 2026 | Libertadores",
      description: "Fluminense vs Independiente Rivadavia, Copa Libertadores 2026 Round of 16 at the Maracanã on Aug 11. Matchday package with official ticket, round-trip transfer from Ipanema/Copacabana and a trilingual guide. Foreign visitors welcome.",
      ogTitle: "Fluminense vs Independiente Rivadavia — Copa Libertadores 2026 | Maracanã",
      keywords: "Fluminense vs Independiente Rivadavia tickets, Copa Libertadores 2026 tickets, Maracana tickets for foreigners, buy Libertadores tickets Rio, Maracana matchday package, Rio de Janeiro football tickets, Fluminense match tickets, football experience Rio",
      locale: "en_US",
      htmlLang: "en",
    },
    es: {
      title: "Entradas Fluminense vs Independiente Rivadavia — Maracaná, 11/08/2026 | Libertadores",
      description: "Fluminense vs Independiente Rivadavia por los octavos de la Copa Libertadores 2026, el 11 de agosto en el Maracaná. Paquete con entrada oficial, traslado desde Ipanema/Copacabana y guía trilingüe. Reserva online con confirmación inmediata.",
      ogTitle: "Fluminense vs Independiente Rivadavia — Libertadores 2026 en el Maracaná",
      keywords: "entradas Fluminense vs Independiente Rivadavia, Copa Libertadores 2026 entradas, entradas Maracaná extranjeros, comprar entradas Libertadores Río, paquete partido Maracaná, octavos de final Libertadores 2026, fútbol en Río de Janeiro, Independiente Rivadavia Libertadores",
      locale: "es_ES",
      htmlLang: "es",
    },
  };
  const seo = SEO[lang];
  const hreflang = [
    { hreflang: "pt-BR", href: `${canonical}?lang=pt` },
    { hreflang: "en", href: `${canonical}?lang=en` },
    { hreflang: "es", href: `${canonical}?lang=es` },
    { hreflang: "x-default", href: canonical },
  ];

  const waLink = `${WHATSAPP_URL}?text=${encodeURIComponent(
    lang === 'pt'
      ? 'Olá! Tenho interesse no pacote Fluminense x Independiente Rivadavia Libertadores. Pode me ajudar?'
      : lang === 'es'
      ? '¡Hola! Me interesa el paquete Fluminense vs Independiente Rivadavia Libertadores. ¿Pueden ayudarme?'
      : "Hello! I'm interested in the Fluminense vs Independiente Rivadavia Libertadores package. Can you help me?"
  )}`;

  return (
    <div className="riv-page">
      <Helmet>
        <html lang={seo.htmlLang} />
        <title>{seo.title}</title>
        <meta name="description" content={seo.description} />
        <link rel="canonical" href={canonical} />
        {hreflang.map(h => <link key={h.hreflang} rel="alternate" hrefLang={h.hreflang} href={h.href} />)}
        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonical} />
        <meta property="og:title" content={seo.ogTitle} />
        <meta property="og:description" content={seo.description} />
        <meta property="og:image" content={OG_IMAGE} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:locale" content={seo.locale} />
        <meta property="og:site_name" content="Tocorime Rio" />
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seo.ogTitle} />
        <meta name="twitter:description" content={seo.description} />
        <meta name="twitter:image" content={OG_IMAGE} />
        {/* Keywords */}
        <meta name="keywords" content={seo.keywords} />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
        {/* Schema */}
        <script type="application/ld+json">
          {JSON.stringify({ ...generateSportsEventSchema({
            name: "Fluminense vs Independiente Rivadavia — Copa Libertadores 2026",
            description: seo.description,
            startDate: TARGET_DATE.toISOString(),
            imageUrl: OG_IMAGE,
            url: canonical,
            homeTeam: "Fluminense FC",
            awayTeam: "Independiente Rivadavia",
            venueName: "Estádio do Maracanã",
            offerUrl: BOOKING_URL,
            offerPrice: 89,
            offerCurrency: "USD",
          }), inLanguage: seo.htmlLang })}
        </script>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            ...generateFAQSchema(T[lang].faqs),
            inLanguage: seo.htmlLang,
          })}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(generateBreadcrumbsSchema([
            { name: lang === 'pt' ? "Início" : lang === 'es' ? "Inicio" : "Home", url: getCanonicalUrl("/") },
            { name: "Football Experiences in Rio", url: getCanonicalUrl("/football-experiences-in-rio-de-janeiro") },
            { name: "Fluminense vs Independiente Rivadavia", url: canonical },
          ]))}
        </script>
        <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:ital,wght@0,400;0,600;0,700;1,400&family=Barlow:wght@400;500&display=swap" rel="stylesheet" />
      </Helmet>

      <style dangerouslySetInnerHTML={{ __html: `
        .riv-page {
          --flu-green: #1a7a2e;
          --flu-green-light: #2ecc5a;
          --flu-maroon: #8b0000;
          --lib-gold: #c9a227;
          --lib-gold-light: #f0c84a;
          --lib-bg: #0e0c08;
          --lib-bg2: #141209;
          --lib-bg3: #1a1710;
          --lib-mid: #2a2820;
          --lib-cream: #f0ead8;
          --lib-text: #e5ddc8;
          --lib-dim: #7a7360;
          --riv-blue: #003b96;
          --riv-blue-light: #4d82e0;

          background: var(--lib-bg);
          color: var(--lib-text);
          font-family: 'Barlow', sans-serif;
          overflow-x: hidden;
          min-height: 100vh;
        }

        .riv-page * { margin: 0; padding: 0; box-sizing: border-box; }

        /* ── LANGUAGE / CURRENCY SWITCHER ── */
        .riv-topbar {
          position: fixed; top: 0; left: 0; right: 0; z-index: 200;
          display: flex; justify-content: space-between; align-items: center;
          padding: 0.55rem 2.5rem;
          background: rgba(14,12,8,0.97);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(201,162,39,0.15);
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.8rem;
          letter-spacing: 0.1em;
        }
        .riv-topbar-left { display: flex; gap: 0.6rem; align-items: center; }
        .riv-topbar-right { display: flex; gap: 0.6rem; align-items: center; }
        .riv-switch-btn {
          background: transparent;
          border: 1px solid rgba(255,255,255,0.12);
          color: var(--lib-dim);
          padding: 0.22rem 0.7rem;
          cursor: pointer;
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          transition: all 0.2s;
          border-radius: 2px;
        }
        .riv-switch-btn:hover { border-color: var(--lib-gold); color: var(--lib-gold); }
        .riv-switch-btn.active { background: var(--lib-gold); color: var(--lib-bg); border-color: var(--lib-gold); }
        .riv-switch-label { font-size: 0.65rem; color: var(--lib-dim); letter-spacing: 0.15em; text-transform: uppercase; }

        /* ── NAV ── */
        .riv-nav {
          position: fixed; top: 38px; left: 0; right: 0; z-index: 100;
          display: flex; justify-content: space-between; align-items: center;
          padding: 1rem 2.5rem;
          background: rgba(14,12,8,0.85);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(201,162,39,0.12);
        }
        .riv-logo {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 1.7rem; letter-spacing: 0.12em; color: var(--lib-gold);
        }
        .riv-logo span { color: var(--flu-green-light); }
        .riv-nav-links { display: flex; gap: 2rem; align-items: center; }
        .riv-nav-links a {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.88rem; font-weight: 600;
          letter-spacing: 0.1em; text-transform: uppercase;
          color: var(--lib-dim); text-decoration: none; transition: color 0.2s;
        }
        .riv-nav-links a:hover { color: var(--lib-gold); }
        .riv-nav-cta {
          background: var(--flu-green) !important;
          color: #fff !important; padding: 0.5rem 1.2rem; border-radius: 2px;
        }
        .riv-nav-cta:hover { background: var(--flu-green-light) !important; color: var(--lib-bg) !important; }
        @media (max-width: 640px) {
          .riv-nav { padding: 0.9rem 1.2rem; }
          .riv-nav-links { gap: 1rem; }
          .riv-topbar { padding: 0.4rem 1rem; }
        }
        @media (max-width: 480px) {
          .riv-nav-links .riv-nav-hide { display: none; }
        }

        /* ── HERO ── */
        .riv-hero {
          min-height: 100vh;
          position: relative;
          display: flex; flex-direction: column;
          justify-content: center; align-items: center;
          text-align: center; padding: 8rem 1.5rem 5rem;
          overflow: hidden;
        }
        .riv-hero-bg {
          position: absolute; inset: 0; z-index: 0;
          background:
            radial-gradient(ellipse 80% 55% at 50% 0%, rgba(26,122,46,0.20) 0%, transparent 60%),
            radial-gradient(ellipse 55% 40% at 10% 80%, rgba(139,0,0,0.18) 0%, transparent 50%),
            radial-gradient(ellipse 50% 45% at 90% 60%, rgba(0,59,150,0.15) 0%, transparent 55%),
            radial-gradient(ellipse 40% 35% at 50% 50%, rgba(201,162,39,0.06) 0%, transparent 50%),
            linear-gradient(180deg, rgba(14,12,8,0.75) 0%, rgba(14,12,8,0.95) 100%),
            url('https://lncimg.lance.com.br/cdn-cgi/image/width=1600,quality=80,fit=cover,format=webp/uploads/2016/10/19/5807e137e598d.jpeg');
          background-size: cover; background-position: center;
        }
        .riv-hero-bg::before {
          content: ''; position: absolute; inset: 0;
          background-image:
            repeating-linear-gradient(0deg, transparent, transparent 56px, rgba(255,255,255,0.015) 56px, rgba(255,255,255,0.015) 57px),
            repeating-linear-gradient(90deg, transparent, transparent 56px, rgba(255,255,255,0.01) 56px, rgba(255,255,255,0.01) 57px);
        }
        /* Libertadores Trophy SVG overlay watermark */
        .riv-hero-bg::after {
          content: ''; position: absolute; inset: 0;
          background: radial-gradient(ellipse 30% 30% at 75% 50%, rgba(201,162,39,0.07) 0%, transparent 70%);
        }

        .riv-competition-badge {
          position: relative; z-index: 2;
          display: inline-flex; align-items: center; gap: 0.6rem;
          background: rgba(201,162,39,0.1);
          border: 1px solid rgba(201,162,39,0.4);
          padding: 0.4rem 1.1rem; border-radius: 100px;
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.76rem; font-weight: 700;
          letter-spacing: 0.15em; text-transform: uppercase;
          color: var(--lib-gold-light);
          margin-bottom: 2rem;
          animation: rivFadeDown 0.8s ease both;
        }
        .riv-badge-dot {
          width: 7px; height: 7px; background: var(--lib-gold);
          border-radius: 50%; animation: rivPulse 1.5s ease infinite;
        }
        @keyframes rivPulse { 0%,100%{opacity:1;transform:scale(1)}50%{opacity:.3;transform:scale(.6)} }
        @keyframes rivFadeDown { from{opacity:0;transform:translateY(-18px)} to{opacity:1;transform:translateY(0)} }
        @keyframes rivFadeUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        @keyframes rivBounce { 0%,100%{transform:translateX(-50%) translateY(0)}50%{transform:translateX(-50%) translateY(7px)} }

        /* ── MATCH HEADER (clubs) ── */
        .riv-match-header {
          position: relative; z-index: 2;
          display: flex; align-items: center; gap: 2rem;
          margin-bottom: 1.8rem;
          animation: rivFadeDown 0.85s 0.12s ease both;
        }
        .riv-team-block { text-align: center; }
        .riv-team-logo {
          width: clamp(72px, 11vw, 130px); height: clamp(72px, 11vw, 130px);
          object-fit: contain; margin: 0 auto 0.8rem; display: block;
          filter: drop-shadow(0 8px 24px rgba(0,0,0,0.6));
          transition: transform 0.3s;
        }
        .riv-team-logo:hover { transform: scale(1.06); }
        .riv-team-name {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(2.2rem, 6vw, 5rem); line-height: 1; letter-spacing: 0.05em;
        }
        .riv-team-name.flu { color: var(--flu-green-light); }
        .riv-team-name.riv { color: var(--riv-blue-light); }
        .riv-team-sub {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.72rem; letter-spacing: 0.2em; text-transform: uppercase;
          color: var(--lib-dim); margin-top: 0.3rem;
        }
        .riv-vs-block { display: flex; flex-direction: column; align-items: center; gap: 0.4rem; }
        .riv-vs-text {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 1.1rem; font-weight: 700; letter-spacing: 0.25em;
          color: var(--lib-gold); text-transform: uppercase;
        }
        .riv-vs-divider { width: 1px; height: 50px; background: linear-gradient(180deg, transparent, var(--lib-gold), transparent); }

        /* ── Libertadores logo / badge ── */
        .riv-lib-emblem {
          position: relative; z-index: 2;
          display: flex; align-items: center; gap: 0.8rem;
          margin-bottom: 0.8rem;
          animation: rivFadeDown 0.85s 0.08s ease both;
        }
        .riv-lib-logo {
          width: 44px; height: 44px; object-fit: contain;
          filter: drop-shadow(0 4px 12px rgba(201,162,39,0.4));
        }
        .riv-lib-name {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 1.1rem; letter-spacing: 0.2em; color: var(--lib-gold);
        }

        .riv-hero-headline {
          position: relative; z-index: 2;
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(1.1rem, 3vw, 1.8rem);
          letter-spacing: 0.12em; color: var(--lib-dim);
          text-transform: uppercase; margin-bottom: 0.8rem;
          animation: rivFadeDown 0.85s 0.25s ease both;
        }
        .riv-match-meta {
          position: relative; z-index: 2;
          display: flex; gap: 2rem; justify-content: center; flex-wrap: wrap;
          margin-bottom: 2.5rem;
          animation: rivFadeDown 0.85s 0.35s ease both;
        }
        .riv-meta-item { display: flex; flex-direction: column; align-items: center; gap: 0.2rem; }
        .riv-meta-label { font-family: 'Barlow Condensed', sans-serif; font-size: 0.62rem; letter-spacing: 0.2em; text-transform: uppercase; color: var(--lib-dim); }
        .riv-meta-value { font-family: 'Barlow Condensed', sans-serif; font-size: 1rem; font-weight: 700; letter-spacing: 0.08em; color: var(--lib-cream); }

        /* ── COUNTDOWN ── */
        .riv-countdown {
          position: relative; z-index: 2;
          display: flex; gap: 0.4rem; margin-bottom: 3rem;
          animation: rivFadeDown 0.85s 0.45s ease both;
        }
        .riv-cd-block {
          display: flex; flex-direction: column; align-items: center;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(201,162,39,0.15);
          padding: 0.9rem 1.3rem; min-width: 76px;
        }
        .riv-cd-num { font-family: 'Bebas Neue', sans-serif; font-size: 2.6rem; line-height: 1; color: var(--lib-gold-light); }
        .riv-cd-label { font-family: 'Barlow Condensed', sans-serif; font-size: 0.58rem; letter-spacing: 0.18em; text-transform: uppercase; color: var(--lib-dim); margin-top: 0.2rem; }
        .riv-cd-sep { font-family: 'Bebas Neue', sans-serif; font-size: 2.6rem; color: var(--lib-dim); align-self: flex-start; padding-top: 0.9rem; opacity: 0.35; }

        /* ── CTA BUTTONS ── */
        .riv-hero-ctas {
          position: relative; z-index: 2;
          display: flex; gap: 1rem; flex-wrap: wrap; justify-content: center;
          animation: rivFadeDown 0.85s 0.55s ease both;
        }
        .riv-btn-primary {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 1rem; font-weight: 700; letter-spacing: 0.12em;
          text-transform: uppercase; padding: 1rem 2.8rem;
          background: var(--flu-green); color: #fff;
          border: none; cursor: pointer; text-decoration: none;
          transition: all 0.25s; position: relative; overflow: hidden; display: inline-block;
        }
        .riv-btn-primary::after { content:''; position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,255,255,.12) 0%,transparent 50%); }
        .riv-btn-primary:hover { background: var(--flu-green-light); color: var(--lib-bg); transform: translateY(-2px); box-shadow: 0 8px 24px rgba(46,204,90,.3); }
        .riv-btn-secondary {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 1rem; font-weight: 600; letter-spacing: 0.12em;
          text-transform: uppercase; padding: 1rem 2rem;
          background: transparent; color: var(--lib-text);
          border: 1px solid rgba(255,255,255,0.18); cursor: pointer; text-decoration: none; transition: all 0.25s; display: inline-block;
        }
        .riv-btn-secondary:hover { border-color: var(--lib-gold); color: var(--lib-gold); }
        .riv-btn-wa {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 1rem; font-weight: 700; letter-spacing: 0.12em;
          text-transform: uppercase; padding: 1rem 2rem;
          background: #25D366; color: #fff;
          border: none; cursor: pointer; text-decoration: none;
          transition: all 0.25s; display: inline-flex; align-items: center; gap: 0.5rem;
        }
        .riv-btn-wa:hover { background: #1aa84c; transform: translateY(-2px); box-shadow: 0 8px 24px rgba(37,211,102,.35); }
        .riv-btn-wa svg { width: 20px; height: 20px; fill: currentColor; flex-shrink: 0; }

        .riv-scroll-hint {
          position: absolute; bottom: 2.5rem; left: 50%; transform: translateX(-50%);
          z-index: 2; display: flex; flex-direction: column; align-items: center; gap: 0.5rem;
          opacity: 0.35; animation: rivBounce 2s ease infinite;
        }
        .riv-scroll-hint span { font-family: 'Barlow Condensed', sans-serif; font-size: 0.62rem; letter-spacing: 0.2em; text-transform: uppercase; }
        .riv-scroll-arrow { width: 16px; height: 16px; border-right: 2px solid; border-bottom: 2px solid; transform: rotate(45deg); }

        /* ── URGENCY BAR ── */
        .riv-urgency-bar {
          background: linear-gradient(90deg, rgba(201,162,39,0.15) 0%, rgba(26,122,46,0.12) 50%, rgba(201,162,39,0.15) 100%);
          border-top: 1px solid rgba(201,162,39,0.25);
          border-bottom: 1px solid rgba(201,162,39,0.25);
          padding: 0.9rem 1.5rem; text-align: center;
        }
        .riv-urgency-bar p { font-family: 'Barlow Condensed', sans-serif; font-size: 0.92rem; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: var(--lib-gold-light); }

        /* ── SECTIONS ── */
        .riv-section { padding: 5.5rem 2rem; }
        .riv-section-label { font-family: 'Barlow Condensed', sans-serif; font-size: 0.72rem; font-weight: 700; letter-spacing: 0.28em; text-transform: uppercase; color: var(--lib-gold); margin-bottom: 0.7rem; }
        .riv-section-title { font-family: 'Bebas Neue', sans-serif; font-size: clamp(2.2rem, 5vw, 3.6rem); letter-spacing: 0.06em; line-height: 1.05; margin-bottom: 1rem; white-space: pre-line; }
        .riv-section-sub { font-size: 1rem; color: var(--lib-dim); max-width: 530px; line-height: 1.7; }

        /* ── VIDEO ── */
        .riv-video-section { padding: 3.5rem 2rem 5rem; max-width: 1100px; margin: 0 auto; }

        /* ── PACKAGES ── */
        .riv-packages-section { background: var(--lib-bg2); }
        .riv-packages-header { text-align: center; margin-bottom: 3.5rem; }
        .riv-packages-header .riv-section-sub { margin: 0 auto; }
        .riv-packages-grid {
          display: grid; grid-template-columns: repeat(4, 1fr);
          gap: 1.5px; max-width: 1440px; margin: 0 auto;
          background: rgba(255,255,255,0.05);
        }
        @media (max-width: 1100px) { .riv-packages-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 640px) { .riv-packages-grid { grid-template-columns: 1fr; } }

        .riv-pkg-card { background: var(--lib-bg2); padding: 2.5rem 2rem; position: relative; transition: background 0.3s; }
        .riv-pkg-card:hover { background: var(--lib-bg3); }
        .riv-pkg-card.featured { background: linear-gradient(160deg, rgba(26,122,46,0.13) 0%, var(--lib-bg2) 60%); border-top: 3px solid var(--flu-green-light); }
        .riv-pkg-badge { position: absolute; top: 0; right: 2rem; background: var(--flu-green-light); color: var(--lib-bg); font-family: 'Barlow Condensed', sans-serif; font-size: 0.62rem; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; padding: 0.22rem 0.6rem; transform: translateY(-50%); }
        .riv-pkg-tier { font-family: 'Barlow Condensed', sans-serif; font-size: 0.68rem; font-weight: 700; letter-spacing: 0.25em; text-transform: uppercase; color: var(--lib-dim); margin-bottom: 0.4rem; }
        .riv-pkg-name { font-family: 'Bebas Neue', sans-serif; font-size: 1.75rem; letter-spacing: 0.08em; color: var(--lib-cream); margin-bottom: 0.3rem; }
        .riv-pkg-price { font-family: 'Barlow Condensed', sans-serif; font-size: 2.4rem; font-weight: 700; color: var(--lib-gold-light); line-height: 1; margin-bottom: 0.15rem; }
        .riv-pkg-price sup { font-size: 1.1rem; vertical-align: top; padding-top: 0.35rem; color: var(--lib-dim); }
        .riv-pkg-per { font-size: 0.78rem; color: var(--lib-dim); margin-bottom: 1.5rem; }
        .riv-pkg-divider { height: 1px; background: rgba(255,255,255,0.06); margin-bottom: 1.5rem; }
        .riv-pkg-features { list-style: none; display: flex; flex-direction: column; gap: 0.7rem; }
        .riv-pkg-features li { display: flex; gap: 0.7rem; align-items: flex-start; font-size: 0.88rem; color: var(--lib-dim); line-height: 1.4; }
        .riv-pkg-features li .riv-check { color: var(--flu-green-light); font-size: 0.72rem; font-weight: 700; flex-shrink: 0; margin-top: 0.15rem; }
        .riv-pkg-features li.strike { opacity: 0.3; text-decoration: line-through; }
        .riv-pkg-cta { display: block; width: 100%; margin-top: 2rem; padding: 0.9rem; text-align: center; font-family: 'Barlow Condensed', sans-serif; font-size: 0.9rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; text-decoration: none; transition: all 0.2s; }
        .riv-pkg-cta.green { background: var(--flu-green); color: #fff; }
        .riv-pkg-cta.green:hover { background: var(--flu-green-light); color: var(--lib-bg); }
        .riv-pkg-cta.outline { border: 1px solid rgba(255,255,255,0.18); color: var(--lib-text); }
        .riv-pkg-cta.outline:hover { border-color: var(--lib-gold); color: var(--lib-gold); }

        /* ── INCLUDED ── */
        .riv-included-section { background: var(--lib-bg); }
        .riv-included-layout { max-width: 1100px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 5rem; align-items: start; }
        @media (max-width: 768px) { .riv-included-layout { grid-template-columns: 1fr; gap: 3rem; } }
        .riv-included-list { display: flex; flex-direction: column; gap: 2rem; }
        .riv-included-item { display: flex; gap: 1.2rem; align-items: flex-start; }
        .riv-included-icon { width: 44px; height: 44px; flex-shrink: 0; background: rgba(46,204,90,0.08); border: 1px solid rgba(46,204,90,0.18); display: flex; align-items: center; justify-content: center; font-size: 1.15rem; }
        .riv-included-text h4 { font-family: 'Barlow Condensed', sans-serif; font-size: 1rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: var(--lib-cream); margin-bottom: 0.3rem; }
        .riv-included-text p { font-size: 0.85rem; color: var(--lib-dim); line-height: 1.6; }

        /* ── STAKES / WHY ── */
        .riv-stakes-section {
          background: linear-gradient(135deg, rgba(0,59,150,0.15) 0%, rgba(14,12,8,0.9) 40%, rgba(26,122,46,0.15) 100%), var(--lib-bg3);
          text-align: center; padding: 6rem 2rem;
        }
        .riv-stakes-section .riv-section-title { font-size: clamp(2.5rem, 6vw, 4.5rem); }
        .riv-stakes-lead { max-width: 680px; margin: 1.5rem auto 3rem; font-size: 1.05rem; line-height: 1.75; color: var(--lib-dim); }
        .riv-stakes-lead strong { color: var(--lib-gold-light); }

        /* ── HOW ── */
        .riv-how-section { background: var(--lib-bg); }
        .riv-steps-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); gap: 0; max-width: 1050px; margin: 3rem auto 0; }
        .riv-step { padding: 2rem 1.5rem; border-left: 1px solid rgba(255,255,255,0.05); position: relative; }
        .riv-step:first-child { border-left: none; }
        .riv-step-num { font-family: 'Bebas Neue', sans-serif; font-size: 3.5rem; line-height: 1; color: rgba(201,162,39,0.1); position: absolute; top: 1rem; right: 1rem; }
        .riv-step-icon { font-size: 1.6rem; margin-bottom: 1rem; }
        .riv-step h4 { font-family: 'Barlow Condensed', sans-serif; font-size: 1rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--lib-cream); margin-bottom: 0.5rem; }
        .riv-step p { font-size: 0.83rem; color: var(--lib-dim); line-height: 1.6; }
        @media (max-width: 600px) { .riv-step { border-left: none; border-top: 1px solid rgba(255,255,255,0.05); } .riv-step:first-child { border-top: none; } }

        /* ── REVIEWS ── */
        .riv-reviews-section { background: var(--lib-bg2); }
        .riv-reviews-header { text-align: center; margin-bottom: 3rem; }
        .riv-review-badge { display: flex; align-items: center; gap: 1rem; justify-content: center; margin-top: 1.5rem; }
        .riv-review-badge .riv-big-num { font-family: 'Bebas Neue', sans-serif; font-size: 4rem; line-height: 1; color: var(--lib-gold); }
        .riv-review-badge .riv-badge-text p:first-child { font-family: 'Barlow Condensed', sans-serif; font-size: 0.72rem; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; color: var(--lib-dim); }
        .riv-review-badge .riv-badge-text p:last-child { font-family: 'Barlow Condensed', sans-serif; font-size: 0.82rem; color: var(--lib-cream); }
        .riv-reviews-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1.5px; max-width: 1000px; margin: 0 auto; background: rgba(255,255,255,0.05); }
        .riv-review-card { background: var(--lib-bg2); padding: 1.8rem; }
        .riv-review-stars { color: var(--lib-gold); font-size: 0.8rem; margin-bottom: 0.8rem; }
        .riv-review-text { font-size: 0.88rem; line-height: 1.7; color: var(--lib-dim); margin-bottom: 1.2rem; font-style: italic; }
        .riv-review-author { font-family: 'Barlow Condensed', sans-serif; font-size: 0.8rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--lib-cream); }
        .riv-review-country { color: var(--lib-dim); font-weight: 400; }

        /* ── FAQ ── */
        .riv-faq-section { background: var(--lib-bg); }
        .riv-faq-list { max-width: 760px; margin: 3rem auto 0; display: flex; flex-direction: column; gap: 1px; background: rgba(255,255,255,0.05); }
        .riv-faq-item { background: var(--lib-bg); }
        .riv-faq-q { width: 100%; background: none; border: none; color: var(--lib-cream); text-align: left; padding: 1.3rem 1.5rem; cursor: pointer; display: flex; justify-content: space-between; align-items: center; gap: 1rem; font-family: 'Barlow Condensed', sans-serif; font-size: 1rem; font-weight: 700; letter-spacing: 0.04em; transition: color 0.2s; }
        .riv-faq-q:hover { color: var(--lib-gold); }
        .riv-faq-q .riv-faq-arrow { font-size: 1.2rem; transition: transform 0.25s; flex-shrink: 0; color: var(--lib-gold); }
        .riv-faq-q.open .riv-faq-arrow { transform: rotate(180deg); }
        .riv-faq-a { padding: 0 1.5rem 1.3rem; font-size: 0.88rem; color: var(--lib-dim); line-height: 1.7; }

        /* ── FINAL CTA ── */
        .riv-final-cta {
          background: radial-gradient(ellipse 80% 60% at 50% 100%, rgba(26,122,46,0.22) 0%, transparent 60%), var(--lib-bg3);
          text-align: center; padding: 7rem 2rem;
        }
        .riv-final-cta .riv-section-title { font-size: clamp(2.8rem, 7vw, 5.5rem); }
        .riv-cta-price-row { margin: 2rem 0 0.5rem; font-family: 'Barlow Condensed', sans-serif; }
        .riv-cta-price-row .riv-from { font-size: 0.9rem; color: var(--lib-dim); letter-spacing: 0.1em; }
        .riv-cta-price-row .riv-amount { font-size: 3.5rem; font-weight: 700; color: var(--lib-gold-light); line-height: 1; }
        .riv-cta-note { font-size: 0.8rem; color: var(--lib-dim); margin-top: 1.5rem; }
        .riv-cta-wa-row { margin-top: 1.2rem; display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }

        /* ── FOOTER ── */
        .riv-footer { background: var(--lib-bg); border-top: 1px solid rgba(255,255,255,0.05); padding: 2rem; text-align: center; }
        .riv-footer p { font-family: 'Barlow Condensed', sans-serif; font-size: 0.75rem; color: var(--lib-dim); letter-spacing: 0.1em; }

        /* ── FLOATING WA ── */
        .riv-wa-float {
          position: fixed; bottom: 2rem; right: 2rem; z-index: 500;
          width: 58px; height: 58px; border-radius: 50%;
          background: #25D366; display: flex; align-items: center; justify-content: center;
          box-shadow: 0 6px 24px rgba(37,211,102,0.45);
          transition: all 0.25s; text-decoration: none;
          animation: rivFadeUp 0.8s 1s ease both;
        }
        .riv-wa-float:hover { transform: scale(1.1); box-shadow: 0 10px 32px rgba(37,211,102,0.6); }
        .riv-wa-float svg { width: 28px; height: 28px; fill: #fff; }
        @media (max-width: 640px) { .riv-wa-float { bottom: 1.2rem; right: 1.2rem; width: 52px; height: 52px; } }

        /* ── ANIMATIONS ── */
        .riv-fade { opacity: 0; transform: translateY(26px); transition: opacity 0.75s ease, transform 0.75s ease; }
        .riv-visible { opacity: 1; transform: none; }

        /* ── STARS ── */
        .riv-stars { color: var(--lib-gold); font-size: 1.1rem; letter-spacing: 0.1em; margin-bottom: 0.5rem; }
      `}} />

      {/* TOPBAR: Language + Currency */}
      <div className="riv-topbar">
        <div className="riv-topbar-left">
          <span className="riv-switch-label">🌐</span>
          {(['en','pt','es'] as Lang[]).map(l => (
            <button key={l} className={`riv-switch-btn${lang === l ? ' active' : ''}`} onClick={() => setLang(l)}>
              {l.toUpperCase()}
            </button>
          ))}
        </div>
        <div className="riv-topbar-right">
          <span className="riv-switch-label">💱</span>
          {(['USD','BRL','EUR'] as Currency[]).map(c => (
            <button key={c} className={`riv-switch-btn${currency === c ? ' active' : ''}`} onClick={() => setCurrency(c)}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* NAV */}
      <nav className="riv-nav">
        <div className="riv-logo">Tocori<span>merio</span></div>
        <div className="riv-nav-links">
          <a href="#packages" className="riv-nav-hide">Packages</a>
          <a href="#included" className="riv-nav-hide">Included</a>
          <a href={BOOKING_URL} className="riv-nav-cta">{t.bookNow}</a>
        </div>
      </nav>

      {/* HERO */}
      <section className="riv-hero">
        <div className="riv-hero-bg" />

        {/* Libertadores badge */}
        <div className="riv-lib-emblem">
          <img
            src="https://upload.wikimedia.org/wikipedia/en/thumb/3/3c/CONMEBOL_Copa_Libertadores_logo.svg/200px-CONMEBOL_Copa_Libertadores_logo.svg.png"
            alt="Copa Libertadores"
            className="riv-lib-logo"
            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
          <span className="riv-lib-name">Copa Libertadores 2026</span>
        </div>

        <div className="riv-competition-badge">
          <span className="riv-badge-dot" />
          {t.badge}
        </div>

        <div className="riv-match-header">
          <div className="riv-team-block">
            <img src="https://crests.football-data.org/1765.png" alt="Fluminense FC" className="riv-team-logo" loading="eager" />
            <div className="riv-team-name flu">Fluminense</div>
            <div className="riv-team-sub">Rio de Janeiro · BRA</div>
          </div>
          <div className="riv-vs-block">
            <div className="riv-vs-divider" />
            <div className="riv-vs-text">VS</div>
            <div className="riv-vs-divider" />
          </div>
          <div className="riv-team-block">
            <img
              src="https://ruacloirelfsbejduefa.supabase.co/storage/v1/object/public/crests/0599b17b-7b6a-4492-8c13-110552ef037c/visitante.png"
              alt="Independiente Rivadavia"
              className="riv-team-logo"
              loading="eager"
            />
            <div className="riv-team-name riv">Ind. Rivadavia</div>
            <div className="riv-team-sub">Mendoza · ARG</div>
          </div>
        </div>

        <div className="riv-hero-headline">{t.headline}</div>

        <div className="riv-match-meta">
          <div className="riv-meta-item"><span className="riv-meta-label">Date</span><span className="riv-meta-value">{t.date}</span></div>
          <div className="riv-meta-item"><span className="riv-meta-label">Kickoff</span><span className="riv-meta-value">{t.kickoff}</span></div>
          <div className="riv-meta-item"><span className="riv-meta-label">Venue</span><span className="riv-meta-value">{t.venue}</span></div>
          <div className="riv-meta-item"><span className="riv-meta-label">Stage</span><span className="riv-meta-value">{t.stage}</span></div>
        </div>

        <div className="riv-countdown">
          {timeLeft.isLive ? (
            <p style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: "1.5rem", letterSpacing: "0.2em", color: "var(--lib-gold)" }}>MATCH IS LIVE 🔴</p>
          ) : (
            <>
              <div className="riv-cd-block"><div className="riv-cd-num">{timeLeft.days}</div><div className="riv-cd-label">Days</div></div>
              <div className="riv-cd-sep">:</div>
              <div className="riv-cd-block"><div className="riv-cd-num">{timeLeft.hours}</div><div className="riv-cd-label">Hours</div></div>
              <div className="riv-cd-sep">:</div>
              <div className="riv-cd-block"><div className="riv-cd-num">{timeLeft.minutes}</div><div className="riv-cd-label">Mins</div></div>
              <div className="riv-cd-sep">:</div>
              <div className="riv-cd-block"><div className="riv-cd-num">{timeLeft.seconds}</div><div className="riv-cd-label">Secs</div></div>
            </>
          )}
        </div>

        <div className="riv-hero-ctas">
          <a href={BOOKING_URL} className="riv-btn-primary">{t.bookNow} →</a>
          <a href={waLink} className="riv-btn-wa" target="_blank" rel="noopener noreferrer">
            <svg viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            {t.whatsappCta}
          </a>
          <a href="#included" className="riv-btn-secondary">{t.seeIncluded}</a>
        </div>

        <div className="riv-scroll-hint"><span>{t.scroll}</span><div className="riv-scroll-arrow" /></div>
      </section>

      {/* URGENCY BAR */}
      <div className="riv-urgency-bar">
        <p>{t.urgency}</p>
      </div>

      {/* VIDEO */}
      <div className="riv-video-section riv-fade">
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div className="riv-section-label">{t.watchSub}</div>
          <div className="riv-section-title">{t.watchTitle}</div>
        </div>
        <div style={{ position: "relative", paddingBottom: "56.25%", height: 0, overflow: "hidden", borderRadius: 4, boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}>
          <iframe
            src="https://www.youtube.com/embed/cCyYRbMyBpk"
            title="Fluminense Copa Libertadores — Maracanã"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen loading="lazy"
            style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: 0 }}
          />
        </div>
      </div>

      {/* PACKAGES */}
      <section className="riv-packages-section riv-section" id="packages">
        <div className="riv-packages-header riv-fade">
          <div className="riv-section-label">{t.sectorsLabel}</div>
          <div className="riv-section-title">{t.sectorsTitle}</div>
          <p className="riv-section-sub">{t.sectorsSub}</p>
        </div>
        <div className="riv-packages-grid riv-fade">
          {t.sectorsData.map((pkg, i) => (
            <div key={i} className={`riv-pkg-card${pkg.featured ? ' featured' : ''}`}>
              {pkg.badge && <div className="riv-pkg-badge">{pkg.badge}</div>}
              <div className="riv-pkg-tier">{pkg.tier}</div>
              <div className="riv-pkg-name">{pkg.name}</div>
              <div className="riv-pkg-price">
                <sup>{CURRENCY_SYMBOL[currency]}</sup>
                {Math.round(pkg.usd * RATES[currency]).toLocaleString('en-US')}
              </div>
              <div className="riv-pkg-per">{t.perPerson}</div>
              <div className="riv-pkg-divider" />
              <ul className="riv-pkg-features">
                {pkg.features.map((f, j) => (
                  <li key={j} className={f.strike ? 'strike' : ''}>
                    <span className="riv-check">{f.strike ? '—' : '✓'}</span>
                    {f.text}
                  </li>
                ))}
              </ul>
              <a href={BOOKING_URL} className={`riv-pkg-cta ${pkg.btnClass}`}>{pkg.btn}</a>
            </div>
          ))}
        </div>
      </section>

      {/* WHAT'S INCLUDED */}
      <section className="riv-included-section riv-section" id="included">
        <div className="riv-included-layout">
          <div className="riv-fade">
            <div className="riv-section-label">{t.includedLabel}</div>
            <div className="riv-section-title">{t.includedTitle}</div>
            <p className="riv-section-sub">{t.includedSub}</p>
          </div>
          <div className="riv-included-list riv-fade">
            {t.included.map((item, i) => (
              <div key={i} className="riv-included-item">
                <div className="riv-included-icon">{['🎟️','🚌','🗣️','🍺','🛡️'][i]}</div>
                <div className="riv-included-text"><h4>{item.title}</h4><p>{item.desc}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY THIS MATCH */}
      <section className="riv-stakes-section riv-fade">
        <div className="riv-section-label">{t.whyLabel}</div>
        <div className="riv-section-title">{t.whyTitle}</div>
        <p className="riv-stakes-lead">{t.whyLead.split('Fluminense').join('')
          ? t.whyLead.split(/(\bFluminense\b|\b78,000\b|\b2023\b)/).map((part, i) =>
              ['Fluminense','78,000','2023'].includes(part)
                ? <strong key={i}>{part}</strong>
                : part
            )
          : t.whyLead
        }</p>
        <a href={BOOKING_URL} className="riv-btn-primary">{t.iwantBtn}</a>
      </section>

      {/* HOW IT WORKS */}
      <section className="riv-how-section riv-section">
        <div style={{ textAlign: "center", marginBottom: "0.5rem" }} className="riv-fade">
          <div className="riv-section-label">{t.howLabel}</div>
          <div className="riv-section-title">{t.howTitle}</div>
        </div>
        <div className="riv-steps-row riv-fade">
          {t.steps.map((step, i) => (
            <div key={i} className="riv-step">
              <div className="riv-step-num">0{i+1}</div>
              <div className="riv-step-icon">{['📋','📍','🍺','⚽','🏠'][i]}</div>
              <h4>{step.title}</h4>
              <p>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* REVIEWS */}
      <section className="riv-reviews-section riv-section">
        <div className="riv-reviews-header riv-fade">
          <div className="riv-section-label">{t.reviewsLabel}</div>
          <div className="riv-section-title">{t.reviewsTitle}</div>
          <div className="riv-stars">★★★★★</div>
          <div className="riv-review-badge">
            <div className="riv-big-num">5.0</div>
            <div className="riv-badge-text">
              <p>Google Rating</p>
              <p>1,090+ verified reviews ★★★★★</p>
            </div>
          </div>
        </div>
        <div className="riv-reviews-grid riv-fade">
          {t.reviews.map((r, i) => (
            <div key={i} className="riv-review-card">
              <div className="riv-review-stars">★★★★★</div>
              <p className="riv-review-text">{r.text}</p>
              <div className="riv-review-author">{r.author} <span className="riv-review-country">· {r.country}</span></div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="riv-faq-section riv-section">
        <div style={{ textAlign: "center", maxWidth: 760, margin: "0 auto" }} className="riv-fade">
          <div className="riv-section-label">{t.faqLabel}</div>
          <div className="riv-section-title">{t.faqTitle}</div>
        </div>
        <div className="riv-faq-list riv-fade">
          {t.faqs.map((faq, i) => (
            <div key={i} className="riv-faq-item">
              <button className={`riv-faq-q${openFaq === i ? ' open' : ''}`} onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                {faq.q}
                <span className="riv-faq-arrow">▾</span>
              </button>
              {openFaq === i && <div className="riv-faq-a">{faq.a}</div>}
            </div>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="riv-final-cta riv-fade">
        <div className="riv-section-label">{t.ctaLabel}</div>
        <div className="riv-section-title">{t.ctaTitle}</div>
        <div className="riv-cta-price-row">
          <div className="riv-from">{t.from}</div>
          <div className="riv-amount">{fmtPrice(89, currency)}</div>
        </div>
        <div className="riv-cta-wa-row">
          <a href={BOOKING_URL} className="riv-btn-primary" style={{ fontSize: "1.1rem", padding: "1.1rem 3.2rem" }}>{t.secure}</a>
          <a href={waLink} className="riv-btn-wa" target="_blank" rel="noopener noreferrer">
            <svg viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            {t.whatsappCta}
          </a>
        </div>
        <p className="riv-cta-note">{t.ctaNote}</p>
      </section>

      {/* FOOTER */}
      <footer className="riv-footer">
        <p>© 2026 Tocorime Rio · Official Maracanã Matchday Experiences · Rio de Janeiro, Brazil</p>
        <p style={{ marginTop: "0.4rem" }}>
          <a href="/" style={{ color: "var(--lib-dim)", textDecoration: "none" }}>tocorimerio.com</a>
          {" · "}
          <a href="/maracana-calendario" style={{ color: "var(--lib-dim)", textDecoration: "none" }}>Maracanã Calendar</a>
          {" · "}
          <a href="/football-experiences-in-rio-de-janeiro" style={{ color: "var(--lib-dim)", textDecoration: "none" }}>Football Experiences</a>
        </p>
      </footer>

      {/* FLOATING WHATSAPP */}
      <a href={waLink} className="riv-wa-float" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
        <svg viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
      </a>
    </div>
  );
};

export default FluminenseIndependienteRivadaviaLibertadores;
