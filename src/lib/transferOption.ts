export interface TransferOptionLike {
  title?: unknown;
  from?: unknown;
  to?: unknown;
}

export interface TransferDirection {
  from: string;
  to: string;
  title: string;
  hasRoute: boolean;
}

const clean = (value: unknown): string => String(value ?? "").trim();

/**
 * Resolves the origin/destination a client sees (and books) for a transfer
 * option. When `swapped` is true the two ends are inverted, so the client can
 * book the return leg of the same transfer at the same price.
 */
export function getTransferDirection(
  option: TransferOptionLike | undefined | null,
  swapped = false,
): TransferDirection {
  const rawFrom = clean(option?.from);
  const rawTo = clean(option?.to);
  const hasRoute = Boolean(rawFrom && rawTo);

  const from = swapped ? rawTo : rawFrom;
  const to = swapped ? rawFrom : rawTo;

  const title = from && to ? `${from} → ${to}` : from || to || clean(option?.title);

  return { from, to, title, hasRoute };
}
