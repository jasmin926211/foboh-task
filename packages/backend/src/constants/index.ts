export const PROFILE_STATUS = { DRAFT: 'draft', PUBLISHED: 'published' } as const;
export const PROFILE_SCOPE = { ALL: 'all', SELECTED: 'selected' } as const;
export const ADJUSTMENT_TYPE = { FIXED: 'fixed', DYNAMIC: 'dynamic', CUSTOM: 'custom' } as const;
export const ADJUSTMENT_DIRECTION = { INCREASE: 'increase', DECREASE: 'decrease' } as const;
export const PAGINATION = { DEFAULT_PAGE: 1, DEFAULT_LIMIT: 10 } as const;
export const PERCENTAGE_DIVISOR = 100;
export const DEFAULT_PORT = 5000;
export const MARGIN_MULTIPLIER_BASE = 1;

// Tier system
export const TIER_LABELS: Record<number, string> = {
  1: 'Customer + Selected Products',
  2: 'Customer + All Products',
  3: 'Group + Selected Products',
  4: 'Group + All Products',
  5: 'All Customers + Selected Products',
  6: 'All Customers + All Products',
};

// Margin insight
export const MARGIN_DIVERGENCE_THRESHOLD = 10;
export const EMPTY_MARGIN_INSIGHT = {
  triggered: false,
  winningPrice: 0,
  sameTierAvgPrice: 0,
  divergencePercent: 0,
  message: null as string | null,
};

// Validation lengths
export const NAME_MAX_LENGTH = 100;
export const DESCRIPTION_MAX_LENGTH = 500;
export const PAGINATION_MAX_LIMIT = 100;
