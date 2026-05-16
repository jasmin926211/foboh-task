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

  const direction = adjustment.adjustmentDirection!;
  const value = adjustment.adjustmentValue!;
  let newPrice: number;

  if (adjustment.adjustmentType === 'fixed') {
    newPrice = direction === 'increase' ? basePrice + value : basePrice - value;
  } else {
    const percentage = value / 100;
    newPrice =
      direction === 'increase'
        ? basePrice + basePrice * percentage
        : basePrice - basePrice * percentage;
  }

  return Math.round(newPrice * 100) / 100;
};

export default computePrice;
