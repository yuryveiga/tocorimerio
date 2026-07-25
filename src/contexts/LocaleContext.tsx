// Force refresh to resolve stale context issues
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { translationsPt, translationsEn, translationsEs, translationsZhCN, translationsZhTW } from "@/translations";
import { useCurrency } from './CurrencyContext';

type Language = 'pt' | 'en' | 'es' | 'zh-CN' | 'zh-TW';
type Currency = 'BRL' | 'USD' | 'EUR' | 'CNY';

interface LocaleContextType {
  language: Language;
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
// 3. Browser language + system timezone detection (lowest)
//
// Portuguese is only inferred for explicit pt-BR speakers or
// users whose system timezone is a known Brazilian timezone.
// Generic "pt" (no region) falls back to English.
const detectLocale = (): { language: Language; currency: Currency } => {
  if (typeof window === 'undefined') return { language: 'en', currency: 'USD' };

  // --- 1. ?lang= URL param ---
  const urlLang = new URLSearchParams(window.location.search).get('lang');
  if (urlLang) {
    const map: Record<string, { language: Language; currency: Currency }> = {
      pt:    { language: 'pt',    currency: 'BRL' },
      en:    { language: 'en',    currency: 'USD' },
      es:    { language: 'es',    currency: 'USD' },
      'zh-cn': { language: 'zh-CN', currency: 'CNY' },
      'zh-tw': { language: 'zh-TW', currency: 'CNY' },
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
      if (parsed?.language && parsed?.currency && age < TTL_MS) {
        return { language: parsed.language, currency: parsed.currency };
      }
      // Expired — remove stale entry so detection runs fresh
      window.localStorage.removeItem(STORAGE_KEY);
    }
  } catch {}

  // --- 3. Browser language + timezone detection ---
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
  const langs = (navigator.languages || [navigator.language || '']).map((l) => l.toLowerCase());
  const primary = langs[0] || '';

  // Brazilian timezones (system clock, not IP-based)
  const isBrazil =
    tz.startsWith('America/') &&
    (tz.includes('Sao_Paulo') || tz.includes('Bahia') || tz.includes('Fortaleza') ||
     tz.includes('Recife')   || tz.includes('Manaus') || tz.includes('Belem')     ||
     tz.includes('Cuiaba')   || tz.includes('Porto_Velho') || tz.includes('Rio_Branco') ||
     tz.includes('Maceio')   || tz.includes('Araguaina') || tz.includes('Boa_Vista') ||
     tz.includes('Campo_Grande') || tz.includes('Noronha') || tz.includes('Santarem') ||
     tz.includes('Eirunepe'));

  // Portuguese ONLY for explicit pt-BR speakers or Brazilian system timezone.
  // Generic "pt" (no region) → English (avoids misdetecting African/European users).
  if (isBrazil || primary === 'pt-br') {
    return { language: 'pt', currency: 'BRL' };
  }

  if (primary.startsWith('es')) return { language: 'es', currency: 'USD' };

  if (primary.startsWith('zh')) {
    return {
      language: primary.includes('tw') || primary.includes('hk') ? 'zh-TW' : 'zh-CN',
      currency: 'CNY',
    };
  }

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

  // If a ?lang= param is present, persist it so navigation within the site keeps the language.
  useEffect(() => {
    const urlLang = new URLSearchParams(window.location.search).get('lang');
    if (urlLang) {
      persistLocale(language, currency);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      : language === 'zh-CN' ? 'zh-CN'
      : language === 'zh-TW' ? 'zh-TW'
      : 'pt-BR';

    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
    }).format(converted);
  };

  return (
    <LocaleContext.Provider value={{ language, setLanguage, currency, setCurrency, t, formatPrice }}>
      {children}
    </LocaleContext.Provider>
  );
};

export const useLocale = () => {
  const context = useContext(LocaleContext);
  if (!context) throw new Error('useLocale must be used within a LocaleProvider');
  return context;
};
