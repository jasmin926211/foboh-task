import { z } from "zod";
import { NAME_MAX_LENGTH } from "../../constants";

export const createCustomerPolicy = {
  body: z.object({
    name: z.string().min(1).max(NAME_MAX_LENGTH),
    email: z.string().email().optional(),
  }),
};

export type CreateCustomerBody = z.infer<typeof createCustomerPolicy.body>;

export const updateCustomerPolicy = {
  params: z.object({
    id: z.uuid(),
  }),
  body: z.object({
    name: z.string().min(1).max(NAME_MAX_LENGTH).optional(),
    email: z.string().email().optional().nullable(),
  }),
};

export type UpdateCustomerBody = z.infer<typeof updateCustomerPolicy.body>;

export const getCustomerPolicy = {
  params: z.object({
    id: z.uuid(),
  }),
};

export const deleteCustomerPolicy = {
  params: z.object({
    id: z.uuid(),
  }),
};

export const listCustomersPolicy = {
  query: z.object({
    search: z.string().optional(),
  }),
};
