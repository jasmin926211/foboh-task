import apiClient from '@/lib/client';
import { API_ENDPOINTS } from '@/lib/apiEndpoints';
import type {
  PricingProfile,
  CreateProfilePayload,
  UpdateProfilePayload,
  PaginatedProfiles,
  ResolvedPrice,
  PreviewPricesPayload,
  PreviewPricesResponse,
  ComputedPrice,
} from '@/types';

export const fetchProfiles = async (
  search?: string,
  status?: 'draft' | 'published',
  page: number = 1,
  limit: number = 10,
): Promise<PaginatedProfiles> => {
  const params: Record<string, string | number> = { page, limit };
  if (search) params.search = search;
  if (status) params.status = status;
  const { data } = await apiClient.get(API_ENDPOINTS.PRICING_PROFILES, { params });
  return data;
};

export const checkProfileName = async (name: string, excludeId?: string): Promise<boolean> => {
  const params: Record<string, string> = { name };
  if (excludeId) params.excludeId = excludeId;
  const { data } = await apiClient.get(`${API_ENDPOINTS.PRICING_PROFILES}/check-name`, { params });
  return data.exists;
};

export const fetchProfile = async (id: string): Promise<PricingProfile & { computedPrices: ComputedPrice[] }> => {
  const { data } = await apiClient.get(`${API_ENDPOINTS.PRICING_PROFILES}/${id}`);
  return data;
};

export const createProfile = async (payload: CreateProfilePayload): Promise<PricingProfile> => {
  const { data } = await apiClient.post(API_ENDPOINTS.PRICING_PROFILES, payload);
  return data;
};

export const updateProfile = async (
  id: string,
  payload: UpdateProfilePayload
): Promise<PricingProfile> => {
  const { data } = await apiClient.put(`${API_ENDPOINTS.PRICING_PROFILES}/${id}`, payload);
  return data;
};

export const deleteProfile = async (id: string): Promise<void> => {
  await apiClient.delete(`${API_ENDPOINTS.PRICING_PROFILES}/${id}`);
};

export const fetchResolvedPrices = async (customerId: string): Promise<ResolvedPrice[]> => {
  const { data } = await apiClient.get(API_ENDPOINTS.RESOLVED_PRICES, { params: { customerId } });
  return data;
};

export const previewPrices = async (payload: PreviewPricesPayload): Promise<PreviewPricesResponse> => {
  const { data } = await apiClient.post(API_ENDPOINTS.PREVIEW_PRICES, payload);
  if (Array.isArray(data)) {
    return { results: data, warnings: [] };
  }
  return data;
};
