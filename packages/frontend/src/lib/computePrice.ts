export function computePrice(
  basePrice: number,
  adjustmentType: 'fixed' | 'dynamic',
  adjustmentDirection: 'increase' | 'decrease',
  adjustmentValue: number
): number {
  let newPrice: number;

  if (adjustmentType === 'fixed') {
    newPrice =
      adjustmentDirection === 'increase'
        ? basePrice + adjustmentValue
        : basePrice - adjustmentValue;
  } else {
    const amount = basePrice * (adjustmentValue / 100);
    newPrice =
      adjustmentDirection === 'increase'
        ? basePrice + amount
        : basePrice - amount;
  }

  return Math.max(0, Math.round(newPrice * 100) / 100);
}
