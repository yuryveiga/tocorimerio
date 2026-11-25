// Force refresh to resolve stale context issues
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { translationsPt, translationsEn, translationsEs, translationsZhCN, translationsZhTW } from "@/translations";
import { translationsDe } from "@/translations/de";
import { translationsFr } from "@/translations/fr";
import { translationsIt } from "@/translations/it";
import { setTlLanguage } from "@/lib/tl";
import { useCurrency } from './CurrencyContext';

export type SiteLanguage = 'pt' | 'en' | 'es' | 'de' | 'fr' | 'it';
type Language = SiteLanguage | 'zh-CN' | 'zh-TW';
/** de/fr/it reuse the English layout copy where a page has no own translation. */
const baseLanguage = (l: Language): Language => (l === 'de' || l === 'fr' || l === 'it' ? 'en' : l);
type Currency = 'BRL' | 'USD' | 'EUR' | 'CNY';

interface LocaleContextType {
  /** Language for page logic; German/French/Italian report 'en' so untranslated page copy falls back to English. */
  language: Language;
  /** The language the visitor actually chose. */
  siteLanguage: Language;
  setLanguage: (lang: Language) => void;
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  t: (key: string) => string;
  formatPrice: (priceBrl: number) => string;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

const STORAGE_KEY = 'tocorime-locale';
const TTL_MS = 24 * 60 * 60 * 1000; // 1 day

// Priority order:
// 1. ?lang= URL param  (highest)
// 2. localStorage      (if not expired — TTL 1 day)
// 3. Browser language detection (lowest)
//
// Default language is ENGLISH for everyone. Portuguese is only used
// when the browser language is explicitly Portuguese (pt / pt-BR).
// Timezone is NOT used — foreigners in Brazil get English.
const detectLocale = (): { language: Language; currency: Currency } => {
  if (typeof window === 'undefined') return { language: 'en', currency: 'USD' };

  // --- 1. ?lang= URL param ---
  const urlLang = new URLSearchParams(window.location.search).get('lang');
  if (urlLang) {
    const map: Record<string, { language: Language; currency: Currency }> = {
      pt:    { language: 'pt',    currency: 'BRL' },
      en:    { language: 'en',    currency: 'USD' },
      es:    { language: 'es',    currency: 'USD' },
      de:    { language: 'de',    currency: 'EUR' },
      fr:    { language: 'fr',    currency: 'EUR' },
      it:    { language: 'it',    currency: 'EUR' },
      'zh-cn': { language: 'en', currency: 'USD' },
      'zh-tw': { language: 'en', currency: 'USD' },
    };
    const match = map[urlLang.toLowerCase()];
    if (match) return match;
  }

  // --- 2. localStorage (with 1-day TTL) ---
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const age = Date.now() - (parsed?.savedAt ?? 0);
      if (parsed?.language && parsed?.currency && age < TTL_MS && !String(parsed.language).startsWith('zh')) {
        return { language: parsed.language, currency: parsed.currency };
      }
      // Expired — remove stale entry so detection runs fresh
      window.localStorage.removeItem(STORAGE_KEY);
    }
  } catch {}

  // --- 3. Browser language detection ---
  // Default is ENGLISH for everyone. Portuguese is used only when the
  // visitor's browser language is explicitly Portuguese — timezone/location
  // is ignored, so foreigners traveling in Brazil still get English.
  const langs = (navigator.languages || [navigator.language || '']).map((l) => l.toLowerCase());
  const primary = langs[0] || '';

  // Portuguese ONLY for pt browsers (pt-BR → BRL, other pt → USD).
  if (primary === 'pt-br') {
    return { language: 'pt', currency: 'BRL' };
  }
  if (primary.startsWith('pt')) {
    return { language: 'pt', currency: 'USD' };
  }

  if (primary.startsWith('es')) return { language: 'es', currency: 'USD' };
  if (primary.startsWith('de')) return { language: 'de', currency: 'EUR' };
  if (primary.startsWith('fr')) return { language: 'fr', currency: 'EUR' };
  if (primary.startsWith('it')) return { language: 'it', currency: 'EUR' };


  return { language: 'en', currency: 'USD' };
};

