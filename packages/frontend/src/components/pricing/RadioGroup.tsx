import { cn } from '@/lib/utils';

interface RadioOption {
  label: string;
  value: string;
}

interface RadioGroupProps {
  options: RadioOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function RadioGroup({ options, value, onChange, className }: RadioGroupProps) {
  return (
    <div className={cn('flex items-center', className)}>
      {options.map((option, index) => (
        <div key={option.value} className="flex items-center">
          {index > 0 && <div className="mx-4 h-4 w-px bg-ink-300" />}
          <button
            type="button"
            onClick={() => onChange(option.value)}
            className="flex items-center gap-2"
          >
            <span
              className={cn(
                'flex h-[18px] w-[18px] items-center justify-center rounded-full border-2',
                value === option.value ? 'border-accent-green' : 'border-ink-300'
              )}
            >
              {value === option.value && (
                <span className="h-2 w-2 rounded-full bg-accent-green" />
              )}
            </span>
            <span className="text-sm text-ink-900">{option.label}</span>
          </button>
        </div>
      ))}
    </div>
  );
}
