import { normalizeReservationCurrency } from './reservationPresentation.ts';

export interface PaidSale {
  id: string;
  is_paid: boolean | null;
  is_cancelled?: boolean | null;
  emails_sent: boolean;
  customer_name: string;
  customer_email: string;
  customer_phone?: string | null;
  tour_title?: string | null;
  tour_slug?: string | null;
  provider?: string | null;
  quantity?: number | null;
  total_price?: number | null;
  currency?: string | null;
  selected_date?: string | null;
  selected_period?: string | null;
  is_private?: boolean | null;
}

export function needsPaidConfirmation(sale: PaidSale): boolean {
  return sale.is_paid === true && sale.is_cancelled !== true && !sale.emails_sent;
}

export function paidEmailKey(saleId: string, audience: 'admin' | 'customer'): string {
  return `paid-sale-${saleId}-${audience}`;
}

export function paidEmailBody(sale: PaidSale, to: string, audience: 'admin' | 'customer') {
  return {
    to, customerName: sale.customer_name, customerEmail: sale.customer_email,
    customerPhone: sale.customer_phone ?? '', total: Number(sale.total_price ?? 0),
    currency: normalizeReservationCurrency(sale.currency),
    isCustomerCopy: audience === 'customer', provider: sale.provider ?? undefined,
    tourTitle: sale.tour_title ?? undefined, tourSlug: sale.tour_slug ?? undefined,
    idempotencyKey: paidEmailKey(sale.id, audience),
    ...(audience === 'customer' ? { replyTo: 'tocorimeriotours@gmail.com' } : {}),
    items: [{ tour: sale.tour_title || 'Reserva Tocorime Rio', quantity: sale.quantity ?? 1, date: sale.selected_date || 'A confirmar / To be confirmed' }],
  };
}