import apiClient from '@/lib/client';
import type { PricingProfile, CreateProfilePayload, ResolvedPrice, PreviewPricesPayload, PreviewPricesResponse } from '../types';

export interface PaginatedProfiles {
  data: PricingProfile[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const fetchProfiles = async (
  search?: string,
  status?: 'draft' | 'published',
  page: number = 1,
  limit: number = 10,
): Promise<PaginatedProfiles> => {
  const params: Record<string, string | number> = { page, limit };
  if (search) params.search = search;
  if (status) params.status = status;
  const { data } = await apiClient.get('/pricing-profiles', { params });
  return data;
};

export const checkProfileName = async (name: string, excludeId?: string): Promise<boolean> => {
  const params: Record<string, string> = { name };
  if (excludeId) params.excludeId = excludeId;
  const { data } = await apiClient.get('/pricing-profiles/check-name', { params });
  return data.exists;
};

export const fetchProfile = async (id: string) => {
  const { data } = await apiClient.get(`/pricing-profiles/${id}`);
  return data;
};

export const createProfile = async (payload: CreateProfilePayload): Promise<PricingProfile> => {
  const { data } = await apiClient.post('/pricing-profiles', payload);
  return data;
};

export interface UpdateProfilePayload {
  name?: string;
  customerId?: string | null;
  customerGroupId?: string | null;
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

export const fetchResolvedPrices = async (customerId: string): Promise<ResolvedPrice[]> => {
  const { data } = await apiClient.get('/resolved-prices', { params: { customerId } });
  return data;
};

export const previewPrices = async (payload: PreviewPricesPayload): Promise<PreviewPricesResponse> => {
  const { data } = await apiClient.post('/preview-prices', payload);
  if (Array.isArray(data)) {
    return { results: data, warnings: [] };
  }
  return data;
};
