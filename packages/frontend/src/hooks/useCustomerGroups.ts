import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchCustomerGroups,
  createCustomerGroup,
  updateCustomerGroup,
  deleteCustomerGroup,
  addGroupMember,
  removeGroupMember,
} from '@/api/customerGroups';

export function useCustomerGroups(search?: string) {
  return useQuery({
    queryKey: ['customer-groups', search],
    queryFn: () => fetchCustomerGroups(search),
  });
}

export function useCreateCustomerGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { name: string; description?: string }) => createCustomerGroup(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-groups'] });
    },
  });
}

export function useUpdateCustomerGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { name?: string; description?: string | null } }) =>
      updateCustomerGroup(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-groups'] });
    },
  });
}

export function useDeleteCustomerGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteCustomerGroup(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-groups'] });
    },
  });
}

export function useAddGroupMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ groupId, customerId }: { groupId: string; customerId: string }) =>
      addGroupMember(groupId, customerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-groups'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
}

export function useRemoveGroupMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ groupId, customerId }: { groupId: string; customerId: string }) =>
      removeGroupMember(groupId, customerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-groups'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
}
