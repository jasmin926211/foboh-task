import apiClient from './client';
import { Product } from '../types';

export const fetchProducts = async (params?: {
  search?: string;
  subCategory?: string;
  segment?: string;
  brand?: string;
}): Promise<Product[]> => {
  const { data } = await apiClient.get('/products', { params });
  return data;
};

export const fetchProduct = async (id: string): Promise<Product> => {
  const { data } = await apiClient.get(`/products/${id}`);
  return data;
};
