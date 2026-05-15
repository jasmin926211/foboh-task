interface PriceAdjustment {
  adjustmentType: 'fixed' | 'dynamic';
  adjustmentDirection: 'increase' | 'decrease';
  adjustmentValue: number;
}

const computePrice = (basePrice: number, adjustment: PriceAdjustment): number => {
  let newPrice: number;

  if (adjustment.adjustmentType === 'fixed') {
    newPrice =
      adjustment.adjustmentDirection === 'increase'
        ? basePrice + adjustment.adjustmentValue
        : basePrice - adjustment.adjustmentValue;
  } else {
    const percentage = adjustment.adjustmentValue / 100;
    newPrice =
      adjustment.adjustmentDirection === 'increase'
        ? basePrice + basePrice * percentage
        : basePrice - basePrice * percentage;
  }

  return Math.max(0, Math.round(newPrice * 100) / 100);
};

export default computePrice;
