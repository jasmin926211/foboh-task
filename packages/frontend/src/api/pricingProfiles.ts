import apiClient from './client';
import { PricingProfile, CreateProfilePayload, ResolvedPrice } from '../types';

export const fetchProfiles = async (customerName?: string): Promise<PricingProfile[]> => {
  const { data } = await apiClient.get('/pricing-profiles', {
    params: customerName ? { customerName } : {},
  });
  return data;
};

export const fetchProfile = async (id: string) => {
  const { data } = await apiClient.get(`/pricing-profiles/${id}`);
  return data;
};

export const createProfile = async (payload: CreateProfilePayload): Promise<PricingProfile> => {
  const { data } = await apiClient.post('/pricing-profiles', payload);
  return data;
};

export const updateProfile = async (
  id: string,
  payload: Partial<CreateProfilePayload>
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
