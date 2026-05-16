import { useState, useMemo } from 'react';
import { Pencil, Check } from 'lucide-react';
import { SectionCard } from './SectionCard';
import { PillButton } from './PillButton';
import { TextInput } from './TextInput';

interface BasicPricingSummaryProps {
  name: string;
  onNameChange: (name: string) => void;
  isEditMode: boolean;
}

export function BasicPricingSummary({ name, onNameChange, isEditMode }: BasicPricingSummaryProps) {
  const [editing, setEditing] = useState(!isEditMode || !name);

  const expiryDate = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() + 16);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }, []);

  if (editing) {
    return (
      <SectionCard
        title="Basic Pricing Profile"
        subtitle="Cheeky little description goes in here"
        status={name ? 'completed' : 'not-started'}
      >
        <div className="my-5 border-t border-surface-border-soft" />

        <div className="flex items-end gap-4">
          <div className="flex-1">
            <label className="mb-2 block text-[13px] font-medium text-ink-700">
              Profile Name
            </label>
            <TextInput
              placeholder="Enter profile name"
              value={name}
              onChange={onNameChange}
            />
          </div>
          {name && (
            <PillButton
              variant="primary"
              icon={<Check className="h-3.5 w-3.5" />}
              className="px-4 py-2.5 text-[13px]"
              onClick={() => setEditing(false)}
            >
              Done
            </PillButton>
          )}
        </div>
      </SectionCard>
    );
  }

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
          <p className="mt-1 text-base font-semibold text-ink-900">{name}</p>
          <p className="mt-0.5 text-[13px] text-ink-500">
            Marked as <span className="font-semibold text-ink-900">Default</span>, and expires in{' '}
            <span className="font-semibold text-ink-900">16 Days</span>{' '}
            <span className="font-semibold text-ink-900">{expiryDate}</span>
          </p>
        </div>

        <button
          type="button"
          onClick={() => setEditing(true)}
          className="inline-flex items-center gap-2 text-sm font-medium text-ink-700 hover:text-ink-900"
        >
          <Pencil className="h-3.5 w-3.5" />
          Make Changes
        </button>
      </div>
    </SectionCard>
  );
}
