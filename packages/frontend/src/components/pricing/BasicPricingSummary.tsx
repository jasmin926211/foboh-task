import { useState } from 'react';
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

  if (editing) {
    return (
      <SectionCard
        title="Basic Pricing Profile"
        subtitle="Enter your pricing profile name"
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
      subtitle="Profile name configured"
      status="completed"
    >
      <div className="my-5 border-t border-surface-border-soft" />

      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-ink-500">You've created a Price Profile</p>
          <p className="mt-1 text-base font-semibold text-ink-900">{name}</p>
        </div>

        <PillButton
          variant="secondary"
          icon={<Pencil className="h-3.5 w-3.5" />}
          className="px-4 py-2 text-[13px]"
          onClick={() => setEditing(true)}
        >
          Make Changes
        </PillButton>
      </div>
    </SectionCard>
  );
}
