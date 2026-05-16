export const ROUTES = {
  CUSTOMERS: '/customers',
  CUSTOMER_GROUPS: '/customer-groups',
  PRODUCTS: '/products',
  PRICING: '/pricing',
  PRICING_PROFILES: '/pricing/profiles',
  PRICING_SETUP: '/pricing/setup',
  PRICING_SETUP_EDIT: (id: string) => `/pricing/setup/${id}` as const,
  RESOLVED_PRICES: '/resolved-prices',
} as const;
