import { Package } from 'lucide-react';
import { Checkbox } from './Checkbox';

interface ProductRowProps {
  name: string;
  sku: string;
  subtitle: string;
  checked: boolean;
  onToggle: (checked: boolean) => void;
  isLast?: boolean;
  imageUrl?: string;
}

// Generate a consistent color from a string
function stringToColor(str: string): string {
  const colors = [
    'bg-amber-100', 'bg-blue-100', 'bg-emerald-100', 'bg-rose-100',
    'bg-purple-100', 'bg-orange-100', 'bg-cyan-100', 'bg-pink-100',
  ];
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export function ProductRow({
  name,
  sku,
  subtitle,
  checked,
  onToggle,
  isLast,
  imageUrl
}: ProductRowProps) {
  return (
    <div
      className={`flex items-center gap-4 py-3 ${!isLast ? 'border-b border-surface-border-soft' : ''}`}
    >
      <Checkbox checked={checked} onChange={onToggle} />

      {imageUrl ? (
        <img
          src={imageUrl}
          alt={name}
          className="h-12 w-12 shrink-0 rounded-md object-cover"
        />
      ) : (
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-md ${stringToColor(name)}`}>
          <Package className="h-5 w-5 text-ink-400" />
        </div>
      )}

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
