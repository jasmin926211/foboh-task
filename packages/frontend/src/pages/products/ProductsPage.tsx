import { useState, useMemo, useCallback } from 'react';
import { Search, Loader2, X } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { useDebounce } from '@/hooks/useDebounce';
import { TextInput } from '@/components/pricing/TextInput';
import { SelectInput } from '@/components/pricing/SelectInput';
import type { Product } from '@/types';

export function ProductsPage() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [segmentFilter, setSegmentFilter] = useState('');
  const [brandFilter, setBrandFilter] = useState('');

  const debouncedSearch = useDebounce(search, 300);

  const hasActiveFilters = !!search || !!categoryFilter || !!segmentFilter || !!brandFilter;

  const clearFilters = useCallback(() => {
    setSearch('');
    setCategoryFilter('');
    setSegmentFilter('');
    setBrandFilter('');
  }, []);

  const queryParams = useMemo(() => {
    const params: Record<string, string> = {};
    if (debouncedSearch) params.search = debouncedSearch;
    if (categoryFilter) params.subCategory = categoryFilter;
    if (segmentFilter) params.segment = segmentFilter;
    if (brandFilter) params.brand = brandFilter;
    return Object.keys(params).length > 0 ? params : undefined;
  }, [debouncedSearch, categoryFilter, segmentFilter, brandFilter]);

  const { data: products = [], isLoading, isError } = useProducts(queryParams);

  // Extract unique filter values from all products (unfiltered fetch for dropdowns)
  const { data: allProducts = [] } = useProducts();
  const categories = useMemo(() => [...new Set(allProducts.map((p: Product) => p.subCategory))].sort(), [allProducts]);
  const segments = useMemo(() => [...new Set(allProducts.map((p: Product) => p.segment))].sort(), [allProducts]);
  const brands = useMemo(() => [...new Set(allProducts.map((p: Product) => p.brand))].sort(), [allProducts]);

  return (
    <div className="rounded-card bg-surface-panel p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-lg font-semibold text-ink-900">Products</h1>
        <p className="mt-1 text-[13px] text-ink-500">
          Browse and filter the product catalog
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-end gap-3 sm:gap-4">
        <TextInput
          placeholder="Search by title or SKU..."
          value={search}
          onChange={setSearch}
          iconLeft={<Search className="h-4 w-4" />}
          className="flex-1 sm:min-w-[200px]"
        />
        <div className="grid grid-cols-2 sm:flex gap-3 sm:gap-4">
          <SelectInput
            placeholder="Category"
            value={categoryFilter}
            options={categories}
            onChange={setCategoryFilter}
            className="w-full sm:w-40"
          />
          <SelectInput
            placeholder="Segment"
            value={segmentFilter}
            options={segments}
            onChange={setSegmentFilter}
            className="w-full sm:w-40"
          />
          <SelectInput
            placeholder="Brand"
            value={brandFilter}
            options={brands}
            onChange={setBrandFilter}
            className="w-full sm:w-40"
          />
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex h-11 items-center justify-center gap-1.5 rounded-input border border-surface-border bg-white px-3 text-sm font-medium text-ink-500 hover:bg-surface-panel hover:text-ink-900 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Results count */}
      <p className="mb-4 text-[13px] text-ink-500">
        Showing <span className="font-semibold text-ink-900">{products.length}</span> products
      </p>

      {/* Table */}
      <div className="rounded-card border border-surface-border-soft bg-white">
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-ink-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading products...
          </div>
        ) : isError ? (
          <div className="py-16 text-center text-sm text-red-500">
            Failed to load products. Make sure the backend is running.
          </div>
        ) : products.length === 0 ? (
          <div className="py-16 text-center text-sm text-ink-500">
            No products found.
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full min-w-[750px]">
                <thead>
                  <tr className="border-b border-surface-border">
                    <th className="px-4 py-3 text-left text-[13px] font-medium text-ink-500">Title</th>
                    <th className="px-4 py-3 text-left text-[13px] font-medium text-ink-500">SKU</th>
                    <th className="px-4 py-3 text-left text-[13px] font-medium text-ink-500">Category</th>
                    <th className="px-4 py-3 text-left text-[13px] font-medium text-ink-500">Segment</th>
                    <th className="px-4 py-3 text-left text-[13px] font-medium text-ink-500">Brand</th>
                    <th className="px-4 py-3 text-right text-[13px] font-medium text-ink-500 whitespace-nowrap">Base Price</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product: Product) => (
                    <tr key={product.id} className="border-b border-surface-border-soft last:border-b-0 hover:bg-surface-panel/50">
                      <td className="px-4 py-4 text-sm font-medium text-ink-900">{product.title}</td>
                      <td className="px-4 py-4 text-sm text-ink-700 whitespace-nowrap">{product.sku}</td>
                      <td className="px-4 py-4 text-sm text-ink-700">{product.subCategory}</td>
                      <td className="px-4 py-4">
                        <span className="rounded-pill bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700">
                          {product.segment}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-ink-700">{product.brand}</td>
                      <td className="px-4 py-4 text-right text-sm font-semibold text-ink-900 whitespace-nowrap">
                        ${product.basePrice.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="lg:hidden divide-y divide-surface-border-soft">
              {products.map((product: Product) => (
                <div key={product.id} className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-sm font-medium text-ink-900 leading-snug">{product.title}</h3>
                    <span className="shrink-0 text-sm font-semibold text-ink-900">${product.basePrice.toFixed(2)}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-ink-500">
                    <span className="font-medium text-ink-700">{product.sku}</span>
                    <span>&middot;</span>
                    <span>{product.subCategory}</span>
                    <span>&middot;</span>
                    <span>{product.brand}</span>
                    <span className="rounded-pill bg-indigo-50 px-2 py-0.5 font-medium text-indigo-700">
                      {product.segment}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
