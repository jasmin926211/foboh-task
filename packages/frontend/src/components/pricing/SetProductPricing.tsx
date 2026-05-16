import { useState, useMemo, useCallback } from 'react';
import { Search, ChevronDown, Lightbulb, Loader2, Pencil, Package, AlertTriangle, Info } from 'lucide-react';
import { SectionCard } from './SectionCard';
import { RadioGroup } from './RadioGroup';
import { TextInput } from './TextInput';
import { SelectInput } from './SelectInput';
import { ProductRow } from './ProductRow';
import { NewPriceTable } from './NewPriceTable';
import { PillButton } from './PillButton';
import { useProducts } from '@/hooks/useProducts';
import { usePreviewPrices } from '@/hooks/usePricingProfiles';
import { useDebounce } from '@/hooks/useDebounce';
import { stringToColor } from '@/lib/utils';
import type { Product, PreviewPrice } from '@/types';

interface SetProductPricingProps {
  profileName: string;
  selectedProductIds: Set<string>;
  onSelectedChange: (ids: Set<string>) => void;
  adjustmentType: 'fixed' | 'dynamic' | 'custom';
  onAdjustmentTypeChange: (value: 'fixed' | 'dynamic' | 'custom') => void;
  adjustmentDirection: 'increase' | 'decrease';
  onAdjustmentDirectionChange: (value: 'increase' | 'decrease') => void;
  adjustmentValue: number;
  onAdjustmentValueChange: (value: number) => void;
  scope: 'all' | 'selected';
  onScopeChange: (value: 'all' | 'selected') => void;
  customPrices: Record<string, number>;
  onCustomPricesChange: (prices: Record<string, number>) => void;
}

