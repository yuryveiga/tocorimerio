import { describe, it, expect } from 'vitest';
import { needsPaidConfirmation, paidEmailBody, paidEmailKey } from '../../supabase/functions/_shared/paidSaleEmail';
const sale = { id: 'sale-1', is_paid: true, emails_sent: false, customer_name: 'Test', customer_email: 'test@example.com', provider: 'matchday', total_price: 900, quantity: 3 };
describe('paid sale confirmations', () => {
  it('confirms paid partner reservations', () => expect(needsPaidConfirmation(sale)).toBe(true));
  it('confirms paid Stripe reservations', () => expect(needsPaidConfirmation({ ...sale, provider: 'stripe' })).toBe(true));
  it('does not confirm unpaid reservations', () => expect(needsPaidConfirmation({ ...sale, is_paid: false })).toBe(false));
  it('does not repeat completed confirmations', () => expect(needsPaidConfirmation({ ...sale, emails_sent: true })).toBe(false));
  it('does not confirm cancelled reservations', () => expect(needsPaidConfirmation({ ...sale, is_cancelled: true })).toBe(false));
  it('uses stable separate keys for admin and buyer retries', () => {
    expect(paidEmailKey('sale-1', 'admin')).toBe('paid-sale-sale-1-admin');
    expect(paidEmailKey('sale-1', 'customer')).toBe('paid-sale-sale-1-customer');
  });
  it('keeps the buyer and actual amount in the confirmation', () => {
    expect(paidEmailBody(sale, sale.customer_email, 'customer')).toMatchObject({ to: 'test@example.com', total: 900, isCustomerCopy: true, items: [{ quantity: 3 }] });
  });
  it.each(['BRL', 'USD', 'EUR'])('passes the recorded %s payment currency to both audiences', currency => {
    for (const audience of ['admin', 'customer'] as const) {
      expect(paidEmailBody({ ...sale, currency, total_price: 147.25 }, 'test@example.com', audience)).toMatchObject({ currency, total: 147.25 });
    }
  });
});