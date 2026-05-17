import { z } from "zod";
import { NAME_MAX_LENGTH, PAGINATION_MAX_LIMIT } from "../../constants";

export const createProfilePolicy = {
  body: z
    .object({
      name: z.string().min(1).max(NAME_MAX_LENGTH),
      customerId: z.uuid().optional(),
      customerGroupId: z.uuid().optional(),
      adjustmentType: z.enum(["fixed", "dynamic", "custom"]),
      adjustmentDirection: z.enum(["increase", "decrease"]).optional(),
      adjustmentValue: z.number().positive().optional(),
      status: z.enum(["draft", "published"]).default("draft"),
      scope: z.enum(["all", "selected"]).default("selected"),
      productIds: z.array(z.uuid()).optional(),
      customPrices: z.record(z.uuid(), z.number().nonnegative()).optional(),
    })
    .refine(
      (data) => !(data.customerId && data.customerGroupId),
      { message: "At most one of customerId or customerGroupId can be set", path: ["customerId"] }
    )
    .refine(
      (data) => data.scope === "all" || (data.productIds && data.productIds.length > 0),
      { message: "productIds must be non-empty when scope is 'selected'", path: ["productIds"] }
    )
    .refine(
      (data) => data.adjustmentType === "custom" || (data.adjustmentDirection !== undefined && data.adjustmentValue !== undefined),
      { message: "adjustmentDirection and adjustmentValue are required for fixed/dynamic", path: ["adjustmentValue"] }
    )
    .refine(
      (data) => data.adjustmentType !== "custom" || data.scope === "selected",
      { message: "Custom pricing requires scope 'selected'", path: ["scope"] }
    )
    .refine(
      (data) => {
        if (data.adjustmentType !== "custom") return true;
        if (!data.customPrices || !data.productIds) return false;
        return data.productIds.every((id) => id in data.customPrices!);
      },
      { message: "Every selected product must have a customPrice entry", path: ["customPrices"] }
    ),
};

export type CreateProfileBody = z.infer<typeof createProfilePolicy.body>;

export const updateProfilePolicy = {
  params: z.object({
    id: z.uuid(),
  }),
  body: z
    .object({
      name: z.string().min(1).max(NAME_MAX_LENGTH).optional(),
      customerId: z.uuid().optional().nullable(),
      customerGroupId: z.uuid().optional().nullable(),
      adjustmentType: z.enum(["fixed", "dynamic", "custom"]).optional(),
      adjustmentDirection: z.enum(["increase", "decrease"]).optional().nullable(),
      adjustmentValue: z.number().positive().optional().nullable(),
      status: z.enum(["draft", "published"]).optional(),
      scope: z.enum(["all", "selected"]).optional(),
      productIds: z.array(z.uuid()).optional(),
      customPrices: z.record(z.uuid(), z.number().nonnegative()).optional(),
    })
    .refine(
      (data) => !(data.customerId && data.customerGroupId),
      { message: "At most one of customerId or customerGroupId can be set", path: ["customerId"] }
    )
    .refine(
      (data) => data.adjustmentType !== "custom" || data.scope !== "all",
      { message: "Custom pricing requires scope 'selected'", path: ["scope"] }
    ),
};

export type UpdateProfileBody = z.infer<typeof updateProfilePolicy.body>;

export const getProfilePolicy = {
  params: z.object({
    id: z.uuid(),
  }),
};

export const deleteProfilePolicy = {
  params: z.object({
    id: z.uuid(),
  }),
};

export const listProfilesPolicy = {
  query: z.object({
    search: z.string().optional(),
    status: z.enum(["draft", "published"]).optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(PAGINATION_MAX_LIMIT).default(10),
  }),
};

export const resolvedPricesPolicy = {
  query: z.object({
    customerId: z.uuid(),
  }),
};

export const previewPricesPolicy = {
  body: z
    .object({
      productIds: z.array(z.uuid()).optional(),
      adjustmentType: z.enum(["fixed", "dynamic", "custom"]),
      adjustmentDirection: z.enum(["increase", "decrease"]).optional(),
      adjustmentValue: z.number().positive().optional(),
      scope: z.enum(["all", "selected"]).default("selected"),
      customPrices: z.record(z.uuid(), z.number().nonnegative()).optional(),
    })
    .refine(
      (data) => data.scope === "all" || (data.productIds && data.productIds.length > 0),
      { message: "productIds must be non-empty when scope is 'selected'", path: ["productIds"] }
    )
    .refine(
      (data) => data.adjustmentType === "custom" || (data.adjustmentDirection !== undefined && data.adjustmentValue !== undefined),
      { message: "adjustmentDirection and adjustmentValue are required for fixed/dynamic", path: ["adjustmentValue"] }
    ),
};

export type PreviewPricesBody = z.infer<typeof previewPricesPolicy.body>;
