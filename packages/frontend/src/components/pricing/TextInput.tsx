import { cn } from '@/lib/cn';

interface TextInputProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  className?: string;
}

export function TextInput({
  placeholder,
  value,
  onChange,
  iconLeft,
  iconRight,
  className
}: TextInputProps) {
  return (
    <div className={cn('relative flex items-center', className)}>
      {iconLeft && (
        <span className="pointer-events-none absolute left-3.5 text-ink-400">{iconLeft}</span>
      )}
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className={cn(
          'h-11 w-full rounded-input border border-surface-border bg-white px-3.5 text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-1 focus:ring-teal/30',
          iconLeft && 'pl-10',
          iconRight && 'pr-10'
        )}
      />
      {iconRight && (
        <span className="pointer-events-none absolute right-3.5 text-ink-400">{iconRight}</span>
      )}
    </div>
  );
}
