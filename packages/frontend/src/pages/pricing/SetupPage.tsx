import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { PillButton } from '@/components/pricing/PillButton';
import { BasicPricingSummary } from '@/components/pricing/BasicPricingSummary';
import { SetProductPricing } from '@/components/pricing/SetProductPricing';
import { AssignCustomers } from '@/components/pricing/AssignCustomers';
import { useProfile, useCreateProfile, useUpdateProfile } from '@/hooks/usePricingProfiles';
import axios from 'axios';

export function SetupPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  // Form state
  const [profileName, setProfileName] = useState('');
  const [customerNames, setCustomerNames] = useState<string[]>([]);
  const [adjustmentType, setAdjustmentType] = useState<'fixed' | 'dynamic' | 'custom'>('fixed');
  const [adjustmentDirection, setAdjustmentDirection] = useState<'increase' | 'decrease'>('decrease');
  const [adjustmentValue, setAdjustmentValue] = useState(0);
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(new Set());
  const [scope, setScope] = useState<'all' | 'selected'>('selected');
  const [customPrices, setCustomPrices] = useState<Record<string, number>>({});

  // Load existing profile for edit mode
  const { data: existingProfile, isLoading: isLoadingProfile } = useProfile(id);

  useEffect(() => {
    if (existingProfile) {
      setProfileName(existingProfile.name);
      setCustomerNames([existingProfile.customerName]);
      setAdjustmentType(existingProfile.adjustmentType);
      setAdjustmentDirection(existingProfile.adjustmentDirection ?? 'decrease');
      setAdjustmentValue(existingProfile.adjustmentValue ?? 0);
      setScope(existingProfile.scope ?? 'selected');
      setSelectedProductIds(
        new Set(existingProfile.profileProducts?.map((pp: { productId: string }) => pp.productId) ?? [])
      );
      if (existingProfile.adjustmentType === 'custom') {
        const prices: Record<string, number> = {};
        for (const pp of existingProfile.profileProducts ?? []) {
          if (pp.customPrice != null) {
            prices[pp.productId] = pp.customPrice;
          }
        }
        setCustomPrices(prices);
      }
    }
  }, [existingProfile]);

  // Mutations
  const createMutation = useCreateProfile();
  const updateMutation = useUpdateProfile();
  const isSaving = createMutation.isPending || updateMutation.isPending;

  const handleSave = useCallback(async (status: 'draft' | 'published') => {
    const isCustom = adjustmentType === 'custom';

    // Validation
    if (!profileName.trim()) {
      toast.error('Please enter a profile name');
      return;
    }
    if (customerNames.length === 0) {
      toast.error('Please assign at least one customer');
      return;
    }
    if (scope === 'selected' && selectedProductIds.size === 0) {
      toast.error('Please select at least one product');
      return;
    }
    if (!isCustom && adjustmentValue <= 0) {
      toast.error('Please enter a positive adjustment value');
      return;
    }
    if (isCustom) {
      const missing = Array.from(selectedProductIds).filter((pid) => !(pid in customPrices));
      if (missing.length > 0) {
        toast.error('Please enter a custom price for every selected product');
        return;
      }
    }

    const effectiveScope = isCustom ? 'selected' : scope;

    try {
      if (isEditMode && id) {
        // Update mode: single customer (edit one profile at a time)
        const payload: Record<string, unknown> = {
          name: profileName.trim(),
          customerName: customerNames[0]?.trim(),
          adjustmentType,
          status,
          scope: effectiveScope,
          ...(effectiveScope === 'selected' && { productIds: Array.from(selectedProductIds) }),
        };

        if (isCustom) {
          payload.customPrices = customPrices;
        } else {
          payload.adjustmentDirection = adjustmentDirection;
          payload.adjustmentValue = adjustmentValue;
        }

        await updateMutation.mutateAsync({ id, payload: payload as any });
        toast.success('Profile updated successfully');
      } else {
        // Create mode: one profile per customer
        const payload: Record<string, unknown> = {
          name: profileName.trim(),
          customerNames: customerNames.map((n) => n.trim()),
          adjustmentType,
          status,
          scope: effectiveScope,
          ...(effectiveScope === 'selected' && { productIds: Array.from(selectedProductIds) }),
        };

        if (isCustom) {
          payload.customPrices = customPrices;
        } else {
          payload.adjustmentDirection = adjustmentDirection;
          payload.adjustmentValue = adjustmentValue;
        }

        await createMutation.mutateAsync(payload as any);
        const count = customerNames.length;
        toast.success(
          status === 'draft'
            ? `${count} profile${count > 1 ? 's' : ''} saved as draft`
            : `${count} profile${count > 1 ? 's' : ''} published successfully`
        );
      }
      navigate('/pricing/profiles');
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.status === 409) {
        toast.error(err.response.data?.error?.description || 'A profile with this name already exists');
      } else if (axios.isAxiosError(err) && err.response?.status === 422) {
        const errorData = err.response.data?.error;
        const products = errorData?.products;
        if (products && Array.isArray(products)) {
          const names = products.map((p: { productTitle: string }) => p.productTitle).join(', ');
          toast.error(`Negative prices detected for: ${names}`);
        } else {
          toast.error(errorData?.description || 'Validation error');
        }
      } else {
        const message = err instanceof Error ? err.message : 'Something went wrong';
        toast.error(message);
      }
    }
  }, [
    profileName,
    customerNames,
    selectedProductIds,
    adjustmentType,
    adjustmentDirection,
    adjustmentValue,
    scope,
    customPrices,
    isEditMode,
    id,
    createMutation,
    updateMutation,
    navigate,
  ]);

  if (isEditMode && isLoadingProfile) {
    return (
      <div className="flex items-center justify-center gap-2 py-20 text-ink-500">
        <Loader2 className="h-5 w-5 animate-spin" />
        Loading profile...
      </div>
    );
  }

  return (
    <div className="rounded-card bg-surface-panel p-8">
      {/* Header row */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-ink-500">Pricing Profile</span>
            <ChevronRight className="h-3.5 w-3.5 text-ink-400" />
            <span className="font-semibold text-ink-900">
              {isEditMode ? 'Edit Profile' : 'Setup a Profile'}
            </span>
          </div>
          <p className="mt-1 text-[13px] text-ink-500">
            Setup your pricing profile, select products and assign customers
          </p>
        </div>

        <div className="flex items-center gap-4">
          <button
            className="text-sm font-medium text-ink-700 hover:text-ink-900"
            onClick={() => navigate('/pricing/profiles')}
          >
            Cancel
          </button>
          <PillButton variant="secondary" onClick={() => handleSave('draft')} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save as Draft'}
          </PillButton>
        </div>
      </div>

      {/* Section cards */}
      <div className="mt-6 flex flex-col gap-4">
        <BasicPricingSummary
          name={profileName}
          onNameChange={setProfileName}
          isEditMode={isEditMode}
          profileId={id}
        />
        <SetProductPricing
          profileName={profileName}
          selectedProductIds={selectedProductIds}
          onSelectedChange={setSelectedProductIds}
          adjustmentType={adjustmentType}
          onAdjustmentTypeChange={setAdjustmentType}
          adjustmentDirection={adjustmentDirection}
          onAdjustmentDirectionChange={setAdjustmentDirection}
          adjustmentValue={adjustmentValue}
          onAdjustmentValueChange={setAdjustmentValue}
          scope={scope}
          onScopeChange={setScope}
          customPrices={customPrices}
          onCustomPricesChange={setCustomPrices}
        />
        <AssignCustomers
          customerNames={customerNames}
          onCustomerNamesChange={setCustomerNames}
        />
      </div>

      {/* Page footer */}
      <div className="mt-8 flex items-center justify-between">
        <p className="text-xs text-ink-400">Your entries are saved automatically</p>
        <div className="flex items-center gap-6">
          <button
            className="text-sm font-medium text-ink-700 hover:text-ink-900"
            onClick={() => navigate(-1)}
          >
            Back
          </button>
          <PillButton variant="primary" className="px-6" onClick={() => handleSave('published')} disabled={isSaving}>
            {isSaving ? 'Saving...' : `Save & ${isEditMode ? 'Update' : 'Publish'} Profile`}
          </PillButton>
        </div>
      </div>
    </div>
  );
}
