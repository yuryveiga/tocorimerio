export function getMatchRemaining(
  matchRemaining: number,
  packageRemaining?: number,
  localRemaining?: number | null,
): number {
  const remaining = Math.max(0, packageRemaining ?? matchRemaining);
  return localRemaining == null ? remaining : Math.min(remaining, Math.max(0, localRemaining));
}