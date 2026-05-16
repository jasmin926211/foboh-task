import { PERCENTAGE_DIVISOR } from '../constants';

interface PriceAdjustment {
  adjustmentType: 'fixed' | 'dynamic' | 'custom';
  adjustmentDirection?: 'increase' | 'decrease' | null;
  adjustmentValue?: number | null;
}

const computePrice = (basePrice: number, adjustment: PriceAdjustment): number => {
  if (adjustment.adjustmentType === 'custom') {
    // Custom prices are stored per-product on the junction row, not computed here.
    return basePrice;
  }

  if (adjustment.adjustmentDirection == null || adjustment.adjustmentValue == null) {
    throw new Error(
      `Non-custom adjustment requires adjustmentDirection and adjustmentValue, got direction=${adjustment.adjustmentDirection}, value=${adjustment.adjustmentValue}`
    );
  }

  const direction = adjustment.adjustmentDirection;
  const value = adjustment.adjustmentValue;
  let newPrice: number;

  if (adjustment.adjustmentType === 'fixed') {
    newPrice = direction === 'increase' ? basePrice + value : basePrice - value;
  } else {
    const percentage = value / PERCENTAGE_DIVISOR;
    newPrice =
      direction === 'increase'
        ? basePrice + basePrice * percentage
        : basePrice - basePrice * percentage;
  }

  return Math.round(newPrice * 100) / 100;
};

export default computePrice;
