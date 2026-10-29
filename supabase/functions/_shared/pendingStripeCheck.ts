export const PAYMENT_CHECK_DELAY_MS = 15 * 60_000;

export function pendingStripeCheckDueAt(pendingSince: string): string {
  return new Date(new Date(pendingSince).getTime() + PAYMENT_CHECK_DELAY_MS).toISOString();
}

export function sessionMatchesPendingSale(session: { payment_status?: string; metadata?: { sale_ids?: string } | null }, saleId: string): boolean {
  if (session.payment_status !== 'paid') return false;
  try {
    const ids: unknown = JSON.parse(session.metadata?.sale_ids || '[]');
    return Array.isArray(ids) && ids.includes(saleId);
  } catch {
    return false;
  }
}