import { useState } from 'react';
import { Search, ChevronDown, Lightbulb, RefreshCw } from 'lucide-react';
import { SectionCard } from './SectionCard';
import { RadioGroup } from './RadioGroup';
import { TextInput } from './TextInput';
import { SelectInput } from './SelectInput';
import { ProductRow } from './ProductRow';
import { NewPriceTable } from './NewPriceTable';
import { PillButton } from './PillButton';
import { seedProducts, priceTableRows, type SeedProduct } from '@/lib/seed';

export function SetProductPricing() {
  const [profileScope, setProfileScope] = useState('multiple');
  const [selectAll, setSelectAll] = useState('deselect');
  const [adjustmentMode, setAdjustmentMode] = useState('fixed');
  const [incrementMode, setIncrementMode] = useState('decrease');
  const [products, setProducts] = useState<SeedProduct[]>(seedProducts);

  const selectedCount = products.filter((p) => p.checked).length;

  const toggleProduct = (id: string, checked: boolean) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, checked } : p)));
  };

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
            { label: 'All Products', value: 'all' }
          ]}
          value={profileScope}
          onChange={setProfileScope}
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
            iconLeft={<Search className="h-4 w-4" />}
            iconRight={
              <span className="flex h-6 w-6 items-center justify-center rounded bg-surface-panel">
                <Search className="h-3.5 w-3.5" />
              </span>
            }
            className="flex-1"
          />
          <TextInput placeholder="Product / SKU" className="flex-1" />
          <SelectInput placeholder="Category" className="flex-1" />
          <SelectInput placeholder="Segment" className="flex-1" />
          <SelectInput placeholder="Brand" className="flex-1" />
        </div>
      </div>

      {/* 6.3 Results header */}
      <div className="mt-6">
        <div className="flex items-center gap-3 text-[13px]">
          <p>
            <span className="text-ink-500">Showing </span>
            <span className="font-semibold text-ink-900">6 Result</span>
            <span className="text-ink-500"> for </span>
            <span className="font-semibold text-ink-900">Product Name or SKU Code</span>
          </p>
          <span className="rounded-pill bg-[#EEF2FF] px-3 py-1 text-xs font-medium text-ink-900">
            Brand
          </span>
          <span className="rounded-pill bg-[#EEF2FF] px-3 py-1 text-xs font-medium text-ink-900">
            Brand
          </span>
        </div>
        <div className="my-4 border-t border-surface-border-soft" />
      </div>

      {/* 6.4 Select all toggle */}
      <RadioGroup
        options={[
          { label: 'Deselect All', value: 'deselect' },
          { label: 'Select all', value: 'select' }
        ]}
        value={selectAll}
        onChange={(val) => {
          setSelectAll(val);
          setProducts((prev) =>
            prev.map((p) => ({ ...p, checked: val === 'select' }))
          );
        }}
      />

      {/* 6.5 Product list */}
      <div className="mt-4">
        {products.map((product, index) => (
          <ProductRow
            key={product.id}
            name={product.name}
            sku={product.sku}
            pack={product.pack}
            image={product.image}
            checked={product.checked}
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
        <span className="font-semibold text-ink-900">{'Profile Name'}</span>
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
            { label: 'Dynamic (%)', value: 'dynamic' }
          ]}
          value={adjustmentMode}
          onChange={setAdjustmentMode}
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
            { label: 'Decrease -', value: 'decrease' }
          ]}
          value={incrementMode}
          onChange={setIncrementMode}
        />
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
        <NewPriceTable rows={priceTableRows} />
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
