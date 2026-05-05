// Force refresh to resolve stale context issues
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { translationsPt, translationsEn, translationsEs } from "@/translations";
import { useCurrency } from './CurrencyContext';

type Language = 'pt' | 'en' | 'es';
type Currency = 'BRL' | 'USD' | 'EUR';

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
  const [language, setLanguage] = useState<Language>('pt');
  const [currency, setCurrency] = useState<Currency>('BRL');
  const { rates } = useCurrency();

  const t = (key: string) => {
    const map: any = { 
      pt: translationsPt, 
      en: translationsEn, 
      es: translationsEs 
    };
    return map[language][key] || key;
  };

  const formatPrice = (priceBrl: number) => {
    if (!priceBrl) return "";
    
    // Agora rates são multiplicadores (ex: 0.20 para USD se 1 USD = 5 BRL)
    // No LocaleContext antigo era priceBrl / rates[currency]
    // Para manter compatibilidade com a nova API que retorna multiplicadores:
    const converted = priceBrl * (rates[currency] || 1);
    
    return new Intl.NumberFormat(language === 'en' ? 'en-US' : language === 'es' ? 'es-ES' : 'pt-BR', {
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
