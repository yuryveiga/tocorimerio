import { describe, expect, it } from 'vitest';
import { getMatchRemaining } from './matchInventory';

describe('live match inventory', () => {
  it('uses the selected package stock instead of the outdated match counter', () => {
    expect(getMatchRemaining(-2, 33)).toBe(33);
  });
  it('preserves a lower local allocation', () => {
    expect(getMatchRemaining(20, 33, 5)).toBe(5);
  });
  it('does not fall back to match stock for a sold-out package', () => {
    expect(getMatchRemaining(20, 0)).toBe(0);
  });
  it('uses the match counter when no package exists', () => {
    expect(getMatchRemaining(9)).toBe(9);
  });
});