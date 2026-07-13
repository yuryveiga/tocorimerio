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

// Detects the user's preferred language + currency on first visit.
// Brazil and Portugal → Portuguese + BRL (per business requirement).
// Other locales fall back to English + USD.
const detectLocale = (): { language: Language; currency: Currency } => {
  if (typeof window === 'undefined') return { language: 'en', currency: 'USD' };

  try {
    const saved = window.localStorage.getItem('tocorime-locale');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed?.language && parsed?.currency) return parsed;
    }
  } catch {}

  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
  const langs = (navigator.languages || [navigator.language || '']).map((l) => l.toLowerCase());
  const primary = langs[0] || '';

  const isBrazil = tz.startsWith('America/') && (tz.includes('Sao_Paulo') || tz.includes('Bahia') || tz.includes('Fortaleza') || tz.includes('Recife') || tz.includes('Manaus') || tz.includes('Belem') || tz.includes('Cuiaba') || tz.includes('Porto_Velho') || tz.includes('Rio_Branco') || tz.includes('Maceio') || tz.includes('Araguaina') || tz.includes('Boa_Vista') || tz.includes('Campo_Grande') || tz.includes('Noronha') || tz.includes('Santarem') || tz.includes('Eirunepe'));
  const isPortugal = tz === 'Europe/Lisbon' || tz === 'Atlantic/Azores' || tz === 'Atlantic/Madeira' || primary === 'pt-pt';

  if (isBrazil || primary === 'pt-br' || (primary === 'pt' && !isPortugal)) {
    return { language: 'pt', currency: 'BRL' };
  }
  if (isPortugal) {
    return { language: 'pt', currency: 'BRL' };
  }
  if (primary.startsWith('es')) return { language: 'es', currency: 'USD' };
  if (primary.startsWith('zh')) {
    return { language: primary.includes('tw') || primary.includes('hk') ? 'zh-TW' : 'zh-CN', currency: 'CNY' };
  }
  return { language: 'en', currency: 'USD' };
};

export const LocaleProvider = ({ children }: { children: ReactNode }) => {
  const initial = detectLocale();
  const [language, setLanguageState] = useState<Language>(initial.language);
  const [currency, setCurrencyState] = useState<Currency>(initial.currency);
  const { rates } = useCurrency();

  const persist = (lang: Language, curr: Currency) => {
    try {
      window.localStorage.setItem('tocorime-locale', JSON.stringify({ language: lang, currency: curr }));
    } catch {}
  };

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    persist(lang, currency);
  };
  const setCurrency = (curr: Currency) => {
    setCurrencyState(curr);
    persist(language, curr);
  };

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang =
        language === 'pt' ? 'pt-BR'
        : language === 'es' ? 'es'
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
    
    // Agora rates são multiplicadores (ex: 0.20 para USD se 1 USD = 5 BRL)
    // No LocaleContext antigo era priceBrl / rates[currency]
    // Para manter compatibilidade com a nova API que retorna multiplicadores:
    const converted = priceBrl * (rates[currency] || 1);

    const locale =
      language === 'en' ? 'en-US'
      : language === 'es' ? 'es-ES'
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
