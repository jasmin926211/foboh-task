import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { PillButton } from '@/components/pricing/PillButton';
import { BasicPricingSummary } from '@/components/pricing/BasicPricingSummary';
import { SetProductPricing } from '@/components/pricing/SetProductPricing';
import { AssignCustomers } from '@/components/pricing/AssignCustomers';
import { useProfile, useCreateProfile, useUpdateProfile } from '@/hooks/usePricingProfiles';

export function SetupPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  // Form state
  const [profileName, setProfileName] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [adjustmentType, setAdjustmentType] = useState<'fixed' | 'dynamic'>('fixed');
  const [adjustmentDirection, setAdjustmentDirection] = useState<'increase' | 'decrease'>('decrease');
  const [adjustmentValue, setAdjustmentValue] = useState(0);
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(new Set());

  // Load existing profile for edit mode
  const { data: existingProfile, isLoading: isLoadingProfile } = useProfile(id);

  useEffect(() => {
    if (existingProfile) {
      setProfileName(existingProfile.name);
      setCustomerName(existingProfile.customerName);
      setAdjustmentType(existingProfile.adjustmentType);
      setAdjustmentDirection(existingProfile.adjustmentDirection);
      setAdjustmentValue(existingProfile.adjustmentValue);
      setSelectedProductIds(
        new Set(existingProfile.profileProducts?.map((pp: { productId: string }) => pp.productId) ?? [])
      );
    }
  }, [existingProfile]);

  // Mutations
  const createMutation = useCreateProfile();
  const updateMutation = useUpdateProfile();
  const isSaving = createMutation.isPending || updateMutation.isPending;

  const handleSave = useCallback(async () => {
    // Validation
    if (!profileName.trim()) {
      toast.error('Please enter a profile name');
      return;
    }
    if (!customerName.trim()) {
      toast.error('Please assign a customer');
      return;
    }
    if (selectedProductIds.size === 0) {
      toast.error('Please select at least one product');
      return;
    }
    if (adjustmentValue <= 0) {
      toast.error('Please enter a positive adjustment value');
      return;
    }

    const payload = {
      name: profileName.trim(),
      customerName: customerName.trim(),
      adjustmentType,
      adjustmentDirection,
      adjustmentValue,
      productIds: Array.from(selectedProductIds),
    };

    try {
      if (isEditMode && id) {
        await updateMutation.mutateAsync({ id, payload });
        toast.success('Profile updated successfully');
      } else {
        await createMutation.mutateAsync(payload);
        toast.success('Profile created successfully');
      }
      navigate('/profiles');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      toast.error(message);
    }
  }, [
    profileName,
    customerName,
    selectedProductIds,
    adjustmentType,
    adjustmentDirection,
    adjustmentValue,
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
          {/* Breadcrumb */}
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
            onClick={() => navigate('/profiles')}
          >
            Cancel
          </button>
          <PillButton variant="secondary" onClick={handleSave} disabled={isSaving}>
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
        />
        <AssignCustomers
          customerName={customerName}
          onCustomerNameChange={setCustomerName}
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
          <PillButton variant="primary" className="px-6" onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : `Save & ${isEditMode ? 'Update' : 'Publish'} Profile`}
          </PillButton>
        </div>
      </div>
    </div>
  );
}