const persistLocale = (lang: Language, curr: Currency) => {
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ language: lang, currency: curr, savedAt: Date.now() }),
    );
  } catch {}
};

export const LocaleProvider = ({ children }: { children: ReactNode }) => {
  const initial = detectLocale();
  const [language, setLanguageState] = useState<Language>(initial.language);
  const [currency, setCurrencyState] = useState<Currency>(initial.currency);
  const { rates } = useCurrency();
  const location = useLocation();

  // React to ?lang= changes on SPA navigation (e.g. user clicks a hreflang link)
  useEffect(() => {
    const urlLang = new URLSearchParams(location.search).get('lang');
    if (!urlLang) return;
    const map: Record<string, { language: Language; currency: Currency }> = {
      pt:      { language: 'pt',    currency: 'BRL' },
      en:      { language: 'en',    currency: 'USD' },
      es:    { language: 'es',    currency: 'USD' },
      de:    { language: 'de',    currency: 'EUR' },
      fr:    { language: 'fr',    currency: 'EUR' },
      it:    { language: 'it',    currency: 'EUR' },
      'zh-cn': { language: 'en', currency: 'USD' },
      'zh-tw': { language: 'en', currency: 'USD' },
    };
    const match = map[urlLang.toLowerCase()];
    if (match && match.language !== language) {
      setLanguageState(match.language);
      setCurrencyState(match.currency);
      persistLocale(match.language, match.currency);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    persistLocale(lang, currency);
  };

  const setCurrency = (curr: Currency) => {
    setCurrencyState(curr);
    persistLocale(language, curr);
  };

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang =
        language === 'pt'    ? 'pt-BR'
        : language === 'es'  ? 'es'
        : language === 'de' || language === 'fr' || language === 'it' ? language
        : language === 'zh-CN' ? 'zh-Hans'
        : language === 'zh-TW' ? 'zh-Hant'
        : 'en';
    }
  }, [language]);

  const t = (key: string) => {
    const map: any = {
      pt: translationsPt,
      en: translationsEn,
      es: translationsEs,
      de: translationsDe,
      fr: translationsFr,
      it: translationsIt,
      'zh-CN': translationsZhCN,
      'zh-TW': translationsZhTW,
    };
    // Fallback to English when a key is missing in the chosen language.
    return map[language]?.[key] || translationsEn[key as keyof typeof translationsEn] || key;
  };

  const formatPrice = (priceBrl: number) => {
    if (!priceBrl) return "";

    // rates são multiplicadores (ex: 0.20 para USD se 1 USD = 5 BRL)
    const converted = priceBrl * (rates[currency] || 1);

    const locale =
      language === 'en'    ? 'en-US'
      : language === 'es'  ? 'es-ES'
      : language === 'de'  ? 'de-DE'
      : language === 'fr'  ? 'fr-FR'
      : language === 'it'  ? 'it-IT'
      : language === 'zh-CN' ? 'zh-CN'
      : language === 'zh-TW' ? 'zh-TW'
      : 'pt-BR';

    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
    }).format(converted);
  };

  setTlLanguage(language);

  return (
    <LocaleContext.Provider value={{ language: baseLanguage(language), siteLanguage: language, setLanguage, currency, setCurrency, t, formatPrice }}>
      {children}
    </LocaleContext.Provider>
  );
};

export const useLocale = () => {
  const context = useContext(LocaleContext);
  if (!context) throw new Error('useLocale must be used within a LocaleProvider');
  return context;
};

/** Visitor's chosen language, safe outside the provider (falls back to English). */
export const useSiteLanguage = () => useContext(LocaleContext)?.siteLanguage ?? 'en';
