import { useQuery } from '@tanstack/react-query';
import { fetchProducts } from '@/api/products';

export function useProducts(params?: {
  search?: string;
  subCategory?: string;
  segment?: string;
  brand?: string;
}) {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => fetchProducts(params)
  });
}
