import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchProfiles,
  fetchProfile,
  createProfile,
  updateProfile
} from '@/api/pricingProfiles';
import type { CreateProfilePayload } from '@/types';

export function useProfiles(customerName?: string) {
  return useQuery({
    queryKey: ['profiles', customerName],
    queryFn: () => fetchProfiles(customerName)
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
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CreateProfilePayload> }) =>
      updateProfile(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    }
  });
}
