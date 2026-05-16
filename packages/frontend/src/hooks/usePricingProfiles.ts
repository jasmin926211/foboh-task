import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchProfiles,
  fetchProfile,
  createProfile,
  updateProfile,
  deleteProfile,
  previewPrices,
  checkProfileName,
} from '@/api/pricingProfiles';
import { QUERY_KEYS } from '@/lib/queryKeys';
import type { CreateProfilePayload, UpdateProfilePayload, PreviewPricesPayload } from '@/types';

export function useProfiles(search?: string, status?: 'draft' | 'published', page: number = 1, limit: number = 10) {
  return useQuery({
    queryKey: [QUERY_KEYS.PROFILES, search, status, page, limit],
    queryFn: () => fetchProfiles(search, status, page, limit),
    placeholderData: (prev) => prev,
  });
}

export function useProfile(id?: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.PROFILE, id],
    queryFn: () => fetchProfile(id!),
    enabled: !!id
  });
}

export function useCreateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateProfilePayload) => createProfile(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PROFILES] });
    }
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateProfilePayload }) =>
      updateProfile(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PROFILES] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PROFILE] });
    }
  });
}

export function useDeleteProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteProfile(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PROFILES] });
    }
  });
}

export function useCheckProfileName(name: string, excludeId?: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.CHECK_PROFILE_NAME, name, excludeId],
    queryFn: () => checkProfileName(name, excludeId),
    enabled: name.trim().length > 0,
  });
}

export function usePreviewPrices(payload: PreviewPricesPayload | null) {
  return useQuery({
    queryKey: [QUERY_KEYS.PREVIEW_PRICES, payload],
    queryFn: () => previewPrices(payload!),
    enabled:
      !!payload &&
      payload.adjustmentType !== 'custom' &&
      !!payload.adjustmentValue && payload.adjustmentValue > 0 &&
      (payload.scope === 'all' || (!!payload.productIds && payload.productIds.length > 0))
  });
}
