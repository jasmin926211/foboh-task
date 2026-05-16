import apiClient from '@/lib/client';
import { API_ENDPOINTS } from '@/lib/apiEndpoints';
import type { CustomerGroup, CustomerGroupMembership } from '@/types';

export const fetchCustomerGroups = async (search?: string): Promise<CustomerGroup[]> => {
  const params: Record<string, string> = {};
  if (search) params.search = search;
  const { data } = await apiClient.get(API_ENDPOINTS.CUSTOMER_GROUPS, { params });
  return data;
};

export const fetchCustomerGroup = async (id: string): Promise<CustomerGroup> => {
  const { data } = await apiClient.get(`${API_ENDPOINTS.CUSTOMER_GROUPS}/${id}`);
  return data;
};

export const createCustomerGroup = async (payload: { name: string; description?: string }): Promise<CustomerGroup> => {
  const { data } = await apiClient.post(API_ENDPOINTS.CUSTOMER_GROUPS, payload);
  return data;
};

export const updateCustomerGroup = async (id: string, payload: { name?: string; description?: string | null }): Promise<CustomerGroup> => {
  const { data } = await apiClient.put(`${API_ENDPOINTS.CUSTOMER_GROUPS}/${id}`, payload);
  return data;
};

export const deleteCustomerGroup = async (id: string): Promise<void> => {
  await apiClient.delete(`${API_ENDPOINTS.CUSTOMER_GROUPS}/${id}`);
};

export const addGroupMember = async (groupId: string, customerId: string): Promise<CustomerGroupMembership> => {
  const { data } = await apiClient.post(`${API_ENDPOINTS.CUSTOMER_GROUPS}/${groupId}/members`, { customerId });
  return data;
};

export const removeGroupMember = async (groupId: string, customerId: string): Promise<void> => {
  await apiClient.delete(`${API_ENDPOINTS.CUSTOMER_GROUPS}/${groupId}/members/${customerId}`);
};
