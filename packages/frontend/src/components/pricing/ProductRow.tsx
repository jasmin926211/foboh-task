import { Package } from 'lucide-react';
import { Checkbox } from './Checkbox';

interface ProductRowProps {
  name: string;
  sku: string;
  subtitle: string;
  checked: boolean;
  onToggle: (checked: boolean) => void;
  isLast?: boolean;
}

export function ProductRow({
  name,
  sku,
  subtitle,
  checked,
  onToggle,
  isLast
}: ProductRowProps) {
  return (
    <div
      className={`flex items-center gap-4 py-3 ${!isLast ? 'border-b border-surface-border-soft' : ''}`}
    >
      <Checkbox checked={checked} onChange={onToggle} />

      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-surface-panel">
        <Package className="h-5 w-5 text-ink-400" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[15px] font-semibold text-ink-900">{name}</p>
        <div className="flex items-center gap-2 text-[13px] text-ink-500">
          <span>{sku}</span>
          <span className="h-3 w-px bg-ink-300" />
          <span>{subtitle}</span>
        </div>
      </div>
    </div>
  );
}
