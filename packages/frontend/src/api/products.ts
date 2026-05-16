import apiClient from '@/lib/client';
import { API_ENDPOINTS } from '@/lib/apiEndpoints';
import type { Product } from '@/types';

export const fetchProducts = async (params?: {
  search?: string;
  subCategory?: string;
  segment?: string;
  brand?: string;
}): Promise<Product[]> => {
  const { data } = await apiClient.get(API_ENDPOINTS.PRODUCTS, { params });
  return data;
};

export const fetchProduct = async (id: string): Promise<Product> => {
  const { data } = await apiClient.get(`${API_ENDPOINTS.PRODUCTS}/${id}`);
  return data;
};
