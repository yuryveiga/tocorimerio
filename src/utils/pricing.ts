/**
 * Pricing utilities for calculating tour costs based on different models.
 * Robust to strings and non-numeric values that may arrive from API.
 */

export type PricingTier = {
  min_people: number;
  max_people: number | null;
  price_per_person: number;
};

export type PricingTour = {
  price: number;
  pricing_model?: 'fixed' | 'dynamic' | 'group' | 'custom' | 'tiered' | string;
  price_1_person?: number;
  price_2_people?: number;
  price_3_6_people?: number;
  price_7_19_people?: number;
  use_custom_options?: boolean;
  custom_options_json?: { price: number }[];
  tiered_pricing_json?: PricingTier[];
};

/**
 * Safely converts a value to a positive number.
 */
function asNumber(val: unknown): number {
  if (val === null || val === undefined) return 0;
  const n = Number(val);
  return isNaN(n) ? 0 : n;
}

/**
 * Returns the price per person for a given quantity using tiered pricing.
 * Falls back to the last tier if quantity exceeds all defined ranges.
 */
export function getTieredPrice(tiers: PricingTier[] | undefined | null, quantity: number): number {
  if (!tiers || tiers.length === 0) return 0;

  // Sort tiers by min_people ascending for predictable lookup
  const sorted = [...tiers].sort((a, b) => a.min_people - b.min_people);

  for (const tier of sorted) {
    const min = asNumber(tier.min_people);
    const max = tier.max_people == null ? Infinity : asNumber(tier.max_people);
    if (quantity >= min && quantity <= max) {
      return asNumber(tier.price_per_person);
    }
  }

  // Fallback: use the last (highest) tier
  return asNumber(sorted[sorted.length - 1].price_per_person);
}

/**
 * Calculates the absolute minimum base price per person for a tour.
 * This looks across all dynamic pricing tiers and custom options to find the lowest possible cost.
 */
export function getTourMinPrice(tour: PricingTour): number {
  if (!tour) return 0;

  // 1. Tiered model: lowest price_per_person across all tiers
  if (tour.pricing_model === 'tiered') {
    const tiers = tour.tiered_pricing_json;
    if (tiers && tiers.length > 0) {
      return Math.min(...tiers.map(t => asNumber(t.price_per_person)).filter(p => p > 0));
    }
    return asNumber(tour.price);
  }

  // 2. Gather all dynamic tiers
  const tiers = [
    asNumber(tour.price_1_person),
    asNumber(tour.price_2_people),
    asNumber(tour.price_3_6_people),
    asNumber(tour.price_7_19_people)
  ].filter(p => p > 0);

  // 3. Base price candidate (often a residual in dynamic models, but primary in fixed/group)
  const basePrice = asNumber(tour.price);

  let minBase = 0;

  // 4. Logic based on pricing model
  if (tour.pricing_model === 'dynamic') {
    // For dynamic tours, the tiers are the source of truth for "Starting from".
    // We only use the base price if no tiers are defined.
    if (tiers.length > 0) {
      minBase = Math.min(...tiers);
    } else {
      minBase = basePrice;
    }
  } else if (tour.pricing_model === 'group') {
    // For groups, it's the fixed group price
    minBase = basePrice;
  } else if (tour.pricing_model === 'custom') {
    // Custom model often starts at 0 or a base fee
    minBase = tiers.length > 0 ? Math.min(...tiers) : basePrice;
  } else {
    // Fallback for fixed or undefined models: use anything available
    const allCandidates = [...tiers];
    if (basePrice > 0) allCandidates.push(basePrice);
    minBase = allCandidates.length > 0 ? Math.min(...allCandidates) : 0;
  }

  // 5. If there are custom options and they are active, add the lowest possible required option price
  if (tour.use_custom_options && Array.isArray(tour.custom_options_json) && tour.custom_options_json.length > 0) {
    const optionPrices = (tour.custom_options_json as { price: number }[])
      .map(o => asNumber(o.price))
      .filter(p => p >= 0);
    
    // We add the minimum option price to the base to show the "Starting from"
    if (optionPrices.length > 0) {
      minBase += Math.min(...optionPrices);
    }
  }

  return minBase;
}

