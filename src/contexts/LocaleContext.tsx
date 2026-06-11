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

export const LocaleProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('en');
  const [currency, setCurrency] = useState<Currency>('USD');
  const { rates } = useCurrency();

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
