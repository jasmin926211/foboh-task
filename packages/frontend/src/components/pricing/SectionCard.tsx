import { cn } from '@/lib/cn';
import { StatusBadge } from './StatusBadge';

interface SectionCardProps {
  title: string;
  subtitle: string;
  status?: 'completed' | 'not-started';
  children?: React.ReactNode;
  className?: string;
}

export function SectionCard({ title, subtitle, status, children, className }: SectionCardProps) {
  return (
    <div
      className={cn(
        'rounded-card border border-surface-border-soft bg-surface-card p-6',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-ink-900">{title}</h3>
          <p className="mt-0.5 text-[13px] text-ink-500">{subtitle}</p>
        </div>
        {status && <StatusBadge status={status} />}
      </div>
      {children}
    </div>
  );
}
