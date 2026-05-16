import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchProfiles,
  fetchProfile,
  createProfile,
  updateProfile,
  previewPrices,
  checkProfileName,
} from '@/api/pricingProfiles';
import type { UpdateProfilePayload } from '@/api/pricingProfiles';
import type { CreateProfilePayload, PreviewPricesPayload } from '@/types';

export function useProfiles(search?: string, status?: 'draft' | 'published', page: number = 1, limit: number = 10) {
  return useQuery({
    queryKey: ['profiles', search, status, page, limit],
    queryFn: () => fetchProfiles(search, status, page, limit),
    placeholderData: (prev) => prev,
  });
}

export function useProfile(id?: string) {
  return useQuery({
    queryKey: ['profile', id],
    queryFn: () => fetchProfile(id!),
    enabled: !!id
  });
}

export function useCreateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateProfilePayload) => createProfile(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
    }
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateProfilePayload }) =>
      updateProfile(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    }
  });
}

export function useCheckProfileName(name: string, excludeId?: string) {
  return useQuery({
    queryKey: ['check-profile-name', name, excludeId],
    queryFn: () => checkProfileName(name, excludeId),
    enabled: name.trim().length > 0,
  });
}

export function usePreviewPrices(payload: PreviewPricesPayload | null) {
  return useQuery({
    queryKey: ['preview-prices', payload],
    queryFn: () => previewPrices(payload!),
    enabled:
      !!payload &&
      payload.adjustmentType !== 'custom' &&
      !!payload.adjustmentValue && payload.adjustmentValue > 0 &&
      (payload.scope === 'all' || (!!payload.productIds && payload.productIds.length > 0))
  });
}
