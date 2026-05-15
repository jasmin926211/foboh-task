import { Checkbox } from './Checkbox';
import type { PriceTableRow } from '@/lib/seed';

interface NewPriceTableProps {
  rows: PriceTableRow[];
}

export function NewPriceTable({ rows }: NewPriceTableProps) {
  return (
    <table className="w-full">
      <thead>
        <tr className="border-b border-surface-border">
          <th className="w-10 py-3 text-left">
            <Checkbox checked={false} onChange={() => {}} />
          </th>
          <th className="py-3 text-left text-[13px] font-medium text-ink-500">Product Title</th>
          <th className="py-3 text-left text-[13px] font-medium text-ink-500">SKU Code</th>
          <th className="py-3 text-left text-[13px] font-medium text-ink-500">Category</th>
          <th className="py-3 text-left text-[13px] font-medium text-ink-500">Based on Price</th>
          <th className="py-3 text-left text-[13px] font-medium text-ink-500">Adjustment</th>
          <th className="py-3 text-left text-[13px] font-medium text-ink-500">New Price</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.id} className="border-b border-surface-border-soft">
            <td className="py-4">
              <Checkbox checked={false} onChange={() => {}} />
            </td>
            <td className="py-4 text-sm text-ink-900">{row.title}</td>
            <td className="py-4 text-sm text-ink-700">{row.skuCode}</td>
            <td className="py-4 text-sm text-ink-700">{row.category}</td>
            <td className="py-4 text-sm text-ink-900">${row.basedOnPrice.toFixed(2)}</td>
            <td className="py-4">
              <input
                type="text"
                defaultValue={`-$ ${Math.abs(row.adjustment).toFixed(2)}`}
                className="h-10 w-28 rounded-input border-2 border-accent-green bg-accent-green-soft px-3 text-sm font-medium text-ink-900 focus:outline-none"
              />
            </td>
            <td className="py-4 text-sm font-semibold text-ink-900">
              ${row.newPrice.toFixed(2)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
