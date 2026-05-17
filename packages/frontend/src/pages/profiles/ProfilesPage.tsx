import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { useProfiles, useDeleteProfile, useUpdateProfile } from '@/hooks/usePricingProfiles';
import { PillButton } from '@/components/pricing/PillButton';
import { TextInput } from '@/components/pricing/TextInput';
import { SelectInput } from '@/components/pricing/SelectInput';
import { useDebounce } from '@/hooks/useDebounce';
import { ROUTES } from '@/lib/routes';
import type { PricingProfile } from '@/types';
import axios from 'axios';

const PAGE_SIZE = 10;

export function ProfilesPage() {
  const navigate = useNavigate();
  const [searchFilter, setSearchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'draft' | 'published' | ''>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const debouncedSearchFilter = useDebounce(searchFilter, 300);

  const { data: result, isLoading, isError } = useProfiles(
    debouncedSearchFilter || undefined,
    statusFilter || undefined,
    currentPage,
    PAGE_SIZE,
  );

  const deleteMutation = useDeleteProfile();
  const updateMutation = useUpdateProfile();

  const profiles = result?.data ?? [];
  const total = result?.total ?? 0;
  const totalPages = result?.totalPages ?? 1;

  const handleDelete = async (profile: PricingProfile) => {
    if (!window.confirm(`Delete "${profile.name}"? This cannot be undone.`)) return;

    setDeletingId(profile.id);
    try {
      await deleteMutation.mutateAsync(profile.id);
      toast.success(`"${profile.name}" deleted`);
    } catch {
      toast.error('Failed to delete profile');
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleStatus = async (profile: PricingProfile) => {
    const newStatus = profile.status === 'published' ? 'draft' : 'published';
    setTogglingId(profile.id);
    try {
      await updateMutation.mutateAsync({ id: profile.id, payload: { status: newStatus } });
      toast.success(`"${profile.name}" ${newStatus === 'published' ? 'published' : 'unpublished'}`);
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.status === 422) {
        const errorData = err.response.data?.error;
        const products = errorData?.products;
        if (products && Array.isArray(products)) {
          const names = products.map((p: { productTitle: string }) => p.productTitle).join(', ');
          toast.error(`Cannot publish: negative prices for ${names}`);
        } else {
          toast.error(errorData?.description || 'Cannot publish profile');
        }
      } else {
        toast.error('Failed to update profile status');
      }
    } finally {
      setTogglingId(null);
    }
  };

  const formatAdjustment = (profile: PricingProfile) => {
    if (profile.adjustmentType === 'custom') return 'Custom';
    const sign = profile.adjustmentDirection === 'increase' ? '+' : '-';
    const value = profile.adjustmentValue ?? 0;
    if (profile.adjustmentType === 'dynamic') {
      return `${sign}${value}%`;
    }
    return `${sign}$${value.toFixed(2)}`;
  };

  const getTargetLabel = (profile: PricingProfile) => {
    if (profile.customer) return profile.customer.name;
    if (profile.customerGroup) return profile.customerGroup.name;
    return 'All Customers';
  };

  const getTargetBadgeClass = (profile: PricingProfile) => {
    if (profile.customer) return 'bg-blue-50 text-blue-700';
    if (profile.customerGroup) return 'bg-purple-50 text-purple-700';
    return 'bg-gray-100 text-ink-600';
  };

  const rangeStart = Math.min((currentPage - 1) * PAGE_SIZE + 1, total);
  const rangeEnd = Math.min(currentPage * PAGE_SIZE, total);

  return (
    <div className="rounded-card bg-surface-panel p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-ink-900">Pricing Profiles</h1>
          <p className="mt-1 text-[13px] text-ink-500">
            Manage customer-specific pricing profiles
          </p>
        </div>
        <PillButton
          variant="primary"
          icon={<Plus className="h-4 w-4" />}
          onClick={() => navigate(ROUTES.PRICING_SETUP)}
        >
          Create Profile
        </PillButton>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-end gap-3 sm:gap-4">
        <div className="flex-1 sm:max-w-sm">
          <TextInput
            placeholder="Search by name, customer, or group..."
            value={searchFilter}
            onChange={(val) => { setSearchFilter(val); setCurrentPage(1); }}
          />
        </div>
        <SelectInput
          placeholder="All Statuses"
          value={statusFilter}
          options={[
            { label: 'Draft', value: 'draft' },
            { label: 'Published', value: 'published' },
          ]}
          onChange={(val) => { setStatusFilter(val as '' | 'draft' | 'published'); setCurrentPage(1); }}
          className="w-full sm:w-44"
          allowEmpty
        />
      </div>

      {/* Results count */}
      <p className="mb-4 text-[13px] text-ink-500">
        {total > 0 ? (
          <>
            Showing{' '}
            <span className="font-semibold text-ink-900">{rangeStart}–{rangeEnd}</span>
            {' '}of <span className="font-semibold text-ink-900">{total}</span> profiles
          </>
        ) : (
          <>Showing <span className="font-semibold text-ink-900">0</span> profiles</>
        )}
      </p>

      {/* Table */}
      <div className="rounded-card border border-surface-border-soft bg-white">
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-ink-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading profiles...
          </div>
        ) : isError ? (
          <div className="py-16 text-center text-sm text-red-500">
            Failed to load profiles. Make sure the backend is running.
          </div>
        ) : profiles.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm text-ink-500">No pricing profiles found.</p>
            <PillButton
              variant="primary"
              className="mt-4"
              icon={<Plus className="h-4 w-4" />}
              onClick={() => navigate(ROUTES.PRICING_SETUP)}
            >
              Create Your First Profile
            </PillButton>
          </div>
        ) : (
          <>
            {/* ====== Desktop table (lg+) ====== */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="border-b border-surface-border">
                    <th className="px-4 py-3 text-left text-[13px] font-medium text-ink-500">Profile Name</th>
                    <th className="px-4 py-3 text-left text-[13px] font-medium text-ink-500">Status</th>
                    <th className="px-4 py-3 text-left text-[13px] font-medium text-ink-500">Target</th>
                    <th className="px-4 py-3 text-left text-[13px] font-medium text-ink-500">Adjustment</th>
                    <th className="px-4 py-3 text-center text-[13px] font-medium text-ink-500">Products</th>
                    <th className="px-4 py-3 text-left text-[13px] font-medium text-ink-500">Updated</th>
                    <th className="px-4 py-3 text-right text-[13px] font-medium text-ink-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {profiles.map((profile: PricingProfile) => (
                    <tr key={profile.id} className="border-b border-surface-border-soft last:border-b-0 hover:bg-surface-panel/50">
                      <td className="px-4 py-4 text-sm font-medium text-ink-900">{profile.name}</td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex rounded-pill px-2.5 py-1 text-xs font-medium ${
                          profile.status === 'published'
                            ? 'bg-green-50 text-green-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}>
                          {profile.status === 'published' ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex rounded-pill px-2.5 py-1 text-xs font-medium whitespace-nowrap ${getTargetBadgeClass(profile)}`}>
                          {getTargetLabel(profile)}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="inline-flex items-center gap-1.5">
                          <span className={`rounded-pill px-2.5 py-1 text-xs font-medium ${
                            profile.adjustmentType === 'fixed'
                              ? 'bg-blue-50 text-blue-700'
                              : profile.adjustmentType === 'dynamic'
                              ? 'bg-purple-50 text-purple-700'
                              : 'bg-teal-50 text-teal-700'
                          }`}>
                            {profile.adjustmentType === 'fixed' ? 'Fixed' : profile.adjustmentType === 'dynamic' ? 'Dynamic' : 'Custom'}
                          </span>
                          {profile.adjustmentType !== 'custom' && (
                            <span className={`text-sm font-semibold whitespace-nowrap ${
                              profile.adjustmentDirection === 'increase' ? 'text-accent-green' : 'text-red-500'
                            }`}>
                              {formatAdjustment(profile)}
                            </span>
                          )}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center text-sm text-ink-700">
                        {profile.scope === 'all' ? (
                          <span className="text-xs font-medium text-teal-600">All</span>
                        ) : (
                          profile.profileProducts?.length ?? 0
                        )}
                      </td>
                      <td className="px-4 py-4 text-sm text-ink-500 whitespace-nowrap">
                        {new Date(profile.updatedAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleToggleStatus(profile)}
                            disabled={togglingId === profile.id}
                            className={`rounded-lg px-2.5 py-1 text-xs font-medium whitespace-nowrap ${
                              profile.status === 'published'
                                ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                                : 'bg-green-50 text-green-700 hover:bg-green-100'
                            } disabled:opacity-50`}
                            title={profile.status === 'published' ? 'Unpublish' : 'Publish'}
                          >
                            {togglingId === profile.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              profile.status === 'published' ? 'Unpublish' : 'Publish'
                            )}
                          </button>
                          <button
                            onClick={() => navigate(ROUTES.PRICING_SETUP_EDIT(profile.id))}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-500 hover:bg-surface-panel hover:text-ink-900"
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(profile)}
                            disabled={deletingId === profile.id}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                            title="Delete"
                          >
                            {deletingId === profile.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ====== Mobile / Tablet cards (<lg) ====== */}
            <div className="lg:hidden divide-y divide-surface-border-soft">
              {profiles.map((profile: PricingProfile) => (
                <div key={profile.id} className="p-4 space-y-3">
                  {/* Row 1: Name + Status */}
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-medium text-ink-900 leading-snug">
                      {profile.name}
                    </h3>
                    <span className={`shrink-0 inline-flex rounded-pill px-2.5 py-0.5 text-xs font-medium ${
                      profile.status === 'published'
                        ? 'bg-green-50 text-green-700'
                        : 'bg-amber-50 text-amber-700'
                    }`}>
                      {profile.status === 'published' ? 'Published' : 'Draft'}
                    </span>
                  </div>

                  {/* Row 2: Badges — Target, Adjustment, Products */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`inline-flex rounded-pill px-2.5 py-0.5 text-xs font-medium ${getTargetBadgeClass(profile)}`}>
                      {getTargetLabel(profile)}
                    </span>
                    <span className={`rounded-pill px-2.5 py-0.5 text-xs font-medium ${
                      profile.adjustmentType === 'fixed'
                        ? 'bg-blue-50 text-blue-700'
                        : profile.adjustmentType === 'dynamic'
                        ? 'bg-purple-50 text-purple-700'
                        : 'bg-teal-50 text-teal-700'
                    }`}>
                      {profile.adjustmentType === 'fixed' ? 'Fixed' : profile.adjustmentType === 'dynamic' ? 'Dynamic' : 'Custom'}
                    </span>
                    {profile.adjustmentType !== 'custom' && (
                      <span className={`text-sm font-semibold ${
                        profile.adjustmentDirection === 'increase' ? 'text-accent-green' : 'text-red-500'
                      }`}>
                        {formatAdjustment(profile)}
                      </span>
                    )}
                    <span className="text-xs text-ink-500">
                      {profile.scope === 'all' ? 'All products' : `${profile.profileProducts?.length ?? 0} products`}
                    </span>
                  </div>

                  {/* Row 3: Updated + Actions */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-ink-400">
                      Updated {new Date(profile.updatedAt).toLocaleDateString()}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleStatus(profile)}
                        disabled={togglingId === profile.id}
                        className={`rounded-lg px-2.5 py-1 text-xs font-medium ${
                          profile.status === 'published'
                            ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                            : 'bg-green-50 text-green-700 hover:bg-green-100'
                        } disabled:opacity-50`}
                      >
                        {togglingId === profile.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          profile.status === 'published' ? 'Unpublish' : 'Publish'
                        )}
                      </button>
                      <button
                        onClick={() => navigate(ROUTES.PRICING_SETUP_EDIT(profile.id))}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-500 hover:bg-surface-panel hover:text-ink-900"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(profile)}
                        disabled={deletingId === profile.id}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                      >
                        {deletingId === profile.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[13px] text-ink-500">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap justify-center">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-surface-border text-ink-500 hover:bg-surface-panel disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium ${
                  page === currentPage
                    ? 'bg-ink-900 text-white'
                    : 'border border-surface-border text-ink-700 hover:bg-surface-panel'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-surface-border text-ink-500 hover:bg-surface-panel disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
