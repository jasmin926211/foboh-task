import { z } from "zod";
import { NAME_MAX_LENGTH, DESCRIPTION_MAX_LENGTH } from "../../constants";

export const createCustomerGroupPolicy = {
  body: z.object({
    name: z.string().min(1).max(NAME_MAX_LENGTH),
    description: z.string().max(DESCRIPTION_MAX_LENGTH).optional(),
  }),
};

export type CreateCustomerGroupBody = z.infer<typeof createCustomerGroupPolicy.body>;

export const updateCustomerGroupPolicy = {
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    name: z.string().min(1).max(NAME_MAX_LENGTH).optional(),
    description: z.string().max(DESCRIPTION_MAX_LENGTH).optional().nullable(),
  }),
};

export type UpdateCustomerGroupBody = z.infer<typeof updateCustomerGroupPolicy.body>;

export const getCustomerGroupPolicy = {
  params: z.object({
    id: z.string().uuid(),
  }),
};

export const deleteCustomerGroupPolicy = {
  params: z.object({
    id: z.string().uuid(),
  }),
};

export const listCustomerGroupsPolicy = {
  query: z.object({
    search: z.string().optional(),
  }),
};

export const addMemberPolicy = {
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    customerId: z.string().uuid(),
  }),
};

export const removeMemberPolicy = {
  params: z.object({
    id: z.string().uuid(),
    customerId: z.string().uuid(),
  }),
};
