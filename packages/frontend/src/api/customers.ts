import apiClient from '@/lib/client';
import { API_ENDPOINTS } from '@/lib/apiEndpoints';
import type { Customer } from '@/types';

export const fetchCustomers = async (search?: string): Promise<Customer[]> => {
  const params: Record<string, string> = {};
  if (search) params.search = search;
  const { data } = await apiClient.get(API_ENDPOINTS.CUSTOMERS, { params });
  return data;
};

export const fetchCustomer = async (id: string): Promise<Customer> => {
  const { data } = await apiClient.get(`${API_ENDPOINTS.CUSTOMERS}/${id}`);
  return data;
};

export const createCustomer = async (payload: { name: string; email?: string }): Promise<Customer> => {
  const { data } = await apiClient.post(API_ENDPOINTS.CUSTOMERS, payload);
  return data;
};

export const updateCustomer = async (id: string, payload: { name?: string; email?: string | null }): Promise<Customer> => {
  const { data } = await apiClient.put(`${API_ENDPOINTS.CUSTOMERS}/${id}`, payload);
  return data;
};

export const deleteCustomer = async (id: string): Promise<void> => {
  await apiClient.delete(`${API_ENDPOINTS.CUSTOMERS}/${id}`);
};
