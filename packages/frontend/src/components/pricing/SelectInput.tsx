import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SelectInputProps {
  placeholder?: string;
  value?: string;
  options?: string[];
  onChange?: (value: string) => void;
  className?: string;
}

export function SelectInput({
  placeholder,
  value,
  options = [],
  onChange,
  className
}: SelectInputProps) {
  return (
    <div className={cn('relative', className)}>
      <select
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="h-11 w-full appearance-none rounded-input border border-surface-border bg-white px-3.5 pr-10 text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-1 focus:ring-teal/30"
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" />
    </div>
  );
}
