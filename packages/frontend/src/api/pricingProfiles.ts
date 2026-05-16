import apiClient from './client';
import type { PricingProfile, CreateProfilePayload, ResolvedPrice, PreviewPricesPayload, PreviewPricesResponse } from '../types';

export interface PaginatedProfiles {
  data: PricingProfile[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const fetchProfiles = async (
  customerName?: string,
  status?: 'draft' | 'published',
  page: number = 1,
  limit: number = 10,
): Promise<PaginatedProfiles> => {
  const params: Record<string, string | number> = { page, limit };
  if (customerName) params.customerName = customerName;
  if (status) params.status = status;
  const { data } = await apiClient.get('/pricing-profiles', { params });
  return data;
};

export const fetchProfile = async (id: string) => {
  const { data } = await apiClient.get(`/pricing-profiles/${id}`);
  return data;
};

export const createProfile = async (payload: CreateProfilePayload): Promise<PricingProfile[]> => {
  const { data } = await apiClient.post('/pricing-profiles', payload);
  return data;
};

export interface UpdateProfilePayload {
  name?: string;
  customerName?: string;
  adjustmentType?: 'fixed' | 'dynamic' | 'custom';
  adjustmentDirection?: 'increase' | 'decrease' | null;
  adjustmentValue?: number | null;
  status?: 'draft' | 'published';
  scope?: 'all' | 'selected';
  productIds?: string[];
  customPrices?: Record<string, number>;
}

export const updateProfile = async (
  id: string,
  payload: UpdateProfilePayload
): Promise<PricingProfile> => {
  const { data } = await apiClient.put(`/pricing-profiles/${id}`, payload);
  return data;
};

export const deleteProfile = async (id: string): Promise<void> => {
  await apiClient.delete(`/pricing-profiles/${id}`);
};

export const fetchResolvedPrices = async (customerName: string): Promise<ResolvedPrice[]> => {
  const { data } = await apiClient.get('/resolved-prices', { params: { customerName } });
  return data;
};

export const previewPrices = async (payload: PreviewPricesPayload): Promise<PreviewPricesResponse> => {
  const { data } = await apiClient.post('/preview-prices', payload);
  // Handle both old format (flat array) and new format ({ results, warnings })
  if (Array.isArray(data)) {
    return { results: data, warnings: [] };
  }
  return data;
};
