/** Format an already-denominated booking amount; never apply exchange rates. */
export function normalizeReservationCurrency(currency?: string | null): string {
  return currency?.trim().toUpperCase() || 'BRL';
}

export function formatReservationAmount(amount: number, currency?: string | null): string {
  const code = normalizeReservationCurrency(currency);
  try {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency', currency: code, currencyDisplay: 'narrowSymbol',
    }).format(amount);
  } catch {
    return `${code} ${new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount)}`;
  }
}

export function confirmationRecipientName(customerName: string, isCustomerCopy: boolean): string {
  return isCustomerCopy ? customerName : 'Administrador';
}