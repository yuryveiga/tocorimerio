import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useLocale } from "@/contexts/LocaleContext";
import { canTrack, needsAnswer, onConsentChange, readChoice, saveChoices, type Purpose } from "@/lib/consent";

const PURPOSES: Purpose[] = ["analytics", "advertising"];
export const OPEN_COOKIE_SETTINGS = "open-cookie-settings";

type Copy = Record<string, string>;
type CopyLang = "pt" | "en" | "es" | "de" | "fr" | "it";
const pickCopyLang = (l: string): CopyLang => (["pt", "es", "de", "fr", "it"].includes(l) ? (l as CopyLang) : "en");
const COPY: Record<CopyLang, Copy> = {
  pt: {
    policy: "Política de privacidade",
    title: "Cookies e privacidade",
    body: "Contamos as visitas sem identificar você. Se aceitar, também medimos cliques e outras ações, e usamos cookies para medir e melhorar nossos anúncios.",
    accept: "Aceitar todos", reject: "Recusar todos", settings: "Configurar cookies", save: "Salvar escolhas",
    necessary: "Necessários", necessaryDesc: "Sempre ativos para o site funcionar.",
    analytics: "Análise, fornecida pela Lovable, Google e Microsoft", analyticsDesc: "Entender como o site é usado.",
    advertising: "Anúncios, fornecidos pelo Google", advertisingDesc: "Medir reservas vindas de anúncios.",
    gpc: "Seu navegador pede para não ser rastreado, então esta escolha fica desativada.",
  },
  en: {
    policy: "Privacy policy",
    title: "Cookies & privacy",
    body: "We count visits without identifying you. If you accept, we also measure clicks and other actions, and use cookies to measure and improve our ads.",
    accept: "Accept all", reject: "Reject all", settings: "Cookie settings", save: "Save choices",
    necessary: "Necessary", necessaryDesc: "Always on so the site works.",
    analytics: "Analytics, provided by Lovable, Google and Microsoft", analyticsDesc: "Understand how the site is used.",
    advertising: "Advertising, provided by Google", advertisingDesc: "Measure bookings that come from ads.",
    gpc: "Your browser's privacy signal applies, so these choices are turned off.",
  },
  es: {
    policy: "Política de privacidad",
    title: "Cookies y privacidad",
    body: "Contamos las visitas sin identificarte. Si aceptas, también medimos clics y otras acciones, y usamos cookies para medir y mejorar nuestros anuncios.",
    accept: "Aceptar todas", reject: "Rechazar todas", settings: "Configurar cookies", save: "Guardar opciones",
    necessary: "Necesarias", necessaryDesc: "Siempre activas para que el sitio funcione.",
    analytics: "Análisis, proporcionado por Lovable, Google y Microsoft", analyticsDesc: "Entender cómo se usa el sitio.",
    advertising: "Publicidad, proporcionada por Google", advertisingDesc: "Medir reservas que vienen de anuncios.",
    gpc: "La señal de privacidad de tu navegador se aplica, por eso estas opciones están desactivadas.",
  },
  fr: {
    policy: "Politique de confidentialité",
    title: "Cookies et confidentialité",
    body: "Nous comptabilisons les visites sans vous identifier. Si vous acceptez, nous mesurons également les clics et d'autres actions, et utilisons des cookies pour mesurer et améliorer nos publicités.",
    accept: "Tout accepter", reject: "Tout refuser", settings: "Paramètres des cookies", save: "Enregistrer les choix",
    necessary: "Nécessaires", necessaryDesc: "Toujours activés pour que le site fonctionne.",
    analytics: "Statistiques, fournies par Lovable, Google et Microsoft", analyticsDesc: "Comprendre comment le site est utilisé.",
    advertising: "Publicité, fournie par Google", advertisingDesc: "Mesurer les réservations provenant des publicités.",
    gpc: "Le signal de confidentialité de votre navigateur s'applique, ces choix sont donc désactivés.",
  },
  it: {
    policy: "Informativa sulla privacy",
    title: "Cookie e privacy",
    body: "Conteggiamo le visite senza identificarti. Se accetti, misuriamo anche i clic e altre azioni, e utilizziamo i cookie per misurare e migliorare i nostri annunci.",
    accept: "Accetta tutti", reject: "Rifiuta tutti", settings: "Impostazioni cookie", save: "Salva scelte",
    necessary: "Necessari", necessaryDesc: "Sempre attivi per garantire il funzionamento del sito.",
    analytics: "Analisi, fornita da Lovable, Google e Microsoft", analyticsDesc: "Comprendere come viene utilizzato il sito.",
    advertising: "Pubblicità, fornita da Google", advertisingDesc: "Misurare le prenotazioni provenienti dagli annunci.",
    gpc: "Si applica il segnale di privacy del tuo browser, pertanto queste scelte sono disattivate.",
  },
  de: {
    policy: "Datenschutzerklärung",
    title: "Cookies & Datenschutz",
    body: "Wir zählen Besuche, ohne Sie zu identifizieren. Wenn Sie zustimmen, messen wir auch Klicks und andere Aktionen und verwenden Cookies, um unsere Anzeigen zu messen und zu verbessern.",
    accept: "Alle akzeptieren", reject: "Alle ablehnen", settings: "Cookie-Einstellungen", save: "Auswahl speichern",
    necessary: "Notwendig", necessaryDesc: "Immer aktiv, damit die Website funktioniert.",
    analytics: "Analysen, bereitgestellt von Lovable, Google und Microsoft", analyticsDesc: "Verstehen, wie die Website genutzt wird.",
    advertising: "Werbung, bereitgestellt von Google", advertisingDesc: "Buchungen messen, die über Anzeigen zustande kommen.",
    gpc: "Das Datenschutzsignal Ihres Browsers wird angewendet, daher sind diese Optionen deaktiviert.",
  },
};

