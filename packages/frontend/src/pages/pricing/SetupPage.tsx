import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { PillButton } from '@/components/pricing/PillButton';
import { BasicPricingSummary } from '@/components/pricing/BasicPricingSummary';
import { SetProductPricing } from '@/components/pricing/SetProductPricing';
import { AssignCustomers } from '@/components/pricing/AssignCustomers';
import type { TargetType } from '@/components/pricing/AssignCustomers';
import { useProfile, useCreateProfile, useUpdateProfile } from '@/hooks/usePricingProfiles';
import { ROUTES } from '@/lib/routes';
import type { CreateProfilePayload, UpdateProfilePayload } from '@/types';
import axios from 'axios';

export function SetupPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [profileName, setProfileName] = useState('');
  const [targetType, setTargetType] = useState<TargetType>('all');
  const [customerId, setCustomerId] = useState<string | undefined>();
  const [customerGroupId, setCustomerGroupId] = useState<string | undefined>();
  const [adjustmentType, setAdjustmentType] = useState<'fixed' | 'dynamic' | 'custom'>('fixed');
  const [adjustmentDirection, setAdjustmentDirection] = useState<'increase' | 'decrease'>('decrease');
  const [adjustmentValue, setAdjustmentValue] = useState(0);
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(new Set());
  const [scope, setScope] = useState<'all' | 'selected'>('selected');
  const [customPrices, setCustomPrices] = useState<Record<string, number>>({});

  const { data: existingProfile, isLoading: isLoadingProfile } = useProfile(id);

  useEffect(() => {
    if (existingProfile) {
      setProfileName(existingProfile.name);
      if (existingProfile.customerId) {
        setTargetType('customer');
        setCustomerId(existingProfile.customerId);
        setCustomerGroupId(undefined);
      } else if (existingProfile.customerGroupId) {
        setTargetType('group');
        setCustomerGroupId(existingProfile.customerGroupId);
        setCustomerId(undefined);
      } else {
        setTargetType('all');
        setCustomerId(undefined);
        setCustomerGroupId(undefined);
      }
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

  const createMutation = useCreateProfile();
  const updateMutation = useUpdateProfile();
  const isSaving = createMutation.isPending || updateMutation.isPending;

  const handleSave = useCallback(async (status: 'draft' | 'published') => {
    const isCustom = adjustmentType === 'custom';

    if (!profileName.trim()) {
      toast.error('Please enter a profile name');
      return;
    }
    if (targetType === 'customer' && !customerId) {
      toast.error('Please select a customer');
      return;
    }
    if (targetType === 'group' && !customerGroupId) {
      toast.error('Please select a customer group');
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
      const base = {
        name: profileName.trim(),
        adjustmentType,
        status,
        scope: effectiveScope,
        ...(effectiveScope === 'selected' && { productIds: Array.from(selectedProductIds) }),
        ...(targetType === 'customer' && { customerId }),
        ...(targetType === 'group' && { customerGroupId }),
        ...(isCustom
          ? { customPrices }
          : { adjustmentDirection, adjustmentValue }),
      };

      if (isEditMode && id) {
        await updateMutation.mutateAsync({ id, payload: base as UpdateProfilePayload });
        toast.success('Profile updated successfully');
      } else {
        await createMutation.mutateAsync(base as CreateProfilePayload);
        toast.success(
          status === 'draft'
            ? 'Profile saved as draft'
            : 'Profile published successfully'
        );
      }
      navigate(ROUTES.PRICING_PROFILES);
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
    targetType,
    customerId,
    customerGroupId,
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
            onClick={() => navigate(ROUTES.PRICING_PROFILES)}
          >
            Cancel
          </button>
          <PillButton variant="secondary" onClick={() => handleSave('draft')} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save as Draft'}
          </PillButton>
        </div>
      </div>


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
          targetType={targetType}
          onTargetTypeChange={setTargetType}
          customerId={customerId}
          onCustomerIdChange={setCustomerId}
          customerGroupId={customerGroupId}
          onCustomerGroupIdChange={setCustomerGroupId}
        />
      </div>


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
