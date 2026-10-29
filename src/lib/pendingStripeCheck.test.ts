import { describe, expect, it } from 'vitest';
import { pendingStripeCheckDueAt, sessionMatchesPendingSale } from '../../supabase/functions/_shared/pendingStripeCheck';

describe('pending Stripe payment check', () => {
  it('schedules exactly 15 minutes after the purchase becomes pending', () => {
    expect(pendingStripeCheckDueAt('2026-10-29T04:18:00Z')).toBe('2026-10-29T04:33:00.000Z');
  });
  it('accepts only a paid session associated with this sale', () => {
    expect(sessionMatchesPendingSale({ payment_status: 'paid', metadata: { sale_ids: '["sale-1","sale-2"]' } }, 'sale-1')).toBe(true);
  });
  it('does not mark a still-unpaid checkout paid', () => {
    expect(sessionMatchesPendingSale({ payment_status: 'unpaid', metadata: { sale_ids: '["sale-1"]' } }, 'sale-1')).toBe(false);
  });
  it('rejects a payment belonging to another purchase', () => {
    expect(sessionMatchesPendingSale({ payment_status: 'paid', metadata: { sale_ids: '["other"]' } }, 'sale-1')).toBe(false);
  });
  it('rejects malformed or missing payment metadata', () => {
    expect(sessionMatchesPendingSale({ payment_status: 'paid', metadata: { sale_ids: 'invalid' } }, 'sale-1')).toBe(false);
    expect(sessionMatchesPendingSale({ payment_status: 'paid' }, 'sale-1')).toBe(false);
  });
});