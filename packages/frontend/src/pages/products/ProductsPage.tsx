import { useState, useMemo } from 'react';
import { Search, Loader2 } from 'lucide-react';
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
    <div className="rounded-card bg-surface-panel p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-lg font-semibold text-ink-900">Products</h1>
        <p className="mt-1 text-[13px] text-ink-500">
          Browse and filter the product catalog
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-3">
        <TextInput
          placeholder="Search by title or SKU..."
          value={search}
          onChange={setSearch}
          iconLeft={<Search className="h-4 w-4" />}
          className="flex-1"
        />
        <SelectInput
          placeholder="Category"
          value={categoryFilter}
          options={categories}
          onChange={setCategoryFilter}
          className="w-40"
        />
        <SelectInput
          placeholder="Segment"
          value={segmentFilter}
          options={segments}
          onChange={setSegmentFilter}
          className="w-40"
        />
        <SelectInput
          placeholder="Brand"
          value={brandFilter}
          options={brands}
          onChange={setBrandFilter}
          className="w-40"
        />
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
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-border">
                <th className="px-6 py-3 text-left text-[13px] font-medium text-ink-500">Title</th>
                <th className="px-6 py-3 text-left text-[13px] font-medium text-ink-500">SKU</th>
                <th className="px-6 py-3 text-left text-[13px] font-medium text-ink-500">Category</th>
                <th className="px-6 py-3 text-left text-[13px] font-medium text-ink-500">Segment</th>
                <th className="px-6 py-3 text-left text-[13px] font-medium text-ink-500">Brand</th>
                <th className="px-6 py-3 text-right text-[13px] font-medium text-ink-500">Base Price</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product: Product) => (
                <tr key={product.id} className="border-b border-surface-border-soft last:border-b-0 hover:bg-surface-panel/50">
                  <td className="px-6 py-4 text-sm font-medium text-ink-900">{product.title}</td>
                  <td className="px-6 py-4 text-sm text-ink-700">{product.sku}</td>
                  <td className="px-6 py-4 text-sm text-ink-700">{product.subCategory}</td>
                  <td className="px-6 py-4">
                    <span className="rounded-pill bg-[#EEF2FF] px-2.5 py-1 text-xs font-medium text-ink-900">
                      {product.segment}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-ink-700">{product.brand}</td>
                  <td className="px-6 py-4 text-right text-sm font-semibold text-ink-900">
                    ${product.basePrice.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
