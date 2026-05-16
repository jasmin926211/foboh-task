import { useQuery } from '@tanstack/react-query';
import { fetchProducts } from '@/api/products';
import { QUERY_KEYS } from '@/lib/queryKeys';

export function useProducts(params?: {
  search?: string;
  subCategory?: string;
  segment?: string;
  brand?: string;
}) {
  return useQuery({
    queryKey: [QUERY_KEYS.PRODUCTS, params],
    queryFn: () => fetchProducts(params)
  });
}
