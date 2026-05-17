import { describe, it, expect } from 'vitest';
import computePrice from '../computePrice';

describe('computePrice', () => {
  it('fixed increase: adds value to base price', () => {
    expect(computePrice(100, { adjustmentType: 'fixed', adjustmentDirection: 'increase', adjustmentValue: 15 }))
      .toBe(115);
  });

  it('fixed decrease: subtracts value from base price', () => {
    expect(computePrice(409.32, { adjustmentType: 'fixed', adjustmentDirection: 'decrease', adjustmentValue: 15 }))
      .toBe(394.32);
  });

  it('dynamic increase: adds percentage to base price', () => {
    expect(computePrice(200, { adjustmentType: 'dynamic', adjustmentDirection: 'increase', adjustmentValue: 10 }))
      .toBe(220);
  });

  it('dynamic decrease: subtracts percentage from base price', () => {
    expect(computePrice(279.06, { adjustmentType: 'dynamic', adjustmentDirection: 'decrease', adjustmentValue: 10 }))
      .toBe(251.15); // 279.06 - 27.906 = 251.154 → rounded to 251.15
  });

  it('custom type: returns base price unchanged', () => {
    expect(computePrice(95, { adjustmentType: 'custom' }))
      .toBe(95);
  });

  it('rounds result to 2 decimal places', () => {
    // 100 + (100 * 33.33 / 100) = 100 + 33.33 = 133.33
    expect(computePrice(100, { adjustmentType: 'dynamic', adjustmentDirection: 'increase', adjustmentValue: 33.33 }))
      .toBe(133.33);
  });

  it('rounds correctly when result has more than 2 decimals', () => {
    // 10.01 + 0.03 = 10.04
    expect(computePrice(10.01, { adjustmentType: 'fixed', adjustmentDirection: 'increase', adjustmentValue: 0.03 }))
      .toBe(10.04);
  });

  it('allows negative results from large fixed decrease', () => {
    expect(computePrice(10, { adjustmentType: 'fixed', adjustmentDirection: 'decrease', adjustmentValue: 25 }))
      .toBe(-15);
  });

  it('throws when non-custom adjustment is missing direction', () => {
    expect(() =>
      computePrice(100, { adjustmentType: 'fixed', adjustmentDirection: null, adjustmentValue: 10 })
    ).toThrow('Non-custom adjustment requires adjustmentDirection and adjustmentValue');
  });

  it('throws when non-custom adjustment is missing value', () => {
    expect(() =>
      computePrice(100, { adjustmentType: 'dynamic', adjustmentDirection: 'increase', adjustmentValue: null })
    ).toThrow('Non-custom adjustment requires adjustmentDirection and adjustmentValue');
  });
});
