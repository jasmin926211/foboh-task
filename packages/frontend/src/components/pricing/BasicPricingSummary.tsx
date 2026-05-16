import { useState } from 'react';
import { Pencil, Check, AlertCircle } from 'lucide-react';
import { SectionCard } from './SectionCard';
import { PillButton } from './PillButton';
import { TextInput } from './TextInput';
import { useCheckProfileName } from '@/hooks/usePricingProfiles';
import { useDebounce } from '@/hooks/useDebounce';

interface BasicPricingSummaryProps {
  name: string;
  onNameChange: (name: string) => void;
  isEditMode: boolean;
  profileId?: string;
}

export function BasicPricingSummary({ name, onNameChange, isEditMode, profileId }: BasicPricingSummaryProps) {
  const [editing, setEditing] = useState(!isEditMode || !name);

  const debouncedName = useDebounce(name, 400);
  const { data: nameExists } = useCheckProfileName(debouncedName, isEditMode ? profileId : undefined);

  if (editing) {
    return (
      <SectionCard
        title="Basic Pricing Profile"
        subtitle="Name your pricing profile to get started"
        status={name && !nameExists ? 'completed' : 'not-started'}
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
            {nameExists && (
              <div className="mt-2 flex items-center gap-1.5 text-red-600">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <p className="text-[13px]">
                  A profile named "<span className="font-semibold">{debouncedName}</span>" already exists
                </p>
              </div>
            )}
          </div>
          {name && !nameExists && (
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
      subtitle="Name your pricing profile to get started"
      status="completed"
    >
      <div className="my-5 border-t border-surface-border-soft" />

      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-ink-500">You've created a Price Profile</p>
          <p className="mt-1 text-base font-semibold text-ink-900">{name}</p>
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
