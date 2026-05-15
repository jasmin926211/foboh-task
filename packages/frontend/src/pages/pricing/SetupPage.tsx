import { ChevronRight } from 'lucide-react';
import { PillButton } from '@/components/pricing/PillButton';
import { BasicPricingSummary } from '@/components/pricing/BasicPricingSummary';
import { SetProductPricing } from '@/components/pricing/SetProductPricing';
import { AssignCustomers } from '@/components/pricing/AssignCustomers';

export function SetupPage() {
  return (
    <div className="rounded-card bg-surface-panel p-8">
      {/* Header row */}
      <div className="flex items-start justify-between">
        <div>
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-ink-500">Pricing Profile</span>
            <ChevronRight className="h-3.5 w-3.5 text-ink-400" />
            <span className="font-semibold text-ink-900">Setup a Profile</span>
          </div>
          <p className="mt-1 text-[13px] text-ink-500">
            Setup your pricing profile, select products and assign customers
          </p>
        </div>

        <div className="flex items-center gap-4">
          <button className="text-sm font-medium text-ink-700 hover:text-ink-900">Cancel</button>
          <PillButton variant="secondary">Save as Draft</PillButton>
        </div>
      </div>

      {/* Section cards */}
      <div className="mt-6 flex flex-col gap-4">
        <BasicPricingSummary />
        <SetProductPricing />
        <AssignCustomers />
      </div>

      {/* Page footer */}
      <div className="mt-8 flex items-center justify-between">
        <p className="text-xs text-ink-400">Your entries are saved automatically</p>
        <div className="flex items-center gap-6">
          <button className="text-sm font-medium text-ink-700 hover:text-ink-900">Back</button>
          <PillButton variant="primary" className="px-6">
            Save &amp; Publish Profile
          </PillButton>
        </div>
      </div>
    </div>
  );
}