let clarityLoaded = false;
function loadClarity() {
  if (clarityLoaded) return;
  clarityLoaded = true;
  const w = window as unknown as { clarity?: { q?: unknown[] } & ((...a: unknown[]) => void) };
  w.clarity = w.clarity || (function (...a: unknown[]) { ((w.clarity as { q?: unknown[] }).q ||= []).push(a); } as never);
  const s = document.createElement("script");
  s.async = true;
  s.src = "https://www.clarity.ms/tag/xr7yea2piv";
  document.head.appendChild(s);
}

export function CookieConsent() {
  const { siteLanguage } = useLocale();
  const c = COPY[pickCopyLang(siteLanguage)];
  const [open, setOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [toggles, setToggles] = useState<Record<Purpose, boolean>>({ analytics: false, advertising: false });
  const panelRef = useRef<HTMLDivElement>(null);
  const gpc = typeof navigator !== "undefined" && (navigator as unknown as { globalPrivacyControl?: boolean }).globalPrivacyControl === true;

  useEffect(() => {
    let alive = true;
    needsAnswer(PURPOSES).then((n) => alive && n && setOpen(true));
    const maybeClarity = () => canTrack("analytics").then((ok) => ok && loadClarity());
    maybeClarity();
    const off = onConsentChange(maybeClarity);
    const openSettings = () => {
      setToggles({ analytics: readChoice("analytics") === "granted", advertising: readChoice("advertising") === "granted" });
      setShowSettings(true);
      setOpen(true);
    };
    window.addEventListener(OPEN_COOKIE_SETTINGS, openSettings);
    return () => { alive = false; off(); window.removeEventListener(OPEN_COOKIE_SETTINGS, openSettings); };
  }, []);

  useEffect(() => { if (open) panelRef.current?.focus(); }, [open, showSettings]);

  if (!open) return null;
  const all = (choice: "granted" | "denied") => {
    saveChoices({ analytics: choice, advertising: choice });
    setOpen(false); setShowSettings(false);
  };
  const save = () => {
    saveChoices({ analytics: toggles.analytics ? "granted" : "denied", advertising: toggles.advertising ? "granted" : "denied" });
    setOpen(false); setShowSettings(false);
  };

  return (
    <div
      ref={panelRef}
      tabIndex={-1}
      role="region"
      aria-label={c.title}
      className="fixed bottom-4 left-4 right-4 z-[60] mx-auto max-w-xl rounded-2xl border border-border bg-card p-5 text-card-foreground shadow-xl outline-none md:left-6 md:right-auto"
    >
      <h2 className="font-serif text-lg font-bold">{c.title}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{c.body} <a href="/privacy-policy" className="font-medium text-foreground underline underline-offset-4">{c.policy}</a></p>
      {showSettings && (
        <div className="mt-4 space-y-3">
          <div className="flex items-start justify-between gap-4 rounded-lg bg-muted/50 p-3">
            <div><p className="text-sm font-semibold">{c.necessary}</p><p className="text-xs text-muted-foreground">{c.necessaryDesc}</p></div>
          </div>
          {PURPOSES.map((p) => (
            <label key={p} className="flex items-start justify-between gap-4 rounded-lg bg-muted/50 p-3">
              <span><span className="block text-sm font-semibold">{c[p]}</span><span className="block text-xs text-muted-foreground">{c[`${p}Desc`]}</span></span>
              <Switch checked={!gpc && toggles[p]} disabled={gpc} onCheckedChange={(v) => setToggles((t) => ({ ...t, [p]: v }))} aria-label={c[p]} />
            </label>
          ))}
          {gpc && <p className="text-xs text-muted-foreground">{c.gpc}</p>}
          <Button className="w-full" onClick={save}>{c.save}</Button>
        </div>
      )}
      <div className="mt-4 grid grid-cols-2 gap-2">
        <Button onClick={() => all("granted")}>{c.accept}</Button>
        <Button onClick={() => all("denied")}>{c.reject}</Button>
      </div>
      {!showSettings && (
        <button type="button" className="mt-3 text-sm font-medium underline underline-offset-4" onClick={() => setShowSettings(true)}>{c.settings}</button>
      )}
    </div>
  );
}

export const privacyPolicyLabel = (language: string) =>
  COPY[pickCopyLang(language)].policy;

export const cookieSettingsLabel = (language: string) =>
  COPY[pickCopyLang(language)].settings;
