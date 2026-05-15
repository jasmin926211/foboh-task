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
