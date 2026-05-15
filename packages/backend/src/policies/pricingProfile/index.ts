import { z } from "zod";

export const createProfilePolicy = {
  body: z.object({
    name: z.string().min(1).max(100),
    customerName: z.string().min(1).max(100),
    adjustmentType: z.enum(["fixed", "dynamic"]),
    adjustmentDirection: z.enum(["increase", "decrease"]),
    adjustmentValue: z.number().positive(),
    productIds: z.array(z.string().uuid()).min(1),
  }),
};

export type CreateProfileBody = z.infer<typeof createProfilePolicy.body>;

export const updateProfilePolicy = {
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    name: z.string().min(1).max(100).optional(),
    customerName: z.string().min(1).max(100).optional(),
    adjustmentType: z.enum(["fixed", "dynamic"]).optional(),
    adjustmentDirection: z.enum(["increase", "decrease"]).optional(),
    adjustmentValue: z.number().positive().optional(),
    productIds: z.array(z.string().uuid()).min(1).optional(),
  }),
};

export type UpdateProfileBody = z.infer<typeof updateProfilePolicy.body>;

export const getProfilePolicy = {
  params: z.object({
    id: z.string().uuid(),
  }),
};

export const deleteProfilePolicy = {
  params: z.object({
    id: z.string().uuid(),
  }),
};

export const listProfilesPolicy = {
  query: z.object({
    customerName: z.string().optional(),
  }),
};

export const resolvedPricesPolicy = {
  query: z.object({
    customerName: z.string().min(1),
  }),
};

export const resolvedPriceByProductPolicy = {
  params: z.object({
    id: z.string().uuid(),
  }),
  query: z.object({
    customerName: z.string().min(1),
  }),
};
