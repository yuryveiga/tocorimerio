import { supabase } from '@/integrations/supabase/client';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Currency = 'BRL' | 'USD' | 'EUR' | 'CNY';

interface CurrencyContextType {
  rates: Record<Currency, number>;
  loading: boolean;
  convertBRL: (amount: number, to: Currency) => number;
}

const DEFAULT_RATES: Record<Currency, number> = {
  BRL: 1,
  USD: 0.172, // 1 USD ≈ R$ 5,81 (last resort; weekly stored fallback preferred)
  EUR: 0.157, // 1 EUR ≈ R$ 6,38
  CNY: 1.23,
};

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
  const [rates, setRates] = useState<Record<Currency, number>>(DEFAULT_RATES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const response = await fetch('https://open.er-api.com/v6/latest/BRL');
        if (!response.ok) throw new Error('Failed to fetch rates');
        
        const data = await response.json();
        if (data && data.rates) {
          setRates({
            BRL: 1,
            USD: data.rates.USD || DEFAULT_RATES.USD,
            EUR: data.rates.EUR || DEFAULT_RATES.EUR,
            CNY: data.rates.CNY || DEFAULT_RATES.CNY,
          });
        }
      } catch (error) {
        console.error('Error fetching currency rates, using weekly fallback:', error);
        try {
          const { data } = await supabase.from('site_settings').select('value').eq('key', 'fallback_exchange_rates').maybeSingle();
          const stored = data?.value ? JSON.parse(data.value) : null;
          setRates(stored?.USD ? { BRL: 1, USD: stored.USD, EUR: stored.EUR, CNY: stored.CNY } : DEFAULT_RATES);
        } catch {
          setRates(DEFAULT_RATES);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRates();
  }, []);

  const convertBRL = (amount: number, to: Currency) => {
    return amount * (rates[to] || 1);
  };

  return (
    <CurrencyContext.Provider value={{ rates, loading, convertBRL }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) throw new Error('useCurrency must be used within a CurrencyProvider');
  return context;
};
