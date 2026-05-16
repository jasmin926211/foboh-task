import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchCustomerGroups,
  createCustomerGroup,
  updateCustomerGroup,
  deleteCustomerGroup,
  addGroupMember,
  removeGroupMember,
} from '@/api/customerGroups';
import { QUERY_KEYS } from '@/lib/queryKeys';

export function useCustomerGroups(search?: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.CUSTOMER_GROUPS, search],
    queryFn: () => fetchCustomerGroups(search),
  });
}

export function useCreateCustomerGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { name: string; description?: string }) => createCustomerGroup(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CUSTOMER_GROUPS] });
    },
  });
}

export function useUpdateCustomerGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { name?: string; description?: string | null } }) =>
      updateCustomerGroup(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CUSTOMER_GROUPS] });
    },
  });
}

export function useDeleteCustomerGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteCustomerGroup(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CUSTOMER_GROUPS] });
    },
  });
}

export function useAddGroupMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ groupId, customerId }: { groupId: string; customerId: string }) =>
      addGroupMember(groupId, customerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CUSTOMER_GROUPS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CUSTOMERS] });
    },
  });
}

export function useRemoveGroupMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ groupId, customerId }: { groupId: string; customerId: string }) =>
      removeGroupMember(groupId, customerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CUSTOMER_GROUPS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CUSTOMERS] });
    },
  });
}
