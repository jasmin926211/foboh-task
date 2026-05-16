import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
}

export function Checkbox({ checked, onChange, className }: CheckboxProps) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={cn(
        'flex h-5 w-5 shrink-0 items-center justify-center rounded-[4px] border-2 transition-colors',
        checked ? 'border-accent-green bg-accent-green' : 'border-ink-300 bg-white',
        className
      )}
    >
      {checked && <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />}
    </button>
  );
}
