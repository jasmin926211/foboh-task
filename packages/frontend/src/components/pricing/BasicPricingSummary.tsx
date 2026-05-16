import { useState, useMemo } from 'react';
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
