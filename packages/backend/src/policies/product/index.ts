import { z } from 'zod';

export const listProductsPolicy = {
  query: z.object({
    search: z.string().optional(),
    subCategory: z.string().optional(),
    segment: z.string().optional(),
    brand: z.string().optional(),
  }),
};

export const getProductPolicy = {
  params: z.object({
    id: z.string().uuid(),
  }),
};

export const updateProductPolicy = {
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    costPrice: z.number().nullable().optional(),
    minMarginPercent: z.number().min(0).max(100).nullable().optional(),
  }),
};
