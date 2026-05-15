import { cn } from '@/lib/cn';

interface StatusBadgeProps {
  status: 'completed' | 'not-started';
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={cn(
          'h-2 w-2 rounded-full',
          status === 'completed' ? 'bg-accent-green' : 'bg-ink-400'
        )}
      />
      <span
        className={cn(
          'text-[13px] font-medium',
          status === 'completed' ? 'text-accent-green' : 'text-ink-500'
        )}
      >
        {status === 'completed' ? 'Completed' : 'Not Started'}
      </span>
    </div>
  );
}
