import { useState, useMemo, useCallback } from 'react';
import { Search, ChevronDown, Lightbulb, RefreshCw, Loader2 } from 'lucide-react';
import { SectionCard } from './SectionCard';
import { RadioGroup } from './RadioGroup';
import { TextInput } from './TextInput';
import { SelectInput } from './SelectInput';
import { ProductRow } from './ProductRow';
import { NewPriceTable, type PriceRow } from './NewPriceTable';
import { PillButton } from './PillButton';
import { useProducts } from '@/hooks/useProducts';
import { computePrice } from '@/lib/computePrice';
import type { Product } from '@/types';

interface SetProductPricingProps {
  profileName: string;
  selectedProductIds: Set<string>;
  onSelectedChange: (ids: Set<string>) => void;
  adjustmentType: 'fixed' | 'dynamic';
  onAdjustmentTypeChange: (value: 'fixed' | 'dynamic') => void;
  adjustmentDirection: 'increase' | 'decrease';
  onAdjustmentDirectionChange: (value: 'increase' | 'decrease') => void;
  adjustmentValue: number;
  onAdjustmentValueChange: (value: number) => void;
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
}: SetProductPricingProps) {
  const [profileScope, setProfileScope] = useState('multiple');
  const [selectAll, setSelectAll] = useState('deselect');

  // Search & filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [skuSearch, setSkuSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [segmentFilter, setSegmentFilter] = useState('');
  const [brandFilter, setBrandFilter] = useState('');

  // Build query params — combine search + SKU into one search param
  const queryParams = useMemo(() => {
    const params: Record<string, string> = {};
    const search = searchTerm || skuSearch;
    if (search) params.search = search;
    if (categoryFilter) params.subCategory = categoryFilter;
    if (segmentFilter) params.segment = segmentFilter;
    if (brandFilter) params.brand = brandFilter;
    return Object.keys(params).length > 0 ? params : undefined;
  }, [searchTerm, skuSearch, categoryFilter, segmentFilter, brandFilter]);

  const { data: products = [], isLoading, isError } = useProducts(queryParams);

  // Extract unique values for filter dropdowns
  const { categories, segments, brands } = useMemo(() => {
    return {
      categories: [...new Set(products.map((p: Product) => p.subCategory))].sort(),
      segments: [...new Set(products.map((p: Product) => p.segment))].sort(),
      brands: [...new Set(products.map((p: Product) => p.brand))].sort(),
    };
  }, [products]);

  const selectedCount = selectedProductIds.size;

  const toggleProduct = useCallback(
    (id: string, checked: boolean) => {
      const next = new Set(selectedProductIds);
      if (checked) {
        next.add(id);
      } else {
        next.delete(id);
      }
      onSelectedChange(next);
    },
    [selectedProductIds, onSelectedChange]
  );

  const handleSelectAll = useCallback(
    (val: string) => {
      setSelectAll(val);
      if (val === 'select') {
        onSelectedChange(new Set(products.map((p: Product) => p.id)));
      } else {
        onSelectedChange(new Set());
      }
    },
    [products, onSelectedChange]
  );

  // Active filter pills
  const activeFilters = useMemo(() => {
    const pills: string[] = [];
    if (categoryFilter) pills.push(categoryFilter);
    if (segmentFilter) pills.push(segmentFilter);
    if (brandFilter) pills.push(brandFilter);
    return pills;
  }, [categoryFilter, segmentFilter, brandFilter]);

  // Compute price table rows from selected products
  const priceRows: PriceRow[] = useMemo(() => {
    return products
      .filter((p: Product) => selectedProductIds.has(p.id))
      .map((p: Product) => {
        const newPrice = computePrice(p.basePrice, adjustmentType, adjustmentDirection, adjustmentValue);
        const adjustmentAmount =
          adjustmentType === 'fixed'
            ? adjustmentValue
            : (p.basePrice * adjustmentValue) / 100;
        return {
          productId: p.id,
          title: p.title,
          sku: p.sku,
          category: p.subCategory,
          basePrice: p.basePrice,
          adjustment: adjustmentAmount,
          newPrice,
        };
      });
  }, [products, selectedProductIds, adjustmentType, adjustmentDirection, adjustmentValue]);

  return (
    <SectionCard title="Set Product Pricing" subtitle="Set details">
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
            { label: 'All Products', value: 'all' },
          ]}
          value={profileScope}
          onChange={(val) => {
            setProfileScope(val);
            if (val === 'all') {
              onSelectedChange(new Set(products.map((p: Product) => p.id)));
              setSelectAll('select');
            }
          }}
        />
      </div>

      {/* 6.2 Search row */}
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
              {products.length} {products.length === 1 ? 'Result' : 'Results'}
            </span>
            {(searchTerm || skuSearch) && (
              <>
                <span className="text-ink-500"> for </span>
                <span className="font-semibold text-ink-900">
                  {searchTerm || skuSearch}
                </span>
              </>
            )}
          </p>
          {activeFilters.map((filter) => (
            <span
              key={filter}
              className="rounded-pill bg-[#EEF2FF] px-3 py-1 text-xs font-medium text-ink-900"
            >
              {filter}
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
        <span className="text-ink-500">, these will be added to </span>
        <span className="font-semibold text-ink-900">{profileName || 'Profile Name'}</span>
      </p>

      <div className="my-6 border-t border-surface-border-soft" />

      {/* 6.7 Based on dropdown */}
      <div>
        <label className="mb-2 block text-[13px] font-medium text-ink-700">Based on</label>
        <div className="relative w-[280px]">
          <select className="h-11 w-full appearance-none rounded-input border border-surface-border bg-white px-3.5 pr-10 text-sm text-ink-900 focus:outline-none focus:ring-1 focus:ring-teal/30">
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
          ]}
          value={adjustmentType}
          onChange={(val) => onAdjustmentTypeChange(val as 'fixed' | 'dynamic')}
        />
      </div>

      {/* 6.9 Set Price Adjustment Increment Mode */}
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

      {/* Adjustment value input */}
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

      {/* 6.10 Tip note */}
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

      {/* 6.11 Refresh link */}
      <div className="mt-4 flex justify-end">
        <button className="inline-flex items-center gap-2 text-[13px] font-semibold text-status-purple">
          Refresh New Price Table
          <RefreshCw className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* 6.12 New Price Table */}
      <div className="mt-4">
        <NewPriceTable
          rows={priceRows}
          adjustmentDirection={adjustmentDirection}
          adjustmentType={adjustmentType}
        />
      </div>

      {/* 6.13 Footer */}
      <div className="mt-8 flex items-center justify-between">
        <p className="text-xs text-ink-400">Your entries are saved automatically</p>
        <div className="flex items-center gap-6">
          <button className="text-sm font-medium text-ink-700 hover:text-ink-900">Back</button>
          <PillButton variant="primary" className="px-7">
            Next
          </PillButton>
        </div>
      </div>
    </SectionCard>
  );
}
