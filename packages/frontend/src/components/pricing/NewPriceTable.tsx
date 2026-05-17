import { Checkbox } from './Checkbox';
import type { PreviewPrice } from '@/types';

interface NewPriceTableProps {
  rows: PreviewPrice[];
  adjustmentDirection: 'increase' | 'decrease';
  adjustmentType: 'fixed' | 'dynamic' | 'custom';
  customPrices?: Record<string, number>;
  onCustomPriceChange?: (productId: string, price: number) => void;
}

export function NewPriceTable({
  rows,
  adjustmentDirection,
  adjustmentType,
  customPrices,
  onCustomPriceChange,
}: NewPriceTableProps) {
  const isCustom = adjustmentType === 'custom';

  const formatAdjustment = (value: number) => {
    const sign = adjustmentDirection === 'increase' ? '+' : '-';
    if (adjustmentType === 'dynamic') {
      return `${sign} $${Math.abs(value).toFixed(2)}`;
    }
    return `${sign}$ ${Math.abs(value).toFixed(2)}`;
  };

  if (rows.length === 0) {
    return (
      <div className="rounded-card border border-surface-border-soft bg-surface-panel px-6 py-8 text-center text-sm text-ink-500">
        {isCustom
          ? 'Select products above to set custom prices.'
          : 'Select products and set adjustment values to see the price table.'}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[700px]">
        <thead>
          <tr className="border-b border-surface-border">
            <th className="w-10 py-3 text-left">
              <Checkbox checked={false} onChange={() => {}} />
            </th>
            <th className="px-2 py-3 text-left text-[13px] font-medium text-ink-500">Product Title</th>
            <th className="px-2 py-3 text-left text-[13px] font-medium text-ink-500 whitespace-nowrap">SKU Code</th>
            <th className="px-2 py-3 text-left text-[13px] font-medium text-ink-500">Category</th>
            <th className="px-2 py-3 text-left text-[13px] font-medium text-ink-500 whitespace-nowrap">Based on Price</th>
            {isCustom ? (
              <th className="px-2 py-3 text-left text-[13px] font-medium text-ink-500 whitespace-nowrap">Custom Price</th>
            ) : (
              <th className="px-2 py-3 text-left text-[13px] font-medium text-ink-500">Adjustment</th>
            )}
            <th className="px-2 py-3 text-left text-[13px] font-medium text-ink-500 whitespace-nowrap">New Price</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.productId} className="border-b border-surface-border-soft">
              <td className="py-4">
                <Checkbox checked={false} onChange={() => {}} />
              </td>
              <td className="px-2 py-4 text-sm text-ink-900">{row.productTitle}</td>
              <td className="px-2 py-4 text-sm text-ink-700 whitespace-nowrap">{row.sku}</td>
              <td className="px-2 py-4 text-sm text-ink-700">{row.category}</td>
              <td className="px-2 py-4 text-sm text-ink-900 whitespace-nowrap">${row.basePrice.toFixed(2)}</td>
              <td className="px-2 py-4">
                {isCustom ? (
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={customPrices?.[row.productId] ?? ''}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      if (onCustomPriceChange && !isNaN(val)) {
                        onCustomPriceChange(row.productId, val);
                      }
                    }}
                    placeholder="0.00"
                    className="h-10 w-28 rounded-input border-2 border-accent-green bg-white px-3 text-sm font-medium text-ink-900 focus:outline-none focus:ring-1 focus:ring-accent-green/30"
                  />
                ) : (
                  <span className="inline-block h-10 w-28 rounded-input border-2 border-accent-green bg-accent-green-soft px-3 text-sm font-medium leading-10 text-ink-900">
                    {formatAdjustment(row.adjustment)}
                  </span>
                )}
              </td>
              <td className="px-2 py-4 text-sm font-semibold text-ink-900 whitespace-nowrap">
                ${(isCustom ? (customPrices?.[row.productId] ?? row.basePrice) : row.newPrice).toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
