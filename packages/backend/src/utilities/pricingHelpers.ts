import { PROFILE_SCOPE, PERCENTAGE_DIVISOR, MARGIN_MULTIPLIER_BASE, MARGIN_DIVERGENCE_THRESHOLD, EMPTY_MARGIN_INSIGHT } from '../constants';
import { roundToTwo } from './roundTo';

export function computeTier(profile: {
  customerId: string | null;
  customerGroupId: string | null;
  scope: string;
}): number {
  if (profile.customerId) {
    return profile.scope === PROFILE_SCOPE.SELECTED ? 1 : 2;
  }
  if (profile.customerGroupId) {
    return profile.scope === PROFILE_SCOPE.SELECTED ? 3 : 4;
  }
  return profile.scope === PROFILE_SCOPE.SELECTED ? 5 : 6;
}

export function computeFloorPrice(
  costPrice: number | null,
  minMarginPercent: number | null,
): number | null {
  if (costPrice == null || minMarginPercent == null) return null;
  return roundToTwo(costPrice * (MARGIN_MULTIPLIER_BASE + minMarginPercent / PERCENTAGE_DIVISOR));
}

export function calculateMarginInsight(
  sameTierEntries: { computedPrice: number }[],
  finalPrice: number,
): {
  triggered: boolean;
  winningPrice: number;
  sameTierAvgPrice: number;
  divergencePercent: number;
  message: string | null;
} {
  if (sameTierEntries.length < 2) {
    return {
      triggered: false,
      winningPrice: finalPrice,
      sameTierAvgPrice: finalPrice,
      divergencePercent: 0,
      message: null,
    };
  }

  const avgPrice = sameTierEntries.reduce((sum, e) => sum + e.computedPrice, 0) / sameTierEntries.length;
  const sameTierAvgPrice = roundToTwo(avgPrice);
  const divergencePercent = roundToTwo(((finalPrice - sameTierAvgPrice) / sameTierAvgPrice) * 10000) / 100;
  const triggered = Math.abs(divergencePercent) > MARGIN_DIVERGENCE_THRESHOLD;

  return {
    triggered,
    winningPrice: finalPrice,
    sameTierAvgPrice,
    divergencePercent,
    message: triggered
      ? `Winning price is ${Math.abs(divergencePercent)}% ${divergencePercent < 0 ? 'below' : 'above'} the average of same-tier profiles ($${sameTierAvgPrice.toFixed(2)}). Review floor protection settings.`
      : null,
  };
}
