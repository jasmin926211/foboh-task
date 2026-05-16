import { cn } from '@/lib/utils';

interface PillButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost';
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  disabled?: boolean;
}

export function PillButton({
  variant = 'primary',
  children,
  onClick,
  className,
  icon,
  iconPosition = 'left',
  disabled
}: PillButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'inline-flex items-center gap-2 rounded-pill px-5 py-2.5 text-sm font-semibold transition-colors',
        variant === 'primary' && 'bg-teal text-white hover:bg-teal-600',
        variant === 'secondary' && 'border border-surface-border bg-white text-ink-900 hover:bg-gray-50',
        variant === 'ghost' && 'text-ink-700 hover:text-ink-900',
        disabled && 'cursor-not-allowed opacity-50',
        className
      )}
    >
      {icon && iconPosition === 'left' && icon}
      {children}
      {icon && iconPosition === 'right' && icon}
    </button>
  );
}
