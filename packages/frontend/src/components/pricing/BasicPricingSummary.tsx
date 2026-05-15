import { Pencil } from 'lucide-react';
import { SectionCard } from './SectionCard';
import { PillButton } from './PillButton';

export function BasicPricingSummary() {
  return (
    <SectionCard
      title="Basic Pricing Profile"
      subtitle="Cheeky little description goes in here"
      status="completed"
    >
      <div className="my-5 border-t border-surface-border-soft" />

      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-ink-500">You've created a Price Profile</p>
          <p className="mt-1 text-base font-semibold text-ink-900">Heaps Normal #4</p>
          <p className="mt-1 text-[13px]">
            <span className="text-ink-500">Marked as </span>
            <span className="font-semibold text-ink-900">Default</span>
            <span className="text-ink-500">, and expires in </span>
            <span className="font-semibold text-ink-900">16 Days</span>
            <span className="text-ink-400"> {'{Date Here}'}</span>
          </p>
        </div>

        <PillButton
          variant="secondary"
          icon={<Pencil className="h-3.5 w-3.5" />}
          className="px-4 py-2 text-[13px]"
        >
          Make Changes
        </PillButton>
      </div>
    </SectionCard>
  );
}
