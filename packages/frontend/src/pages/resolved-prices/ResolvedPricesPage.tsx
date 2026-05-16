import { useState, Fragment } from 'react';
import { Loader2, ChevronDown, ChevronRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchResolvedPrices } from '@/api/pricingProfiles';
import { useCustomers } from '@/hooks/useCustomers';
import { PillButton } from '@/components/pricing/PillButton';
import { QUERY_KEYS } from '@/lib/queryKeys';
import type { ResolvedPrice, WaterfallEntry } from '@/types';

export function ResolvedPricesPage() {
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [resolvedCustomerId, setResolvedCustomerId] = useState('');
  const [expandedProductId, setExpandedProductId] = useState<string | null>(null);

  const { data: customers = [] } = useCustomers();

  const { data: prices = [], isLoading, isError, isFetched } = useQuery({
    queryKey: [QUERY_KEYS.RESOLVED_PRICES, resolvedCustomerId],
    queryFn: () => fetchResolvedPrices(resolvedCustomerId),
    enabled: !!resolvedCustomerId,
  });

  const handleResolve = () => {
    if (selectedCustomerId) {
      setResolvedCustomerId(selectedCustomerId);
      setExpandedProductId(null);
    }
  };

  const selectedCustomerName = customers.find((c) => c.id === resolvedCustomerId)?.name;

  return (
    <div className="rounded-card bg-surface-panel p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-lg font-semibold text-ink-900">Resolved Prices</h1>
        <p className="mt-1 text-[13px] text-ink-500">
          View the final computed price for every product for a specific customer
        </p>
      </div>

      {/* Customer selection */}
      <div className="mb-6 flex items-end gap-3">
        <div className="max-w-sm flex-1">
          <label className="mb-2 block text-[13px] font-medium text-ink-700">Customer</label>
          <select
            value={selectedCustomerId}
            onChange={(e) => setSelectedCustomerId(e.target.value)}
            className="w-full h-11 rounded-input border border-surface-border bg-white px-3.5 text-sm text-ink-900 focus:outline-none focus:ring-1 focus:ring-teal/30"
          >
            <option value="">Select a customer...</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <PillButton variant="primary" onClick={handleResolve} disabled={!selectedCustomerId}>
          Resolve Prices
        </PillButton>
      </div>

      {/* Results */}
      {!resolvedCustomerId && !isFetched && (
        <div className="rounded-card border border-surface-border-soft bg-white px-6 py-16 text-center text-sm text-ink-500">
          Select a customer to see their resolved prices.
        </div>
      )}

      {resolvedCustomerId && (
        <>
          <p className="mb-4 text-[13px] text-ink-500">
            Resolved prices for <span className="font-semibold text-ink-900">{selectedCustomerName}</span>
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
                    <th className="px-6 py-3 text-right text-[13px] font-medium text-ink-500">Final Price</th>
                    <th className="px-6 py-3 text-right text-[13px] font-medium text-ink-500">Difference</th>
                    <th className="px-6 py-3 text-right text-[13px] font-medium text-ink-500">Floor</th>
                    <th className="px-6 py-3 text-left text-[13px] font-medium text-ink-500">Applied Profile</th>
                    <th className="px-6 py-3 text-left text-[13px] font-medium text-ink-500">Tier</th>
                  </tr>
                </thead>
                <tbody>
                  {prices.map((price: ResolvedPrice) => {
                    const diff = price.finalPrice - price.basePrice;
                    const hasProfile = !!price.appliedProfile;
                    const isExpanded = expandedProductId === price.productId;

                    const verdictBadge = (verdict: WaterfallEntry['verdict']) => {
                      if (verdict === 'won') return 'rounded-pill bg-accent-green-soft px-2 py-0.5 text-[11px] font-medium text-accent-green';
                      if (verdict === 'rejected') return 'rounded-pill bg-red-50 px-2 py-0.5 text-[11px] font-medium text-red-600';
                      return 'rounded-pill bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-ink-500';
                    };

                    return (
                      <Fragment key={price.productId}>
                        <tr
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
                            ${price.finalPrice.toFixed(2)}
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
                          <td className="px-6 py-4 text-right text-sm">
                            {price.floorPrice != null ? (
                              <span className={price.floorApplied
                                ? 'rounded-pill bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700'
                                : 'text-ink-500'
                              }>
                                ${price.floorPrice.toFixed(2)}
                                {price.floorApplied && ' (applied)'}
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
                          <td className="px-6 py-4 text-sm">
                            {price.tier ? (
                              <span className="rounded-pill bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700">
                                Tier {price.tier}
                              </span>
                            ) : (
                              <span className="text-ink-400">&mdash;</span>
                            )}
                          </td>
                        </tr>
                        {/* Expanded detail row */}
                        {isExpanded && hasProfile && (
                          <tr className="border-b border-surface-border-soft bg-gray-50">
                            <td colSpan={8} className="px-10 py-4">
                              {/* Tier info */}
                              {price.tierLabel && (
                                <p className="mb-2 text-[13px]">
                                  <span className="rounded-pill bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700">
                                    Tier {price.tier} — {price.tierLabel}
                                  </span>
                                </p>
                              )}

                              {/* Floor Protection Info */}
                              {price.costPrice != null && (
                                <div className="mb-2 flex items-center gap-4 text-[13px]">
                                  <span className="text-ink-500">Cost: <span className="font-medium text-ink-700">${price.costPrice.toFixed(2)}</span></span>
                                  {price.minMarginPercent != null && (
                                    <span className="text-ink-500">Min Margin: <span className="font-medium text-ink-700">{price.minMarginPercent}%</span></span>
                                  )}
                                  {price.floorPrice != null && (
                                    <span className="text-ink-500">Floor: <span className="font-medium text-ink-700">${price.floorPrice.toFixed(2)}</span></span>
                                  )}
                                  {price.floorApplied && (
                                    <span className="rounded-pill bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                                      Floor Triggered
                                    </span>
                                  )}
                                </div>
                              )}

                              {/* Reason */}
                              <p className="text-[13px] text-ink-700">
                                <span className="font-medium">Reason:</span> {price.reason}
                              </p>

                              {/* Waterfall Table */}
                              {price.waterfall.length > 0 && (
                                <div className="mt-3">
                                  <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-ink-500">Price Waterfall</p>
                                  <div className="overflow-x-auto rounded-lg border border-surface-border-soft">
                                    <table className="w-full text-[13px]">
                                      <thead>
                                        <tr className="border-b border-surface-border bg-gray-100/60">
                                          <th className="px-3 py-2 text-left font-medium text-ink-500">#</th>
                                          <th className="px-3 py-2 text-left font-medium text-ink-500">Profile</th>
                                          <th className="px-3 py-2 text-left font-medium text-ink-500">Customer</th>
                                          <th className="px-3 py-2 text-center font-medium text-ink-500">Tier</th>
                                          <th className="px-3 py-2 text-right font-medium text-ink-500">Price</th>
                                          <th className="px-3 py-2 text-right font-medium text-ink-500">Floor Price</th>
                                          <th className="px-3 py-2 text-center font-medium text-ink-500">Verdict</th>
                                          <th className="px-3 py-2 text-left font-medium text-ink-500">Reason</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {price.waterfall.map((w: WaterfallEntry) => (
                                          <tr key={w.profileId} className="border-b border-surface-border-soft last:border-b-0">
                                            <td className="px-3 py-2 text-ink-500">{w.position}</td>
                                            <td className="px-3 py-2 font-medium text-ink-900">{w.profileName}</td>
                                            <td className="px-3 py-2 text-ink-700">{w.customerName}</td>
                                            <td className="px-3 py-2 text-center">
                                              {w.tier != null ? (
                                                <span className="rounded-pill bg-indigo-50 px-1.5 py-0.5 text-[11px] font-medium text-indigo-700">
                                                  T{w.tier}
                                                </span>
                                              ) : (
                                                <span className="text-ink-400">&mdash;</span>
                                              )}
                                            </td>
                                            <td className="px-3 py-2 text-right font-semibold text-ink-900">${w.computedPrice.toFixed(2)}</td>
                                            <td className="px-3 py-2 text-right">
                                              {w.priceAfterFloor != null ? (
                                                <span className="font-medium text-amber-700">${w.priceAfterFloor.toFixed(2)}</span>
                                              ) : (
                                                <span className="text-ink-400">&mdash;</span>
                                              )}
                                            </td>
                                            <td className="px-3 py-2 text-center">
                                              <span className={verdictBadge(w.verdict)}>{w.verdict}</span>
                                            </td>
                                            <td className="px-3 py-2 text-ink-600">{w.reason}</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              )}

                              {/* Margin Insight Banner */}
                              {price.marginInsight.triggered && (
                                <div className="mt-3 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
                                  <span className="mt-0.5 text-amber-600 text-sm">&#9888;</span>
                                  <div className="text-[13px] text-amber-800">
                                    <span className="font-medium">Margin Insight:</span>{' '}
                                    {price.marginInsight.message}
                                  </div>
                                </div>
                              )}
                            </td>
                          </tr>
                        )}
                      </Fragment>
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
