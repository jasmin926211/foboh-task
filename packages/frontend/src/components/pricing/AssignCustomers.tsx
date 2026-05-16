import { Users, User, UsersRound } from 'lucide-react';
import { SectionCard } from './SectionCard';
import { useCustomers } from '@/hooks/useCustomers';
import { useCustomerGroups } from '@/hooks/useCustomerGroups';

export type TargetType = 'customer' | 'group' | 'all';

interface AssignCustomersProps {
  targetType: TargetType;
  onTargetTypeChange: (type: TargetType) => void;
  customerId?: string;
  onCustomerIdChange: (id: string | undefined) => void;
  customerGroupId?: string;
  onCustomerGroupIdChange: (id: string | undefined) => void;
}

export function AssignCustomers({
  targetType,
  onTargetTypeChange,
  customerId,
  onCustomerIdChange,
  customerGroupId,
  onCustomerGroupIdChange,
}: AssignCustomersProps) {
  const { data: customers = [] } = useCustomers();
  const { data: groups = [] } = useCustomerGroups();

  const isComplete =
    targetType === 'all' ||
    (targetType === 'customer' && !!customerId) ||
    (targetType === 'group' && !!customerGroupId);

  const handleTargetTypeChange = (type: TargetType) => {
    onTargetTypeChange(type);
    if (type !== 'customer') onCustomerIdChange(undefined);
    if (type !== 'group') onCustomerGroupIdChange(undefined);
  };

  return (
    <SectionCard
      title="Assign Customers to Pricing Profile"
      subtitle="Choose which customers this profile will be applied to"
      status={isComplete ? 'completed' : 'not-started'}
    >
      <div className="my-5 border-t border-surface-border-soft" />

      <div className="max-w-md space-y-4">
        <label className="mb-2 block text-[13px] font-medium text-ink-700">
          Target Type
        </label>

        {/* Radio: Specific Customer */}
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="radio"
            name="targetType"
            checked={targetType === 'customer'}
            onChange={() => handleTargetTypeChange('customer')}
            className="mt-1 h-4 w-4 accent-teal-600"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-ink-500" />
              <span className="text-sm font-medium text-ink-900">Specific Customer</span>
            </div>
            <p className="mt-0.5 text-xs text-ink-500">Apply this profile to a single customer</p>
            {targetType === 'customer' && (
              <select
                value={customerId ?? ''}
                onChange={(e) => onCustomerIdChange(e.target.value || undefined)}
                className="mt-2 w-full rounded-input border border-surface-border bg-white px-3 py-2 text-sm text-ink-900 focus:outline-none focus:ring-1 focus:ring-teal/30"
              >
                <option value="">Select a customer...</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            )}
          </div>
        </label>

        {/* Radio: Customer Group */}
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="radio"
            name="targetType"
            checked={targetType === 'group'}
            onChange={() => handleTargetTypeChange('group')}
            className="mt-1 h-4 w-4 accent-teal-600"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <UsersRound className="h-4 w-4 text-ink-500" />
              <span className="text-sm font-medium text-ink-900">Customer Group</span>
            </div>
            <p className="mt-0.5 text-xs text-ink-500">Apply this profile to all members of a group</p>
            {targetType === 'group' && (
              <select
                value={customerGroupId ?? ''}
                onChange={(e) => onCustomerGroupIdChange(e.target.value || undefined)}
                className="mt-2 w-full rounded-input border border-surface-border bg-white px-3 py-2 text-sm text-ink-900 focus:outline-none focus:ring-1 focus:ring-teal/30"
              >
                <option value="">Select a group...</option>
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            )}
          </div>
        </label>

        {/* Radio: All Customers */}
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="radio"
            name="targetType"
            checked={targetType === 'all'}
            onChange={() => handleTargetTypeChange('all')}
            className="mt-1 h-4 w-4 accent-teal-600"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-ink-500" />
              <span className="text-sm font-medium text-ink-900">All Customers</span>
            </div>
            <p className="mt-0.5 text-xs text-ink-500">Apply this profile to every customer</p>
          </div>
        </label>
      </div>
    </SectionCard>
  );
}
