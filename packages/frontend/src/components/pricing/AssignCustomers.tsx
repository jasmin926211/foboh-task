import { useMemo, useState, useRef, useEffect } from 'react';
import { Users } from 'lucide-react';
import { SectionCard } from './SectionCard';
import { TextInput } from './TextInput';
import { useProfiles } from '@/hooks/usePricingProfiles';

interface AssignCustomersProps {
  customerName: string;
  onCustomerNameChange: (name: string) => void;
}

export function AssignCustomers({ customerName, onCustomerNameChange }: AssignCustomersProps) {
  const { data: profiles = [] } = useProfiles();
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Extract unique customer names from existing profiles
  const existingCustomers = useMemo(() => {
    const names = [...new Set(profiles.map((p) => p.customerName))].sort();
    if (!customerName) return names;
    return names.filter((n) =>
      n.toLowerCase().includes(customerName.toLowerCase())
    );
  }, [profiles, customerName]);

  // Close suggestions on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <SectionCard
      title="Assign Customers to Pricing Profile"
      subtitle="Choose which customers this profile will be applied to"
      status={customerName ? 'completed' : 'not-started'}
    >
      <div className="my-5 border-t border-surface-border-soft" />

      <div ref={wrapperRef} className="relative max-w-md">
        <label className="mb-2 block text-[13px] font-medium text-ink-700">
          Customer Name
        </label>
        <TextInput
          placeholder="Enter or select a customer name"
          value={customerName}
          onChange={(val) => {
            onCustomerNameChange(val);
            setShowSuggestions(true);
          }}
          iconLeft={<Users className="h-4 w-4" />}
        />

        {/* Suggestions dropdown */}
        {showSuggestions && existingCustomers.length > 0 && (
          <div className="absolute z-10 mt-1 w-full rounded-input border border-surface-border bg-white shadow-lg">
            <p className="px-3 py-2 text-xs text-ink-400">Existing customers</p>
            {existingCustomers.map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => {
                  onCustomerNameChange(name);
                  setShowSuggestions(false);
                }}
                className="block w-full px-3 py-2 text-left text-sm text-ink-900 hover:bg-surface-panel"
              >
                {name}
              </button>
            ))}
          </div>
        )}
      </div>
    </SectionCard>
  );
}
