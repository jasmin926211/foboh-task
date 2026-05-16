import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SelectOption {
  label: string;
  value: string;
}

interface SelectInputProps {
  placeholder?: string;
  value?: string;
  options?: (string | SelectOption)[];
  onChange?: (value: string) => void;
  className?: string;
  allowEmpty?: boolean;
}

export function SelectInput({
  placeholder,
  value,
  options = [],
  onChange,
  className,
  allowEmpty,
}: SelectInputProps) {
  return (
    <div className={cn('relative', className)}>
      <select
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="h-11 w-full appearance-none rounded-input border border-surface-border bg-white px-3.5 pr-10 text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-1 focus:ring-teal/30"
      >
        {placeholder && (
          <option value="" disabled={!allowEmpty}>
            {placeholder}
          </option>
        )}
        {options.map((opt) => {
          const optValue = typeof opt === 'string' ? opt : opt.value;
          const optLabel = typeof opt === 'string' ? opt : opt.label;
          return (
            <option key={optValue} value={optValue}>
              {optLabel}
            </option>
          );
        })}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" />
    </div>
  );
}
