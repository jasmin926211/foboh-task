import apiClient from '@/lib/client';
import type { Customer } from '../types';

export const fetchCustomers = async (search?: string): Promise<Customer[]> => {
  const params: Record<string, string> = {};
  if (search) params.search = search;
  const { data } = await apiClient.get('/customers', { params });
  return data;
};

export const fetchCustomer = async (id: string): Promise<Customer> => {
  const { data } = await apiClient.get(`/customers/${id}`);
  return data;
};

export const createCustomer = async (payload: { name: string; email?: string }): Promise<Customer> => {
  const { data } = await apiClient.post('/customers', payload);
  return data;
};

export const updateCustomer = async (id: string, payload: { name?: string; email?: string | null }): Promise<Customer> => {
  const { data } = await apiClient.put(`/customers/${id}`, payload);
  return data;
};

export const deleteCustomer = async (id: string): Promise<void> => {
  await apiClient.delete(`/customers/${id}`);
};
