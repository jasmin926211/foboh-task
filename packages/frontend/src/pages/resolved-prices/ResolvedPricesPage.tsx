import { useState } from 'react';
import { Search, Loader2, ChevronDown, ChevronRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchResolvedPrices } from '@/api/pricingProfiles';
import { TextInput } from '@/components/pricing/TextInput';
import { PillButton } from '@/components/pricing/PillButton';
import type { ResolvedPrice } from '@/types';

export function ResolvedPricesPage() {
  const [customerInput, setCustomerInput] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [expandedProductId, setExpandedProductId] = useState<string | null>(null);

  const { data: prices = [], isLoading, isError, isFetched } = useQuery({
    queryKey: ['resolved-prices', customerName],
    queryFn: () => fetchResolvedPrices(customerName),
    enabled: !!customerName
  });

  const handleSearch = () => {
    if (customerInput.trim()) {
      setCustomerName(customerInput.trim());
      setExpandedProductId(null);
    }
  };

  return (
    <div className="rounded-card bg-surface-panel p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-lg font-semibold text-ink-900">Resolved Prices</h1>
        <p className="mt-1 text-[13px] text-ink-500">
          View the final computed price for every product for a specific customer
        </p>
      </div>

      {/* Customer search */}
      <div className="mb-6 flex items-end gap-3">
        <div className="max-w-sm flex-1">
          <label className="mb-2 block text-[13px] font-medium text-ink-700">Customer Name</label>
          <TextInput
            placeholder="Enter customer name..."
            value={customerInput}
            onChange={setCustomerInput}
            iconLeft={<Search className="h-4 w-4" />}
          />
        </div>
        <PillButton variant="primary" onClick={handleSearch} disabled={!customerInput.trim()}>
          Resolve Prices
        </PillButton>
      </div>

      {/* Results */}
      {!customerName && !isFetched && (
        <div className="rounded-card border border-surface-border-soft bg-white px-6 py-16 text-center text-sm text-ink-500">
          Enter a customer name to see their resolved prices.
        </div>
      )}

      {customerName && (
        <>
          <p className="mb-4 text-[13px] text-ink-500">
            Resolved prices for <span className="font-semibold text-ink-900">{customerName}</span>
            {' — '}
            <span className="font-semibold text-ink-900">{prices.length}</span> products
          </p>

          <div className="rounded-card border border-surface-border-soft bg-white">
            {isLoading ? (
              <div className="flex items-center justify-center gap-2 py-16 text-sm text-ink-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                Resolving prices...
              </div>
            ) : isError ? (
              <div className="py-16 text-center text-sm text-red-500">
                Failed to resolve prices. Make sure the backend is running.
              </div>
            ) : prices.length === 0 ? (
              <div className="py-16 text-center text-sm text-ink-500">
                No products found.
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-surface-border">
                    <th className="w-8 px-3 py-3" />
                    <th className="px-6 py-3 text-left text-[13px] font-medium text-ink-500">Product</th>
                    <th className="px-6 py-3 text-right text-[13px] font-medium text-ink-500">Base Price</th>
                    <th className="px-6 py-3 text-right text-[13px] font-medium text-ink-500">New Price</th>
                    <th className="px-6 py-3 text-right text-[13px] font-medium text-ink-500">Difference</th>
                    <th className="px-6 py-3 text-left text-[13px] font-medium text-ink-500">Applied Profile</th>
                  </tr>
                </thead>
                <tbody>
                  {prices.map((price: ResolvedPrice) => {
                    const diff = price.newPrice - price.basePrice;
                    const hasProfile = !!price.appliedProfile;
                    const isExpanded = expandedProductId === price.productId;

                    return (
                      <>
                        <tr
                          key={price.productId}
                          className={`border-b border-surface-border-soft last:border-b-0 hover:bg-surface-panel/50 ${hasProfile ? 'cursor-pointer' : ''}`}
                          onClick={() => hasProfile && setExpandedProductId(isExpanded ? null : price.productId)}
                        >
                          <td className="px-3 py-4 text-center">
                            {hasProfile && (
                              isExpanded
                                ? <ChevronDown className="mx-auto h-4 w-4 text-ink-400" />
                                : <ChevronRight className="mx-auto h-4 w-4 text-ink-400" />
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-ink-900">
                            {price.productTitle}
                          </td>
                          <td className="px-6 py-4 text-right text-sm text-ink-700">
                            ${price.basePrice.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 text-right text-sm font-semibold text-ink-900">
                            ${price.newPrice.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 text-right text-sm">
                            {hasProfile ? (
                              <span className={diff >= 0 ? 'text-accent-green' : 'text-red-500'}>
                                {diff >= 0 ? '+' : ''}{diff.toFixed(2)}
                              </span>
                            ) : (
                              <span className="text-ink-400">&mdash;</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            {hasProfile ? (
                              <span className="rounded-pill bg-accent-green-soft px-2.5 py-1 text-xs font-medium text-accent-green">
                                {price.appliedProfile!.name}
                              </span>
                            ) : (
                              <span className="text-ink-400">No profile applied</span>
                            )}
                          </td>
                        </tr>
                        {/* Expanded detail row */}
                        {isExpanded && hasProfile && (
                          <tr key={`${price.productId}-detail`} className="border-b border-surface-border-soft bg-gray-50">
                            <td colSpan={6} className="px-10 py-4">
                              {/* Reason */}
                              <p className="text-[13px] text-ink-700">
                                <span className="font-medium">Reason:</span> {price.reason}
                              </p>

                              {/* Candidate Profiles */}
                              {price.candidateProfiles.length > 0 && (
                                <div className="mt-3">
                                  <p className="text-xs font-medium uppercase tracking-wide text-ink-500">Candidate Profiles</p>
                                  <div className="mt-1.5 space-y-1">
                                    {price.candidateProfiles.map((cp) => (
                                      <div key={cp.id} className="flex items-center gap-4 text-[13px] text-ink-700">
                                        <span className="font-medium">{cp.name}</span>
                                        <span className="text-ink-500">
                                          {cp.adjustment.direction === 'increase' ? '+' : '-'}
                                          {cp.adjustment.type === 'dynamic' ? `${cp.adjustment.value}%` : `$${cp.adjustment.value.toFixed(2)}`}
                                        </span>
                                        <span className="font-semibold">${cp.computedPrice.toFixed(2)}</span>
                                        <span className="text-ink-400">
                                          scope: {cp.scope} | updated: {new Date(cp.updatedAt).toLocaleDateString()}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Rejected Profiles */}
                              {price.rejectedProfiles.length > 0 && (
                                <div className="mt-3">
                                  <p className="text-xs font-medium uppercase tracking-wide text-ink-500">Rejected Profiles</p>
                                  <div className="mt-1.5 space-y-1">
                                    {price.rejectedProfiles.map((rp) => (
                                      <div key={rp.id} className="flex items-center gap-4 text-[13px] text-ink-700">
                                        <span className="font-medium">{rp.name}</span>
                                        <span className="text-red-500">{rp.rejectionReason}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}
