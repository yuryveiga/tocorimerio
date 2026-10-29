import { describe, it, expect } from 'vitest';
import { formatReservationAmount, confirmationRecipientName } from '../../supabase/functions/_shared/reservationPresentation';

describe('recorded reservation currency', () => {
  it('shows reais without converting the amount', () => {
    expect(formatReservationAmount(1234.56, 'BRL')).toBe('R$\u00a01.234,56');
  });
  it('shows dollars without converting the amount', () => {
    expect(formatReservationAmount(1234.56, 'usd')).toBe('$\u00a01.234,56');
  });
  it('shows euros without converting the amount', () => {
    expect(formatReservationAmount(1234.56, 'EUR')).toBe('€\u00a01.234,56');
  });
  it('keeps legacy reservations without currency in reais', () => {
    expect(formatReservationAmount(900, null)).toBe('R$\u00a0900,00');
  });
  it('addresses the administrator rather than the buyer', () => {
    expect(confirmationRecipientName('Akeasha Branch', false)).toBe('Administrador');
  });
  it('keeps the buyer as recipient for customer confirmations', () => {
    expect(confirmationRecipientName('Akeasha Branch', true)).toBe('Akeasha Branch');
  });
});