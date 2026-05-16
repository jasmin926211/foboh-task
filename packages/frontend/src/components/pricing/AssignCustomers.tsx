import { useMemo, useState, useRef, useEffect } from 'react';
import { Users, X } from 'lucide-react';
import { SectionCard } from './SectionCard';
import { useProfiles } from '@/hooks/usePricingProfiles';

interface AssignCustomersProps {
  customerNames: string[];
  onCustomerNamesChange: (names: string[]) => void;
}

export function AssignCustomers({ customerNames, onCustomerNamesChange }: AssignCustomersProps) {
  const { data: result } = useProfiles(undefined, undefined, 1, 100);
  const profiles = result?.data ?? [];
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Extract unique customer names from existing profiles, excluding already selected
  const suggestions = useMemo(() => {
    const allNames = [...new Set(profiles.map((p) => p.customerName))].sort();
    const selected = new Set(customerNames.map((n) => n.toLowerCase()));
    const available = allNames.filter((n) => !selected.has(n.toLowerCase()));
    if (!inputValue) return available;
    return available.filter((n) =>
      n.toLowerCase().includes(inputValue.toLowerCase())
    );
  }, [profiles, customerNames, inputValue]);

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

  const addCustomer = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    // Avoid duplicates (case-insensitive)
    if (customerNames.some((n) => n.toLowerCase() === trimmed.toLowerCase())) return;
    onCustomerNamesChange([...customerNames, trimmed]);
    setInputValue('');
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const removeCustomer = (name: string) => {
    onCustomerNamesChange(customerNames.filter((n) => n !== name));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addCustomer(inputValue);
    }
    // Backspace on empty input removes last chip
    if (e.key === 'Backspace' && !inputValue && customerNames.length > 0) {
      removeCustomer(customerNames[customerNames.length - 1]);
    }
  };

  return (
    <SectionCard
      title="Assign Customers to Pricing Profile"
      subtitle="Choose which customers this profile will be applied to"
      status={customerNames.length > 0 ? 'completed' : 'not-started'}
    >
      <div className="my-5 border-t border-surface-border-soft" />

      <div ref={wrapperRef} className="relative max-w-md">
        <label className="mb-2 block text-[13px] font-medium text-ink-700">
          Customer Names
        </label>

        {/* Chips + input container */}
        <div
          className="flex min-h-[44px] flex-wrap items-center gap-2 rounded-input border border-surface-border bg-white px-3 py-2 focus-within:ring-1 focus-within:ring-teal/30"
          onClick={() => inputRef.current?.focus()}
        >
          <Users className="h-4 w-4 shrink-0 text-ink-400" />
          {customerNames.map((name) => (
            <span
              key={name}
              className="inline-flex items-center gap-1 rounded-pill bg-teal-50 px-2.5 py-1 text-xs font-medium text-teal-800"
            >
              {name}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); removeCustomer(name); }}
                className="ml-0.5 rounded-full p-0.5 hover:bg-teal-200"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={handleKeyDown}
            placeholder={customerNames.length === 0 ? 'Type customer name and press Enter' : ''}
            className="min-w-[120px] flex-1 bg-transparent text-sm text-ink-900 outline-none placeholder:text-ink-400"
          />
        </div>

        <p className="mt-1.5 text-xs text-ink-400">
          Press Enter to add. One profile will be created per customer.
        </p>

        {/* Suggestions dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-input border border-surface-border bg-white shadow-lg">
            <p className="px-3 py-2 text-xs text-ink-400">Existing customers</p>
            {suggestions.map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => addCustomer(name)}
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