export function SetProductPricing({
  profileName,
  selectedProductIds,
  onSelectedChange,
  adjustmentType,
  onAdjustmentTypeChange,
  adjustmentDirection,
  onAdjustmentDirectionChange,
  adjustmentValue,
  onAdjustmentValueChange,
  scope,
  onScopeChange,
  customPrices,
  onCustomPricesChange,
}: SetProductPricingProps) {
  const [selectAll, setSelectAll] = useState('deselect');
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Search & filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [skuSearch, setSkuSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [segmentFilter, setSegmentFilter] = useState('');
  const [brandFilter, setBrandFilter] = useState('');

  // Debounce text inputs to avoid excessive API calls
  const debouncedSearch = useDebounce(searchTerm, 300);
  const debouncedSku = useDebounce(skuSearch, 300);

  const isCustom = adjustmentType === 'custom';

  // Build query params — combine search + SKU into one search param
  const queryParams = useMemo(() => {
    const params: Record<string, string> = {};
    const search = debouncedSearch || debouncedSku;
    if (search) params.search = search;
    if (categoryFilter) params.subCategory = categoryFilter;
    if (segmentFilter) params.segment = segmentFilter;
    if (brandFilter) params.brand = brandFilter;
    return Object.keys(params).length > 0 ? params : undefined;
  }, [debouncedSearch, debouncedSku, categoryFilter, segmentFilter, brandFilter]);

  const { data: products = [], isLoading, isError } = useProducts(queryParams);

  // All products (unfiltered) for getting selected product names
  const { data: allProducts = [] } = useProducts();

  // Extract unique values for filter dropdowns
  const { categories, segments, brands } = useMemo(() => {
    return {
      categories: [...new Set(products.map((p: Product) => p.subCategory))].sort(),
      segments: [...new Set(products.map((p: Product) => p.segment))].sort(),
      brands: [...new Set(products.map((p: Product) => p.brand))].sort(),
    };
  }, [products]);

  const selectedCount = scope === 'all' ? allProducts.length : selectedProductIds.size;

  // Get selected product names for summary
  const selectedProducts = useMemo(() => {
    if (scope === 'all') return allProducts.slice(0, 4);
    return allProducts.filter((p: Product) => selectedProductIds.has(p.id));
  }, [allProducts, selectedProductIds, scope]);

  const selectedProductNames = useMemo(() => {
    return selectedProducts.map((p: Product) => p.title);
  }, [selectedProducts]);

  const toggleProduct = useCallback(
    (id: string, checked: boolean) => {
      const next = new Set(selectedProductIds);
      if (checked) {
        next.add(id);
      } else {
        next.delete(id);
        // Remove custom price when product is deselected
        if (isCustom && id in customPrices) {
          const nextPrices = { ...customPrices };
          delete nextPrices[id];
          onCustomPricesChange(nextPrices);
        }
      }
      onSelectedChange(next);
    },
    [selectedProductIds, onSelectedChange, isCustom, customPrices, onCustomPricesChange]
  );

  const handleSelectAll = useCallback(
    (val: string) => {
      setSelectAll(val);
      if (val === 'select') {
        onSelectedChange(new Set(products.map((p: Product) => p.id)));
      } else {
        onSelectedChange(new Set());
        if (isCustom) onCustomPricesChange({});
      }
    },
    [products, onSelectedChange, isCustom, onCustomPricesChange]
  );

  // Active filter pills
  const activeFilters = useMemo(() => {
    const pills: string[] = [];
    if (categoryFilter) pills.push(categoryFilter);
    if (segmentFilter) pills.push(segmentFilter);
    if (brandFilter) pills.push(brandFilter);
    return pills;
  }, [categoryFilter, segmentFilter, brandFilter]);

  // Build preview payload for backend price calculation (disabled for custom)
  const previewPayload = useMemo(() => {
    if (isCustom) return null;
    if (adjustmentValue <= 0) return null;
    if (scope === 'all') {
      return { adjustmentType, adjustmentDirection, adjustmentValue, scope: 'all' as const };
    }
    if (selectedProductIds.size === 0) return null;
    return {
      productIds: Array.from(selectedProductIds),
      adjustmentType,
      adjustmentDirection,
      adjustmentValue,
      scope: 'selected' as const,
    };
  }, [selectedProductIds, adjustmentType, adjustmentDirection, adjustmentValue, scope, isCustom]);

  // Fetch computed prices from backend (not used for custom)
  const { data: previewData, isFetching: isPreviewLoading } = usePreviewPrices(previewPayload);

  // Build local preview rows for custom pricing
  const customPreviewRows: PreviewPrice[] = useMemo(() => {
    if (!isCustom) return [];
    return selectedProducts.map((product: Product) => ({
      productId: product.id,
      productTitle: product.title,
      sku: product.sku,
      category: product.subCategory,
      basePrice: product.basePrice,
      adjustment: (customPrices[product.id] ?? product.basePrice) - product.basePrice,
      newPrice: customPrices[product.id] ?? product.basePrice,
    }));
  }, [isCustom, selectedProducts, customPrices]);

  const priceRows = isCustom ? customPreviewRows : (previewData?.results ?? []);
  const warnings = isCustom ? [] : (previewData?.warnings ?? []);

  // Handle custom price change
  const handleCustomPriceChange = useCallback(
    (productId: string, price: number) => {
      onCustomPricesChange({ ...customPrices, [productId]: price });
    },
    [customPrices, onCustomPricesChange]
  );

  // Check if section is "complete" (has products + adjustment)
  const isComplete = isCustom
    ? selectedCount > 0 && Array.from(selectedProductIds).every((id) => id in customPrices)
    : (scope === 'all' || selectedCount > 0) && adjustmentValue > 0;

  // Format adjustment description for summary
  const adjustmentDescription = useMemo(() => {
    if (isCustom) return 'Custom (per-product pricing)';
    const mode = adjustmentType === 'fixed' ? 'Fixed' : 'Dynamic';
    const dir = adjustmentDirection === 'increase' ? 'Increase' : 'Decrease';
    const val = adjustmentType === 'dynamic' ? `${adjustmentValue}%` : `$${adjustmentValue.toFixed(2)}`;
    return `${mode} ${dir} of ${val}`;
  }, [adjustmentType, adjustmentDirection, adjustmentValue, isCustom]);

  // Handle scope radio change
  const handleScopeChange = (val: string) => {
    if (val === 'all') {
      onScopeChange('all');
    } else {
      onScopeChange('selected');
    }
  };

  // Map scope to radio value
  const profileScopeRadio = scope === 'all' ? 'all' : 'multiple';

  // Collapsed/Completed summary state
  if (isCollapsed && isComplete) {
    return (
      <SectionCard
        title="Set Product Pricing"
        subtitle="Select products and configure price adjustments"
        status="completed"
      >
        <div className="my-5 border-t border-surface-border-soft" />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Product thumbnail circles */}
            <div className="flex -space-x-2">
              {selectedProducts.slice(0, 3).map((product: Product) => (
                <div
                  key={product.id}
                  className={`flex h-10 w-10 items-center justify-center rounded-full border-2 border-white ${stringToColor(product.title)}`}
                  title={product.title}
                >
                  <Package className="h-4 w-4 text-ink-400" />
                </div>
              ))}
              {selectedCount > 3 && (
                <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-gray-100 text-xs font-medium text-ink-500">
                  +{selectedCount - 3}
                </div>
              )}
            </div>

            <div>
              <p className="text-[13px] text-ink-500">
                {scope === 'all' ? (
                  <>Scope: <span className="font-semibold text-ink-900">All Products</span></>
                ) : (
                  <>You've selected <span className="font-semibold text-ink-900">{selectedCount} Products</span></>
                )}
              </p>
              <p className="text-sm font-semibold text-ink-900">
                {scope === 'all'
                  ? 'All current and future products'
                  : (
                    <>
                      {selectedProductNames.slice(0, 3).join(' & ')}
                      {selectedProductNames.length > 3 && ` & ${selectedProductNames.length - 3} more`}
                    </>
                  )}
              </p>
              <p className="text-[13px] text-ink-500">
                With Price Adjustment Mode set to{' '}
                <span className="font-semibold text-ink-900">{adjustmentDescription}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsCollapsed(false)}
            className="inline-flex items-center gap-2 text-sm font-medium text-ink-700 hover:text-ink-900"
          >
            <Pencil className="h-3.5 w-3.5" />
            Make Changes
          </button>
        </div>
      </SectionCard>
    );
  }

  return (
    <SectionCard
      title="Set Product Pricing"
      subtitle="Set details"
      status={isComplete ? 'completed' : 'not-started'}
    >
      <div className="my-6 border-t border-surface-border-soft" />

      {/* 6.1 Profile Scope */}
      <div>
        <label className="mb-3 block text-[13px] font-medium text-ink-700">
          You are creating a Pricing Profile for
        </label>
        <RadioGroup
          options={[
            { label: 'One Product', value: 'one' },
            { label: 'Multiple Products', value: 'multiple' },
            ...(isCustom
              ? []
              : [{ label: 'All Products', value: 'all' }]),
          ]}
          value={profileScopeRadio}
          onChange={(val) => {
            handleScopeChange(val);
            if (val === 'all') {
              setSelectAll('select');
            }
          }}
        />
        {isCustom && (
          <p className="mt-2 text-xs text-ink-400">
            "All Products" is not available with custom pricing — prices must be set per product.
          </p>
        )}
      </div>

      {/* Scope='all' banner */}
      {scope === 'all' && !isCustom && (
        <div className="mt-6 rounded-lg border border-teal-200 bg-teal-50 px-4 py-3">
          <p className="text-sm font-medium text-teal-800">All Products Included</p>
          <p className="mt-1 text-[13px] text-teal-600">
            This profile will apply to all current and future products. No manual selection needed.
          </p>
        </div>
      )}

      {/* 6.2 Search row — hidden when scope='all' */}
      {scope !== 'all' && (
        <>
          <div className="mt-8">
            <label className="mb-3 block text-[13px] font-medium text-ink-700">
              Search for Products
            </label>
            <div className="flex gap-3">
              <TextInput
                placeholder="Search"
                value={searchTerm}
                onChange={setSearchTerm}
                iconLeft={<Search className="h-4 w-4" />}
                className="flex-1"
              />
              <TextInput
                placeholder="Product / SKU"
                value={skuSearch}
                onChange={setSkuSearch}
                className="flex-1"
              />
              <SelectInput
                placeholder="Category"
                value={categoryFilter}
                options={categories}
                onChange={setCategoryFilter}
                className="flex-1"
              />
              <SelectInput
                placeholder="Segment"
                value={segmentFilter}
                options={segments}
                onChange={setSegmentFilter}
                className="flex-1"
              />
              <SelectInput
                placeholder="Brand"
                value={brandFilter}
                options={brands}
                onChange={setBrandFilter}
                className="flex-1"
              />
            </div>
          </div>

          {/* 6.3 Results header */}
          <div className="mt-6">
            <div className="flex items-center gap-3 text-[13px]">
              <p>
                <span className="text-ink-500">Showing </span>
                <span className="font-semibold text-ink-900">
                  ({products.length} {products.length === 1 ? 'Result' : 'Results'})
                </span>
                {(searchTerm || skuSearch) && (
                  <>
                    <span className="text-ink-500"> for </span>
                    <span className="font-semibold text-ink-900">
                      ({searchTerm || skuSearch})
                    </span>
                  </>
                )}
              </p>
              {activeFilters.map((filter) => (
                <span
                  key={filter}
                  className="rounded-pill bg-[#EEF2FF] px-3 py-1 text-xs font-medium text-ink-900"
                >
                  {'{' + filter + '}'}
                </span>
              ))}
            </div>
            <div className="my-4 border-t border-surface-border-soft" />
          </div>

          {/* 6.4 Select all toggle */}
          <RadioGroup
            options={[
              { label: 'Deselect All', value: 'deselect' },
              { label: 'Select all', value: 'select' },
            ]}
            value={selectAll}
            onChange={handleSelectAll}
          />

          {/* 6.5 Product list */}
          <div className="mt-4">
            {isLoading && (
              <div className="flex items-center justify-center gap-2 py-8 text-sm text-ink-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading products...
              </div>
            )}
            {isError && (
              <div className="py-8 text-center text-sm text-red-500">
                Failed to load products. Make sure the backend is running.
              </div>
            )}
            {!isLoading && !isError && products.length === 0 && (
              <div className="py-8 text-center text-sm text-ink-500">
                No products found matching your filters.
              </div>
            )}
            {products.map((product: Product, index: number) => (
              <ProductRow
                key={product.id}
                name={product.title}
                sku={product.sku}
                subtitle={`${product.subCategory} · ${product.segment} · ${product.brand}`}
                checked={selectedProductIds.has(product.id)}
                onToggle={(checked) => toggleProduct(product.id, checked)}
                isLast={index === products.length - 1}
              />
            ))}
          </div>

          {/* 6.6 Selection summary */}
          <p className="mt-4 text-[13px]">
            <span className="text-ink-500">You've selected </span>
            <span className="font-semibold text-ink-900">{selectedCount} Products</span>
            <span className="text-ink-500">, these will be added </span>
            <span className="font-semibold text-ink-900">{profileName || 'Profile Name'}</span>
          </p>
        </>
      )}

      <div className="my-6 border-t border-surface-border-soft" />

      {/* 6.7 Based on dropdown */}
      <div>
        <label className="mb-2 block text-[13px] font-medium text-ink-700">Based on</label>
        <div className="relative w-[280px]">
          <select
            disabled
            className="h-11 w-full appearance-none rounded-input border border-surface-border bg-gray-50 px-3.5 pr-10 text-sm text-ink-500 cursor-not-allowed"
          >
            <option>Based on Price</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" />
        </div>
      </div>

      {/* 6.8 Set Price Adjustment Mode */}
      <div className="mt-6">
        <label className="mb-3 block text-[13px] font-medium text-ink-700">
          Set Price Adjustment Mode
        </label>
        <RadioGroup
          options={[
            { label: 'Fixed ($)', value: 'fixed' },
            { label: 'Dynamic (%)', value: 'dynamic' },
            { label: 'Custom', value: 'custom' },
          ]}
          value={adjustmentType}
          onChange={(val) => {
            onAdjustmentTypeChange(val as 'fixed' | 'dynamic' | 'custom');
            // Force scope to 'selected' when switching to custom
            if (val === 'custom' && scope === 'all') {
              onScopeChange('selected');
            }
          }}
        />
      </div>

      {/* Custom mode info banner */}
      {isCustom && (
        <div className="mt-4 flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
          <div>
            <p className="text-sm font-medium text-blue-800">Custom Pricing Mode</p>
            <p className="mt-1 text-[13px] text-blue-600">
              Enter an exact price for each product below. No formula or calculation is applied — the price you type is the final price.
            </p>
          </div>
        </div>
      )}

      {/* 6.9 Set Price Adjustment Increment Mode — hidden for custom */}
      {!isCustom && (
        <div className="mt-6">
          <label className="mb-3 block text-[13px] font-medium text-ink-700">
            Set Price Adjustment Increment Mode
          </label>
          <RadioGroup
            options={[
              { label: 'Increase +', value: 'increase' },
              { label: 'Decrease -', value: 'decrease' },
            ]}
            value={adjustmentDirection}
            onChange={(val) => onAdjustmentDirectionChange(val as 'increase' | 'decrease')}
          />
        </div>
      )}

      {/* Adjustment value input — hidden for custom */}
      {!isCustom && (
        <div className="mt-6">
          <label className="mb-2 block text-[13px] font-medium text-ink-700">
            Adjustment Value {adjustmentType === 'dynamic' ? '(%)' : '($)'}
          </label>
          <div className="relative w-[200px]">
            <input
              type="number"
              min="0"
              step={adjustmentType === 'dynamic' ? '1' : '0.01'}
              value={adjustmentValue || ''}
              onChange={(e) => onAdjustmentValueChange(parseFloat(e.target.value) || 0)}
              placeholder={adjustmentType === 'dynamic' ? 'e.g. 10' : 'e.g. 5.00'}
              className="h-11 w-full rounded-input border border-surface-border bg-white px-3.5 text-sm text-ink-900 focus:outline-none focus:ring-1 focus:ring-teal/30"
            />
          </div>
        </div>
      )}

      {/* 6.10 Tip note — hidden for custom */}
      {!isCustom && (
        <div className="mt-6 flex items-center gap-2">
          <Lightbulb className="h-4 w-4 shrink-0 text-status-amber" />
          <p className="text-[13px] text-status-amber">
            The adjusted price will be calculated from{' '}
            <span className="rounded border border-status-amber/30 bg-white px-2 py-0.5 font-semibold">
              Based on Price
            </span>{' '}
            selected above
          </p>
        </div>
      )}

      {/* Price table auto-updates via TanStack Query */}

      {/* Warnings banner */}
      {warnings.length > 0 && (
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <p className="text-sm font-medium text-amber-800">Negative Price Warning</p>
          </div>
          <ul className="mt-2 space-y-1">
            {warnings.map((w, i) => (
              <li key={i} className="text-[13px] text-amber-700">{w}</li>
            ))}
          </ul>
        </div>
      )}

      {/* 6.12 New Price Table */}
      <div className="mt-4">
        {!isCustom && isPreviewLoading ? (
          <div className="flex items-center justify-center gap-2 py-8 text-sm text-ink-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Calculating prices...
          </div>
        ) : (
          <NewPriceTable
            rows={priceRows}
            adjustmentDirection={adjustmentDirection}
            adjustmentType={adjustmentType}
            customPrices={isCustom ? customPrices : undefined}
            onCustomPriceChange={isCustom ? handleCustomPriceChange : undefined}
          />
        )}
      </div>

      {/* 6.13 Footer */}
      <div className="mt-8 flex items-center justify-between">
        <p className="text-xs text-ink-400">Your entries are saved automatically</p>
        <div className="flex items-center gap-6">
          <button
            type="button"
            onClick={() => { if (isComplete) setIsCollapsed(true); }}
            className="text-sm font-medium text-ink-700 hover:text-ink-900"
          >
            Back
          </button>
          <PillButton
            variant="primary"
            className="px-7"
            onClick={() => {
              if (isComplete) setIsCollapsed(true);
            }}
          >
            Next
          </PillButton>
        </div>
      </div>
    </SectionCard>
  );
}
